package com.kmslab.one.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.BasicQuery;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/data")
public class RestApiController {
	
	@Autowired
	@Qualifier("testMongoTemplate")
	private MongoTemplate testTemplate;
	
	@Autowired
	@Qualifier("GPT")
	private MongoTemplate GPTTemplate;
	
	@GetMapping("/query/{collectionName}")
	public List<Map> findAll(@PathVariable("collectionName") String collectionName){
		return GPTTemplate.findAll(Map.class, collectionName);
	}	
	
	@PostMapping("/save/{collectionName}")
	public Map<String, Object> saveRawJson(@PathVariable("collectionName") String collectionName, @RequestBody Map<String, Object> jsonData){		
		testTemplate.insert(jsonData, collectionName);
		return jsonData;
	}	
	
	@PostMapping("/save_test")
	public Map<String, Object> save_test(@RequestBody Map<String, Object> jsonData){		
        // 2. 해당 DB의 컬렉션에 저장
		testTemplate.insert(jsonData, "data");        
        return jsonData;
	}
	
	@PostMapping("/query_data")
	public List<Map> query_test(@RequestBody Map<String, Object> jsonData){
		String key = jsonData.get("key").toString();
		String code = jsonData.get("code").toString();		
		String jsonQuery = "{'bun' : "+key+"}";		
		BasicQuery query = new BasicQuery(jsonQuery);		
		return testTemplate.find(query, Map.class, "data");
	}
}
