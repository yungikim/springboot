package com.kmslab.one.util;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.bson.Document;
import org.bson.types.ObjectId;

/**
 * MongoDB Document를 JSON 직렬화 가능한 Map으로 변환하는 유틸리티
 */
public class DocumentConverter {
    
    /**
     * 단일 Document를 Map으로 변환 (간단 버전)
     * @param document MongoDB Document
     * @return Map<String, Object>
     */
    public static Map<String, Object> toMap(Document document) {
        if (document == null) {
            return null;
        }
        return new HashMap<>(document);
    }
    
    /**
     * Document 리스트를 Map 리스트로 변환
     * @param documents Document 리스트
     * @return Map 리스트
     */
    public static List<Map<String, Object>> toMapList(List<Document> documents) {
        if (documents == null) {
            return new ArrayList<>();
        }
        return documents.stream()
            .map(DocumentConverter::toCleanMap)
            .collect(Collectors.toList());
    }
    
    /**
     * Document를 깔끔한 Map으로 변환
     * - ObjectId는 String으로 변환
     * - 중첩된 Document도 재귀적으로 변환
     * - null 값 제거 (선택사항)
     * 
     * @param document MongoDB Document
     * @return 변환된 Map
     */
    public static Map<String, Object> toCleanMap(Document document) {
        if (document == null) {
            return null;
        }
        
        Map<String, Object> result = new HashMap<>();
        
        document.forEach((key, value) -> {
            Object converted = convertValue(value);
            if (converted != null) {  // null 값은 제외 (필요시 주석 처리)
                result.put(key, converted);
            }
        });
        
        return result;
    }
    
    /**
     * 값을 적절한 타입으로 변환
     */
    private static Object convertValue(Object value) {
        if (value == null) {
            return null;
        }
        
        // ObjectId를 String으로 변환
        if (value instanceof ObjectId) {
            return value.toString();
        }
        
        // 중첩된 Document를 Map으로 변환
        if (value instanceof Document) {
            return toCleanMap((Document) value);
        }
        
        // List 처리
        if (value instanceof List) {
            List<?> list = (List<?>) value;
            return list.stream()
                .map(DocumentConverter::convertValue)
                .collect(Collectors.toList());
        }
        
        // Map 처리
        if (value instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) value;
            Map<String, Object> converted = new HashMap<>();
            map.forEach((k, v) -> {
                converted.put(k.toString(), convertValue(v));
            });
            return converted;
        }
        
        // 기본 타입은 그대로 반환
        return value;
    }
    
    /**
     * Document를 Map으로 변환 (null 값 포함)
     */
    public static Map<String, Object> toCleanMapWithNull(Document document) {
        if (document == null) {
            return null;
        }
        
        Map<String, Object> result = new HashMap<>();
        
        document.forEach((key, value) -> {
            result.put(key, convertValue(value));
        });
        
        return result;
    }
    
    /**
     * Document를 JSON 문자열로 변환
     */
    public static String toJsonString(Document document) {
        if (document == null) {
            return "{}";
        }
        return document.toJson();
    }
}