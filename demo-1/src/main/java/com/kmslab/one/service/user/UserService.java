package com.kmslab.one.service.user;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import com.kmslab.one.service.ResInfo;
import com.kmslab.one.util.DocumentConverter;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Sorts;

@Service
public class UserService {
	private final MongoTemplate user;

	public UserService(
			@Qualifier("userdb") MongoTemplate user
			) {		
		this.user = user;

	}
	
	//public JsonArray search_user_new(String name, String companycode){
	public Object search_user_multi(String name, String companycode) {
		List<List<Map<String, Object>>> rex = new ArrayList<>();
		try{
			MongoCollection<Document> col = user.getCollection("user_info");
			
			
			String[] users = name.split(",");			
			for (int i = 0 ; i < users.length; i++) {
			//	JsonArray ar = new JsonArray();
				List<Map<String, Object>> ar = new ArrayList<>();
				
				List<Document> userquery = new ArrayList<Document>();
				Pattern regex = Pattern.compile(users[i].trim(), Pattern.CASE_INSENSITIVE);
				
				Document query = new Document();							
				query.put("nm", regex);
				
				Document query2 = new Document();							
				query2.put("ky", regex);
				
				Document query3 = new Document();							
				query3.put("em", regex);
				
				userquery.add(query);
				userquery.add(query2);
				userquery.add(query3);
				
				Document se = new Document();
				se.put("$or", userquery);
				
				
				if (!companycode.equals("")){
					query.put("cpc", companycode);
				}
							
				FindIterable<Document> list = col.find(se).sort(Sorts.ascending("nm"));

				for (Document doc : list){
					doc.remove("search");
					doc.remove("adc");
					doc.remove("adn");
					doc.remove("adne");
					doc.remove("op2_new");
					doc.remove("scd");
					doc.remove("udt");
					doc.remove("mop_new");
					//ar.add(DocumnetConvertJsonObject(doc));
					ar.add(DocumentConverter.toCleanMap(doc));
				}				
				rex.add(ar);
				
			}
		}catch(Exception e){
			e.printStackTrace();
		}finally{
			//cf.close_connect(client);
		}
		return ResInfo.success(rex);
	}
	
	public Object search_company(Map<String, Object> resquestData) {
		List<Map<String, Object>> rex = new ArrayList<>();
		try{

			MongoCollection<Document> col = user.getCollection("company_info");
							
			FindIterable<Document> list = col.find().sort(Sorts.ascending("sort"));

			for (Document doc : list){
				Map<String, Object> jp = new HashMap<>();
				jp.put("cp", doc.get("cp").toString());
				jp.put("cpc", doc.get("cpc").toString());
				jp.put("ecp", doc.get("ecp").toString());
				rex.add(jp);
			}				
			
					
		}catch(Exception e){
			e.printStackTrace();
		}finally{
			//cf.close_connect(client);
		}
		return ResInfo.success(rex);
	}
	
	public Object search_dept_to_sub(Map<String, Object> requestData) {
		//JsonArray rex = new JsonArray();
		List<Map<String, Object>> rex = new ArrayList<>();
		try{
			String deptcode = requestData.get("deptcode").toString();
			MongoCollection<Document> col = user.getCollection("post_info");	
			Document query = new Document();
			query.put("pdpc", deptcode);
			FindIterable<Document> list = col.find(query).sort(Sorts.ascending("sort"));
			for (Document doc : list){
				doc.remove("_id");				
//				rex.add(DocumnetConvertJsonObject(doc));
				rex.add(DocumentConverter.toCleanMap(doc));
			}					
		}catch(Exception e){
			e.printStackTrace();
		}finally{
			//cf.close_connect(client);
		}				
		return ResInfo.success(rex);
	}
	
	public Object search_dept_to_person(Map<String, Object> requestData) {
		List<Map<String, Object>> rex = new ArrayList<>();
		try{
			MongoCollection<Document> col = user.getCollection("user_info");	
			String deptcode = requestData.get("deptcode").toString();
			Document query = new Document();
			query.put("dpc", deptcode);
			FindIterable<Document> list = col.find(query).sort(Sorts.ascending("sort"));
			for (Document doc : list){
				doc.remove("_id");				
				rex.add(DocumentConverter.toCleanMap(doc));
			}					
		}catch(Exception e){
			e.printStackTrace();
		}finally{
			//cf.close_connect(client);
		}				
		return ResInfo.success(rex);
	}
	

}
