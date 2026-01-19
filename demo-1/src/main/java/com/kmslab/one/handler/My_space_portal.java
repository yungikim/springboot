package com.kmslab.one.handler;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

import com.kmslab.one.service.ApiHandler;
import com.kmslab.one.service.MongoDataService;
import com.kmslab.one.service.ResInfo;
import com.kmslab.one.util.DocumentConverter;

@Component("my_space_portal")
public class My_space_portal implements ApiHandler{
	
	@Autowired
	@Qualifier("TODO")
	private MongoTemplate TODO;
	
	private final static String COLLECTION_NAME = "data";
	
	@Override
	public Object handle(Map<String, Object> requestData, String userId, String depts) {
		
		try {
			String email = userId;
			String type = requestData.get("type").toString();
			
			if (email == null || type == null) {
				return ResInfo.error("email and type are required");
			}
			
			Query query = new Query();
			
			if ("you".equals(type)) {
				query.addCriteria(Criteria.where("owner.ky").is(email));
			}else {
				query.addCriteria(Criteria.where("asignee.ky").is(email));
			}
			
			List<String> statusList = Arrays.asList("1", "2");
			query.addCriteria(Criteria.where("status").in(statusList));
			
			if ("you".equals(type)) {
				query.addCriteria(
						new Criteria().andOperator(
								Criteria.where("asignee.ky").exists(true),
								Criteria.where("asignee.ky").nin(null, "")
						)
				);
			}
			
			//System.out.println("query : " + query);
			//MongoDB 조회하기
			List<Document> docs = TODO.find(query, Document.class, COLLECTION_NAME);
			
			//Document를 Map으로 변환
			List<Map<String, Object>> items = DocumentConverter.toMapList(docs);
			
			return ResInfo.successList(items)
					.addMeta("totalCount", items.size())
					.addMeta("email", email)
					.addMeta("type", type);
		
			
			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error("Error : " + e.getMessage());
		}
		
	}
}
