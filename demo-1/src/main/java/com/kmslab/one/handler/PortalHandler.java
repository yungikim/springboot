package com.kmslab.one.handler;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

import com.google.gson.JsonObject;
import com.kmslab.one.service.MultiActionHandler;
import com.kmslab.one.service.ResInfo;
import com.kmslab.one.util.DocumentConverter;
import com.kmslab.one.util.Utils;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Projections;

@Component
public class PortalHandler implements MultiActionHandler{
	
	@Autowired
	@Qualifier("appstore")
	private MongoTemplate appstore;	
	private final String COLLECTION_appstore = "app";
	
	@Autowired
	@Qualifier("channelInfo")
	private MongoTemplate channelInfo;	
	private final String COLLECTION_channelInfo = "channel";
	
	@Autowired
	@Qualifier("TODO")
	private MongoTemplate TODO;	
	private final String COLLECTION_TODO = "data";
	
	@Autowired
	@Qualifier("portaldb")
	private MongoTemplate  PortalDB;
	private final String COLLECTION_favorite = "favorite";
	
	@Autowired
	@Qualifier("portlet")
	private MongoTemplate portlet;	
	private final String COLLECTION_portlet = "user";
	
	@Autowired
	@Qualifier("collection")
	private MongoTemplate collection;	
	private final String COLLECTION_collection = "data"; 
	
	@Autowired
	@Qualifier("TODO_Folder")
	private MongoTemplate TODO_Folder;	
	private final String COLLECTION_TODO_Folder = "folder";

	@Autowired
	@Qualifier("todoMain")
	private MongoTemplate todoMain;
	
	
	@Override
	public Set<String> getSupportedActions(){
		return Set.of(
				"appstore_list",
				"channel_info_unread",
				"my_asign_work",
				"my_receive_work",
				"my_space_portal",
				"portal_favorite_info",
				"portlet_person_list_portal",
				"save_person_portlet",
				"search_collection",
				"search_item_todo",
				"todo_list"
		);				
	}
	
	@Override
	public Object handle(String action, Map<String, Object> requestData, String userId, String depts) {
		return switch(action) {
		case "appstore_list" -> appstore_list(requestData, userId, depts);
		case "channel_info_unread" -> channel_info_unread(requestData, userId, depts);
		case "my_asign_work" -> my_asign_work(requestData, userId, depts);
		case "my_receive_work" -> my_receive_work(requestData, userId, depts);
		case "my_space_portal" -> my_space_portal(requestData, userId, depts);
		case "portal_favorite_info" -> portal_favorite_info(requestData, userId, depts);
		case "portlet_person_list_portal" -> portlet_person_list_portal(requestData, userId, depts);
		case "save_person_portlet" -> save_person_portlet(requestData, userId, depts);
		case "search_collection" -> search_collection(requestData, userId, depts);
		case "search_item_todo" -> search_item_todo(requestData, userId, depts);
		case "todo_list" -> todo_list(requestData, userId, depts);
		
		default -> ResInfo.error("Unknown action : " + action);
		};
	}
	
	/*
	 * 앱 스토어의 목록을 조회
	 */
	private Object appstore_list(Map<String, Object> requestData, String userId, String depts) {
		try {
			AppstoreSearchRequest request = parseRequest(requestData, userId, depts);
			if (request == null) {
				return ResInfo.error("Invalid request parameters");
			}
			
			//쿼리 생성
			Query query = buildQuery(request);
			
			//전체 카운트
			long total = appstore.count(query, Document.class, COLLECTION_appstore);
			
			//데이터 조회
			query.skip(request.start).limit(request.perpage).with(Sort.by(Sort.Direction.DESC, "sort"));
			
			List<Document> docs = appstore.find(query,  Document.class, COLLECTION_appstore);
			
			//Document를 Map으로 변환
			List<Map<String, Object>> items = DocumentConverter.toMapList(docs);
			
			//응답 생성
			Map<String, Object> responseData = new HashMap<>();
			responseData.put("response", items);
			responseData.put("total", total);
			
			return ResInfo.success(responseData).addMeta("query", request.query).addMeta("type", request.type).addMeta("isAdmin", request.isAdmin);
			
			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error("Error : " + e.getMessage());
		}
	}
	
