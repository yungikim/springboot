package com.kmslab.one.service.files;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import com.google.gson.JsonObject;
import com.kmslab.one.service.ResInfo;
import com.kmslab.one.util.DocumentConverter;
import com.mongodb.client.AggregateIterable;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

@Service
public class FilesService {
	private final MongoTemplate channelInfo;
	private final MongoTemplate folderdata;
	private final MongoTemplate user;
	public FilesService(
			@Qualifier("channelInfo") MongoTemplate channelInfo,
			@Qualifier("folderdata") MongoTemplate folderdata,
			@Qualifier("userdb") MongoTemplate user
			) {		
		this.channelInfo = channelInfo;
		this.folderdata = folderdata;
		this.user = user;
	}
	
	public Object folder_list_main(Map<String, Object> requestData) {
//		JsonObject rx = new JsonObject();
//		JsonArray ar = new JsonArray();
		
		Map<String, Object> rx = new HashMap<>();
		List<Map<String, Object>> ar = new ArrayList<>();
		
		try{
			MongoCollection<Document> col = channelInfo.getCollection("driver");
			MongoCollection<Document> col2 = channelInfo.getCollection("folder");			
			MongoCollection<Document> col3 = folderdata.getCollection("data");	
			
			String email = requestData.get("email").toString();	
			
			if (email.equals("")) {
				//보안성 체크에서 세션 쿠키를 제거하고 테스트시 데이터를 내려주는 현상 처리를 위해서 
				//이메일이 정보가 없을 경우 0건으로 처리해서 내려준다.
				rx.put("filelist", ar);
				rx.put("totalcount", 0);
				return ResInfo.success(rx);
			}			
					
			String depts = requestData.get("depts").toString();
			String type = requestData.get("type").toString(); //1 : 모든 파일 , 2 : 내가 작성한 파일, 3 : 다른 사람이 작성한 파일
			int start = Integer.parseInt(requestData.get("start").toString());
			int perpage = Integer.parseInt(requestData.get("perpage").toString());
			
			String q_str = requestData.get("q_str").toString();
			String dtype = requestData.get("dtype").toString();		
			
			//내가 볼수 있는 Drive를 찾는다.			
			/////////////////////////////////////////////////////////////////////////////////////////////////////			
			Document query = new Document();
			if (!depts.equals("")) {
				List<String> llk = new ArrayList<>();
				llk.add(email);				
				String[] list = depts.split("-spl-");
				for (int i = 0 ; i < list.length ; i++) {
					llk.add(list[i]);
				}
				query.put("readers", new Document("$in", llk));				
			}
			
			//exit_user필드에는 포함되지 않아야 한다.
			List<String> llk2 = new ArrayList<>();
			llk2.add(email);		
			Document query2 = new Document();
			query2.put("exit_user", new Document("$nin", llk2));
						
			List<Document> sdoc = new ArrayList<Document>();
			sdoc.add(query);
			sdoc.add(query2);
			Document qq = new Document();
			qq.append("$and", sdoc);
			
			FindIterable<Document> list = col.find(qq);
			List<String> drives = new ArrayList<>();
			for (Document doc : list) {
				drives.add(doc.get("ch_code").toString());
			}
			//////////////////////////////////////////////////////////////////////////////////////////////////////
							
		
		//	System.out.println("===============================================================================");
			//내가 볼수 있는 folder를 찾는다.
			Document query3 = new Document();
			FindIterable<Document> list2 = col2.find(query);
			List<String> folders = new ArrayList<>();
			for (Document doc2 : list2) {
				if (drives.contains(doc2.get("drive_key"))) {
					if (doc2.get("parent_folder_key").toString().equals("root")) {
						if (drives.contains(doc2.get("drive_key").toString())) {
							folders.add(doc2.get("_id").toString());
						}
					}else {
						folders.add(doc2.get("_id").toString());
					}
				}
			}			
			
			Document qx = new Document();
			qx.put("drive_code", new Document("$in", drives));	
			qx.put("folder_code", "root");	
			Document qx2 = new Document();
			qx2.put("folder_code", new Document("$in", folders));
			List<Document> sx = new ArrayList<Document>();
			sx.add(qx);
			sx.add(qx2);
			Document sor = new Document();
			sor.append("$or", sx);
			Document sort = new Document();
			sort.append("GMT", -1);
					
			long total = 0;			
			if (type.equals("1")) {
				/////////////////////////////////////////////////////////////////////////////////////////////
				//Root 드라이브에 있는 파일과 폴더에 있는 파일을 모두 가져온다.			
				total = col3.countDocuments(sor);				
				List<Document> xp2 = new ArrayList<Document>();
				xp2.add(sor);				
				if (!q_str.equals("")){					
					Document q3 = new Document();
					Pattern regex2 = Pattern.compile(q_str, Pattern.CASE_INSENSITIVE);			
					q3.put("filename", regex2);					
					xp2.add(q3);					
				}				
				  
				if (!dtype.equals("")){                //ppt, pptx : ppx , jpg, png, gif : image 필터링을 위한 값
					Document q3 = new Document();		
					q3.put("dtype", dtype);
					xp2.add(q3);
				}
				
				Document xand = new Document();
				xand.append("$and", xp2);
				FindIterable<Document> fsearch = col3.find(xand).skip(start).limit(perpage).sort(sort);
				
				for (Document doc : fsearch) {
					doc.remove("content");
					ar.add(DocumentConverter.toCleanMap(doc));
				}
			}else if (type.equals("2")) {
				/////////////////////////////////////////////////////////////////////////////////////////
				//내가 볼수 있는 전체 중에 내가 작성한 파일만 보여주기
				List<Document> xp2 = new ArrayList<Document>();
				xp2.add(sor);				
				Document spp = new Document();
				spp.put("email", email);
				xp2.add(spp);										
				if (!q_str.equals("")){					
					Document q3 = new Document();
					Pattern regex2 = Pattern.compile(q_str, Pattern.CASE_INSENSITIVE);			
					q3.put("filename", regex2);					
					xp2.add(q3);					
				}					  
				if (!dtype.equals("")){                //ppt, pptx : ppx , jpg, png, gif : image 필터링을 위한 값
					Document q3 = new Document();		
					q3.put("dtype", dtype);
					xp2.add(q3);
				}		
				Document xand = new Document();
				xand.append("$and", xp2);				
				total = col3.countDocuments(xand);			
				FindIterable<Document> fsearch2 = col3.find(xand).skip(start).limit(perpage).sort(sort);				
				for (Document doc : fsearch2) {
					doc.remove("content");
					ar.add(DocumentConverter.toCleanMap(doc));
				}				
			}else if (type.equals("3")) {
				/////////////////////////////////////////////////////////////////////////////////////////
				//내가 볼수 있는 전체 중에 내가 작성한 파일이 아닌경우 작성자가 다른 사람인 경우				
				List<Document> xp2 = new ArrayList<Document>();
				xp2.add(sor);				
				Document spp = new Document();
				spp.put("email", new Document("$ne", email));
				xp2.add(spp);				
				if (!q_str.equals("")){					
					Document q3 = new Document();
					Pattern regex2 = Pattern.compile(q_str, Pattern.CASE_INSENSITIVE);			
					q3.put("filename", regex2);					
					xp2.add(q3);					
				}				  
				if (!dtype.equals("")){                //ppt, pptx : ppx , jpg, png, gif : image 필터링을 위한 값
					Document q3 = new Document();		
					q3.put("dtype", dtype);
					xp2.add(q3);
				}				
				Document xand = new Document();
				xand.append("$and", xp2);				
				total = col3.countDocuments(xand);			
				FindIterable<Document> fsearch2 = col3.find(xand).skip(start).limit(perpage).sort(sort);				
				for (Document doc : fsearch2) {
					doc.remove("content");
					ar.add(DocumentConverter.toCleanMap(doc));
				}
			}			
			rx.put("filelist", ar);
			rx.put("totalcount", total);
			return ResInfo.success(rx);			
		}catch(Exception e){
			e.printStackTrace();
			return ResInfo.error("ERROR");
		}
	}
	
	
	public Object my_drive_size(Map<String, Object> requestData) {
		try{
			String email = requestData.get("email").toString();
			MongoCollection<Document> ocol = user.getCollection("user_info");
			Document query = new Document();
			query.put("em", email);
			Document odoc = ocol.find(query).first();
			
			String mysize = "0";
			if (odoc != null){
				if (odoc.containsKey("dsize")){
					mysize = odoc.getString("dsize");
				}
			}					
			MongoCollection<Document> col = folderdata.getCollection("data");			
			
			AggregateIterable<Document> output = col.aggregate(Arrays.asList(new Document("$match", new Document("email",email)), new Document("$group", new Document("_id", "$email").append("sum", new Document("$sum", "$file_size")))));
			
			Document sdoc = output.first();
			if (sdoc != null){
				sdoc.append("dsize", mysize);
				return ResInfo.success(DocumentConverter.toCleanMap(sdoc));				
			}else{
				Map<String, Object> jx = new HashMap<>();
				jx.put("dsize", mysize);
				Map<String, Object> xx = new HashMap<>();
				xx.put("$numberLong", "0");
				jx.put("sum", xx);
				jx.put("_id", email);
				return ResInfo.success(jx);
			}		
		}catch(Exception e){
			e.printStackTrace();
			return ResInfo.error("ERROR");
		}
	}
	
