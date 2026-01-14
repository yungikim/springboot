package com.kmslab.one.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;

import com.mongodb.client.MongoClient;

@Configuration
public class MongoConfig {
	@Autowired
	private MongoClient mongoClient;
	
	@Bean(name="testMongoTemplate")
	public MongoTemplate testMongoTemplate() {
		SimpleMongoClientDatabaseFactory factory = new SimpleMongoClientDatabaseFactory(mongoClient, "test");
		return new MongoTemplate(factory);
	}
	
	@Bean(name="GPT")
	@Primary
	public MongoTemplate GPTMongoTemplate() {
		SimpleMongoClientDatabaseFactory factory = new SimpleMongoClientDatabaseFactory(mongoClient, "GPT");
		return new MongoTemplate(factory);
	}
}
