package com.kmslab.one.util;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.ParsePosition;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

import org.bson.Document;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class Utils {
	public static String GMTDate(){
		String res = "";
	
		Date now = new Date();
		DateFormat df = new SimpleDateFormat("yyyyMMddHHmmss");
		df.setTimeZone(TimeZone.getTimeZone("GMT"));
		res = df.format(now);
		
		return res;
	}
	
	public static JsonObject DocumnetConvertJsonObject(Document doc){
		JsonElement je = JsonParser.parseString(doc.toJson());
		return je.getAsJsonObject();
	}
	

	public static Date convert_date(String dat){
		SimpleDateFormat transFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		Date to = null;
		try {
			to = transFormat.parse(dat);
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return to;
	}
	
	public static String curDay(){
		//날짜 (년/월/일/시/분/초) 구하기
		SimpleDateFormat formatter = new SimpleDateFormat("yyyy.MM.dd HH:mm:ss", Locale.KOREA);
		Date currentTime = new Date();
		String dTime = formatter.format(currentTime);
		return dTime;    //2015.08.13 17:02:53
	}

	public static String curDay2(){
		//날짜(년/월/일/시/분/초) 구하기2
		DateFormat df = DateFormat.getDateInstance(DateFormat.LONG, Locale.KOREA);
		Calendar cal = Calendar.getInstance(Locale.KOREA);
		String nal = df.format(cal.getTime());  
		
		return nal;   //2015년 8월 13일 (목)
	}
	
	public static String curDay3(){
		//표준시간대를 지정하고 날짜를 가죠오기
		TimeZone jst = TimeZone.getTimeZone("JST");
		Calendar cal = Calendar.getInstance(jst);
		String res = cal.get(Calendar.YEAR) + "년" + (cal.get(Calendar.MONDAY) +1) + "월" 
				+ cal.get(Calendar.DATE) + "일" + cal.get(Calendar.HOUR_OF_DAY) + "시"
				+ cal.get(Calendar.MINUTE)+ "분" + cal.get(Calendar.SECOND) + "초";
		return res;   //2015년8월13일17시8분19초
	}
	
	public static String formatDate(String date) throws ParseException {
	    SimpleDateFormat formatFrom = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss Z ");

	    java.util.Date tmpDate = formatFrom.parse(date);
	    SimpleDateFormat formatTo = new SimpleDateFormat("dd/MMM/yyyy HH:mm");
	    return formatTo.format(tmpDate);
	}
	
	
	
	
	
	public static String curDay4(){
		//Sun, 5 Dec 1999 00:07:21를 "1999-12-05"로 바꾸기
		//현재 날짜를 리턴함
		SimpleDateFormat formatter_one = new SimpleDateFormat("EEE, dd MMM yyyy hh:mm:ss", Locale.ENGLISH);
		SimpleDateFormat formatter_two = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
		
		
		Date now = new Date();	
		SimpleDateFormat format = new SimpleDateFormat("EEE, d MMM yyyy HH:mm:ss", Locale.ENGLISH);
		String kk = format.format(now).toString();
	//	String inString = "Sun, 5 Dec 1999 00:07:21";
		//Thu Aug 13 17:59:22 KST 2015
	
		ParsePosition pos = new ParsePosition(0);
		Date frmTime = formatter_one.parse(kk, pos);	
		String outString = formatter_two.format(frmTime);		
		return outString;
	}
	
	public static String curDay5(int iDay){
		//특정 날짜 이후의 날짜값 계산하기
		Calendar temp = Calendar.getInstance();
		StringBuffer sbDate = new StringBuffer();
		
		temp.add(Calendar.DAY_OF_MONTH, iDay);
		
		int nYear = temp.get(Calendar.YEAR);
		int nMonth = temp.get(Calendar.MONDAY) + 1;
		int nDay = temp.get(Calendar.DAY_OF_MONTH);
		
	//System.out.println("nDay: " + nDay);
		
		sbDate.append(nYear);
		if (nMonth < 10)
			sbDate.append("0");
			sbDate.append(nMonth);
		
		if (nDay < 10)
			sbDate.append("0");
			sbDate.append(nDay);		
		
		return sbDate.toString();
	}
	
	public static String curDay6(){
		Date tz = new Date();
		String formatted = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ").format(tz);
		String timezone = formatted.substring(0, 22) + ":" + formatted.substring(22);
		return timezone;
	}
	
	public static String curDay66(){
	//	Date tz = new Date();
		
		Date dt = new Date();
        Calendar c = Calendar.getInstance();
        c.setTime(dt);
        c.add(Calendar.DATE, -1);
        dt = c.getTime();
     //   System.out.println("Tomorrow: "+dt);
		
		String formatted = new SimpleDateFormat("yyyy-MM-dd'T'99:99:99Z").format(dt);
		String timezone = formatted.substring(0, 22) + ":" + formatted.substring(22);
		return timezone;
	}
	
	
	public static String curDay7(long ddd){
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ");
		return sdf.format(ddd);
	}
	
	public static String curDay8(){
		Date tz = new Date();
		String formatted = new SimpleDateFormat("yyyyMMddHHmmss").format(tz);
		String timezone = formatted;
		return timezone;
	}
	
	public static String curDay9(){
		Date tz = new Date();
		String formatted = new SimpleDateFormat("yyyyMMdd").format(tz);
		String timezone = formatted;
		return timezone;
	}
	
	public static String cur_year(){
		Date tz = new Date();
		String formatted = new SimpleDateFormat("yyyy").format(tz);
		String timezone = formatted;
		return timezone;
	}
	
	public static String curDay99(){
		Date tz = new Date();
		String formatted = new SimpleDateFormat("yyyyMM").format(tz);
		String timezone = formatted;
		return timezone;
	}
	
	public static String curDay10(){
		Date tz = new Date();
		String formatted = new SimpleDateFormat("yyyy-MM-dd").format(tz);
		String timezone = formatted;
		return timezone;
	}
	
	
	public static String curDay11(){
		Date tz = new Date();
		String formatted = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(tz);
		String timezone = formatted;
		return timezone;
	}
	
	
	public static String ISOConvertDate(String isodate) {
		org.joda.time.DateTime dateTime = new DateTime( isodate, DateTimeZone.UTC );
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		String ddd = sdf.format(dateTime.getMillis());
				
		return ddd;
	}
	
	
	public static String ISOConvertDate2(String isodate) {
		org.joda.time.DateTime dateTime = new DateTime( isodate, DateTimeZone.UTC );
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ");
		String ddd = sdf.format(dateTime.getMillis());
		
		String timezone = ddd.substring(0, 22) + ":" + ddd.substring(22);
		return timezone;		
	}
	
	public static long ISOConvertDate3(String isodate) {
		org.joda.time.DateTime dateTime = new DateTime( isodate, DateTimeZone.UTC );
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ");		
		return dateTime.getMillis();		
	}
	
	
	public static String changeDate(String date) {
		String res = "";
		String year = date.substring(0,4);
		String month = date.substring(4,6);
		String day = date.substring(6,8);
		String HH = date.substring(8,10);
		String MM = date.substring(10,12);
		String SS = date.substring(12,14);
		
		res = year + "." + month + "." + day +  " " + HH +":" + MM + ":" + SS;
		
		return res;
	}
	
	public static String UTCDate(String str){
		//"20221101065554" convert DateTime UTC
		String ddd = "";
		try {
			//////////////////////////////////////////////////////////////////////////
			SimpleDateFormat df = new SimpleDateFormat("yyyyMMddHHmmss");			
			Date d= df.parse(str);	
			//////////////////////////////////////////////////////////////////////////
					

			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");		
			ddd = sdf.format(d);
			sdf.setTimeZone(TimeZone.getTimeZone("UTC"));			
			Date date = sdf.parse(ddd);		
			
			DateFormat currentTFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            currentTFormat.setTimeZone(TimeZone.getTimeZone(getCurrentTimeZone()));
            ddd = currentTFormat.format(date);
			
		}catch(Exception e){
			e.printStackTrace();			
		}
		
				
		return ddd;
	}
	
	public static String getCurrentTimeZone(){
        TimeZone tz = Calendar.getInstance().getTimeZone();
    //    System.out.println(tz.getDisplayName());
        return tz.getID();
	}
	
	
	
	
	public static String GMTDate2(){
		String res = "";
		try{
//			SimpleDateFormat dt = new SimpleDateFormat("yyyyMMddHHmmss");
//			Date date = dt.parse(dat);
			Date date = new Date();
			
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
			sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
			
		//	SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ");
			String kk = sdf.format(date);
			res = kk;
		}catch(Exception e){
			e.printStackTrace();
			return "ERROR";
		}		
		
		return res;
	}
	
	public static String GMTDate3(String dx){
		String res = "";
		try{
			SimpleDateFormat dt = new SimpleDateFormat("yyyyMMddHHmmss");
			Date date = dt.parse(dx);

			
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
			sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
			
		//	SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ");
			String kk = sdf.format(date);
			res = kk;
		}catch(Exception e){
			e.printStackTrace();
			return "ERROR";
		}		
		
		return res;
	}
	
}