	public Object drive_list_all(Map<String, Object> requestData) {
		List<Map<String, Object>> ar = new ArrayList<>();
		List<Map<String, Object>> ar2 = new ArrayList<>();
		Map<String, Object> rx = new HashMap<>();
		try{

			MongoCollection<Document> col = channelInfo.getCollection("driver");			
			MongoCollection<Document> col2 = channelInfo.getCollection("folder");				

			Document query = new Document();	
			String email = requestData.get("email").toString();
			
			Pattern regex = Pattern.compile(email, Pattern.CASE_INSENSITIVE);			
			if (requestData.containsKey("depts")) {
				List<String> llk = new ArrayList<>();			
				llk.add(email);//				
				String lix = requestData.get("depts").toString();
				if (!lix.equals("")) {
					String[] list = lix.split("-spl-");
					for (int i = 0 ; i < list.length; i++) {
						String dept = list[i];					
						llk.add(dept);
					}
				}	
				query.put("readers",new Document("$in", llk));
			}else {
				query.put("readers", regex);
			}
			
			//exit_user필드에는 포함되지 않아야 한다.
			List<String> llk2 = new ArrayList<>();
			llk2.add(email);		
			Document query2 = new Document();
			query2.put("exit_user", new Document("$nin", llk2));
						
			List<Document> sdoc = new ArrayList<Document>();
			sdoc.add(query);
			sdoc.add(query2);
			Document qq = new Document();
			qq.append("$and", sdoc);
						
					
			Document sort = new Document();
			sort.append("ch_share", 1);
			sort.append("ch_name", 1);

			FindIterable<Document> list = col.find(qq).sort(sort);
			for (Document doc : list){
				ar.add(DocumentConverter.toCleanMap(doc));
			}
			
			
			Document sort2 = new Document();
			sort2.append("depth", 1);
			FindIterable<Document> list2 = col2.find(qq).sort(sort2);
			for (Document doc : list2){
				ar2.add(DocumentConverter.toCleanMap(doc));
			}
			
			rx.put("drive", ar);
			rx.put("folder", ar2);
			
		}catch(Exception e){
			e.printStackTrace();
		}
		
		return ResInfo.success(rx);
	}
}
