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
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;

@Component
@ConfigurationProperties(prefix = "storage")
@Getter @Setter
public class AppConfig {
	private String ffmpegPath;
	private String mediaInfoPath;
	private String realdrive;
	private String tempdrive;
	private String masterUrl;
	
	//계산된 경로들을 저장할 변수
	private String thumbnailPath;
	private String fileDownloadPath;
	private String chatroomPath;
	
	/**
	 *의존성 주입이 완료딘 후, realdrive 값을 기반으로 하위 경로들을 자동으로 계산하여 설정합니다.
	 */
	
	@PostConstruct
	public void init() {
		String sepa = File.separator;
		this.thumbnailPath = realdrive + sepa + "download" + sepa + "thumbnail" + sepa;
		this.fileDownloadPath = realdrive + sepa + "upload";
		this.chatroomPath = realdrive + sepa + "vol_epchat" + sepa + "data" + sepa + "upload_root";
	}
	
	@Component
	public class JwtProvider{
		@Value("${jwt.secret}") //properties에 정의된 비밀키
		private String secretKey;
		
		private Key key;
		
		@Value("${jwt.expiration-ms}")
		private long tokenValidityInMilliseconds;
		
		@PostConstruct
		public void init() {
			//비밀키를 기반으로 HMAC SHA 키 생성
			byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
			this.key = Keys.hmacShaKeyFor(keyBytes);
		}
		
		//1. 토큰 생성 (로그인시 사용)
		public String createToken(String email, String depths, String userid) {
			 Map<String, Object> headers = new HashMap<>();
			    headers.put("typ", "JWT");
			    headers.put("alg", "HS256");
			
			    Map<String, Object> payloads = new HashMap<>();
			    payloads.put("email", email);
			    payloads.put("depths", depths);
			    payloads.put("userid", userid);
			
			    Long expiredTime = tokenValidityInMilliseconds; // 15시간
			    Date ext = new Date(System.currentTimeMillis() + expiredTime);
			
			    return Jwts.builder()
			            .setHeader(headers)
			            .setClaims(payloads)
			            .setSubject("auth")
			            .setExpiration(ext)
			            .signWith(this.key, SignatureAlgorithm.HS256)
			            .compact();
		}	
		
		//2. 토큰에서 정보 추출
		public Claims getClaims(String token) {
			return Jwts.parserBuilder()
					.setSigningKey(key)
					.build()
					.parseClaimsJws(token)
					.getBody();
		}
		
		//3. 토큰 유효성 검증 (인터셉터/필터에서 사용)
		public boolean validateToken(String token) {
			try {
				Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
				return true;
			}catch(JwtException | IllegalArgumentException e) {
				//토큰 만료 변조, 형식 오류등
				return false;
			}
		}
		
	}


}
