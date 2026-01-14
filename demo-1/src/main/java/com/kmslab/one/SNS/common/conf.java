package com.kmslab.one.SNS.common;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.net.InetAddress;
import java.net.UnknownHostException;

//import com.markany.nt.WDSCryptAll;
import com.mongodb.ConnectionString;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;




public class conf {
	public String sepa = System.getProperty("file.separator");
	public String run_path2 = System.getProperty("user.dir");
	public String jsonpath =  run_path2 + sepa + "info.json";
	
	public static String ffmpegpath = "D:/makevideo/ffmpeg/bin/ffmpeg.exe";
	public static String MediaInfopath = "D:/makevideo/Media/MediaInfo.exe";
	
	public String tempdrive = "";
	public String realdrive = "";	
	public String thumbnail_path = "";	
	public String file_download_path = "";
	public String file_download_path2 = "";	
	public String collection_download = "";	
	public String vote_download = "";
	public String chatroom_path = "";
	
	public String mongodb_server = "";
	public int mongodb_port = 0;
	
	public String mongodb_admin = "";
	public String mongodb_pw = "";
	
	public boolean useDRM = true;
	public boolean is_dev = false;
	
	public static String master_url = "";

	MongoClient client = null;
	
	public conf(){
		
		try {
			String hostname = InetAddress.getLocalHost().getHostName();		
			
			//운영서버인지 실서버인지 체크한다.
			
			if (run_path2.indexOf(":") > -1){
			//	System.out.println("개발서버입니다");
				tempdrive = "C:";
			//	realdrive = "\\\\192.168.14.47\\talkdev\\";				
				realdrive = "C:";				
				thumbnail_path = realdrive + sepa + "download" + sepa + "thumbnail" + sepa;				
				file_download_path = realdrive + File.separator + "upload";
				file_download_path2 = tempdrive + File.separator + "upload";				
				collection_download = realdrive + File.separator + "upload" + File.separator + "collect";		
				vote_download = realdrive + File.separator + "upload" + File.separator + "vote";	
				chatroom_path = realdrive + File.separator + "vol_epchat" + File.separator + "data" + File.separator + "upload_root";
				is_dev = true;
				
				master_url = "https://dev.kmslab.com/KPortalONE";
			}else{
			//	System.out.println("운영서버입니다");				
				tempdrive = "/tmp";
			//	realdrive = "/dsw-bxfs/";		
			//	realdrive = "192.168.14.48:/dswsynap/";
				realdrive = "/kportal";
				thumbnail_path = realdrive + sepa + "download" + sepa + "thumbnail" + sepa;				
				file_download_path = realdrive + File.separator + "upload";
				file_download_path2 = tempdrive + File.separator + "upload";				
				collection_download = realdrive + File.separator + "upload" + File.separator + "collect";	
				vote_download = realdrive + File.separator + "upload" + File.separator + "vote";	
				chatroom_path = realdrive + File.separator + "vol_epchat" + File.separator + "data" + File.separator + "upload_root";
				
				master_url = "https://one.kmslab.com/KPortalONE";
			}
		
		} catch (UnknownHostException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}
	
}
