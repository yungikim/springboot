package com.kmslab.one.config;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.sql.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;

@Component
//@ConfigurationProperties(prefix = "storage")
@Getter @Setter
public class AppConfig {
	@Value("${storage.ffmpeg-path}")
	private String ffmpegPath;
	
	@Value("${storage.media-info-path}")
	private String mediaInfoPath;
	
	@Value("${storage.realdrive}")
	private String realdrive;
	
	@Value("${storage.tempdrive}")
	private String tempdrive;
	
	@Value("${storage.master-url}")
	private String masterUrl;
	
	//계산된 경로들을 저장할 변수
	public String thumbnailPath;
	public String fileDownloadPath;
	public String chatroomPath;
	
	/**
	 *의존성 주입이 완료딘 후, realdrive 값을 기반으로 하위 경로들을 자동으로 계산하여 설정합니다.
	 */
	
	@PostConstruct
	public void init() {
		String sepa = File.separator;	    
		if (this.realdrive == null) {
			return;
		}
		this.thumbnailPath = realdrive + sepa + "download" + sepa + "thumbnail" + sepa;
		this.fileDownloadPath = realdrive + sepa + "upload";
		this.chatroomPath = realdrive + sepa + "vol_epchat" + sepa + "data" + sepa + "upload_root";
	}
	
	public String getFileDownloadPath() {
	    return this.fileDownloadPath;
	}
	
	public String getChatroomPath() {
		return this.chatroomPath;
	}
}
