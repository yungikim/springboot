package com.kmslab.one.controller.docontrol;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;
import com.kmslab.one.config.AppConfig;
import com.kmslab.one.service.MongoDataService;
import com.kmslab.one.service.ResInfo;
import com.kmslab.one.service.channel.ChannelService;
import com.kmslab.one.util.DocumentConverter;
import com.kmslab.one.util.Utils;


@RestController
public class FileControl_reply {

    private static final String FILE_SEPARATOR = File.separator;
    
    @Autowired
    private AppConfig appConfig;
    
    @Autowired
    private MongoDataService MD;
    
    @Autowired
    private ChannelService channelService;
   
    @PostMapping("/FileControl_reply.do")
    public ResponseEntity<Object> uploadReply(
    		@RequestParam(value = "files", required = false) MultipartFile[] files,
            @RequestParam(value = "file", required = false) MultipartFile[] xfile,
            @RequestParam(value = "file[0]", required = false) MultipartFile file0,
            @RequestParam(value = "filepath", required = false, defaultValue = "") String filepath,
            @RequestParam(value = "email", required = false, defaultValue = "") String email,
            @RequestParam(value = "ky", required = false, defaultValue = "") String ky,
            @RequestParam(value = "content", required = false, defaultValue = "") String content,
            @RequestParam(value = "channel_code", required = false, defaultValue = "") String channel_code,
            @RequestParam(value = "channel_name", required = false, defaultValue = "") String channel_name,
            @RequestParam(value = "owner", required = false, defaultValue = "") String owner,
            @RequestParam(value = "fserver", required = false, defaultValue = "") String fserver,
            @RequestParam(value = "type", required = false, defaultValue = "") String type,
            @RequestParam(value = "dtype", required = false, defaultValue = "") String dtype,
            @RequestParam(value = "edit", required = false, defaultValue = "") String edit,
            @RequestParam(value = "id", required = false, defaultValue = "") String id,
            @RequestParam(value = "rid", required = false, defaultValue = "") String rid,
            @RequestParam(value = "upload_path", required = false, defaultValue = "") String upload_path,
            @RequestParam(value = "mentions_msg", required = false, defaultValue = "") String mentions_msg,
            @RequestParam(value = "mentions_data", required = false, defaultValue = "") String mentions_data) {


        String SAVE_DIR = appConfig.getFileDownloadPath();
        String SAVE_DIR2 = appConfig.getFileDownloadPath2();
        
        MultipartFile[] uploadFiles = null;
        
        if (files != null && files.length > 0) {
            uploadFiles = files;
        } else if (xfile != null && xfile.length > 0) {
            uploadFiles = xfile;
        } else if (file0 != null) {
            uploadFiles = new MultipartFile[]{file0};  // 단일 파일을 배열로
        }

        //JsonObject result = new JsonObject();
        Map<String, Object> result = new HashMap<>();
        try {
            // 업로드 디렉토리 생성
            File uploadDir = new File(SAVE_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            File uploadDir2 = new File(SAVE_DIR2);
            if (!uploadDir2.exists()) {
                uploadDir2.mkdirs();
            }

            String randomStr = RandomStringUtils.randomAlphanumeric(15).toUpperCase();
            String key = Utils.curDay8() + "_" + randomStr;

            String randomStr2 = RandomStringUtils.randomAlphanumeric(10).toUpperCase();
            String random = Utils.curDay8() + "_" + randomStr2;

            List<String> md5s = new ArrayList<>();
        //    JsonArray ar2 = new JsonArray();
            List<Map<String, Object>> ar2 = new ArrayList<>();
            List<Document> ar = new ArrayList<>();

            String GMT = Utils.GMTDate();
            Object res = null;
            ResInfo res2 = null;

            String upload_path_setting = "";
            String owner_ky = "";
            String last_upload_path = "";
            String saveFolder = filepath;

            // 파일 처리
            if (uploadFiles != null && uploadFiles.length > 0) {
                for (MultipartFile file : uploadFiles) {                	
                    if (file.isEmpty()) {
                        continue;
                    }
                    // 원본 문서에서 upload_path 확인
                    if (upload_path_setting.equals("")) {
                        JsonObject rr = MD.orignal_upload_path_check(id);
                        upload_path_setting = rr.get("upload_path").getAsString();
                        owner_ky = rr.get("owner_ky").getAsString();
                    }

                    String fileName = file.getOriginalFilename();
                    String filePath = "";
                    String savePath = "";

                    if (!saveFolder.equals("")) {
                        File fx = new File(SAVE_DIR + FILE_SEPARATOR + saveFolder);
                        if (!fx.exists()) {
                            fx.mkdirs();
                        }
                        savePath = SAVE_DIR + FILE_SEPARATOR + saveFolder;
                        filePath = SAVE_DIR + FILE_SEPARATOR + saveFolder + FILE_SEPARATOR + fileName;
                    } else {
                        savePath = SAVE_DIR;
                        filePath = SAVE_DIR + FILE_SEPARATOR + owner_ky + FILE_SEPARATOR + fileName;

                        File fx = new File(SAVE_DIR + FILE_SEPARATOR + owner_ky);
                        if (!fx.exists()) {
                            fx.mkdirs();
                        }
                    }

                    // 임시 파일 저장
                    File storeFile = new File(filePath);
                    file.transferTo(storeFile);

                    String ex = FilenameUtils.getExtension(fileName);
                    String file_type = ex;

                    // MD5 체크
                    String MD5Value = MD.MD5_Check(filePath);

                    // 최종 저장 경로 결정
                    if (upload_path_setting.equals("")) {
                        last_upload_path = key;
                    } else {
                        last_upload_path = upload_path_setting;
                    }

                    String mfolder = "";
                    if (type.equals("reply_modify")) {
                        String[] lp = rid.split("_");
                        String rrid = lp[1] + "_" + lp[2];
                        mfolder = SAVE_DIR + saveFolder + FILE_SEPARATOR + owner_ky + FILE_SEPARATOR + 
                                  last_upload_path + FILE_SEPARATOR + "reply" + FILE_SEPARATOR + rrid;
                    } else {
                        mfolder = SAVE_DIR + saveFolder + FILE_SEPARATOR + owner_ky + FILE_SEPARATOR + 
                                  last_upload_path + FILE_SEPARATOR + "reply" + FILE_SEPARATOR + random;
                    }

                    String fxname = mfolder + FILE_SEPARATOR + MD5Value + "." + ex;
                    String DRMFxname = mfolder + FILE_SEPARATOR + MD5Value + "_drm." + ex;

                    File sf2 = new File(mfolder);
                    if (!sf2.exists()) {
                        sf2.mkdirs();
                    }

                    File fx = new File(fxname);
                    boolean success = storeFile.renameTo(fx);

                    if (!success) {
                        System.out.println("파일 이동 오류....");
                    }

                    // 파일 타입 체크
                    boolean isDoc = true;
                    String fnn = MD5Value + "." + ex;

//                    if (!Util.check_thumbnail_delete(fnn)) {
//                        isDoc = false;
//                    }

                    // 텍스트 추출
                  //  fileinfo nfile = new fileinfo();
                    String text_extract = "";
//                    if (cf.useDRM) {
//                        if (isDoc) {
//                            text_extract = ut.file_extractor(DRMFxname, 0, nfile);
//                        }
//                    } else {
//                        text_extract = ut.file_extractor(fxname, 0, nfile);
//                    }

                    String file_size = String.valueOf(fx.length());

                    // 썸네일 생성
                    String isThumbnail = "";
//                    if (cf.useDRM) {
//                        File ffx = new File(DRMFxname);
//                        if (!isDoc) {
//                            isThumbnail = make_thumbnail(fx, mfolder, MD5Value);
//                        }
//                        if (ffx.exists()) {
//                            ffx.delete();
//                        }
//                    } else {
//                        isThumbnail = make_thumbnail(fx, mfolder, MD5Value);
//                    }

                    // 파일 정보 Document 생성
                    Document info = new Document();
                    info.put("file_size", Long.parseLong(file_size));
                    info.put("filename", fileName);
                    info.put("file_type", file_type);
                    info.put("md5", MD5Value);
                    info.put("dtype", doc_type_check(file_type));
//                    info.put("thumbOK", isThumbnail);
                    md5s.add(MD5Value);
                    ar2.add(documentToMap(info));
                    ar.add(info);
                }
            }

            // owner 정보 파싱
            Document idoc = Document.parse(owner);
            ky = idoc.get("ky").toString();
            String rp = "";
            if (type.equals("reply_modify")) {
                // 수정 모드
//                JsonObject rdoc = new JsonObject();
//                rdoc.addProperty("GMT", GMT);
//                rdoc.addProperty("GMT2", GMT);
//                rdoc.addProperty("channel_data_id", id);
//                rdoc.addProperty("upload_path", last_upload_path);
//                rdoc.addProperty("rid", rid);
//                rdoc.add("file_infos", ar2);
//                rdoc.addProperty("fserver", fserver);
                Map<String, Object> rdoc = new HashMap<>();
                rdoc.put("GMT", GMT);
                rdoc.put("GMT2", GMT);
                rdoc.put("channel_data_id", id);
                rdoc.put("upload_path", last_upload_path);
                rdoc.put("rid", rid);
                rdoc.put("file_infos", ar2);
                rdoc.put("fserver", fserver);
                res = MD.insert_reply_attachment(rdoc);
                rp = rid;
            } else {
                // 새 댓글 작성
//                JsonObject rdoc = new JsonObject();
//                rdoc.addProperty("GMT", GMT);
//                rdoc.addProperty("GMT2", GMT);
//                rdoc.add("owner", DocumentConvertJsonObject(idoc));
//                rdoc.addProperty("channel_data_id", id);
//                JsonArray data = new Gson().fromJson(mentions_data, JsonArray.class);
//                rdoc.addProperty("upload_path", last_upload_path);
//                rdoc.addProperty("content", cleanXSS(mentions_msg));
//                rdoc.add("mentions_data", data);
//                rdoc.addProperty("rid", id + "_" + random);
//                rdoc.add("file_infos", ar2);
//                rdoc.addProperty("fserver", fserver);
                
            	
                Map<String, Object> rdoc = new HashMap<>();
                rdoc.put("GMT", GMT);
                rdoc.put("GMT2", GMT);
                rdoc.put("owner", DocumentConverter.toCleanMap(idoc));
                rdoc.put("channel_data_id", id);
                
             // mentions_data JSON 파싱
                List<Map<String, Object>> mentionsDataList = new ArrayList<>();
                if (mentions_data != null && !mentions_data.isEmpty()) {
                    JsonArray jsonArray = new Gson().fromJson(mentions_data, JsonArray.class);
                    for (JsonElement element : jsonArray) {
                        Map<String, Object> map = new Gson().fromJson(element, 
                            new TypeToken<Map<String, Object>>(){}.getType());
                        mentionsDataList.add(map);
                    }
                }
                
                rdoc.put("upload_path", last_upload_path);
                rdoc.put("content", cleanXSS(mentions_msg));
                rdoc.put("mentions_data", mentionsDataList);
                rdoc.put("rid", id + "_" + random);
                rdoc.put("file_infos", ar2);
                rdoc.put("fserver", fserver);

                res = channelService.save_reply(rdoc);
                rp = id + "_" + random;
            }

            // 파일 정보 저장
            for (int i = 0; i < ar.size(); i++) {
                Document cdoc = new Document();
                cdoc.append("info", ar.get(i));
                cdoc.append("upload_path", last_upload_path);
                cdoc.append("email", email);
                cdoc.append("ky", ky);
                cdoc.append("channel_code", channel_code);
                cdoc.append("channel_name", channel_name);
                cdoc.append("GMT", GMT);
                cdoc.append("owner", idoc);
                cdoc.append("fserver", fserver);
                cdoc.append("id", rp);
                res2 = MD.save_fileinfo(cdoc);
            }

            // 결과 생성
            System.out.println("res  : " + res);
            System.out.println("res2 : " + res2);
            System.out.println("ar2 : " + ar2);
            
            result.put("data", res);
            result.put("data2", res2);
            result.put("file_infos", ar2);
            result.put("upload_path", last_upload_path);
            result.put("fserver", fserver);
            result.put("owner_ky", owner_ky);
            
            System.out.println(result);

            System.out.println("파일 업로드 완료");
            return ResponseEntity.ok(result);

        } catch (Exception ex) {
            result.put("result", "ERROR");
            result.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }
    
    private Map<String, Object> documentToMap(Document doc) {
        Map<String, Object> map = new HashMap<>();
        for (String key : doc.keySet()) {
            Object value = doc.get(key);
            if (value instanceof Document) {
                map.put(key, documentToMap((Document) value));
            } else {
                map.put(key, value);
            }
        }
        return map;
    }


//    private String make_thumbnail(File f, String mfolder, String cur_md5) {
//        String res = "F";
//        try {
//            String fn = f.getName().toLowerCase();
//
//            log.info("Thumbnail create : {}", mfolder + FILE_SEPARATOR + "thumbnail" + FILE_SEPARATOR + 
//                     cur_md5 + "_thumb.png");
//
//            mkdir(mfolder + FILE_SEPARATOR + "thumbnail");
//            String targetPath = mfolder + FILE_SEPARATOR + "thumbnail" + FILE_SEPARATOR + 
//                                cur_md5 + "_thumb.png";
//            String targetPath2 = mfolder;
//
//            mkdir(targetPath2);
//
//            String path = f.getAbsolutePath();
//
//            if (check_image(fn)) {
//                kportal_thumbnail.thumbail_image(f, targetPath);
//                res = "T";
//            } else if (fn.endsWith(".pdf")) {
//                // kportal_thumbnail.thumbail_pdf(path, targetPath);
//                // res = "T";
//            } else if (check_movie(fn)) {
//                // kportal_thumbnail.thumbnail_video(path, targetPath);
//                // res = "T";
//            } else if (fn.endsWith(".xls") || fn.endsWith(".xlsx") || fn.endsWith(".txt") ||
//                       fn.endsWith(".html") || fn.endsWith(".htm") || fn.endsWith(".css") ||
//                       fn.endsWith(".js") || fn.endsWith(".log") || fn.endsWith(".doc") ||
//                       fn.endsWith(".docx") || fn.endsWith(".ppt") || fn.endsWith(".pptx") ||
//                       fn.endsWith(".hwp")) {
//                // 문서 썸네일 처리
//            }
//
//        } catch (Exception e) {
//            res = "F";
//            log.error("썸네일 생성 중 오류", e);
//        }
//
//        return res;
//    }

    private String doc_type_check(String file_ext) {
        String res = "";
        file_ext = file_ext.toLowerCase();

        if (file_ext.equals("ppt") || file_ext.equals("pptx")) {
            res = "ppt";
        } else if (file_ext.equals("xls") || file_ext.equals("xlsx")) {
            res = "excel";
        } else if (file_ext.equals("doc") || file_ext.equals("docx")) {
            res = "word";
        } else if (file_ext.equals("gif") || file_ext.equals("bmp") || file_ext.equals("jpg") ||
                   file_ext.equals("jpeg") || file_ext.equals("png")) {
            res = "img";
        } else if (file_ext.equals("zip") || file_ext.equals("rar") || file_ext.equals("tar") ||
                   file_ext.equals("7z")) {
            res = "zip";
        } else if (file_ext.equals("mp4") || file_ext.equals("avi") || file_ext.equals("wmv") ||
                   file_ext.equals("mkv") || file_ext.equals("mov")) {
            res = "video";
        } else if (file_ext.equals("pdf")) {
            res = "pdf";
        } else if (file_ext.equals("txt")) {
            res = "txt";
        } else if (file_ext.equals("hwp")) {
            res = "hwp";
        } else {
            res = "etc";
        }

        return res;
    }

    public static boolean check_image(String str) {
        Pattern p = Pattern.compile("\\.(jpg|jpeg|png|gif|bmp)$", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(str);
        return m.find();
    }

    public static boolean check_movie(String str) {
        Pattern p = Pattern.compile("\\.(wmv|mp4|avi|flv|3gp|mov|mkv)$", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(str);
        return m.find();
    }

    public static boolean check_pdf(String str) {
        Pattern p = Pattern.compile("\\.(pdf)$", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(str);
        return m.find();
    }

    public static boolean check_thumbnail_delete(String str) {
        Pattern p = Pattern.compile("\\.(doc|docx|xls|xlsx|ppt|pptx|hwp|txt)$", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(str);
        return m.find();
    }

    private static String cleanXSS(String value) {
        if (value == null) {
            return "";
        }

        value = value.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
        value = value.replaceAll("\\(", "&#40;").replaceAll("\\)", "&#41;");
        value = value.replaceAll("'", "&#39;");
        value = value.replaceAll("eval\\((.*)\\)", "");
        value = value.replaceAll("[\\\"\\\'][\\s]*javascript:(.*)[\\\"\\\']", "\"\"");
        value = value.replaceAll("script", "");

        return value;
    }
}