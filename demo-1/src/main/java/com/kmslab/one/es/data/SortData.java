package com.kmslab.one.es.data;

import org.elasticsearch.search.sort.SortOrder;

public class SortData {
	
	private String field;
	private SortOrder type;
	
	
	public String getField() {
		return field;
	}
	public void setField(String field) {
		this.field = field;
	}
	public SortOrder getType() {
		return type;
	}
	public void setType(SortOrder type) {
		this.type = type;
	}
	
	
}
