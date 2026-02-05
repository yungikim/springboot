package com.kmslab.one.controller.restapi;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kmslab.one.service.kgpt.KGPTService;

@RestController
@RequestMapping("/api/kgpt")
public class KGTPRestAPIController {
	private final KGPTService kgptService;
	
	public KGTPRestAPIController(KGPTService kgptService) {
		this.kgptService = kgptService;
	}
	
	@PostMapping("/ai_list_template.km")
	public Object channel_info_unread(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return kgptService.ai_list_template(requestData);
	}
	
	@PostMapping("/ai_list_person_request.km")
	public Object ai_list_person_request(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return kgptService.ai_list_person_request(requestData);
	}

	@PostMapping("/room_history.km")
	public Object room_history(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return kgptService.room_history(requestData);
	}

	@PostMapping("/gpt_over_list.km")
	public Object gpt_over_list(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return kgptService.gpt_over_list(requestData);
	}
	
	@PostMapping("/ai_notebook_list.km")
	public Object ai_notebook_list(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return kgptService.ai_notebook_list(requestData);
	}
	
	@PostMapping("/ai_note_list.km")
	public Object ai_note_list(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return kgptService.ai_note_list(requestData);
	}
	
	@PostMapping("/ai_note_info.km")
	public Object ai_note_info(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return kgptService.ai_note_info(requestData);
	}
	
	@PostMapping("/ai_notebook_info.km")
	public Object ai_notebook_info(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return kgptService.ai_notebook_info(requestData);
	}
	
	@PostMapping("/ai_notebook_title_update.km")
	public Object ai_notebook_title_update(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return kgptService.ai_notebook_title_update(requestData);
	}
	
	@PostMapping("/ai_list_mydata.km")
	public Object ai_list_mydata(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return kgptService.ai_list_mydata(requestData);
	}
	
	@PostMapping("/ai_brief_data.km")
	public Object ai_brief_data(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return kgptService.ai_brief_data(requestData);
	}
	
	@PostMapping("/ai_brief_save.km")
	public Object ai_brief_save(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return kgptService.ai_brief_save(requestData);
	}
	
	@PostMapping("/change_person_ai_request.km")
	public Object change_person_ai_request(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return kgptService.change_person_ai_request(requestData);
	}
	
	@PostMapping("/save_person_ai_request_log.km")
	public Object save_person_ai_request_log(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return kgptService.save_person_ai_request_log(requestData);
	}
	
	
	
}
