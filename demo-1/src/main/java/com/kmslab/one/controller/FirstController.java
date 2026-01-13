package com.kmslab.one.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FirstController {
	@GetMapping("/hi")
	public String niceToMeetYou(Model model) {
		model.addAttribute("username", "ygjmium");
		return "greetings";
	}
	
	@GetMapping("/bye")
	public String seeYouNext(Model model) {
		model.addAttribute("nickname", "이런 젠");
		return "goodbye";
	}
	
	
	
	@Autowired
	private MongoTemplate mongoTemplate;
	@GetMapping("/api/{collectionName}")
	public List<Map> findAll(@PathVariable("collectionName") String collectionName){
		return mongoTemplate.findAll(Map.class, collectionName);
	}
	
}
