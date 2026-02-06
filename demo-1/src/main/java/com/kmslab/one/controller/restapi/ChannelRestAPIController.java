package com.kmslab.one.controller.restapi;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kmslab.one.service.channel.ChannelService;
import com.kmslab.one.util.Utils;

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
	
	@PostMapping("/channel_list_temp.km")
	public Object channel_list_temp(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return channelService.channel_list_temp(requestData);
	}
	
	@PostMapping("/send_msg.km")
	public Object send_msg(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);		
		if (requestData.containsKey("msg_edit")) {
			String type = requestData.get("msg_edit").toString();
			String type2 = requestData.get("edit").toString();
			if (!type.equals("T") && !type2.equals("T")) {					
				requestData.put("GMT2", Utils.GMTDate());
			}
		}	
		requestData.put("GMT", Utils.GMTDate());
		return channelService.send_msg(requestData);
	}
	
	@PostMapping("/channel_data_delete.km")
	public Object channel_data_delete(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);			
		return channelService.channel_data_delete(requestData);
	}
	
	@PostMapping("/doc_info.km")
	public Object doc_info(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);		
		return channelService.doc_info(requestData);
	}
	
	@PostMapping("/channel_noticedata_save.km")
	public Object channel_noticedata_save(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);			
		return channelService.channel_noticedata_save(requestData);
	}
	
	@PostMapping("/read_notice_by_key.km")
	public Object read_notice_by_key(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);			
		return channelService.read_notice_by_key(requestData);
	}

	@PostMapping("/delete_notice.km")
	public Object delete_notice(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);			
		return channelService.delete_notice(requestData);
	}
	
	@PostMapping("/save_reply.km")
	public Object save_reply(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);			
		requestData.put("GMT2", Utils.GMTDate());
		return channelService.save_reply(requestData);
	}
	
	
}
