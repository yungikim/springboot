package com.kmslab.one.service;

import java.util.Map;
import java.util.Set;

/*
 * 멀티 액션 핸들러 인터페이스
 * 하나의 핸들러가 여러 action을 처리합니다.
 */
public interface MultiActionHandler {
	/*
	 * 이 핸들러가 처리 할 수 있는 action목록
	 */	
	Set<String> getSupportedActions();	

	Object handle(String action, Map<String, Object> requestData, String userId, String depts);

}
