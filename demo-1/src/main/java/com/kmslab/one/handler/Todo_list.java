package com.kmslab.one.handler;

import java.util.List;
import java.util.Map;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

import com.kmslab.one.service.ApiHandler;
import com.kmslab.one.service.ResInfo;
import com.kmslab.one.util.DocumentConverter;

@Component("todo_list")
public class Todo_list implements ApiHandler{

	@Autowired
	private MongoTemplate todoMain;

   	
	@Override
	public Object handle(Map<String, Object> requestData, String userId) {
		ResInfo res = new ResInfo();
		try {
			String ky = requestData.get("ky").toString();
			Query query = new Query();
			Criteria criteria = new Criteria().andOperator(
					Criteria.where("complete").is("F"),
					Criteria.where("ky").is(ky)
			);
			query.addCriteria(criteria);
			
			//System.out.println("Todo_list query : " + query);
			List<Document> docs = todoMain.find(query,  Document.class, "data");
			//Document를 Map으로 변환
			List<Map<String, Object>> items = DocumentConverter.toMapList(docs);
			
			res.successList(items);
			
		}catch(Exception e) {
			e.printStackTrace();
			res.error(e.getMessage());
		}
		
		return res;
	}
}
