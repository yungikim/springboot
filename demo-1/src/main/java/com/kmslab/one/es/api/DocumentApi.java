package com.kmslab.one.es.api;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.elasticsearch.ElasticsearchException;
import org.elasticsearch.action.bulk.BulkItemResponse;
import org.elasticsearch.action.bulk.BulkProcessor;
import org.elasticsearch.action.bulk.BulkRequest;
import org.elasticsearch.action.bulk.BulkResponse;
import org.elasticsearch.action.delete.DeleteRequest;
import org.elasticsearch.action.delete.DeleteResponse;
import org.elasticsearch.action.get.GetRequest;
import org.elasticsearch.action.get.GetResponse;
import org.elasticsearch.action.get.MultiGetRequest;
import org.elasticsearch.action.get.MultiGetResponse;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.action.index.IndexResponse;
import org.elasticsearch.action.update.UpdateRequest;
import org.elasticsearch.action.update.UpdateResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.core.TimeValue;
import org.elasticsearch.rest.RestStatus;
import org.elasticsearch.search.fetch.subphase.FetchSourceContext;
import org.elasticsearch.xcontent.XContentBuilder;
import org.elasticsearch.xcontent.XContentType;

import com.kmslab.one.es.data.BulkData;

public class DocumentApi {
	
	Logger log = LogManager.getLogger("documentLog");
	
	private RestHighLevelClient client;
	
	public DocumentApi() {
		
	}
	
	public DocumentApi(RestHighLevelClient client) {
		this.client = client;
	}
	

	
	public IndexResponse createDocument(String indexName, String typeName, String _id, XContentBuilder indexBuilder) {

		IndexRequest request = new IndexRequest(indexName, typeName, _id);
		request.source(indexBuilder);
		
		return _createDocument(request, indexName, _id);
	}
	
	public IndexResponse createDocument(String indexName, String typeName, String _id, String jsonString) {
		IndexRequest request = new IndexRequest(indexName, typeName, _id);
		request.source(jsonString, XContentType.JSON);
		
		return _createDocument(request, indexName, _id);
	}
	
	
	public IndexResponse createDocument(String indexName, String typeName, String _id, Map<String, Object> jsonMap) {
		IndexRequest request = new IndexRequest(indexName, typeName, _id);
		request.source(jsonMap);
		
		return _createDocument(request, indexName, _id);
	}
	
	
	
	public IndexResponse _createDocument(IndexRequest request, String indexName, String _id) {

		IndexResponse response = null;
		try {
			response = client.index(request, RequestOptions.DEFAULT);
			log.info(response.status() + " in " + indexName + " :: created id=" + _id);
		}catch(ElasticsearchException | IOException e) {
			if (((ElasticsearchException) e).status().equals(RestStatus.CONFLICT)) {
				log.error("Conflict");
			}
			log.error(e);
		}
		
		return response;
	}
	
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	
	
	public GetResponse getDocument(String indexName, String typeName, String _id) {
		GetRequest request = new GetRequest(indexName, typeName, _id);
		return _getDocument(request);
	}
	

	
	public GetResponse getDocument(String indexName, String typeName, String[] fieldName, String _id) {
		GetRequest request = new GetRequest(indexName, typeName, _id);
		request.storedFields(fieldName);
		return _getDocument(request);
	}
	
	public GetResponse getDocument(String indexName, String typeName, String _id, String[] includeField, String[] excludeField) {
		GetRequest request = new GetRequest(indexName, typeName, _id);
		
		FetchSourceContext fetchSourceContext = new FetchSourceContext(true, includeField, excludeField);
		request.fetchSourceContext(fetchSourceContext);
		return _getDocument(request);
	}
	
	
	public GetResponse _getDocument(GetRequest request) {
		GetResponse response = null;
		try {
			response = client.get(request, RequestOptions.DEFAULT);
			if (!response.isExists()) {
				log.info("success");
				return null;
			}
		}catch(ElasticsearchException e) {
			if (e.status() == RestStatus.NOT_FOUND) {
				log.error("NOT Found.");
			}
		}catch(IOException e) {
			log.error(e);
		}
		
		return response;
	}
	

	
	public MultiGetResponse getMultiDocument(String indexName, String typeName, String... _id) {
		MultiGetRequest request = new MultiGetRequest();
		for (String id : _id) {
			request.add(new MultiGetRequest.Item(indexName, typeName, id));
		}
		
		MultiGetResponse response = null;
		try {
			response = client.mget(request, RequestOptions.DEFAULT);
		}catch(IOException e) {
			log.error(e);
		}
		
		return response;
		
	}
	

	
	public MultiGetResponse getMultiDocument(String indexName, String typeName, String[] fieldName, String... _id) {
		MultiGetRequest request = new MultiGetRequest();
		for (String id : _id) {
			request.add(new MultiGetRequest.Item(indexName, typeName, id).storedFields(fieldName));
		}
		MultiGetResponse response = null;
		try {
			response = client.mget(request, RequestOptions.DEFAULT);
		}catch(IOException e) {
			log.error(e);
		}
		return response;
	}
	
	
	
