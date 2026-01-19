package com.kmslab.one.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DispatchService {

	@Autowired
	private Map<String, ApiHandler> handlerMap;

	public Object dispatch(String action, Map<String, Object> requestData, String userId, String depts) {
		//핸들러 앱에서 적절한 핸들러 찾기
		ApiHandler handler = handlerMap.get(action);
		
		if (handler == null) {
			throw new IllegalArgumentException("Unknown action : " + action);
		}
		
		//핸들러 실행
		return handler.handle(requestData, userId, depts);
	}
}
