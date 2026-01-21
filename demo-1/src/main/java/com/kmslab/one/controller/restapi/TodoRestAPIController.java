package com.kmslab.one.controller.restapi;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kmslab.one.service.channel.TodoService;

@RestController
@RequestMapping("/api/todo")
public class TodoRestAPIController {
private final TodoService todoService;
	
	public TodoRestAPIController(TodoService todoService) {
		this.todoService = todoService;
	}
	
	@PostMapping("/my_asign_work.km")
	public Object my_asign_work(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return todoService.my_asign_work(requestData);
	}
	
	@PostMapping("my_receive_work.km")
	public Object my_receive_work(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return todoService.my_receive_work(requestData);
	}
	
	@PostMapping("/my_space_portal.km")
	public Object my_space_portal(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return todoService.my_space_portal(requestData);
	}
	
	@PostMapping("/search_item_todo.km")
	public Object search_item_todo(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return todoService.search_item_todo(requestData);
	}
	
	@PostMapping("/todo_list.km")
	public Object todo_list(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return todoService.todo_list(requestData);
	}
	
	
	
}
