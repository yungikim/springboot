package com.kmslab.one.service.channel;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import org.apache.commons.io.FileUtils;
import org.bson.Document;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.kmslab.one.component.WriteLog;
import com.kmslab.one.config.AppConfig;
import com.kmslab.one.service.ResInfo;
import com.kmslab.one.util.DocumentConverter;
import com.kmslab.one.util.Utils;
import com.mongodb.client.AggregateIterable;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Projections;
import com.mongodb.client.model.Sorts;
import com.mongodb.client.result.DeleteResult;
import com.mongodb.client.result.UpdateResult;

@Service
public class ChannelService {
	private final MongoTemplate channelInfo;
	private final MongoTemplate todo;
	private final MongoTemplate channel_data;
	private final MongoTemplate channel_favorite;
	private final MongoTemplate notice;
	private final MongoTemplate todo_folder;
	private final MongoTemplate userdb;
	public ChannelService(
			@Qualifier("channelInfo") MongoTemplate channelInfo,
			@Qualifier("TODO") MongoTemplate todo,
			@Qualifier("channel_data") MongoTemplate channel_data,
			@Qualifier("channel_favorite") MongoTemplate channel_favorite,
			@Qualifier("notice") MongoTemplate notice,
			@Qualifier("TODO_Folder") MongoTemplate todo_folder,
			@Qualifier("userdb") MongoTemplate userdb
			) {		
		this.channelInfo = channelInfo;
		this.todo = todo;
		this.channel_data = channel_data;
		this.channel_favorite = channel_favorite;
		this.notice = notice;
		this.todo_folder = todo_folder;
		this.userdb = userdb;
	}
	
	@Autowired
	private WriteLog writeLog;
	
	@Autowired
	private AppConfig appConfig;

	@Value("${searchengine.search_server}")
    private String search_server;
	
	@Value("${searchengine.search_server_port}")
    private int search_server_port;
	
	@Value("${searchengine.search_server_user}")
    private String search_server_user;
	
	@Value("${searchengine.search_server_pw}")
    private String search_server_pw;
	
