package com.kmslab.one.service.collection;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import com.kmslab.one.service.ResInfo;
import com.kmslab.one.util.DocumentConverter;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;

@Service
public class CollectionService {
	private final MongoTemplate collection;
	public CollectionService(
			@Qualifier("collection") MongoTemplate collection
			) {		
		this.collection = collection;
	}
	
	public Object search_collection(Map<String, Object> requestData) {
		try {
			MongoCollection<Document> col = collection.getCollection("data");			
			String ky = requestData.get("email").toString();
			int start = Integer.parseInt(requestData.get("start").toString());
			int perpage = Integer.parseInt(requestData.get("perpage").toString());
			String type = requestData.get("type").toString();			
			//opt : 1 (전체), 2(취합중), 3(취합마감), 4(제출전), 5(제출마감)
			String opt = requestData.get("opt").toString();
			String day = requestData.get("day").toString();
			String dcode = requestData.get("dcode").toString();  //부서코드	
			Document query = new Document();
			
			List<String> llk = new ArrayList<>();
			if (requestData.containsKey("depts")) {								
				llk.add(ky);			
				String lix = requestData.get("depts").toString();
				if (!lix.equals("")) {
					String[] list = lix.split("-spl-");					
					String mydept = list[list.length-1];
					llk.add(mydept);
				
				query.put("readers",new Document("$in", llk));
				}
			}
			
			Document temp = new Document();
			temp.put("temp", "F");
			
			Document andquery = new Document();
			List<Document> aq = new ArrayList<Document>();
			//보낸 취합 쿼리
			Document mc = new Document();
			mc.put("owner.ky", ky);
			aq.add(query);
			aq.add(mc);
			aq.add(temp);
			andquery.put("$and", aq);
					
			//받은 취합 쿼리
			Document andquery2 = new Document();
			Document mc2 = new Document();
			List<Document> aq2 = new ArrayList<Document>();
			aq2.add(query);		
			Document ppp = new Document();
			ppp.put("submitter.ky",new Document("$in", llk));
			aq2.add(ppp);			
			aq2.add(temp);					
			andquery2.put("$and", aq2);	
	
			//참조 취합 쿼리			
			Document andquery3 = new Document();
			Document mc3 = new Document();
			mc3.put("referrer.ky", ky);
			List<Document> aq3 = new ArrayList<Document>();
			aq3.add(query);
			aq3.add(mc3);
			aq3.add(temp);
			andquery3.put("$and", aq3);
											
			//전체 건수
			List<Document> taq2 = new ArrayList<Document>();
			taq2.add(query);
			taq2.add(temp);
			Document ss = new Document();
			ss.put("$and", taq2);			
			long list1 = 0;
			long list2 = 0;
			long list3 = 0;
			long list4 = 0;				
			long total = 0;
			
			//임시저장 건수
			List<Document> tmp = new ArrayList<Document>();
			Document t1 = new Document();
			t1.put("temp", "T");			
			Document t2 = new Document();
			t2.put("owner.ky", ky);
			tmp.add(t1);
			tmp.add(t2);
			Document tc = new Document();
			tc.put("$and", tmp);
			list4 = col.countDocuments(tc);			
			
			//type : 1 (전체), 2(받은취합), 3(보낸취합), 4(참조), 5(임시저장)
			if (type.equals("3")) {
				query = andquery;
			}else if (type.equals("2")) {
				query = andquery2;
			}else if (type.equals("4")) {
				query = andquery3;
			}	
			
			Document xquery = new Document();
			FindIterable<Document> docs = null;
			if (opt.equals("1")) {				
				list1 = col.countDocuments(andquery);
				list2 = col.countDocuments(andquery2);
				list3 = col.countDocuments(andquery3);							
				total = col.countDocuments(ss);										
				docs = col.find(query).limit(perpage).skip(start).sort(new Document("GMT", -1));
			}else if (opt.equals("2")) {
				//취합중
				Document enddate = new Document();
				enddate.put("end_date", new Document("$gte", day));
				aq.add(enddate);
				Document a1 = new Document();
				a1.put("$and", aq);				
				aq2.add(enddate);
				Document a2 = new Document();
				a2.put("$and", aq2);				
				aq3.add(enddate);
				Document a3 = new Document();
				a3.put("$and", aq3);				
				taq2.add(enddate);
				Document a4 = new Document();
				a4.put("$and", taq2);
				list1 = col.countDocuments(a1);
				list2 = col.countDocuments(a2);
				list3 = col.countDocuments(a3);							
				total = col.countDocuments(a4);				
				List<Document> and_query = new ArrayList<Document>();
				and_query.add(query);
				and_query.add(enddate);				
				xquery.put("$and", and_query);
				docs = col.find(xquery).limit(perpage).skip(start).sort(new Document("GMT", -1));				
			}else if (opt.equals("3")) {
				//취합마감
				Document enddate = new Document();
				enddate.put("end_date", new Document("$lte", day));				
				aq.add(enddate);
				Document a1 = new Document();
				a1.put("$and", aq);				
				aq2.add(enddate);
				Document a2 = new Document();
				a2.put("$and", aq2);				
				aq3.add(enddate);
				Document a3 = new Document();
				a3.put("$and", aq3);				
				taq2.add(enddate);
				Document a4 = new Document();
				a4.put("$and", taq2);				
				list1 = col.countDocuments(a1);
				list2 = col.countDocuments(a2);
				list3 = col.countDocuments(a3);							
				total = col.countDocuments(a4);				
				List<Document> and_query = new ArrayList<Document>();
				and_query.add(query);
				and_query.add(enddate);
				xquery.put("$and", and_query);
				docs = col.find(xquery).limit(perpage).skip(start).sort(new Document("GMT", -1));	
			}else if (opt.equals("4")) {
				//제출전
				Document submit = new Document();
				List<String> ll = new ArrayList<String>();
				ll.add(ky);
				ll.add(dcode);
				submit.put("res_members", new Document("$ne", ll));				
				aq.add(submit);
				Document a1 = new Document();
				a1.put("$and", aq);				
				aq2.add(submit);
				Document a2 = new Document();
				a2.put("$and", aq2);				
				aq3.add(submit);
				Document a3 = new Document();
				a3.put("$and", aq3);				
				taq2.add(submit);
				Document a4 = new Document();
				a4.put("$and", taq2);				
				list1 = col.countDocuments(a1);
				list2 = col.countDocuments(a2);
				list3 = col.countDocuments(a3);							
				total = col.countDocuments(a4);			
				List<Document> and_query = new ArrayList<Document>();
				and_query.add(query);
				and_query.add(submit);
				xquery.put("$and", and_query);
				docs = col.find(xquery).limit(perpage).skip(start).sort(new Document("GMT", -1));	
			}else if (opt.equals("5")){
				//제출마감
				Document submit = new Document();
				List<String> ll = new ArrayList<String>();
				ll.add(ky);
				ll.add(dcode);
				submit.put("res_members", new Document("$in", ll));				
				aq.add(submit);
				Document a1 = new Document();
				a1.put("$and", aq);				
				aq2.add(submit);
				Document a2 = new Document();
				a2.put("$and", aq2);				
				aq3.add(submit);
				Document a3 = new Document();
				a3.put("$and", aq3);				
				taq2.add(submit);
				Document a4 = new Document();
				a4.put("$and", taq2);				
				list1 = col.countDocuments(a1);
				list2 = col.countDocuments(a2);
				list3 = col.countDocuments(a3);							
				total = col.countDocuments(a4);				
				List<Document> and_query = new ArrayList<Document>();
				and_query.add(query);
				and_query.add(submit);
				xquery.put("$and", and_query);
				docs = col.find(xquery).limit(perpage).skip(start).sort(new Document("GMT", -1));	
			}
			
			if (type.equals("5")) {
				docs = col.find(tc).limit(perpage).skip(start).sort(new Document("GMT", -1));
			}	

			List<Document> docList = new ArrayList<>();
			docs.into(docList);			
			Map<String, Object> item = new HashMap<>();
			item.put("data", docList);
			item.put("total", total);
			item.put("t1", list2);
			item.put("t2", list1);
			item.put("t3", list3);
			item.put("t4", list4);			
			return ResInfo.success(item);	
			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	public Object search_collection_item(Map<String, Object> requestData) {
		try {

			MongoCollection<Document> col = collection.getCollection("data");
			MongoCollection<Document> col2 = collection.getCollection("response");
			MongoCollection<Document> col3 = collection.getCollection("chat");
		
			String key = requestData.get("key").toString();						
				
			Document query = new Document();
			query.put("key", key);
			
			
			long qnacount = 0;
			qnacount = col3.countDocuments(query);
			
			Document sdoc = col.find(query).first();		
			
			FindIterable<Document> docs = col2.find(query).sort(new Document("GTM", -1));
			List<Document> ar = new ArrayList<>();
			docs.into(ar);
			
			Map<String, Object> item = new HashMap<>();
			item.put("response", ar);
			item.put("ori", DocumentConverter.toCleanMap(sdoc));
			item.put("qnacount", qnacount);
			return ResInfo.success(item);		
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	public Object search_collection_chat(Map<String, Object> requestData) {
		try {
	
			MongoCollection<Document> col = collection.getCollection("chat");
			
		//	Document doc = Document.parse(jj.toString());	
			
			String key = requestData.get("key").toString();
			int start = Integer.parseInt(requestData.get("start").toString());
			int perpage = Integer.parseInt(requestData.get("perpage").toString());
			
	
			Document query = new Document();
			query.put("key", key);
			
		//	System.out.println("search_collection_chat query : " + query);
			
			long totalcount = 0;
			totalcount = col.countDocuments(query);
				
			FindIterable<Document> docs = col.find(query).limit(perpage).skip(start).sort(new Document("GMT", 1));
			List<Document> ar = new ArrayList<>();
			docs.into(ar);
			
			Map<String, Object> item = new HashMap<>();
			item.put("totalcount", totalcount);
			item.put("data", ar);
			return ResInfo.success(item);			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
}
