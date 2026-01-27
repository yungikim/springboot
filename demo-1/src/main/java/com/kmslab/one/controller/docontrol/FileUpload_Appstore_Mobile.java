package com.kmslab.one.controller.docontrol;

import java.io.File;

import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.google.gson.JsonObject;
import com.kmslab.one.config.AppConfig;

@RestController
public class FileUpload_Appstore_Mobile {
	@Autowired
	private AppConfig appConfig;
	
	@PostMapping(value="/FileControl_mobile_appstore.do", produces= MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<String> uploadAppStoreFile(
			@RequestParam(value="file[0]", required=false) MultipartFile file,
			@RequestParam(value="code", required=false) String code
			){
		JsonObject result = new JsonObject();
		System.out.println("FileControl_appstore.do로 들어온다...");
		
		//파일 유효성 검사
		if (file == null || file.isEmpty()) {
			result.addProperty("result", "ERROR");
			result.addProperty("message", "업로드된 파일이 없습니다.");
			return ResponseEntity.badRequest().body(result.toString());
		}
		
		try {
			String saveFolder = "appstore_mobile";
			String extension = FilenameUtils.getExtension(file.getOriginalFilename());
			String saveFilename = code + "." + extension;
			
			//저장 디렉토리 생성
			String dir = appConfig.getFileDownloadPath();
			String savePath = dir + File.separator + saveFolder;
			File saveDir = new File(savePath);
			if (!saveDir.exists()) {
				saveDir.mkdirs();
			}
			
			//파일 저장
			String fullPath = savePath + File.separator + saveFilename;
			File storeFile = new File(fullPath);
			
			if (file.getContentType() != null && !file.getOriginalFilename().isEmpty()) {
				file.transferTo(storeFile);
			}else {
				System.out.println("기존에 존재하는 파일을 업로드 해서 삭제한다...");
				if (storeFile.exists()) {
					storeFile.delete();
				}
			}
			
			result.addProperty("result", "OK");
			result.addProperty("filename", saveFilename);
			
			System.out.println("AppStore 파일 업로드 완료");
			return ResponseEntity.ok(result.toString());
			
		}catch(Exception e) {
			e.printStackTrace();
			result.addProperty("result", "ERROR");
			result.addProperty("message", e.getMessage());
			return ResponseEntity.internalServerError().body(result.toString());
		}
	}
}
