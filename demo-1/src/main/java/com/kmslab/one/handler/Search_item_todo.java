package com.kmslab.one.handler;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import com.google.gson.JsonObject;
import com.kmslab.one.service.ApiHandler;
import com.kmslab.one.service.ResInfo;
import com.kmslab.one.util.DocumentConverter;
import com.kmslab.one.util.Utils;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Projections;

@Component("search_item_todo")
public class Search_item_todo implements ApiHandler{
	@Autowired
	@Qualifier("TODO_Folder")
	private MongoTemplate TODO_Folder;
	
	@Autowired
	@Qualifier("TODO")
	private MongoTemplate TODO;
	
	private final String COLLECTION_TODO_Folder = "folder";
	private final String COLLECTION_TODO = "data";
	
	@Override
	public Object handle(Map<String, Object> requestData, String userId, String depts) {
		try {
			MongoCollection<Document> col = TODO.getCollection(COLLECTION_TODO);
			MongoCollection<Document> col2 = TODO_Folder.getCollection(COLLECTION_TODO_Folder);
			
			String key = requestData.get("key").toString();
			System.out.println("key : " + key);
				
			Document query = new Document();
			query.put("_id", new ObjectId(key));		
			
			List<String> arx = new ArrayList<>();
			arx.add("file.content");
			arx.add("file.meta");
			
			System.out.println("3333333333333333");
			
			Document sdoc = col.find(query).projection(Projections.exclude(arx)).first();
			
			System.out.println("44444444444444");
			
			if (sdoc != null) {
				System.out.println("555555555555555");
				JsonObject jx = new JsonObject();
				jx = Utils.DocumnetConvertJsonObject(sdoc);
				
				//myspace에서 할일을 바로 클릭할때 프로젝트 owner가 있어야 권한 체크를 할 수 있어 별도로 추가한다.
				Document qx = new Document();
				qx.put("_id", new ObjectId(sdoc.get("project_code").toString()));
				Document sp = col2.find(qx).first();
				if (sp != null) {
					jx.add("project_info", Utils.DocumnetConvertJsonObject(sp));
				}
				
				System.out.println("22222222222222222222222");
				
				return ResInfo.success(DocumentConverter.jsonObjectToMap(jx));

			}else {
				System.out.println("문서가 존재 하지 않습니다.");
				return ResInfo.error("don't exist document");
			}
			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
}