	public MultiGetResponse getMultiDocument(String indexName, String typeName, String[] includeField, String[] excludeField, String... _id) {
		MultiGetRequest request = new MultiGetRequest();
		FetchSourceContext fetchSourceContext = new FetchSourceContext(true, includeField, excludeField);
		for (String id : _id) {
			request.add(new MultiGetRequest.Item(indexName, typeName, id).fetchSourceContext(fetchSourceContext));
		}
		
		MultiGetResponse response = null;
		try {
			response = client.mget(request, RequestOptions.DEFAULT);
		}catch(IOException e) {
			log.error(e);
		}
		return response;
	}
	

	
	public Boolean existDocument(String indexName, String typeName, String _id) {
		GetRequest request = new GetRequest(indexName, typeName, _id);
		
		request.fetchSourceContext(new FetchSourceContext(false));
		request.storedFields("_none_");
		boolean exists = false;
		try {
			exists = client.exists(request,  RequestOptions.DEFAULT);
		}catch(IOException e) {
			log.error(e);
		}
		return exists;
	}
	
	
//	public UpdateResponse updateDocumentWithScript(String indexName, String typeName, String _id, String updateField, String value) {
//		UpdateRequest request = new UpdateRequest(indexName, typeName, _id);
//		Map<String, String> parameters = Collections.singletonMap(updateField, value);
//		
//		Script inline = new Script(ScriptType.INLINE, "painless", "ctx._source." + updateField+" = params." + updateField, parameters);		
//		request.script(inline);
//		
//		return _updateDocument(request, indexName, _id);
//	}
	
	
	public UpdateResponse updateDocument(String indexName, String typeName, String _id, String jsonString) {
		UpdateRequest request = new UpdateRequest(indexName, typeName, _id);
		request.doc(jsonString, XContentType.JSON);
		
		return _updateDocument(request, indexName, _id);
	}
	
	/**
	 * ������Ʈ ������ Map<String, Object>���� ����Ѵ�.
	 */
	
	public UpdateResponse updateDocument(String indexName, String typeName, String _id, Map<String, Object> jsonMap) {
		UpdateRequest request = new UpdateRequest(indexName, typeName, _id);
		request.doc(jsonMap, XContentType.JSON);
		
		return _updateDocument(request, indexName, _id);
	}
	
	
	/**
	 * ������Ʈ ������ XContentBuilder���� ����Ѵ�.
	 */
	
	public UpdateResponse updateDocument(String indexName, String typeName, String _id, XContentBuilder builder) {
		UpdateRequest request = new UpdateRequest(indexName, typeName, _id);
		request.doc(builder, XContentType.JSON);
		
		return _updateDocument(request, indexName, _id);
	}
	
	
	public UpdateResponse _updateDocument(UpdateRequest request, String indexName, String _id) {
		UpdateResponse response = null;
		try {
			response = client.update(request,  RequestOptions.DEFAULT);
			log.info(response.status() + " in " + indexName + " :: updated id=" + _id);
		} catch (ElasticsearchException | IOException e) {
			if(((ElasticsearchException) e).status().equals(RestStatus.CONFLICT)) {
				log.error("���� ������Ʈ ����");
			}
			log.error(e);
		}
		
		return response;
	}
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	
	/**
	 * ������ �����Ѵ�.
	 */
	
	public DeleteResponse deleteDocument(String indexName, String typeName, String _id) {
		DeleteRequest request = new DeleteRequest(indexName, typeName, _id);
		DeleteResponse response = null;
		try {
			response = client.delete(request, RequestOptions.DEFAULT);
			log.info(response.status() + " in " + indexName + " :: deleted id=" + _id);			
		}catch(IOException e) {
			log.error(e);
		}
		return response;
	}
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	public Object getBulkItem() {
		BulkRequest request = new BulkRequest();
		Object[] item = {request, client};
		return item;
	}
	
	/**
	 * BulkProcessor�� ��ȯ�Ѵ�.
	 * flush�� �⺻ 1000���� ��������.
	 */
	
