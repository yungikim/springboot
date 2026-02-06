package com.kmslab.one.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class ConfigChecker {

    @Value("${spring.servlet.multipart.max-file-size:NOT_SET}")
    private String maxFileSize;

    @Value("${spring.servlet.multipart.max-request-size:NOT_SET}")
    private String maxRequestSize;

    @Value("${server.tomcat.max-http-post-size:NOT_SET}")
    private String maxPostSize;

    @PostConstruct
    public void checkConfig() {
        System.out.println("=====================================");
        System.out.println("=== Application Config Check ===");
        System.out.println("Max File Size: " + maxFileSize);
        System.out.println("Max Request Size: " + maxRequestSize);
        System.out.println("Max HTTP POST Size: " + maxPostSize);
        System.out.println("=====================================");
        
        if (maxFileSize.equals("NOT_SET")) {
            System.err.println("⚠️ WARNING: Multipart config not set!");
        }
    }
}