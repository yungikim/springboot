package com.kmslab.one.config;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.kmslab.one.service.MultiActionHandler;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
public class HandlerConfguration {
	@Bean
	public Map<String, MultiActionHandler> handlerMap(List<MultiActionHandler> handlers){
		Map<String, MultiActionHandler> map = new HashMap<>();
		
		for (MultiActionHandler handler : handlers) {
			for (String action : handler.getSupportedActions()) {
				if (map.containsKey(action)) {
					log.warn("중복 action 발견 : {} - 덥어씌워집니다.", action);
				}
				map.put(action, handler);
				log.info("핸들러 등록 : {} -> {}", action, handler.getClass().getSimpleName());
			}
		}
		
		log.info("총 {} 개의 action이 등록되었습니다.", map.size());
		return map;
	}
}
