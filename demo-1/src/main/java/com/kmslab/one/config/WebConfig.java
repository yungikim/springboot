package com.kmslab.one.config;

import org.apache.catalina.connector.Connector;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.boot.web.servlet.server.ServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.unit.DataSize;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;

import jakarta.servlet.MultipartConfigElement;

@Configuration
public class WebConfig {

    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();
        
        // 개별 파일 최대 크기
        factory.setMaxFileSize(DataSize.ofMegabytes(5500));
        
        // 전체 요청 최대 크기
        factory.setMaxRequestSize(DataSize.ofMegabytes(5500));
        
        // 메모리 임계값
        factory.setFileSizeThreshold(DataSize.ofMegabytes(3));
        
        System.out.println("=== Multipart Config Initialized ===");
        System.out.println("Max File Size: 5500MB");
        System.out.println("Max Request Size: 5500MB");
        
        return factory.createMultipartConfig();
    }

    @Bean
    public MultipartResolver multipartResolver() {
        return new StandardServletMultipartResolver();
    }

    @Bean
    public ServletWebServerFactory servletContainer() {
        TomcatServletWebServerFactory tomcat = new TomcatServletWebServerFactory();
        
        tomcat.addConnectorCustomizers((Connector connector) -> {
            connector.setMaxPostSize(-1);
            connector.setMaxSavePostSize(-1);
            
            System.out.println("=== Tomcat Connector Configured ===");
            System.out.println("Max POST Size: Unlimited");
        });
        
        return tomcat;
    }
}