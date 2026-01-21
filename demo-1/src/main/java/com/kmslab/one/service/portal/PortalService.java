package com.kmslab.one.service.portal;

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
import com.kmslab.one.util.Utils;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;

@Service
public class PortalService {
	private final MongoTemplate portaldb;
	private final MongoTemplate appstore;
	private final MongoTemplate portlet;
	public PortalService(
			@Qualifier("appstore") MongoTemplate appstore,
			@Qualifier("portaldb") MongoTemplate portaldb,
			@Qualifier("portlet") MongoTemplate portlet
			) {		
		this.portaldb = portaldb;
		this.appstore = appstore;
		this.portlet = portlet;
	}
	
	public Object appstore_list(Map<String, Object> requestData) {
		
		try {
			MongoCollection<Document> col = appstore.getCollection("app");		
			String word = requestData.get("query").toString();		
			int st = Integer.parseInt(requestData.get("start").toString());
			int perpage = Integer.parseInt(requestData.get("perpage").toString());
			String isAdmin = requestData.get("admin").toString();
			String type = "all";
			if (requestData.containsKey("type")) {
				type = requestData.get("type").toString();
			}									
			List<Document> andquery = new ArrayList<Document>();										
			Document xquery = new Document();			
			Document query = new Document();
			if (isAdmin.equals("T")) {		
				//관리자는 전체 리스트를 표시한다.
			}else {
				Document xquery2 = new Document();
				List<Document> orquery = new ArrayList<Document>();
				//개인의 경우 사용자 ky값과 부서정보를 활용해서 readers를 계산한다.
				String email = requestData.get("email").toString();	
				Pattern regex = Pattern.compile(email, Pattern.CASE_INSENSITIVE);				
				List<String> excompany = new ArrayList<>();
				if (requestData.containsKey("depts")) {
					List<String> llk = new ArrayList<>();
					llk.add(email);				
					String lix = requestData.get("depts").toString();
					if (!lix.equals("")) {
						String[] lists = lix.split("\\^");
						for (int i = 0 ; i < lists.length; i++) {
							String dept = lists[i];
							llk.add(dept);
							if (i != 0) {
								excompany.add(dept);
							}
						}
						excompany.add("all");
					}			
					query.put("readers", new Document("$in", llk));
				}else {
					query.put("readers", regex);
				}
				orquery.add(query);				
				String ky = requestData.get("email").toString();
				if (ky.toLowerCase().contains("im")) {
					Document px = new Document();
					px.append("im_disable", "F");
					orquery.add(px);
				}				
				xquery2.append("$and", orquery);			
				Document xquery3 = new Document();
				Document tquery = new Document();
				List<Document> orquery2 = new ArrayList<Document>();
				excompany.add(email);
				xquery3.put("readers", new Document("$in", excompany));				
				orquery2.add(xquery2);
				orquery2.add(xquery3);
				tquery.append("$or", orquery2);			
				andquery.add(tquery);
			}			
			if (!word.equals("")) {
				//검색형태로 들어온 경우
				Document query2 = new Document();
				Pattern regex2 = Pattern.compile(word, Pattern.CASE_INSENSITIVE);	
				String category = requestData.get("category").toString();
				List<Document> orquery = new ArrayList<Document>();				
				if (category.equals("title")) {					
					Document q1 = new Document();
					q1.append("menu_kr", regex2);
					Document q2 = new Document();
					q2.append("menu_en", regex2);
					orquery.add(q1);
					orquery.add(q2);					
				}else if (category.equals("code")) {
					query2.put("code", regex2);
					orquery.add(query2);
				}
				Document xx = new Document();
				xx.put("$or", orquery);				
				andquery.add(xx);	
			}		
			if (!type.equals("all")) {
				if (type.equals("portlet")) {
					Document qq = new Document();
					qq.put("disp_portlet", "T");
					andquery.add(qq);
				}else if(type.equals("menu")) {
					Document qq = new Document();
					qq.put("disp_menu", "T");
					andquery.add(qq);
				}else if (type.equals("mobile")) {
					Document qq = new Document();
					qq.put("disp_mobile", "T");
					andquery.add(qq);
				}
			}			
			xquery.put("$and", andquery);			
			if (andquery.size() == 0) {
				xquery = new Document();
			}			
			long total = 0;
			total = col.countDocuments(xquery);				
			FindIterable<Document> docs = col.find(xquery).skip(st).limit(perpage).sort(new Document("sort", -1));
			List<Document> docList = new ArrayList<>();
			docs.into(docList);
			//Document를 Map으로 변환
			List<Map<String, Object>> items = DocumentConverter.toMapList(docList);
			Map<String, Object> responseData = new HashMap<>();
			responseData.put("response", items);
			responseData.put("total", total);				
			return ResInfo.success(responseData);					
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}

	}
	
	public Object portal_favorite_info(Map<String, Object> requestData) {
		try {
			MongoCollection<Document> col = portaldb.getCollection("favorite");
		
			Document query = new Document();
			query.put("ky", requestData.get("email").toString());
			
			Document doc = col.find(query).first();
			
			return ResInfo.success(DocumentConverter.toCleanMap(doc));
			
//			if (doc != null) {
//				res.setRes(DocumnetConvertJsonObject(doc));
//			}
//			
//			res.setResult("OK");
		}catch(Exception e) {
	//		res.setResult("ERROR");
			e.printStackTrace();
			return ResInfo.error(e.getMessage());

		}		
	}
	
	public Object portlet_person_list_portal(Map<String, Object> requestData) {
		try {

			MongoCollection<Document> col = portlet.getCollection("user");
			
			String key = requestData.get("email").toString();
			Document query = new Document();
			query.put("ky", key);
			//System.out.println("query : " + query);
			Document doc = col.find(query).first();
			
			if (doc != null) {
				return ResInfo.success(DocumentConverter.toCleanMap(doc));
			}else {
				Document qq = new Document();
				qq.put("ky", "default");
				//System.out.println("query : " + query);
				Document sdoc = col.find(qq).first();
				return ResInfo.success(DocumentConverter.toCleanMap(sdoc));
			}
			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	public Object save_person_portlet(Map<String, Object> requestData) {

		MongoCollection<Document> appcol = portlet.getCollection("user");		
		
		String ky = requestData.get("email").toString();
		//기존에 동일한 코드가 존재하는지 체크한다.				
		Document query = new Document();
		query.put("email", ky);			

		//신규로 등록한다.		
		Document doc = new Document(requestData);
		doc.put("GMT", Utils.GMTDate());
		
		try{			
			Document rep = appcol.findOneAndReplace(query, doc);
			if (rep == null) {
				appcol.insertOne(doc);
			}
			
					
		}catch(Exception e){			
			e.printStackTrace();			
		}		
		
		return ResInfo.success();

	}
	
}