	/**
     * 요청 파라미터 파싱
     */
	private AppstoreSearchRequest parseRequest(Map<String, Object>requestData, String userId, String depts) {
		try {
			AppstoreSearchRequest request = new AppstoreSearchRequest();
			request.query = requestData.getOrDefault("query", "").toString();
			request.start = Integer.parseInt(requestData.get("start").toString());
			request.perpage = Integer.parseInt(requestData.get("perpage").toString());
			request.isAdmin = requestData.getOrDefault("isAdmin", "").toString();
			request.type = requestData.getOrDefault("type", "").toString();
			request.email = requestData.getOrDefault("email", userId).toString();
			request.depts = requestData.getOrDefault("depts", depts).toString();
			request.category = requestData.getOrDefault("category", "").toString();
			return request;
		}catch(Exception e) {
			System.out.println("Failed to parse request : " + e.getMessage());
			return null;
		}
	}
	
	
	/**
     * 메인 쿼리 생성
     */
	private Query buildQuery(AppstoreSearchRequest request) {
		List<Criteria> andCriteria = new ArrayList<>();
		
		//1. 권한 쿼리 (관리자 여부)
		if (!request.isAdmin.equals("T")) {
			Criteria permissionCriteria = buildPermissionCriteria(request);
			if (permissionCriteria != null) {
				andCriteria.add(permissionCriteria);
			}
		}
		
		//2. 검색어 쿼리
		if (!request.query.isEmpty()) {
			Criteria searchCriteria = buildSearchCriteria(request);
			if (searchCriteria != null) {
				andCriteria.add(searchCriteria);
			}
		}
		
		//3. 타밉 필터 (portlet, menu, mobile)
		if (!request.type.equals("all")) {
			Criteria typeCriteria = buildTypeCriteria(request.type);
			if (typeCriteria != null) {
				andCriteria.add(typeCriteria);
			}
		}
		
		//최종 쿼리 생성
		Query query = new Query();
		if (!andCriteria.isEmpty()) {
			query.addCriteria(new Criteria().andOperator(andCriteria.toArray(new Criteria[0])));
		}

		return query;
	}
	
	/**
     * 권한 관련 쿼리 생성 (일반 사용자용)
     */
	private Criteria buildPermissionCriteria(AppstoreSearchRequest request) {
		String email = request.email;
		String depts = request.depts;
		
		List<Criteria> orCriteria = new ArrayList<>();
		
		//readers 조건
		List<Criteria> readersAndCriteria = new ArrayList<>();
		
		if (depts != null && !depts.isEmpty()) {
			//부서 정보가 있는 경우
			List<String> readerList = new ArrayList<>();
			readerList.add(email);
			
			String[] deptArray = depts.split("\\^");
			for (String dept : deptArray) {
				if (!dept.trim().isEmpty()) {
					readerList.add(dept.trim());
				}
			}
			readersAndCriteria.add(Criteria.where("readers").in(readerList));			
		}else {
			//부서 정보가 없는 경우
			Pattern regex = Pattern.compile(email, Pattern.CASE_INSENSITIVE);
			readersAndCriteria.add(Criteria.where("readers").regex(regex));
		}
		
		//IM 사용자 체크
		if (email.toLowerCase().contains("im")) {
			readersAndCriteria.add(Criteria.where("im_disable").is("F"));
		}
		
		//readers AND 조건
		Criteria readersCriteria = new Criteria().andOperator(
				readersAndCriteria.toArray(new Criteria[0])
		);
		orCriteria.add(readersCriteria);
		
		//회사 전체 또는 개인 공개 웹
		if (depts != null && !depts.isEmpty()) {
			List<String> companyList = new ArrayList<>();
			String[] deptArray = depts.split("\\^");
			for (int i = 1; i < deptArray.length; i++) {
				companyList.add(deptArray[i].trim());
			}
			companyList.add("all");
			companyList.add(email);
			
			Criteria companyCriteria = Criteria.where("readers").in(companyList);
			orCriteria.add(companyCriteria);
		}
		
		//OR 조건으로 결함
		if (orCriteria.isEmpty()) {
			return null;
		}
		
		return new Criteria().orOperator(
				orCriteria.toArray(new Criteria[0])
		);
	}
	
