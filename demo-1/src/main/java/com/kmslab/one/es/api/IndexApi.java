package com.kmslab.one.es.api;

import java.io.IOException;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.elasticsearch.ElasticsearchException;
import org.elasticsearch.action.admin.indices.alias.Alias;
import org.elasticsearch.action.admin.indices.delete.DeleteIndexRequest;
import org.elasticsearch.action.admin.indices.flush.FlushRequest;
import org.elasticsearch.action.admin.indices.flush.FlushResponse;
import org.elasticsearch.action.admin.indices.open.OpenIndexRequest;
import org.elasticsearch.action.admin.indices.open.OpenIndexResponse;
import org.elasticsearch.action.admin.indices.refresh.RefreshRequest;
import org.elasticsearch.action.admin.indices.refresh.RefreshResponse;
import org.elasticsearch.action.support.master.AcknowledgedResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.client.indices.CloseIndexRequest;
import org.elasticsearch.client.indices.CloseIndexResponse;
import org.elasticsearch.client.indices.CreateIndexRequest;
import org.elasticsearch.client.indices.CreateIndexResponse;
import org.elasticsearch.client.indices.GetIndexRequest;
import org.elasticsearch.rest.RestStatus;
import org.elasticsearch.xcontent.XContentBuilder;

public class IndexApi {	
	
	Logger log = LogManager.getLogger("indexLog");

	
	private RestHighLevelClient client;

	public IndexApi(RestHighLevelClient client) {
		this.client = client;
	}
	
	public boolean createIndex(String indexName, XContentBuilder settingsBuilder, XContentBuilder mappingBuilder, String aliasName) {
	
		CreateIndexRequest request = new CreateIndexRequest(indexName);
		
		
		request.alias(new Alias(aliasName));
		
		return _createIndex(request, indexName, settingsBuilder, mappingBuilder);
	}
	
	private boolean _createIndex (CreateIndexRequest request, String indexName, XContentBuilder settingsBuilder, XContentBuilder mappingBuilder) {
		boolean acknowledged = false;
		
		request.settings(settingsBuilder);
		
		request.mapping(mappingBuilder);
	
		CreateIndexResponse  createIndexResponse;
		try {
			createIndexResponse = client.indices().create(request, RequestOptions.DEFAULT);
			acknowledged = createIndexResponse.isAcknowledged();
		}catch(ElasticsearchException | IOException e) {
			log.error(e);
		}
		
		if (acknowledged) {
			log.info(indexName + " 정상 생성되었습니다.");
		}else {
			log.info(indexName + " 오류가 발생하였습니다.");
		}
		
		return acknowledged;
	}
	
	public boolean deleteIndex(String indexName) {
		boolean acknowledged = false;
		
		try {
			//�ε��� ���� ��û
			DeleteIndexRequest request = new DeleteIndexRequest(indexName);
			
			AcknowledgedResponse response = client.indices().delete(request, RequestOptions.DEFAULT);
			acknowledged = response.isAcknowledged();
		}catch(ElasticsearchException | IOException e) {
			log.error(e);
		}
		
		if (acknowledged) {
			log.info(indexName + "정상적으로 삭제 되었습니다.");
		}else {
			log.info(indexName + "삭제시 오류가 발생하였습니다.");
		}
		
		return acknowledged;
	}
	
	
	public boolean openIndex(String indexName) {
		boolean acknowledged = false;
		
		try {
			OpenIndexRequest request = new OpenIndexRequest(indexName);
			OpenIndexResponse response = client.indices().open(request, RequestOptions.DEFAULT);
			
			acknowledged = response.isAcknowledged();
		}catch(Exception e) {
			e.printStackTrace();
			return false;
		}
		
		return acknowledged;
	}
	

//	public boolean closeIndex(String indexName) {
//		boolean acknowledged = false;
//		try {
//			CloseIndexRequest request = new CloseIndexRequest(indexName);
//			AcknowledgedResponse response = client.indices().close(request, RequestOptions.DEFAULT);
//			acknowledged = response.isAcknowledged();
//		}catch(Exception e) {
//			e.printStackTrace();
//			return false;
//		}
//		
//		return acknowledged;
//	}
	
	
	public boolean closeIndex(String indexName) {
	    boolean acknowledged = false;
	    try {
	        CloseIndexRequest request = new CloseIndexRequest(indexName);
	        CloseIndexResponse response = client.indices().close(request, RequestOptions.DEFAULT);
	        acknowledged = response.isAcknowledged();
	    } catch(IOException e) {
	        log.error("인덱스 닫기 실패: " + indexName, e);
	        return false;
	    }
	    
	    return acknowledged;
	}
	

	public boolean existIndex(String indexName) {
		boolean acknowledged = false;
		try {
			GetIndexRequest request = new GetIndexRequest(indexName);
			acknowledged = client.indices().exists(request, RequestOptions.DEFAULT);
		}catch(Exception e) {
			e.printStackTrace();
			return false;
		}
		return acknowledged;
	}
	
	
	
//	public List<AnalyzeToken> analyze(String indexName, String analyzer, String text){
//		AnalyzeRequest request = new AnalyzeRequest();
//		request.index(indexName);
//		request.text(text);
//		request.analyzer(analyzer);
//		List<AnalyzeResponse.AnalyzeToken> tokens = null;
//		try {
//			AnalyzeResponse response = client.indices().analyze(request, RequestOptions.DEFAULT);
//			tokens = response.getTokens();
//		}catch(IOException e) {
//			e.printStackTrace();
//		}
//		return tokens;
//	}
	
	
	public RefreshResponse refreshIndex(String indexName) {
		RefreshRequest request = new RefreshRequest(indexName);
		return _refreshIndex(request);
	}
	
	
	public RefreshResponse refreshIndex(String... indexNames) {
		RefreshRequest request = new RefreshRequest(indexNames);
		return _refreshIndex(request);
	};
	
	public RefreshResponse refreshIndexAll() {
		RefreshRequest request = new RefreshRequest();
		return _refreshIndex(request);
	}
	
	private RefreshResponse _refreshIndex(RefreshRequest request) {
		RefreshResponse refreshResponse = null;
		try {
			refreshResponse = client.indices().refresh(request,  RequestOptions.DEFAULT);
		}catch(ElasticsearchException e) {
			if (e.status() == RestStatus.NOT_FOUND) {
				log.error("찾지 못했습니다");
			}
		}catch(IOException e) {
			e.printStackTrace();
		}
		return refreshResponse;
	}
	
	public FlushResponse flushIndex(String indexName) {
		FlushRequest request = new FlushRequest(indexName);
		return _flushIndex(request);
	}
	
	
	public FlushResponse flushIndexs(String... indexNames) {
		FlushRequest request = new FlushRequest(indexNames);
		return _flushIndex(request);
	}
	

	public FlushResponse flushIndexAll() {
		FlushRequest request = new FlushRequest();
		return _flushIndex(request);
	}
	
	private FlushResponse _flushIndex(FlushRequest request) {
		FlushResponse flushResponse = null;
		try {
			flushResponse = client.indices().flush(request, RequestOptions.DEFAULT);
		}catch(ElasticsearchException e) {
			if (e.status() == RestStatus.NOT_FOUND) {
				log.error("NoT FOUND");
			}
		}catch(IOException e) {
			e.printStackTrace();
		}
		
		return flushResponse;
	}
	
}
