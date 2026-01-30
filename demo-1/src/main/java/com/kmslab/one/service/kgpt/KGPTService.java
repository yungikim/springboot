package com.kmslab.one.service.kgpt;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import com.google.gson.JsonObject;
import com.kmslab.one.service.ResInfo;
import com.kmslab.one.util.DocumentConverter;
import com.kmslab.one.util.Utils;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Projections;
import com.mongodb.client.result.DeleteResult;
import com.mongodb.client.result.UpdateResult;

@Service
public class KGPTService {
	private final MongoTemplate gpt;
	private final MongoTemplate gpt_log;
	private final MongoTemplate ai_notebook;

	public KGPTService(
			@Qualifier("GPT") MongoTemplate gpt,
			@Qualifier("GPT_LOG") MongoTemplate gpt_log,
			@Qualifier("AI_Notebook") MongoTemplate ai_notebook
			) {		
		this.gpt = gpt;
		this.gpt_log = gpt_log;
		this.ai_notebook = ai_notebook;
	}
	
	public Object ai_list_template(Map<String, Object> responseData){
		try {
			MongoCollection<Document> col = gpt.getCollection("menu");
			String email = responseData.get("email").toString();
			String depts = responseData.get("depts").toString();
			String category = responseData.get("category").toString();
			
			Document query = new Document();
			List<String> readers = new ArrayList<String>();
			readers.add("all");
			readers.add(email);
			String[] ds = depts.split("\\^");
			for (int i = 0 ; i < ds.length; i++) {
				readers.add(ds[i]);
			}
			query.put("readers", new Document("$in", readers));
			if (category.equals("pc")) {
				query.put("disp_pc", "T");
			}else {
				query.put("disp_mobile", "T");
			}
			FindIterable<Document> docs = col.find(query).sort(new Document("menu", 1));
			List<Document> docList = new ArrayList<>();
			docs.into(docList);
			Map<String, Object> item = new HashMap<>();
			item.put("data", docList);
			
			return ResInfo.success(item);

		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	public Object ai_list_person_request(Map<String, Object> requestData) {
		String ky = requestData.get("email").toString();
		try {
			MongoCollection<Document> col = gpt.getCollection("data");

			String count = requestData.get("count").toString();

			Document query2 = new Document();
			query2.put("ky", ky);
			query2.put("type", "");
			query2.put("project_code", new Document("$exists", false));
			FindIterable<Document> docs2 = col.find(query2).limit(Integer.parseInt(count)).sort(new Document("GMT", -1));
			List<Map<String, Object>> docList = new ArrayList<>();			
			for (Document sdoc2 : docs2) {
				String mx = sdoc2.getString("msg").toString();
				sdoc2.remove("msg");
				sdoc2.remove("dismsg");
				if (sdoc2.containsKey("dismsg")) {
					sdoc2.append("msg", sdoc2.get("dismsg").toString());
				}else {
					sdoc2.append("msg", mx.length() > 40 ? mx.substring(0, 40) : mx);
				}				
				docList.add(DocumentConverter.toCleanMap(sdoc2));
			}			
			long totalcount = col.countDocuments(query2);			
			Map<String, Object> item = new HashMap<>();
			item.put("data2", docList);
			item.put("totalcount", totalcount);
			return ResInfo.success(item);			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	public Object room_history(Map<String, Object> requestData) {
		try {
			MongoCollection<Document> col = gpt_log.getCollection("data");
			
			String key = requestData.get("roomkey").toString();
			if (!key.equals("")) {
				Document query = new Document();
				query.put("roomkey", key);					
				Document doc = col.find(query).first();				
				if (doc != null) {
					return ResInfo.success(DocumentConverter.toCleanMap(doc));
				}		
			}
			return ResInfo.error("ERROR");
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	public Object gpt_over_list(Map<String, Object> requestData) {
		String ky = requestData.get("email").toString();
		try {
			MongoCollection<Document> col = gpt.getCollection("data");		
			
			//req list query
			List<Document> andquery = new ArrayList<>();
			Document query2 = new Document();
			query2.put("ky", ky);
			query2.put("type", "");
			query2.put("project_code", new Document("$exists", false));
			
			andquery.add(query2);			
			String search_query = requestData.get("query").toString();
			
			if (!search_query.equals("")) {
				//검색을 진행한다.	
				Document query = new Document();
				Pattern regex = Pattern.compile(search_query,Pattern.CASE_INSENSITIVE);			
				query.put("msg", regex);
				andquery.add(query);
			}
			
			Document qq = new Document();
			qq.append("$and", andquery);
			
			FindIterable<Document> docs2 = null;
			if (!search_query.equals("")) {
				//검색일 경우
				docs2 = col.find(qq).sort(new Document("GMT", -1));
			}else {
				int count = Integer.parseInt(requestData.get("count").toString());
				docs2 = col.find(qq).skip(count).limit(100).sort(new Document("GMT", -1));
			}
	
			List<Document> doclist = new ArrayList<>();
			docs2.into(doclist);
			
			Map<String, Object> item = new HashMap<>();
			item.put("data", doclist);
			
			return ResInfo.success(item);
			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error("ERROR");
		}
	}
	
	public Object ai_notebook_list(Map<String, Object> requestData) {
		String ky = requestData.get("email").toString();
		try {

			MongoCollection<Document> col = ai_notebook.getCollection("notebook");
			MongoCollection<Document> col2 = ai_notebook.getCollection("note");
			
			Document query = new Document();
			query.put("ky", ky);
			
			
			String qq = requestData.get("query").toString();
			String start = requestData.get("start").toString();
			String perpage = requestData.get("perpage").toString();
			String sort = requestData.get("sort").toString();
			
			if (!qq.equals("")) {
				List<Document> orquery = new ArrayList<>();
				Pattern regex = Pattern.compile(qq,Pattern.CASE_INSENSITIVE);					
				Document xquery = new Document();
				xquery.put("notebook_name", regex);
				Document yquery = new Document();
				yquery.put("notebook_desc", regex);				
				orquery.add(xquery);
				orquery.add(yquery);				
				Document tt = new Document();
				query.put("$or", orquery);				
			}
						
			Document sort_option = new Document();
			if (sort.equals("1")) {
				//날짜별 소트
				sort_option.append("GMT", -1);
			}else {
				//제목별 소트
				sort_option.append("notebook_name", -1);
			}		
			
			List<String> arx = new ArrayList<>();
			arx.add("content");
			arx.add("recoding");			
			FindIterable<Document> docs = col.find(query).projection(Projections.exclude(arx)).limit(Integer.valueOf(perpage)).skip(Integer.valueOf(start)).sort(sort_option);
			List<Document> doclist = new ArrayList<>();
			for (Document doc : docs) {
				String id = doc.get("_id").toString();
				doc.append("_id", id);
				doclist.add(doc);
			}	
			Map<String, Object> item = new HashMap<>();
			item.put("data", doclist);			
			//공유된 노트의 건수를 계산해서 같이 내려준다.
			Document qp = new Document();
			qp.put("notebook_code", ky + "_share");
			long ncount = col2.countDocuments(qp);			
			item.put("share", ncount);			
			return ResInfo.success(item);

		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	public Object ai_note_list(Map<String, Object> requestData) {
		String code = requestData.get("notebook_code").toString();
		try {
			MongoCollection<Document> col = ai_notebook.getCollection("note");
			MongoCollection<Document> col2 = ai_notebook.getCollection("notebook");
			
			Document query = new Document();
			query.put("notebook_code", code);
			String sort = "1";
			
			Document sort_option = new Document();
			if (sort.equals("1")) {
				//날짜별 소트
				sort_option.append("GMT", -1);
			}else {
				//제목별 소트
				sort_option.append("notebook_name", -1);
			}			
			List<String> arx = new ArrayList<>();
			arx.add("content");
			arx.add("recoding");			
//			System.out.println("query : " + query);
			FindIterable<Document> docs = col.find(query).sort(sort_option);
			List<Map<String, Object>> items = new ArrayList<>();
			for (Document sdoc : docs) {
				String content = sdoc.getString("content");
				if (content.length() > 150) {
					sdoc.append("express", sdoc.get("content").toString().substring(0, 150));
				}else {
					sdoc.append("express", sdoc.get("content").toString());
				}				
				sdoc.remove("content");
				items.add(DocumentConverter.toCleanMap(sdoc));
			}
			Map<String, Object> item = new HashMap<>();
			item.put("data", items);
				
			//첨부된 파일의 정보를 내려준다.
			Document qq = new Document();
			if (code.contains("_share")) {
				//본인의 공유노트북에 공유된 노트의 건수를 내려준다.
//				qq.put("notebook_code", code);
//				long ncount = col.countDocuments(qq);
//				rx.addProperty("share", ncount);

			}else {
				qq.put("_id", new ObjectId(code));
				Document sdoc = col2.find(qq).first();
				Map<String, Object> ix = new HashMap<>();
				if (sdoc != null) {				
					sdoc.remove("_id");
					sdoc.remove("ky");
					sdoc.remove("notebook_desc");
					sdoc.remove("notebook_name");
					sdoc.remove("notebook_prompt");
					sdoc.remove("source_count");
					List<Document> data = (List<Document>) sdoc.get("data");

					ix.put("file_info", DocumentConverter.toCleanMap(sdoc));
				}
				item.put("file", ix);
			}
			return ResInfo.success(item);
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}	
	}
	
	public Object ai_notebook_info(Map<String, Object> requestData) {
		try {
			MongoCollection<Document> col = ai_notebook.getCollection("notebook");
			
			String id = requestData.get("id").toString();
			Document query = new Document();
			query.put("_id", new ObjectId(id));			
			Document doc = col.find(query).first();			
			Map<String, Object> item = new HashMap<>();
			item.put("info", DocumentConverter.toCleanMap(doc));
			return ResInfo.success(item);
			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error("ERROR");
		}
	}
	
	public Object ai_notebook_title_update(Map<String, Object> requestData) {
		try {
			MongoCollection<Document> col = ai_notebook.getCollection("notebook");
			
			String notebook_name = requestData.get("notebook_name").toString();
			String id = requestData.get("id").toString();			
			Document query = new Document();
			query.put("_id", new ObjectId(id));			
			Document doc = new Document();
			doc.append("notebook_name", notebook_name);			
			Document se = new Document();
			se.append("$set", doc);			
			col.updateOne(query, se);
			return ResInfo.success();
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error("ERROR");
		}
	}
	
	public Object ai_list_mydata(Map<String, Object> requestData) {
		String ky = requestData.get("email").toString();
		try {
			MongoCollection<Document> col = gpt.getCollection("folder_person");
			MongoCollection<Document> col2 = gpt.getCollection("admin_person");
			
			Document query = new Document();
			query.put("ky", ky);
			
			Document query2 = new Document();	
			List<String> readers = new ArrayList<String>();
			readers.add(ky);
			query2.put("readers", new Document("$in", readers));		
			
			
			FindIterable<Document> docs = col.find(query).sort(new Document("folder_code",1));
			List<Document> js = new ArrayList<>();
			docs.into(js);	
			
			FindIterable<Document> docs2 = col2.find(query2).sort(new Document("folder_name",1));
			List<Map<String, Object>> js2 = new ArrayList<>();
			
			for (Document sdoc2 : docs2) {
				sdoc2.remove("content");
				js2.add(DocumentConverter.toCleanMap(sdoc2));
			}		
			
			Map<String, Object> item = new HashMap<>();
			item.put("data", js);
			item.put("data2", js2);
			return ResInfo.success(item);
			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error("ERROR");
		}
	}
	
	public Object ai_brief_data(Map<String, Object> requestData) {
		try {
			MongoCollection<Document> col = gpt.getCollection("brief");
			
			Document query = new Document();
			query.put("email", requestData.get("email").toString());
			
			Document sdoc = col.find(query).first();
			
			Map<String, Object> rx = new HashMap<>();
			if (sdoc != null) {
				rx.put("data", DocumentConverter.toCleanMap(sdoc));				
			}
			return ResInfo.success(rx);			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error("ERROR");
		}
	}
	
	public Object ai_brief_save(Map<String, Object> requestData) {
		try {
			MongoCollection<Document> col = gpt.getCollection("brief");			
			
			Document query = new Document();
			query.put("email", requestData.get("email").toString());
			col.deleteOne(query);			

			String[] ll = requestData.get("data").toString().split("-=spl=-");
			
			if (!requestData.get("data").toString().equals("")) {
				Document doc = new Document(requestData);
				col.insertOne(doc);
			}			
			
			return ResInfo.success();
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error("ERROR");
		}
	}
	
	public Object change_person_ai_request(Map<String, Object> requestData) {
		try {
			MongoCollection<Document> col = gpt.getCollection("data");			
			String opt = requestData.get("opt").toString();
			String id = requestData.get("id").toString();
			String roomkey = requestData.get("roomkey").toString();
			
			Document query = new Document();
			query.append("_id",  new ObjectId(id));
			
			Document data = new Document();
			Document se = new Document();
			if (opt.equals("delete")) {
				DeleteResult dd = col.deleteOne(query);
				if (!roomkey.equals("")) {
					GPT_LOG_Delete(roomkey);
				}			
			}else if (opt.equals("move_req")) {
				data.append("type", "");
				data.append("GMT", Utils.GMTDate2());
				se.append("$set", data);
				UpdateResult rr =  col.updateOne(query, se);
			}else if (opt.equals("move_fix")) {
				data.append("type", "fix");
				data.append("GMT", Utils.GMTDate2());
				se.append("$set", data);
				col.updateOne(query, se);
			}			
			return ResInfo.success();
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	private void GPT_LOG_Delete(String roomkey) {
		try {
			MongoCollection<Document> col = gpt_log.getCollection("data");			
			col.deleteOne(new Document("roomkey", roomkey));			
		}catch(Exception e) {
			e.printStackTrace();
		}
	}
}