	/**
     * 검색어 쿼리 생성
     */
	
	private Criteria buildSearchCriteria(AppstoreSearchRequest request) {
		String word = request.query;
		String category = request.category;
		
		Pattern regex = Pattern.compile(word, Pattern.CASE_INSENSITIVE);
		List<Criteria> orCriteria = new ArrayList<>();
		
		if (category.equals("title")) {
			//제목으로 검색 (한글, 영문)
			orCriteria.add(Criteria.where("menu_kr").regex(regex));
			orCriteria.add(Criteria.where("menu_en").regex(regex));
		}else if (category.equals("code")) {
			//코드로 검색
			orCriteria.add(Criteria.where("code").regex(regex));
		}else {
			//기본 : 제목 검색
			orCriteria.add(Criteria.where("menu_kr").regex(regex));
			orCriteria.add(Criteria.where("menu_en").regex(regex));
		}
		
		if (orCriteria.isEmpty()) {
			return null;
		}
		
		return new Criteria().orOperator(orCriteria.toArray(new Criteria[0]));
	}
	
	
	/**
     * 타입 필터 쿼리 생성
     */
	
	private Criteria buildTypeCriteria(String type) {
		switch(type) {
		case "portlet":
			return Criteria.where("disp_portlet").is("T");
		case "menu":
			return Criteria.where("disp_menu").is("T");
		case "mobile":
			return Criteria.where("disp_mobile").is("T");
		default:
			return null;
		}
	}
	
	
	 /**
     * 요청 파라미터 DTO
     */
	private static class AppstoreSearchRequest{
		String query;
		int start;
		int perpage;
		String isAdmin;
		String type;
		String email;
		String depts;
		String category;
	}
	
	
	////////////////////////////////////////////////////////////////////////////////////////////
	/// channel_info_unread
	/// ////////////////////////////////////////////////////////////////////////////////////////
	private Object channel_info_unread(Map<String, Object> requestData, String userId, String depts) {
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
			List<Document> channels = channelInfo.find(query, Document.class, COLLECTION_channelInfo);
			
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
	
	////////////////////////////////////////////////////////////////////////////////////////////
	/// my_asign_work
	/// ////////////////////////////////////////////////////////////////////////////////////////
	private Object my_asign_work(Map<String, Object> requestData, String userId, String depts) {
		try {
			String ky = "";
			if ( requestData.containsKey("ky")) {
				ky = requestData.get("ky").toString();
			}else {
				ky = userId;
			}
			
			//1. 내가 요청한 업무 조회 (완료, 취소 제외)
			List<Map<String, Object>> myResuestList = getMyRequestWorks(ky);
			
			//2. 내가 참조로 등러가 있는 업무 조회(완료, 취소 제외)
			List<Map<String, Object>> myRefList = getMyReferencedWorks(ky);
			
			//응답 생성
			Map<String, Object> responseData = new HashMap<>();
			responseData.put("list", myResuestList);
			responseData.put("ref", myRefList);
			
			return ResInfo.success(responseData).addMeta("ky", ky).addMeta("totalRequested", myResuestList.size()).addMeta("totalReferenced", myRefList.size());
			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	/**
     * 내가 요청한 업무 조회
     * - owner.ky가 나인 업무
     * - asignee가 존재하는 업무
     * - status가 3(완료), 4(취소)가 아닌 업무
     */
	private List<Map<String, Object>> getMyRequestWorks(String ky){
		//쿼리 생성
		Query query = new Query();
		query.addCriteria(Criteria.where("owner.ky").is(ky));
		query.addCriteria(Criteria.where("status").nin(Arrays.asList("3","4")));
		query.addCriteria(Criteria.where("asignee").exists(true));
		
		//제외할 필드 지정
		query.fields().exclude("express");
		
		//정렬 (GMT 내림차순)
		query.with(Sort.by(Sort.Direction.DESC, "GMT"));
		
		//MonogoDB 조회
		List<Document> docs = TODO.find(query, Document.class, COLLECTION_TODO);
		
		//결과 처리
		List<Map<String, Object>> result = new ArrayList<>();
		for (Document doc : docs) {
			//file, reply 카운트 계산
			List<Document> files = doc.getList("file", Document.class, new ArrayList<>());
			List<Document> replys = doc.getList("reply", Document.class, new ArrayList<>());
			
			//file_count, reply_count 추가
			doc.put("file_count", files.size());
			doc.put("reply_count", replys.size());
			
			//file, reply필드 제거
			doc.remove("file");
			doc.remove("reply");
			
			//Document를 Map으로 변환
			result.add(DocumentConverter.toCleanMap(doc));
		}
		return result;
	}
	
	 /**
     * 내가 참조로 들어가 있는 업무 조회
     * - ref.ky에 내가 포함된 업무
     * - status가 3(완료), 4(취소)가 아닌 업무
     */
	private List<Map<String, Object>> getMyReferencedWorks(String ky){
		//쿼리 생성
		Query query = new Query();
		query.addCriteria(Criteria.where("ref.ky").is(ky));
		query.addCriteria(Criteria.where("status").nin(Arrays.asList("3","4")));
		
		//제외할 필드 설정
		query.fields().exclude("express");
		
		//정렬
		query.with(Sort.by(Sort.Direction.DESC, "GMT"));
		
		//mongoDB조회
		List<Document> docs = TODO.find(query, Document.class, COLLECTION_TODO);
		
		//결좌 처리
		List<Map<String, Object>> result = new ArrayList<>();
		for(Document doc : docs) {
			//file, reply카운트 계산
			List<Document> files = doc.getList("file", Document.class, new ArrayList<>());
			List<Document> replys = doc.getList("reply", Document.class, new ArrayList<>());
			
			//file_count, reply_count 추가
			doc.put("file_count", files.size());
			doc.put("reply_count", replys.size());
			
			//file, reply 필드 제거
			doc.remove("file");
			doc.remove("reply");
			
			//Document를 Map으로 전환
			result.add(DocumentConverter.toCleanMap(doc));
		}
		return result;
	}
	
	
	/*
	 * my_receive_work
	 */
	private Object my_receive_work(Map<String, Object> requestData, String userId, String depts) {
		try {
			String ky = "";
			if (requestData.containsKey("email")) {
				ky = requestData.get("email").toString();
			}
			if (ky.equals("")) {
				ky = userId;
			}

			if (ky.isEmpty()) {
				return ResInfo.error("email or ky parameter is required");
			}
			
			//1. 담당자가 나로 지정된 업무 리스트 조회 (대기중, 진행중)
			List<Map<String, Object>> assignedList = getAssignedWorks(ky);
			System.out.println(assignedList);
			
			//2. 체크리스트의 담당자가 나로 지정된 업무 리스트 조회
			List<Map<String, Object>> checkListWorks = getCheckListWorks(ky);
			System.out.println(checkListWorks);
			
			//응답 생성
			Map<String, Object> responseData = new HashMap<>();
			responseData.put("list", assignedList);
			responseData.put("checklist", checkListWorks);
			
			return ResInfo.success(responseData).addMeta("ky", ky).addMeta("totalAssigned", assignedList.size())
					.addMeta("totalChecklist",  checkListWorks.size());
			
			
		}catch(Exception e) {
			return ResInfo.error(e.getMessage());
		}
	}
	
	
	/**
     * 담당자가 나로 지정된 업무 리스트 조회
     * status: 1(대기중), 2(진행중)만 조회
     */
	private List<Map<String, Object>> getAssignedWorks(String ky){
		Query query = new Query();
		query.addCriteria(Criteria.where("asignee.ky").is(ky));
		query.addCriteria(Criteria.where("status").in(Arrays.asList("1", "2")));
		
		//제외할 필드 지정
		query.fields().exclude("express");
		
		//정렬 (GMT 내림차순)
		query.with(Sort.by(Sort.Direction.DESC,"GMT"));
		
		//mongodb 조회
		List<Document> docs = TODO.find(query, Document.class, COLLECTION_TODO);
		
		//결롸 처리
		List<Map<String, Object>> result = new ArrayList<>();
		for (Document doc : docs) {
			//file, reply 카운트 계산
			List<Document> files = doc.getList("file", Document.class, new ArrayList<>());
			List<Document> replys = doc.getList("reply", Document.class, new ArrayList<>());
			
			//file_count, reply_count 추가
			doc.put("file_count", files.size());
			doc.put("reply_count", replys.size());
			
			//file, reply 필드 제거
			doc.remove("file");
			doc.remove("reply");
			
			//Document를 Map으로 변환
			result.add(DocumentConverter.toCleanMap(doc));
		}
		return result;
	}
	
	/**
     * 체크리스트의 담당자가 나로 지정된 업무 리스트 조회
     * checklist.complete가 F인 것만 조회
     */
	private List<Map<String, Object>> getCheckListWorks(String ky){
		//쿼리 생성
		Query query = new Query();
		query.addCriteria(Criteria.where("checklist.asign.ky").is(ky));
		query.addCriteria(Criteria.where("checklist.complete").is("F"));
		
		//제외할 필드
		query.fields().exclude("express");
		
		//정렬
		query.with(Sort.by(Sort.Direction.ASC, "project_name"));
		
		//MongoDB 조회
		List<Document> docs = TODO.find(query,  Document.class, COLLECTION_TODO);
		
		//결좌 처리
		List<Map<String, Object>> result = new ArrayList<>();
		for (Document doc : docs) {
			result.add(DocumentConverter.toCleanMap(doc));
		}
		
		return result;
	}
	
	/*
	 * my_space_portal
	 */
	private Object my_space_portal(Map<String, Object> requestData, String userId, String depts) {
		try {
			String email = userId;
			String type = requestData.get("type").toString();
			
			if (email == null || type == null) {
				return ResInfo.error("email and type are required");
			}
			
			Query query = new Query();
			
			if ("you".equals(type)) {
				query.addCriteria(Criteria.where("owner.ky").is(email));
			}else {
				query.addCriteria(Criteria.where("asignee.ky").is(email));
			}
			
			List<String> statusList = Arrays.asList("1", "2");
			query.addCriteria(Criteria.where("status").in(statusList));
			
			if ("you".equals(type)) {
				query.addCriteria(
						new Criteria().andOperator(
								Criteria.where("asignee.ky").exists(true),
								Criteria.where("asignee.ky").nin(null, "")
						)
				);
			}
			
			//System.out.println("query : " + query);
			//MongoDB 조회하기
			List<Document> docs = TODO.find(query, Document.class, COLLECTION_TODO);
			
			//Document를 Map으로 변환
			List<Map<String, Object>> items = DocumentConverter.toMapList(docs);
			
			return ResInfo.successList(items)
					.addMeta("totalCount", items.size())
					.addMeta("email", email)
					.addMeta("type", type);
		
			
			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error("Error : " + e.getMessage());
		}
	}
	
	/*
	 * portal_favorite_info
	 */
	private Object portal_favorite_info(Map<String, Object> requestData, String userId, String depts) {
		ResInfo res = new ResInfo();
		try {
			Criteria criteria = new Criteria().where("ky").is(userId);
			Query query = new Query(criteria);
			
			Document doc = PortalDB.findOne(query, Document.class, COLLECTION_favorite);
			if (doc != null) {
				res.setData(DocumentConverter.toCleanMap(doc));
			}
			res.setResult("OK");
			
		}catch(Exception e) {
			res.setResult("ERROR");
			e.printStackTrace();
		}
		return res;
	}
	
	/*
	 * portlet_person_list_portal
	 */
	private Object portlet_person_list_portal(Map<String, Object> requestData, String userId, String depts) {
		try {			
			Query query = new Query();
			query.addCriteria(Criteria.where("ky").is(userId));			
			Document doc = portlet.findOne(query, Document.class, COLLECTION_portlet);
			
			if (doc != null) {				
				return ResInfo.success(DocumentConverter.toCleanMap(doc));
			}else {
				Query query2 = new Query();
				query2.addCriteria(Criteria.where("ky").is("default"));
				Document sdoc = portlet.findOne(query2,  Document.class, COLLECTION_portlet);
				return ResInfo.success(DocumentConverter.toCleanMap(sdoc));
			}
			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error("Error : " + e.getMessage());
		}
	}
	
	/*
	 * save_person_portlet
	 */
	private Object save_person_portlet(Map<String, Object> requestData, String userId, String depts) {
		try {
			String ky = requestData.get("ky").toString();
			
//			Query query = new Query();
//			query.addCriteria(Criteria.where("email").is(ky));
			Utils utils = new Utils();
			
			Document query = new Document("email", ky);
			
			Document doc = new Document(requestData);
			doc.put("GMT", utils.GMTDate());
			doc.put("email", userId);
			doc.put("depts",  depts);
			
			//MongoCollection 가져오기
			MongoCollection<Document> collection = portlet.getCollection(COLLECTION_portlet).withDocumentClass(Document.class);
						
			//findOneAndReplace 실행
			Document replaceDoc = collection.findOneAndReplace(query, doc);
			if (replaceDoc == null) {
				System.out.println("없어서 추가한다.");
				collection.insertOne(doc);
			}
			
			return ResInfo.success();
					
			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	/*
	 * search_collection
	 */
	private Object search_collection(Map<String, Object> requestData, String userId, String depts) {
		try {
			requestData.put("email", userId);
			CollectionSearchRequest request = parseRequest(requestData);
			if (request == null) {
				return ResInfo.error("Invalid request parameters");
			}
			
			//부서 리스트 생성
			List<String> deptList = buildDeptList(request.email, request.depts);
			
			//쿼리 빌드
			QuerySet querySet = buildQuerySet(request,  deptList);
			
			//카운트 계산
			CountResult counts = calculateCounts(querySet);
			
			//최종 쿼리 선택 및 실행
			Query finalQuery = selectFinalQuery(request,  querySet);
			List<Document> docs = executeFinalQuery(request, finalQuery, querySet.tempQuery);
			
			//Document를 Map으로 변환
			List<Map<String, Object>> items = DocumentConverter.toMapList(docs);
			
			//응답 생성
			Map<String, Object> responseData = new HashMap<>();
			responseData.put("data", items);
			responseData.put("total", counts.total);
			responseData.put("t1", counts.list1);
			responseData.put("t2", counts.list2);
			responseData.put("t3", counts.list3);
			responseData.put("t4", counts.list4);
			
			return ResInfo.success(responseData)
					.addMeta("opt", request.opt).addMeta("type", request.type);
			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error("Error: " + e.getMessage());
		}
	}
	
	/**
	* 요청 파라미터 파싱
	**/
	private CollectionSearchRequest parseRequest(Map<String, Object> requestData) {
		try {
			CollectionSearchRequest request = new CollectionSearchRequest();
			request.email = requestData.get("email").toString();
			request.start = Integer.parseInt(requestData.get("start").toString());
			request.perpage = Integer.parseInt(requestData.get("perpage").toString());
			request.type = requestData.get("type").toString();
			request.opt = requestData.get("opt").toString();
			request.day = requestData.get("day").toString();
			request.dcode = requestData.get("dcode").toString();
			request.depts = requestData.containsKey("depts") ? requestData.get("depts").toString() : "";
			return request;
		}catch(Exception e) {
			e.printStackTrace();
			return null;
		}
	}
	
	/**
     * 부서 리스트 생성
   */
	private List<String> buildDeptList(String email, String depts){
		List<String> deptList = new ArrayList<>();
		deptList.add(email);
		
		if (depts != null && !depts.isEmpty()) {
			String[] deptArray = depts.split("-spl-");
			if (deptArray.length > 0) {
				String myDept = deptArray[deptArray.length -1];
				deptList.add(myDept);
			}
		}
		return deptList;
	}
	
	/**
	* 모든 쿼리 세트 빌드
	**/
	private QuerySet buildQuerySet(CollectionSearchRequest request, List<String> deptList) {
		QuerySet querySet = new QuerySet();
		
		//기본 쿼리(readers)
		Query baseQuery = new Query();
		baseQuery.addCriteria(Criteria.where("readers").in(deptList));
		baseQuery.addCriteria(Criteria.where("temp").is("F"));
		
		//1. 보낸 취합 쿼리 (내가 Qwner)
		querySet.sentQuery = Query.of(baseQuery);
		querySet.sentQuery.addCriteria(Criteria.where("owner.ky").is(request.email));
		
		//2. 받은 취합 쿼리 (내가 submitter)
		querySet.receivedQuery = Query.of(baseQuery);
		querySet.receivedQuery.addCriteria(Criteria.where("submitter.ky").in(deptList));
		
		//3. 참조 취합 조건 (내가 referer)
		querySet.referenceQuery = Query.of(baseQuery);
		querySet.referenceQuery.addCriteria(Criteria.where("referrer.ky").is(request.email));
		
		//4. 전체 쿼리
		querySet.totalQuery = Query.of(baseQuery);
		
		//5. 임시저장 쿼리
		querySet.tempQuery = new Query();
		querySet.tempQuery.addCriteria(Criteria.where("temp").is("T"));
		querySet.tempQuery.addCriteria(Criteria.where("owner.ky").is(request.email));
		
		return querySet;
	}
	
	/**
	* 카운트 계산
	**/
	private CountResult calculateCounts(QuerySet querySet) {
		CountResult counts = new CountResult();
		
		counts.list1 = collection.count(querySet.sentQuery, COLLECTION_collection);
		counts.list2 = collection.count(querySet.receivedQuery, COLLECTION_collection);
		counts.list3 = collection.count(querySet.referenceQuery, COLLECTION_collection);
		counts.list4 = collection.count(querySet.tempQuery, COLLECTION_collection);
		counts.total = collection.count(querySet.totalQuery, COLLECTION_collection);
		
		return counts;
	}
	
	/**
	* opt에 따라 추가 조건 적용
	**/
	private Query applyCodition(Query query, String opt, String day, String email, String dcode) {
		Query newQuery = Query.of(query);
		
		switch(opt) {
		case "2": //취합중
			newQuery.addCriteria(Criteria.where("end_date").gte(day));
			break;
		case "3": //취합마감
			newQuery.addCriteria(Criteria.where("end_date").lte(day));
			break;
		case "4": //제출전
			List<String> notSubmitted = Arrays.asList(email, dcode);
			newQuery.addCriteria(Criteria.where("res_members").ne(notSubmitted));
			break;
		case "5": 	//제출마감
			List<String> submitted = Arrays.asList(email, dcode);
			newQuery.addCriteria(Criteria.where("res_members").in(submitted));
			break;
		case "1": //전체
		default:
			//추가 조건 없음
			break;
		}
		return newQuery;
	}
	
	/**
	* type과 opt에 따라 최종 쿼리 선택
	**/
	private Query selectFinalQuery(CollectionSearchRequest request, QuerySet querySet) {
		Query selectedQuery;
		
		//type에 따라 기본 쿼리 선택
		switch (request.type) {
		case "2":	//받은 취합
			selectedQuery = querySet.receivedQuery;
			break;
		case "3": 	//보낸 취합
			selectedQuery = querySet.sentQuery;
			break;
		case "4": 	//참조
			selectedQuery = querySet.referenceQuery;
			break;
		case "5":  	//임시저장
			selectedQuery = querySet.tempQuery;
			break;
		default:
			selectedQuery = querySet.totalQuery;
			break;
		}
		
		//opt 조건 적용
		return applyCodition(selectedQuery, request.opt, request.day, request.email, request.dcode);
	}
	
	/**
	* 최종 쿼리 실행
	**/
	private List<Document> executeFinalQuery(CollectionSearchRequest request, Query query, Query tempQuery){
		//type이 임시저장(3) 인 경우
		if ("5".equals(request.opt)) {
			return collection.find(tempQuery, Document.class, COLLECTION_collection)
					.stream()
					.skip(request.start)
					.limit(request.perpage)
					.toList();
		}
		
		//일반 쿼리 실행
		query.skip(request.start);
		query.limit(request.perpage);
		query.with(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "GMT"));
		
		return collection.find(query,  Document.class, COLLECTION_collection);
	}
	

	/**
	* 요청 파라미터 DTO
	**/
	private static class CollectionSearchRequest{
		String email;
		int start;
		int perpage;
		String type;
		String opt;
		String day;
		String dcode;
		String depts;
	}

	/**
	* 쿼리 세트
	**/
	private static class QuerySet{
		Query sentQuery;	//보낸 취합
		Query receivedQuery;	//받은 취합
		Query referenceQuery;	//참조
		Query totalQuery;		//전체
		Query tempQuery;		//임시저장
	}

	/**
	* 카운트 결과
	**/
	private static class CountResult{
		long list1;	//보낸 취합
		long list2; //받은 취합
		long list3;	//참조
		long list4;	//임시저장
		long total; //전체
	}
	
	
	/*
	 * search_item_todo
	 */
	private Object search_item_todo(Map<String, Object> requestData, String userId, String depts) {
		try {
			MongoCollection<Document> col = TODO.getCollection(COLLECTION_TODO);
			MongoCollection<Document> col2 = TODO_Folder.getCollection(COLLECTION_TODO_Folder);
			
			String key = requestData.get("key").toString();
			System.out.println("key : " + key);
				
			Document query = new Document();
			query.put("_id", new ObjectId(key));		
			
			List<String> arx = new ArrayList<>();
			arx.add("file.content");
			arx.add("file.meta");
			
			System.out.println("3333333333333333");
			
			Document sdoc = col.find(query).projection(Projections.exclude(arx)).first();
			
			System.out.println("44444444444444");
			
			if (sdoc != null) {
				System.out.println("555555555555555");
				JsonObject jx = new JsonObject();
				jx = Utils.DocumnetConvertJsonObject(sdoc);
				
				//myspace에서 할일을 바로 클릭할때 프로젝트 owner가 있어야 권한 체크를 할 수 있어 별도로 추가한다.
				Document qx = new Document();
				qx.put("_id", new ObjectId(sdoc.get("project_code").toString()));
				Document sp = col2.find(qx).first();
				if (sp != null) {
					jx.add("project_info", Utils.DocumnetConvertJsonObject(sp));
				}
				
				System.out.println("22222222222222222222222");
				
				return ResInfo.success(DocumentConverter.jsonObjectToMap(jx));

			}else {
				System.out.println("문서가 존재 하지 않습니다.");
				return ResInfo.error("don't exist document");
			}
			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
	
	/*
	 * todo_list
	 */
	private Object todo_list(Map<String, Object> requestData, String userId, String depts) {
		try {
			String ky = requestData.get("ky").toString();
			Query query = new Query();
			Criteria criteria = new Criteria().andOperator(
					Criteria.where("complete").is("F"),
					Criteria.where("ky").is(userId)
			);
			query.addCriteria(criteria);
			List<Document> docs = todoMain.find(query,  Document.class, "data");
			//Document를 Map으로 변환
			List<Map<String, Object>> items = DocumentConverter.toMapList(docs);		
			return ResInfo.successList(items);
			
		}catch(Exception e) {
			e.printStackTrace();
			return ResInfo.error(e.getMessage());
		}
	}
}
