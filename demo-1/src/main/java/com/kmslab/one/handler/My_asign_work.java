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

import com.kmslab.one.service.ApiHandler;
import com.kmslab.one.service.ResInfo;
import com.kmslab.one.util.DocumentConverter;

@Component("my_asign_work")
public class My_asign_work implements ApiHandler{

    private final Channel_info_unread channel_info_unread;
	@Autowired
	@Qualifier("TODO")
	private MongoTemplate TODO;
	
	private final String COLLECTION_NAME = "data";

    My_asign_work(Channel_info_unread channel_info_unread) {
        this.channel_info_unread = channel_info_unread;
    }
	
	@Override
	public Object handle(Map<String, Object> requestData, String userId, String depts) {
		try {
			String ky = "";
			if ( requestData.containsKey("ky")) {
				ky = requestData.get("ky").toString();
			}else {
				ky = userId;
			}
			
			//1. 내가 요청한 업무 조회 (완료, 취소 제외)
			List<Map<String, Object>> myResuestList = getMyRequestWorks(ky);
			
			//2. 내가 참조로 등러가 있는 업무 조회(완료, 취소 제외)
			List<Map<String, Object>> myRefList = getMyReferencedWorks(ky);
			
			//응답 생성
			Map<String, Object> responseData = new HashMap<>();
			responseData.put("list", myResuestList);
			responseData.put("ref", myRefList);
			
			return ResInfo.success(responseData).addMeta("ky", ky).addMeta("totalRequested", myResuestList.size()).addMeta("totalReferenced", myRefList.size());
			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	/**
     * 내가 요청한 업무 조회
     * - owner.ky가 나인 업무
     * - asignee가 존재하는 업무
     * - status가 3(완료), 4(취소)가 아닌 업무
     */
	private List<Map<String, Object>> getMyRequestWorks(String ky){
		//쿼리 생성
		Query query = new Query();
		query.addCriteria(Criteria.where("owner.ky").is(ky));
		query.addCriteria(Criteria.where("status").nin(Arrays.asList("3","4")));
		query.addCriteria(Criteria.where("asignee").exists(true));
		
		//제외할 필드 지정
		query.fields().exclude("express");
		
		//정렬 (GMT 내림차순)
		query.with(Sort.by(Sort.Direction.DESC, "GMT"));
		
		//MonogoDB 조회
		List<Document> docs = TODO.find(query, Document.class, COLLECTION_NAME);
		
		//결과 처리
		List<Map<String, Object>> result = new ArrayList<>();
		for (Document doc : docs) {
			//file, reply 카운트 계산
			List<Document> files = doc.getList("file", Document.class, new ArrayList<>());
			List<Document> replys = doc.getList("reply", Document.class, new ArrayList<>());
			
			//file_count, reply_count 추가
			doc.put("file_count", files.size());
			doc.put("reply_count", replys.size());
			
			//file, reply필드 제거
			doc.remove("file");
			doc.remove("reply");
			
			//Document를 Map으로 변환
			result.add(DocumentConverter.toCleanMap(doc));
		}
		return result;
	}
	
	 /**
     * 내가 참조로 들어가 있는 업무 조회
     * - ref.ky에 내가 포함된 업무
     * - status가 3(완료), 4(취소)가 아닌 업무
     */
	private List<Map<String, Object>> getMyReferencedWorks(String ky){
		//쿼리 생성
		Query query = new Query();
		query.addCriteria(Criteria.where("ref.ky").is(ky));
		query.addCriteria(Criteria.where("status").nin(Arrays.asList("3","4")));
		
		//제외할 필드 설정
		query.fields().exclude("express");
		
		//정렬
		query.with(Sort.by(Sort.Direction.DESC, "GMT"));
		
		//mongoDB조회
		List<Document> docs = TODO.find(query, Document.class, COLLECTION_NAME);
		
		//결좌 처리
		List<Map<String, Object>> result = new ArrayList<>();
		for(Document doc : docs) {
			//file, reply카운트 계산
			List<Document> files = doc.getList("file", Document.class, new ArrayList<>());
			List<Document> replys = doc.getList("reply", Document.class, new ArrayList<>());
			
			//file_count, reply_count 추가
			doc.put("file_count", files.size());
			doc.put("reply_count", replys.size());
			
			//file, reply 필드 제거
			doc.remove("file");
			doc.remove("reply");
			
			//Document를 Map으로 전환
			result.add(DocumentConverter.toCleanMap(doc));
		}
		return result;
	}
}
