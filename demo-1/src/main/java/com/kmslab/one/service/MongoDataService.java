package com.kmslab.one.service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.apache.commons.lang3.RandomStringUtils;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.kmslab.one.util.Utils;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.result.UpdateResult;


@Service
public class MongoDataService {
	@Autowired
	@Qualifier("userdb")
	private MongoTemplate UserTemplate;
	
	@Autowired
	@Qualifier("channel_data")
	private MongoTemplate channel_data;
		
	private String usercol = "user_info";
		
	public Document search_user_all_sso(String userid) {
		try {
			//1. $or 조건 생성 (lid == userid OR em == userid)
			Criteria criteria = new Criteria().orOperator(
					Criteria.where("lid").is(userid),
					Criteria.where("em").is(userid),
					Criteria.where("ky").is(userid)
			);			
			//2. 쿼리 객체 생성
			Query query = new Query(criteria);			
			query.fields().exclude("search");
			//3. 조회 실행 (첫 번재 결과 리턴)
			return UserTemplate.findOne(query, Document.class, usercol);					
		}catch(Exception e) {
			e.printStackTrace();
			return null;
		}
	}
	
	public ResRef insert_reply_attachment(Map<String, Object> jj) {
		ResRef res = new ResRef();
		res.setResult("ERROR");		
		try {
			MongoCollection<Document> col = channel_data.getCollection("data");			
			String id = jj.get("channel_data_id").toString();
			String rid = jj.get("rid").toString();		
			//원본 문서의 정보를 가져온다.
			Document query = new Document();
			query.put("_id", new ObjectId(id));
			Document sdoc = col.find(query).first();			
			if (sdoc != null) {
				String key = sdoc.getString("ky").toString();					
				JsonArray flist = (JsonArray) jj.get("file_infos");	
				query.append("reply.rid", rid);
				List<Document> flistd = new ArrayList<>();
				for (int i = 0 ; i < flist.size(); i++) {	
					Document push = new Document();
					push.put("$push",  new Document("reply.$.file_infos", Document.parse(flist.get(i).toString())));					
					UpdateResult rx = col.updateOne(query, push);	
				}		
			}		
			res.setResult("OK");
			res.setRes(Utils.DocumnetConvertJsonObject(sdoc));	
		}catch(Exception e) {
			e.printStackTrace();
		}		
		return res;
	}
	
	public JsonObject orignal_upload_path_check(String id) {		
		///System.out.println("orignal_upload_path_check .........");		
		String upload_path = "";
		String owner_ky = "";
		JsonObject res = new JsonObject();
		try{
			MongoCollection<Document> col = channel_data.getCollection("data");					
			Document query = new Document();
			query.put("_id", new ObjectId(id));			
			Document odoc = col.find(query).first();				
			if (odoc != null){
				if (odoc.containsKey("upload_path")) {					
					upload_path = odoc.get("upload_path").toString();					
					res.addProperty("upload_path", upload_path);					
				}else {					
			         Random rnd = new Random();
			  		 String randomStr = RandomStringUtils.randomAlphanumeric(15).toUpperCase();
			  		 String key = Utils.curDay8() + "_" + randomStr;			  					  		 
			  		 Document data = new Document();
			  		 data.put("upload_path", key);
			  		 Document se = new Document();
			  		 se.put("$set", data);
			  		 col.updateOne(query, se);			  		 
			  		res.addProperty("upload_path", key);
				}				
				Document owner = (Document) odoc.get("owner");
				owner_ky = owner.get("ky").toString();
				res.addProperty("owner_ky", owner_ky);	
			}else {
				System.out.println("없다....");
			}
		}catch(Exception e) {
			e.printStackTrace();
		}
		
		return res;
	}
	

	public static String MD5_Check(String path){
		//System.out.println("MD5 파일 시작");
		FileInputStream fis = null;
		try{
			File xx = new File(path);
			fis = new FileInputStream(xx);
			String md5 = org.apache.commons.codec.digest.DigestUtils.md5Hex(fis);
			//String md5 = org.apache.commons.codec.digest.DigestUtils.sha256Hex(fis);
			String size = String.valueOf(xx.length()) ;
		//	String md5 = org.apache.commons.codec.digest.DigestUtils.shaHex(fis);
			//org.apache.commons.codec.digest.DigestUtils.md5Hex(fis);
			//System.out.println(md5.length());
			
			//System.out.println(md5);
			md5 = md5 + "." + size;
			return md5;
		}catch(Exception e){			
			e.printStackTrace();
			return "ERROR";
		}finally{
			try {
				//System.out.println("MD5 파일 종료");
				fis.close();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}
	
	
	public ResInfo save_fileinfo(Document doc ) {
		ResInfo res = new ResInfo();
		res.setResult("ERROR");		
		try {
			MongoCollection<Document> col = channel_data.getCollection("files");			
			col.insertOne(doc);			
			res.setResult("OK");			
		}catch(Exception e) {
			e.printStackTrace();
		}		
		return res;
	}
}
