package com.kmslab.one.component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import com.mongodb.client.MongoCollection;

@Component
public class FileFolderUtil {
	
	private final MongoTemplate channelinfo;
	public FileFolderUtil(
			@Qualifier("channelInfo") MongoTemplate channelinfo
			) {		
		this.channelinfo = channelinfo;
	}
	
	public boolean check_sub_folder_exist(String drive_key, String folder_key, String depts, String email) {
		boolean res = false;
		
		try {
			MongoCollection<Document> col2 = channelinfo.getCollection("folder");			
			Document query = new Document();			
			Pattern regex = Pattern.compile(email, Pattern.CASE_INSENSITIVE);			
			if (!depts.equals("")) {
				List<String> llk = new ArrayList<>();			
				llk.add(email);//				
				String lix = depts;
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
			Document pp = new Document();
			if (folder_key.equals("root")) {
				pp.put("drive_key", drive_key);
			}else {
				pp.put("parent_folder_key", folder_key);
			}
			sdoc.add(pp);
			Document qq = new Document();
			qq.append("$and", sdoc);			
			long count = col2.countDocuments(qq);
			if (count > 0) {
				res = true;
			}			
		}catch(Exception e) {
			e.printStackTrace();
		}		
		return res;
	}
}