	public BulkProcessor getBulkProcessor() {
		return _getBulkProcessor(1000);
	}
	
	
	/**
	 * ArrayList<BulkData>�� �Է¹޾� bulk request�� �����Ѵ�.
	 */
	
	public BulkResponse bulkDocument(ArrayList<BulkData> bulkList) {
		BulkRequest request = new BulkRequest();
		
		for (BulkData data : bulkList) {
			if (data.getActionType().equals(BulkData.Type.CREATE)) {
				request.add(new IndexRequest(data.getIndexName(), data.getTypeName(), data.getId()).source(data.getJsonMap()));
			}else if (data.getActionType().equals(BulkData.Type.UPDATE)) {
				request.add(new UpdateRequest(data.getIndexName(), data.getTypeName(), data.getId()).doc(data.getJsonMap()));
			}else if (data.getActionType().equals(BulkData.Type.DELETE)) {
				request.add(new DeleteRequest(data.getIndexName(), data.getTypeName(), data.getId()));
			}
		}
		
		BulkResponse response = null;
		try {
			response = client.bulk(request, RequestOptions.DEFAULT);
		}catch(IOException e) {
			log.error(e);
		}
		
		for (BulkItemResponse bulkItemResponse : response) {
			if (bulkItemResponse.isFailed()) {
				BulkItemResponse.Failure failure = bulkItemResponse.getFailure();
				log.info(failure.getIndex() + " - " + failure.getType() + " - " + failure.getId() + " - " + failure.getMessage());
			}
		}
		log.info(response.getItems());
		log.info(response.getTook());
		
		return response;
	}
	
	
	public BulkProcessor getBulkProcessor(int bulkActions) {
		return _getBulkProcessor(bulkActions);
	}
	
	
	private BulkProcessor _getBulkProcessor(int bulkActions ) {
		BulkProcessor bulkProcessor = BulkProcessor.builder(
				(request, bulkListener) ->
				client.bulkAsync(request, RequestOptions.DEFAULT, bulkListener),new BulkProcessor.Listener() {
					int count = 0;
					
					@Override
					public void beforeBulk(long l, BulkRequest bulkRequest) {
						count = count + bulkRequest.numberOfActions();
						log.info("Uploaded " + count + " so far");
					}
					@Override
					public void afterBulk(long l, BulkRequest bulkRequest, BulkResponse bulkResponse) {
						if (bulkResponse.hasFailures()) {
							for (BulkItemResponse bulkItemResponse : bulkResponse) {
								if (bulkItemResponse.isFailed()) {
									BulkItemResponse.Failure failure = bulkItemResponse.getFailure();
									log.info("Error " + failure.toString());
								}
							}
						}
					}
					@Override
					public void afterBulk(long l, BulkRequest bulkRequest, Throwable throwable) {
						log.info("Errors " + throwable.toString());
					}
				})
				.setBulkActions(bulkActions).setConcurrentRequests(0)
				.setFlushInterval(TimeValue.timeValueSeconds(30L))
				.build();
		return bulkProcessor; 
	}
	
	
	public Boolean bulkDocumentWithBulkProcessor(ArrayList<BulkData> bulkList) {
		return _bulkDocumentWithBulkProcessor(bulkList, 1000);
	}
	
	public Boolean bulkDocumentWithBulkProcessor(ArrayList<BulkData> bulkList, int bulkActions) {
		return _bulkDocumentWithBulkProcessor(bulkList, bulkActions);
	}
	
	private Boolean _bulkDocumentWithBulkProcessor(ArrayList<BulkData> bulkList, int bulkActions) {
		boolean terminated = false ;
		BulkProcessor bulkProcessor = _getBulkProcessor(bulkActions);
		
		for(BulkData data : bulkList) {
			if(data.getActionType().equals(BulkData.Type.CREATE))
				bulkProcessor.add(new IndexRequest(data.getIndexName(), data.getTypeName(), data.getId()).source(data.getJsonMap()));
			else if(data.getActionType().equals(BulkData.Type.UPDATE))
				bulkProcessor.add(new UpdateRequest(data.getIndexName(), data.getTypeName(), data.getId()).doc(data.getJsonMap()));
			else if(data.getActionType().equals(BulkData.Type.DELETE))
				bulkProcessor.add(new DeleteRequest(data.getIndexName(), data.getTypeName(), data.getId()));
		}
		try {
			terminated = bulkProcessor.awaitClose(30L, TimeUnit.SECONDS);
			log.info("BulkProcessor Finished...." + terminated);
			bulkProcessor.close();
		} catch (InterruptedException e) {
			log.error(e);
		} 
		return terminated;
	}
	
	
	
	
}
