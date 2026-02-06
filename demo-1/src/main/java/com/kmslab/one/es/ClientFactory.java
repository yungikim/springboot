package com.kmslab.one.es;

import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.nio.client.HttpAsyncClientBuilder;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestClientBuilder;
import org.elasticsearch.client.RestHighLevelClient;

public class ClientFactory {
	
	public static RestHighLevelClient createClient() {
		RestHighLevelClient client = new RestHighLevelClient(RestClient.builder(new HttpHost("localhost", 9200, "http")));
		return client;
	}
	
	public static RestHighLevelClient createClient(String hostname) {
		RestHighLevelClient client = new RestHighLevelClient(RestClient.builder(new HttpHost(hostname, 9200, "http")));
		return client;
	}
	
	public static RestHighLevelClient createClient(String hostname, int port) {
		RestHighLevelClient client = new RestHighLevelClient(RestClient.builder(new HttpHost(hostname, port, "http")));
		return client;
	}
	
	public static RestHighLevelClient createClient(String hostname, int port, String scheme) {
		RestHighLevelClient client = new RestHighLevelClient(RestClient.builder(new HttpHost(hostname, port, scheme)));
		return client;
	}
	
	public static RestHighLevelClient createClient(String hostname, int port, String scheme, String user, String pw) {	
		
		final CredentialsProvider credentialsProvider = new BasicCredentialsProvider();
		credentialsProvider.setCredentials(AuthScope.ANY,
		        new UsernamePasswordCredentials(user, pw));

		RestClientBuilder builder = RestClient.builder(new HttpHost(hostname, port, scheme))
		        .setHttpClientConfigCallback(new RestClientBuilder.HttpClientConfigCallback() {
		            @Override
		            public HttpAsyncClientBuilder customizeHttpClient(HttpAsyncClientBuilder httpClientBuilder) {
		                return httpClientBuilder.setDefaultCredentialsProvider(credentialsProvider);
		            }
		        });
		
		
		RestHighLevelClient client = new RestHighLevelClient(builder);
		return client;
	}
}
