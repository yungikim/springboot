package com.kmslab.one.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kmslab.one.service.DispatchService;
import com.kmslab.one.service.MongoDataService;

@RestController
@RequestMapping("/")
public class KmProcessController {
	@Autowired
	private MongoDataService md;
	
	@Autowired
	private DispatchService dispatchService;
	
	
	@PostMapping("/{action}.km")
    public ResponseEntity<?> handleKmRequest(
            @PathVariable("action") String action,
            @RequestBody(required = false) Map<String, Object> requestData,
            @RequestAttribute("userId") String userId,
            @RequestAttribute("depts") String depts
    		) {
        
        try {
            // 디스패처 서비스로 위임
        	System.out.println("action ==> " + userId + "/" + action);
            Object response = dispatchService.dispatch(action, requestData, userId, depts);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Internal server error"));
        }
    }
	
}
