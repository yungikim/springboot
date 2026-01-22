package com.kmslab.one.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import jakarta.servlet.http.HttpSession;

@Controller
public class LogoutController {
	
	@GetMapping("/logout.do")
	public ResponseEntity<?> logout(@RequestParam("userid") String userId, HttpSession session){
		try {
			session.removeAttribute("userinfo_" + userId);
			session.invalidate();
			return ResponseEntity.ok(Map.of("result", "OK"));
		}catch(Exception e) {
			e.printStackTrace();
			return ResponseEntity.ok(Map.of("result", "ERROR"));
		}
	}
}
