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
	
	public Object appstore_mobile_list(Map<String, Object> requestData) {
		try {
			MongoCollection<Document> col = appstore.getCollection("app_mobile");	
			String word = "";
			if (requestData.containsKey("query")) {
				word = requestData.get("query").toString();	
			}
			int st = 0;
			int perpage = 10000;
			if (requestData.containsKey("start")) {
				st = Integer.parseInt(requestData.get("start").toString());
			}
			if (requestData.containsKey("perpage")) {
				perpage = Integer.parseInt(requestData.get("perpage").toString());
			}
			String isAdmin =  "";
			if (requestData.containsKey("admin")) {
				isAdmin = requestData.get("admin").toString();
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
						String[] lists = lix.split("-spl-");
						for (int i = 0 ; i < lists.length; i++) {
							String dept = lists[i];
							llk.add(dept);
							if (i != 0) {
								excompany.add(dept);
							}
						}
						excompany.add("all");
						llk.add("all");
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
				andquery.add(xquery2);
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
			xquery.put("$and", andquery);		
			if (andquery.size() == 0) {
				xquery = new Document();
			}			
			long total = 0;
			total = col.countDocuments(xquery);			
			FindIterable<Document> docs = col.find(xquery).skip(st).limit(perpage).sort(new Document("sort", -1));			
			List<Map<String, Object>> ar = new ArrayList<>();		
			for (Document doc : docs){
				doc.remove("readers");
				ar.add(DocumentConverter.toCleanMap(doc));
			}
			
			Map<String, Object> dx = new HashMap<>();
			dx.put("response", ar);
			dx.put("total", total);
			return ResInfo.success(dx);		
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
	
	public Object appstore_category_list(Map<String, Object> requestData) {
		try {
			MongoCollection<Document> col = appstore.getCollection("category");				
			int st = Integer.parseInt(requestData.get("start").toString());
			int perpage = Integer.parseInt(requestData.get("perpage").toString());										
			Document xquery = new Document();		
			FindIterable<Document> docs = col.find(xquery).skip(st).limit(perpage).sort(new Document("sort", -1));
			List<Map<String, Object>> ar = new ArrayList<>();
			for (Document doc : docs) {
				doc.put("_id", doc.get("_id").toString());
				ar.add(DocumentConverter.toCleanMap(doc));
			}
			long total = 0;
			total = col.countDocuments(xquery);			
			Map<String, Object> dx = new HashMap<>();
			dx.put("response", ar);
			dx.put("total", total);
			return ResInfo.success(dx);
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}		
	}
	
	public Object appstore_dual_check(Map<String, Object> requestData) {
		try {
			MongoCollection<Document> appcol = appstore.getCollection("app");	
			String code = requestData.get("code").toString();		
			Document query = new Document();
			query.put("code", code);			
			Document sdoc = appcol.find(query).first();			
			Map<String, Object> rx = new HashMap<>();
			if (sdoc != null) {
				rx.put("exist", "T");
			}else {
				rx.put("exist", "F");
			}			
			return ResInfo.success(rx);
			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	public Object appstore_mobile_dual_check(Map<String, Object> requestData) {
		try {
			MongoCollection<Document> appcol = appstore.getCollection("app_mobile");		
			String code = requestData.get("code").toString();		
			Document query = new Document();
			query.put("code", code);			
			Document sdoc = appcol.find(query).first();
			Map<String, Object> rx = new HashMap<>();
			if (sdoc != null) {
				rx.put("exist", "T");
			}else {
				rx.put("exist", "F");
			}
			return ResInfo.success(rx);			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	public Object appstore_category_save(Map<String, Object> requestData) {	
		try{				
			MongoCollection<Document> appcol = appstore.getCollection("category");			
			String code = requestData.get("code").toString();
			//기존에 동일한 코드가 존재하는지 체크한다.				
			Document query = new Document();
			query.put("code", code);			
			appcol.deleteOne(query);			
			Document doc = new Document();
			doc = new Document(requestData);
			doc.put("GMT", Utils.GMTDate());				
			appcol.insertOne(doc);			
			return ResInfo.success();
		}catch(Exception e){			
			e.printStackTrace();		
			return ResInfo.error("Code alreay exist");
		}		
	}
	
	public Object appstore_category_delete(Map<String, Object> requestData) {
		boolean res = true;
		MongoCollection<Document> appcol = appstore.getCollection("category");					
		String[] codes = requestData.get("code").toString().split("-spl-");						
		for (int i = 0 ; i < codes.length; i++) {
			String code = codes[i];
			Document query = new Document();
			query.put("code", code);					
			try{						
				appcol.deleteOne(query);
			}catch(Exception e){
				e.printStackTrace();
				res = false;
			}
		}
		return ResInfo.success();
	}
	
	public Object appstore_save(Map<String, Object> requestData) {
		ResInfo res = new ResInfo();
		res.setResult("ERROR");
		MongoCollection<Document> appcol = appstore.getCollection("app");		
		
		String code = requestData.get("code").toString();
		//기존에 동일한 코드가 존재하는지 체크한다.				
		Document query = new Document();
		query.put("code", code);			
		appcol.deleteOne(query);			
		Document doc = new Document();
		doc = new Document(requestData);
		doc.put("GMT", Utils.GMTDate());	
		try{			
			appcol.insertOne(doc);		
			return ResInfo.success();
		}catch(Exception e){			
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}		
	}
	
	public Object appstore_delete(Map<String, Object> requestData) {
		MongoCollection<Document> appcol = appstore.getCollection("app");					
		String[] codes = requestData.get("code").toString().split("-spl-");						
		for (int i = 0 ; i < codes.length; i++) {
			String code = codes[i];
			Document query = new Document();
			query.put("code", code);					
			try{						
				appcol.deleteOne(query);
				
			}catch(Exception e){
				e.printStackTrace();
				return ResInfo.error(e.getMessage());
			}
		}
		return ResInfo.success();
	}
	
	public Object appstore_mobile_save(Map<String, Object> requestData) {		
		MongoCollection<Document> appcol = appstore.getCollection("app_mobile");			
		String code = requestData.get("code").toString();
		//기존에 동일한 코드가 존재하는지 체크한다.				
		Document query = new Document();
		query.put("code", code);			
		appcol.deleteOne(query);			
		Document doc = new Document();
		doc = new Document(requestData);
		doc.put("GMT", Utils.GMTDate());	
		try{			
			appcol.insertOne(doc);		
			return ResInfo.success();
		}catch(Exception e){			
			e.printStackTrace();	
			return ResInfo.error("Code alreay exist");
		}		
	}
	
	public Object appstore_mobile_delete(Map<String, Object> requestData) {
		MongoCollection<Document> appcol = appstore.getCollection("app_mobile");				
		String[] codes = requestData.get("code").toString().split("-spl-");						
		for (int i = 0 ; i < codes.length; i++) {
			String code = codes[i];
			Document query = new Document();
			query.put("code", code);					
			try{						
				appcol.deleteOne(query);
			}catch(Exception e){
				e.printStackTrace();
				return ResInfo.error(e.getMessage());
			}
		}
		return ResInfo.success();
	}
	
//	public Object portlet_list(Map<String, Object> requestData) {
//		try {
//			MongoCollection<Document> col = portlet.getCollection("app");	
//			String word = requestData.get("query").toString();		
//			int st = Integer.parseInt(requestData.get("start").toString());
//			int perpage = Integer.parseInt(requestData.get("perpage").toString());
//			String isAdmin = requestData.get("admin").toString();				
//									
//			List<Document> andquery = new ArrayList<Document>();										
//			Document xquery = new Document();			
//			Document query = new Document();
//			if (isAdmin.equals("T")) {		
//				//관리자는 전체 리스트를 표시한다.
//			}else {
//				Document xquery2 = new Document();
//				List<Document> orquery = new ArrayList<Document>();
//				//개인의 경우 사용자 ky값과 부서정보를 활용해서 readers를 계산한다.
//				String email = requestData.get("email").toString();	
//				Pattern regex = Pattern.compile(email, Pattern.CASE_INSENSITIVE);						
//				List<String> excompany = new ArrayList<>();
//				if (requestData.containsKey("depts")) {
//					List<String> llk = new ArrayList<>();
//					llk.add(email);				
//					String lix = requestData.get("depts").toString();
//					if (!lix.equals("")) {
//						String[] lists = lix.split("-spl-");
//						for (int i = 0 ; i < lists.length; i++) {
//							String dept = lists[i];
//							llk.add(dept);
//							if (i != 0) {
//								excompany.add(dept);
//							}
//						}
//						excompany.add("all");
//					}			
//					query.put("readers", new Document("$in", llk));
//				}else {
//					query.put("readers", regex);
//				}
//				orquery.add(query);					
//				String ky = requestData.get("email").toString();
//				if (ky.toLowerCase().contains("im")) {
//					Document px = new Document();
//					px.append("im_disable", "F");
//					orquery.add(px);
//				}				
//				xquery2.append("$and", orquery);				
//				Document xquery3 = new Document();
//				Document tquery = new Document();
//				List<Document> orquery2 = new ArrayList<Document>();
//				excompany.add(email);
//				xquery3.put("readers", new Document("$in", excompany));				
//				orquery2.add(xquery2);
//				orquery2.add(xquery3);
//				tquery.append("$or", orquery2);			
//				andquery.add(tquery);
//			}
//			
//			if (!word.equals("")) {
//				//검색형태로 들어온 경우
//				Document query2 = new Document();
//				Pattern regex2 = Pattern.compile(word, Pattern.CASE_INSENSITIVE);	
//				String category = requestData.get("category").toString();
//				List<Document> orquery = new ArrayList<Document>();				
//				if (category.equals("title")) {					
//					Document q1 = new Document();
//					q1.append("menu_kr", regex2);
//					Document q2 = new Document();
//					q2.append("menu_en", regex2);
//					orquery.add(q1);
//					orquery.add(q2);					
//				}else if (category.equals("code")) {
//					query2.put("code", regex2);
//					orquery.add(query2);
//				}
//				Document xx = new Document();
//				xx.put("$or", orquery);				
//				andquery.add(xx);	
//			}			
//			xquery.put("$and", andquery);		
//			if (andquery.size() == 0) {
//				xquery = new Document();
//			}			
//			long total = 0;
//			total = col.countDocuments(xquery);					
//			FindIterable<Document> docs = col.find(xquery).skip(st).limit(perpage).sort(new Document("sort", -1));
//			
//			List<Map<String, Object>> ar = new ArrayList<>();
//			JsonArray ar = new JsonArray();
//			
//			for (Document doc : docs){
//				ar.add(DocumnetConvertJsonObject(doc));
//			}
//			
//			
//			JsonObject dx = new JsonObject();
//			dx.add("response", ar);
//			dx.addProperty("total", total);
//					
//			res.setRes(dx);
//			
//			res.setResult("OK");
//							
//			
//		}catch(Exception e) {
//			e.printStackTrace();
//		}
//		
//		return res;
//	}
}
