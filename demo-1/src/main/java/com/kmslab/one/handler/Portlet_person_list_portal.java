package com.kmslab.one.handler;

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

@Component("portlet_person_list_portal")
public class Portlet_person_list_portal implements ApiHandler{

	@Autowired
	@Qualifier("portaldb")
	private MongoTemplate portaldb;
	
	private static final String COLLECT_NAME = "user";
	
	@Override
	public Object handle(Map<String, Object> requestData, String userId, String depts) {
		try {			
			Query query = new Query();
			query.addCriteria(Criteria.where("ky").is(userId));			
			Document doc = portaldb.findOne(query, Document.class, COLLECT_NAME);
			
			if (doc != null) {				
				return ResInfo.success(DocumentConverter.toCleanMap(doc));
			}else {
				Query query2 = new Query();
				query2.addCriteria(Criteria.where("ky").is("default"));
				Document sdoc = portaldb.findOne(query2,  Document.class, COLLECT_NAME);
				return ResInfo.success(DocumentConverter.toCleanMap(sdoc));
			}
			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error("Error : " + e.getMessage());
		}
	}
}
