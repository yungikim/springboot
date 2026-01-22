package com.kmslab.one.service.doservice;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import com.kmslab.one.config.AppConfig;
import com.kmslab.one.config.WriteLog;
import com.kmslab.one.service.ResInfo;
import com.mongodb.client.MongoCollection;

@Component
public class Search_file_download_path {
	
	private final MongoTemplate todo;
	private final MongoTemplate channel_data;
	private final MongoTemplate userdb;
	private final MongoTemplate folderdata;
	private final MongoTemplate channel_favorite;
	
	@Autowired
	private AppConfig appConfig;
	
	@Autowired
	private WriteLog writeLog;
	
	public Search_file_download_path(
			@Qualifier("TODO") MongoTemplate todo,
			@Qualifier("channel_data") MongoTemplate channel_data,
			@Qualifier("userdb") MongoTemplate userdb,
			@Qualifier("folderdata") MongoTemplate folderdata,
			@Qualifier("channel_favorite") MongoTemplate channel_favorite
			) {		
		this.todo = todo;
		this.channel_data = channel_data;
		this.userdb = userdb;
		this.folderdata = folderdata;
		this.channel_favorite = channel_favorite;
	}
	
	
	public Object search_file_download_path(String id, String ty, String md5, String ky){
		
		MongoCollection<Document> col = null;
		Map<String, Object> rx = new HashMap<>();
		
		String dpath = "";
		String dir = appConfig.getFileDownloadPath();		
		try{
			
			if (ty.equals("todo")) {
				col = todo.getCollection("data");				
				Document query = new Document();
				query.put("_id", new ObjectId(id));
				Document sdoc = col.find(query).first();
				Document doc = col.find(query).first();				
				if (doc != null) {
					Document xdoc = new Document();
					List<Document> atts = (List<Document>) sdoc.get("file");					
					for (int i = 0 ; i < atts.size(); i++){
						xdoc = atts.get(i);						
						if (xdoc.get("md5").toString().equals(md5)){
							break;
						}
					}	
					rx.put("filename", xdoc.getString("filename"));	
					dpath = dir + "/todo/" + id + "/" + xdoc.getString("md5") + "." + xdoc.getString("file_type");					
				}else {
					System.out.println("검색 결과가 없습니다.");
				}
			}else if (ty.equals("reply")) {
				col = channel_data.getCollection("data");
				String[] sp = id.split("_");				
				String rpath = id;
				if (sp.length > 2) {
					rpath = sp[1] + "_" + sp[2];
				}			
				String pid = sp[0];
				Document query = new Document();
				query.put("_id", new ObjectId(pid));
				String ow = "";
				String channel_data_id = "";
				String upload_path = "";				
				Document kdoc = col.find(query).first();			
				if (kdoc != null){				
					List<Document> file_infos = new ArrayList<Document>();			
					List<Document> list = kdoc.getList("reply", Document.class);	
					Document owner = (Document) kdoc.get("owner");				
					for (int k = 0 ; k < list.size(); k++) {
						if (list.get(k).getString("rid").toString().equals(id)) {						
							ow = owner.getString("ky");
							channel_data_id = list.get(k).getString("channel_data_id");
							upload_path = list.get(k).getString("upload_path");
							
							if (list.get(k).containsKey("file_infos")) {
								file_infos = (List<Document>) list.get(k).get("file_infos");
								for (Document xdoc : file_infos) {
									if (xdoc.get("md5").toString().equals(md5)){
										rx.put("filename", xdoc.getString("filename"));
										dpath = dir + "/" + ow + "/" + upload_path + "/reply/" + rpath + "/" + xdoc.getString("md5") + "." + xdoc.getString("file_type");
									}
								}
							}
						}
					}	
					MongoCollection<Document> col2 = userdb.getCollection("user_info");
					Document xp = new Document();
					xp.put("ky", ky);
					Document user = col2.find(xp).first();
					if (user != null) {
						kdoc.put("oid", channel_data_id);
						kdoc.put("rid", rpath);
						kdoc.put("actor", user);
						kdoc.put("action", "reply");									
						writeLog.write_log(kdoc);
					}					
				}
			}else if (ty.equals("chat")) {
				String chpath = appConfig.getChatroomPath();
				dpath = chpath + "/" + id + "/" + md5;
		
			}else {
				//Box에서 파일 다운로드 할때				
				MongoCollection<Document> col2 = userdb.getCollection("user_info");
				
				if (ty.equals("1")){
					//드라이브 파일을 다운로드 한다.
					col = folderdata.getCollection("data");			
				}else if (ty.equals("2")){
					//채널 파일을 다운로드 한다.
					col = channel_data.getCollection("data");			
				}else if (ty.equals("3")){
					//즐겨찾기 파일 다운로드 한다.
					col = channel_favorite.getCollection("list");
				}				
				Document query = new Document();
				query.put("_id", new ObjectId(id));
				Document sdoc = col.find(query).first();			
				if (sdoc != null){
					String tp = "";
					if (ty.equals("1")){
						//드라이브 파일을 다운로드 한다.
						rx.put("filename", sdoc.getString("filename"));
						dpath = sdoc.getString("fpath") + "/" + sdoc.getString("md5") + "." + sdoc.getString("file_type");
						tp = "drive_file_download";
					}else if (ty.equals("2")){
						//채널 파일을 다운로드 한다.
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
						rx.put("filename", xdoc.getString("filename"));
						dpath = dir + "/" + sdoc.getString("ky") + "/" + sdoc.getString("upload_path") + "/" + xdoc.getString("md5") + "." + xdoc.getString("file_type");
						tp = "channel_file_download";
						sdoc.put("filename", xdoc.getString("filename"));
						
					}else if (ty.equals("3")){
						//즐겨찾기 파일 다운로드 한다.
						rx.put("filename",  sdoc.getString("filename"));
						dpath = dir + "/favorite/" + sdoc.getString("email") + "/" + sdoc.getString("upload_path") + "/" + sdoc.getString("md5") + "." + sdoc.getString("file_type");
						tp = "favorite_file_download";
					}					
					Document xp = new Document();
					xp.put("ky", ky);
					Document user = col2.find(xp).first();	
					if (user != null) {
						sdoc.put("oid", id);
						sdoc.put("actor", user);
						sdoc.put("action", tp);			
						writeLog.write_log(sdoc);
					}
				}
			}
			rx.put("fullpath", dpath);
			return ResInfo.success(rx);

		}catch(Exception e){
			e.printStackTrace();
			return ResInfo.error("ERROR");
		}
	}
}
