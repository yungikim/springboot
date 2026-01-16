package com.kmslab.one.service;

import java.util.Map;

public interface ApiHandler {
	Object handle(Map<String, Object> requestData, String userId);
}
