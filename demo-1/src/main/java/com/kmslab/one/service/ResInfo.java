package com.kmslab.one.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.gson.JsonObject;

/**
 * 레거시 호환을 위한 응답 클래스
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResInfo {
    
    @JsonProperty("result")
    private String result;  // "success" or "error"
    
    @JsonProperty("message")
    private String message;
    
    @JsonProperty("res3")
    private String res3;
    
    @JsonProperty("data")
    private Object data;  // 단일 객체
    
    @JsonProperty("list")
    private List<Map<String, Object>> list;  // 리스트 데이터
    
    @JsonProperty("metadata")
    private Map<String, Object> metadata;
    
    // 기본 생성자
    public ResInfo() {
        this.result = "success";
    }
    
    // 정적 팩토리 메서드
    public static ResInfo success() {
        ResInfo res = new ResInfo();
        res.setResult("OK");
        return res;
    }
    
    public static ResInfo success(Object data) {
        ResInfo res = new ResInfo();
        res.setResult("OK");
        res.setData(data);
        return res;
    }
    
    public static ResInfo success(Object data, String res3) {
        ResInfo res = new ResInfo();
        res.setResult("OK");
        res.setData(data);
        res.setData3(res3);
        return res;
    }
    
    public static ResInfo success(String message, Object data) {
        ResInfo res = new ResInfo();
        res.setResult("OK");
        res.setMessage(message);
        res.setData(data);
        return res;
    }
    
    /**
     * 성공 응답 (메시지 + JsonObject)
     */
    public static ResInfo success(JsonObject jsonObject) {
        ResInfo res = new ResInfo();
        res.setResult("success");
        res.setData(jsonObject);
        return res;
    }
    
    public static ResInfo successList(List<Map<String, Object>> list) {
        ResInfo res = new ResInfo();
        res.setResult("OK");
        res.setList(list);
        return res;
    }
    
    public static ResInfo error(String message) {
        ResInfo res = new ResInfo();
        res.setResult("ERROR");
        res.setMessage(message);
        return res;
    }
    
    // 메타데이터 추가 편의 메서드
    public ResInfo addMeta(String key, Object value) {
        if (this.metadata == null) {
            this.metadata = new HashMap<>();
        }
        this.metadata.put(key, value);
        return this;
    }
    
    // Getters and Setters
    public String getResult() {
        return result;
    }
    
    public void setResult(String result) {
        this.result = result;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public Object getData() {
        return data;
    }
    
    public void setData(Object data) {
        this.data = data;
    }
    
    public void setData3(String data) {
        this.res3 = data;
    }
    
    public List<Map<String, Object>> getList() {
        return list;
    }
    
    public void setList(List<Map<String, Object>> list) {
        this.list = list;
    }
    
    public Map<String, Object> getMetadata() {
        return metadata;
    }
    
    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }
}