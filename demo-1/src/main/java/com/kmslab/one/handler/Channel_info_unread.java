package com.kmslab.one.handler;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

import com.kmslab.one.config.AppConfig;
import com.kmslab.one.service.ApiHandler;
import com.kmslab.one.service.ResInfo;

@Component("channel_info_unread")
public class Channel_info_unread implements ApiHandler{

    private final AppConfig.JwtProvider jwtProvider;
    
	@Autowired
	@Qualifier("channelInfo")
	private MongoTemplate channelInfo;
	
	private static final String COLLECTION_NAME = "channel";

    Channel_info_unread(AppConfig.JwtProvider jwtProvider) {
        this.jwtProvider = jwtProvider;
    } 
	
	@Override
	public Object handle(Map<String, Object> requestData, String userId, String depts) {
		try {
			//파리메터 검증
			requestData.put("email", userId);
			if (!requestData.containsKey("email")) {
				return ResInfo.error("email parameter is required");
			}
			
			//String email = requestData.get("email").toString();
			//String depts = requestData.getOrDefault("depts", "").toString();
			String email = userId;
			
			//쿼리 생성
			Query query = buildQuery(email, depts);
			
			//MongoDB 조회
			List<Document> channels = channelInfo.find(query, Document.class, COLLECTION_NAME);
			
			//읽지 않은 메시지 카운트 계산
			UnreadResult result = calculateUnreadCount(channels, email);
			
			//응답 생성
			Map<String, Object> responseData = new HashMap<>();
			responseData.put("result", result.hasUnread ? "T" : "F");
			responseData.put("ucnt", result.unreadCount);
			
			return ResInfo.success(responseData)
					.addMeta("email", email)
					.addMeta("totalChannels", channels.size());
			
			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	/**
     * 쿼리 생성
     */
	private Query buildQuery(String email, String depts) {
		Query query = new Query();
		
		//1. readers 조건
		if (depts != null && !depts.isEmpty()) {
			//부서 정보가 있는 경우
			List<String> readerList = new ArrayList<>();
			readerList.add(email);
			
			String[] deptArray = depts.split("-spl-");
			for (String dept : deptArray) {
				if (!dept.trim().isEmpty()) {
					readerList.add(dept);
				}
			}
			
			query.addCriteria(Criteria.where("readers").in(readerList));
		}else {
			Pattern regex = Pattern.compile(email, Pattern.CASE_INSENSITIVE);
			query.addCriteria(Criteria.where("readers").regex(regex));
		}
		
		//2. exit_user에 포함되지 않은 것
		query.addCriteria(Criteria.where("exit_user").nin(email));
		
		//3. type이 folder가 아닌 것
		query.addCriteria(Criteria.where("type").ne("folder"));
		
		//4. 정렬
		query.with(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Order.asc("ch_share"),
					org.springframework.data.domain.Sort.Order.asc("ch_name")
				));
		
		return query;
		
	}
	
	/**
     * 일지 않은 메시지 카운트 계산
     */
	private UnreadResult calculateUnreadCount(List<Document> channels, String email) {
		UnreadResult result = new UnreadResult();
		result.hasUnread = false;
		result.unreadCount = 0;
		
		for (Document channel : channels) {
			//lastUpdate 필드가 없으면 스킵
			if (!channel.containsKey("lastUpdate")) {
				continue;
			}
			
			String lastUpdateTime = channel.getString("lastUpdate");
			
			//read_time 필드가 없으면 읽지 않은 것으로 간주
			if (!channel.containsKey("read_time")) {
				result.hasUnread = true;
				result.unreadCount++;
				continue;
			}
			
			//read_time 리스트에서 해당 사용자의 읽은 시간 찾기
			@SuppressWarnings("uncheckd")
			List<Document> readTimeList = (List<Document>)channel.get("read_time");
			
			boolean isUnread = checkUnread(readTimeList, email, lastUpdateTime);
			if (isUnread) {
				result.hasUnread = true;
				result.unreadCount++;
			}
		}
		return result;
	}
	
	/**
     * 특정 채널이 읽지 않은 상태인지 확인
     */
	private boolean checkUnread(List<Document> readTimeList, String email, String lastUpdateTime) {
		for (Document readTime : readTimeList) {
			//email 필드가 없으면 스킵
			if (!readTime.containsKey("email")) {
				continue;
			}
			
			String readEmail = readTime.get("email").toString();
			
			//해당 사용자의 읽은 시간 찾기
			if (email.equals(readEmail)) {
				//time 필드가 없으면 읽지 않은 것으로 간주
				if (!readTime.containsKey("time")) {
					return true;
				}
				
				String readTimeValue = readTime.getString("time");
				try {
					long lastUpdate = Long.parseLong(lastUpdateTime);
					long userReadTime = Long.parseLong(readTimeValue);
					
					//마지막 업데이트 시간이 사용자가 읽은 시간보다 이후면 읽지 않은 것
					if (lastUpdate > userReadTime) {
						return true;
					}
				}catch(NumberFormatException e) {
					e.printStackTrace();
					return true;
				}
				//해당 사용자의 읽은 시간을 찾았으므로 루프 종료
				return false;
			}			
			
		}
		//read_time 리스트에 해당 사용자가 없으면 읽지 않은 것으로 간주
		return true;
	}
	
	
	/**
     * 읽지 않은 메시지 결과
     */
	private static class UnreadResult{
		boolean hasUnread;
		int unreadCount;
	}
	
}
