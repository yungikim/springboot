package com.kmslab.one.controller.restapi;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kmslab.one.service.user.UserService;

@RestController
@RequestMapping("/api/user")
public class UserRestAPIController {
	private final UserService userService;
	
	public UserRestAPIController(UserService userService) {
		this.userService = userService;
	}
	
	@PostMapping("/search_user_multi.km")
	public Object search_user_multi(@RequestParam Map<String, Object> requestData) {
		String jsonStr = requestData.keySet().iterator().next();
		
		ObjectMapper mapper = new ObjectMapper();
		try {
			Map<String, Object> actualData = mapper.readValue(jsonStr, new TypeReference<Map<String, Object>>(){});
			
			String name = actualData.get("name").toString();
			String companycode = actualData.get("companycode").toString();
			return userService.search_user_multi(name, companycode);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return null;
		}		
	}
	
	@GetMapping("/search_company.km")
	public Object search_company(@RequestParam Map<String, Object> requestData) {
		return userService.search_company(requestData);
	}
	
	@PostMapping("/search_dept_to_sub.km")
	public Object search_dept_to_sub(@RequestBody Map<String, Object> requestData) {		
		return userService.search_dept_to_sub(requestData);		
	}
	
	@PostMapping("/search_dept_to_person.km")
	public Object search_dept_to_person(@RequestBody Map<String, Object> requestData) {		
		return userService.search_dept_to_person(requestData);		
	}
	
	
	
}
