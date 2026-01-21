package com.kmslab.one.service.channel;

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
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;

@Service
public class ChannelService {
	private final MongoTemplate channelInfo;
	public ChannelService(
			@Qualifier("channelInfo") MongoTemplate channelInfo
			) {		
		this.channelInfo = channelInfo;
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
}
