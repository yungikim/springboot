package com.kmslab.one.util;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

import org.bson.Document;

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
	
}
