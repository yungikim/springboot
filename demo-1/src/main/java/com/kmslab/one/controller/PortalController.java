package com.kmslab.one.controller;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.kmslab.one.service.MongoDataService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@Controller
public class PortalController {
	
	@Autowired
	private MongoDataService mongoData;
	
	@GetMapping("/v/portal")
	public String index(HttpServletRequest request, Model model) {
		//1. 버전 정보 설정
		String version = "2026.01.13.003";
				
		//2. 인터셉터에서 이미 검증된 세션 정보 가져오기
		HttpSession session = request.getSession();
		//3. 쿠키에서 가져온 userid가 없거나 세션 정보가 없는 경우 처리
		//(인터셉터에서 이미 체크했겠지만, 컨트롤에서도 안전하게 한 번 더 체크)
//		if (userId == null || session.getAttribute("userinfo_"+userId) == null) {
//			return "redirect:/page/login";
//		}
		
		String userId = (String) request.getAttribute("userId");
		String userEmail = (String) request.getAttribute("userEmail");
//		System.out.println("PortalController userId : " + userId);
//		System.out.println("PortalController userEmail : " + userEmail);
		
		if (userId == null) {
			return "redirect:/page/login";
		}
		
		//4. 동적으로 구성된 세션 키에서 정보 추출
//		String userInfo = (String) session.getAttribute("userinfo_" + userId);
		Document sdoc = mongoData.search_user_all_sso(userId);
		String userInfoJson = (sdoc != null) ? sdoc.toJson() : "{}";
		
		//5. 뷰(Thymeleaf)로 데이터 전달
		model.addAttribute("cssVer", version);
		model.addAttribute("jsVer", version);
		model.addAttribute("userInfo", userInfoJson);
		model.addAttribute("userId", userId);
		model.addAttribute("callKey", request.getParameter("key"));
		model.addAttribute("callView", request.getParameter("view"));
		
		return "index";
	}
	
	@GetMapping("/page/login")
	public String loginPage(Model model) {
		model.addAttribute("jsVer", "1.0");
		model.addAttribute("cssVer", "1.0");
		return "page/login";
	}
	
	@GetMapping("/page/kgpt")
	public String loginPage_kgpt(Model model) {
		model.addAttribute("jsVer", "1.0");
		model.addAttribute("cssVer", "1.0");
		return "page/kgpt";
	}
	
	@GetMapping("/v/kgpt")
	public String loginPage_goto_kgpt(RedirectAttributes model) {
		model.addFlashAttribute("jsVer", "1.0");
		model.addFlashAttribute("cssVer", "1.0");
		model.addFlashAttribute("view", "kgpt");
		return "redirect:/v/portal";
	}
	
	@GetMapping("/page/collect")
	public String loginPage_collect(Model model) {
		model.addAttribute("jsVer", "1.0");
		model.addAttribute("cssVer", "1.0");
		return "page/collect";
	}
	
	@GetMapping("/v/collect")
	public String loginPage_goto_collect(RedirectAttributes model) {
		model.addFlashAttribute("jsVer", "1.0");
		model.addFlashAttribute("cssVer", "1.0");
		model.addFlashAttribute("view", "collect");
		return "redirect:/v/portal";
	}
	
	@GetMapping("/page/organ")
	public String loginPage_organ(Model model) {
		model.addAttribute("jsVer", "1.0");
		model.addAttribute("cssVer", "1.0");
		return "page/organ";
	}
	
	@GetMapping("/v/org")
	public String loginPage_goto_organ(RedirectAttributes model) {
		model.addFlashAttribute("jsVer", "1.0");
		model.addFlashAttribute("cssVer", "1.0");
		model.addFlashAttribute("view", "org");
		return "redirect:/v/portal";
	}
	
	@GetMapping("/page/meeting")
	public String loginPage_meeting(Model model) {
		model.addAttribute("jsVer", "1.0");
		model.addAttribute("cssVer", "1.0");
		return "page/meeting";
	}
	
	@GetMapping("/v/meeting")
	public String loginPage_goto_meeting(RedirectAttributes model) {
		model.addFlashAttribute("jsVer", "1.0");
		model.addFlashAttribute("cssVer", "1.0");
		model.addFlashAttribute("view", "meeting");
		return "redirect:/v/portal";
	}
	
	@GetMapping("/page/files")
	public String loginPage_files(Model model) {
		model.addAttribute("jsVer", "1.0");
		model.addAttribute("cssVer", "1.0");
		return "page/files";
	}
	
	@GetMapping("/v/files")
	public String loginPage_goto_files(RedirectAttributes model) {
		model.addFlashAttribute("jsVer", "1.0");
		model.addFlashAttribute("cssVer", "1.0");
		model.addFlashAttribute("view", "files");
		return "redirect:/v/portal";
	}
	
	@GetMapping("/page/chat")
	public String loginPage_chat(Model model) {
		model.addAttribute("jsVer", "1.0");
		model.addAttribute("cssVer", "1.0");
		return "page/chat";
	}
	
	@GetMapping("/v/chat")
	public String loginPage_goto_chat(RedirectAttributes model) {
		model.addFlashAttribute("jsVer", "1.0");
		model.addFlashAttribute("cssVer", "1.0");
		model.addFlashAttribute("view", "chat");
		return "redirect:/v/portal";
	}
	
	@GetMapping("/page/channel")
	public String loginPage_channel(Model model) {
		model.addAttribute("jsVer", "1.0");
		model.addAttribute("cssVer", "1.0");
		return "page/channel";
	}
	
	@GetMapping("/v/channel")
	public String loginPage_goto_channel(RedirectAttributes model) {
		model.addFlashAttribute("jsVer", "1.0");
		model.addFlashAttribute("cssVer", "1.0");
		model.addFlashAttribute("view", "channel");
		return "redirect:/v/portal";
	}
}
