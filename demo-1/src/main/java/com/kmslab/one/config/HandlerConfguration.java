package com.kmslab.one.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.kmslab.one.service.ApiHandler;

@Configuration
public class HandlerConfguration {
	@Bean
	public Map<String, ApiHandler> handlerMap(ApplicationContext context){
		Map<String, ApiHandler> handlerMap = new HashMap<>();
		
		//Spring 컨텍스트에서 ApiHandler 타입의 모든 빈 가져오기
		Map<String, ApiHandler> handlers = context.getBeansOfType(ApiHandler.class);
		
		//빈 이름을 키로, 핸들러 인스턴스를 값으로 저장
		handlers.forEach((beanName, handler) ->{
			handlerMap.put(beanName, handler);
			System.out.println("Registered handler : " + beanName + " -> " + handler.getClass().getSimpleName() );
		});
		
		return handlerMap;
	}
}
