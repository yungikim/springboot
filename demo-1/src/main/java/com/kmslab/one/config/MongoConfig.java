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
	
	//공통 템플릿 생성 메서드
	private MongoTemplate createTemplate(String dbname) {
		return new MongoTemplate(new SimpleMongoClientDatabaseFactory(mongoClient, dbname));
	}
	
	@Bean(name="testMongoTemplate")
	public MongoTemplate testMongoTemplate() { return createTemplate("test");}
	
	@Bean(name="GPT")
	@Primary
	public MongoTemplate GPTMongoTemplate() {return createTemplate("GPT");}
	
	@Bean(name="GPT_LOG")
	public MongoTemplate GPT_LOGMongoTemplate() {return createTemplate("GPT_LOG");}
	
	@Bean(name="AI_Notebook")
	public MongoTemplate AI_NotebookMongoTemplate() {return createTemplate("AI_Notebook");}
	
			
	@Bean(name="userdb")
	public MongoTemplate UserdbTemplate() {return createTemplate("im_org_info");}
	
	@Bean(name="portaldb")
	public MongoTemplate PortalDB() {return createTemplate("portal");}
	
	@Bean(name="todoMain")
	public MongoTemplate TodoMain() {return createTemplate("todo_main");}
	
	@Bean(name="collection")
	public MongoTemplate CollectionDB() {return createTemplate("collection");}
	
	@Bean(name="channelInfo")
	public MongoTemplate channelInfo() {return createTemplate("channel_info");}
	
	@Bean(name="channel_data")
	public MongoTemplate channel_data() {return createTemplate("channel_data");}
	
	@Bean(name="folderdata")
	public MongoTemplate folderdata() {return createTemplate("folder_data");}
	
	@Bean(name="appstore")
	public MongoTemplate appstore() {return createTemplate("appstore");}
	
	@Bean(name="TODO")
	public MongoTemplate TODO() {return createTemplate("TODO");}
	
	@Bean(name="portlet")
	public MongoTemplate portlet() {return createTemplate("portlet");}
	
	@Bean(name="TODO_Folder")
	public MongoTemplate TODO_Folder() {return createTemplate("TODO_Folder");}
	
	@Bean(name="log")
	public MongoTemplate log() {return createTemplate("log");}
	
	@Bean(name="channel_favorite")
	public MongoTemplate channel_favorite() {return createTemplate("channel_favorite");}
	
	
}
