package com.kmslab.one.service.channel;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import com.google.gson.JsonObject;
import com.kmslab.one.service.ResInfo;
import com.kmslab.one.util.DocumentConverter;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Projections;
import com.mongodb.client.model.Sorts;

@Service
public class TodoService {
	private final MongoTemplate todo;
	private final MongoTemplate todo_folder;
	private final MongoTemplate todoMain;
	public TodoService(
			@Qualifier("TODO") MongoTemplate todo,
			@Qualifier("TODO_Folder") MongoTemplate todo_folder,
			@Qualifier("todoMain") MongoTemplate todoMain
			) {		
		this.todo = todo;
		this.todo_folder = todo_folder;
		this.todoMain = todoMain;
	}
	
	public Object my_asign_work(Map<String, Object> requestData) {
		try {
			
			MongoCollection<Document> col = todo.getCollection("data");
			

			String ky = requestData.get("email").toString();
			if (requestData.containsKey("ky")) {
				ky = requestData.get("ky").toString();
			}
			
//			JsonArray r1 = new JsonArray();			
//			JsonArray r2 = new JsonArray();
			
			List<Map<String, Object>> r1 = new ArrayList<>();
			List<Map<String, Object>> r2 = new ArrayList<>();
			
			List<String> removeItem = new ArrayList<>();
			removeItem.add("express");
		
			//내가 요청한 업무
			Document query = new Document();
		//	query.put("asignee.ky", ky);
			query.put("owner.ky", ky);
			query.put("status", new Document("$nin", Arrays.asList("3","4")));
			query.put("asignee", new Document("$exists", true));
			FindIterable<Document> docs = col.find(query).projection(Projections.exclude(removeItem)).sort(Sorts.descending("GMT"));
			for (Document doc : docs) {
				List<Document> files = doc.getList("file", Document.class);
				List<Document> replys = doc.getList("reply", Document.class);
				doc.put("file_count", files.size());
				doc.put("reply_count", replys.size());
				doc.remove("file");
				doc.remove("reply");
//				r1.add(DocumnetConvertJsonObject(doc));
				r1.add(DocumentConverter.toCleanMap(doc));
			}	
			
			//내가 참조로 들어가 있는 업무
			Document query2 = new Document();
			query2.put("ref.ky", ky);
			query2.put("status", new Document("$nin", Arrays.asList("3","4")));
			FindIterable<Document> docs2 = col.find(query2).projection(Projections.exclude(removeItem)).sort(Sorts.descending("GMT"));
			for (Document doc : docs2) {
				List<Document> files = doc.getList("file", Document.class);
				List<Document> replys = doc.getList("reply", Document.class);
				doc.put("file_count", files.size());
				doc.put("reply_count", replys.size());
				doc.remove("file");
				doc.remove("reply");
//				r2.add(DocumnetConvertJsonObject(doc));
				r2.add(DocumentConverter.toCleanMap(doc));
			}
			
			Map<String, Object> item = new HashMap<>();
			item.put("list", r1);
			item.put("ref", r2);
			
			return ResInfo.success(item);

			
//			JsonObject pp = new JsonObject();
//			pp.add("list", r1);
//			pp.add("ref", r2);
//			res.setRes(pp);
//			res.setResult("OK");
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	public Object my_receive_work(Map<String, Object> requestData) {
		try {

			MongoCollection<Document> col = todo.getCollection("data");

			String ky = requestData.get("email").toString();
			if (requestData.containsKey("ky")) {
				ky = requestData.get("ky").toString();
			}

			List<Map<String, Object>> r1 = new ArrayList<>();
			List<Map<String, Object>> r2 = new ArrayList<>();
			
			List<String> removeItem = new ArrayList<>();
			removeItem.add("express");
			
			//담당자가 나로 지정된 업무 리스트 / 대기중, 진행중인 문서만 
			List<String> im = new ArrayList<>();
			im.add("1");
			im.add("2");
		//	im.add("3");
			Document query = new Document();
			query.put("asignee.ky", ky);
			query.put("status", new Document("$in", im));
			FindIterable<Document> docs = col.find(query).projection(Projections.exclude(removeItem)).sort(Sorts.descending("GMT"));
			for (Document doc : docs) {
				List<Document> files = doc.getList("file", Document.class);
				List<Document> replys = doc.getList("reply", Document.class);
				doc.put("file_count", files.size());
				doc.put("reply_count", replys.size());
				doc.remove("file");
				doc.remove("reply");
			//	r1.add(DocumnetConvertJsonObject(doc));
				r1.add(DocumentConverter.toCleanMap(doc));
			}
			
			//체크리스트의 담당자가 나로 지정된 업무 리스트
			Document query2 = new Document();
			query2.put("checklist.asign.ky", ky);
			query2.put("checklist.complete", "F");
	
			FindIterable<Document> docs2 = col.find(query2).projection(Projections.exclude(removeItem)).sort(Sorts.ascending("project_name"));
			List<Document> docList = new ArrayList<>();
			docs.into(docList);
//			for (Document doc : docs2) {
//				r2.add(DocumnetConvertJsonObject(doc));
//				
//			}			
			
			Map<String, Object> item = new HashMap<>();
			item.put("list", r1);
			item.put("checklist", docList);
			return ResInfo.success(item);
			
//			JsonObject pp = new JsonObject();
//			pp.add("list", r1);
//			pp.add("checklist", r2);
//			res.setRes(pp);
//			res.setResult("OK");
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	

	public Object my_space_portal(Map<String, Object> requestData) {
		try {
			MongoCollection<Document> col = todo.getCollection("data");			
			String ky = requestData.get("email").toString();
			String ty = requestData.get("type").toString();			
			Document query = new Document();
			if (ty.equals("you")) {
				query.put("owner.ky", ky);
			}else {
				query.put("asignee.ky", ky);
			}			
			List<String> status = new ArrayList<>();
			status.add("1");
			status.add("2");			
			Document qq = new Document();
			qq.put("status", new Document("$in", status));			
			List<Document> andQuery = new ArrayList<Document>();
			andQuery.add(query);
			andQuery.add(qq);			
			if (ty.equals("you")) {
				Document filter = new Document();
				filter = new Document("$and", Arrays.asList(
							new Document("asignee.ky", new Document("$exists", true)),
							new Document("asignee.ky", new Document("$nin", Arrays.asList(null, "")))
						));
				andQuery.add(filter);
			}			
			Document andQ = new Document();
			andQ.put("$and", andQuery);			
			FindIterable<Document> docs = col.find(andQ);
			List<Document> rrs = new ArrayList<>();
			docs.into(rrs);
			Map<String, Object> item = new HashMap<>();
			item.put("data", rrs);
			return ResInfo.success(item);		
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	public Object search_item_todo(Map<String, Object> requestData) {
		try {
			MongoCollection<Document> col = todo.getCollection("data");
			MongoCollection<Document> col2 = todo_folder.getCollection("folder");
			
			String key = requestData.get("key").toString();
		//	String email = jj.get("email").getAsString();
			
			Document query = new Document();
			query.put("_id", new ObjectId(key));
			
			List<String> arx = new ArrayList<>();
			arx.add("file.content");
			arx.add("file.meta");
			
			Document sdoc = col.find(query).projection(Projections.exclude(arx)).first();
			
			if (sdoc != null) {
				Map<String, Object> jx = DocumentConverter.toCleanMap(sdoc);
				
				//myspace에서 할일을 바로 클릭할때 프로젝트 owner가 있어야 권한 체크를 할 수 있어 별도로 추가한다.
				Document qx = new Document();
				qx.put("_id", new ObjectId(sdoc.get("project_code").toString()));
				Document sp = col2.find(qx).first();
				if (sp != null) {
					jx.put("project_info", DocumentConverter.toCleanMap(sp));
				}				
				return ResInfo.success(jx);
			}else {
				System.out.println("문서가 존재 하지 않습니다.");
				return ResInfo.error("문서가 존재 하지 않습니다.");
			}
			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	public Object todo_list(Map<String, Object> requestData) {
		try {
			MongoCollection<Document> col = todoMain.getCollection("data");
			
			Document query = new Document();
			query.append("complete", "F");
			query.append("ky", requestData.get("ky").toString());

			FindIterable<Document> docs = col.find(query).sort(new Document("GMT", -1));
			List<Document> ar = new ArrayList<>();
			docs.into(ar);
			Map<String, Object> item = new HashMap<>();
			item.put("response", ar);
			return ResInfo.success(item);
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
}
