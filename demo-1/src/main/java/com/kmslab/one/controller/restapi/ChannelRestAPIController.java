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
	
	@PostMapping("/appstore_list.km")
	public Object appstore_list(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return channelService.channel_info_unread(requestData);
	}
}
