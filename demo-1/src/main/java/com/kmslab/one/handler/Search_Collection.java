package com.kmslab.one.handler;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

import com.kmslab.one.service.ApiHandler;
import com.kmslab.one.service.ResInfo;
import com.kmslab.one.util.DocumentConverter;

@Component("search_collection")
public class Search_Collection implements ApiHandler{
	
	@Autowired
	@Qualifier("collection")
	private MongoTemplate collection;
	
	private static final String COLLECTION_NAME = "data"; 
	
	@Override
	public Object handle(Map<String, Object> requestData, String userId, String depts) {
		try {
			requestData.put("email", userId);
			CollectionSearchRequest request = parseRequest(requestData);
			if (request == null) {
				return ResInfo.error("Invalid request parameters");
			}
			
			//부서 리스트 생성
			List<String> deptList = buildDeptList(request.email, request.depts);
			
			//쿼리 빌드
			QuerySet querySet = buildQuerySet(request,  deptList);
			
			//카운트 계산
			CountResult counts = calculateCounts(querySet);
			
			//최종 쿼리 선택 및 실행
			Query finalQuery = selectFinalQuery(request,  querySet);
			List<Document> docs = executeFinalQuery(request, finalQuery, querySet.tempQuery);
			
			//Document를 Map으로 변환
			List<Map<String, Object>> items = DocumentConverter.toMapList(docs);
			
			//응답 생성
			Map<String, Object> responseData = new HashMap<>();
			responseData.put("data", items);
			responseData.put("total", counts.total);
			responseData.put("t1", counts.list1);
			responseData.put("t2", counts.list2);
			responseData.put("t3", counts.list3);
			responseData.put("t4", counts.list4);
			
			return ResInfo.success(responseData)
					.addMeta("opt", request.opt).addMeta("type", request.type);
			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error("Error: " + e.getMessage());
		}
	}
	
	
	/**
	* 요청 파라미터 파싱
	**/
	private CollectionSearchRequest parseRequest(Map<String, Object> requestData) {
		try {
			CollectionSearchRequest request = new CollectionSearchRequest();
			request.email = requestData.get("email").toString();
			request.start = Integer.parseInt(requestData.get("start").toString());
			request.perpage = Integer.parseInt(requestData.get("perpage").toString());
			request.type = requestData.get("type").toString();
			request.opt = requestData.get("opt").toString();
			request.day = requestData.get("day").toString();
			request.dcode = requestData.get("dcode").toString();
			request.depts = requestData.containsKey("depts") ? requestData.get("depts").toString() : "";
			return request;
		}catch(Exception e) {
			e.printStackTrace();
			return null;
		}
	}
	
	/**
     * 부서 리스트 생성
   */
	private List<String> buildDeptList(String email, String depts){
		List<String> deptList = new ArrayList<>();
		deptList.add(email);
		
		if (depts != null && !depts.isEmpty()) {
			String[] deptArray = depts.split("-spl-");
			if (deptArray.length > 0) {
				String myDept = deptArray[deptArray.length -1];
				deptList.add(myDept);
			}
		}
		return deptList;
	}
	
	/**
	* 모든 쿼리 세트 빌드
	**/
	private QuerySet buildQuerySet(CollectionSearchRequest request, List<String> deptList) {
		QuerySet querySet = new QuerySet();
		
		//기본 쿼리(readers)
		Query baseQuery = new Query();
		baseQuery.addCriteria(Criteria.where("readers").in(deptList));
		baseQuery.addCriteria(Criteria.where("temp").is("F"));
		
		//1. 보낸 취합 쿼리 (내가 Qwner)
		querySet.sentQuery = Query.of(baseQuery);
		querySet.sentQuery.addCriteria(Criteria.where("owner.ky").is(request.email));
		
		//2. 받은 취합 쿼리 (내가 submitter)
		querySet.receivedQuery = Query.of(baseQuery);
		querySet.receivedQuery.addCriteria(Criteria.where("submitter.ky").in(deptList));
		
		//3. 참조 취합 조건 (내가 referer)
		querySet.referenceQuery = Query.of(baseQuery);
		querySet.referenceQuery.addCriteria(Criteria.where("referrer.ky").is(request.email));
		
		//4. 전체 쿼리
		querySet.totalQuery = Query.of(baseQuery);
		
		//5. 임시저장 쿼리
		querySet.tempQuery = new Query();
		querySet.tempQuery.addCriteria(Criteria.where("temp").is("T"));
		querySet.tempQuery.addCriteria(Criteria.where("owner.ky").is(request.email));
		
		return querySet;
	}
	
