package com.kmslab.one.handler;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.kmslab.one.service.ApiHandler;
import com.kmslab.one.service.MongoDataService;
import com.kmslab.one.service.ResInfo;

@Component("portal_favorite_info")
public class Portal_favorite_info implements ApiHandler{
	@Autowired
	private MongoDataService mongoDataService;
	
	@Override
	public Object handle(Map<String, Object> requestData, String userId) {
		ResInfo result = mongoDataService.portal_favorite_info(userId);
		return result;
	}
}
