package com.kmslab.one.service.channel;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import org.bson.Document;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.kmslab.one.service.ResInfo;
import com.kmslab.one.util.DocumentConverter;
import com.kmslab.one.util.Utils;
import com.mongodb.client.AggregateIterable;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Projections;
import com.mongodb.client.model.Sorts;

@Service
public class ChannelService {
	private final MongoTemplate channelInfo;
	private final MongoTemplate todo;
	private final MongoTemplate channel_data;
	public ChannelService(
			@Qualifier("channelInfo") MongoTemplate channelInfo,
			@Qualifier("TODO") MongoTemplate todo,
			@Qualifier("channel_data") MongoTemplate channel_data
			) {		
		this.channelInfo = channelInfo;
		this.todo = todo;
		this.channel_data = channel_data;
	}
	
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
			System.out.println("search_info: " + requestData);
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
			System.out.println("query : " + query);
			Document doc = col.find(query).first();
			System.out.println(doc);
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
	
//	public Object list_channel_favorite(Map<String, Object> requestData) {
//		ResInfo res = new ResInfo();
//		res.setResult("ERROR");
//		
//		try{
//			
//			
//			String channel_code = obj.get("channel_code").getAsString();
//			String email = obj.get("email").getAsString();	
//	//		email = AESSec.decrypt(email);
//			
//			String channel_type = obj.get("query_type").getAsString();
//			int start = obj.get("start").getAsInt();
//			int perpage = obj.get("perpage").getAsInt();
//			String q_str = obj.get("q_str").getAsString();
//			String type = obj.get("type").getAsString();   //type : 1 전체 , type : 2이면 파일만 리턴
//			
//			
//			Document query = new Document();			
//			List<Document> doc = new ArrayList<Document>();			
//
//			MongoDatabase db = MongoDBContextListener.conn.getDatabase(channel_favorite_db);
//			MongoCollection<Document> col = db.getCollection(channel_favorite_col);
//							
//			Document q1 = new Document();
//			q1.put("email", email);
//			doc.add(q1);				
//				
//			if (!q_str.equals("")){	
//				Document tdoc = new Document();
//				List<Document> doc2 = new ArrayList<Document>();
////				Document q2 = new Document();
////				Pattern regex = Pattern.compile(q_str, Pattern.CASE_INSENSITIVE);			
////				q2.put("content", regex);
////				doc2.add(q2);	
//				
//				Document q3 = new Document();
//				Pattern regex2 = Pattern.compile(q_str, Pattern.CASE_INSENSITIVE);			
//				q3.put("filename", regex2);
//				doc2.add(q3);
//				
//				tdoc.append("$or", doc2);
//				doc.add(tdoc);				
//			}			
//			
//			String dtype = obj.get("dtype").getAsString();   //ppt, pptx : ppx , jpg, png, gif : image 필터링을 위한 값
//			if (!dtype.equals("")){
//				Document q3 = new Document();		
//				q3.put("dtype", dtype);
//				doc.add(q3);
//			}
//			
//								
//			query.append("$and", doc);			
//			
//			//채널과 드라이브를 분리해서 type 1 이면 드라이브 , 2명 채널 즐겨찾기로 구분한다.
//			//kmslab용과 아모레용을 같이 사용하기 위해서 type : 1은 kmslab에서 사용한 통합 즐겨찾기 보기이고 type : channel or drive는 아모레형 분리에서 호출하는 형식이다.
//			if (!type.equals("1")) {
//				query.append("file_source", type);
//			}
//			
//					
//		
//						
//			long totalcount = col.countDocuments(query);
//			JsonObject tt = new JsonObject();
//			tt.addProperty("totalcount", totalcount);			
//											
//			JsonArray ar = new JsonArray();
//			FindIterable<Document> list = col.find(query).limit(perpage).skip(start).sort(Sorts.descending("GMT"));
//			for (Document xdoc : list){
//				ar.add(DocumnetConvertJsonObject(xdoc));
//			}
//			
//			tt.add("data", ar);
//			
//			res.setResult("OK");
//			res.setRes(tt);
//			
//			
//		}catch(Exception e){
//			e.printStackTrace();
//		}
//		
//		return res;
//	}
}
