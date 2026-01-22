package com.kmslab.one.controller.restapi;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
	
	
}
