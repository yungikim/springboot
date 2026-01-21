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
	
	
	
	
}
