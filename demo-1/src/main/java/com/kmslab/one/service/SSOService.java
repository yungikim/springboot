package com.kmslab.one.service;

import java.io.DataOutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.google.gson.JsonObject;
import com.kmslab.one.config.JwtProvider;

import jakarta.servlet.http.HttpSession;

@Service
public class SSOService {
	//private final String authkey = "kmslabbox2022_must_be_over_32_bytes_long_key";
	//private final String authkey = "kmslabbox2022";
	private final String ssoDomain = "https://mail2.kmslab.com";
	
	@Autowired
	private MongoDataService mongoData;	
	
	@Autowired
	private JwtProvider jwtProvider;
	

	
	public JsonObject processSSO(String id, String pw, HttpSession session) {
		JsonObject rex = new JsonObject();
		HttpURLConnection con = null;
		
		

		try {
            System.out.println("----------------------------");
            System.out.println("SSO Check : " + id);
            System.out.println("----------------------------");

            URL loginUrl = new URL(ssoDomain + "/names.nsf?Login");
            String post_data = "Username=" + URLEncoder.encode(id, "UTF-8")
                    + "&Password=" + URLEncoder.encode(pw, "UTF-8") 
                    + "&RedirectTo=domcfg.nsf&%25PublicAccess=1&ReasonType=0";

            con = (HttpURLConnection) loginUrl.openConnection();
            con.setRequestMethod("POST");
            con.setRequestProperty("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
            con.setUseCaches(false);
            con.setInstanceFollowRedirects(false);
            con.setDoOutput(true);

            try (DataOutputStream wr = new DataOutputStream(con.getOutputStream())) {
                wr.writeBytes(post_data);
                wr.flush();
            }

            // 도미노 서버는 로그인 성공 시 302 Redirect를 반환함
            if (con.getResponseCode() != 302 || con.getHeaderField("Set-Cookie") == null) {
                System.out.println("ERROR: Domino Auth Failed");
                rex.addProperty("result", "ERROR");
            } else {
                rex.addProperty("result", "OK");
                
                Document sdoc = mongoData.search_user_all_sso(id);
                if (sdoc != null) {
                    String userinfo = buildUserInfo(sdoc);
                    session.setAttribute("userinfo_" + sdoc.getString("id"), userinfo);

                    String token = con.getHeaderField("Set-Cookie");
                    rex.addProperty("token", token);
                    rex.addProperty("emp", sdoc.getString("emp"));
                    rex.addProperty("jsessionid", session.getId());
                    rex.addProperty("ky", sdoc.getString("emp"));
                    rex.addProperty("id", sdoc.getString("id"));

                    String email = sdoc.getString("emp");
                    String depths = sdoc.getString("adc");
                    String userid = sdoc.getString("lid");

                    if (email == null || email.isEmpty()) {
                        rex.addProperty("result", "ERROR");
                    } else {
                        String auth = jwtProvider.createToken(email, depths, userid);
                        rex.addProperty("auth", auth);
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("Connection Error : " + e.getMessage());
            rex.addProperty("result", "ERROR");
        } finally {
            if (con != null) con.disconnect();
        }
        return rex;
    }

    private String buildUserInfo(Document sdoc) {
        // 기존의 복잡한 문자열 결합 로직
        String[] keys = {"em", "nm", "enm", "emp", "jt", "ejt", "dp", "edp", "emp", "cp", "ecp", "du", "edu", "op", "mop", "fx", "el", "cpc", "dpc", "adc", "ms", "mf", "id", "adc"};
        StringBuilder sb = new StringBuilder();
        for (String key : keys) {
            sb.append(sdoc.getString(key)).append("-spl-");
        }
        sb.append(sdoc.getString("m365") == null ? "" : sdoc.getString("m365"));
        return sb.toString();
    }


}
