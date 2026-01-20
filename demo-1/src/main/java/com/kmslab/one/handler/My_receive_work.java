package com.kmslab.one.handler;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;
import org.thymeleaf.util.MapUtils;

import com.kmslab.one.config.AppConfig;
import com.kmslab.one.service.ApiHandler;
import com.kmslab.one.service.ResInfo;
import com.kmslab.one.util.DocumentConverter;

@Component("my_receive_work")
public class My_receive_work implements ApiHandler{

    private final Channel_info_unread channel_info_unread;

    private final AppConfig.JwtProvider jwtProvider;
	@Autowired
	@Qualifier("TODO")
	private MongoTemplate TODO;
	
	private final String COLLECTION_NAME = "data";

    My_receive_work(AppConfig.JwtProvider jwtProvider, Channel_info_unread channel_info_unread) {
        this.jwtProvider = jwtProvider;
        this.channel_info_unread = channel_info_unread;
    }
	
	@Override
	public Object handle(Map<String, Object> requestData, String userId, String depts) {
		try {
			String ky = "";
			if (requestData.containsKey("email")) {
				ky = requestData.get("email").toString();
			}
			if (ky.equals("")) {
				ky = userId;
			}

			if (ky.isEmpty()) {
				return ResInfo.error("email or ky parameter is required");
			}
			
			//1. 담당자가 나로 지정된 업무 리스트 조회 (대기중, 진행중)
			List<Map<String, Object>> assignedList = getAssignedWorks(ky);
			System.out.println(assignedList);
			
			//2. 체크리스트의 담당자가 나로 지정된 업무 리스트 조회
			List<Map<String, Object>> checkListWorks = getCheckListWorks(ky);
			System.out.println(checkListWorks);
			
			//응답 생성
			Map<String, Object> responseData = new HashMap<>();
			responseData.put("list", assignedList);
			responseData.put("checklist", checkListWorks);
			
			return ResInfo.success(responseData).addMeta("ky", ky).addMeta("totalAssigned", assignedList.size())
					.addMeta("totalChecklist",  checkListWorks.size());
			
			
		}catch(Exception e) {
			return ResInfo.error(e.getMessage());
		}
	}
	
	/**
     * 담당자가 나로 지정된 업무 리스트 조회
     * status: 1(대기중), 2(진행중)만 조회
     */
	private List<Map<String, Object>> getAssignedWorks(String ky){
		Query query = new Query();
		query.addCriteria(Criteria.where("asignee.ky").is(ky));
		query.addCriteria(Criteria.where("status").in(Arrays.asList("1", "2")));
		
		//제외할 필드 지정
		query.fields().exclude("express");
		
		//정렬 (GMT 내림차순)
		query.with(Sort.by(Sort.Direction.DESC,"GMT"));
		
		//mongodb 조회
		List<Document> docs = TODO.find(query, Document.class, COLLECTION_NAME);
		
		//결롸 처리
		List<Map<String, Object>> result = new ArrayList<>();
		for (Document doc : docs) {
			//file, reply 카운트 계산
			List<Document> files = doc.getList("file", Document.class, new ArrayList<>());
			List<Document> replys = doc.getList("reply", Document.class, new ArrayList<>());
			
			//file_count, reply_count 추가
			doc.put("file_count", files.size());
			doc.put("reply_count", replys.size());
			
			//file, reply 필드 제거
			doc.remove("file");
			doc.remove("reply");
			
			//Document를 Map으로 변환
			result.add(DocumentConverter.toCleanMap(doc));
		}
		return result;
	}
	
	/**
     * 체크리스트의 담당자가 나로 지정된 업무 리스트 조회
     * checklist.complete가 F인 것만 조회
     */
	private List<Map<String, Object>> getCheckListWorks(String ky){
		//쿼리 생성
		Query query = new Query();
		query.addCriteria(Criteria.where("checklist.asign.ky").is(ky));
		query.addCriteria(Criteria.where("checklist.complete").is("F"));
		
		//제외할 필드
		query.fields().exclude("express");
		
		//정렬
		query.with(Sort.by(Sort.Direction.ASC, "project_name"));
		
		//MongoDB 조회
		List<Document> docs = TODO.find(query,  Document.class, COLLECTION_NAME);
		
		//결좌 처리
		List<Map<String, Object>> result = new ArrayList<>();
		for (Document doc : docs) {
			result.add(DocumentConverter.toCleanMap(doc));
		}
		
		return result;
	}
	
	
}
