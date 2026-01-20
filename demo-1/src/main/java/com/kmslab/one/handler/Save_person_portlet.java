package com.kmslab.one.handler;

import java.util.Map;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import com.kmslab.one.service.ApiHandler;
import com.kmslab.one.service.ResInfo;
import com.kmslab.one.util.Utils;
import com.mongodb.client.MongoCollection;

@Component("save_person_portlet")
public class Save_person_portlet implements ApiHandler{
	@Autowired
	@Qualifier("portlet")
	private MongoTemplate portlet;
	
	private final String COLLECTION_NAME = "user";
	
	@Override
	public Object handle(Map<String, Object> requestData, String userId, String depts) {
		try {
			String ky = requestData.get("ky").toString();
			
//			Query query = new Query();
//			query.addCriteria(Criteria.where("email").is(ky));
			Utils utils = new Utils();
			
			Document query = new Document("email", ky);
			
			Document doc = new Document(requestData);
			doc.put("GMT", utils.GMTDate());
			doc.put("email", userId);
			doc.put("depts",  depts);
			
			//MongoCollection 가져오기
			MongoCollection<Document> collection = portlet.getCollection(COLLECTION_NAME).withDocumentClass(Document.class);
						
			//findOneAndReplace 실행
			Document replaceDoc = collection.findOneAndReplace(query, doc);
			if (replaceDoc == null) {
				System.out.println("없어서 추가한다.");
				collection.insertOne(doc);
			}
			
			return ResInfo.success();
					
			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	
	
}
