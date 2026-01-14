package com.kmslab.one.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.JsonObject;
import com.kmslab.one.service.SSOService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/sso.do")
public class SSOController {
	
	@Autowired
	private SSOService ssoService;
	
	@PostMapping
	public ResponseEntity<String> login(@RequestBody Map<String, Object> loginData, HttpServletRequest request){
		HttpSession session = request.getSession();
		String id = loginData.get("id").toString();
		String pw = loginData.get("pw").toString();
		
		//비지니스 로직 수행
		JsonObject result = ssoService.processSSO(id, pw, session);
		
		return ResponseEntity.ok()
				.header("Content-Type", "application/json; charset=UTF-8")
				.body(result.toString());
		
	}
}
