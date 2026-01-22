package com.kmslab.one.controller.restapi;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kmslab.one.service.files.FilesService;

@RestController
@RequestMapping("/api/files")
public class FilesRestAPIController {
private final FilesService filesService;
	
	public FilesRestAPIController(FilesService filesService) {
		this.filesService = filesService;
	}
	
	@PostMapping("/folder_list_main.km")
	public Object folder_list_main(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return filesService.folder_list_main(requestData);
	}
	
	@PostMapping("/my_drive_size.km")
	public Object my_drive_size(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return filesService.my_drive_size(requestData);
	}
	
	@PostMapping("/drive_list_all.km")
	public Object drive_list_all(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return filesService.drive_list_all(requestData);
	}
	
	@PostMapping("/folder_list.km")
	public Object folder_list(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return filesService.folder_list(requestData);
	}
	
	@PostMapping("/delete_file_list.km")
	public Object search_user_multi(@RequestParam Map<String, Object> requestData) {
		String jsonStr = requestData.keySet().iterator().next();
		
		ObjectMapper mapper = new ObjectMapper();
		try {
			Map<String, Object> actualData = mapper.readValue(jsonStr, new TypeReference<Map<String, Object>>(){});
			return filesService.delete_file_list(actualData);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return null;
		}		
	}
	
	@PostMapping("/drive_list.km")
	public Object drive_list(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return filesService.drive_list(requestData);
	}
	
	@PostMapping("/copy_favorite.km")
	public Object copy_favorite(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return filesService.copy_favorite(requestData);
	}
}