	/**
	* 카운트 계산
	**/
	private CountResult calculateCounts(QuerySet querySet) {
		CountResult counts = new CountResult();
		
		counts.list1 = collection.count(querySet.sentQuery, COLLECTION_NAME);
		counts.list2 = collection.count(querySet.receivedQuery, COLLECTION_NAME);
		counts.list3 = collection.count(querySet.referenceQuery, COLLECTION_NAME);
		counts.list4 = collection.count(querySet.tempQuery, COLLECTION_NAME);
		counts.total = collection.count(querySet.totalQuery, COLLECTION_NAME);
		
		return counts;
	}
	
	/**
	* opt에 따라 추가 조건 적용
	**/
	private Query applyCodition(Query query, String opt, String day, String email, String dcode) {
		Query newQuery = Query.of(query);
		
		switch(opt) {
		case "2": //취합중
			newQuery.addCriteria(Criteria.where("end_date").gte(day));
			break;
		case "3": //취합마감
			newQuery.addCriteria(Criteria.where("end_date").lte(day));
			break;
		case "4": //제출전
			List<String> notSubmitted = Arrays.asList(email, dcode);
			newQuery.addCriteria(Criteria.where("res_members").ne(notSubmitted));
			break;
		case "5": 	//제출마감
			List<String> submitted = Arrays.asList(email, dcode);
			newQuery.addCriteria(Criteria.where("res_members").in(submitted));
			break;
		case "1": //전체
		default:
			//추가 조건 없음
			break;
		}
		return newQuery;
	}
	
	/**
	* type과 opt에 따라 최종 쿼리 선택
	**/
	private Query selectFinalQuery(CollectionSearchRequest request, QuerySet querySet) {
		Query selectedQuery;
		
		//type에 따라 기본 쿼리 선택
		switch (request.type) {
		case "2":	//받은 취합
			selectedQuery = querySet.receivedQuery;
			break;
		case "3": 	//보낸 취합
			selectedQuery = querySet.sentQuery;
			break;
		case "4": 	//참조
			selectedQuery = querySet.referenceQuery;
			break;
		case "5":  	//임시저장
			selectedQuery = querySet.tempQuery;
			break;
		default:
			selectedQuery = querySet.totalQuery;
			break;
		}
		
		//opt 조건 적용
		return applyCodition(selectedQuery, request.opt, request.day, request.email, request.dcode);
	}
	
	/**
	* 최종 쿼리 실행
	**/
	private List<Document> executeFinalQuery(CollectionSearchRequest request, Query query, Query tempQuery){
		//type이 임시저장(3) 인 경우
		if ("5".equals(request.opt)) {
			return collection.find(tempQuery, Document.class, COLLECTION_NAME)
					.stream()
					.skip(request.start)
					.limit(request.perpage)
					.toList();
		}
		
		//일반 쿼리 실행
		query.skip(request.start);
		query.limit(request.perpage);
		query.with(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "GMT"));
		
		return collection.find(query,  Document.class, COLLECTION_NAME);
	}
	

	/**
	* 요청 파라미터 DTO
	**/
	private static class CollectionSearchRequest{
		String email;
		int start;
		int perpage;
		String type;
		String opt;
		String day;
		String dcode;
		String depts;
	}

	/**
	* 쿼리 세트
	**/
	private static class QuerySet{
		Query sentQuery;	//보낸 취합
		Query receivedQuery;	//받은 취합
		Query referenceQuery;	//참조
		Query totalQuery;		//전체
		Query tempQuery;		//임시저장
	}

	/**
	* 카운트 결과
	**/
	private static class CountResult{
		long list1;	//보낸 취합
		long list2; //받은 취합
		long list3;	//참조
		long list4;	//임시저장
		long total; //전체
	}
}


