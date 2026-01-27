package com.kmslab.one.config;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.annotation.PostConstruct;

@Component
public class JwtProvider {
	@Value("${jwt.secret}")
    private String secretKey;
    
    private byte[] key;
    
    @Value("${jwt.expiration-ms}")
    private long tokenValidityInMilliseconds;    
    
    @PostConstruct
    public void init() {
        this.key = secretKey.getBytes(StandardCharsets.UTF_8);
    }
       
    public String createToken(String email, String depths, String userid) {
        Map<String, Object> headers = new HashMap<>();
        headers.put("typ", "JWT");
        headers.put("alg", "HS256");
        
        Map<String, Object> payloads = new HashMap<>();
        payloads.put("email", email);
        payloads.put("depths", depths);
        payloads.put("userid", userid);
        
        Long expiredTime = tokenValidityInMilliseconds;
        Date ext = new Date(System.currentTimeMillis() + expiredTime);
        return Jwts.builder()
                .setHeader(headers)
                .setClaims(payloads)
                .setSubject("auth")
                .setExpiration(ext)
                .signWith(SignatureAlgorithm.HS256, secretKey.getBytes())
                .compact();
    }    
    
    public Claims getClaims(String token) {
        return Jwts.parser()
                .setSigningKey(key)
                .parseClaimsJws(token)
                .getBody();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(key).parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
