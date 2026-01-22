package com.kmslab.one.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.kmslab.one.filter.SecurityFilter;

@Configuration
public class FilterConfig {
	
	private final JwtProvider jwtProvider;
	
	public FilterConfig(JwtProvider jwtProvider) {
		this.jwtProvider = jwtProvider;
	}
	
	@Bean
	public FilterRegistrationBean<SecurityFilter> loggingFilter(){		
		FilterRegistrationBean<SecurityFilter> registrationBean = new FilterRegistrationBean<>();		
		registrationBean.setFilter(new SecurityFilter(jwtProvider));
		registrationBean.addUrlPatterns("/*");  //모든 경로에 필터 적용
		registrationBean.setOrder(1);  //필터 실행 순서(낮을 수록 먼저 실행)		
		return registrationBean;
	}
}
