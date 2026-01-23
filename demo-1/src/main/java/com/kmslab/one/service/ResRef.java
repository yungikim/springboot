package com.kmslab.one.service;

import org.bson.Document;

import com.google.gson.JsonObject;
import com.mongodb.client.FindIterable;

public class ResRef {
	private String result;
	private JsonObject res;
	private JsonObject res2;
	private FindIterable<Document> res4;
	public FindIterable<Document> getRes4() {
		return res4;
	}
	public void setRes4(FindIterable<Document> res4) {
		this.res4 = res4;
	}
	private String res3;
	
	public String getResult() {
		return result;
	}
	public void setResult(String result) {
		this.result = result;
	}
	public JsonObject getRes() {
		return res;
	}
	public void setRes(JsonObject res) {
		this.res = res;
	}
	public JsonObject getRes2() {
		return res2;
	}
	public void setRes2(JsonObject res2) {
		this.res2 = res2;
	}
	public String getRes3() {
		return res3;
	}
	public void setRes3(String res3) {
		this.res3 = res3;
	}

}
