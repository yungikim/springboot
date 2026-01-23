package com.kmslab.one.component;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import com.kmslab.one.util.Utils;
import com.mongodb.client.MongoCollection;

@Component
public class WriteLog {
	private final MongoTemplate log;
	public WriteLog(
			@Qualifier("log") MongoTemplate log
			) {		
		this.log = log;
	}
	
	public void write_log(Document doc){
		MongoCollection<Document> logcol = log.getCollection("log");		
		//로그 기본 정보 ==> 날짜 / 실행자 / 데이터 Key값 / 간단 정보 / 		
		try{			
			doc.remove("_id");
			doc.append("action_time", Utils.GMTDate());
			logcol.insertOne(doc);			
		}catch(Exception e){
			e.printStackTrace();
		}
	}
}
