package com.kmslab.one.controller.restapi;

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
	public Object channel_info_list(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return channelService.channel_info_list(requestData);
	}
	
	
}
