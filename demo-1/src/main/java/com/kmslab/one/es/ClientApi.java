package com.kmslab.one.es;

import org.elasticsearch.client.RestHighLevelClient;

import com.kmslab.one.es.api.DocumentApi;
import com.kmslab.one.es.api.IndexApi;
import com.kmslab.one.es.api.SearchApi;


public class ClientApi {
	
	//Logger log = LogManager.getLogger();
	
	private String hostname = "localhost";
	private int port = 9200;
	private String scheme = "http";
	private String user = "";
	private String pw = "";
	
	protected RestHighLevelClient client;
	
	public ClientApi() {
		init();
	}
	
	public ClientApi(String hostname) {
		this.hostname = hostname;
		init();
	}
	
	public ClientApi(String hostname, int port) {
		this.hostname = hostname;
		this.port = port;
		init();
	}
	
	public ClientApi(String hostname, int port, String scheme) {
		this.hostname = hostname;
		this.port = port;
		this.scheme = scheme;
		init();
	}
	
	
	public ClientApi(String hostname, int port, String user, String pw) {
		this.hostname = hostname;
		this.port = port;
		this.user = user;
		this.pw = pw;
		init2();
	}
	
	private void init() {
		System.out.println("connect to "  + hostname + ":" + port + " / " + scheme);
		client = ClientFactory.createClient(hostname, port, scheme);
		System.out.println("connected...");
	}
	
	private void init2() {
		System.out.println("connect to "  + hostname + ":" + port + " / " + scheme);
		client = ClientFactory.createClient(hostname, port, scheme, user, pw);
		System.out.println("connected...");
	
	}
	
	
	
	public IndexApi getIndexApi() {
		return new IndexApi(client);
	}
	
	public DocumentApi getDocumentApi() {
		return new DocumentApi(client);
	}
	
	public SearchApi getSearchApi() {
		return new SearchApi(client);
	}
	
	public void close() {
		try {
			client.close();
			System.out.println("connected closed....");
		}catch(Exception e) {
			e.printStackTrace();
		}
	}
}
