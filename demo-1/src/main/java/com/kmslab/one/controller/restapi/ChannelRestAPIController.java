package com.kmslab.one.controller.restapi;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kmslab.one.service.channel.ChannelService;

@RestController
@RequestMapping("/api/channel")
public class ChannelRestAPIController {
	private final ChannelService channelService;
	
	public ChannelRestAPIController(ChannelService channelService) {
		this.channelService = channelService;
	}
	
	@PostMapping("/channel_info_unread.km")
	public Object channel_info_unread(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return channelService.channel_info_unread(requestData);
	}
	
	@PostMapping("/channel_info_list.km")
	public Object channel_info_list(@RequestBody(required=false) Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		if (requestData == null) {
			requestData = new HashMap<>();
		}
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return channelService.channel_info_list(requestData);
	}
	
	@PostMapping("/search_info.km")
	public Object search_info(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return channelService.search_info(requestData);
	}
	
	@PostMapping("/channel_info_unread_info.km")
	public Object channel_info_unread_info(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return channelService.channel_info_unread_info(requestData);
	}
	
	@PostMapping("/channel_main_year_info.km")
	public Object channel_main_year_info(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return channelService.channel_main_year_info(requestData);
	}
	
	@PostMapping("/channel_options_read.km")
	public Object channel_options_read(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return channelService.channel_options_read(requestData);
	}
	
	@PostMapping("/channel_read_update.km")
	public Object channel_read_update(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return channelService.channel_read_update(requestData);
	}
	
	@PostMapping("/channel_list.km")
	public Object channel_list(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		
		String query_type = requestData.get("query_type").toString();
		if (query_type.equals("favoritecontent")) {
			//return channelService.list_channel_favorite(requestData);
			return channelService.channel_list(requestData);
		}else {
			return channelService.channel_list(requestData);
		}	
	}
	
	@PostMapping("/wlog_box.km")
	public Object wlog_box(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return channelService.wlog_box(requestData);
	}
	
	@PostMapping("/read_notice.km")
	public Object read_notice(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return channelService.read_notice(requestData);
	}
	
	@PostMapping("/create_channel.km")
	public Object create_channel(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return channelService.create_channel(requestData);
	}
	
	@PostMapping("/plugin.km")
	public Object plugin(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return channelService.plugin(requestData);
	}
	
	@PostMapping("/channel_delete.km")
	public Object channel_delete(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return channelService.channel_delete(requestData);
	}
	
	@PostMapping("/move_folder_channel.km")
	public Object move_folder_channel(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return channelService.move_folder_channel(requestData);
	}
}
