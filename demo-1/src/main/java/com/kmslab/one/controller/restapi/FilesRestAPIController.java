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
import com.kmslab.one.util.Utils;

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
	
	@PostMapping("/create_person_drive.km")
	public Object create_person_drive(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return filesService.create_person_drive(requestData);
	}
	
	@PostMapping("/drive_update.km")
	public Object drive_update(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return filesService.drive_update(requestData);
	}
	
	@PostMapping("/make_folder.km")
	public Object make_folder(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		requestData.put("GMT", Utils.GMTDate());
		return filesService.make_folder(requestData);
	}
	
	@PostMapping("/update_folder.km")
	public Object update_folder(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return filesService.update_folder(requestData);
	}
	
	@PostMapping("/delete_folder_new.km")
	public Object delete_folder_new(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return filesService.delete_folder_new(requestData);
	}
	
	@PostMapping("/load_folder.km")
	public Object load_folder(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return filesService.load_folder(requestData);
	}
	
	@PostMapping("/exit_list.km")
	public Object exit_list(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return filesService.exit_list(requestData);
	}
	
	@PostMapping("/office_create.km")
	public Object office_create(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return filesService.office_create(requestData);
	}
	
}
