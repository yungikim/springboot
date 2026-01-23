package com.kmslab.one.service.doservice;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.kmslab.one.config.UserSearch;
import com.kmslab.one.service.ResInfo;
import com.mongodb.client.MongoCollection;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@RestController
public class Jwt_token_onlyOffice {
	private final MongoTemplate channel_favorite;
	private final MongoTemplate folderdata;
	private final MongoTemplate channel_data;
	public Jwt_token_onlyOffice(
			@Qualifier("channel_favorite") MongoTemplate channel_favorite,
			@Qualifier("folderdata") MongoTemplate folderdata,
			@Qualifier("channel_data") MongoTemplate channel_data
			) {		
		this.channel_favorite = channel_favorite;
		this.folderdata = folderdata;
		this.channel_data = channel_data;
	}
	
	@Value("${jwt.secret}")
    private String secretKey;
	
	@PostMapping("/auth_office.do")
	public Object authOffice(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userid){
		System.out.println("auth_office.do로 들어온다......");
		System.out.println(requestData);
	
		Map<String, Object> result = new HashMap<>();
		try {
			String name = (String) requestData.get("name");
            String key = (String) requestData.get("key");
            String image = (String) requestData.get("image");
            String group = (String) requestData.get("group");
            String dockey = (String) requestData.get("dockey");
            String category = (String) requestData.get("category");
            String editmode = (String) requestData.get("editmode");

            String mmd5 = "";
            if ("channel".equals(category)) {
                mmd5 = dockey.split("_")[2];
            }
            String sdockey = dockey.split("_")[1];
            
         // MongoDB에서 문서 정보 가져오기
            Document sdoc = findDocument(category, sdockey);
            
            if (sdoc != null) {
            	 String filename = "";
                 String fileType = "";
                 String ky = "";
                 String documentkey = "";

                 if ("filesfavorite".equals(category) || "files".equals(category)) {
                     filename = sdoc.getString("filename");
                     fileType = sdoc.getString("file_type");
                     ky = sdoc.getString("ky");

                     if (sdoc.containsKey("lastupdate")) {
                         documentkey = dockey + "_" + sdoc.getString("lastupdate");
                     } else {
                         documentkey = dockey;
                     }

                 } else if ("channel".equals(category)) {
                     System.out.println(sdoc);
                     @SuppressWarnings("unchecked")
                     List<Document> fileinfo = (List<Document>) sdoc.get("info");
                     for (Document info : fileinfo) {
                         String md5 = info.getString("md5");
                         if (md5.equals(mmd5)) {
                             filename = info.getString("filename");
                             fileType = info.getString("file_type");
                             ky = sdoc.getString("ky");

                             if (info.containsKey("lastupdate")) {
                                 documentkey = dockey + "_" + info.getString("lastupdate");
                             } else {
                                 documentkey = dockey;
                             }
                         }
                     }
                 }

                 if (sdoc.containsKey("role")) {
                     editmode = sdoc.getString("role");
                 }

                 System.out.println("==========================");
                 System.out.println("filename : " + filename);
                 System.out.println("filetype : " + fileType);
                 System.out.println("ky : " + ky);
                 System.out.println("documentkey : " + documentkey);
                 System.out.println("editmode : " + editmode);
                 System.out.println("==========================");

                 // 현재 날짜와 시간 가져오기
                 LocalDateTime now = LocalDateTime.now();
                 DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
                 String formattedDateTime = now.format(formatter);

                 String url = "https://one.kmslab.com/FDownload_Office.do?id=" + dockey + "&ty=1&ky=" + ky 
                         + "&ver=" + formattedDateTime + "&category=" + category + "&md5=" + mmd5;
                 System.out.println("auth_office.do url : " + url);

                 String dt = getDocumentType(fileType);

                 // JWT payload 생성
                 Map<String, Object> payloads = buildPayloads(documentkey, filename, fileType, url, dt, 
                         key, name, image, editmode);

                 String auth = createToken(payloads);

                 result.put("result", "OK");
                 result.put("auth", auth);

                 Map<String, Object> pp = new HashMap<>();
                 pp.put("fileType", fileType);
                 pp.put("url", url);
                 pp.put("documentType", dt);
                 pp.put("filename", filename);
                 pp.put("mode", editmode);
                 result.put("payloads", pp);

             } else {
                 System.out.println("Don't exist Document.... sdockey: " + sdockey);
                 result.put("result", "FAIL");
                 result.put("message", "Document not found");
             }
            return ResInfo.success(result);
            
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	private Document findDocument(String category, String sdockey) {
        MongoCollection<Document> col = null;        
        if ("filesfavorite".equals(category)) {
            col = channel_favorite.getCollection("list");
        } else if ("files".equals(category)) {
            col = folderdata.getCollection("data");
        } else if ("channel".equals(category)) {
            col = channel_data.getCollection("data");
        }         
        Document query = new Document();
        query.append("_id", new ObjectId(sdockey));
        Document doc = col.find(query).first();
        return doc;
	}
	
	private String getDocumentType(String fileType) {
		if (fileType == null) return "none";
		
		return switch (fileType.toLowerCase()) {
		case "ppt", "pptx", "odp" -> "slide";
		case "xls", "xlsx", "ods", "csv" -> "cell";
		case "doc", "docx", "odt", "txt", "hwp" -> "word";
		case "pdf" -> "pdf";
		default -> "none";
		};
	}
	
	
	private Map<String, Object> buildPayloads(String documentkey, String filename, String fileType,
            String url, String dt, String userId, String userName, String userImage, String editmode) {

        Map<String, Object> payloads = new HashMap<>();

        // document 설정
        Map<String, Object> document = new HashMap<>();
        document.put("fileType", fileType);
        document.put("key", documentkey);
        document.put("title", filename);
        document.put("url", url);

        Map<String, Object> permissions = new HashMap<>();
        permissions.put("edit", true);
        permissions.put("comment", true);
        document.put("permissions", permissions);

        // documentType 설정
        Map<String, Object> documentType = new HashMap<>();
        documentType.put("documentType", dt);

        // editorConfig 설정
        Map<String, Object> editorConfig = new HashMap<>();
        editorConfig.put("callbackUrl", "https://one.kmslab.com/onlyoffice_callback.km");

        Map<String, Object> user = new HashMap<>();
        user.put("id", userId);
        user.put("name", userName);
        user.put("image", userImage);
        editorConfig.put("user", user);
        editorConfig.put("mode", editmode);

        // event 설정
        Map<String, Object> eventConfig = new HashMap<>();
        List<String> events = new ArrayList<>();
        events.add("onRequestRename");
        events.add("onRequestHistory");
        events.add("onRequestHistoryData");
        events.add("onRequestHistoryClose");
        eventConfig.put("onRequestRename", events);

        payloads.put("document", document);
        payloads.put("documentType", documentType);
        payloads.put("editorConfig", editorConfig);
        payloads.put("event", eventConfig);

        return payloads;
    }
	
	
	private String createToken(Map<String, Object> payloads) {
        Map<String, Object> headers = new HashMap<>();
        headers.put("typ", "JWT");
        headers.put("alg", "HS256");

        long expiredTime = 1000 * 60L * 60L * 15L; // 15시간

        Date exp = new Date();
        exp.setTime(exp.getTime() + expiredTime);

        return Jwts.builder()
                .setHeader(headers)
                .setClaims(payloads)
                .setSubject("auth")
                .setExpiration(exp)
                .signWith(SignatureAlgorithm.HS256, secretKey.getBytes())
                .compact();
    }
}
