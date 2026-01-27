package com.kmslab.one.service.doservice;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URLEncoder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kmslab.one.config.AppConfig;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
public class FileDownloadMenuIconMobileController {
	
	@Autowired
	private AppConfig appConfig;
	
	@GetMapping("/menuicon_mobile.do")
	public void downloadMenuIconMobile(@RequestParam("code") String code, HttpServletRequest request, HttpServletResponse response) throws IOException{
		String dir = appConfig.getFileDownloadPath();
		String filePath = dir + File.separator + "appstore_mobile" + File.separator + code + ".png";
		String downloadFileName = code + ".png";
		
		File downloadFile = new File(filePath);
		if (!downloadFile.exists()) {
			response.setStatus(HttpServletResponse.SC_NOT_FOUND);
			return;
		}
		
		response.setContentType("image/png");
		response.setContentLength((int) downloadFile.length());
		
		//브라우저별 파일명 인코딩
		String browser = request.getHeader("User-Agent");
		String encodedFileName;
		
		if (browser.contains("MSIE") || browser.contains("Trident") || browser.contains("Chrome")) {
			encodedFileName = URLEncoder.encode(downloadFileName, "UTF-8").replaceAll("\\+",  "%20");
		}else {
			encodedFileName = new String(downloadFileName.getBytes("UTF-8"), "ISO-8859-1");
		}
		
		response.setHeader("Content-Disposition",  String.format("attachment; filename=\"%s\"", encodedFileName));
		
		try(FileInputStream inStream = new FileInputStream(downloadFile); OutputStream outStream = response.getOutputStream()){
			byte[] buffer = new byte[4096];
			int bytesRead;
			
			while ((bytesRead = inStream.read(buffer)) != -1) {
				outStream.write(buffer, 0, bytesRead);
			}
			outStream.flush();
		}
	}

}