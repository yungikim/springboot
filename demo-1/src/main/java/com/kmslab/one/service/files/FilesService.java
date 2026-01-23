package com.kmslab.one.service.files;

import java.io.File;
import java.net.URI;
import java.net.URL;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.regex.Pattern;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import com.google.gson.JsonObject;
import com.kmslab.one.component.FileFolderUtil;
import com.kmslab.one.component.WriteLog;
import com.kmslab.one.config.AppConfig;
import com.kmslab.one.service.ResInfo;
import com.kmslab.one.service.ResRef;
import com.kmslab.one.util.DocumentConverter;
import com.kmslab.one.util.Utils;
import com.mongodb.client.AggregateIterable;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Sorts;
import com.mongodb.client.result.UpdateResult;

@Service
public class FilesService {
	private final MongoTemplate channelInfo;
	private final MongoTemplate folderdata;
	private final MongoTemplate user;	
	private final MongoTemplate channel_favorite;
	private final MongoTemplate channel_data;
	private final MongoTemplate todo_folder;
	
	@Autowired
	private AppConfig appConfig;
	
	@Autowired
	private WriteLog writeLog;
	
	@Autowired
	private FileFolderUtil ffUtil;
	
	public FilesService(
			@Qualifier("channelInfo") MongoTemplate channelInfo,
			@Qualifier("folderdata") MongoTemplate folderdata,
			@Qualifier("userdb") MongoTemplate user,
			@Qualifier("channel_favorite") MongoTemplate channel_favorite,
			@Qualifier("channel_data") MongoTemplate channel_data,
			@Qualifier("TODO_Folder") MongoTemplate todo_folder
			) {		
		this.channelInfo = channelInfo;
		this.folderdata = folderdata;
		this.user = user;
		this.channel_favorite = channel_favorite;
		this.channel_data = channel_data;
		this.todo_folder = todo_folder;
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
	
	public Object folder_list(Map<String, Object> requestData) {

		Map<String, Object> rx = new HashMap<>();
		List<Map<String, Object>> ar = new ArrayList<>();
		List<Map<String, Object>> ar2 = new ArrayList<>();
		
		try{
			
			String type = requestData.get("ty").toString();
			String q_str = requestData.get("q_str").toString();
			String dtype = requestData.get("dtype").toString();		
			
			if (type.equals("1") || (type.equals("3"))){
				MongoCollection<Document> col = channelInfo.getCollection("folder");								
				Document query = new Document();
				query.put("drive_key", requestData.get("drive_key").toString());
				query.put("parent_folder_key", requestData.get("parent_folder_key").toString());				
				//query.append("owner.em", obj.get("email").getAsString());	
				String email = requestData.get("email").toString();
				Pattern regex = Pattern.compile(email, Pattern.CASE_INSENSITIVE);				
				List<String> llk = new ArrayList<>();
				llk.add(email);				
				if (requestData.containsKey("depts")) {
					String lix = requestData.get("depts").toString();
					if (!lix.equals("")) {
						String[] list = lix.split("-spl-");
						for (int i = 0 ; i < list.length; i++) {
							String dept = list[i];
						//	regex = Pattern.compile(dept);
							llk.add(dept);
						}
					}					
					query.put("readers", new Document("$in", llk));
				}else {
					query.put("readers", regex);
				}			
				FindIterable<Document> list = col.find(query).sort(Sorts.ascending("folder_name"));
				for (Document doc : list){
					ar.add(DocumentConverter.toCleanMap(doc));
				}
				rx.put("folderlist", ar);
			}
			
			if (!type.equals("3")){	
				Document query2 = new Document();
				query2.put("drive_code", requestData.get("drive_key").toString());
				query2.put("folder_code", requestData.get("parent_folder_key").toString());							
				List<Document> doc = new ArrayList<Document>();
				doc.add(query2);				
				if (!q_str.equals("")){					
					Document q3 = new Document();
					Pattern regex2 = Pattern.compile(q_str, Pattern.CASE_INSENSITIVE);			
					q3.put("filename", regex2);					
					doc.add(q3);					
				}			  
				if (!dtype.equals("")){                //ppt, pptx : ppx , jpg, png, gif : image 필터링을 위한 값
					Document q3 = new Document();		
					q3.put("dtype", dtype);
					doc.add(q3);
				}			
				Document xquery = new Document();
				xquery.append("$and", doc);					
				MongoCollection<Document> col2 = folderdata.getCollection("data");				
				long totalcount = col2.countDocuments(xquery);			
				int start = Integer.parseInt(requestData.get("start").toString());
				int perpage = Integer.parseInt(requestData.get("perpage").toString());				
				FindIterable<Document> list2 = col2.find(xquery).limit(perpage).skip(start).sort(Sorts.descending("GMT"));
				for (Document xdoc : list2){
					doc.remove("content");
					ar2.add(DocumentConverter.toCleanMap(xdoc));
				}
				rx.put("datalist", ar2);
				rx.put("totalcount", totalcount);
			}
			return ResInfo.success(rx);					
		}catch(Exception e){
			e.printStackTrace();
			return ResInfo.error("ERROR");
		}
	}
	
	public Object delete_file_list(Map<String, Object> requestData) {
		boolean res = false;		
		try{
			MongoCollection<Document> col = folderdata.getCollection("data");			
			//파일 리스트 삭제일 경우 처리한다.
			String[] lists = requestData.get("file_item").toString().split("-spl-");							
			String drive_code = requestData.get("drive_code").toString();						
			List<Map<String, Object>> ll = new ArrayList<>();
			ll = (List<Map<String, Object>>) requestData.get("folder_depth");
			
			String dir = appConfig.getFileDownloadPath();
			
			String fpath = "";
			for (int i = 0 ; i < ll.size(); i++){
				String path = ll.get(i).toString();
				if (fpath.equals("")){
					fpath = path + File.separator;
				}else{
					fpath += path + File.separator;
				}
			}			

			if (!requestData.get("file_item").toString().equals("")){
				for (int i = 0 ; i < lists.length; i++){										
					String key = lists[i];		
					Document query = new Document();
					query.put("_id", new ObjectId(key));					
					Document sdoc = col.find(query).first();					
					if (sdoc != null){						
						/////////////////////////////////////////////////////////////////////////////////
						Document logdoc = new Document();
						logdoc = sdoc;
						logdoc.put("action", "delete_file_list");
						logdoc.put("action_time", Utils.GMTDate());				
						writeLog.write_log(logdoc);
						
						/////////////////////////////////////////////////////////////////////////////////
											
						String uploadpath = sdoc.get("upload_path").toString();
						String email = sdoc.get("email").toString();							
						String folderPath = "";
						if (ll.size() == 0){
							folderPath = dir + "/"+ email + "/" + drive_code +  "/"+ uploadpath;
						}else{
							folderPath = dir + "/"+ email + "/" + drive_code +  "/" + fpath + uploadpath;
						}					
						System.out.println("Delete File " + folderPath);
						delete_folder(folderPath);
						
						col.deleteOne(query);
					}else{
						System.out.println("문서가 없습니다.");
					}
				}
			}
					
			MongoCollection<Document> col2 = channelInfo.getCollection("folder");			
			//드라이브 삭제일 경우 해당 파일 들을 찾아서 모두 삭제해 한다.
			String[] folders = requestData.get("folder_item").toString().split("-spl-");					
			List<String> deleteFolderlist = new ArrayList<>();			
			if (!requestData.get("folder_item").toString().equals("")){
				for (int y = 0 ; y < folders.length; y++){
					String key = folders[y];					
					Document query = new Document();
					query.put("_id", new ObjectId(key));					
					Document sdoc = col2.find(query).first();					
					if (sdoc != null){
						deleteFolderlist.add(key);						
						Document info = (Document) sdoc.get("owner");					
						String em = info.get("em").toString();						
						String folderPath = "";
						if (ll.size() == 0){
							folderPath = dir + "/"+ em +"/"+ drive_code + "/" + key;
						}else{
							folderPath = dir + "/"+ em +"/"+ drive_code + "/" + fpath + key;
						}						
						System.out.println("Folder Delete : " + folderPath);
						delete_folder(folderPath);							
						//삭제되는 폴더에 하위 폴더가 있는지 체트해서 모두 삭제해야 한다.
						Document qq = new Document();
						qq.put("parent_folder_key", key);
						Document ssdoc = col2.find(qq).first();
						if (ssdoc != null) {
							String dkey = ssdoc.get("_id").toString();
							deleteFolderlist.add(dkey);
							Document qq2 = new Document();
							qq2.put("parent_folder_key", dkey);
							Document ssdoc2 = col2.find(qq2).first();
							if (ssdoc2 != null) {
								String dkey2 = ssdoc2.get("_id").toString();								
								deleteFolderlist.add(dkey2);
								Document qq3 = new Document();
								qq3.put("parent_folder_key", dkey2);
								Document ssdoc3 = col2.find(qq3).first();
								if (ssdoc3 != null) {
									String dkey3 = ssdoc3.get("_id").toString();
									deleteFolderlist.add(dkey3);
								}
							}
						}								
						col2.deleteOne(query);
					}				
				}
			}			
			for (int i = 0 ; i < deleteFolderlist.size() ; i++) {
				String key = deleteFolderlist.get(i);
				Document qqx = new Document();
				qqx.put("_id", new ObjectId(key));				
				//해당 폴더에 들어있는 실제 파일정보도 모두 삭제해야 한다.
				Document xx = new Document();
				xx.put("folder_code", key);				
				col.deleteMany(xx);
				///////////////////////////////////////////				
				col2.deleteOne(qqx);
			}		
			return ResInfo.success();
			
		}catch(Exception e){
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	
	
	private void delete_folder(String path){
		try{
			File rootDir = new File(path);
			if (rootDir.exists()){
				FileUtils.deleteDirectory(rootDir);
			}		
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	
	private void delete_file(String path){
		try{
			File f = new File(path);
			if (f.exists()){
				f.delete();
			}		
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	
	public Object drive_list(Map<String, Object> requestData) {
		List<Map<String, Object>> ar = new ArrayList<>();
		try{
			MongoCollection<Document> col = channelInfo.getCollection("driver");
			Document query = new Document();	
			String email = requestData.get("email").toString();
			Pattern regex = Pattern.compile(email);				
			if (requestData.containsKey("depts")) {
				List<String> llk = new ArrayList<>();				
				llk.add(email);
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
			sort.append("type", -1);
			sort.append("ch_share", -1);
			sort.append("ch_name", 1);
			FindIterable<Document> list = col.find(qq).sort(sort);
			list.into(ar);			
		}catch(Exception e){
			e.printStackTrace();
		}
		return ResInfo.success(ar);
	}
	
	public Object copy_favorite(Map<String, Object> requestData) {
		ResInfo res = new ResInfo();
		res.setResult("ERROR");
		try{
			MongoCollection<Document> col = channel_favorite.getCollection("list");
			
//			MongoDatabase tdb = null;
			MongoCollection<Document> tcol = null;			
			String ty = requestData.get("type").toString();
			String id = requestData.get("id").toString();
			String email = requestData.get("email").toString();
			String md5 = requestData.get("md5").toString();
			
			Document qqq = new Document();
			qqq.put("md5", md5);
			qqq.put("email", email);
			Document sxdoc = col.find(qqq).first();
			if (sxdoc != null){
				res.setResult("EXIST");
				return res;
			}			
			Document query = new Document();
			Document sdoc = new Document();			
			if (ty.equals("1")){
				//드라이브 파이을 즐겨찾기 한 경우				
			//	System.out.println("Drive 즐겨찾기 호출");			
				tcol = folderdata.getCollection("data");
				query.put("_id", new ObjectId(id));
				sdoc = tcol.find(query).first();
				
				if (sdoc != null){					
				//	System.out.println("문서 있음");
					String fserver = sdoc.getString("fserver");
					String dir = appConfig.getFileDownloadPath();
					
					String dfilename = URLEncoder.encode(sdoc.getString("filename"),java.nio.charset.StandardCharsets.UTF_8.toString());
					String upload_path = sdoc.getString("fpath");
					String[] spl = upload_path.split("/");
					String rpath = "";
					for (int i = 0 ; i < spl.length; i++){
						if (i > 2){
							if (rpath.equals("")){
								rpath = spl[i];
							}else{
								rpath += "/" + spl[i];
							}
						}
					}					
					String tupload_path = sdoc.getString("upload_path");
				//	String sourceFile_full_path = sdoc.getString("fserver") + "/FileDownload.do?em=" + sdoc.getString("email") + "&fd=" + rpath + "&m5=" + md5 + "&ty=1&fn=" + dfilename;
					String sourceFile_full_path = sdoc.getString("fserver") + "/FDownload.do?id=" + sdoc.get("_id").toString() + "&md5=" + md5 + "&ty=1";
					String target_file_path = dir + "/favorite/" + email + "/" + tupload_path + "/" + md5 + "." + sdoc.getString("file_type");
					File f = new File(dir + "/favorite/" + email + "/" +  tupload_path);
					if (!f.exists()){
						f.mkdirs();
					}	
					FileUtils.copyURLToFile(URI.create(sourceFile_full_path).toURL(), new File(target_file_path));					
					File dfile = new File(target_file_path);
					if (dfile.length() > 0) {
						if (sdoc.get("thumbOK").toString().equals("T")){					
							File f2 = new File(dir + "/favorite/" + email + "/" + tupload_path + "/thumbnail");
							if (!f2.exists()){
								f2.mkdirs();
							}									
							//썸네일 파일도 카피해야 한다.
							String target_file_path2 = "";						
							String sourceFile_full_path2 = sdoc.getString("fserver") + "/FDownload_thumb.do?id=" + sdoc.get("_id").toString() + "&md5=" + md5 + "&ty=1";
													
							if (sdoc.getString("file_type").equals("pdf")){
								target_file_path2 = dir + "/favorite/" + email + "/" + tupload_path + "/thumbnail/" + md5 + "_thumb1.png";
							}else{
								target_file_path2 = dir + "/favorite/" + email + "/" + tupload_path + "/thumbnail/" + md5 + "_thumb.png";
							}						
							FileUtils.copyURLToFile(new URL(sourceFile_full_path2), new File(target_file_path2));
						}						
						Document ndoc = new Document();
						ndoc.put("upload_path", sdoc.getString("upload_path"));
						ndoc.put("content", sdoc.getString("content"));
						ndoc.put("thumbOK", sdoc.getString("thumbOK"));
						ndoc.put("filename", sdoc.getString("filename"));
						ndoc.put("file_type", sdoc.getString("file_type"));
						ndoc.put("meta", sdoc.getString("meta"));
						ndoc.put("md5", sdoc.getString("md5"));		
						
						ndoc.put("email", email);
						ndoc.put("ky", email);
						ndoc.put("size", Long.parseLong(sdoc.get("file_size").toString()));
						ndoc.put("fserver", sdoc.get("fserver").toString());
						ndoc.put("GMT", Utils.GMTDate());
						ndoc.put("dtype", sdoc.getString("dtype"));
						ndoc.put("file_source", "drive");
						
						if (sdoc.containsKey("bun")) {
							ndoc.put("bun", sdoc.get("bun").toString());
						}						
						col.insertOne(ndoc);	
					}else {
					//	System.out.println("원본 파일 사이즈가 0이라 존재하지 않는 파일로 인식되었습니다. " + target_file_path);						
						if (dfile.exists()) {
							dfile.delete();
							dfile.getParentFile().delete();
							System.out.println("해당 파일을 삭제한다.");
						}
					}									
				}				
			}else if (ty.equals("2")){
				//채널 파일을 즐겨찾기 한 경우				
			//	System.out.println("channel Favorite 시작");				
				if (id.split("_").length > 1) {					
					//reply파이를 즐겨찾기 추가하는 경우이다.
					tcol = channel_data.getCollection("files");
					query.put("id", id);
					sdoc = tcol.find(query).first();
					
					if (sdoc != null) {
						String dir = appConfig.getFileDownloadPath();
						Document info = (Document) sdoc.get("info");
						String ft = info.getString("file_type");
						//기존파일을 다운로드 받아서 나의 Favorite 폴더에 추가한다.						
						//http://files.kmslab.com:8080/WMeet/FileDownload.do?em=ygkim@kmslab.com&fd=20201026173457_HHDTOEVK2H5OJDI&m5=fc115fdbe6510050065d45628d580e19.255795&fn=(10%EC%9B%9426%EC%9D%BC%20%EB%B0%B0%EC%9B%80%20%EA%BE%B8%EB%9F%AC%EB%AF%B8).pdf
						String dfilename = URLEncoder.encode(info.getString("filename"),java.nio.charset.StandardCharsets.UTF_8.toString());
//						String sourceFile_full_path = sdoc.getString("fserver") + "/FileDownload.do?em=" + sdoc.getString("ky") + "&fd=" + sdoc.getString("upload_path") + "&m5=" + md5 + "&ty=1&fn=" + dfilename;
//						
						Document ndoc = Document.parse(info.toJson());
						ndoc.put("fserver", sdoc.get("fserver").toString());
						ndoc.put("email", email);
						ndoc.put("ky", email);
						ndoc.put("size", Long.parseLong(info.get("file_size").toString()));
						ndoc.put("GMT", Utils.GMTDate());
						ndoc.put("upload_path", sdoc.getString("upload_path"));
						ndoc.put("file_source", "channel");					
						String sourceFile_full_path = sdoc.getString("fserver") + "/FDownload.do?id=" + id + "&md5="+md5+"&ty=reply&ky=" + sdoc.get("ky").toString();
				//		System.out.println("sourcePath 1 : " + sourceFile_full_path);
						String target_file_path = dir + "/favorite/" + email + "/" + sdoc.getString("upload_path") + "/" + md5 + "." + ft;						
						File f = new File(dir + "/favorite/" + email + "/" +  sdoc.getString("upload_path"));
						if (!f.exists()){
							f.mkdirs();
						}												
						FileUtils.copyURLToFile(URI.create(sourceFile_full_path).toURL(), new File(target_file_path));						
						File dfile = new File(target_file_path);					
						if (dfile.length() > 0) {							
							if (info.get("thumbOK").toString().equals("T")){						
								File f2 = new File(dir + "/favorite/" + email + "/" + sdoc.getString("upload_path") + "/thumbnail");
								if (!f2.exists()){
									f2.mkdirs();
								}										
								//썸네일 파일도 카피해야 한다.
								String target_file_path2 = "";
								String sourceFile_full_path2 = sdoc.getString("fserver") + "/FileDownload.do?em=" + sdoc.getString("ky") + "&fd=" + sdoc.getString("upload_path") + "&m5=" + md5 + "&ty=2&fn=" + dfilename;
								//String sourceFile_full_path2 = sdoc.getString("fserver") + "/FDownload.do?id=" + id + "&md="+md5+"&ty=reply&ky=" + sdoc.get("ky").toString();
								if (ft.equals("pdf")){
									target_file_path2 = dir + "/favorite/" + email + "/" + sdoc.getString("upload_path") + "/thumbnail/" + md5 + "_thumb1.png";
								}else{
									target_file_path2 = dir + "/favorite/" + email + "/" + sdoc.getString("upload_path") + "/thumbnail/" + md5 + "_thumb.png";
								}								
								FileUtils.copyURLToFile(URI.create(sourceFile_full_path2).toURL(), new File(target_file_path2));	
							}					
							col.insertOne(ndoc);
							res.setResult("OK");
						}else {
							System.out.println("원본 파일 사이즈가 0이라 존재하지 않는 파일로 인식되었습니다. " + target_file_path);
							if (dfile.exists()) {
								dfile.delete();
								dfile.getParentFile().delete();
								System.out.println("해당 파일을 삭제한다.");
							}
						}						
					}			
				}else {
					tcol = channel_data.getCollection("data");
					query.put("_id", new ObjectId(id));
					sdoc = tcol.find(query).first();					
					if (sdoc != null){						
					//	System.out.println("문서 찾음");
						Document xdoc = null;
						if (sdoc.containsKey("info")){
							List<Document> atts = (List<Document>) sdoc.get("info");							
							for (int i = 0 ; i < atts.size(); i++){
								xdoc = atts.get(i);
								if (xdoc.get("md5").toString().equals(md5)){
									break;
								}
							}
						}						
						if (xdoc != null){											
							//이동할려는 파일의 정보를 가져왔다..
							Document ndoc = Document.parse(xdoc.toJson());
							ndoc.put("fserver", sdoc.get("fserver").toString());
							ndoc.put("email", email);
							ndoc.put("ky", email);
							ndoc.put("size", Long.parseLong(xdoc.get("file_size").toString()));
							ndoc.put("GMT", Utils.GMTDate());
							ndoc.put("upload_path", sdoc.getString("upload_path"));
							ndoc.put("file_source", "channel");
							String dir = appConfig.getFileDownloadPath();
							String ft = xdoc.getString("file_type");
							//기존파일을 다운로드 받아서 나의 Favorite 폴더에 추가한다.							
							//http://files.kmslab.com:8080/WMeet/FileDownload.do?em=ygkim@kmslab.com&fd=20201026173457_HHDTOEVK2H5OJDI&m5=fc115fdbe6510050065d45628d580e19.255795&fn=(10%EC%9B%9426%EC%9D%BC%20%EB%B0%B0%EC%9B%80%20%EA%BE%B8%EB%9F%AC%EB%AF%B8).pdf
							String dfilename = URLEncoder.encode(xdoc.getString("filename"),java.nio.charset.StandardCharsets.UTF_8.toString());
							String sourceFile_full_path = sdoc.getString("fserver") + "/FileDownload.do?em=" + sdoc.getString("ky") + "&fd=" + sdoc.getString("upload_path") + "&m5=" + md5 + "&ty=1&fn=" + dfilename;
							String target_file_path = dir + "/favorite/" + email + "/" + sdoc.getString("upload_path") + "/" + md5 + "." + ft;							
							File f = new File(dir + "/favorite/" + email + "/" +  sdoc.getString("upload_path"));
							if (!f.exists()){
								f.mkdirs();
							}																				
							FileUtils.copyURLToFile(URI.create(sourceFile_full_path).toURL(), new File(target_file_path));							
							File dfile = new File(target_file_path);						
							if (dfile.length() > 0) {								
								if (xdoc.get("thumbOK").toString().equals("T")){							
									File f2 = new File(dir + "/favorite/" + email + "/" + sdoc.getString("upload_path") + "/thumbnail");
									if (!f2.exists()){
										f2.mkdirs();
									}											
									//썸네일 파일도 카피해야 한다.
									String target_file_path2 = "";
									String sourceFile_full_path2 = sdoc.getString("fserver") + "/FileDownload.do?em=" + sdoc.getString("ky") + "&fd=" + sdoc.getString("upload_path") + "&m5=" + md5 + "&ty=2&fn=" + dfilename;
									if (ft.equals("pdf")){
										target_file_path2 = dir + "/favorite/" + email + "/" + sdoc.getString("upload_path") + "/thumbnail/" + md5 + "_thumb1.png";
									}else{
										target_file_path2 = dir + "/favorite/" + email + "/" + sdoc.getString("upload_path") + "/thumbnail/" + md5 + "_thumb.png";
									}									
									FileUtils.copyURLToFile(URI.create(sourceFile_full_path2).toURL(), new File(target_file_path2));
								}						
								col.insertOne(ndoc);
								res.setResult("OK");
							}else {
								System.out.println("원본 파일 사이즈가 0이라 존재하지 않는 파일로 인식되었습니다. " + target_file_path);
								if (dfile.exists()) {
									dfile.delete();
									dfile.getParentFile().delete();
									System.out.println("해당 파일을 삭제한다.");
								}
							}						
						}
					}	
				}					
			}			
		}catch(Exception e){
			e.printStackTrace();
		}
		
		return ResInfo.success();
	}
	
	public Object create_person_drive(Map<String, Object> requestData) {
		try{
			MongoCollection<Document> col = channelInfo.getCollection("driver");
			
			Document doc = new Document(requestData);
			col.insertOne(doc);
			
			String id = doc.get("_id").toString();
						
			Document query = new Document();
			query.append("_id", new ObjectId(id));
			
			Document se = new Document();
			se.append("ch_code", id);
			
			Document sx = new Document();
			sx.append("$set", se);
			
			col.updateOne(query, sx);

			Map<String, Object> item = new HashMap<>();
			item.put("id", id);
			return ResInfo.success(item);
			
		}catch(Exception e){
			e.printStackTrace();
			return ResInfo.error("ERROR");
		}
	}
	
	public Object drive_update(Map<String, Object> requestData) {
		boolean res = false;		
		try{
			MongoCollection<Document> col = channelInfo.getCollection("driver");				
			Document query = new Document();	
			String drive_code = requestData.get("ch_code").toString();
			query.append("ch_code", drive_code);						
			String new_drive_name = requestData.get("ch_name").toString();
			String ori_drive_name = "";
			Document qq = new Document();
			qq = col.find(query).first();			
			if (qq != null) {				
				ori_drive_name = qq.getString("ch_name");				
				Document data = new Document(requestData);		
				Document se = new Document();
				se.append("$set", data);				
				col.updateOne(query, se);				
				if (!ori_drive_name.equals(new_drive_name)) {
					MongoCollection<Document> ff = folderdata.getCollection("data");
					Document xp = new Document();
					xp.put("drive_code", drive_code);
					Document xx = new Document();
					xx.put("drive_name", new_drive_name);
					Document ses = new Document();
					ses.put("$set", xx);
					UpdateResult pp = ff.updateMany(xp, ses);
				}				
				
				//하위 폴더에 있는 전체 멤버중에 삭제된 멤버를 일괄 제거해 준다.
				if (requestData.containsKey("delete_members")) {
					List<Map<String, Object>> delete_members2 = (List<Map<String, Object>>) requestData.get("delete_members");					
					if (delete_members2.size() > 0) {
						//드라이브 하위 폴더 정보를 전체 가져온다.
						MongoCollection<Document> col2 = channelInfo.getCollection("folder");
						Document qqn = new Document();
						qqn.append("drive_key", drive_code);						
						FindIterable<Document> folders = col2.find(qqn);						
						for (Document doc : folders) {
							String id = doc.get("_id").toString();
							for (int i = 0 ; i < delete_members2.size(); i++) {
								String email = delete_members2.get(i).toString();
								JsonObject lc = new JsonObject();
								lc.addProperty("type", "3");
								lc.addProperty("email", email);
								lc.addProperty("id", id);
								channel_delete_member(lc);
							}							
						} 
					}					
				}				
				res = true;
			}		
		}catch(Exception e){
			e.printStackTrace();
		}		
		return ResInfo.success();
	}
	
	
	public ResRef channel_delete_member(JsonObject jj) {
		ResRef res = new ResRef();
		res.setResult("ERROR");				
		try {
			String type = jj.get("type").getAsString(); //1-채널 정보, 2-드라이브 정보, 3-폴더 정보			
			MongoCollection<Document> col = null;
			if (type.equals("1")) {
				//채널 정보에서 멤버를 제거한다.
				col = channelInfo.getCollection("channel");
			}else if (type.equals("2")) {
				//드라이브 정보에서 멤버를 제거한다.
				col = channelInfo.getCollection("driver");
			}else if (type.equals("3")) {
				//드라이브 하위 폴더에서 멤버를 제거하는 경우
				col = channelInfo.getCollection("folder");
			}else if (type.equals("4")) {
				//To Do에 멤버를 제거하는 경우				
			}			
			String project_code = jj.get("id").getAsString();
			String email = jj.get("email").getAsString();		
			Document query = new Document();
			query.put("_id", new ObjectId(project_code));				
			Document sdoc = col.find(query).first();		 
			if (sdoc != null) {							
				if (sdoc.containsKey("member")){
					Document pull = new Document();
					pull.put("$pull", new Document("member", new Document("ky",email)));					
					UpdateResult rx =  col.updateOne(query, pull);	
				}					
				if (sdoc.containsKey("readers")){
					Document se = new Document();	
					se.put("$pull",  new Document("readers", email));
					UpdateResult rx2 =  col.updateOne(query, se);
				}								
				if (sdoc.containsKey("exit_user")){
					Document sp = new Document();
					sp.put("$pull",  new Document("exit_user", email));
					col.updateOne(query, sp);
				}				
				//채널에 멤버를 삭제하면 Todo에 멤버도 삭제해야 한다. //////////////////////////////////////////////////////////////
				Document ndoc = col.find(query).first();
				MongoCollection<Document> col2 = todo_folder.getCollection("folder");
				List<Document> member_info = (List<Document>) ndoc.get("member");						
				List<String> readers_info = (List<String>) ndoc.get("readers");									
				Document nnc = new Document();
				nnc.put("readers",  readers_info);
				nnc.put("member", member_info);
				Document sep = new Document();
				sep.put("$set", nnc);
				Document qy = new Document();
				qy.put("_id", new ObjectId(project_code));
				col2.updateOne(qy, sep);
				/////////////////////////////////////////////////////////////////////////////////////////////////////////					
				
				JsonObject jx = new JsonObject();
				res.setResult("OK");
				res.setRes(jx);			
			}else {
				System.out.println("문서가 존재 하지 않습니다.");
			}
					
		}catch(Exception e) {
			e.printStackTrace();
		}		
		return res;
	}
	
	public Object make_folder(Map<String, Object> requestData) {	
		try{
			MongoCollection<Document> col = channelInfo.getCollection("folder");			
			Document doc = new Document(requestData);
			col.insertOne(doc);			
			//상위 폴더를 찾아서 하위에 폴더가 있다고 표시해 준다.
			if (doc.get("parent_folder_key").equals("root")) {
				//상위 폴더가 드라이브일 경우 drive collection에서 값을 찾아 서브 폴더가 존재함을 업데이트 해준다.
				MongoCollection<Document> col2 = channelInfo.getCollection("driver");
				Document query = new Document();
				query.put("_id", new ObjectId(doc.get("drive_key").toString()));
				Document se = new Document();
				Document data = new Document();
				data.put("subfolder", "T");
				se.put("$set", data);
				UpdateResult up = col2.updateOne(query, se);				
			}else {
				//parent_folder_key를 다시 찾아 서브폴더가 존재함을 업데이트 해 준다.
				Document query = new Document();
				query.put("_id", new ObjectId(doc.get("parent_folder_key").toString()));
				Document se = new Document();
				Document data = new Document();
				data.put("subfolder", "T");
				se.put("$set", data);
				UpdateResult up = col.updateOne(query, se);
			}
			Map<String, Object> item = new HashMap<>();
			JsonObject jjx = new JsonObject();
			String id = doc.get("_id").toString();		
			item.put("folder_id", id);			
			item.put("GMT", Utils.GMTDate());
			return ResInfo.success(item);			
		}catch(Exception e){
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	String cparent = "";
	public Object update_folder(Map<String, Object> requestData) {	
		try{
			MongoCollection<Document> col = channelInfo.getCollection("folder");			
			String id = requestData.get("id").toString();
			requestData.remove("id");			
			Document doc = new Document(requestData);						
			Document query = new Document();
			query.put("_id", new ObjectId(id));			
			Document se = new Document();
			se.put("$set", doc);			
			col.updateOne(query, se);			
			
			 //하위 폴더에 있는 전체 멤버중에 삭제된 멤버를 일괄 제거해 준다.
			if (requestData.containsKey("delete_members")) {
				//System.out.println(jj.get("delete_members"));
				List<Map<String, Object>> delete_members2 = (List<Map<String, Object>>) requestData.get("delete_members");				
				if (delete_members2.size() > 0) {
					//드라이브 하위 폴더 정보를 전체 가져온다.
					cparent = "";
					String rx = check_parent(id, col);
					String[] rxx = rx.split("-spl-");				
					for (String uu : rxx) {
						String id2 = uu;					
						for (int i = 0 ; i < delete_members2.size(); i++) {
							String email = delete_members2.get(i).toString();
							JsonObject lc = new JsonObject();
							lc.addProperty("type", "3");
							lc.addProperty("email", email);
							lc.addProperty("id", id2);
							channel_delete_member(lc);
						}
					}					
				}					
			}			
		}catch(Exception e){			
			e.printStackTrace();
		}
		return ResInfo.success();
	}
	
	private String check_parent(String id, MongoCollection<Document> col) {
		Document qq = new Document();
		qq.put("parent_folder_key", id);				
		FindIterable<Document> list = col.find(qq);		
		for (Document doc : list) {		
			if (doc.containsKey("subfolder")) {	
				String key = doc.get("_id").toString();
				String fname = doc.get("folder_name").toString();				
				if (doc.get("subfolder").toString().equals("T")) {
					if (cparent.equals("")) {
						cparent = key;
					}else {
						cparent = cparent + "-spl-" + key;
					}						
					check_parent(key, col);
				}				
			}else {
				String key = doc.get("_id").toString();
				String fname = doc.get("folder_name").toString();
				if (cparent.equals("")) {
					cparent = key;
				}else {
					cparent = cparent + "-spl-" + key;
				}				
			}		
		}		
		return cparent;
	}
	
	public Object delete_folder_new(Map<String, Object> requestData) {	
		try{
			MongoCollection<Document> col = channelInfo.getCollection("folder");			
			Document query = new Document();
			query.put("_id", new ObjectId(requestData.get("id").toString()));			
			String depts = requestData.get("depts").toString();
			String email = requestData.get("email").toString();					
			Document sdoc = col.find(query).first();
			if (sdoc != null){
				Document logdoc = new Document();
				logdoc = sdoc;
				logdoc.put("action", "delete_folder");
				logdoc.put("action_time", Utils.GMTDate());				
				writeLog.write_log(logdoc);				
				col.deleteOne(query);				
				String drive_key = sdoc.get("drive_key").toString();
				String folder_key = sdoc.get("parent_folder_key").toString();				
				//상위 폴더에 서브 폴더가 없음을 업데이트 한다.
				if (sdoc.get("parent_folder_key").equals("root")) {
					//상위 폴더가 드라이브일 경우 drive collection에서 값을 찾아 서브 폴더가 존재함을 업데이트 해준다.		
					if (!ffUtil.check_sub_folder_exist(drive_key, folder_key, depts, email)) {
						//하위에 폴더가 없다고 판단된 경우
						MongoCollection<Document> col2 = channelInfo.getCollection("driver");
						Document query2 = new Document();
						query2.put("_id", new ObjectId(sdoc.get("drive_key").toString()));
						Document se = new Document();
						Document data = new Document();
						data.put("subfolder", "F");
						se.put("$set", data);
						UpdateResult up = col2.updateOne(query2, se);
					}				
				}else {
					if (!ffUtil.check_sub_folder_exist(drive_key, folder_key, depts, email)) {
						//parent_folder_key를 다시 찾아 서브폴더가 존재함을 업데이트 해 준다.
						Document query2 = new Document();
						query2.put("_id", new ObjectId(sdoc.get("parent_folder_key").toString()));
						Document se = new Document();
						Document data = new Document();
						data.put("subfolder", "F");
						se.put("$set", data);
						UpdateResult up = col.updateOne(query2, se);
					}					
				}		
			}			
		}catch(Exception e){
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}		
		return ResInfo.success();
	}
	
	public Object load_folder(Map<String, Object> requestData) {
		try{
			MongoCollection<Document> col = channelInfo.getCollection("folder");							
			Document query = new Document();
			query.put("_id", new ObjectId(requestData.get("id").toString()));			
			Document sdoc = col.find(query).first();			
			if (sdoc != null){
				Map<String, Object> rdoc = DocumentConverter.toCleanMap(sdoc);
				return ResInfo.success(rdoc);
			}else {
				return ResInfo.error("don't exist doc");
			}
			
		}catch(Exception e){
			e.printStackTrace();
			return ResInfo.error("error");
		}
	}
	
	public Object exit_list(Map<String, Object> requestData) {
		try{
			MongoCollection<Document> col = null;			
			String ty = requestData.get("ty").toString();
			String email = requestData.get("email").toString();						
			if (ty.equals("1")){
				col = channelInfo.getCollection("driver");
			}else if (ty.equals("2")){				
				col = channelInfo.getCollection("channel");
			}			
			Document query = new Document();
			List<String> llk2 = new ArrayList<>();
			llk2.add(email);		
			query.put("exit_user", new Document("$in", llk2));			
			FindIterable<Document> docs = col.find(query).sort(Sorts.ascending("ch_name"));
			List<Map<String, Object>> ar = new ArrayList<>();
			docs.into(ar);
			return ResInfo.success(ar);			
		}catch(Exception e){
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	public Object office_create(Map<String, Object> requestData) {
		try {
			System.out.println(requestData);
			System.out.println(requestData.get("owner").toString());
			Map<String, Object> sowner = (Map<String, Object>) requestData.get("owner");
			Document owner = new Document(sowner);
			String email = requestData.get("ky").toString();
			String drive_code = requestData.get("drive_code").toString();
			String drive_name = requestData.get("drive_name").toString();
			String folder_code = requestData.get("folder_code").toString();
			String folder_name = requestData.get("folder_name").toString();
			String GMT = Utils.GMTDate();
			String fserver = requestData.get("fserver").toString();
			String filename = requestData.get("filename").toString();
			String file_type = requestData.get("file_type").toString();
			String dtype = requestData.get("dtype").toString();

            Random rnd = new Random();
  			String randomStr = RandomStringUtils.randomAlphanumeric(15).toUpperCase();
  			String key = Utils.curDay8() + "_" + randomStr;
			
  			String dir = appConfig.getFileDownloadPath();
  			String fpath = dir + "/" + email + "/" +  folder_code + "/" + key;
  			
  			String md5 = "office_" + key;
			
			MongoCollection<Document> col = folderdata.getCollection("data");
			MongoCollection<Document> col_history = folderdata.getCollection("history");

			//신규 문서를 db에 추가한다.	
			Document doc = new Document();
			doc.append("owner", owner);
			doc.append("email", email);
			doc.append("ky", email);
			doc.append("drive_code", drive_code);
			doc.append("drive_name", drive_name);
			doc.append("folder_code", folder_code);
			doc.append("folder_name", folder_name);
			doc.append("GMT", GMT);
			doc.append("fserver", fserver);
			doc.append("filename", filename);
			doc.append("file_type", file_type);
			doc.append("dtype", dtype);
			doc.append("fpath", fpath);
			doc.append("md5", md5);
			doc.append("type", "file");
			doc.append("file_size", 0);
			doc.append("upload_path", key);
			
			//history 저장하기 
//			String url = "https://one.kmslab.com/FDownload_Office.do?id="+key+"&ty=1&ky="+email + "&ver=" +cd.curDay8() + "&category=files";
//			Document history = new Document();
//			history.append("key", key);
//			history.append("url", url);
//			history.append("dockey", key);
//			history.append("version", 1);
//			col_history.insertOne(history);
			///////////////////////////////////////////			
			//서버의 기본 템플릿 파일을 해당 폴더로 옮긴다.
			File f = new File(fpath);
			if (!f.exists()) {
				f.mkdirs();
			}
			
            String sourcePath = dir + "/basedocs/";
            if (dtype.equals("ppt")) {
            	sourcePath = sourcePath + "base.pptx";
            }else if (dtype.equals("word")) {
            	sourcePath = sourcePath + "base.docx";
            }else if (dtype.equals("excel")) {
            	sourcePath = sourcePath + "base.xlsx";
            }else if (dtype.equals("pdf")) {
            	sourcePath = sourcePath + "base.pdf";
            }
            String targetPath = fpath + "/" + md5 + "." + file_type;
            
            System.out.println("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
            System.out.println("sourcePath : " + sourcePath);
            System.out.println("targetPath : " + targetPath);
			FileUtils.copyFile(new File(sourcePath), new File(targetPath));
            System.out.println("target file careted : " + targetPath);
            System.out.println("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
            
            File sf = new File(sourcePath);
            if (sf.exists() && sf.isFile()) {
            	long size = sf.length();
            	doc.append("file_size", size);
            }
            
            col.insertOne(doc);
            
            ObjectId insertedId = doc.getObjectId("_id");
			String documentId = insertedId.toHexString();
            
			Map<String, Object> item = new HashMap<>();
			item.put("id", documentId);
			return ResInfo.success(item);            
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
}
