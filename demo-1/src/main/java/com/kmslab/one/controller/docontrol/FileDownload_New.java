package com.kmslab.one.controller.docontrol;

import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kmslab.one.config.AppConfig;
import com.kmslab.one.service.ResInfo;
import com.kmslab.one.service.doservice.Search_file_download_path;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/FDownload.do")
public class FileDownload_New{
	
	@Autowired
	private Search_file_download_path sfp;
	
	@Autowired
	private AppConfig appConfig;
	
	@GetMapping
    public void downloadFile(
            @RequestParam("id") String id,
            @RequestParam("ty") String ty,
            @RequestParam(value = "md5", required = false) String md5,
            @RequestParam(value = "fn", required = false) String fn,
            @RequestParam(value = "ky", required = false) String ky,
            HttpServletRequest request,
            HttpServletResponse response) {
        
        try {
            if (ky == null) ky = "";
            if (md5 == null) md5 = "";  
            
            // ResInfo 반환값 처리
            ResInfo info = (ResInfo) sfp.search_file_download_path(id, ty, md5, ky);
            Map<String, Object> data = (Map<String, Object>) info.getData();
            
            String filename = "";
            if (ty.equals("chat")) {
                filename = fn;
            } else {
                filename = (String) data.get("filename");
            }
            
            String filePath = (String) data.get("fullpath");
            
            File downloadFile = new File(filePath);
            
            if (!downloadFile.exists()) {
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "파일이 존재하지 않습니다.");
                return;
            }
            
            // MIME 타입 설정
            String mimeType = request.getServletContext().getMimeType(filePath);
            if (mimeType == null) {
                mimeType = "application/octet-stream";
            }
            
            response.setContentType(mimeType);
            response.setContentLengthLong(downloadFile.length());
            
            // 파일명 인코딩
            String browser = request.getHeader("User-Agent");
            String downName;
            if (browser.contains("MSIE") || browser.contains("Trident") || browser.contains("Chrome")) {
                downName = URLEncoder.encode(filename, "UTF-8").replaceAll("\\+", "%20");
            } else {
                downName = new String(filename.getBytes("UTF-8"), "ISO-8859-1");
            }
            
            response.setHeader("Content-Disposition", "attachment; filename=\"" + downName + "\"");
            
            // 파일 전송
            try (FileInputStream inStream = new FileInputStream(downloadFile);
                 OutputStream outStream = response.getOutputStream()) {
                
                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = inStream.read(buffer)) != -1) {
                    outStream.write(buffer, 0, bytesRead);
                }
                outStream.flush();
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
