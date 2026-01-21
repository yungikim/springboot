package com.kmslab.one.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class DispatchService {

//	@Autowired
//	private Map<String, MultiActionHandler> handlerMap;
	
	private final Map<String, MultiActionHandler> actionHandlerMap = new HashMap<>();
	
	@Autowired
	public DispatchService(List<MultiActionHandler> handlers) {
		// 모든 MultiActionHandler 빈을 순회하면서
		// 각 핸들러가 지원하는 액션들을 맵에 등록
		for (MultiActionHandler handler : handlers) {
			for (String action : handler.getSupportedActions()) {
				actionHandlerMap.put(action, handler);
				//log.info("액션 등록: {} -> {}", action, handler.getClass().getSimpleName());
			}
		}
	}
	
	public Object dispatch(String action, Map<String, Object> requestData, String userId, String depts) {
		log.debug("디스패치 : action={}, userId={}", action, userId);	         
        
		MultiActionHandler handler = actionHandlerMap.get(action);
		
		if (handler == null) {
			throw new IllegalArgumentException("Unknow action : " + action);
		}
		
		return handler.handle(action, requestData, userId, depts);
	}
	
	
}
