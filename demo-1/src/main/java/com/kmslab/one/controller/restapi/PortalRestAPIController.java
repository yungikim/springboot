package com.kmslab.one.controller.restapi;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kmslab.one.service.portal.PortalService;

@RestController
@RequestMapping("/api/portal")
public class PortalRestAPIController {
	private final PortalService portalService;
	
	public PortalRestAPIController(PortalService portalServie) {
		this.portalService = portalServie;
	}
	
	@PostMapping("/appstore_list.km")
	public Object appstore_list(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return portalService.appstore_list(requestData);
	}
	
	@PostMapping("/appstore_mobile_list.km")
	public Object appstore_mobile_list(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return portalService.appstore_mobile_list(requestData);
	}
	
	@PostMapping("/portal_favorite_info.km")
	public Object portal_favorite_info(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return portalService.portal_favorite_info(requestData);
	}
	
	@PostMapping("/portlet_person_list_portal.km")
	public Object portlet_person_list_portal(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return portalService.portlet_person_list_portal(requestData);
	}
	
	@PostMapping("/save_person_portlet.km")
	public Object save_person_portlet(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return portalService.save_person_portlet(requestData);
	}
	
	@PostMapping("/appstore_category_list.km")
	public Object appstore_category_list(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return portalService.appstore_category_list(requestData);
	}
	
	@PostMapping("/appstore_dual_check.km")
	public Object appstore_dual_check(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return portalService.appstore_dual_check(requestData);
	}

	@PostMapping("/appstore_mobile_dual_check.km")
	public Object appstore_mobile_dual_check(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return portalService.appstore_mobile_dual_check(requestData);
	}
	
	@PostMapping("/appstore_category_save.km")
	public Object appstore_category_save(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return portalService.appstore_category_save(requestData);
	}
	
	@PostMapping("/appstore_category_delete.km")
	public Object appstore_category_delete(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return portalService.appstore_category_delete(requestData);
	}
	
	@PostMapping("/appstore_save.km")
	public Object appstore_save(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return portalService.appstore_save(requestData);
	}
	
	@PostMapping("/appstore_delete.km")
	public Object appstore_delete(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return portalService.appstore_delete(requestData);
	}
	
	@PostMapping("/appstore_mobile_save.km")
	public Object appstore_mobile_save(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return portalService.appstore_mobile_save(requestData);
	}
	
	@PostMapping("/appstore_mobile_delete.km")
	public Object appstore_mobile_delete(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return portalService.appstore_mobile_delete(requestData);
	}
	
	@PostMapping("/portlet_list.km")
	public Object portlet_list(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return portalService.portlet_list(requestData);
	}
	
	@PostMapping("/portlet_dual_check.km")
	public Object portlet_dual_check(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return portalService.portlet_dual_check(requestData);
	}
	
	@PostMapping("/portlet_save.km")
	public Object portlet_save(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return portalService.portlet_save(requestData);
	}
	
	@PostMapping("/portlet_delete.km")
	public Object portlet_delete(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return portalService.portlet_delete(requestData);
	}
	
	@PostMapping("/alarmcenter_list.km")
	public Object alarmcenter_list(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return portalService.alarmcenter_list(requestData);
	}
	
	@PostMapping("/alarmcenter_dual_check.km")
	public Object alarmcenter_dual_check(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return portalService.alarmcenter_dual_check(requestData);
	}
	
	@PostMapping("/alarmcenter_save.km")
	public Object alarmcenter_save(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return portalService.alarmcenter_save(requestData);
	}
	
	@PostMapping("/alarmcenter_delete.km")
	public Object alarmcenter_delete(@RequestBody Map<String, Object> requestData, @RequestAttribute("userId") String userId, @RequestAttribute("depts") String depts) {
		requestData.put("email", userId);
		requestData.put("depts", depts);
		return portalService.alarmcenter_delete(requestData);
	}
	
}
