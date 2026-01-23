package com.kmslab.one.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import com.kmslab.one.config.UserSearch;

import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/office")
public class OfficeURLController {
	private static final String CSS_VER = "20260123.001";
	
	@Autowired
	private UserSearch userSearch;
	
	@GetMapping({"/{key}/{category}", "/{key}/{category}/{type}"})
	public String getForward(
			@PathVariable("key") String key, 
			@PathVariable("category") String category, 
			@PathVariable(value="type", required = false) String type, 
			@CookieValue(value="userid", required = false) String userid, 
			HttpSession session, 
			Model model
			) {
		System.out.println("OfficeController Loading...");
		System.out.println("key : " + key);
		System.out.println("category : " + category);
		
		model.addAttribute("cssVersion", CSS_VER);
		model.addAttribute("jsVersion", CSS_VER);
		
		model.addAttribute("dockey", key);
		model.addAttribute("category", category);
		model.addAttribute("type", type);
		
		Map<String, Object> suser = userSearch.search_user(userid);
		
		System.out.println("userid : " + userid);
		System.out.println("suser : " + suser);
		
		System.out.println(suser.get("userinfo"));
		System.out.println("-------------------------------------------------------------------------");
		
		model.addAttribute("userinfo", suser.get("userinfo"));
		
		return "page/onlyoffice";
		
		//세션에서 userinfo가져오기
		

	}
}
