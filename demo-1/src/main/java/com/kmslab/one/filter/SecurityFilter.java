package com.kmslab.one.filter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import com.kmslab.one.config.AppConfig;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class SecurityFilter implements Filter{
	
	//JwtProvider 주입을 위한 필드 , final로 선언하면 생성자에서 초기화 해주어야 한다.
	private final AppConfig.JwtProvider jwtProvider;
	
	//생성자를 통해 스프링 빈(JwtProvider)을 전달 받음
	public SecurityFilter(AppConfig.JwtProvider jwtProvider) {
		this.jwtProvider = jwtProvider;
	}
		
	//인증 없이 허용할 경로 리스트 (로그인 페이지, 정적 리소스 등)
	private static final List<String> EXCLUDE_URLS = Arrays.asList("/page/login", "/api/public/", "/resource/css", "/resource/js", "/resource/images", "/resource/fonts", "/sso.do");
	
	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException{
		HttpServletRequest httpRequest = (HttpServletRequest) request;
		HttpServletResponse httpResponse = (HttpServletResponse) response;
		String path = httpRequest.getRequestURI();
		String loginPage = httpRequest.getContextPath() + "/page/login";		
		
		//1. 기본 보안 헤더 추가 (Security Best Practices)
		httpResponse.setHeader("X-Frame-Options", "SAMEORIGIN"); //Clickjacking 방지
		httpResponse.setHeader("X-Content-Type-Options", "nosniff"); //MIME Sniffing 방지
		httpResponse.setHeader("X-XSS-Protection", "1; mode=block");  //XSS보호
		
		//2. 인증 여부 확인
		boolean isExcluded = EXCLUDE_URLS.stream().anyMatch(path::startsWith);				
		if (!isExcluded) {
			String bearerToken = httpRequest.getHeader("Authorization");
			if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
				jakarta.servlet.http.Cookie[] cookies = httpRequest.getCookies();
				if (cookies != null) {
					for (jakarta.servlet.http.Cookie cookie : cookies) {
						if ("Authorization".equals(cookie.getName())){
							bearerToken = "Bearer " + cookie.getValue();
							break;
						}
					}
				}
			}
			if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
				String token = bearerToken.substring(7);				
				//토큰 유효성 검증
				if (jwtProvider.validateToken(token)) {
					//토큰이 유효하면 사용자 정보를 파싱하여 요청(request) 객체에 담아둘 수 있습니다.
					//이를 통해 컨트롤러에서 토큰을 다시 파싱할 필요 없이 사용자 정보를 꺼내 쓸수 있습니다.
					var claims = jwtProvider.getClaims(token);
					httpRequest.setAttribute("userId", claims.get("email"));
					httpRequest.setAttribute("userEmail", claims.get("userid"));
				}else {
					httpResponse.sendError(HttpServletResponse.SC_UNAUTHORIZED, "유효하지 않거나 만료된 토큰입니다.");
					return;
				}				
			}else {
				//토큰 헤더가 없는 경우
				httpResponse.sendRedirect(loginPage);
				return;
			}			
		}		
		//3. 다음 필터 또는 서블릿으로 요청 전달
		chain.doFilter(request, response);
	}
}
