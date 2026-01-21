package com.kmslab.one.controller.restapi;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kmslab.one.service.collection.CollectionService;

@RestController
@RequestMapping("/api/collection")
public class CollectionRestAPIController {
	//취합 관련 함수
private final CollectionService collectionService;
	
	public CollectionRestAPIController(CollectionService collectionService) {
		this.collectionService = collectionService;
	}
	
	@PostMapping("/search_collection.km")
	public Object appstore_list(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return collectionService.search_collection(requestData);
	}
	
	@PostMapping("/search_collection_item.km")
	public Object search_collection_item(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return collectionService.search_collection_item(requestData);
	}
	
	@PostMapping("/search_collection_chat.km")
	public Object search_collection_chat(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return collectionService.search_collection_chat(requestData);
	}
}
