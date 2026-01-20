package com.kmslab.one.handler;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

import com.kmslab.one.service.ApiHandler;
import com.kmslab.one.service.ResInfo;
import com.kmslab.one.util.DocumentConverter;

@Component("appstore_list")
public class Appstore_list implements ApiHandler{

 
	@Autowired
	@Qualifier("appstore")
	private MongoTemplate appstore;
	
	private final String COLLECTION_NAME = "app";

   	
	@Override
	public Object handle(Map<String, Object> requestData, String userId, String depts) {
		try {
			AppstoreSearchRequest request = parseRequest(requestData, userId, depts);
			if (request == null) {
				return ResInfo.error("Invalid request parameters");
			}
			
			//쿼리 생성
			Query query = buildQuery(request);
			
			//전체 카운트
			long total = appstore.count(query, Document.class, COLLECTION_NAME);
			
			//데이터 조회
			query.skip(request.start).limit(request.perpage).with(Sort.by(Sort.Direction.DESC, "sort"));
			
			List<Document> docs = appstore.find(query,  Document.class, COLLECTION_NAME);
			
			//Document를 Map으로 변환
			List<Map<String, Object>> items = DocumentConverter.toMapList(docs);
			
			//응답 생성
			Map<String, Object> responseData = new HashMap<>();
			responseData.put("response", items);
			responseData.put("total", total);
			
			return ResInfo.success(responseData).addMeta("query", request.query).addMeta("type", request.type).addMeta("isAdmin", request.isAdmin);
			
			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error("Error : " + e.getMessage());
		}
	}
	
	 /**
     * 요청 파라미터 파싱
     */
	private AppstoreSearchRequest parseRequest(Map<String, Object>requestData, String userId, String depts) {
		try {
			AppstoreSearchRequest request = new AppstoreSearchRequest();
			request.query = requestData.getOrDefault("query", "").toString();
			request.start = Integer.parseInt(requestData.get("start").toString());
			request.perpage = Integer.parseInt(requestData.get("perpage").toString());
			request.isAdmin = requestData.getOrDefault("isAdmin", "").toString();
			request.type = requestData.getOrDefault("type", "").toString();
			request.email = requestData.getOrDefault("email", userId).toString();
			request.depts = requestData.getOrDefault("depts", depts).toString();
			request.category = requestData.getOrDefault("category", "").toString();
			return request;
		}catch(Exception e) {
			System.out.println("Failed to parse request : " + e.getMessage());
			return null;
		}
	}
	
	/**
     * 메인 쿼리 생성
     */
	private Query buildQuery(AppstoreSearchRequest request) {
		List<Criteria> andCriteria = new ArrayList<>();
		
		//1. 권한 쿼리 (관리자 여부)
		if (!request.isAdmin.equals("T")) {
			Criteria permissionCriteria = buildPermissionCriteria(request);
			if (permissionCriteria != null) {
				andCriteria.add(permissionCriteria);
			}
		}
		
		//2. 검색어 쿼리
		if (!request.query.isEmpty()) {
			Criteria searchCriteria = buildSearchCriteria(request);
			if (searchCriteria != null) {
				andCriteria.add(searchCriteria);
			}
		}
		
		//3. 타밉 필터 (portlet, menu, mobile)
		if (!request.type.equals("all")) {
			Criteria typeCriteria = buildTypeCriteria(request.type);
			if (typeCriteria != null) {
				andCriteria.add(typeCriteria);
			}
		}
		
		//최종 쿼리 생성
		Query query = new Query();
		if (!andCriteria.isEmpty()) {
			query.addCriteria(new Criteria().andOperator(andCriteria.toArray(new Criteria[0])));
		}

		return query;
	}
	
	/**
     * 권한 관련 쿼리 생성 (일반 사용자용)
     */
	private Criteria buildPermissionCriteria(AppstoreSearchRequest request) {
		String email = request.email;
		String depts = request.depts;
		
		List<Criteria> orCriteria = new ArrayList<>();
		
		//readers 조건
		List<Criteria> readersAndCriteria = new ArrayList<>();
		
		if (depts != null && !depts.isEmpty()) {
			//부서 정보가 있는 경우
			List<String> readerList = new ArrayList<>();
			readerList.add(email);
			
			String[] deptArray = depts.split("\\^");
			for (String dept : deptArray) {
				if (!dept.trim().isEmpty()) {
					readerList.add(dept.trim());
				}
			}
			readersAndCriteria.add(Criteria.where("readers").in(readerList));			
		}else {
			//부서 정보가 없는 경우
			Pattern regex = Pattern.compile(email, Pattern.CASE_INSENSITIVE);
			readersAndCriteria.add(Criteria.where("readers").regex(regex));
		}
		
		//IM 사용자 체크
		if (email.toLowerCase().contains("im")) {
			readersAndCriteria.add(Criteria.where("im_disable").is("F"));
		}
		
		//readers AND 조건
		Criteria readersCriteria = new Criteria().andOperator(
				readersAndCriteria.toArray(new Criteria[0])
		);
		orCriteria.add(readersCriteria);
		
		//회사 전체 또는 개인 공개 웹
		if (depts != null && !depts.isEmpty()) {
			List<String> companyList = new ArrayList<>();
			String[] deptArray = depts.split("\\^");
			for (int i = 1; i < deptArray.length; i++) {
				companyList.add(deptArray[i].trim());
			}
			companyList.add("all");
			companyList.add(email);
			
			Criteria companyCriteria = Criteria.where("readers").in(companyList);
			orCriteria.add(companyCriteria);
		}
		
		//OR 조건으로 결함
		if (orCriteria.isEmpty()) {
			return null;
		}
		
		return new Criteria().orOperator(
				orCriteria.toArray(new Criteria[0])
		);
	}
	
	/**
     * 검색어 쿼리 생성
     */
	
	private Criteria buildSearchCriteria(AppstoreSearchRequest request) {
		String word = request.query;
		String category = request.category;
		
		Pattern regex = Pattern.compile(word, Pattern.CASE_INSENSITIVE);
		List<Criteria> orCriteria = new ArrayList<>();
		
		if (category.equals("title")) {
			//제목으로 검색 (한글, 영문)
			orCriteria.add(Criteria.where("menu_kr").regex(regex));
			orCriteria.add(Criteria.where("menu_en").regex(regex));
		}else if (category.equals("code")) {
			//코드로 검색
			orCriteria.add(Criteria.where("code").regex(regex));
		}else {
			//기본 : 제목 검색
			orCriteria.add(Criteria.where("menu_kr").regex(regex));
			orCriteria.add(Criteria.where("menu_en").regex(regex));
		}
		
		if (orCriteria.isEmpty()) {
			return null;
		}
		
		return new Criteria().orOperator(orCriteria.toArray(new Criteria[0]));
	}
	
	
	/**
     * 타입 필터 쿼리 생성
     */
	
	private Criteria buildTypeCriteria(String type) {
		switch(type) {
		case "portlet":
			return Criteria.where("disp_portlet").is("T");
		case "menu":
			return Criteria.where("disp_menu").is("T");
		case "mobile":
			return Criteria.where("disp_mobile").is("T");
		default:
			return null;
		}
	}
	
	
	 /**
     * 요청 파라미터 DTO
     */
	private static class AppstoreSearchRequest{
		String query;
		int start;
		int perpage;
		String isAdmin;
		String type;
		String email;
		String depts;
		String category;
	}
}
