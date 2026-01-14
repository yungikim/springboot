package com.kmslab.one.webchat;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

import com.kmslab.one.SNS.common.conf;

@Component
public class MongoData {
	
	@Autowired
	@Qualifier("userdb")
	private MongoTemplate UserTemplate;
	private String usercol = "user_info";
	
	conf cf = null;
	
	public MongoData(){		
	cf = new conf();		
//	client = cf.mongoclient_set();		
	}
	
	public Document search_user_all_sso(String userid) {
		try {
			//1. $or 조건 생성 (lid == userid OR em == userid)
			Criteria criteria = new Criteria().orOperator(
					Criteria.where("lid").is(userid),
					Criteria.where("em").is(userid)
			);
			
			//2. 쿼리 객체 생성
			Query query = new Query(criteria);
			
			//3. 조회 실행 (첫 번재 결과 리턴)
			return UserTemplate.findOne(query, Document.class, usercol);
					
		}catch(Exception e) {
			e.printStackTrace();
			return null;
		}
	}
}