	public Object channel_info_unread(Map<String, Object> requestData) {
		try{

			MongoCollection<Document> col = channelInfo.getCollection("channel");
			
			
			if (requestData.containsKey("email")) {
				Document query = new Document();	
				//query.append("owner.em", obj.get("email").getAsString());	
				String email = requestData.get("email").toString();
				Pattern regex = Pattern.compile(email, Pattern.CASE_INSENSITIVE);			
			//	query.put("readers", regex);
				
				
				if (requestData.containsKey("depts")) {
					List<String> llk = new ArrayList<>();
					llk.add(email);
					
					String lix = requestData.get("depts").toString();
					if (!lix.equals("")) {
						String[] lists = lix.split("-spl-");
						for (int i = 0 ; i < lists.length; i++) {
							String dept = lists[i];
//							regex = Pattern.compile(dept);
							llk.add(dept);
						}
					}			
					query.put("readers", new Document("$in", llk));
				}else {
					query.put("readers", regex);
				}
				
				//exit_user필드에는 포함되지 않아야 한다.
				List<String> llk2 = new ArrayList<>();
				llk2.add(email);		
				Document query2 = new Document();
				query2.put("exit_user", new Document("$nin", llk2));
				
				Document query3 = new Document();
				query3.put("type", new Document("$ne", "folder"));
							
				List<Document> sdoc = new ArrayList<Document>();
				sdoc.add(query);
				sdoc.add(query2);
				
				sdoc.add(query3);
				
				Document qq = new Document();
				qq.append("$and", sdoc);
				
				
				Document sort = new Document();
				sort.append("ch_share",1);
				sort.append("ch_name", 1);
			
				String bb = "F";
				FindIterable<Document> list = col.find(qq).sort(sort);
				boolean exist = false;
				int ucnt = 0;
				for (Document doc : list){
															
					//System.out.println(doc);
					//폴더가 아닌 채널만 체크해야 한다.
					if (doc.containsKey("lastupdate")) {
						String utime = doc.get("lastupdate").toString();
						if (doc.containsKey("read_time")) {
							List<Document> ln = (List<Document>) doc.get("read_time");
							for (int k = 0 ; k < ln.size(); k++) {							
								Document xx = ln.get(k);
								//System.out.println("xx : " + xx);
								if (xx.get("email") != null) {
									
									//System.out.println("email : " + xx.get("email").toString());
									
									if (email.equals(xx.get("email").toString())) {								
										String time = xx.get("time").toString();	
										if (Long.parseLong(utime) > Long.parseLong(time)) {
											exist = true;
											bb = "T";
											
											ucnt ++;
											//break;
										}
									}
								}
								
							}
						}
					}						
				}		
				
				Map<String, Object> item = new HashMap<>();
				item.put("result", bb);
				item.put("ucnt", ucnt);
				
				return ResInfo.success(item);
			}else {
				return ResInfo.error("No user parameter");
			}
			
		}catch(Exception e){
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	public Object channel_info_list(Map<String, Object> requestData) {
		List<Map<String, Object>> ar = new ArrayList<>();
		
		try{
			MongoCollection<Document> col = channelInfo.getCollection("channel");			
			if (requestData.containsKey("email")) {				
				Document query = new Document();	
				String email = requestData.get("email").toString();
				Pattern regex = Pattern.compile(email, Pattern.CASE_INSENSITIVE);					
				if (requestData.containsKey("depts")) {
					List<String> llk = new ArrayList<>();
					llk.add(email);					
					String lix = requestData.get("depts").toString();
					if (!lix.equals("")) {
						String[] lists = lix.split("-spl-");
						for (int i = 0 ; i < lists.length; i++) {
							String dept = lists[i];
							llk.add(dept);
						}
					}			
					query.put("readers", new Document("$in", llk));
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
				sort.append("ch_name", 1);			
				
				FindIterable<Document> list = col.find(qq).sort(sort);				
				List<Document> items = new ArrayList<Document>();		
				List<Document> folders = new ArrayList<Document>();				
				for (Document doc : list){						
					Document rt = new Document();
					String rtime = "";
					if (doc.containsKey("read_time")) {
						items = doc.getList("read_time", Document.class);						
						for (Document item : items) {	
							if (item.get("email") != null) {
								if (email.equals(item.get("email").toString())) {
									rtime = item.get("time").toString();
									break;
								}
							}					
						}
					}					
					//2024.09.26 새로 만들어서 readtime이 아예 없는 경우 무조건 빨콩 표시를 위해 시간 추가
					if(rtime.equals("")) {
						rtime = "20010101000000";
					}					
					String folderkey = "";
					if (doc.containsKey("folder_info")) {
						folders = doc.getList("folder_info", Document.class);
						for (Document folder : folders) {
							if (folder.get("email") != null) {
								if (email.equals(folder.get("email").toString())) {
									folderkey = folder.get("fk").toString();
									doc.put("folderkey", folderkey);
									break;
								}
							}
						}
					}					
					doc.append("read_time", rtime);	
					ar.add(DocumentConverter.toCleanMap(doc));
				}
			}		
		}catch(Exception e){
			e.printStackTrace();
		}
		
		return ResInfo.success(ar);
	}
	
	public Object search_info(Map<String, Object> requestData) {
		try{
			String gubun = requestData.get("type").toString();
			String ch_code = requestData.get("ch_code").toString();
			MongoCollection<Document> col = null;
			
			if (gubun.equals("D")){
				col = channelInfo.getCollection("driver");
			}else{
				col = channelInfo.getCollection("channel");
			}
			
			Document query = new Document();
			query.append("ch_code", ch_code);
			
			Document doc = col.find(query).first();
			
			if (doc != null){
				return ResInfo.success(DocumentConverter.toCleanMap(doc));
			}else{
				return ResInfo.error("ERROR");
			}			 
		}catch(Exception e){
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	public Object channel_info_unread_info(Map<String, Object> requestData) {
		//읽지 않은 업무방 정보 리스트를 내려주는 함수
		Map<String, Object> ar = new HashMap<>();		
		try{
			MongoCollection<Document> col = channelInfo.getCollection("channel");
			String ky = requestData.get("email").toString();
			List<String> llk = new ArrayList<>();			
			llk.add(ky);			
			String lix = requestData.get("depts").toString();
			if (!lix.equals("")) {
				String[] lists = lix.split("\\^");
				for (int i = 0 ; i < lists.length; i++) {
					String dept = lists[i];
					llk.add(dept);
				}
			}	
			String llx = lix + "^" + ky;
			String[] lx = llx.split("\\^");			
			Bson query = Filters.and(
					 Filters.eq("ch_share", "Y"),
					 Filters.in("readers", lx),
					 Filters.not(new Document("exit_user", ky)),
					 Filters.or(
							 new Document("$expr", new Document("$lt", Arrays.asList(
					                    new Document("$arrayElemAt", Arrays.asList(
					                        new Document("$map", new Document()
					                            .append("input", new Document("$filter", new Document()
					                                .append("input", "$read_time")
					                                .append("as", "item")
					                                .append("cond", new Document("$eq", Arrays.asList("$$item.email", ky)))
					                            ))
					                            .append("as", "filtered")
					                            .append("in", "$$filtered.time")
					                        ),
					                        0
					                    )),
					                    "$lastupdate"
					                ))),
							 Filters.not(Filters.elemMatch("read_time", Filters.eq("email", ky)))						 
						)				
		            );			 
			List<Map<String, Object>> doclist = new ArrayList<>();
			JsonArray list = new JsonArray();
			FindIterable<Document> results = col.find(query);
			for (Document sdoc : results) {
				sdoc.remove("readers");
				sdoc.remove("opt_reg_list");
				sdoc.remove("opt_del");
				sdoc.remove("opt_copy");
				sdoc.remove("opt_reply");
				sdoc.remove("plugin");
				sdoc.remove("read_time");
				sdoc.remove("favorite");
				sdoc.remove("folder_info");				
				doclist.add(DocumentConverter.toCleanMap(sdoc));
			}		
			ar.put("result", doclist);
			return ResInfo.success(ar);
		}catch(Exception e){
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	public Object channel_main_year_info(Map<String, Object> requestData) {
		try {
			MongoCollection<Document> col = todo.getCollection("data");			
			Document query = new Document();
			String ky = requestData.get("ky").toString();
			String year = requestData.get("year").toString();
				
			Map<String, Object> jx = new HashMap<>();

			//내가 년도별로 처리한 건수 계산한다. /////////////////////////////////////////////			
			AggregateIterable<Document> result = col.aggregate(Arrays.asList(
					new Document("$match", new Document("$or", Arrays.asList(
							new Document("asignee.ky", ky),
							new Document("checklist.asign.ky", ky)
							)).append("startdate",  new Document("$exists", true)).append("startdate", new Document("$ne", "")).append("startdate", new Document("$regex", "^"+year))),
					new Document("$group", new Document("_id", new Document("month", new Document("$substr", Arrays.asList("$startdate", 5, 2)))).append("count", new Document("$sum",1))),
					new Document("$sort", new Document("_id.month", 1))
					));
			List<Map<String, Object>> jx1 = new ArrayList<>();
			for (Document doc : result) {
				String month = doc.get("_id", Document.class).getString("month");
				int count = doc.getInteger("count");
				Map<String, Object> px1 = new HashMap<>();
				px1.put("month", month);
				px1.put("count", count);
				jx1.add(px1);
			}		
			jx.put("p1", jx1);			
			///////////////////////////////////////////////////////////////////////////			
			//내가 년도별로 지시한 건수 계산한다. /////////////////////////////////////////////	
			AggregateIterable<Document> result2 = col.aggregate(Arrays.asList(
					new Document("$match", new Document("owner.ky", ky).append("startdate",  new Document("$exists", true)).append("startdate", new Document("$ne", "")).append("startdate",  new Document("$regex", "^"+year))),
					new Document("$group", new Document("_id", new Document("month", new Document("$substr", Arrays.asList("$startdate",5,2)))).append("count", new Document("$sum",1))),
					new Document("$sort", new Document("_id.month", 1))					
					));		
			List<Map<String, Object>> jx2 = new ArrayList<>();
			for (Document doc : result2) {
				String month = doc.get("_id", Document.class).getString("month");
				int count = doc.getInteger("count");
				Map<String, Object> px2 = new HashMap<>();
				px2.put("month", month);
				px2.put("count", count);
				jx2.add(px2);
			}
			jx.put("p2", jx2);			
			///////////////////////////////////////////////////////////////////////////			
			//우선 순위 별 년별 건수 계산한다. /////////////////////////////////////////////	
			AggregateIterable<Document> result3 = col.aggregate(Arrays.asList(
					//$match 조건
					new Document("$match", new Document("$and", Arrays.asList(
							new Document("$or", Arrays.asList(
									new Document("asignee.ky", ky),
									new Document("checklist.asign.ky", ky)
									)),
							new Document("startdate", new Document("$exists", true).append("$ne", "")),
							new Document("startdate", new Document("$regex", "^"+year))
							))),
					//$group: priority와 월별로 그룹화
					new Document("$group", new Document("_id", new Document("priority", "$priority"))
							.append("count",  new Document("$sum",1))),
					//$sort: priority와 월별 로 정렬
					new Document("$sort", new Document("_id.priority", 1).append("_id.month", 1))					
					));
			List<Map<String, Object>> jx3 = new ArrayList<>();
			for (Document doc : result3) {
			//	System.out.println(doc);
				Document id = doc.get("_id", Document.class);
				int priority = id.getInteger("priority");
				int count = doc.getInteger("count");
				Map<String, Object> px3 = new HashMap<>();
				px3.put("priority", priority);
				px3.put("conunt", count);
				jx3.add(px3);
				//System.out.println("Priority : " + priority + ", count : " + count);
			}
			jx.put("p3", jx3);
			return ResInfo.success(jx);
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}	
	}
	
	public Object channel_options_read(Map<String, Object> requestData) {
		try {
			MongoCollection<Document> col = channelInfo.getCollection("channel_options");		
			String ch_code = requestData.get("key").toString();
			String em = requestData.get("email").toString();			
			Document query = new Document();
			query.put("email", em);
			query.put("key", ch_code);		
			Document doc = col.find(query).first();
			if (doc != null) {
				//기존에 문서가 없을 경우 추가한다.
				return ResInfo.success(DocumentConverter.toCleanMap(doc));
			}else {
				return ResInfo.error("ERROR");
			}			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	public Object channel_read_update(Map<String, Object> requestData) {
		try {
			MongoCollection<Document> col = channelInfo.getCollection("channel");			
			String em = requestData.get("email").toString();			
			//email 정보게 key값이 들어와서 실제 email정보가 아니다.

			String channel_code = requestData.get("channel_code").toString();				
			Document query = new Document();
			query.put("_id", new ObjectId(channel_code));
			
			///// 마지막에 읽은 시간을 내려 주어야 한다.
			Map<String, Object> rtime = new HashMap<>();
			Document doc = col.find(query).first();
			
			if (doc != null) {
				if (doc.containsKey("read_time")) {
					List<Document> items = doc.getList("read_time", Document.class);							
					for (Document item : items) {	
						if (item.get("email") != null) {
							if (em.equals(item.get("email").toString())) {
								rtime.put("last_read_time", item.get("time").toString());
								break;
							}
						}					
					}
				}
			}
			////////////////////////////////////////////		
			String GMTDate = Utils.GMTDate();		
			Document jx = new Document();
			jx.append("email", em);
			jx.append("time", GMTDate);					
			//기존 정보 제거한다.
			Document pull = new Document();
			pull.put("$pull", new Document("read_time", new Document("email",em)));					
			col.updateOne(query, pull);							
			//신규 정보 추가한다.
			Document data = new Document();
			data.put("read_time", jx);
			Document se = new Document();
			se.put("$push", data);		
			col.updateOne(query, se);
			
			Map<String, Object> item = new HashMap<>();
			item.put("data", rtime);
			item.put("GMTDate", GMTDate);
			return ResInfo.success(item);			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	public Object channel_list(Map<String, Object> requestData) {
		List<Map<String, Object>> ar = new ArrayList<>();		
		try{
			MongoCollection<Document> col = channel_data.getCollection("data");			
			String channel_code = requestData.get("channel_code").toString();			
			if (channel_code.equals("")) {
				Map<String, Object> tt = new HashMap<>();
				tt.put("totalcount", 0);
				tt.put("data", ar);
				return ResInfo.success(tt);
			}			
			String email = requestData.get("email").toString();		
			String channel_type = requestData.get("query_type").toString();
			int start = Integer.parseInt(requestData.get("start").toString());
			int perpage = Integer.parseInt(requestData.get("perpage").toString());
			String q_str = requestData.get("q_str").toString();
			String type = requestData.get("type").toString();   //type : 1 전체 , type : 2이면 파일만
			String sort = "1";
			if (requestData.containsKey("sort")) {
				sort = requestData.get("sort").toString();
			}			
			long unread_count = 0;						
			Document query = new Document();			
			List<Document> doc = new ArrayList<Document>();
			List<Document> options = new ArrayList<Document>();			
			if (channel_type.equals("mycontent")){
				String[] ch_list = channel_code.split("-spl-");			
				List<String> list = new ArrayList<String>();				
				if (!channel_code.equals("")){
					for (int i = 0 ; i < ch_list.length; i++){
						String ch = ch_list[i].toString();
						list.add(ch);
					}				
					Document q1 = new Document();
					q1.put("channel_code", new Document("$in", list));					
					Document q2 = new Document();
					q2.put("ky", email);
					doc.add(q1);
					doc.add(q2);
				}else{
					return ResInfo.error("ERROR");
				}				
			}else if (channel_type.equals("sharecontent")){				
				String[] ch_list = channel_code.split("-spl-");			
				List<String> list = new ArrayList<String>();				
				if (!channel_code.equals("")){
					for (int i = 0 ; i < ch_list.length; i++){
						String ch = ch_list[i].toString();
						list.add(ch);
					}								
					Document q1 = new Document();
					q1.put("channel_code", new Document("$in", list));					
					Document q2 = new Document();
					q2.put("ky", new Document("$ne", email));				
					doc.add(q1);
					doc.add(q2);				
				}else{
					return ResInfo.error("ERROR");
				}			
			}else if (channel_type.equals("allcontent")){
				String[] ch_list = channel_code.split("-spl-");			
				List<String> list = new ArrayList<String>();				
				if (!channel_code.equals("")){
					for (int i = 0 ; i < ch_list.length; i++){
						String ch = ch_list[i].toString();
						list.add(ch);
					}				
					Document q1 = new Document();
					q1.put("channel_code", new Document("$in", list));
					doc.add(q1);				
				}else{
					return ResInfo.error("ERROR");
				}				
			}else if (channel_type.equals("mention")) {	
				//특정 채널을 선택한 경우				
				Document q1 = new Document();
				q1.put("channel_code", channel_code);				
				doc.add(q1);			
				List<Document> orquery = new ArrayList<Document>();				
				Document q2 = new Document();
				q2.put("mention.id", email);				
				Document q3 = new Document();
				q3.put("reply.mention.id", email);				
				orquery.add(q2);
				orquery.add(q3);				
				Document ssp = new Document();
				ssp.append("$or", orquery);				
				doc.add(ssp);				
			}else if (channel_type.equals("allmention")) {				
				String[] ch_list = channel_code.split("-spl-");			
				List<String> list = new ArrayList<String>();				
				if (!channel_code.equals("")){
					for (int i = 0 ; i < ch_list.length; i++){
						String ch = ch_list[i].toString();
						list.add(ch);
					}						
					Document q1 = new Document();
					q1.put("channel_code", new Document("$in", list));
					doc.add(q1);													
					List<Document> orquery = new ArrayList<Document>();					
					Document q2 = new Document();
					q2.put("mention.id", email);					
					Document q3 = new Document();
					q3.put("reply.mention.id", email);					
					orquery.add(q2);
					orquery.add(q3);					
					Document ssp = new Document();
					ssp.append("$or", orquery);					
					doc.add(ssp);
				}else{
					return ResInfo.error("ERROE");
				}			
			}else{
				//특정 채널을 선택한 경우				
				Document q1 = new Document();
				q1.put("channel_code", channel_code);				
				doc.add(q1);			
				////////////////////////////////// 읽지 않은 건수 계산하기 //////////////////////////////////
				String read_time = "";
				if (requestData.containsKey("read_time")) {
					read_time = requestData.get("read_time").toString();					
					List<Document> andquery = new ArrayList<Document>();
					Document query2 = new Document();
					query2.put("channel_code", channel_code);
					andquery.add(query2);				
					Document rr1 = new Document();
					rr1.put("GMT2", new Document("$gte", read_time));
					andquery.add(rr1);				
					Document qq = new Document();
					qq.append("$and", andquery);							
					unread_count = col.countDocuments(qq);
				}			
				///////////////////////////////////////////////////////////////////////////////////////				
			}		
			if (type.equals("2")){				
				col = channel_data.getCollection("files");				
				//파일만 검색하는 경우
				if (!q_str.equals("")){	
					Document tdoc = new Document();					
					List<Document> doc2 = new ArrayList<Document>();					
					Document q3 = new Document();
					Pattern regex2 = Pattern.compile(q_str, Pattern.CASE_INSENSITIVE);			
					q3.put("info.filename", regex2);
					doc2.add(q3);									
					tdoc.append("$or", doc2);
					doc.add(tdoc);					
				}			
				String dtype = requestData.get("dtype").toString();   //ppt, pptx : ppx , jpg, png, gif : image 필터링을 위한 값
				if (!dtype.equals("")){
					Document q3 = new Document();		
					q3.put("info.dtype", dtype);
					doc.add(q3);
				}	
			}else {		
				if (!q_str.equals("")){	
					Document tdoc = new Document();
					List<Document> doc2 = new ArrayList<Document>();
					Document q2 = new Document();
					Pattern regex = Pattern.compile(q_str, Pattern.CASE_INSENSITIVE);			
					q2.put("content", regex);
					doc2.add(q2);					
					Document q3 = new Document();		
					q3.put("info.filename", regex);
					doc2.add(q3);
					
					Document q4 = new Document();		
					q4.put("reply.content", regex);
					doc2.add(q4);
					
					Document q5 = new Document();		
					q5.put("title", regex);
					doc2.add(q5);
					
					Document q6 = new Document();		
					q6.put("owner.nm", regex);
					doc2.add(q6);						
						
					Document q7 = new Document();			
					q7.put("owner.dp", regex);
					doc2.add(q7);
					
					tdoc.append("$or", doc2);
					doc.add(tdoc);					
				}				
				String dtype = requestData.get("dtype").toString();   //ppt, pptx : ppx , jpg, png, gif : image 필터링을 위한 값
				if (!dtype.equals("")){
					Document q3 = new Document();		
					q3.put("info.dtype", dtype);
					doc.add(q3);
				}
			}			
			query.append("$and", doc);
					
			long totalcount = 0;
			if (type.equals("2")){				
				totalcount = col.countDocuments(query);	
			}			
			Map<String, Object> tt = new HashMap<>();
			tt.put("totalcount", totalcount);
						
			List<String> arx = new ArrayList<>();
			arx.add("info.content");
			arx.add("info.meta");
			
			FindIterable<Document> list = null;
			if (sort.equals("2")) {
				list = col.find(query).projection(Projections.exclude(arx)).limit(perpage).skip(start).sort(Sorts.descending("GMT2"));
			}else {
				list = col.find(query).projection(Projections.exclude(arx)).limit(perpage).skip(start).sort(Sorts.descending("GMT"));
			}
									
			for (Document xdoc : list){
				ar.add(DocumentConverter.toCleanMap(xdoc));
			}			
			
			//채널의 정보를 같이 내려 준다. 채널의 권한을 체크하기 위해서
			MongoCollection<Document> channel_info_col = channelInfo.getCollection("channel");
			Document channel_info_doc = channel_info_col.find(new Document("ch_code", channel_code)).first();						
			
			tt.put("data", ar);
			tt.put("unread_count", String.valueOf(unread_count));
			if (channel_info_doc != null) {
				tt.put("data2", DocumentConverter.toCleanMap(channel_info_doc));		
			}			
			return ResInfo.success(tt);
			
		}catch(Exception e){
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	public Object list_channel_favorite(Map<String, Object> requestData) {	
		try{			
			String channel_code = requestData.get("channel_code").toString();
			String email = requestData.get("email").toString();			
			String channel_type = requestData.get("query_type").toString();
			int start = Integer.parseInt(requestData.get("start").toString());
			int perpage = Integer.parseInt(requestData.get("perpage").toString());
			String q_str = requestData.get("q_str").toString();
			String type = requestData.get("type").toString();   //type : 1 전체 , type : 2이면 파일만 리턴			
			
			Document query = new Document();			
			List<Document> doc = new ArrayList<Document>();			

			MongoCollection<Document> col = channel_favorite.getCollection("list");
							
			Document q1 = new Document();
			q1.put("email", email);
			doc.add(q1);				
				
			if (!q_str.equals("")){	
				Document tdoc = new Document();
				List<Document> doc2 = new ArrayList<Document>();				
				Document q3 = new Document();
				Pattern regex2 = Pattern.compile(q_str, Pattern.CASE_INSENSITIVE);			
				q3.put("filename", regex2);
				doc2.add(q3);				
				tdoc.append("$or", doc2);
				doc.add(tdoc);				
			}			
			
			String dtype = requestData.get("dtype").toString();   //ppt, pptx : ppx , jpg, png, gif : image 필터링을 위한 값
			if (!dtype.equals("")){
				Document q3 = new Document();		
				q3.put("dtype", dtype);
				doc.add(q3);
			}								
			query.append("$and", doc);						
			//채널과 드라이브를 분리해서 type 1 이면 드라이브 , 2명 채널 즐겨찾기로 구분한다.
			//kmslab용과 아모레용을 같이 사용하기 위해서 type : 1은 kmslab에서 사용한 통합 즐겨찾기 보기이고 type : channel or drive는 아모레형 분리에서 호출하는 형식이다.
			if (!type.equals("1")) {
				query.append("file_source", type);
			}					
			long totalcount = col.countDocuments(query);
			Map<String, Object> tt = new HashMap<>();
			tt.put("totalcount", totalcount);											
			List<Map<String, Object>> ar = new ArrayList<>();
			FindIterable<Document> list = col.find(query).limit(perpage).skip(start).sort(Sorts.descending("GMT"));
			for (Document xdoc : list){
				ar.add(DocumentConverter.toCleanMap(xdoc));
			}
			tt.put("data", ar);
			return ResInfo.success(tt);			
		}catch(Exception e){
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	public Object wlog_box(Map<String, Object> requestData) {
		try {
			Document doc = new Document(requestData);
			writeLog.write_log(doc);
			return ResInfo.success();
		}catch(Exception e) {
			return ResInfo.error(e.getMessage());
		}	
	}
	
	public Object read_notice(Map<String, Object> requestData) {
		try {
			MongoCollection<Document> col = notice.getCollection("data");	
			Document squery = new Document();
			String key = requestData.get("key").toString();	
			squery.put("key", key);
			
			Document user_select = col.find(squery).sort(new Document("GMT", -1)).first();

			if (user_select != null && user_select.get("use").equals("T")) {
				Map<String, Object> dx = new HashMap<>();
				dx.put("response", DocumentConverter.toCleanMap(user_select));
				return ResInfo.success(dx);
			}else {
				return ResInfo.error("NO");
			}
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}		
	}
	
	public Object create_channel(Map<String, Object> requestData) {
		String res = "";
		Map<String, Object> item = new HashMap<>();
		try{
			MongoCollection<Document> col = channelInfo.getCollection("channel");			
			Document doc = new Document(requestData);	
			if (requestData.get("ch_code") != null){
			//	System.out.println("업데이트인 경우");
				//업데이트인 경우
				Document query = new Document();
				query.put("_id", new ObjectId(requestData.get("ch_code").toString()));				
				Document sdoc = col.find(query).first();
				if (sdoc != null) {					
					String ch_name = sdoc.get("ch_name").toString();					
					//채널에서 나간 사람이 다시 초대될 경우 나간 목록에서 제거해 줘야 한다.
					//멤버로 들어온 정보에서 메일주소를 확인해서 나간 목록에 있는지 체크한다.
					//JsonArray lp = obj.get("member").getAsJsonArray();
					List<Map<String, Object>> lp = (List<Map<String, Object>>) requestData.get("member");
					for (int i = 0 ; i < lp.size(); i++) {
						Map<String, Object> kk = lp.get(i);
						if (kk.containsKey("ky")) {
							String em = kk.get("ky").toString();									
							Document data = new Document();
							data.put("$pull", new Document("exit_user", em));
							UpdateResult rx = col.updateOne(query, data);
						}
					}
					/////////////////////////////////////////////////////////					
					Document se = new Document();
					se.append("$set", doc);	
					UpdateResult rx = col.updateOne(query, se);
					
					//채널명이 변경된 경우 기존 채널 데이터에 추가된 데이터의 채널명을 변경해 줘야 한다.
					String new_channel_name = requestData.get("ch_name").toString();
					if (!new_channel_name.equals(ch_name)) {
						MongoCollection<Document> ccl = channel_data.getCollection("data");						
						String channe_code = sdoc.get("ch_code").toString();
						Document q2 = new Document();
						q2.put("channel_code", channe_code);						
						Document udoc = new Document();
						udoc.put("channel_name", new_channel_name);						
						Document ss = new Document();
						ss.put("$set", udoc);						
						UpdateResult xx = ccl.updateMany(q2, ss);					
					}					
					
					//plugin으로 설정된 Todo에 멤버를 업데이트 해줘야 한다. ///////////////////////////
					Document ndoc = col.find(query).first();
					MongoCollection<Document> col2 = todo_folder.getCollection("folder");					
					List<Document> member_info = (List<Document>) doc.get("member");						
					List<String> readers_info = (List<String>) doc.get("readers");										
					Map<String, Object> sowner = (Map<String, Object>) requestData.get("owner");
					Document owner = new Document(sowner); 					
					Document nnc = new Document();
					nnc.put("readers",  readers_info);
					nnc.put("member", member_info);
					nnc.put("owner", owner);
					nnc.put("name", new_channel_name);				
					Document sep = new Document();
					sep.put("$set", nnc);					
					Document qy = new Document();
					qy.put("_id", new ObjectId(requestData.get("ch_code").toString()));					
					col2.updateOne(qy, sep);
					/////////////////////////////////////////////////////////////////////////						
				}				
			}else{		
				//최초 등록인 경우
				col.insertOne(doc);				
				String id = doc.get("_id").toString();				
				Document data = new Document();
				data.put("ch_code", id);
				data.put("lastupdate", Utils.GMTDate());				
				Document query = new Document();
				query.put("_id", new ObjectId(id));				
				Document se = new Document();
				se.put("$set", data);				
				col.updateOne(query, se);				
				res = id;
			}				
		}catch(Exception e){	
			e.printStackTrace();			
			ResInfo.error("F");
		}		
		item.put("ch_code", res);
		return ResInfo.success(item);
	}
	
	public Object plugin(Map<String, Object> requestData) {
		try {
			MongoCollection<Document> col = channelInfo.getCollection("channel");			
			String key = requestData.get("id").toString();
			String item = requestData.get("item").toString();
			String ty = requestData.get("ty").toString();			
			//ty : add이면 plugin을 채널에 추가하는 경우 / del이면 삭제하는 경우			
			Document query = new Document();
			query.put("ch_code", key);
			Document sdoc = col.find(query).first();			
			if (sdoc != null) {
				if (ty.equals("add")) {
					Document push = new Document();
					push.put("$push",  new Document("plugin", new Document("list", item)));
					col.updateOne(query, push);
				}else {
					Document pull = new Document();
					pull.put("$pull", new Document("plugin", new Document("list", item)));	
					col.updateOne(query, pull);
				}		
				//TODO를 생성하거나 제거한 경우
				if (item.equals("TO-DO")) {
					MongoCollection<Document> col2 = todo_folder.getCollection("folder");					
					if (ty.equals("add")) {						
						//TODO프로젝트를 생성한다.							
						requestData.remove("id");
						requestData.remove("item");
						requestData.remove("ty");
						requestData.put("sort", 2);
						requestData.put("type", "project");
						requestData.put("opt", "plugin");
						requestData.put("folderkey", "");
						requestData.put("comment", "");
						Document doc = new Document(requestData).append("_id", new ObjectId(key));						
						col2.insertOne(doc);						
					}else {
						//TODO프로젝트를 삭제한다.
						Document qq = new Document();
						qq.put("_id", new ObjectId(key));						
						DeleteResult rrxx = col2.deleteOne(qq);						
					}
				}				
				return ResInfo.success();
			}
			return ResInfo.error("ERROR");
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	public Object channel_delete(Map<String, Object> requestData) {
		try{
			MongoCollection<Document> col = channelInfo.getCollection("channel");			
			String ch_code = requestData.get("ch_code").toString();
			Document query = new Document();	
			query.append("ch_code", ch_code);						
			boolean rr = delete_channel_data_all(ch_code);				
			if (rr){
				//채널 info 데이터를 삭제한다.				
				Document sdoc = col.find(query).first();
				if (sdoc != null){
					Document logdoc = new Document();
					logdoc = sdoc;
					logdoc.put("action", "channel_delete");
					logdoc.put("action_time", Utils.GMTDate());				
					writeLog.write_log(logdoc);				
					col.deleteOne(query);
				}				
			}			
			return ResInfo.success();
			
		}catch(Exception e){
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	private boolean delete_channel_data_all(String ch_code){
		boolean res = false;		
		try{
			MongoCollection<Document> col = channel_data.getCollection("data");						
			Document query = new Document();
			query.append("channel_code", ch_code);			
			//관련된 파일 있는 경우 전체 삭제한다.
			Document doc = col.find(query).first();			
			FindIterable<Document> lists = col.find(query);			
			for (Document sdoc : lists){
				List<Document> list = (List<Document>) sdoc.get("info");				
				String type = sdoc.get("type").toString();				
				if (type.equals("file")){
					//파일 폴더를 삭제한다.
					String uploadpath = sdoc.get("upload_path").toString();
					String email = sdoc.get("ky").toString();		
					String dir = appConfig.getFileDownloadPath();
					String folderPath = dir + "/"+ email +"/"+uploadpath;
					delete_folder(folderPath);
				}			
				col.deleteOne(query);
			}				
			res = true;
		}catch(Exception e){
			e.printStackTrace();
		}		
		return res;
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
	
	public Object move_folder_channel(Map<String, Object> requestData) {
		try {
			MongoCollection<Document> col = channelInfo.getCollection("channel");			
			//수정할 경우 어떤 문서를 수정하는지 key값을 포함해서 보내줘야 하고 update할때 해당 필드는 제거해 줘야 한다.
			String folderkey = requestData.get("folderkey").toString();
			String key = requestData.get("key").toString(); 		
			Document query = new Document();
			query.put("_id", new ObjectId(key));					
			//key로 채널 정보를 가져와서 요청한 사용자가 owner인 경우 원래데로 처리하고 owner가 아닌 경우 folder_info 필드에 이메일과 폴더키를 추가해서 개인화 한다.
			Document sdoc = col.find(query).first();
			if (sdoc != null) {
				Document info = (Document) sdoc.get("owner");					
				String em = info.get("em").toString();			
				String owner_em = em;				
				String call_em = requestData.get("email").toString();				
				if (call_em.equals(owner_em)) {
					Document data = new Document();
					data.put("folderkey", folderkey);
					Document se = new Document();
					se.put("$set", data);								
					UpdateResult rx = col.updateOne(query, se);
				}else {
					// 내가 생성한 채널이 아닌 경우 folder_info값에 별도로 관리한다.					
					Document jx = new Document();
					jx.append("email", call_em);
					jx.append("fk", folderkey);					
					//기존 정보 제거한다.
					Document pull = new Document();
					pull.put("$pull", new Document("folder_info", new Document("email",call_em)));					
					col.updateOne(query, pull);						
					//신규 정보 추가한다.
					Document data = new Document();
					data.put("folder_info", jx);
					Document se = new Document();
					se.put("$push", data);						
					col.updateOne(query, se);				
				}		
			}				
			return ResInfo.success();			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	public Object channel_list_temp(Map<String, Object> requestData) {
		try {
			MongoCollection<Document> col = channel_data.getCollection("temp");					
			String email = requestData.get("email").toString();		
			String key = requestData.get("key").toString();
			
			System.out.println("channel_list_temp : " + email + "/" + key);
			Map<String, Object> dx = new HashMap<>();
			Document query = new Document();
			if (!key.equals("")) {
				//특정 문서를 찾는 경우
				query.put("_id", new ObjectId(key));
				Document doc = col.find(query).first();
				if (doc != null) {					
					dx.put("data", DocumentConverter.toCleanMap(doc));					
				}
			}else {
				//임시 저장 목록 리스트를 찾는 경우				
				query.put("ky", email);			
				long total = 0;
				total = col.countDocuments(query);				
				FindIterable<Document> docs = col.find(query).sort(new Document("GMT", -1));			

				List<Map<String, Object>> ar = new ArrayList<>();
				for (Document doc : docs){
					doc.remove("content");
					ar.add(DocumentConverter.toCleanMap(doc));
				}				
				dx.put("response", ar);
				dx.put("total", total);					
				
			}		
			return ResInfo.success(dx);
			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	public Object send_msg(Map<String, Object> requestData) {
		try{

			MongoCollection<Document> col = channel_data.getCollection("data");	
			MongoCollection<Document> col2 = notice.getCollection("data");					
			Document doc = new Document(requestData);
			String xid = "";			
			String type = requestData.get("edit").toString();	
			String ty = "";
			if (requestData.containsKey("tyx")) {
				ty = requestData.get("tyx").toString();
			}			
			Map<String, Object> xx = new HashMap<>();		
			if (type.equals("T")){
				String id = requestData.get("id").toString();
				Document query = new Document();
				query.put("_id", new ObjectId(id));
				Document sdoc = col.find(query).first();				
				boolean istemp  = false;
				if (sdoc == null) {
					//임시저장 문서에서 찾는다.
					col = channel_data.getCollection("temp");		
					sdoc = col.find(query).first();
					istemp = true;
				}				
				if (sdoc != null){					
					//임시저장 문서를 삭제한다.
					Document se = new Document();
					if (istemp) {
						Document xdoc = sdoc;
						xdoc.remove("_id");
						xdoc.remove("edit");
						xdoc.remove("id");
						xdoc.remove("msg_edit");					
						xdoc.put("main_index", "F");		
						col.insertOne(xdoc);						
						Document qu = new Document();
						String sid = xdoc.get("_id").toString();
						qu.put("_id", new ObjectId(sid));						
						Document pdoc = col.find(qu).first();
						if (pdoc != null) {
							sdoc = pdoc;
						}						
					}else {
						doc.remove("edit");
						doc.remove("id");
						doc.remove("msg_edit");					
						doc.put("main_index", "F");							
						se.put("$set", doc);						
						UpdateResult rx = col.updateOne(query, se);	
					}					
					if (istemp) {
						col.deleteOne(query);
					}				
					xx.put("docinfo", DocumentConverter.toCleanMap(sdoc));
				}else {
				//	System.out.println("문서가 없다.111");
				}
			}else{					
				String msg_edit = requestData.get("msg_edit").toString();				
				if (msg_edit.equals("T")) {	
					String id = requestData.get("id").toString();
					Document query = new Document();
					query.put("_id", new ObjectId(id));
					Document sdoc = col.find(query).first();					
					Document se = new Document();
					doc.remove("edit");
					doc.remove("id");
					doc.remove("msg_edit");					
					doc.put("main_index", "F");					
					se.put("$set", doc);					
					UpdateResult rx = col.updateOne(query, se);						
					xx.put("docinfo", DocumentConverter.toCleanMap(sdoc));
				}else {				
					doc.remove("edit");
					doc.remove("id");
					doc.append("like_count", 0);					
					doc.put("main_index", "F");		
					doc.remove("ty");					
					String notice_id = "";
					if (ty.equals("notice")) {
						Document xdoc = new Document();
						doc.remove("edit");
						doc.remove("id");
						doc.append("like_count", 0);					
						doc.put("main_index", "F");				
						xdoc.append("data", doc);
						xdoc.append("ty", "channel");
						xdoc.append("use", "T");
						xdoc.append("GMT", Utils.GMTDate());
						xdoc.append("key", doc.get("channel_code"));
						xdoc.append("owner", doc.get("owner"));
						col2.insertOne(xdoc);								
						//저장하고 바로 표시해야하는 부분에 ty가 notice로 리턴되어야 해서 여기서 변경한다.
						xdoc.append("ty", "notice");						
						xx.put("docinfo", DocumentConverter.toCleanMap(xdoc));
						Document kp = new Document();
						kp.put("key", doc.get("channel_code"));
						Document skp = col2.find(kp).sort(Sorts.descending("GMT")).first();						
						if (skp != null) {
							notice_id = skp.get("_id").toString();
						}
					}					
					if (ty.equals("notice") && !notice_id.equals("")) {
						doc.put("notice_id", notice_id);
						doc.put("tyx", "notice");
					}					
					col.insertOne(doc);					
					xx.put("docinfo", DocumentConverter.toCleanMap(doc));
				}				
			}						
			//채널정보에 마지막업데이트 정보를 업데이트 한다. /////////////////////////////////////////////////			
			String GMT = requestData.get("GMT").toString();
			String channel_code = requestData.get("channel_code").toString();
			if (!channel_code.equals("")) {
				System.out.println("마지막 조회 날짜 업데이트 ");
				channel_info_update_lastupdate(GMT, channel_code);
				String email = requestData.get("ky").toString();
				System.out.println("email : " + email);
				//나의 최종읽음 시간을 업데이트 해야 한다.
				JsonObject jp = new JsonObject();
				jp.addProperty("email", email);
				jp.addProperty("channel_code", channel_code);
				jp.addProperty("GMT", GMT);
				channel_read_update(jp);
			}	
			xx.put("GMT", GMT);
			return ResInfo.success(xx);
		}catch(Exception e){
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}	
	}
	
	public void channel_info_update_lastupdate(String GMT, String channel_code) {
		try {
			MongoCollection<Document> col = channelInfo.getCollection("channel");			
			Document query = new Document();
			query.put("_id", new ObjectId(channel_code));			
			Document data = new Document();
			data.put("lastupdate", GMT);			
			Document se = new Document();
			se.put("$set",  data);			
			col.updateOne(query, se);			
		}catch(Exception e) {
			e.printStackTrace();
		}
	}
	
	public void channel_read_update(JsonObject jj) {	
		try {
			MongoCollection<Document> col = channelInfo.getCollection("channel");		
			String em = jj.get("email").getAsString();			
			//email 정보게 key값이 들어와서 실제 email정보가 아니다.
			String channel_code = jj.get("channel_code").getAsString();			
			Document query = new Document();
			query.put("_id", new ObjectId(channel_code));			
			///// 마지막에 읽은 시간을 내려 주어야 한다.
			JsonObject rtime = new JsonObject();
			Document doc = col.find(query).first();				
			if (doc != null) {
				if (doc.containsKey("read_time")) {
					List<Document> items = doc.getList("read_time", Document.class);							
					for (Document item : items) {	
						if (item.get("email") != null) {
							if (em.equals(item.get("email").toString())) {
								rtime.addProperty("last_read_time", item.get("time").toString());
								break;
							}
						}					
					}
				}
			}
			String GMTDate = jj.get("GMT").getAsString();							
			Document jx = new Document();
			jx.append("email", em);
			jx.append("time", GMTDate);			
			//기존 정보 제거한다.
			Document pull = new Document();
			pull.put("$pull", new Document("read_time", new Document("email",em)));					
			col.updateOne(query, pull);							
			//신규 정보 추가한다.
			Document data = new Document();
			data.put("read_time", jx);
			Document se = new Document();
			se.put("$push", data);			
			col.updateOne(query, se);		
		}catch(Exception e) {
			e.printStackTrace();
		}

	}
	
	public Object channel_data_delete(Map<String, Object> requestData) {	
		String res = "false";	
		
		try{						
			requestData.put("search_server", search_server);
			requestData.put("search_server_port", search_server_port);
			requestData.put("search_server_user", search_server_user);
			requestData.put("search_server_pw", search_server_pw);	
			
			
			MongoCollection<Document> col = channel_data.getCollection("data");			
			MongoCollection<Document> scol = channel_data.getCollection("files");			
			String id = requestData.get("id").toString();			
			Document query = new Document();
			query.append("_id", new ObjectId(id));			
			//관련된 파일 있는 경우 전체 삭제한다.
			Document doc = col.find(query).first();				
			if (doc != null){	
				String action_ky = requestData.get("email").toString();
				Document ddc = (Document) doc.get("owner");
				String source_ky = ddc.get("ky").toString();
				if (!action_ky.equals(source_ky)) {
					//업무방 Owner가 문서를 삭제한 것으로 판단한다.
					//문서에 Owner가 삭제했다는 내용으로 업데이트 한다.
					//로그를 수집한다.
					Document logdoc = new Document();
					logdoc = doc;
					logdoc.put("action", "channel_data_delete_owner");
					logdoc.put("action_time", Utils.GMTDate());				
					writeLog.write_log(logdoc);					
					
					/////////////////////////////////////////////////////////////
					MongoCollection<Document> col2 = userdb.getCollection("user_info");					
					Document qq = new Document();
					qq.put("ky", action_ky);					
					Document sdoc = col2.find(qq).first();					
					Document data = new Document();
					data.put("owner_delete", "T");
					data.put("delete_owner", sdoc);
					data.put("delete_owner_time", Utils.GMTDate());					
					Document se = new Document();
					se.put("$set", data);
					col.updateOne(query, se);					
					res = "owner_delete";
					
				}else {
					if (doc.containsKey("tyx") && doc.get("tyx").equals("notice")) {
						//mongodb에 원본 메시지를 삭제한다.
						col.deleteOne(query);
					}else {
						//로그를 수집한다.
						Document logdoc = new Document();
						logdoc = doc;
						logdoc.put("action", "channel_data_delete");
						logdoc.put("action_time", Utils.GMTDate());				
						writeLog.write_log(logdoc);					
						
						String type = doc.get("type").toString();			
						if (type.equals("file") || doc.containsKey("upload_path")){
							//파일 폴더를 삭제한다.
							String uploadpath = doc.get("upload_path").toString();
							String email = doc.get("ky").toString();		
							String dir = appConfig.getFileDownloadPath();
							String folderPath = dir + "/"+ email +"/"+uploadpath;
							delete_folder(folderPath);
						}		
						
						if (doc.containsKey("reply")) {
							List<Document> rrfiles = (List<Document>) doc.get("reply");
							for (Document xrdoc : rrfiles) {
								if (xrdoc.containsKey("file_infos")) {
									List<Document> fs = (List<Document>) xrdoc.get("file_infos");
									for (Document xx : fs) {
										Document px = new Document();
										px.put("id", xrdoc.get("rid"));
										px.put("info.md5", xx.get("md5"));
										
										scol.deleteOne(px);
									}						
								}
							}
						}			
						
						//파일 정보를 가지고 있는 Collection에 문서를 제거한다.
						Document xquery = new Document();
						xquery.put("id", id);
						FindIterable<Document> files = scol.find(xquery);
						/////////////////////////////////////////////////////////////////////////////////////////////////
						///////////////////// 채널 삭제시 검색 관련 색인을 삭제한다. /////////////////////////////////////////////
						//검색엔진에 색인 데이터를 삭제한다.
//						if (!search_server.equals("")) {										
//							String user = search_server_user;
//							String pw = search_server_pw;						
//							
//							delete_searchengine_data("msg",  id, search_server, search_server_port, user, pw);						
//							
//							//댓글 검색 색인 삭제한다.
//							if (doc.containsKey("reply")) {
//								List<Document> replys = (List<Document>) doc.get("reply");	
//								for (Document rep : replys) {
//								//	System.out.println("채널 댓글 삭제 : " + rep.get("rid").toString());
//									String rid = rep.get("rid").toString();
//									delete_searchengine_data("reply",  rid, search_server, search_server_port, user, pw);	
//								}
//							}						
//							
//							//채널 File 검색 색인 삭제한다.					
//							for (Document file : files) {
//							//	System.out.println("채널 관련 파일 색인 삭제 : " + file.get("_id").toString());
//								String fid = file.get("_id").toString();
//								delete_searchengine_data("channel_file",  fid, search_server, search_server_port, user, pw);	
//							}
//						}
						///////////////////////////////////////////////////////////////////////////////////////////////////					
						//mongodb에 원본 메시지를 삭제한다.
						col.deleteOne(query);								
						// 관련 파일 Collection의 문서를 삭제한다.
						
						System.out.println("채널 원본 삭제시 삭제한다... :  " + xquery);
						scol.deleteMany(xquery);
					}
					res = "true";	
				}								
			}				
		}catch(Exception e){
			e.printStackTrace();
		}
		Map<String, Object> item = new HashMap<>();
		item.put("res", res);
		return ResInfo.success(item);
		
	}
}
