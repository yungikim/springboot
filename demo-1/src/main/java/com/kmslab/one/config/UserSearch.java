package com.kmslab.one.config;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import com.kmslab.one.util.DocumentConverter;
import com.mongodb.client.MongoCollection;

@Component
public class UserSearch {
	private final MongoTemplate user;
	public UserSearch(
			@Qualifier("userdb") MongoTemplate user
			) {		
		this.user = user;
	}
	
	public Map<String, Object> search_user(String ky) {
		Map<String, Object> result = new HashMap<>();
		try {
			List<Document> orQuery = new ArrayList<>();
			Document query = new Document();
			query.append("ky", ky);
			Document query2 = new Document();
			query2.append("lid", ky);
			orQuery.add(query);
			orQuery.add(query2);
			Document xdoc = new Document();
			xdoc.append("$or", orQuery);			
			
			MongoCollection<Document> col = user.getCollection("user_info");
			Document sdoc = col.find(xdoc).first();
			if (sdoc != null) {
				result.put("userinfo", DocumentConverter.toCleanMap(sdoc));
			}
			
		}catch(Exception e) {
			e.printStackTrace();
		}		
		return result;
	}
}
