var OpenAjax=OpenAjax||{};
if(!OpenAjax.hub){
OpenAjax.hub=function(){
var _1={};
var _2="org.openajax.hub.";
return {implementer:"http://openajax.org",implVersion:"2.0.7",specVersion:"2.0",implExtraData:{},libraries:_1,registerLibrary:function(_3,_4,_5,_6){
_1[_3]={prefix:_3,namespaceURI:_4,version:_5,extraData:_6};
this.publish(_2+"registerLibrary",_1[_3]);
},unregisterLibrary:function(_7){
this.publish(_2+"unregisterLibrary",_1[_7]);
delete _1[_7];
}};
}();
OpenAjax.hub.Error={BadParameters:"OpenAjax.hub.Error.BadParameters",Disconnected:"OpenAjax.hub.Error.Disconnected",Duplicate:"OpenAjax.hub.Error.Duplicate",NoContainer:"OpenAjax.hub.Error.NoContainer",NoSubscription:"OpenAjax.hub.Error.NoSubscription",NotAllowed:"OpenAjax.hub.Error.NotAllowed",WrongProtocol:"OpenAjax.hub.Error.WrongProtocol",IncompatBrowser:"OpenAjax.hub.Error.IncompatBrowser"};
OpenAjax.hub.SecurityAlert={LoadTimeout:"OpenAjax.hub.SecurityAlert.LoadTimeout",FramePhish:"OpenAjax.hub.SecurityAlert.FramePhish",ForgedMsg:"OpenAjax.hub.SecurityAlert.ForgedMsg"};
OpenAjax.hub._debugger=function(){
};
OpenAjax.hub.ManagedHub=function(_8){
if(!_8||!_8.onPublish||!_8.onSubscribe){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
this._p=_8;
this._onUnsubscribe=_8.onUnsubscribe?_8.onUnsubscribe:null;
this._scope=_8.scope||window;
if(_8.log){
var _9=this;
this._log=function(_a){
try{
_8.log.call(_9._scope,"ManagedHub: "+_a);
}
catch(e){
OpenAjax.hub._debugger();
}
};
}else{
this._log=function(){
};
}
this._subscriptions={c:{},s:null};
this._containers={};
this._seq=0;
this._active=true;
this._isPublishing=false;
this._pubQ=[];
};
OpenAjax.hub.ManagedHub.prototype.subscribeForClient=function(_b,_c,_d){
this._assertConn();
if(this._invokeOnSubscribe(_c,_b)){
return this._subscribe(_c,this._sendToClient,this,{c:_b,sid:_d});
}
throw new Error(OpenAjax.hub.Error.NotAllowed);
};
OpenAjax.hub.ManagedHub.prototype.unsubscribeForClient=function(_e,_f){
this._unsubscribe(_f);
this._invokeOnUnsubscribe(_e,_f);
};
OpenAjax.hub.ManagedHub.prototype.publishForClient=function(_10,_11,_12){
this._assertConn();
this._publish(_11,_12,_10);
};
OpenAjax.hub.ManagedHub.prototype.disconnect=function(){
this._active=false;
for(var c in this._containers){
this.removeContainer(this._containers[c]);
}
};
OpenAjax.hub.ManagedHub.prototype.getContainer=function(_13){
var _14=this._containers[_13];
return _14?_14:null;
};
OpenAjax.hub.ManagedHub.prototype.listContainers=function(){
var res=[];
for(var c in this._containers){
res.push(this._containers[c]);
}
return res;
};
OpenAjax.hub.ManagedHub.prototype.addContainer=function(_15){
this._assertConn();
var _16=_15.getClientID();
if(this._containers[_16]){
throw new Error(OpenAjax.hub.Error.Duplicate);
}
this._containers[_16]=_15;
};
OpenAjax.hub.ManagedHub.prototype.removeContainer=function(_17){
var _18=_17.getClientID();
if(!this._containers[_18]){
throw new Error(OpenAjax.hub.Error.NoContainer);
}
_17.remove();
delete this._containers[_18];
};
OpenAjax.hub.ManagedHub.prototype.subscribe=function(_19,_1a,_1b,_1c,_1d){
this._assertConn();
this._assertSubTopic(_19);
if(!_1a){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
_1b=_1b||window;
if(!this._invokeOnSubscribe(_19,null)){
this._invokeOnComplete(_1c,_1b,null,false,OpenAjax.hub.Error.NotAllowed);
return;
}
var _1e=this;
function _1f(_20,_21,sd,_22){
if(_1e._invokeOnPublish(_20,_21,_22,null)){
try{
_1a.call(_1b,_20,_21,_1d);
}
catch(e){
OpenAjax.hub._debugger();
_1e._log("caught error from onData callback to Hub.subscribe(): "+e.message);
}
}
};
var _23=this._subscribe(_19,_1f,_1b,_1d);
this._invokeOnComplete(_1c,_1b,_23,true);
return _23;
};
OpenAjax.hub.ManagedHub.prototype.publish=function(_24,_25){
this._assertConn();
this._assertPubTopic(_24);
this._publish(_24,_25,null);
};
OpenAjax.hub.ManagedHub.prototype.unsubscribe=function(_26,_27,_28){
this._assertConn();
if(!_26){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
this._unsubscribe(_26);
this._invokeOnUnsubscribe(null,_26);
this._invokeOnComplete(_27,_28,_26,true);
};
OpenAjax.hub.ManagedHub.prototype.isConnected=function(){
return this._active;
};
OpenAjax.hub.ManagedHub.prototype.getScope=function(){
return this._scope;
};
OpenAjax.hub.ManagedHub.prototype.getSubscriberData=function(_29){
this._assertConn();
var _2a=_29.split(".");
var sid=_2a.pop();
var sub=this._getSubscriptionObject(this._subscriptions,_2a,0,sid);
if(sub){
return sub.data;
}
throw new Error(OpenAjax.hub.Error.NoSubscription);
};
OpenAjax.hub.ManagedHub.prototype.getSubscriberScope=function(_2b){
this._assertConn();
var _2c=_2b.split(".");
var sid=_2c.pop();
var sub=this._getSubscriptionObject(this._subscriptions,_2c,0,sid);
if(sub){
return sub.scope;
}
throw new Error(OpenAjax.hub.Error.NoSubscription);
};
OpenAjax.hub.ManagedHub.prototype.getParameters=function(){
return this._p;
};
OpenAjax.hub.ManagedHub.prototype._sendToClient=function(_2d,_2e,sd,_2f){
if(!this.isConnected()){
return;
}
if(this._invokeOnPublish(_2d,_2e,_2f,sd.c)){
sd.c.sendToClient(_2d,_2e,sd.sid);
}
};
OpenAjax.hub.ManagedHub.prototype._assertConn=function(){
if(!this.isConnected()){
throw new Error(OpenAjax.hub.Error.Disconnected);
}
};
OpenAjax.hub.ManagedHub.prototype._assertPubTopic=function(_30){
if(!_30||_30===""||(_30.indexOf("*")!=-1)||(_30.indexOf("..")!=-1)||(_30.charAt(0)==".")||(_30.charAt(_30.length-1)==".")){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
};
OpenAjax.hub.ManagedHub.prototype._assertSubTopic=function(_31){
if(!_31){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var _32=_31.split(".");
var len=_32.length;
for(var i=0;i<len;i++){
var p=_32[i];
if((p==="")||((p.indexOf("*")!=-1)&&(p!="*")&&(p!="**"))){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
if((p=="**")&&(i<len-1)){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
}
};
OpenAjax.hub.ManagedHub.prototype._invokeOnComplete=function(_33,_34,_35,_36,_37){
if(_33){
try{
_34=_34||window;
_33.call(_34,_35,_36,_37);
}
catch(e){
OpenAjax.hub._debugger();
this._log("caught error from onComplete callback: "+e.message);
}
}
};
OpenAjax.hub.ManagedHub.prototype._invokeOnPublish=function(_38,_39,_3a,_3b){
try{
return this._p.onPublish.call(this._scope,_38,_39,_3a,_3b);
}
catch(e){
OpenAjax.hub._debugger();
this._log("caught error from onPublish callback to constructor: "+e.message);
}
return false;
};
OpenAjax.hub.ManagedHub.prototype._invokeOnSubscribe=function(_3c,_3d){
try{
return this._p.onSubscribe.call(this._scope,_3c,_3d);
}
catch(e){
OpenAjax.hub._debugger();
this._log("caught error from onSubscribe callback to constructor: "+e.message);
}
return false;
};
OpenAjax.hub.ManagedHub.prototype._invokeOnUnsubscribe=function(_3e,_3f){
if(this._onUnsubscribe){
var _40=_3f.slice(0,_3f.lastIndexOf("."));
try{
this._onUnsubscribe.call(this._scope,_40,_3e);
}
catch(e){
OpenAjax.hub._debugger();
this._log("caught error from onUnsubscribe callback to constructor: "+e.message);
}
}
};
OpenAjax.hub.ManagedHub.prototype._subscribe=function(_41,_42,_43,_44){
var _45=_41+"."+this._seq;
var sub={scope:_43,cb:_42,data:_44,sid:this._seq++};
var _46=_41.split(".");
this._recursiveSubscribe(this._subscriptions,_46,0,sub);
return _45;
};
OpenAjax.hub.ManagedHub.prototype._recursiveSubscribe=function(_47,_48,_49,sub){
var _4a=_48[_49];
if(_49==_48.length){
sub.next=_47.s;
_47.s=sub;
}else{
if(typeof _47.c=="undefined"){
_47.c={};
}
if(typeof _47.c[_4a]=="undefined"){
_47.c[_4a]={c:{},s:null};
this._recursiveSubscribe(_47.c[_4a],_48,_49+1,sub);
}else{
this._recursiveSubscribe(_47.c[_4a],_48,_49+1,sub);
}
}
};
OpenAjax.hub.ManagedHub.prototype._publish=function(_4b,_4c,_4d){
if(this._isPublishing){
this._pubQ.push({t:_4b,d:_4c,p:_4d});
return;
}
this._safePublish(_4b,_4c,_4d);
while(this._pubQ.length>0){
var pub=this._pubQ.shift();
this._safePublish(pub.t,pub.d,pub.p);
}
};
OpenAjax.hub.ManagedHub.prototype._safePublish=function(_4e,_4f,_50){
this._isPublishing=true;
var _51=_4e.split(".");
this._recursivePublish(this._subscriptions,_51,0,_4e,_4f,_50);
this._isPublishing=false;
};
OpenAjax.hub.ManagedHub.prototype._recursivePublish=function(_52,_53,_54,_55,msg,_56){
if(typeof _52!="undefined"){
var _57;
if(_54==_53.length){
_57=_52;
}else{
this._recursivePublish(_52.c[_53[_54]],_53,_54+1,_55,msg,_56);
this._recursivePublish(_52.c["*"],_53,_54+1,_55,msg,_56);
_57=_52.c["**"];
}
if(typeof _57!="undefined"){
var sub=_57.s;
while(sub){
var sc=sub.scope;
var cb=sub.cb;
var d=sub.data;
if(typeof cb=="string"){
cb=sc[cb];
}
cb.call(sc,_55,msg,d,_56);
sub=sub.next;
}
}
}
};
OpenAjax.hub.ManagedHub.prototype._unsubscribe=function(_58){
var _59=_58.split(".");
var sid=_59.pop();
if(!this._recursiveUnsubscribe(this._subscriptions,_59,0,sid)){
throw new Error(OpenAjax.hub.Error.NoSubscription);
}
};
OpenAjax.hub.ManagedHub.prototype._recursiveUnsubscribe=function(_5a,_5b,_5c,sid){
if(typeof _5a=="undefined"){
return false;
}
if(_5c<_5b.length){
var _5d=_5a.c[_5b[_5c]];
if(!_5d){
return false;
}
this._recursiveUnsubscribe(_5d,_5b,_5c+1,sid);
if(!_5d.s){
for(var x in _5d.c){
return true;
}
delete _5a.c[_5b[_5c]];
}
}else{
var sub=_5a.s;
var _5e=null;
var _5f=false;
while(sub){
if(sid==sub.sid){
_5f=true;
if(sub==_5a.s){
_5a.s=sub.next;
}else{
_5e.next=sub.next;
}
break;
}
_5e=sub;
sub=sub.next;
}
if(!_5f){
return false;
}
}
return true;
};
OpenAjax.hub.ManagedHub.prototype._getSubscriptionObject=function(_60,_61,_62,sid){
if(typeof _60!="undefined"){
if(_62<_61.length){
var _63=_60.c[_61[_62]];
return this._getSubscriptionObject(_63,_61,_62+1,sid);
}
var sub=_60.s;
while(sub){
if(sid==sub.sid){
return sub;
}
sub=sub.next;
}
}
return null;
};
OpenAjax.hub._hub=new OpenAjax.hub.ManagedHub({onSubscribe:function(_64,_65){
return true;
},onPublish:function(_66,_67,_68,_69){
return true;
}});
OpenAjax.hub.subscribe=function(_6a,_6b,_6c,_6d){
if(typeof _6b==="string"){
_6c=_6c||window;
_6b=_6c[_6b]||null;
}
return OpenAjax.hub._hub.subscribe(_6a,_6b,_6c,null,_6d);
};
OpenAjax.hub.unsubscribe=function(_6e){
return OpenAjax.hub._hub.unsubscribe(_6e);
};
OpenAjax.hub.publish=function(_6f,_70){
OpenAjax.hub._hub.publish(_6f,_70);
};
OpenAjax.hub.registerLibrary("OpenAjax","http://openajax.org/hub","2.0",{});
}
OpenAjax.hub.InlineContainer=function(hub,_71,_72){
if(!hub||!_71||!_72||!_72.Container||!_72.Container.onSecurityAlert){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var _73=_72.Container.scope||window;
var _74=false;
var _75=[];
var _76=0;
var _77=null;
if(_72.Container.log){
var log=function(msg){
try{
_72.Container.log.call(_73,"InlineContainer::"+_71+": "+msg);
}
catch(e){
OpenAjax.hub._debugger();
}
};
}else{
log=function(){
};
}
this._init=function(){
hub.addContainer(this);
};
this.getHub=function(){
return hub;
};
this.sendToClient=function(_78,_79,_7a){
if(_74){
var sub=_75[_7a];
try{
sub.cb.call(sub.sc,_78,_79,sub.d);
}
catch(e){
OpenAjax.hub._debugger();
_77._log("caught error from onData callback to HubClient.subscribe(): "+e.message);
}
}
};
this.remove=function(){
if(_74){
_7b();
}
};
this.isConnected=function(){
return _74;
};
this.getClientID=function(){
return _71;
};
this.getPartnerOrigin=function(){
if(_74){
return window.location.protocol+"//"+window.location.hostname;
}
return null;
};
this.getParameters=function(){
return _72;
};
this.connect=function(_7c,_7d,_7e){
if(_74){
throw new Error(OpenAjax.hub.Error.Duplicate);
}
_74=true;
_77=_7c;
if(_72.Container.onConnect){
try{
_72.Container.onConnect.call(_73,this);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onConnect callback to constructor: "+e.message);
}
}
_7f(_7d,_7e,_7c,true);
};
this.disconnect=function(_80,_81,_82){
if(!_74){
throw new Error(OpenAjax.hub.Error.Disconnected);
}
_7b();
if(_72.Container.onDisconnect){
try{
_72.Container.onDisconnect.call(_73,this);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onDisconnect callback to constructor: "+e.message);
}
}
_7f(_81,_82,_80,true);
};
this.subscribe=function(_83,_84,_85,_86,_87){
_88();
_89(_83);
if(!_84){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var _8a=""+_76++;
var _8b=false;
var msg=null;
try{
var _8c=hub.subscribeForClient(this,_83,_8a);
_8b=true;
}
catch(e){
_8a=null;
msg=e.message;
}
_85=_85||window;
if(_8b){
_75[_8a]={h:_8c,cb:_84,sc:_85,d:_87};
}
_7f(_86,_85,_8a,_8b,msg);
return _8a;
};
this.publish=function(_8d,_8e){
_88();
_8f(_8d);
hub.publishForClient(this,_8d,_8e);
};
this.unsubscribe=function(_90,_91,_92){
_88();
if(typeof _90==="undefined"||_90===null){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var sub=_75[_90];
if(!sub){
throw new Error(OpenAjax.hub.Error.NoSubscription);
}
hub.unsubscribeForClient(this,sub.h);
delete _75[_90];
_7f(_91,_92,_90,true);
};
this.getSubscriberData=function(_93){
_88();
return _94(_93).d;
};
this.getSubscriberScope=function(_95){
_88();
return _94(_95).sc;
};
function _7f(_96,_97,_98,_99,_9a){
if(_96){
try{
_97=_97||window;
_96.call(_97,_98,_99,_9a);
}
catch(e){
OpenAjax.hub._debugger();
_77._log("caught error from onComplete callback: "+e.message);
}
}
};
function _7b(){
for(var _9b in _75){
hub.unsubscribeForClient(this,_75[_9b].h);
}
_75=[];
_76=0;
_74=false;
};
function _88(){
if(!_74){
throw new Error(OpenAjax.hub.Error.Disconnected);
}
};
function _8f(_9c){
if((_9c==null)||(_9c==="")||(_9c.indexOf("*")!=-1)||(_9c.indexOf("..")!=-1)||(_9c.charAt(0)==".")||(_9c.charAt(_9c.length-1)==".")){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
};
function _89(_9d){
if(!_9d){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var _9e=_9d.split(".");
var len=_9e.length;
for(var i=0;i<len;i++){
var p=_9e[i];
if((p==="")||((p.indexOf("*")!=-1)&&(p!="*")&&(p!="**"))){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
if((p=="**")&&(i<len-1)){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
}
};
function _94(_9f){
var sub=_75[_9f];
if(sub){
return sub;
}
throw new Error(OpenAjax.hub.Error.NoSubscription);
};
this._init();
};
OpenAjax.hub.InlineHubClient=function(_a0){
if(!_a0||!_a0.HubClient||!_a0.HubClient.onSecurityAlert||!_a0.InlineHubClient||!_a0.InlineHubClient.container){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var _a1=_a0.InlineHubClient.container;
var _a2=_a0.HubClient.scope||window;
if(_a0.HubClient.log){
var log=function(msg){
try{
_a0.HubClient.log.call(_a2,"InlineHubClient::"+_a1.getClientID()+": "+msg);
}
catch(e){
OpenAjax.hub._debugger();
}
};
}else{
log=function(){
};
}
this._log=log;
this.connect=function(_a3,_a4){
_a1.connect(this,_a3,_a4);
};
this.disconnect=function(_a5,_a6){
_a1.disconnect(this,_a5,_a6);
};
this.getPartnerOrigin=function(){
return _a1.getPartnerOrigin();
};
this.getClientID=function(){
return _a1.getClientID();
};
this.subscribe=function(_a7,_a8,_a9,_aa,_ab){
return _a1.subscribe(_a7,_a8,_a9,_aa,_ab);
};
this.publish=function(_ac,_ad){
_a1.publish(_ac,_ad);
};
this.unsubscribe=function(_ae,_af,_b0){
_a1.unsubscribe(_ae,_af,_b0);
};
this.isConnected=function(){
return _a1.isConnected();
};
this.getScope=function(){
return _a2;
};
this.getSubscriberData=function(_b1){
return _a1.getSubscriberData(_b1);
};
this.getSubscriberScope=function(_b2){
return _a1.getSubscriberScope(_b2);
};
this.getParameters=function(){
return _a0;
};
};
var OpenAjax=OpenAjax||{};
OpenAjax.hub=OpenAjax.hub||{};
OpenAjax.gadgets=typeof OpenAjax.gadgets==="object"?OpenAjax.gadgets:typeof gadgets==="object"?gadgets:{};
OpenAjax.gadgets.rpctx=OpenAjax.gadgets.rpctx||{};
(function(){
if(typeof gadgets==="undefined"){
if(typeof oaaConfig==="undefined"){
var _b3=document.getElementsByTagName("script");
var _b4=/openajax(?:managedhub-(?:all|core).*|-mashup)\.js$/i;
for(var i=_b3.length-1;i>=0;i--){
var src=_b3[i].getAttribute("src");
if(!src){
continue;
}
var m=src.match(_b4);
if(m){
var _b5=_b3[i].getAttribute("oaaConfig");
if(_b5){
try{
oaaConfig=eval("({ "+_b5+" })");
}
catch(e){
}
}
break;
}
}
}
if(typeof oaaConfig!=="undefined"&&oaaConfig.gadgetsGlobal){
gadgets=OpenAjax.gadgets;
}
}
})();
if(!OpenAjax.hub.IframeContainer){
(function(){
OpenAjax.hub.IframeContainer=function(hub,_b6,_b7){
_b8(arguments);
var _b9=this;
var _ba=_b7.Container.scope||window;
var _bb=false;
var _bc={};
var _bd;
var _be;
var _bf=_b7.IframeContainer.timeout||15000;
var _c0;
if(_b7.Container.log){
var log=function(msg){
try{
_b7.Container.log.call(_ba,"IframeContainer::"+_b6+": "+msg);
}
catch(e){
OpenAjax.hub._debugger();
}
};
}else{
log=function(){
};
}
this._init=function(){
hub.addContainer(this);
_be=OpenAjax.hub.IframeContainer._rpcRouter.add(_b6,this);
_bd=_114(_b7,_ba,log);
var _c1=_b7.IframeContainer.clientRelay;
var _c2=OpenAjax.gadgets.rpc.getRelayChannel();
if(_b7.IframeContainer.tunnelURI){
if(_c2!=="wpm"&&_c2!=="ifpc"){
throw new Error(OpenAjax.hub.Error.IncompatBrowser);
}
}else{
log("WARNING: Parameter 'IframeContaienr.tunnelURI' not specified. Connection will not be fully secure.");
if(_c2==="rmr"&&!_c1){
_c1=OpenAjax.gadgets.rpc.getOrigin(_b7.IframeContainer.uri)+"/robots.txt";
}
}
_c3();
OpenAjax.gadgets.rpc.setupReceiver(_be,_c1);
_c4();
};
this.sendToClient=function(_c5,_c6,_c7){
OpenAjax.gadgets.rpc.call(_be,"openajax.pubsub",null,"pub",_c5,_c6,_c7);
};
this.remove=function(){
_c8();
clearTimeout(_c0);
OpenAjax.gadgets.rpc.removeReceiver(_be);
var _c9=document.getElementById(_be);
_c9.parentNode.removeChild(_c9);
OpenAjax.hub.IframeContainer._rpcRouter.remove(_be);
};
this.isConnected=function(){
return _bb;
};
this.getClientID=function(){
return _b6;
};
this.getPartnerOrigin=function(){
if(_bb){
var _ca=OpenAjax.gadgets.rpc.getReceiverOrigin(_be);
if(_ca){
return (/^([a-zA-Z]+:\/\/[^:]+).*/.exec(_ca)[1]);
}
}
return null;
};
this.getParameters=function(){
return _b7;
};
this.getHub=function(){
return hub;
};
this.getIframe=function(){
return document.getElementById(_be);
};
function _b8(_cb){
var hub=_cb[0],_b6=_cb[1],_b7=_cb[2];
if(!hub||!_b6||!_b7||!_b7.Container||!_b7.Container.onSecurityAlert||!_b7.IframeContainer||!_b7.IframeContainer.parent||!_b7.IframeContainer.uri){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
};
this._handleIncomingRPC=function(_cc,_cd,_ce){
switch(_cc){
case "pub":
hub.publishForClient(_b9,_cd,_ce);
break;
case "sub":
var _cf="";
try{
_bc[_ce]=hub.subscribeForClient(_b9,_cd,_ce);
}
catch(e){
_cf=e.message;
}
return _cf;
case "uns":
var _d0=_bc[_ce];
hub.unsubscribeForClient(_b9,_d0);
delete _bc[_ce];
return _ce;
case "con":
_d1();
return true;
case "dis":
_c4();
_c8();
if(_b7.Container.onDisconnect){
try{
_b7.Container.onDisconnect.call(_ba,_b9);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onDisconnect callback to constructor: "+e.message);
}
}
return true;
}
};
this._onSecurityAlert=function(_d2){
_d3(_113[_d2]);
};
function _c3(){
var _d4=document.createElement("span");
_b7.IframeContainer.parent.appendChild(_d4);
var _d5="<iframe id=\""+_be+"\" name=\""+_be+"\" src=\"javascript:'<html></html>'\"";
var _d6="";
var _d7=_b7.IframeContainer.iframeAttrs;
if(_d7){
for(var _d8 in _d7){
switch(_d8){
case "style":
for(var _d9 in _d7.style){
_d6+=_d9+":"+_d7.style[_d9]+";";
}
break;
case "className":
_d5+=" class=\""+_d7[_d8]+"\"";
break;
default:
_d5+=" "+_d8+"=\""+_d7[_d8]+"\"";
}
}
}
_d6+="visibility:hidden;";
_d5+=" style=\""+_d6+"\"></iframe>";
_d4.innerHTML=_d5;
var _da;
if(_b7.IframeContainer.tunnelURI){
_da="&parent="+encodeURIComponent(_b7.IframeContainer.tunnelURI)+"&forcesecure=true";
}else{
_da="&oahParent="+encodeURIComponent(OpenAjax.gadgets.rpc.getOrigin(window.location.href));
}
var _db="";
if(_be!==_b6){
_db="&oahId="+_be.substring(_be.lastIndexOf("_")+1);
}
document.getElementById(_be).src=_b7.IframeContainer.uri+"#rpctoken="+_bd+_da+_db;
};
function _d1(){
function _dc(_dd){
if(_dd){
_bb=true;
clearTimeout(_c0);
document.getElementById(_be).style.visibility="visible";
if(_b7.Container.onConnect){
try{
_b7.Container.onConnect.call(_ba,_b9);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onConnect callback to constructor: "+e.message);
}
}
}
};
OpenAjax.gadgets.rpc.call(_be,"openajax.pubsub",_dc,"cmd","con");
};
function _c8(){
if(_bb){
_bb=false;
document.getElementById(_be).style.visibility="hidden";
for(var s in _bc){
hub.unsubscribeForClient(_b9,_bc[s]);
}
_bc={};
}
};
function _d3(_de){
try{
_b7.Container.onSecurityAlert.call(_ba,_b9,_de);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onSecurityAlert callback to constructor: "+e.message);
}
};
function _c4(){
_c0=setTimeout(function(){
_d3(OpenAjax.hub.SecurityAlert.LoadTimeout);
_b9._handleIncomingRPC=function(){
};
},_bf);
};
this._init();
};
OpenAjax.hub.IframeHubClient=function(_df){
if(!_df||!_df.HubClient||!_df.HubClient.onSecurityAlert){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var _e0=this;
var _e1=_df.HubClient.scope||window;
var _e2=false;
var _e3={};
var _e4=0;
var _e5;
if(_df.HubClient.log){
var log=function(msg){
try{
_df.HubClient.log.call(_e1,"IframeHubClient::"+_e5+": "+msg);
}
catch(e){
OpenAjax.hub._debugger();
}
};
}else{
log=function(){
};
}
this._init=function(){
var _e6=OpenAjax.gadgets.util.getUrlParameters();
if(!_e6.parent){
var _e7=_e6.oahParent+"/robots.txt";
OpenAjax.gadgets.rpc.setupReceiver("..",_e7);
}
if(_df.IframeHubClient&&_df.IframeHubClient.requireParentVerifiable&&OpenAjax.gadgets.rpc.getReceiverOrigin("..")===null){
OpenAjax.gadgets.rpc.removeReceiver("..");
throw new Error(OpenAjax.hub.Error.IncompatBrowser);
}
OpenAjax.hub.IframeContainer._rpcRouter.add("..",this);
_e5=OpenAjax.gadgets.rpc.RPC_ID;
if(_e6.oahId){
_e5=_e5.substring(0,_e5.lastIndexOf("_"));
}
};
this.connect=function(_e8,_e9){
if(_e2){
throw new Error(OpenAjax.hub.Error.Duplicate);
}
function _ea(_eb){
if(_eb){
_e2=true;
if(_e8){
try{
_e8.call(_e9||window,_e0,true);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onComplete callback to connect(): "+e.message);
}
}
}
};
OpenAjax.gadgets.rpc.call("..","openajax.pubsub",_ea,"con");
};
this.disconnect=function(_ec,_ed){
if(!_e2){
throw new Error(OpenAjax.hub.Error.Disconnected);
}
_e2=false;
var _ee=null;
if(_ec){
_ee=function(_ef){
try{
_ec.call(_ed||window,_e0,true);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onComplete callback to disconnect(): "+e.message);
}
};
}
OpenAjax.gadgets.rpc.call("..","openajax.pubsub",_ee,"dis");
};
this.getPartnerOrigin=function(){
if(_e2){
var _f0=OpenAjax.gadgets.rpc.getReceiverOrigin("..");
if(_f0){
return (/^([a-zA-Z]+:\/\/[^:]+).*/.exec(_f0)[1]);
}
}
return null;
};
this.getClientID=function(){
return _e5;
};
this.subscribe=function(_f1,_f2,_f3,_f4,_f5){
_f6();
_f7(_f1);
if(!_f2){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
_f3=_f3||window;
var _f8=""+_e4++;
_e3[_f8]={cb:_f2,sc:_f3,d:_f5};
function _f9(_fa){
if(_fa!==""){
delete _e3[_f8];
}
if(_f4){
try{
_f4.call(_f3,_f8,_fa==="",_fa);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onComplete callback to subscribe(): "+e.message);
}
}
};
OpenAjax.gadgets.rpc.call("..","openajax.pubsub",_f9,"sub",_f1,_f8);
return _f8;
};
this.publish=function(_fb,_fc){
_f6();
_fd(_fb);
OpenAjax.gadgets.rpc.call("..","openajax.pubsub",null,"pub",_fb,_fc);
};
this.unsubscribe=function(_fe,_ff,_100){
_f6();
if(!_fe){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
if(!_e3[_fe]||_e3[_fe].uns){
throw new Error(OpenAjax.hub.Error.NoSubscription);
}
_e3[_fe].uns=true;
function _101(_102){
delete _e3[_fe];
if(_ff){
try{
_ff.call(_100||window,_fe,true);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onComplete callback to unsubscribe(): "+e.message);
}
}
};
OpenAjax.gadgets.rpc.call("..","openajax.pubsub",_101,"uns",null,_fe);
};
this.isConnected=function(){
return _e2;
};
this.getScope=function(){
return _e1;
};
this.getSubscriberData=function(_103){
_f6();
if(_e3[_103]){
return _e3[_103].d;
}
throw new Error(OpenAjax.hub.Error.NoSubscription);
};
this.getSubscriberScope=function(_104){
_f6();
if(_e3[_104]){
return _e3[_104].sc;
}
throw new Error(OpenAjax.hub.Error.NoSubscription);
};
this.getParameters=function(){
return _df;
};
this._handleIncomingRPC=function(_105,_106,data,_107){
if(_105==="pub"){
if(_e3[_107]&&!_e3[_107].uns){
try{
_e3[_107].cb.call(_e3[_107].sc,_106,data,_e3[_107].d);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onData callback to subscribe(): "+e.message);
}
}
}
if(_106==="con"){
return true;
}
return false;
};
function _f6(){
if(!_e2){
throw new Error(OpenAjax.hub.Error.Disconnected);
}
};
function _f7(_108){
if(!_108){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var path=_108.split(".");
var len=path.length;
for(var i=0;i<len;i++){
var p=path[i];
if((p==="")||((p.indexOf("*")!=-1)&&(p!="*")&&(p!="**"))){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
if((p=="**")&&(i<len-1)){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
}
};
function _fd(_109){
if(!_109||_109===""||(_109.indexOf("*")!=-1)||(_109.indexOf("..")!=-1)||(_109.charAt(0)==".")||(_109.charAt(_109.length-1)==".")){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
};
this._init();
};
OpenAjax.hub.IframeContainer._rpcRouter=function(){
var _10a={};
function _10b(){
var r=_10a[this.f];
if(r){
return r._handleIncomingRPC.apply(r,arguments);
}
};
function _10c(_10d,_10e){
var r=_10a[_10d];
if(r){
r._onSecurityAlert.call(r,_10e);
}
};
return {add:function(id,_10f){
function _110(id,_111){
if(id===".."){
if(!_10a[".."]){
_10a[".."]=_111;
}
return;
}
var _112=id;
while(document.getElementById(_112)){
_112=id+"_"+((32767*Math.random())|0).toString(16);
}
_10a[_112]=_111;
return _112;
};
OpenAjax.gadgets.rpc.register("openajax.pubsub",_10b);
OpenAjax.gadgets.rpc.config({securityCallback:_10c});
_113[OpenAjax.gadgets.rpc.SEC_ERROR_LOAD_TIMEOUT]=OpenAjax.hub.SecurityAlert.LoadTimeout;
_113[OpenAjax.gadgets.rpc.SEC_ERROR_FRAME_PHISH]=OpenAjax.hub.SecurityAlert.FramePhish;
_113[OpenAjax.gadgets.rpc.SEC_ERROR_FORGED_MSG]=OpenAjax.hub.SecurityAlert.ForgedMsg;
this.add=_110;
return _110(id,_10f);
},remove:function(id){
delete _10a[id];
}};
}();
var _113={};
function _114(_115,_116,log){
if(!OpenAjax.hub.IframeContainer._prng){
var seed=new Date().getTime()+Math.random()+document.cookie;
OpenAjax.hub.IframeContainer._prng=OpenAjax._smash.crypto.newPRNG(seed);
}
var p=_115.IframeContainer||_115.IframeHubClient;
if(p&&p.seed){
try{
var _117=p.seed.call(_116);
OpenAjax.hub.IframeContainer._prng.addSeed(_117);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from 'seed' callback: "+e.message);
}
}
var _118=(p&&p.tokenLength)||6;
return OpenAjax.hub.IframeContainer._prng.nextRandomB64Str(_118);
};
})();
}
if(typeof OpenAjax._smash=="undefined"){
OpenAjax._smash={};
}
OpenAjax._smash.crypto={"strToWA":function(str,_119){
var bin=Array();
var mask=(1<<_119)-1;
for(var i=0;i<str.length*_119;i+=_119){
bin[i>>5]|=(str.charCodeAt(i/_119)&mask)<<(32-_119-i%32);
}
return bin;
},"hmac_sha1":function(_11a,_11b,_11c){
var ipad=Array(16),opad=Array(16);
for(var i=0;i<16;i++){
ipad[i]=_11a[i]^909522486;
opad[i]=_11a[i]^1549556828;
}
var hash=this.sha1(ipad.concat(this.strToWA(_11b,_11c)),512+_11b.length*_11c);
return this.sha1(opad.concat(hash),512+160);
},"newPRNG":function(_11d){
var that=this;
if((typeof _11d!="string")||(_11d.length<12)){
alert("WARNING: Seed length too short ...");
}
var _11e=[43417,15926,18182,33130,9585,30800,49772,40144,47678,55453,4659,38181,65340,6787,54417,65301];
var _11f=[];
var _120=0;
function _121(_122){
return that.hmac_sha1(_11e,_122,8);
};
function _123(_124){
var _125=_121(_124);
for(var i=0;i<5;i++){
_11f[i]^=_125[i];
}
};
_123(_11d);
return {"addSeed":function(seed){
_123(seed);
},"nextRandomOctets":function(len){
var _126=[];
while(len>0){
_120+=1;
var _127=that.hmac_sha1(_11f,(_120).toString(16),8);
for(i=0;(i<20)&(len>0);i++,len--){
_126.push((_127[i>>2]>>(i%4))%256);
}
}
return _126;
},"nextRandomB64Str":function(len){
var _128="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
var _129=this.nextRandomOctets(len);
var _12a="";
for(var i=0;i<len;i++){
_12a+=_128.charAt(_129[i]&63);
}
return _12a;
}};
},"sha1":function(){
var _12b=function(x,y){
var lsw=(x&65535)+(y&65535);
var msw=(x>>16)+(y>>16)+(lsw>>16);
return (msw<<16)|(lsw&65535);
};
var rol=function(num,cnt){
return (num<<cnt)|(num>>>(32-cnt));
};
function _12c(t,b,c,d){
if(t<20){
return (b&c)|((~b)&d);
}
if(t<40){
return b^c^d;
}
if(t<60){
return (b&c)|(b&d)|(c&d);
}
return b^c^d;
};
function _12d(t){
return (t<20)?1518500249:(t<40)?1859775393:(t<60)?-1894007588:-899497514;
};
return function(_12e,_12f){
_12e[_12f>>5]|=128<<(24-_12f%32);
_12e[((_12f+64>>9)<<4)+15]=_12f;
var W=Array(80);
var H0=1732584193;
var H1=-271733879;
var H2=-1732584194;
var H3=271733878;
var H4=-1009589776;
for(var i=0;i<_12e.length;i+=16){
var a=H0;
var b=H1;
var c=H2;
var d=H3;
var e=H4;
for(var j=0;j<80;j++){
W[j]=((j<16)?_12e[i+j]:rol(W[j-3]^W[j-8]^W[j-14]^W[j-16],1));
var T=_12b(_12b(rol(a,5),_12c(j,b,c,d)),_12b(_12b(e,W[j]),_12d(j)));
e=d;
d=c;
c=rol(b,30);
b=a;
a=T;
}
H0=_12b(a,H0);
H1=_12b(b,H1);
H2=_12b(c,H2);
H3=_12b(d,H3);
H4=_12b(e,H4);
}
return Array(H0,H1,H2,H3,H4);
};
}()};
if(!this.JSON){
JSON={};
}
(function(){
function f(n){
return n<10?"0"+n:n;
};
if(typeof Date.prototype.toJSON!=="function"){
Date.prototype.toJSON=function(key){
return this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z";
};
String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){
return this.valueOf();
};
}
var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,_130=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,_131,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r","\"":"\\\"","\\":"\\\\"},rep;
function _132(_133){
_130.lastIndex=0;
return _130.test(_133)?"\""+_133.replace(_130,function(a){
var c=meta[a];
return typeof c==="string"?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4);
})+"\"":"\""+_133+"\"";
};
function str(key,_134){
var i,k,v,_135,mind=gap,_136,_137=_134[key];
if(_137&&typeof _137==="object"&&typeof _137.toJSON==="function"){
_137=_137.toJSON(key);
}
if(typeof rep==="function"){
_137=rep.call(_134,key,_137);
}
switch(typeof _137){
case "string":
return _132(_137);
case "number":
return isFinite(_137)?String(_137):"null";
case "boolean":
case "null":
return String(_137);
case "object":
if(!_137){
return "null";
}
gap+=_131;
_136=[];
if(Object.prototype.toString.apply(_137)==="[object Array]"){
_135=_137.length;
for(i=0;i<_135;i+=1){
_136[i]=str(i,_137)||"null";
}
v=_136.length===0?"[]":gap?"[\n"+gap+_136.join(",\n"+gap)+"\n"+mind+"]":"["+_136.join(",")+"]";
gap=mind;
return v;
}
if(rep&&typeof rep==="object"){
_135=rep.length;
for(i=0;i<_135;i+=1){
k=rep[i];
if(typeof k==="string"){
v=str(k,_137);
if(v){
_136.push(_132(k)+(gap?": ":":")+v);
}
}
}
}else{
for(k in _137){
if(Object.hasOwnProperty.call(_137,k)){
v=str(k,_137);
if(v){
_136.push(_132(k)+(gap?": ":":")+v);
}
}
}
}
v=_136.length===0?"{}":gap?"{\n"+gap+_136.join(",\n"+gap)+"\n"+mind+"}":"{"+_136.join(",")+"}";
gap=mind;
return v;
}
};
if(typeof JSON.stringify!=="function"){
JSON.stringify=function(_138,_139,_13a){
var i;
gap="";
_131="";
if(typeof _13a==="number"){
for(i=0;i<_13a;i+=1){
_131+=" ";
}
}else{
if(typeof _13a==="string"){
_131=_13a;
}
}
rep=_139;
if(_139&&typeof _139!=="function"&&(typeof _139!=="object"||typeof _139.length!=="number")){
throw new Error("JSON.stringify");
}
return str("",{"":_138});
};
}
if(typeof JSON.parse!=="function"){
JSON.parse=function(text,_13b){
var j;
function walk(_13c,key){
var k,v,_13d=_13c[key];
if(_13d&&typeof _13d==="object"){
for(k in _13d){
if(Object.hasOwnProperty.call(_13d,k)){
v=walk(_13d,k);
if(v!==undefined){
_13d[k]=v;
}else{
delete _13d[k];
}
}
}
}
return _13b.call(_13c,key,_13d);
};
cx.lastIndex=0;
if(cx.test(text)){
text=text.replace(cx,function(a){
return "\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4);
});
}
if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){
j=eval("("+text+")");
return typeof _13b==="function"?walk({"":j},""):j;
}
throw new SyntaxError("JSON.parse");
};
}
})();
OpenAjax.gadgets.util=function(){
function _13e(url){
var _13f;
var _140=url.indexOf("?");
var _141=url.indexOf("#");
if(_141===-1){
_13f=url.substr(_140+1);
}else{
_13f=[url.substr(_140+1,_141-_140-1),"&",url.substr(_141+1)].join("");
}
return _13f.split("&");
};
var _142=null;
var _143=[];
return {getUrlParameters:function(_144){
if(_142!==null&&typeof _144==="undefined"){
return _142;
}
var _145={};
var _146=_13e(_144||document.location.href);
var _147=window.decodeURIComponent?decodeURIComponent:unescape;
for(var i=0,j=_146.length;i<j;++i){
var pos=_146[i].indexOf("=");
if(pos===-1){
continue;
}
var _148=_146[i].substring(0,pos);
var _149=_146[i].substring(pos+1);
_149=_149.replace(/\+/g," ");
_145[_148]=_147(_149);
}
if(typeof _144==="undefined"){
_142=_145;
}
return _145;
},registerOnLoadHandler:function(_14a){
_143.push(_14a);
},runOnLoadHandlers:function(){
for(var i=0,j=_143.length;i<j;++i){
_143[i]();
}
},"attachBrowserEvent":function(elem,_14b,_14c,_14d){
if(elem.addEventListener){
elem.addEventListener(_14b,_14c,_14d);
}else{
if(elem.attachEvent){
elem.attachEvent("on"+_14b,_14c);
}
}
},"removeBrowserEvent":function(elem,_14e,_14f,_150){
if(elem.removeEventListener){
elem.removeEventListener(_14e,_14f,_150);
}else{
if(elem.detachEvent){
elem.detachEvent("on"+_14e,_14f);
}
}
}};
}();
OpenAjax.gadgets.util.getUrlParameters();
OpenAjax.gadgets.json=OpenAjax.gadgets.json||{};
if(!OpenAjax.gadgets.json.stringify){
OpenAjax.gadgets.json={parse:function(str){
try{
return window.JSON.parse(str);
}
catch(e){
return false;
}
},stringify:function(obj){
try{
return window.JSON.stringify(obj);
}
catch(e){
return null;
}
}};
}
OpenAjax.gadgets.log=function(_151){
OpenAjax.gadgets.log.logAtLevel(OpenAjax.gadgets.log.INFO,_151);
};
OpenAjax.gadgets.warn=function(_152){
OpenAjax.gadgets.log.logAtLevel(OpenAjax.gadgets.log.WARNING,_152);
};
OpenAjax.gadgets.error=function(_153){
OpenAjax.gadgets.log.logAtLevel(OpenAjax.gadgets.log.ERROR,_153);
};
OpenAjax.gadgets.setLogLevel=function(_154){
OpenAjax.gadgets.log.logLevelThreshold_=_154;
};
OpenAjax.gadgets.log.logAtLevel=function(_155,_156){
if(_155<OpenAjax.gadgets.log.logLevelThreshold_||!OpenAjax.gadgets.log._console){
return;
}
var _157;
var _158=OpenAjax.gadgets.log._console;
if(_155==OpenAjax.gadgets.log.WARNING&&_158.warn){
_158.warn(_156);
}else{
if(_155==OpenAjax.gadgets.log.ERROR&&_158.error){
_158.error(_156);
}else{
if(_158.log){
_158.log(_156);
}
}
}
};
OpenAjax.gadgets.log.INFO=1;
OpenAjax.gadgets.log.WARNING=2;
OpenAjax.gadgets.log.ERROR=3;
OpenAjax.gadgets.log.NONE=4;
OpenAjax.gadgets.log.logLevelThreshold_=OpenAjax.gadgets.log.INFO;
OpenAjax.gadgets.log._console=window.console?window.console:window.opera?window.opera.postError:undefined;
(function(){
if(!window.__isgadget){
var _159=false;
function _15a(){
if(!_159){
_159=true;
OpenAjax.gadgets.util.runOnLoadHandlers();
OpenAjax.gadgets.util.registerOnLoadHandler=function(_15b){
setTimeout(_15b,0);
};
if(window.detachEvent){
window.detachEvent("onload",_15a);
}
}
};
if(window.addEventListener){
document.addEventListener("DOMContentLoaded",_15a,false);
window.addEventListener("load",_15a,false);
}else{
if(window.attachEvent){
window.attachEvent("onload",_15a);
}
}
}
})();
OpenAjax.gadgets.rpctx=OpenAjax.gadgets.rpctx||{};
if(!OpenAjax.gadgets.rpctx.frameElement){
OpenAjax.gadgets.rpctx.frameElement=function(){
var _15c="__g2c_rpc";
var _15d="__c2g_rpc";
var _15e;
var _15f;
function _160(_161,from,rpc){
try{
if(from!==".."){
var fe=window.frameElement;
if(typeof fe[_15c]==="function"){
if(typeof fe[_15c][_15d]!=="function"){
fe[_15c][_15d]=function(args){
_15e(OpenAjax.gadgets.json.parse(args));
};
}
fe[_15c](OpenAjax.gadgets.json.stringify(rpc));
return;
}
}else{
var _162=document.getElementById(_161);
if(typeof _162[_15c]==="function"&&typeof _162[_15c][_15d]==="function"){
_162[_15c][_15d](OpenAjax.gadgets.json.stringify(rpc));
return;
}
}
}
catch(e){
}
return true;
};
return {getCode:function(){
return "fe";
},isParentVerifiable:function(){
return false;
},init:function(_163,_164){
_15e=_163;
_15f=_164;
return true;
},setup:function(_165,_166){
if(_165!==".."){
try{
var _167=document.getElementById(_165);
_167[_15c]=function(args){
_15e(OpenAjax.gadgets.json.parse(args));
};
}
catch(e){
return false;
}
}
if(_165===".."){
_15f("..",true);
var _168=function(){
window.setTimeout(function(){
OpenAjax.gadgets.rpc.call(_165,OpenAjax.gadgets.rpc.ACK);
},500);
};
OpenAjax.gadgets.util.registerOnLoadHandler(_168);
}
return true;
},call:function(_169,from,rpc){
_160(_169,from,rpc);
}};
}();
}
OpenAjax.gadgets.rpctx=OpenAjax.gadgets.rpctx||{};
if(!OpenAjax.gadgets.rpctx.ifpc){
OpenAjax.gadgets.rpctx.ifpc=function(){
var _16a=[];
var _16b=0;
var _16c;
var _16d=2000;
var _16e={};
function _16f(args){
var _170=[];
for(var i=0,j=args.length;i<j;++i){
_170.push(encodeURIComponent(OpenAjax.gadgets.json.stringify(args[i])));
}
return _170.join("&");
};
function _171(src){
var _172;
for(var i=_16a.length-1;i>=0;--i){
var ifr=_16a[i];
try{
if(ifr&&(ifr.recyclable||ifr.readyState==="complete")){
ifr.parentNode.removeChild(ifr);
if(window.ActiveXObject){
_16a[i]=ifr=null;
_16a.splice(i,1);
}else{
ifr.recyclable=false;
_172=ifr;
break;
}
}
}
catch(e){
}
}
if(!_172){
_172=document.createElement("iframe");
_172.style.border=_172.style.width=_172.style.height="0px";
_172.style.visibility="hidden";
_172.style.position="absolute";
_172.onload=function(){
this.recyclable=true;
};
_16a.push(_172);
}
_172.src=src;
window.setTimeout(function(){
document.body.appendChild(_172);
},0);
};
function _173(arr,_174){
for(var i=_174-1;i>=0;--i){
if(typeof arr[i]==="undefined"){
return false;
}
}
return true;
};
return {getCode:function(){
return "ifpc";
},isParentVerifiable:function(){
return true;
},init:function(_175,_176){
_16c=_176;
_16c("..",true);
return true;
},setup:function(_177,_178){
_16c(_177,true);
return true;
},call:function(_179,from,rpc){
var _17a=OpenAjax.gadgets.rpc.getRelayUrl(_179);
++_16b;
if(!_17a){
OpenAjax.gadgets.warn("No relay file assigned for IFPC");
return;
}
var src=null,_17b=[];
if(rpc.l){
var _17c=rpc.a;
src=[_17a,"#",_16f([from,_16b,1,0,_16f([from,rpc.s,"","",from].concat(_17c))])].join("");
_17b.push(src);
}else{
src=[_17a,"#",_179,"&",from,"@",_16b,"&"].join("");
var _17d=encodeURIComponent(OpenAjax.gadgets.json.stringify(rpc)),_17e=_16d-src.length,_17f=Math.ceil(_17d.length/_17e),_180=0,part;
while(_17d.length>0){
part=_17d.substring(0,_17e);
_17d=_17d.substring(_17e);
_17b.push([src,_17f,"&",_180,"&",part].join(""));
_180+=1;
}
}
do{
_171(_17b.shift());
}while(_17b.length>0);
return true;
},_receiveMessage:function(_181,_182){
var from=_181[1],_183=parseInt(_181[2],10),_184=parseInt(_181[3],10),_185=_181[_181.length-1],_186=_183===1;
if(_183>1){
if(!_16e[from]){
_16e[from]=[];
}
_16e[from][_184]=_185;
if(_173(_16e[from],_183)){
_185=_16e[from].join("");
delete _16e[from];
_186=true;
}
}
if(_186){
_182(OpenAjax.gadgets.json.parse(decodeURIComponent(_185)));
}
}};
}();
}
OpenAjax.gadgets.rpctx=OpenAjax.gadgets.rpctx||{};
if(!OpenAjax.gadgets.rpctx.rmr){
OpenAjax.gadgets.rpctx.rmr=function(){
var _187=500;
var _188=10;
var _189={};
var _18a;
var _18b;
function _18c(_18d,_18e,data,_18f){
var _190=function(){
document.body.appendChild(_18d);
_18d.src="about:blank";
if(_18f){
_18d.onload=function(){
_1a5(_18f);
};
}
_18d.src=_18e+"#"+data;
};
if(document.body){
_190();
}else{
OpenAjax.gadgets.util.registerOnLoadHandler(function(){
_190();
});
}
};
function _191(_192){
if(typeof _189[_192]==="object"){
return;
}
var _193=document.createElement("iframe");
var _194=_193.style;
_194.position="absolute";
_194.top="0px";
_194.border="0";
_194.opacity="0";
_194.width="10px";
_194.height="1px";
_193.id="rmrtransport-"+_192;
_193.name=_193.id;
var _195=OpenAjax.gadgets.rpc.getRelayUrl(_192);
if(!_195){
_195=OpenAjax.gadgets.rpc.getOrigin(OpenAjax.gadgets.util.getUrlParameters()["parent"])+"/robots.txt";
}
_189[_192]={frame:_193,receiveWindow:null,relayUri:_195,searchCounter:0,width:10,waiting:true,queue:[],sendId:0,recvId:0};
if(_192!==".."){
_18c(_193,_195,_196(_192));
}
_197(_192);
};
function _197(_198){
var _199=null;
_189[_198].searchCounter++;
try{
var _19a=OpenAjax.gadgets.rpc._getTargetWin(_198);
if(_198===".."){
_199=_19a.frames["rmrtransport-"+OpenAjax.gadgets.rpc.RPC_ID];
}else{
_199=_19a.frames["rmrtransport-.."];
}
}
catch(e){
}
var _19b=false;
if(_199){
_19b=_19c(_198,_199);
}
if(!_19b){
if(_189[_198].searchCounter>_188){
return;
}
window.setTimeout(function(){
_197(_198);
},_187);
}
};
function _19d(_19e,_19f,from,rpc){
var _1a0=null;
if(from!==".."){
_1a0=_189[".."];
}else{
_1a0=_189[_19e];
}
if(_1a0){
if(_19f!==OpenAjax.gadgets.rpc.ACK){
_1a0.queue.push(rpc);
}
if(_1a0.waiting||(_1a0.queue.length===0&&!(_19f===OpenAjax.gadgets.rpc.ACK&&rpc&&rpc.ackAlone===true))){
return true;
}
if(_1a0.queue.length>0){
_1a0.waiting=true;
}
var url=_1a0.relayUri+"#"+_196(_19e);
try{
_1a0.frame.contentWindow.location=url;
var _1a1=_1a0.width==10?20:10;
_1a0.frame.style.width=_1a1+"px";
_1a0.width=_1a1;
}
catch(e){
return false;
}
}
return true;
};
function _196(_1a2){
var _1a3=_189[_1a2];
var _1a4={id:_1a3.sendId};
if(_1a3){
_1a4.d=Array.prototype.slice.call(_1a3.queue,0);
_1a4.d.push({s:OpenAjax.gadgets.rpc.ACK,id:_1a3.recvId});
}
return OpenAjax.gadgets.json.stringify(_1a4);
};
function _1a5(_1a6){
var _1a7=_189[_1a6];
var data=_1a7.receiveWindow.location.hash.substring(1);
var _1a8=OpenAjax.gadgets.json.parse(decodeURIComponent(data))||{};
var _1a9=_1a8.d||[];
var _1aa=false;
var _1ab=false;
var _1ac=0;
var _1ad=(_1a7.recvId-_1a8.id);
for(var i=0;i<_1a9.length;++i){
var rpc=_1a9[i];
if(rpc.s===OpenAjax.gadgets.rpc.ACK){
_18b(_1a6,true);
if(_1a7.waiting){
_1ab=true;
}
_1a7.waiting=false;
var _1ae=Math.max(0,rpc.id-_1a7.sendId);
_1a7.queue.splice(0,_1ae);
_1a7.sendId=Math.max(_1a7.sendId,rpc.id||0);
continue;
}
_1aa=true;
if(++_1ac<=_1ad){
continue;
}
++_1a7.recvId;
_18a(rpc);
}
if(_1aa||(_1ab&&_1a7.queue.length>0)){
var from=(_1a6==="..")?OpenAjax.gadgets.rpc.RPC_ID:"..";
_19d(_1a6,OpenAjax.gadgets.rpc.ACK,from,{ackAlone:_1aa});
}
};
function _19c(_1af,_1b0){
var _1b1=_189[_1af];
try{
var _1b2=false;
_1b2="document" in _1b0;
if(!_1b2){
return false;
}
_1b2=typeof _1b0["document"]=="object";
if(!_1b2){
return false;
}
var loc=_1b0.location.href;
if(loc==="about:blank"){
return false;
}
}
catch(ex){
return false;
}
_1b1.receiveWindow=_1b0;
function _1b3(){
_1a5(_1af);
};
if(typeof _1b0.attachEvent==="undefined"){
_1b0.onresize=_1b3;
}else{
_1b0.attachEvent("onresize",_1b3);
}
if(_1af===".."){
_18c(_1b1.frame,_1b1.relayUri,_196(_1af),_1af);
}else{
_1a5(_1af);
}
return true;
};
return {getCode:function(){
return "rmr";
},isParentVerifiable:function(){
return true;
},init:function(_1b4,_1b5){
_18a=_1b4;
_18b=_1b5;
return true;
},setup:function(_1b6,_1b7){
try{
_191(_1b6);
}
catch(e){
OpenAjax.gadgets.warn("Caught exception setting up RMR: "+e);
return false;
}
return true;
},call:function(_1b8,from,rpc){
return _19d(_1b8,rpc.s,from,rpc);
}};
}();
}
OpenAjax.gadgets.rpctx=OpenAjax.gadgets.rpctx||{};
if(!OpenAjax.gadgets.rpctx.wpm){
OpenAjax.gadgets.rpctx.wpm=function(){
var _1b9,_1ba;
var _1bb;
var _1bc=false;
var _1bd=false;
function _1be(){
var hit=false;
function _1bf(_1c0){
if(_1c0.data=="postmessage.test"){
hit=true;
if(typeof _1c0.origin==="undefined"){
_1bd=true;
}
}
};
OpenAjax.gadgets.util.attachBrowserEvent(window,"message",_1bf,false);
window.postMessage("postmessage.test","*");
if(hit){
_1bc=true;
}
OpenAjax.gadgets.util.removeBrowserEvent(window,"message",_1bf,false);
};
function _1c1(_1c2){
var rpc=OpenAjax.gadgets.json.parse(_1c2.data);
if(!rpc||!rpc.f){
return;
}
var _1c3=OpenAjax.gadgets.rpc.getRelayUrl(rpc.f)||OpenAjax.gadgets.util.getUrlParameters()["parent"];
var _1c4=OpenAjax.gadgets.rpc.getOrigin(_1c3);
if(!_1bd?_1c2.origin!==_1c4:_1c2.domain!==/^.+:\/\/([^:]+).*/.exec(_1c4)[1]){
return;
}
_1b9(rpc);
};
return {getCode:function(){
return "wpm";
},isParentVerifiable:function(){
return true;
},init:function(_1c5,_1c6){
_1b9=_1c5;
_1ba=_1c6;
_1be();
if(!_1bc){
_1bb=function(win,msg,_1c7){
win.postMessage(msg,_1c7);
};
}else{
_1bb=function(win,msg,_1c8){
window.setTimeout(function(){
win.postMessage(msg,_1c8);
},0);
};
}
OpenAjax.gadgets.util.attachBrowserEvent(window,"message",_1c1,false);
_1ba("..",true);
return true;
},setup:function(_1c9,_1ca,_1cb){
if(_1c9===".."){
if(_1cb){
OpenAjax.gadgets.rpc._createRelayIframe(_1ca);
}else{
OpenAjax.gadgets.rpc.call(_1c9,OpenAjax.gadgets.rpc.ACK);
}
}
return true;
},call:function(_1cc,from,rpc){
var _1cd=OpenAjax.gadgets.rpc._getTargetWin(_1cc);
var _1ce=OpenAjax.gadgets.rpc.getRelayUrl(_1cc)||OpenAjax.gadgets.util.getUrlParameters()["parent"];
var _1cf=OpenAjax.gadgets.rpc.getOrigin(_1ce);
if(_1cf){
_1bb(_1cd,OpenAjax.gadgets.json.stringify(rpc),_1cf);
}else{
OpenAjax.gadgets.error("No relay set (used as window.postMessage targetOrigin)"+", cannot send cross-domain message");
}
return true;
},relayOnload:function(_1d0,data){
_1ba(_1d0,true);
}};
}();
}
if(!OpenAjax.gadgets.rpc){
OpenAjax.gadgets.rpc=function(){
var _1d1="__cb";
var _1d2="";
var ACK="__ack";
var _1d3=500;
var _1d4=10;
var _1d5={};
var _1d6={};
var _1d7={};
var _1d8={};
var _1d9=0;
var _1da={};
var _1db={};
var _1dc={};
var _1dd={};
var _1de={};
var _1df={};
var _1e0=(window.top!==window.self);
var _1e1=window.name;
var _1e2=function(){
};
var _1e3=0;
var _1e4=1;
var _1e5=2;
var _1e6=(function(){
function _1e7(name){
return function(){
OpenAjax.gadgets.log("gadgets.rpc."+name+"("+OpenAjax.gadgets.json.stringify(Array.prototype.slice.call(arguments))+"): call ignored. [caller: "+document.location+", isChild: "+_1e0+"]");
};
};
return {getCode:function(){
return "noop";
},isParentVerifiable:function(){
return true;
},init:_1e7("init"),setup:_1e7("setup"),call:_1e7("call")};
})();
if(OpenAjax.gadgets.util){
_1dd=OpenAjax.gadgets.util.getUrlParameters();
}
function _1e8(){
return typeof window.postMessage==="function"?OpenAjax.gadgets.rpctx.wpm:typeof window.postMessage==="object"?OpenAjax.gadgets.rpctx.wpm:navigator.userAgent.indexOf("WebKit")>0?OpenAjax.gadgets.rpctx.rmr:navigator.product==="Gecko"?OpenAjax.gadgets.rpctx.frameElement:OpenAjax.gadgets.rpctx.ifpc;
};
function _1e9(_1ea,_1eb){
var tx=_1ec;
if(!_1eb){
tx=_1e6;
}
_1de[_1ea]=tx;
var _1ed=_1df[_1ea]||[];
for(var i=0;i<_1ed.length;++i){
var rpc=_1ed[i];
rpc.t=_1ee(_1ea);
tx.call(_1ea,rpc.f,rpc);
}
_1df[_1ea]=[];
};
var _1ef=false,_1f0=false;
function _1f1(){
if(_1f0){
return;
}
function _1f2(){
_1ef=true;
};
OpenAjax.gadgets.util.attachBrowserEvent(window,"unload",_1f2,false);
_1f0=true;
};
function _1f3(_1f4,_1f5,_1f6,data,_1f7){
if(!_1d8[_1f5]||_1d8[_1f5]!==_1f6){
OpenAjax.gadgets.error("Invalid auth token. "+_1d8[_1f5]+" vs "+_1f6);
_1e2(_1f5,_1e5);
}
_1f7.onunload=function(){
if(_1db[_1f5]&&!_1ef){
_1e2(_1f5,_1e4);
OpenAjax.gadgets.rpc.removeReceiver(_1f5);
}
//TODO: This needs to be submitted to the official OAH defect DB (IE memory Leak)
//PMR #62951,999,649
_1f7.onunload = null;
//******************
};
_1f1();
data=OpenAjax.gadgets.json.parse(decodeURIComponent(data));
_1ec.relayOnload(_1f5,data);
};
function _1f8(rpc){
if(rpc&&typeof rpc.s==="string"&&typeof rpc.f==="string"&&rpc.a instanceof Array){
if(_1d8[rpc.f]){
if(_1d8[rpc.f]!==rpc.t){
OpenAjax.gadgets.error("Invalid auth token. "+_1d8[rpc.f]+" vs "+rpc.t);
_1e2(rpc.f,_1e5);
}
}
if(rpc.s===ACK){
window.setTimeout(function(){
_1e9(rpc.f,true);
},0);
return;
}
if(rpc.c){
rpc.callback=function(_1f9){
OpenAjax.gadgets.rpc.call(rpc.f,_1d1,null,rpc.c,_1f9);
};
}
var _1fa=(_1d5[rpc.s]||_1d5[_1d2]).apply(rpc,rpc.a);
if(rpc.c&&typeof _1fa!=="undefined"){
OpenAjax.gadgets.rpc.call(rpc.f,_1d1,null,rpc.c,_1fa);
}
}
};
function _1fb(url){
if(!url){
return "";
}
url=url.toLowerCase();
if(url.indexOf("//")==0){
url=window.location.protocol+url;
}
if(url.indexOf("://")==-1){
url=window.location.protocol+"//"+url;
}
var host=url.substring(url.indexOf("://")+3);
var _1fc=host.indexOf("/");
if(_1fc!=-1){
host=host.substring(0,_1fc);
}
var _1fd=url.substring(0,url.indexOf("://"));
var _1fe="";
var _1ff=host.indexOf(":");
if(_1ff!=-1){
var port=host.substring(_1ff+1);
host=host.substring(0,_1ff);
if((_1fd==="http"&&port!=="80")||(_1fd==="https"&&port!=="443")){
_1fe=":"+port;
}
}
return _1fd+"://"+host+_1fe;
};
function _200(id){
if(typeof id==="undefined"||id===".."){
return window.parent;
}
id=String(id);
var _201=window.frames[id];
if(_201){
return _201;
}
_201=document.getElementById(id);
if(_201&&_201.contentWindow){
return _201.contentWindow;
}
return null;
};
var _1ec=_1e8();
_1d5[_1d2]=function(){
OpenAjax.gadgets.warn("Unknown RPC service: "+this.s);
};
_1d5[_1d1]=function(_202,_203){
var _204=_1da[_202];
if(_204){
delete _1da[_202];
_204(_203);
}
};
function _205(_206,_207,_208){
if(_1db[_206]===true){
return;
}
if(typeof _1db[_206]==="undefined"){
_1db[_206]=0;
}
var _209=document.getElementById(_206);
if(_206===".."||_209!=null){
if(_1ec.setup(_206,_207,_208)===true){
_1db[_206]=true;
return;
}
}
if(_1db[_206]!==true&&_1db[_206]++<_1d4){
window.setTimeout(function(){
_205(_206,_207,_208);
},_1d3);
}else{
_1de[_206]=_1e6;
_1db[_206]=true;
}
};
function _20a(_20b,rpc){
if(typeof _1dc[_20b]==="undefined"){
_1dc[_20b]=false;
var _20c=OpenAjax.gadgets.rpc.getRelayUrl(_20b);
if(_1fb(_20c)!==_1fb(window.location.href)){
return false;
}
var _20d=_200(_20b);
try{
_1dc[_20b]=_20d.OpenAjax.gadgets.rpc.receiveSameDomain;
}
catch(e){
OpenAjax.gadgets.error("Same domain call failed: parent= incorrectly set.");
}
}
if(typeof _1dc[_20b]==="function"){
_1dc[_20b](rpc);
return true;
}
return false;
};
function _20e(_20f,url,_210){
if(!/http(s)?:\/\/.+/.test(url)){
if(url.indexOf("//")==0){
url=window.location.protocol+url;
}else{
if(url.charAt(0)=="/"){
url=window.location.protocol+"//"+window.location.host+url;
}else{
if(url.indexOf("://")==-1){
url=window.location.protocol+"//"+url;
}
}
}
}
_1d6[_20f]=url;
_1d7[_20f]=!!_210;
};
function _1ee(_211){
return _1d8[_211];
};
function _212(_213,_214,_215){
_214=_214||"";
_1d8[_213]=String(_214);
_205(_213,_214,_215);
};
function _216(_217,_218){
function init(_219){
var _21a=_219?_219.rpc:{};
var _21b=_21a.parentRelayUrl;
if(_21b.substring(0,7)!=="http://"&&_21b.substring(0,8)!=="https://"&&_21b.substring(0,2)!=="//"){
if(typeof _1dd.parent==="string"&&_1dd.parent!==""){
if(_21b.substring(0,1)!=="/"){
var _21c=_1dd.parent.lastIndexOf("/");
_21b=_1dd.parent.substring(0,_21c+1)+_21b;
}else{
_21b=_1fb(_1dd.parent)+_21b;
}
}
}
var _21d=!!_21a.useLegacyProtocol;
_20e("..",_21b,_21d);
if(_21d){
_1ec=OpenAjax.gadgets.rpctx.ifpc;
_1ec.init(_1f8,_1e9);
}
var _21e=_218||_1dd.forcesecure||false;
_212("..",_217,_21e);
};
var _21f={parentRelayUrl:OpenAjax.gadgets.config.NonEmptyStringValidator};
OpenAjax.gadgets.config.register("rpc",_21f,init);
};
function _220(_221,_222,_223){
var _224=_223||_1dd.forcesecure||false;
var _225=_222||_1dd.parent;
if(_225){
_20e("..",_225);
_212("..",_221,_224);
}
};
function _226(_227,_228,_229,_22a){
if(!OpenAjax.gadgets.util){
return;
}
var _22b=document.getElementById(_227);
if(!_22b){
throw new Error("Cannot set up gadgets.rpc receiver with ID: "+_227+", element not found.");
}
var _22c=_228||_22b.src;
_20e(_227,_22c);
var _22d=OpenAjax.gadgets.util.getUrlParameters(_22b.src);
var _22e=_229||_22d.rpctoken;
var _22f=_22a||_22d.forcesecure;
_212(_227,_22e,_22f);
};
function _230(_231,_232,_233,_234){
if(_231===".."){
var _235=_233||_1dd.rpctoken||_1dd.ifpctok||"";
if(window["__isgadget"]===true){
_216(_235,_234);
}else{
_220(_235,_232,_234);
}
}else{
_226(_231,_232,_233,_234);
}
};
return {config:function(_236){
if(typeof _236.securityCallback==="function"){
_1e2=_236.securityCallback;
}
},register:function(_237,_238){
if(_237===_1d1||_237===ACK){
throw new Error("Cannot overwrite callback/ack service");
}
if(_237===_1d2){
throw new Error("Cannot overwrite default service:"+" use registerDefault");
}
_1d5[_237]=_238;
},unregister:function(_239){
if(_239===_1d1||_239===ACK){
throw new Error("Cannot delete callback/ack service");
}
if(_239===_1d2){
throw new Error("Cannot delete default service:"+" use unregisterDefault");
}
delete _1d5[_239];
},registerDefault:function(_23a){
_1d5[_1d2]=_23a;
},unregisterDefault:function(){
delete _1d5[_1d2];
},forceParentVerifiable:function(){
if(!_1ec.isParentVerifiable()){
_1ec=OpenAjax.gadgets.rpctx.ifpc;
}
},call:function(_23b,_23c,_23d,_23e){
_23b=_23b||"..";
var from="..";
if(_23b===".."){
from=_1e1;
}
++_1d9;
if(_23d){
_1da[_1d9]=_23d;
}
var rpc={s:_23c,f:from,c:_23d?_1d9:0,a:Array.prototype.slice.call(arguments,3),t:_1d8[_23b],l:_1d7[_23b]};
if(_23b!==".."&&!document.getElementById(_23b)){
OpenAjax.gadgets.log("WARNING: attempted send to nonexistent frame: "+_23b);
return;
}
if(_20a(_23b,rpc)){
return;
}
var _23f=_1de[_23b];
if(!_23f){
if(!_1df[_23b]){
_1df[_23b]=[rpc];
}else{
_1df[_23b].push(rpc);
}
return;
}
if(_1d7[_23b]){
_23f=OpenAjax.gadgets.rpctx.ifpc;
}
if(_23f.call(_23b,from,rpc)===false){
_1de[_23b]=_1e6;
_1ec.call(_23b,from,rpc);
}
},getRelayUrl:function(_240){
var url=_1d6[_240];
if(url&&url.substring(0,1)==="/"){
if(url.substring(1,2)==="/"){
url=document.location.protocol+url;
}else{
url=document.location.protocol+"//"+document.location.host+url;
}
}
return url;
},setRelayUrl:_20e,setAuthToken:_212,setupReceiver:_230,getAuthToken:_1ee,removeReceiver:function(_241){
delete _1d6[_241];
delete _1d7[_241];
delete _1d8[_241];
delete _1db[_241];
delete _1dc[_241];
delete _1de[_241];
},getRelayChannel:function(){
return _1ec.getCode();
},receive:function(_242,_243){
if(_242.length>4){
_1ec._receiveMessage(_242,_1f8);
}else{
_1f3.apply(null,_242.concat(_243));
}
},receiveSameDomain:function(rpc){
rpc.a=Array.prototype.slice.call(rpc.a);
window.setTimeout(function(){
_1f8(rpc);
},0);
},getOrigin:_1fb,getReceiverOrigin:function(_244){
var _245=_1de[_244];
if(!_245){
return null;
}
if(!_245.isParentVerifiable(_244)){
return null;
}
var _246=OpenAjax.gadgets.rpc.getRelayUrl(_244)||OpenAjax.gadgets.util.getUrlParameters().parent;
return OpenAjax.gadgets.rpc.getOrigin(_246);
},init:function(){
if(_1ec.init(_1f8,_1e9)===false){
_1ec=_1e6;
}
if(_1e0){
_230("..");
}
},_getTargetWin:_200,_createRelayIframe:function(_247,data){
var _248=OpenAjax.gadgets.rpc.getRelayUrl("..");
if(!_248){
return;
}
var src=_248+"#..&"+_1e1+"&"+_247+"&"+encodeURIComponent(OpenAjax.gadgets.json.stringify(data));
var _249=document.createElement("iframe");
_249.style.border=_249.style.width=_249.style.height="0px";
_249.style.visibility="hidden";
_249.style.position="absolute";
function _24a(){
document.body.appendChild(_249);
_249.src="javascript:\"<html></html>\"";
_249.src=src;
};
if(document.body){
_24a();
}else{
OpenAjax.gadgets.util.registerOnLoadHandler(function(){
_24a();
});
}
return _249;
},ACK:ACK,RPC_ID:_1e1,SEC_ERROR_LOAD_TIMEOUT:_1e3,SEC_ERROR_FRAME_PHISH:_1e4,SEC_ERROR_FORGED_MSG:_1e5};
}();
OpenAjax.gadgets.rpc.init();
}var stproxy = {
 customLang:"en",
 i18nStrings:/* Copyright IBM Corp. 2014  All Rights Reserved.                    */
({"1":"Chat is temporarily unavailable.","avRestartPageTryAgain":"Restart your browser and try again.","2":"Please enter a valid user name and password.","3":"Service is currently unavailable.","4":"Operation could not be performed.","5":"Operation could not be performed.","dockTitle":"Chat","errorGroupAdderNoName":"Please input a name for the new group.","avConnectFailRefreshMainPage":"Calls through Computer phone disrupted due to connection failure. Please refresh the page to start using the call options","avMsgTURNConnectFailThruProxy":"Unable to complete the call. Ask your administrator to verify that the Sametime TURN Server is available.","6":"Adding subgroups to a public group is not allowed.","7":"Operation could not be performed.","8":"Search is currently unavailable.","9":"Chat service is currently unavailable.","10":"This group already exists in your contact list.","11":"Please login to Chat.","12":"Please enter a valid user name and password.","13":"Chat policy services are currently unavailable, Please try again.","wpWebAppication":"web application","14":"Operation could not be performed.","vvPrefNumSecsErrorMsg":"Value must be an Integer between 1 and 9,999 (1 - 9999)","15":"Guest log in is not allowed, please use a valid user name and password.","wpPluginInstallNow":"Install Now","resumeCall":"Resume Call","avMsg80000224_1":"Conference call service is currently not available. Wait for the service to become available and try again. Contact your administrator if problem persists.","wpMainAppication":"main application","avMsg80000224_2":"The call was not completed due to a dialing error.","meetingJoin":"Join Meeting","errorSessionTitle":"Attention","avMsg80000224_3":"Refresh the page. If you are still having problems, contact your administrator.","unMutePartLbl":"UnMute Participant","loginLogIn":"Log In","openChat":"Open Chat","statusBlankCustomMessage":"Enter a status message.","iContactAdderNameLabel":"Name","fileTransferIncomingDownloadClick":"Click to download ${0}","iContactAdderGroupChooserPrompt":"Select a group below or create a new group.","fileTransferFileSizeLabel":"FileSize: ${0}KB","adjVolumeMic":"Adjust Microphone Volume","errorClose":"Close","avMsgTLSAuthFailCNNOTFound":"The conference call plug-in is not available due to a failure in the secure connection. Ask your administrator to verify that the server's host name is available in the security certificate.","avMsgGeneralException":"Unable to complete the call due to an internal error.","contactAdderAddToGroup":"Add to group:","nwayChatInviteDeclineButton":"Decline","meetingOptions":"Meeting room options","gearAV":"Actions and Preferences","meetingQuickfindTitle":"Search for people to invite to the meeting room.","dockStatusAway":"I am Away","statusIsConnecting":"Is connecting...","callConfirmInMeetingMessage":"${0} is in a Meeting and may not be available for a call. Would you like to call anyway?","errorRemovingUser":"Unable to remove contact, Please try again.","chatWindowConfirmCloseText":"Closing the chat window closes the window for all active chats. Continue?","avMsgPluginUpdateFailedErrDownload":"If the problem persists, contact your administrator.","callInformation":"Call Information","fileTransferLabelProgress":"Progress:","moreInformation":"More Information","fileTransferIncoming":"${0} has sent file ${1} (${2}KB)","avMsgCalleInCallTip":"Selected contact is on another call","contactList":"Contact List","title2wayAudio":"Call with ${0}","error":"Error","wpwaitFileDownloadSafari":"Wait for the Sametime WebPlayer plug-in file to download.","chatWith":"Chat with ${0}","meetingStartButton":"Invite","wpUpgradePromptCancelContinue":"Click Cancel to continue using the web client without the conference call feature.","sidebarAddContactTooltip":"Add New Contact...","meetingCancelButton":"Cancel","statusMeetingMobile":"In a Meeting","vvPrefNumSecs":"Number of seconds before invite times out:","wpUpdateError":"Failed to update WebPlayer plugin!","titleNwayAudio":"Conference Call","errorSavePreference":"An error occurred while saving the preferences window, Please try again.","iAdderNewGroupLabel":"New group","chatAcceptGroupChat":"Accept","avMsgDeclineAnswerHold":"Decline call | Answer call and hold the current call","iGroupChatInvitationTitle":"Group Chat Invitation","errorApplicationDown":"Chat is temporarily unavailable.","errorAVInvitation":"Unable to send audio/video invite, Please try again.","wpChromeDragDrop":"When download completes, drag and drop the file into the Chrome Web Extensions page.","errorExternalImage":"Image from external source cannot be displayed","dialogContact":"Contact","quickFindNoResults":"No results","externalUsersDefaultCommunity":"Sametime/Other","chatPartnerTyping":"${0} is typing a message...","fileShareSendError":"Unable to share file.","adjhwOptionNoCameraDevice":"No Camera Device Defined","fileTransferSendFile":"Send File...","emoticonLabelTongue":"tongue","wpApplicationShareFeature":"Application Sharing","chatTranscriptLabel":"Chat Transcript","mainMenuNewContact":"New Contact...","modNameNA":"Name Not Found","groupChatInvite":"Invite","emoticonLabelCrying":"crying","dialogCancel":"Cancel","avMsgTURNSvrFailure":"The conference call plug-in failed to initialize. Ask your administrator to verify that the Sametime TURN Server is available.","statusOffline":"I am offline","meetingInvitee":"Invitees:","imainMenuGroupChatInvite":"Invite to Chat","avMsgTLSAuthFailNotFoundInTrustStore":"The conference call plug-in is not available due to a failure in the secure connection. Ask your administrator to verify that the root or intermediate security certificate is available in the trust store.","preferencesChatWindowUsernames":"Display user names in tabbed chat","loginUserName":"User name:","dockAutomaticallyConnect":"Automatically sign me in","renamerOk":"OK","chatConfirmOfflineMessage":"${0} is offline. ","statusNwayAudioInvite":"You are invited to a audio conference","iPopupRemoveUserContent":"Remove the following contact from your contact list?","preferencesNotificationsLabel":"Select how to be notified about new chats.","avPluginDownload":"Download","linkEditorCancel":"Cancel","smartCloudNavagatingCloseMessage":"You have logged out of Chat.","startVideo":"Start Video","wptitlewebplayerPluginInUse":"The system has detected that an old version of the Sametime Webplayer Plug-in is currently in use.","preferencesContactListDisplayOffline":"Display offline contacts","mainMenuHideOfflineUsers":"Hide Offline Users","loginLoginAsGuest":"Log in as guest","iPopupRemoveUserTitle":"Remove contact","fileTransferSendTitleComplete":"File Transfer - Complete","contactAdderWarningTitle":"Contact List Warning","holdCall":"Hold Call","escInviteTitle":"Start My Video","adjVolForPartLbl":"Adjust Volume for this Participant","dockSignInTooltip":"Click to sign in","chats":"Chats","iGroupErrorRemovePrompt":"Removing a group removes all group contacts and subgroups. Continue removing the following group?","chatMenuAbout":"About","wpRestartWindowFF":"After upgrade completes, restart your browser and re-enter chat window.","chatConfirmAwayMessage":"${0} is Away and may not be available for chat. Would you like to send this message anyway?","fileTransferCancelLabel":"Status: File transfer cancelled.","iContactAdderCommunityLabel":"Community","avStatsUnavailable":"Statistics are currently unavailable.","chatConfirmNo":"No","contextMenuViewBusinessCard":"Business Card","adjVolumeSliderLow":"Low","webclientExitingSametimePrompt":"Exiting Chat will log you out. Do you want to continue?","iGroupErrorEmail":"The email addresses of the contacts in the selected group could not be retrieved.","preferencesChatWindowEffectMessage":"Changes will take effect the next time you open the chat window.","showMyPreview":"Show My Video Preview","mainMenuButtonTooltip":"Actions and Preferences","businessCardAddContact":"Add to Contact List...","avStatsColHeaderVideo":"Video","avHoldCurrCall":"Hold the current call.","actionBarAnnouncementTooltip":"Send Announcement to Selected Contacts...","emoticonLabelAngel":"angel","editNicknameLabel":"New nickname:","emoticonLabelOops":"oops","quickFindSearchText":"Search directory for ${0}","adjhwTitle":"Adjust Hardware","errorChatInvite":"Unable to send chat invite, Please try again.","dialogOk":"OK","warning":"Warning","videoCallLbl":"Video Call","applicationTitle":"IBM Connections Chat","businessCardConnectionsProfileTooltip":"Profile","adjVolumeSliderSpkInc":"Increase Speaker Volume","preferencesChatWindowPhotos":"Display photos in tabbed chat","wpAudioConferencingFeature":"Audio Conferencing","chatTextAreaTitle":"Type your text","contactAdderAddInternal":"Add a new contact","adjustAudioHw":"Adjust Audio Hardware","wpRunFileSafari":"When download completes, double-click on the downloaded file to run the installer and then follow installer instructions.","avMsgPropPassedInitRegFail":"Unable to start video.","statusIsOnMute":"Is On Mute","chatTextColorButtonLabel":"Select Text Color...","avNetworkDisconnectErrorAV":"The conference call was stopped due to a network connection problem or a change in network. Click OK to close the call window","groupAdderAddAsSubgroup":"Add as a subgroup of the selected group","wpAVConferencingFeature":"Audio Video Conferencing","chatLinkButtonLabel":"Insert Link","wpSTWebPlayerUpgradeButtonLabel":"Update Now","avStatsRowHeaderRoundTripTime":"Round-Trip Time:","avStartChat":"Start Chat","renameButtonText":"Rename","fileTransferSendTitleSending":"File Transfer - Sending...","preferencesChatWindow":"Chat Window","iPhoneLoginAlt":"IBM Connections Chat 8.5","chatConfirmInMeetingMessage":"${0} is in a Meeting and may not be available for chat. Would you like to send this message anyway?","errorParentAlreadyContainsGroup":"Parent already contains a group with that name !","wpStrRestartWebClient":"You will be required to restart the web client to start using the ${0} feature.","wpdownloadingWebPlayer":"Downloading Sametime WebPlayer...","avStatsResume":"Resume","contactAdderSelectPerson":"Select the person to add:","fileTransferLabelSendFile":"Send File:","avCloseAVInitWndWarning":"Closing or refreshing the current browser tab/window will end all the active AV calls. Do you want to refresh or close the window ?","iActiveChatGroupChatLabel":"Group chat: ","groupAdderSelectGroup":"Select the group to add:","wpinstallingWebPlayer":"Install Webplayer Plug-in","hideMyPreview":"Hide My Video Preview","statusCallOnHold":"Call on hold...","chatCreateLinkButtonLabel":"Create Link","iContactAdderNoGroupSelectedLabel":"[No group selected]","chatDeclineGroupChat":"Decline","sametimeLogoAlt":"IBM Connections Chat","businessCardRemoveContact":"Remove from Contact List","yesButtonText":"Yes","chatInviteOthers":"Invite Others...","contextMenuAddToContacts":"Add to Contact List...","wpstringLoading":"Loading...","statusAwayMobile":"Away","launchClient":"Launch Chat","vvPrefNotifyCalls":"Select how to be notified about incoming calls","callConfirmAwayMessage":"${0} is Away and may not be available for call. Would you like to call anyway?","errorPrivacyList":"An error occurred while retrieving the privacy list.","chatParticipantListTitle":"Participants - ${0}","emoticonLabelCool":"cool","chatEmoticonButtonLabel":"Insert Emoticon...","adjhwSelectSpk":"Select Speaker","meetingPopupTitle":"Information","fileTransferWaitingLabel":"Status: Waiting for ${0} to accept this file...","enableChatCloseButton":"Close","closeCallWin":"Close Window","chatwithPart":"Chat with Participants","errorOpenChat":"An error occurred while opening the chat window, Please try again.","aboutBoxTitle":"About","aboutBoxText1":"Licensed Materials","meetingRoomsNoRoomsAvailable":"No Rooms Available","aboutBoxText2":"Property of IBM Connections Chat ${0} &copy;","avMsgCameraDeviceBusy":"Could not connect to camera. Check that your camera is plugged in and not in use by another application or session, and try again.","aboutBoxText3":"Property of IBM Connections Chat L-MCOS-96LPYH &copy; Copyright. IBM Corporation 1998, 2014. IBM, the IBM Logo and Lotus are trademarks of IBM Corporation in the United States, other countries or both. AOL and AIM are registered trademarks and Instant Messenger is a trademark of America Online, Inc. This product is authorized to work with the AOL&reg; Instant Messenger&trade; service, has been certified to meet AOL's standards for operation as part of the AIM&reg; Certified Partner Program, and is authorized under U.S. Pat. Nos. 5,724,508, 5,774,670, 6,336,133, 6,339,784, 6,496,851, 6,539,421.","iBizCardErrorTitle":"Contact action unavailable","avNetworkDisconnectError":"The conference call did not connect due to a network connection problem or a change in network. Check your network connection and then refresh the page.","reInvitePartLbl":"Reinvite Participant","iContactAdderPrompt":"Search for a person by name or enter the person's email address to add an external contact.","adderCancel":"Cancel","callDeclinedMsg":"${0} is either not available or has declined the call.","aboutBoxBuildId":"(${0})","avMsgMissingConfigForToken":"Unable to complete the call. Ask your administrator to check the expiration value and the secretKeyPath value for the TURN authentication token.","chatMenuFile":"File","addContactErrorGroup":"This contact already exists in this group.","wpSTWebPlayerUpgrade":"Install the latest Sametime Webplayer Plug-in so that you can use screen capture feature. The upgrade might take a few minutes.","mainMenuSametimeGroupChat":"Group Chat","offlineMessageServiceAnnoucement":"1 new message was received while you were offline","iGroupAdderAddAsSubgroupCheckbox":"Add as a subgroup to an existing group","wpNoteStr":"Note: ","offlineMessageServiceStatus":"Offline Messages","wpContentUpgradeDialogOKInst":"Click Update Now to proceed with the update.","closeWinLeavCall":"Close Window (Leave Call)","meetingRoomsLastAccessed":"Last accessed: ${0}","loginLicenseText":"Licensed Materials - Property of IBM &copy; Copyright. IBM Corporation 1998, 2014. IBM, the IBM Logo and Lotus are trademarks of IBM Corporation in the United States, other countries or both.","iContactAdderNewGroupPrompt":"Create a new group.","fileShareIncomingDownloadTitle":"Click here to download this file","externalUsersPopupContent":"That action cannot be performed on an external contact","avStatsRowHeaderCodec":"Codec:","leaveMeetingDialogTitle":"Leave Meeting","avMsgDialBandwidthNoVideo":"You cannot use video at this time, due to the high volume of video calls. You will be joined to the call using your computer audio instead.","collectorNoResults":"No results","mainMenuHelp":"Help","avMsgInvalidRegistrarPort1":"Conference calling capabilities failed to engage. Check with your administrator.","avMsgInvalidRegistrarPort2":"The SIP registration failed because the server configuration did not complete. Contact your administrator.","fileTransferLabelStatus":"Status:","businessCardEditNickname":"Edit Nickname","fileTransferLabelSendingFile":"Sending File:","avMsgDialBandwidthLimitOther":"Other participants cannot join the call at this time, due to a high volume of calls. Tell them to wait a few minutes and try again.","iGroupAdderErrorBlankName":"Enter a name for the new group.","iContactAdderErrorNoGroup":"Create a new group for the contact.","more":"More","errorClusterLoginTitle":"Attention","leaveMeetingDialogLeaveButtonText":"Close Chat","avInviteAcceptButton":"Accept","avRefreshPageTryAgain1":"Re-login or Refresh the page to try again.","iGroupInfoActionEmail":"Send email","pauseMyVideo":"Pause My Video","wpcloseTheInstallWindow":"Close this window and return to your chat window","avMsgICEAllocationTimeout":"Unable to complete the call. Ask your administrator to check the ICE allocation time-out setting on the Sametime TURN Server.","dialogDone":"Done","errorContactAdder":"An error occurred while adding the contact, Please try again.","nwayChatInviteTopic":"Topic: ${0}","AdministratorMessageTitle":"Message from the Chat Administrator","statusIsWaiting":"Waiting for recipient to accept your invite...","statusAvailable":"I am Available","chatConfirmDndMessage":"${0} is not allowing correspondence at this time.","wpInstallInProgress":"Sametime Webplayer Plug-in installation in progress","iBMLogoAlt":"IBM","businessCardChatNow":"Chat","cancelButtonText":"Cancel","groupAdderNewGroupName":"New group:","avStatsRowHeaderBitRate":"Bit Rate:","iAdderGroupLabel":"Group","chatMeetingReceive":"${0} has sent you a meeting invitation","contextMenuRenameUser":"Edit Nickname...","wptitleInstallWebPlayer":"Install Sametime WebPlayer","mainMenuGroupChatInvite":"Invite to Chat...","groupChatDefaultTopic":"Chat with ${0}","avStatsRowHeaderPacketsReceived":"Packets Received:","fileSharePermissionErrorTitle":"Unable to grant access","contactListEmpty":"No Contacts","addPublicGroupConfirmation":"Public group added: ${0}","showMenu":"Show Menu","preferencesContactList":"Contact List","title2wayAudioInvite":"Incoming Call","avUnavlbl":"Call service is not available","wpwebPlayerInstallationSuccessFirefox":"Plug-in installed successfully.","chatstStrikethroughButtonLabel":"Strikethrough","renamerCancel":"Cancel","adjhwSelectMic":"Select Microphone","statusConnecting":"Connecting","dialogNext":"Next","wpRestartWindowChromeSafariAV":"After installation completes, restart your browser and re-enter web client window","loginSaveOptionsTitle":"save options","fileTransferProgressCancelLabel":"Cancel Transfer","groupSelectorOk":"OK","dockViewChatContactsTooltip":"View chat contacts","saveButtonText":"Save","avMsgHttpConnectTimeout1":"The call could not be connected.","emoticonLabelCoffee":"coffee","avMsgHttpConnectTimeout2":"Computer phone did not initialize. The HTTP Proxy Server was unavailable to HTTP Connect, or the attempt to connect timed out.","enableChatText1":"Your browser seems to be blocking third-party cookies, which prevents the use of Chat.","enableChatText2":"When you close this window, Chat will be enabled for this session. To avoid seeing this message in the future, enable third-party cookies in your browser.","avMsgFailedToWriteINI":"The conference call plug-in did not download. Download it again.","wpRestartWindowChromeSafari1":"Close this window and refresh your chat window if it was open.","emoticonLabelWomp":"womp","errorMeetingStart":"Unable to start meeting, Please try again.","videoCtrlLbl":"Video Controls","wpStartDownloadSafariChrome":"Upgrade your Sametime WebPlayer plug-in to use screen capture feature. Click OK to start the download.","contactAdderError1":"You have exceeded the following maximum number of contacts allowed: ${0}.","contactAdderError2":"No more contacts can be added. To view and reduce the size of the contact list, click OK.","noButtonText":"No","statusMeeting":"In a Meeting","unmuteAll":"Unmute All","groupSelectorTitle":"Select Group","nwayChatInviteAcceptButton":"Join the Chat","statusAlreadyInCall":"Call in progress with the selected user","contactAdderErrorTitle":"Contact List Error","contactAdderListSize":"Your contact list has the following number of contacts: ${0}.","emoticonLabelFrown":"frown","fileShareIncomingLabel":"${0} shared the following file","popopRemoveGroupTitle":"Remove Group","quickFindTitle":"Quickfind","renamerGroupContent":"New group name:","iGroupInfoTitlePublic":"Public Group","statusIsConnected":"Is Connected","iGroupInfoContactsOnline":" contacts online","avStatsRowHeaderRemoteStreamID":"Remote Stream ID:","businessCardCantChatNow":"User is unavailable for chat","chatParticipants":"Participants","quickFindSearchTextIME":"Search directory","avMsgInvalidExpirationTimeForToken":"Unable to complete the call. Ask your administrator to check the expiration value for the TURN authentication token.","callConfirmDNDMessage":"${0} is set to Do Not Disturb and may not be available for a call. Would you like to call anyway?","meetingRoom":"Specify meeting room:","preferencesNotificationsSound":"Play a sound","navagatingCloseMessage":"You have logged out of Chat.","disConPartLbl":"Disconnect Participant","wpUnableToInstall":"Unable to install Sametime WebPlayer plug-in.","chatUnableToDeliverMessage":"Unable to deliver message to ${0}","chatstBoldButtonLabel":"Bold","adjhwOptionNoDevice":"No Device Defined","avMsgSlowNWSIPRegistrationFailed":"The SIP registration failed. Contact your administrator.","errorGroupAdder":"An error occurred while adding the group, Please try again.","adjhwOptionNoSpeakerDevice":"No Speaker Device Defined","iGroupAdderErrorPublicGroupExists":"Public group has already been added to your contact list.","preferencesNotificationsFlash":"Flash the toolbar","offlineMessageServiceDisplayName":"Chat Offline Message Service","statusOnMute":"On Mute","wpUpdatedVerAvailable":"An updated version of Sametime WebPlayer plug-in is available.","preferencesNotificationsPartnerLeaves":"Notify me when my chat partner leaves the chat","callMeetingMsg":"${0} is in a Meeting and might not be available for a call.Would you like to call anyway?","fileTransferSendFolder":"Send Folder...","avStatsRowHeaderPercentagePacketsLost":"% Packets Lost:","mainMenuAbout":"About","groupAdderAddGroupName":"Enter group name","avMsgNetworkDisconnected":"The conference call plug-in did not connect due to a network connection problem or a change in network. Check your network connection and then refresh the page.","fileShareIncomingViewTitle":"Click here to view the details page for this file","awarenessCancel":"Cancel","avStatsIncoming":"Incoming","availabilityTitle":"Availability","adderAdd":"Add","iChatErrorUnavailableText":"User is unavailable at this time.","title2wayVideoInvite":"Incoming Video Call","groupChatWith":"Chat with ${0}","signOutAvConfirm1":"Signing out of chat will disconnect you from any ongoing conference calls.","signOutAvConfirm2":"To ignore new incoming chat requests, you can set your status to ${0}.","meetingCreateInstantMeeting":"Use an instant meeting room","statusAvailableMobile":"Available","privacyListRadioEverybody":"Everybody, EXCEPT those on the list can see me online","stopMyVideo":"Stop My Video","meetingRoomslastAccessedNever":"Never","avStatsOutgoing":"Outgoing","announcementTitle":"Announcement","mainMenuSametimeContacts":"Chat Contacts","iChatErrorUnavailableTitle":"Cannot chat","emoticonLabelAngry":"angry","contextMenuRemoveGroup":"Remove Group","wpSTWebPlayerInstallMessage":"Install the Sametime WebPlayer. The WebPlayer is required to use ${0} feature.","iContactAdderWarnEmptyNickname":"The nickname field was left empty. Click OK to use the default nickname or Cancel to return to the dialog.","chatstUnderlineButtonLabel":"Underline","wpSTWebPlayerDownloadFailed":"The Sametime WebPlayer Plug-in failed to download.","iBizCardErrorEmailUnavailable":"The email address for the selected user is unknown or could not be retrieved.","nwayChatInviteTitle":"Chat Invitation","wpcontentCannotInstallWebPlayer":"You cannot install the plug-in while the it is in use. Close any open applications that may be using the plug-in, and then refresh this page to proceed with the installation.","UnMutedLbl":"UnMute","iBizCardErrorRemoveTitle":"Remove contact error","avMsgTokenGenerationFailed":"Unable to complete the call due to an error while generating a token for TURN authentication.","wpcloseTheInstallWindow1":"Close this window and return to your ${0}","fileTransferSendFileLabel":"Send File: ${0}","statusOnHold":"On Hold","emoticonLabelScream":"scream","escInviteMsg":"There is a request to start video in this call session. Would you like to start video?","wpcontentPluginInUseIE":"Close any open chat window and restart Internet Explorer to install the latest version.","emoticonLabelHalf":"half","awarenessLogout":"Log Out","mainMenuSametimeChat":"Chat","quickFindTypeName":"Find a person or group","wplatestPluginDetected":"Latest Plug-in Detected","iGroupErrorRemoveTitle":"Remove group","emoticonLabelGoofy":"goofy","announcementDescription":"Search for people to add to the announcement","avStatsRowHeaderPacketsSent":"Packets Sent:","chatMenuTools":"Tools","userPhotoAlt":"Photo","wpIEInstallPluginExtMany":"After successful installation, ${0} capability will be enabled","chatConfirmYes":"Yes","privacyListSaveButton":"Save","voiceVdoPref":"Conference Call Preferences...","dockDisconnect":"Sign Out","avMsgRegistrationFailed":"Unable to initialize the conference call service due to SIP proxy registration failure. Please check your network settings.","iContactAdderErrorBlankNameAddSubgroup":"Type a new group name or deselect the check box.","avStatsErrorOpenWindow":"An error occurred while opening the stats window. Please try again.","imageView":"ImageView","changeLayout":"Change Video Layout","avMsgIncomingCall":"Incoming call from ${0}.","avMsgNoCameraDetected":"No camera detected.","chatNewMessage":"New Message","adderSearch":"Search","statusDisconnected":"Disconnected","smartCloudApplicationTitle":"Chat","announcementSend":"Send","emoticonLabelClapBlue":"clapBlue","emoticonLabelYes":"yes","avMsgSIPByeReceivedI102":"The conference call plug-in did not connect due to a network connection problem or a change in network. Check your network connection and then refresh the page.","wpwaitFileDownloadChrome":"Wait for the Sametime WebPlayer plug-in file to download. The file gets downloaded in the default download folder configured in the Chrome settings","wpContentInstallDialogCancelInst":"Click Cancel to return to remain in the chat window but without being able to use the ${0} feature.","dockStatusMeeting":"In a Meeting","moderatorIcon":"Moderator","avMsgTryRefreshChkAdm":"Try refreshing the page. If the problem persists, check with your administrator.","groupAdderAddPublicTooltip":"Public groups have predefined members; you cannot change who is a member. Your system administrator creates public groups.","iBizCardErrorPhoneUnavailable":"The telephone number for the selected user is unknown or could not be retrieved.","errorChatInvitation":"Unable to send chat invite, Please try again.","partMutedLbl":"Muted","wpFFInstallPlugin":"Follow the browser instructions in order to install the Sametime WebPlayer Plug-in.","actionBarChatTooltip":"Chat with Selected Contacts","iGroupAdderPersonalGroupRadio":"Add a new personal group","close":"Close","exitFullScreen":"Exit Full Screen","errorAnnouncement":"Unable to send announcement, Please try again.","contextMenuCall":"Call","privacyListTitle":"Privacy List","iGroupAdderPublicGroupRadio":"Search for a public group","announcementAllow":"Allow recipients to respond to the announcement","confirm":"Confirm","actionBarCallTooltip":"Call Selected Contacts","groupChatTitle":"Invite to Chat","wpcloseTheInstallWindowAV":"Close this window and return to your main application.","mainMenuMeetingInvite":"Invite to Meeting Room...","groupAdderTitle":"New Group","dialogBack":"Back","wpContentUpgradeDialogCancelInst":"Click Cancel to return to remain in the chat window but without being able to use the ${0} feature.","fileShareIncomingDownloadClick":"Download","wpFFUpgradePlugin":"Follow the browser instructions in order to upgrade the Sametime WebPlayer Plug-in.","wpFFInstallPluginExt":"You will need to restart Firefox for the installation to complete.","adjhwOptionDefaultDevice":"Use Device Defined in Operating System","errorServerDown":"Chat is temporarily unavailable.","avMessageHoldResume":"Incoming call from ${0}, Choose Accept to hold the ongoing call and switch to incoming call. Choose Decline to decline the new incoming request and continue the ongoing call","dockStatusDisturb":"Do Not Disturb","smartCloudEnableChatText1":"Your browser seems to be blocking third-party cookies, which prevents the use of Chat.","mainMenuLogout":"Log Out","loginTitleiPhone":"Log In to IBM Connections Chat","adjVolumeSliderHigh":"High","avUserBusyInCallStartChat":"${0} is busy on another call. Try to call again later or start a chat with them now.","sametimeMeetings":"IBM Connections Meetings","fileTransferExtensionError":"The file type you are trying to send is not allowed.","adjhwTitleCam":"Camera","errorRenameUser":"Unable to rename contact, Please try again.","avMsgArchiveExtrFailed":"Archive extraction failed.","fileTransferProgressCloseLabel":"Close","actionBarMeetingTooltip":"Invite Selected Contacts to Meeting Room...","loginTitle":"IBM Connections Chat 8.5","emoticonLabelLaughing":"laughing","avMsgTLSAuthFailSelfSigned":"The conference call plug-in is not available due to a failure in the secure connection. Ask your administrator to verify that the self-signed security certificate is valid.","statusIsDisconnected":"Is Disconnected","meetingNoRooms":"No meeting rooms are available. Click Manage Rooms to create a new meeting room.","wpScreenCaptureFeature":"screen capture","avMsgICEConnectivityChkFail":"Unable to complete the call. Ask your administrator to check the ICEsettings on the Sametime TURN Server.","callCannotComplete":"Unable to place call at this time.","statusDisturb":"Do Not Disturb","title2wayVideo":"Video Call with ${0}","statusMessageTooltip":"Click to edit your status message","loginCustomMessage":"Status message:","wpContentInstallDialogCancelInstAV":"Click Cancel to return to remain in the web client but without being able to use the ${0} feature.","contactListFilterButtonLabel":"Contacts","callBusyMsg":"${0} is busy on another call. Try to call again later.","preferencesTitle":"Preferences","enableChatWindowTitle":"Enable Chat","fullScreen":"Full Screen","fileShareOutgoingLabel":"You shared the following file","iContactAdderErrorExtDomain":"A community with the specified domain name could not be found. Check with your administrator to determine which communities you can connect to.","titleNwayVideo":"Video Conference","chatMenuCloseChat":"Close","groupAdderGroupNameToSearch":"Group name:","privacyListRadioOnly":"ONLY those on the list can see me online","iContactAdderExternalContactCheckbox":"Add external user by email address","businessCardLabelAddress":"Address","avMsgFileNotFound":"The conference call plug-in did not download. A file is missing on the server. Contact your administrator.","vvPrefCallWindow":"Call Window","errorHostNameTitle":"Unable to access Chat:","avMsgHttpConnectDirectConnectFail":"The direct connection to the remote host failed. Contact your administrator.","vvPrefTitle":"Conference Call Preferences","instantMeetingRoomLink":"Instant Meeting Invitation","addContactErrorPublicGroup":"Adding contacts to a public group is not allowed.","mainMenuNewGroup":"New Group...","avStatsPause":"Pause","wpRestartWindowFFAV":"After upgrade completes, restart your browser and re-enter web client.","errorBrowserNotSupported":"This web browser is not supported.","chatUserJoined":"${0} has joined the chat","chatMenuHelp":"Help","actionBarEmailTooltip":"Email Selected Contacts","avStatsOutgoingDescription":"The following table lists statistics for your local stream.","groupAdderAddPersonalTooltip":"Personal groups you create only appear on your contact list.","groupChatDescription":"Search for invitees:","emoticonLabelIdea":"idea","userInfoCloseTooltip":"Click to hide information","offlineMessageServiceNotification":"This notification is from an automated service.  Please do not reply to this message.","allContactsGroupDesc":"Use this group to view all of your Chat contacts in a single list.","emoticonLabelClock":"clock","contactAdderTitle":"New Contact","mainMenuPreferences":"Preferences...","loginRememberMe":"Remember me","errorLoginGuestNoUserName":"Please enter a user name","iContactAdderErrorExtEmail":"External users must be added with an email address. Check the format of the address entered.","statusAway":"I am Away","addContactConfirmationContactLabel":"Contact added:","avMsgTokenAuthFailWithTURN":"Unable to complete the call. Ask your administrator to check the authentication configuration of the Sametime TURN Server.","chatScreenCaptureButtonLabel":"Capture Part of your Screen to Send...","muteAll":"Mute All","wpContentUpgradeDialog":"Upgrade your Sametime WebPlayer to use the ${0} feature. The upgrade might take a few minutes.","popopRemoveUserContent":"Remove ${0}?","navagatingAwayFromPage":"Navigating away from this page will log you out of Chat. Are you sure you want to proceed?","endCallTitle":"End Call","wpUpgradePromptUpdateMessage":"Update the WebPlayer plug-in to use the conference call feature. The update might take a few minutes. After the update completes, log in to the web client again.","wpcontentPluginInUseLLPart1":"The system has detected that the old version of the Sametime Webplayer Plug-in is currently in use.","emoticonLabelStar":"star","iGroupInfoTitlePrivate":"Personal Group","emoticonLabelWink":"wink","vvPrefAutoClose":"Automatically close my call window when I end the call","errorPublicGroupAlreadyExists":"This public group already exists in your contact list.","avNetworkReconnect":"Network reconnection or a change in network has been detected.","linkEditorName":"Name","fileTransferMaxFileSizeError":"The file you are trying to send exceeds the maximum file size of ${0}KB.","modNameInPartList":"Moderator: ","popopRemoveUserTitle":"Remove Contact","businessCardTitle":"Business Card","adjhwOptionNoMicDevice":"No Microphone Device Defined","adjVolumeSliderMicDec":"Decrease Microphone Volume","emoticonLabelGrin":"grin","awarenessOk":"OK","statusDeclined":"Declined","fileTransferDeclinedLabel":"Status: ${0} has cancelled the file transfer.","wpcontentPluginInUseIEAV":"Close any open browser windows and restart Internet Explorer to install the latest version.","contactAdderWarning1":"You are approaching the following maximum number of contacts allowed: ${0}.","announcementConfirmation":"Your announcement has been sent.","contactAdderWarning2":"Please reduce the size of your contact list.","contactAdderExternalCommunity":"External Community","statusConnected":"Connected","wpContentInstallDialogOKInst":"Click Install Now to proceed with the installation","chatstItalicButtonLabel":"Italic","statusUserOffline":"User is Offline","avMsgBadInstallationFound1":"The conference plug-in failed to initialize because of missing or incomplete files.","avMsgBadInstallationFound2":"Try re-installing the plug-in by following instructions in the help.","avStatsColHeaderAudio":"Audio","linkEditorOk":"OK","dialogGroup":"Group","fileShareIncomingViewClick":"View details","contextMenuRemoveContact":"Remove Contact","avStatsTitle":"Call Performance Statistics","mainMenuShowOfflineUsers":"Show Offline Users","iContactAdderErrorBlankName":"Type a new group name.","avStatsRowHeaderUserName":"User Name:","fileTransferSendTitleCancelled":"File Transfer - Cancelled","chatParticipantCount":"(${0}) ","avStatsFieldNA":"N/A","editNicknameTooltip":"Nicknames only display on your computer.","adderSearchResults":"Search results","meetingRoomsInviteOthersButton":"Invite Others","contextMenuAddSubgroup":"New Group...","actionBarVideoTooltip":"Video Call Selected Contacts","endCallForEveryone":"End call for Everyone","aboutBoxProductTitle":"IBM Connections Chat 9","offlineMessageServiceAnnoucements":"${0} new messages were received while you were offline","groupAdderAddPersonal":"Add a new personal group","escInviteNote":"Note: Make sure your camera  is plugged in and not used by another application.","preferencesNotifications":"Notifications","popupOk":"OK","avMsgTLSHandshakeFailure1":"The conference call plug-in is not working properly.","avMsgTLSHandshakeFailure2":"TLS handshake with the SIP Proxy Registrar failed. Contact your administrator.","contactAdderAddExternal":"Add external user by email address","wpcannotInstallWebPlayer":"Cannot Install Sametime WebPlayer","wpRestartWindowChromeSafari":"After installation completes, restart your browser and re-enter chat window","avMsgAlreadyInCallTip":"You will need to end the current call before making another call.","contactAdderUserNameToSearch":"Name:","contextMenuChat":"Chat","chatSeparatorLabel":"Use the arrow keys to resize this area.","iawarenessCustomMessage":"Status Message","chatInviteToMeetingRoom":"Invite to Meeting Room...","groupAdderAddPublic":"Search for a public group","iContactAdderErrorTitle":"Add contact","contactSelectorTitle":"Select from Contact List","errorRenameGroup":"Unable to rename group, Please try again.","businessCardLabelPhone":"Telephone","statusSetCustomMessage":"Edit status message","avStatsRowHeaderFrameRate":"Frame Rate:","wpIEInstallPlugin":"If the Sametime WebPlayer plug-in does not automatically install, click on the browser warning bar to start installation. Then follow instructions.","userInfoOpenTooltip":"Click to display more information","aboutBoxBuildTitle":"Build: ${0}","contextMenuInstantMeeting":"Invite to Meeting Room...","avIncompatInstallMode1":"The WebPlayer plug-in upgrade cannot proceed due to incompatible installation modes.","avIncompatInstallMode2":"Download the plug-in installer and install again or contact your administrator.","dockCurrentStatusTooltip":"Current chat status","status2wayAudioInvite":"is calling your computer","iContactAdderEmailLabel":"Email","businessCardAnnouncement":"Send Announcement","mainMenuAnnouncement":"Send Announcement...","fileTransferSendLinkToFiles":"Send Link to Files...","chatWindowConfirmCloseTitle":"Confirm Close","searchButtonText":"Search","contextMenuAddContact":"New Contact...","emoticonLabelSmile":"smile","awarenessCustomMessage":"Status message","avAnswerCall":"Answer call","contextMenuSendAnnouncement":"Send Announcement...","privacyListOptions":"Privacy list options","actionBarRefreshTooltip":"Refresh","adjustHwLbl":"Adjust Hardware","wpcontentPluginInUseIELLPart2":"Please close any chat windows and restart Internet Explorer to proceed with the installation.","emoticonLabelLaughroll":"laughroll","hideMyVideo":"Hide My Video","dockConnectToChat":"Sign In","leaveMeetingDialogText":"Leaving the meeting will log you out of Chat and any open chats will be closed.","fileTransferSendTitle":"File Transfer","mainMenuTools":"Tools","wpMainWindow":"main window","meetingUseExistingRoom":"Use an existing meeting room","renamerContactContent":"New Nickname","showMyVideo":"Show My Video","chatGroupChatReceive":"${0} has invited you to a group chat","contactListFilterAllContacts":"All Contacts","statusDisturbMobile":"Do not Disturb","callComputerLbl":"Call Computer","iContactAdderAddFollowingContactPrompt":"Add the following person:","wpUpgradePromptUpdateNowClose":"Click Update Now to close the web client window and start the update process.","avAnswerOnly":"Answer","titleNwayAudioInvite":"Incoming Video Conference","avMsgPluginUpdateFailedFileMiss":"The conference call plug-in failed to update.","avMsgInitializing":"Initializing ...","groupAdderAddToGroup":"Add to group:","iContactAdderErrorNoContact":"Select a contact to add or start a new search.","dockStatusAvailable":"I am Available","iGroupInfoActionAnnouncement":"Send Announcement","contextMenuRemove":"Remove from Contact List","chatUserDeclined":"${0} has declined the invitation to chat","quickFindNext":"Next page","meetingManageRoomsButtonLabel":"Manage Rooms","wpcontentLatestPluginDetected":"Your computer has latest version of the Sametime Webplayer Plug-in. An upgrade is not needed at this time.","avStatsIncomingDescription":"The following table lists statistics for remote participants currently on the call.","errorServerTitle":"Attention","dockSignedOut":"I am Signed Out","chatToolBarAddToContactList":"Add to Contact List...","avNetworkDisconnectErrorMain":"There could be a problem with the network connection or a change in network. Check your network connection and then refresh the page.","errorRemovingGroup":"Unable to remove group, Please try again.","fileSharePermissionError":"Unable to grant the recipient access to the file.","connectionLostMessage":"Your browser has lost connectivity with the server. If an active conference call is terminated, check your network connection and restart your browser.","fileTransferIncomingDownloadTitle":"Click here to accept this file","preferencesContactListSaveExpansion":"Save expansion of groups on exit","privacyListCancelButton":"Cancel","loginPassWord":"Password:","callUnavlblLbl":"Call unavailable for Selected Contact","wpWebAppications":"web applications","wpPluginUpdateNow":"Update Now","groupChatWindowTitle":"${0}'s Group Chat","chatSend":"Send","fileSharePermissionGuestError":"Unable to grant a guest access to the file.","fileTransferReceiveTitle":"Accept File","fileTransferReceiveText1":"${0} has sent file ${1}","imainMenuAnnouncement":"Send Announcement","fileTransferReceiveText2":"Click OK to accept this file.","removeGroupConfirm":"Removing this group also removes all contacts in the group and subgroups. Do you want to continue?","avMsgDialBandwidthUnavailable":"Your call cannot be completed due to an internal error. Contact your administrator to verify your server configuration and policies.","avMsgFFProfileNotCreated":"The current Firefox profile is not created in the default location. Check with your administrator.","businessCardLabelEmail":"Email","hardwarePref":"Adjust Hardware...","information":"Information","meetingRoomsUnlisted":"(Hidden)","errorApplicationTitle":"Attention","preferencesNotificationsBringToFront":"Bring window to the front","emoticonLabelShy":"shy","allContactsGroupLabel":"All Contacts","announcementRecipients":"Recipients:","callNoNumber":"Unable to place call, ${0} has not specified a number.","meetingTitle":"Invite to Meeting Room","listView":"List View","chatAnnouncementReceive":"${0} has sent you an announcement","avMsgCopyFailed":"The conference call plug-in did not download. The files did not copy correctly. Contact your administrator.","errorLogin":"Login error","addPrivateGroupConfirmation":"Personal group added: ${0}","callPerfLbl":"Performance","avMsgArchiveExtrFailedFileInUse":"The conference call plug-in failed to update because the files did not copy correctly. Close all browser instances and try again.","emoticonLabelNo":"no","iContactAdderNicknameLabel":"Nickname","vvPrefNumSecsLabel":"sec","avRefreshPageTryAgain":"Refresh the page to try again.","groupChatTopicTitle":"Topic:","contextMenuRenameGroup":"Rename Group...","linkEditorLink":"Link","avMsgTURNClusterActiveNodeDown":"Call dropped or could not be completed. Try again.","mutePartLbl":"Mute Participant","contactListFilterOnlineContactsOnly":"Online Contacts Only","avMsgDialBandwidthLimit":"You cannot join the call at this time, due to a high volume of calls. Wait a few minutes and try again.","emoticonLabelClapYellow":"clapYellow","adjVolumeTitle":"Adjust Volume","videoInviteDescription":"${0}is inviting you to a video call.","adjhwTitleSpk":"Speaker","partUnMutedLbl":"UnMuted","avStatsRowHeaderResolution":"Resolution:","businessCardConnectionsFilesTooltip":"Files","meetingRoomsEnterRoomButton":"Enter Room","wpIEInstallPluginExtOne":"After successful installation, the screen capture capability will be enabled inside the chat window.","groupChatInvitees":"Invitees:","audioInviteDescription":"${0}is calling your Computer Phone.","adjVolumeSliderSpkDec":"Decrease Speaker Volume","errorSessionExpired":"The Chat session has expired.","wpInstallInProgressContent":"You cannot use the Sametime Webplayer supported features while plug-in installation is in progress. Please wait for the installation to complete, close any open install windows and re-enter the chat window.","mainMenuPrivacyList":"Privacy List...","quickFindTooManyResults":"${0} was not found or returned too many matches. Modify your entry and try again.","chatFileTransferButtonLabel":"Send a File...","chatTopic":"group chat","popopRemoveGroupContent1":"Removing this group will also remove all group contacts and subgroups.","iGroupInfoActionChat":"Invite to Chat","popopRemoveGroupContent2":"Do you want to continue?","success":"Success","preferencesChatWindowEffectTitle":"Note:","avStatsRowHeaderJitter":"Jitter:","contactAdderUserEmail":"User email address","announcementMessage":"Message to send:","iContactAdderAddAsSubgroupCheckbox":"Add as a subgroup to the selected group below","errorGroupAlreadyContainsGroup":"This subgroup already exists.","errorOpenPreference":"An error occurred while opening the preferences window, Please try again.","fileTransferLabelFileSize":"FileSize:","avMsgFailedRetreivePACSettings":"Computer phone did not initialize. The browser failed to retrieve HTTP Proxy settings from the PAC file.","avMsgErrorConnectingWithServer":"Error connecting with server.","awarenessPersonalStatus":"Availability status","quickFindSearchingText":"Searching directory for ${0}","chatUserLeft":"${0} has left the chat","wpFFUpgradePluginExt":"You will need to restart Firefox for the upgrade to complete.","avMsgRegistrationFailed1":"Unable to initialize the conference call service due to SIP proxy registration failure.","meetingRoomServer":"Meeting room server","avMsgRegistrationFailed2":"Restart your browser and try again.","emoticonLabelEyebrow":"eyebrow","wpStrRestartWebClientAV":"You will be required to restart the web client to start using the Audio Video Conferencing feature.","wpContentUpgradeDialogCancelInstAV":"Click Cancel to return to remain in the web client but without being able to use the ${0} feature.","avStatsWindowTitle":"Call Performance Statistics","startMyVideo":"Start My Video","meetingRoomsActive":"Participants: ${0}","status2wayVideoInvite":"You are invited to a video call","adjVolumeSpk":"Adjust Speaker Volume","adjustVolume":"Adjust Volume...","fileTransferSendLabel":"Sending File: ${0}%","groupSelectorCancel":"Cancel","wpcontentPluginInUse":"Plug-in Still in Use","announcementCancel":"Cancel","privacyListQuickfindTitle":"Search for people to add to your privacy list.","wpIEInstallPluginExtManyAV":"After successful installation, Audio Video Conferencing capability will be enabled","avInviteDeclineButton":"Decline","adjhwSelectCam":"Select Camera","startCallLbl":"Start Call","wpInstallInProgressContentAV":"You cannot use the Sametime Webplayer supported features while plug-in installation is in progress. Please wait for the installation to complete, close any open install windows and re-enter the web client.","welcomeTitle":"Welcome to IBM Connections Chat","avUserBusyInAnotherCall":"${0} is busy on another call. Try to call again later.","nwayChatInviteDescription":"is inviting you to a multi-person chat","chatServerMessage":"Close Chat","errorGroupExists":"A group with this name already exists at this level in the group hierarchy. Enter a unique group name or select a different parent group.","errorCustomEmoticon":"Image cannot be displayed","adjVolumeSliderMicInc":"Increase Microphone Volume","groupChatCancel":"Cancel","privacyListRadioEverybodyTooltip":"These people cannot see your status on their contact lists. You cannot see their status on your contact list either.","resumeMyVideo":"Resume My Video","fileTransferComplete":"${0}: File Transfer Complete","removeButtonText":"Remove","forceLogoutTitle1":"User \"${0}\" is no longer logged in","forceLogoutTitle2":"Reason:${0}You have been disconnected from Chat because you logged on from another computer","fileTransferReceivedLabel":"Status: ${0} has received this file.","bodyPluginContactsTitle":"Contacts","fileShareLoadingLabel":"Loading file selector...","avStatsInstructions":"If you experience slow video or audio performance, copy-paste the contents of the table and send to your administrator.","adjhwTitleMic":"Microphone","avDeclineCall":"Decline call","errorHostNameMessage":"Please make sure you are using the correct address and try again.","avStatsClose":"Close","quickFindPrevious":"Previous page","addContactConfirmationGroupLabel":"Group:","wpUACNotify":"The Windows OS setting for User Account Control should have a value other than 'Never Notify', otherwise the installation will not proceed.","editNicknameTitle":"Edit Nickname","avStatsRowHeaderPacketsLost":"Packets Lost:","iPhoneScrollTip":"Tip: Use two fingers to scroll this window.","MutedLbl":"Mute","mainMenuFile":"File","chatMenuAddToContactList":"Add to Contact List...","titleNwayVideoInvite":"Incoming Conference Call","stopVideo":"Stop Video","webclientExitingSametime":"You are about to exit Chat","renamerGroupTitle":"Rename Group","pluginInstallLbl":"Click to install missing plug-in","connectionLostTitle":"Connection Lost","errorClusterLogin":"Chat is temporarily unavailable.","popupCancel":"Cancel","iPhoneLoginLoading":"Loading","iContactAdderSearchOnlyPrompt":"Search for a person by name.","contactAdderEmptyBuddyList":"Your contact list is empty. Add a group before adding a contact.","errorLoginNoUserIdPassword":"Please enter a user name and password","leaveCall":"Leave Call","endCallMsg":"Ending the call will disconnect all participants from the call.","loginUserStatus":"Availability status:","contextMenuNoOptions":"No Options Available"})
};/* Copyright IBM Corp. 2014  All Rights Reserved.                    */
Function.prototype.stproxyApply=function(_1,_2){
var _3=new Array();
_2=(_2||[]);
for(var i=0;i<_2.length;i++){
_3.push(_2[i]);
}
this.apply(_1,_3);
delete _3;
};
var stproxyCommon={allowAnonymousLogin:false,DELIMITER:"|",displayNames:{},ESC_PRESSED:false,EXTERNAL_USER_PREFIX:"@E ",isUnauthorized:false,loginCount:0,loginResponse:{},loginUsername:"",isLoggedIn:false,MAX_MESSAGE_LENGTH:10000,manualLogout:false,isWebAv:false,isHTTPS:(window.location.protocol.toLowerCase()=="https:"),CHAT_EDITOR_FONT:"chatEditorFontKey",buildVersion:"ST30.14_ProxyServer20141121-0138",substitute:function(_4,_5){
if(_4&&_5){
for(var i=0;i<_5.length;i++){
_4=_4.replace(new RegExp("\\$\\{"+i+"\\}","gi"),_5[i]);
}
}
return _4;
},trim:function(_6){
return _6.replace(/(^\s+|\s+$)/g,"");
},mixin:function(_7,_8){
_7=(_7)?_7:{};
for(var i=1,l=arguments.length;i<l;i++){
stproxy._mixin(_7,arguments[i]);
}
return _7;
},_mixin:function(_9,_a){
for(var _b in _a){
_9[_b]=_a[_b];
}
return _9;
},options:{store:{},setAll:function(_c){
_c=(_c||{});
for(var _d in _c){
stproxy.options.set(_d,_c[_d]);
}
},set:function(_e,_f){
stproxy.options.store[_e]=_f;
},get:function(key){
return (stproxy.options.store[key]||false);
},remove:function(key){
try{
delete stproxy.options.store[key];
}
catch(e){
}
},has:function(key){
return (typeof (stproxy.options.store[key])!="undefined");
}},json:{toString:function(obj){
try{
return window.JSON.stringify(obj);
}
catch(e){
stproxy.console.log(((stproxy.isCore)?"core":"stub")+" toString: Cannot stringify <object> "+e);
stproxy.console.dir(obj);
return null;
}
},toJson:function(str){
try{
return window.JSON.parse(str);
}
catch(e){
stproxy.console.log(((stproxy.isCore)?"core":"stub")+" toJson: Cannot parse <string> "+str+" "+e);
return false;
}
}},agent:{_agent:navigator.userAgent,get:function(){
return stproxy.agent._agent;
},isChrome:function(){
return stproxy.agent.is("Chrome");
},isIE:function(){
if(stproxy.agent.is("MSIE")){
var reg=new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");
if(reg.exec(stproxy.agent.get())!=null){
return (parseFloat(RegExp.$1));
}
}
return false;
},isIE64:function(){
var IE=this.isIE();
if(IE&&stproxy.agent.is("Win64")&&stproxy.agent.is("x64")){
return IE;
}
return false;
},isFF:function(){
return stproxy.agent.is("Firefox");
},isSafari:function(){
return stproxy.agent.is("Safari");
},isMac:function(){
return stproxy.agent.is("Macintosh");
},isWin:function(){
return stproxy.agent.is("Windows");
},is:function(_10){
if(typeof (_10)!="string"){
return false;
}
return (stproxy.agent.get().toLowerCase().indexOf(_10.toLowerCase())>=0);
}},session:{},displayNames:{},_allowOpenChat:function(_11){
if(!_11||!stproxy.isLoggedIn){
return false;
}
var _12=(stproxy.liveNameModels||stproxy.liveNameModelStubs);
var _13=_12[stproxy.resolve.userId(_11)];
return (!_13)?true:((_13.status!=stproxy.awareness.OFFLINE)&&(_13.status!=stproxy.awareness.DND)&&(_13.status!=stproxy.awareness.DND_MOBILE));
},reset:{models:function(){
stproxy.session=new stproxy._session();
stproxy._isForceFullLogout.set(false);
stproxy.loginResponse={};
stproxy.loginUsername="";
stproxy.localWatchlistCounters={};
stproxy.watchListCounters={};
stproxy.richTextChatMap={};
if(!stproxyConfig.isStandAloneWebClient){
for(var id in stproxy.liveNameModels){
if(id&&id!="null"&&id!="undefined"){
stproxy.offlineReqs.push(id);
}
}
}
stproxy.liveNameModels={};
stproxy.chatModels={};
stproxy.groupChatModels={};
stproxy.resetBuddylist();
stproxy.watchlist.local.list={};
stproxy.reset._common();
},stubs:function(){
stproxy.session={};
stproxy.chatModelStubs={};
stproxy.groupChatModelStubs={};
stproxy.AVModelStubs={};
delete stproxy.uiControl.buddyListItems;
stproxy.uiControl.loginPerson={};
stproxy.uiControl.totalUsers=0;
stproxy.reset._common();
},_common:function(){
stproxy.displayNames={};
stproxy.serverAttributes={};
stproxy.policies.userPolicies={};
stproxy.policies.gatekeeper={};
stproxy.telephony.isActive=false;
stproxy.isLoggedIn=false;
}},guestStore:{noResolve:true,_ids:{},_broadcast:function(id){
if(stproxy.broadcast.setGuestId){
stproxy.broadcast.setGuestId(id);
}
},_receive:function(id){
stproxy.guestStore.set(id);
},_update:function(ids){
if(typeof (ids)=="object"){
for(var id in ids){
stproxy.guestStore.set(id,false,true);
}
}
},set:function(id,_14,_15){
stproxy.console.log(stproxy.isCore+" :"+"set");
if(id){
_14=!!_14;
stproxy.guestStore._ids[id]=true;
if(!_14){
stproxy.invoke("stproxy.guestStore.set",[id,true]);
}else{
if(!_15){
stproxy.guestStore._broadcast(id);
}
}
}
},contains:function(ids){
if(ids){
if(typeof (ids)=="object"){
for(var id in ids){
if(stproxy.guestStore.contains(ids[id])){
return true;
}
}
}else{
if(stproxy.guestStore._ids[ids]){
return true;
}else{
var _16=(stproxy.liveNameModels||stproxy.liveNameModelStubs);
if(_16[ids]&&_16[ids].isAnonymous){
stproxy.guestStore.set(ids);
return true;
}
return false;
}
}
}
return false;
},checkParam:function(ids,_17){
if(ids&&_17&&stproxy.guestStore.noResolve){
if(stproxy.guestStore.contains(ids)){
_17["noResolve"]=true;
return _17;
}
}
return _17;
}},offlineMessages:{flagName:"isofflinemessage",check:function(_18){
if(_18[stproxy.offlineMessages.flagName]){
_18.displayName=(stproxy.i18nStrings.offlineMessageServiceDisplayName||"Sametime Offline Message Service");
stproxy.displayNames[_18.userId]=_18.displayName;
return true;
}
return false;
}},resolve:{name:function(_19){
if(stproxy.isCore){
return false;
}
var _1a=0;
var id=null;
for(var i in stproxy.liveNameModelStubs){
var ln=stproxy.liveNameModelStubs[i];
if(ln.displayName&&(_19.toLocaleLowerCase()==ln.displayName.toLocaleLowerCase())){
id=ln.id;
_1a++;
}else{
for(var _1b in ln._oAliases){
if(_19.toLocaleLowerCase()==_1b.toLocaleLowerCase()){
id=ln.id;
_1a++;
break;
}
}
}
}
return (id&&_1a==1)?{"resolvedName":_19,"id":id}:false;
},userId:function(_1c){
if(!_1c){
return _1c;
}
return stproxy.resolve[(stproxy.isCore)?"_core":"_stub"](_1c);
},_core:function(_1d){
try{
if(!stproxy.liveNameModels[_1d]){
_1d=stproxy.resolve._check(_1d,stproxy.liveNameModels);
}
}
catch(e){
stproxy.console.log("[core] Cannot resolve userId: "+_1d);
}
return _1d;
},_stub:function(_1e){
try{
if(!stproxy.liveNameModelStubs[_1e]){
_1e=stproxy.resolve._check(_1e,stproxy.liveNameModelStubs);
if(!stproxy.liveNameModelStubs[_1e]){
for(var i in stproxy.liveNameModelStubs){
var _1f=stproxy.resolve._check(_1e,stproxy.liveNameModelStubs[i]._oAliases);
if(_1f!=_1e){
return (stproxy.liveNameModelStubs[i].id||_1e);
}
}
}
}
}
catch(e){
stproxy.console.log("[stub] Cannot resolve userId: "+_1e);
}
return _1e;
},_check:function(_20,obj){
for(var id in obj){
if(id.toLocaleLowerCase()==_20.toLocaleLowerCase()){
return id;
}
}
return _20;
}},awareness:{UNKNOWN:-1,OFFLINE:0,AVAILABLE:1,AWAY:2,DND:3,NOT_USING:4,IN_MEETING:5,AVAILABLE_MOBILE:6,AWAY_MOBILE:7,DND_MOBILE:8,IN_MEETING_MOBILE:10,i18nStrings:{0:"statusOffline",1:"statusAvailable",2:"statusAway",3:"statusDisturb",4:"statusAway",5:"statusMeeting",6:"statusAvailableMobile",7:"statusAwayMobile",8:"statusDisturbMobile",10:"statusMeetingMobile"},getStatusMessage:function(_21){
return stproxy.awareness._getStatusMessage(_21);
},_getStatusMessage:function(_22){
try{
return stproxy.i18nStrings[stproxy.awareness.i18nStrings[_22]];
}
catch(e){
return stproxy.i18nStrings.statusOffline;
}
}},telephony:{set:function(_23){
stproxy.telephony.isActive=(_23.telephony||false);
},isActive:false,AVAILABLE:1,BUSY:2},api:{CONTEXT_ROOT:stproxyConfig.server+"/stwebapi",LOGIN:stproxyConfig.server+"/stwebapi"+"/user"+"/connect",LOGOUT:stproxyConfig.server+"/stwebapi"+"/user"+"/connect",STATUS:stproxyConfig.server+"/stwebapi"+"/user"+"/status",LOCATION:stproxyConfig.server+"/stwebapi"+"/user"+"/location",ALERTS:stproxyConfig.server+"/stwebapi"+"/user"+"/alerts",PRIVACY:stproxyConfig.server+"/stwebapi"+"/user"+"/privacy",CAPABILITY:stproxyConfig.server+"/stwebapi"+"/user"+"/capability",ATTRIBUTES:stproxyConfig.server+"/stwebapi"+"/presence"+"/attributes",INFO:stproxyConfig.server+"/stwebapi"+"/userinfo",INFO_CONNECTIONS:stproxyConfig.server+"/stwebapi"+"/userinfo"+"/connections",BUDDYLIST:stproxyConfig.server+"/stwebapi"+"/buddylist",USER:stproxyConfig.server+"/stwebapi"+"/buddylist"+"/user",USERS:stproxyConfig.server+"/stwebapi"+"/buddylist"+"/users",GROUP:stproxyConfig.server+"/stwebapi"+"/buddylist"+"/group",GROUPS:stproxyConfig.server+"/stwebapi"+"/buddylist"+"/groups",PRESENCE:stproxyConfig.server+"/stwebapi"+"/presence",PRESENCE_STATUS:stproxyConfig.server+"/stwebapi"+"/presence"+"/status",CHAT:stproxyConfig.server+"/stwebapi"+"/chat",MEETING:stproxyConfig.server+"/stwebapi"+"/chat"+"/meeting",QUICKFIND:stproxyConfig.server+"/stwebapi"+"/quickfind",N_WAY_CHAT:(stproxyConfig.server||"")+"/stwebapi"+"/chat"+"/nway",CALL:stproxyConfig.server+"/stwebapi"+"/call",CONF:stproxyConfig.server+"/stwebapi"+"/conference",CONFUSER:stproxyConfig.server+"/stwebapi"+"/conference"+"/user",WEBAVVER:stproxyConfig.server+"/stwebav"+"/WebAVServlet",BUILD:stproxyConfig.server+"/stwebclient"+"/buildinfo",COMMUNITYFQDN:stproxyConfig.server+"/stwebclient"+"/communityserver",PREFERENCES:stproxyConfig.server+"/stwebapi"+"/preferences",IMAGE:stproxyConfig.server+"/stwebapi"+"/image",FILETRANSFER:stproxyConfig.server+"/stwebapi"+"/filetransfer",FILETRANSFER_UPLOAD:stproxyConfig.server+"/stwebapi"+"/filetransfer/upload",FILETRANSFER_SEND:stproxyConfig.server+"/stwebapi"+"/filetransfer/send",FILESHARE_SEND:stproxyConfig.server+"/stwebapi"+"/fileshare",SCREENCAPTURE:stproxyConfig.server+"/screencapture",SMARTCLOUD_PHOTO:"//apps"+window.location.host.substr(window.location.host.indexOf("."))+"/contacts/profiles/photo/${0}/1"},client:{INOTES_CLIENT:5300,WEB_CLIENT:5295,MOBILE_CLIENT:5187,MEETINGS_CLIENT:5297,OTHER:5302},codes:{error:{COMMUNITY_SERVER:503,CONNECT_CLIENT:500,SESSION:17},SUCCESS:200,MAX_SUCCESS:299,FAIL:400,UNAUTHORIZED:401,LOGIN_FAIL:500},loginType:{AS_ANON:"anonymous",BY_PASSWORD:"byPassword",BY_TOKEN:"byToken"},community:{AOL:"aol",GOOGLE:"google",YAHOO:"yahoo",SAMETIME_OTHER:"sametime/other"},gateWayCommunityMap:{"AOL IM":"aol","GoogleTalk":"google","Yahoo Messenger":"yahoo!","other":"sametime/other"},isExternalUser:function(_24){
return ((typeof _24=="string")&&_24.substring(0,stproxy.EXTERNAL_USER_PREFIX.length)==stproxy.EXTERNAL_USER_PREFIX);
},isExternalUserId:function(_25){
return ((typeof _25=="string")&&(_25.split("::"))&&(_25.split("::").length>1)&&(_25.split("::")[1]));
},ignoreMessages:{serverId:"server",users:{server:["The following external users want to add you to their contact list"]},check:function(_26,_27,_28){
_26=_26.toLowerCase();
if(stproxy.ignoreMessages.users[_26]&&stproxy.ignoreMessages.users[_26].length>0){
for(var x=0;x<stproxy.ignoreMessages.users[_26].length;x++){
if((_27).indexOf(stproxy.ignoreMessages.users[_26][x])!=-1){
return true;
}
}
}
if(_28&&(_26==stproxy.ignoreMessages.serverId)){
stproxy.onServerAdminMessage(_27,stproxy.ignoreMessages._noContactList(_27));
return true;
}
return false;
},_noContactList:function(_29){
try{
_29.match(/\[([^\]]*)\]/);
var _2a=RegExp.$1;
var _2b=(stproxy.chatModels||stproxy.chatModelStubs);
if(_2a&&_2b[_2a]){
return true;
}
}
catch(e){
}
return false;
}},isConnectClientAPI:function(_2c){
return ((typeof (stproxy.connect)!="undefined")&&stproxy.connect.isAvailable()&&stproxy.connect.API_WHITELIST[_2c]);
},policies:{ALLOW_FILETRANSFER:1,FILETRANSFER_MAXSIZE:2,ALLOW_FILETRANSFER_EXTENSION:3,FILETRANSFER_EXTENSION:4,TCSPI:5,ALLOW_INSTANT_MEETING:1001,ALLOW_EXTERNAL_USER:2001,ALLOW_SCREEN_CAPTURE:2009,CONTACT_LIST_SIZE:2015,ALLOW_ANNOUNCEMENT:9014,ALLOW_SEARCH_DIRECTORY:9023,DISABLE_MEETING_INVITATION:9034,LICENSE_LEVEL:9034,screencapture:{isAllowed:function(){
var _2d=stproxy.policies.get(stproxy.policies.ALLOW_SCREEN_CAPTURE);
if(_2d&&_2d.value!=0){
return true;
}
return false;
}},fileshare:{isAllowed:function(){
if(stproxy.policies.fileshare.isConfigured()){
var _2e=stproxy.policies.get("fileshare");
if(_2e!=null&&_2e.value==="true"){
return true;
}
}
return false;
},isConfigured:function(){
var _2f=stproxy.options.get("fileShare");
return (_2f&&_2f.isEnabled&&!!stproxy.policies.fileshare.getURL());
},getURL:function(){
var _30=stproxy.options.get("fileShare");
if(stproxy.isHTTPS&&_30.urlSSL){
return _30.urlSSL;
}
if(!stproxy.isHTTPS&&_30.url){
return _30.url;
}
return null;
}},filetransfer:{isAllowed:function(){
var _31=stproxy.policies.get(stproxy.policies.LICENSE_LEVEL);
if(_31&&_31.value=="entry"){
return false;
}
var _32=stproxy.policies.get(stproxy.policies.ALLOW_FILETRANSFER);
if(_32&&_32.value!=0){
return true;
}
return false;
},isSizeAllowed:function(_33){
if(stproxy.policies.filetransfer.isAllowed()&&_33){
var _34=stproxy.policies.get(stproxy.policies.FILETRANSFER_MAXSIZE);
if(_34&&(parseInt(_34.value)<_33)){
return false;
}
return true;
}
return false;
},getMaxSize:function(){
var _35=stproxy.policies.get(stproxy.policies.FILETRANSFER_MAXSIZE);
if(_35&&_35.value){
return _35.value;
}
return false;
},isExtensionAllowed:function(ext){
if(stproxy.policies.filetransfer.isAllowed()){
if(!ext){
return true;
}
var _36=stproxy.policies.get(stproxy.policies.FILETRANSFER_EXTENSION);
var _37=stproxy.policies.get(stproxy.policies.ALLOW_FILETRANSFER_EXTENSION);
if(_36&&(_37&&_37.value!=0)){
var _38=_36.value.replace(/\s/g,"").split(",");
for(var i=0;i<_38.length;i++){
if(_38[i].toLowerCase()==ext.toLowerCase()){
return false;
}
}
}
return true;
}
return false;
}},meeting:{isConfigured:function(){
var _39=stproxy.policies.get("meetingsURL");
return (_39)?_39.value:null;
},isAllowed:function(){
if(!stproxy.policies.meeting.isConfigured()){
return false;
}
var _3a=stproxy.policies.get(stproxy.policies.DISABLE_MEETING_INVITATION);
if(_3a&&_3a.value=="entry"){
return false;
}
return true;
},allowInstantMeeting:function(){
if(stproxy.policies.meeting.isAllowed()){
var _3b=stproxy.policies.get(stproxy.policies.ALLOW_INSTANT_MEETING);
if(_3b&&_3b.value!=0){
return true;
}
}
return false;
}},embeddedChat:{isAllowed:function(){
var _3c=stproxy.policies.get("embeddedchat");
if(_3c!=null&&_3c.value==="true"){
return true;
}
return false;
}},userPolicies:{},gatekeeper:{},set:function(_3d){
stproxy.policies.userPolicies=(_3d||{});
if(!stproxy.policies.meeting.isConfigured()){
stproxy.policies._setPolicy(stproxy.serverAttributes,stproxy.policies.DISABLE_MEETING_INVITATION,false);
}
},setGatekeeper:function(_3e){
stproxy.policies.gatekeeper=(_3e||{});
},entitlements:{FILES:"bh_filer",MEETINGS:"bh_meetings",serverURL:null,cookieValue:null,entitlementsURL:"/samlproxy/webchatentitlements?callback=stproxy.login.onEntitlementsReceived",has:function(_3f){
return stproxy.policies.entitlements[_3f];
},set:function(_40){
if(_40){
stproxy.policies.entitlements.cookieValue=_40;
var _41=_40.split(",");
if(_41[_41.length-1]==""){
_41.pop();
}
for(var i=0;i<_41.length;i++){
stproxy.policies.entitlements[_41[i]]=true;
}
}
}},_setPolicy:function(_42,_43,_44){
for(var obj in _42){
if(_42[obj].id==_43){
_42[obj]=_44;
break;
}
}
},get:function(_45){
var _46=function(_47){
for(var obj in _47){
if(_47[obj].id==_45){
return _47[obj];
}
}
return null;
};
var _48=function(_49){
return stproxy.policies.entitlements.has(_49);
};
return (_46(stproxy.policies.userPolicies)||_46(stproxy.serverAttributes)||_46(stproxy.policies.gatekeeper)||_48(_45));
}},helpTopics:{landingPage:stproxyConfig.server+"/help/index.jsp",open:function(){
var _4a=stproxy.options.get("helpURL");
if(_4a){
var _4b=djConfig.locale;
var _4c=_4b.split("-");
if(_4b=="pt-br"||_4b=="zh-cn"||_4b=="zh-tw"){
_4b=_4c[0]+"_"+_4c[1].toUpperCase();
}else{
_4b=_4c[0];
}
_4a=_4a+"&lang="+_4b;
window.open(_4a);
}else{
window.open(stproxy.helpTopics.landingPage);
}
}},hitch:{bind:function(_4d,_4e){
return function(){
_4e.stproxyApply(_4d,arguments);
};
},_getEventType:function(_4f,_50){
_4f=_4f.toLowerCase();
if(_4f.indexOf("on")==0){
_4f=_4f.substring(2,_4f.length);
}
return ((_50)?"on":"")+_4f;
},event:function(obj,_51,_52){
if(!obj||!_51||!_52){
return;
}
try{
if(obj.addEventListener){
_51=this._getEventType(_51,false);
obj.addEventListener(_51,_52,false);
}else{
if(obj.attachEvent){
_51=this._getEventType(_51,true);
obj.attachEvent(_51,_52);
}
}
}
catch(e){
stproxy.console.log(e);
}
},disconnect:function(obj){
try{
if(obj&&obj.parent&&obj.child&&obj.original){
obj.parent[obj.child]=function(){
obj.original.stproxyApply(this,arguments);
};
}
}
catch(e){
stproxy.console.error("Error: stproxy.hitch.disconnect: "+e);
stproxy.console.dir(arguments);
}
},connect:function(_53,_54,_55){
try{
scope=(_53||window);
var _56=_53[_54];
if((typeof _56=="undefined")||(null==_56)||!_56){
throw ("Error: Event not found the scope: "+_54);
}
for(var x in scope){
if(scope[x]==_53[_54]){
scope[x]=function(){
_56.stproxyApply(this,arguments);
_55.stproxyApply(this,arguments);
};
break;
}
}
return {"parent":_53,"child":_54,"original":_56};
}
catch(e){
stproxy.console.error("Error: stproxy.hitch.connect: "+e);
stproxy.console.dir(arguments);
}
}},SSO:{tokens:["LtpaToken","LtpaToken2","SametimeToken","PD-H-SESSION-ID","PD-S-SESSION-ID"],hasToken:function(_57){
stproxy.console.log("start stproxy.SSO.hasToken()");
if(_57&&(_57!="")&&(_57.length>0)){
return (document.cookie.indexOf(_57)!=-1);
}
if(stproxy.customTokens){
for(var t in stproxy.customTokens){
stproxy.SSO.tokens.push(t);
}
}
var _58=stproxy.SSO.tokens;
for(var x=0;x<_58.length;x++){
if(document.cookie.indexOf(_58[x]+"=")!=-1){
stproxy.console.info("Found SSO Token");
return true;
}
}
stproxy.console.info("No SSO Token Found");
return false;
}},addExtension:function(_59,obj,_5a){
stproxyConfig.ext[_59]=(obj||false);
if(!_5a){
stproxy.invoke("stproxy.addExtension",[_59,obj,true]);
}
},hasExtension:function(_5b){
return (stproxyConfig.ext[_5b]||false);
},console:{top:function(str,arr){
this.log("TOP: "+str);
this._items(arr);
},bottom:function(str,arr){
this.log("BOTTOM: "+str);
this._items(arr);
},_items:function(arr){
if(arr){
for(var i=0;i<arr.length;i++){
this.dir(arr[i]);
}
}
},log:function(str){
this._print(str,"log");
},info:function(str){
this._print(str,"info");
},warn:function(str){
this._print(str,"warn");
},error:function(str){
this._print(str,"error",true);
},dir:function(obj){
this._print(obj,"dir");
},_print:function(str,_5c,_5d){
if(_5d||((djConfig&&djConfig.isDebug)||(stproxy&&stproxy.isDebug))){
if(console&&console[_5c]){
console[_5c](str);
}
}
}}};
(function(){
var _5e={server:"",isConnectClient:true,isStandAloneWebClient:false,noResolve:false,chat:{},plugins:{},ext:{}};
for(var key in _5e){
if(typeof (stproxyConfig[key])=="undefined"){
stproxyConfig[key]=_5e[key];
}
}
})();
if(typeof (stproxy)=="undefined"){
var stproxy=stproxyCommon;
}else{
for(var key in stproxyCommon){
stproxy[key]=stproxyCommon[key];
}
}
var emailCNMapper={};
var djConfig=(djConfig||(((typeof dojo!="undefined")&&dojo&&dojo.config)?dojo.config:{}));
stproxy.cookie={isEnabled:function(_5f){
var n=new Date().getTime();
stproxy.cookie.set(n,n);
var _60=stproxy.cookie.get(n);
if(_5f){
_5f(_60);
}
stproxy.cookie.remove(n);
return _60;
},_setProxyCookie:function(_61,_62,_63){
stproxy.cookie.set(_61,_62);
if(_63){
_63(_61,_62);
}
},set:function(_64,_65,_66,_67){
if(_67){
_65=stproxy.cookie.base64.encode(_65);
}
var _68=_64+"="+_65+";path=/;";
for(var p in _66){
_68+=p+"="+_66[p]+";";
}
if(stproxy.isHTTPS||stproxy.options.get("secureCookies")){
_68+="secure";
}
document.cookie=_68;
},remove:function(_69){
document.cookie=_69+"=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT";
},base64:{_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(str){
var out="";
var _6a,_6b,_6c,_6d,_6e,_6f,_70;
var i=0;
str=stproxy.cookie.base64._utf8_encode(str);
while(i<str.length){
_6a=str.charCodeAt(i++);
_6b=str.charCodeAt(i++);
_6c=str.charCodeAt(i++);
_6d=_6a>>2;
_6e=((_6a&3)<<4)|(_6b>>4);
_6f=((_6b&15)<<2)|(_6c>>6);
_70=_6c&63;
if(isNaN(_6b)){
_6f=_70=64;
}else{
if(isNaN(_6c)){
_70=64;
}
}
out=out+this._keyStr.charAt(_6d)+this._keyStr.charAt(_6e)+this._keyStr.charAt(_6f)+this._keyStr.charAt(_70);
}
return out;
},decode:function(str){
var out="";
var _71,_72,_73;
var _74,_75,_76,_77;
var i=0;
str=str.replace(/[^A-Za-z0-9\+\/\=]/g,"");
while(i<str.length){
_74=this._keyStr.indexOf(str.charAt(i++));
_75=this._keyStr.indexOf(str.charAt(i++));
_76=this._keyStr.indexOf(str.charAt(i++));
_77=this._keyStr.indexOf(str.charAt(i++));
_71=(_74<<2)|(_75>>4);
_72=((_75&15)<<4)|(_76>>2);
_73=((_76&3)<<6)|_77;
out=out+String.fromCharCode(_71);
if(_76!=64){
out=out+String.fromCharCode(_72);
}
if(_77!=64){
out=out+String.fromCharCode(_73);
}
}
out=stproxy.cookie.base64._utf8_decode(out);
return out;
},_utf8_encode:function(str){
str=str.replace(/\r\n/g,"\n");
var _78="";
for(var n=0;n<str.length;n++){
var c=str.charCodeAt(n);
if(c<128){
_78+=String.fromCharCode(c);
}else{
if((c>127)&&(c<2048)){
_78+=String.fromCharCode((c>>6)|192);
_78+=String.fromCharCode((c&63)|128);
}else{
_78+=String.fromCharCode((c>>12)|224);
_78+=String.fromCharCode(((c>>6)&63)|128);
_78+=String.fromCharCode((c&63)|128);
}
}
}
return _78;
},_utf8_decode:function(_79){
var _7a="";
var i=0;
var c=c1=c2=0;
while(i<_79.length){
c=_79.charCodeAt(i);
if(c<128){
_7a+=String.fromCharCode(c);
i++;
}else{
if((c>191)&&(c<224)){
c2=_79.charCodeAt(i+1);
_7a+=String.fromCharCode(((c&31)<<6)|(c2&63));
i+=2;
}else{
c2=_79.charCodeAt(i+1);
c3=_79.charCodeAt(i+2);
_7a+=String.fromCharCode(((c&15)<<12)|((c2&63)<<6)|(c3&63));
i+=3;
}
}
}
return _7a;
}},_p:"!",_tab:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-",_base64:{decode:function(str){
var s=str.split(""),out=[];
var l=s.length;
while(s[--l]==stproxy.cookie._p){
}
for(var i=0;i<l;){
var t=stproxy.cookie._tab.indexOf(s[i++])<<18;
if(i<=l){
t|=stproxy.cookie._tab.indexOf(s[i++])<<12;
}
if(i<=l){
t|=stproxy.cookie._tab.indexOf(s[i++])<<6;
}
if(i<=l){
t|=stproxy.cookie._tab.indexOf(s[i++]);
}
out.push((t>>>16)&255);
out.push((t>>>8)&255);
out.push(t&255);
}
while(out[out.length-1]==0){
out.pop();
}
return out;
},atos:function(ba){
var _7b="";
for(var i=0;i<ba.length;i++){
_7b+=String.fromCharCode(ba[i]);
}
return _7b;
},stoa:function(str){
var ba=[];
for(var i=0;i<str.length;i++){
ba[i]=str.charCodeAt(i);
}
return ba;
}},_trim:function(str){
return str.replace(/(^\s+)|(\s+$)/g,"");
},get:function(_7c,_7d,_7e,_7f){
if(typeof (_7c)=="undefined"||!_7c||_7c.length==0){
return null;
}
_7d=(_7d||document.cookie);
if(typeof (stproxyConfig.isPortalAjaxProxy)=="undefined"||!stproxyConfig.isPortalAjaxProxy){
return stproxy.cookie._getStandardCookie(_7c,_7d,_7f);
}else{
return stproxy.cookie._getEncodedCookie(_7c,_7d,_7e);
}
},_getStandardCookie:function(_80,_81,_82){
_81=_81.split(";");
for(var i in _81){
var _83=_81[i];
var _84=stproxy.cookie._trim(_83.split("=")[0]);
if(_84==_80){
var _85=_83.substr(_83.indexOf("=")+1);
if(_82){
_85=stproxy.cookie.base64.decode(_85);
}
return _85;
}
}
return null;
},_getEncodedCookie:function(_86,_87,_88){
var _89;
if(arguments.length<=3){
_87=_87.split(";");
for(var i in _87){
if(Object.prototype.hasOwnProperty.call(_87,i)){
var _8a=stproxy.cookie._trim(_87[i]);
if(_8a.indexOf(_86+"=")==0){
return _8a.substr(_8a.indexOf("=")+1);
}
if(_8a.indexOf("prx_")!=0||_8a.indexOf("."+_86)==-1){
continue;
}
var _8b=_8a.substring(4,_8a.indexOf("."));
var ba=stproxy.cookie._base64.decode(_8b);
var _8c=stproxy.cookie._base64.atos(ba);
var _8d=_8c.split(";");
var _8e="";
for(var p in _8d){
if(Object.prototype.hasOwnProperty.call(_8d,p)){
var _8f=_8d[p];
if(_8f.indexOf("d=")==0){
_8e=_8f.substr(2);
break;
}
}
}
if(!_88||_88===_8e){
_89=_8a.substr(_8a.lastIndexOf("=")+1);
break;
}
}
}
return _89;
}
}};
stproxy.isImplementation=true;
stproxy.isCore=false;
stproxy.broadcast={uiControl:{preferences:{onUpdate:function(_90){
stproxy.invoke("stproxy.broadcast.uiControl.preferences.onUpdate",[_90]);
}},addUserItem:function(id,_91,_92,_93,_94,_95){
stproxy.invoke("stproxy.broadcast.uiControl.addUserItem",[id,_91,_92,_93,_94,_95]);
},addPrivateGroupItem:function(_96){
stproxy.invoke("stproxy.broadcast.uiControl.addPrivateGroupItem",[_96]);
},addPrivateSubGroupItem:function(_97,_98,_99){
stproxy.invoke("stproxy.broadcast.uiControl.addPrivateSubGroupItem",[_97,_98,_99]);
},addPublicGroupItem:function(_9a,_9b){
stproxy.invoke("stproxy.broadcast.uiControl.addPublicGroupItem",[_9a,_9b]);
},addPublicSubGroupItem:function(_9c,_9d,id,_9e){
stproxy.invoke("stproxy.broadcast.uiControl.addPublicSubGroupItem",[_9c,_9d,id,_9e]);
},buddylist:{onUpdateJSON:function(_9f){
stproxy.invoke("stproxy.broadcast.uiControl.buddylist.onUpdateJSON",[_9f]);
},onRemoveGroup:function(_a0){
stproxy.invoke("stproxy.broadcast.uiControl.buddylist.onRemoveGroup",[_a0]);
}}},setDisplayName:function(sId,_a1){
stproxy.invoke("stproxy.broadcast.setDisplayName",[sId,_a1]);
}};
stproxy.receiveBroadcast={uiControl:{preferences:{onUpdate:function(_a2){
if(stproxy.uiControl.preferences){
stproxy.uiControl.preferences.updateStore(_a2);
}
}},addUserItem:function(id,_a3,_a4,_a5,_a6,_a7){
if(stproxy.uiControl.addUserItem){
stproxy.uiControl.addUserItem(id,_a3,_a4,_a5,_a6,_a7);
}
},addPrivateGroupItem:function(_a8){
if(stproxy.uiControl.addPrivateGroupItem){
stproxy.uiControl.addPrivateGroupItem(_a8);
}
},addPrivateSubGroupItem:function(_a9,_aa,_ab){
if(stproxy.uiControl.addPrivateSubGroupItem){
stproxy.uiControl.addPrivateSubGroupItem(_a9,_aa,_ab);
}
},addPublicGroupItem:function(_ac,_ad){
if(stproxy.uiControl.addPublicGroupItem){
stproxy.uiControl.addPublicGroupItem(_ac,_ad);
}
},addPublicSubGroupItem:function(_ae,_af,id,_b0){
if(stproxy.uiControl.addPublicSubGroupItem){
stproxy.uiControl.addPublicSubGroupItem(_ae,_af,id,_b0);
}
},buddylist:{onUpdateJSON:function(_b1){
if(stproxy.uiControl.updateBuddylistJSON){
stproxy.uiControl.updateBuddylistJSON(_b1);
}
},onRemoveGroup:function(_b2){
if(stproxy.uiControl.removeGroup){
stproxy.uiControl.removeGroup(_b2);
}
}}}};
stproxy.preConnectClient={buffer:[],push:function(obj){
if(obj){
if(stproxy.connect){
obj();
}else{
stproxy.preConnectClient.buffer.push(obj);
}
}
},load:function(){
var _b3;
for(var i in stproxy.preConnectClient.buffer){
_b3=stproxy.preConnectClient.buffer.pop();
_b3();
}
stproxy.preConnectClient.buffer=[];
}};
stproxy.mobile={agent:null,agents:[],set:function(_b4){
stproxy.mobile.agents=(_b4||[]);
stproxy.mobile.init();
},get:function(_b5){
return stproxy.mobile.agents;
},init:function(){
for(var a in stproxy.mobile.agents){
var _b6=stproxy.mobile.agents[a].toLowerCase();
if(stproxy.agent.is(_b6)){
stproxy.mobile.agent=_b6;
_b6=null;
delete _b6;
break;
}
}
},widgets:{livename:{_supportedPlugins:{"lnmpBizCard":true},isSupportedPlugin:function(_b7){
return (stproxy.mobile.agent&&stproxy.mobile.widgets.livename._supportedPlugins[_b7]);
}}}};
stproxy.isTouchDevice=function(){
return !!stproxy.mobile.agent;
};
stproxy.setStickyTimeout=function(_b8){
stproxy.invoke("stproxy.setStickyTimeout",[_b8]);
};
stproxy.login={isAnonymous:function(){
return (stproxy.session.LOGINTYPE==stproxy.loginType.AS_ANON);
},_updateStatus:function(_b9,_ba){
_b9=(_b9||0);
_ba=(_ba||stproxy.awareness._getStatusMessage(_b9));
if(stproxy.session){
stproxy.session.STATUS=_b9;
stproxy.session.STATUSMSG=_ba;
}
if(stproxy.uiControl&&stproxy.uiControl.loginPerson){
stproxy.uiControl.loginPerson.status=_b9;
stproxy.uiControl.loginPerson.statusMessage=_ba;
}
},hasToken:function(_bb,_bc){
stproxy.console.top("stproxy.login.hasToken",[]);
stproxy.addOnLoad(function(){
stproxy.invoke("stproxy.login.hasToken",[_bc],_bb);
});
stproxy.console.bottom("stproxy.login.hasToken");
},_login:function(_bd,_be,_bf,_c0){
stproxy.console.top(_bd,_be);
stproxy.addOnLoad(function(){
stproxy.invoke("stproxy.login._login",_be,_bf,_c0);
});
stproxy.console.bottom(_bd);
},loginByPassword:function(_c1,_c2,_c3,_c4,_c5,_c6,_c7){
stproxy.login._login("stproxy.login.loginByPassword",[_c1,_c2,stproxy.loginType.BY_PASSWORD,_c3,_c4,_c7],_c5,_c6);
},loginByToken:function(_c8,_c9,_ca,_cb,_cc,_cd){
stproxy.login._login("stproxy.login.loginByToken",[_c8,null,stproxy.loginType.BY_TOKEN,_c9,_ca,_cd],_cb,_cc);
},loginWithToken:function(_ce,_cf,_d0,_d1,_d2,_d3,_d4){
stproxy.login._login("stproxy.login.loginWithToken",[_ce,_cf,stproxy.loginType.BY_TOKEN,_d0,_d1,_d4],_d2,_d3);
},loginAsAnon:function(_d5,_d6,_d7,_d8,_d9,_da){
stproxy.login._login("stproxy.login.loginAsAnon",[_d5,null,stproxy.loginType.AS_ANON,_d6,_d7,_da],_d8,_d9);
},loginAsAnonWithToken:function(_db,_dc,_dd,_de,_df,_e0,_e1){
stproxy.login._login("stproxy.login.loginAsAnonWithToken",[_db,_dc,stproxy.loginType.AS_ANON,_dd,_de,_e1],_df,_e0);
},logout:function(_e2,_e3,_e4){
stproxy.uiControl.confirmLogout(_e2,_e3,_e4);
},_logout:function(_e5,_e6,_e7){
stproxy.invoke("stproxy.login.logout",[_e5],_e6,_e7);
},_leaveMeetingLogout:function(_e8,_e9,_ea){
stproxy.verify.meetings.logout(_e8,_e9,_ea);
},isRealLogout:function(_eb){
stproxy.isRealLogout=_eb;
},onLogin:function(){
},onSAMLReceived:function(_ec){
},onLogout:function(){
stproxy.reset.stubs();
},onError:function(_ed,_ee){
}};
stproxy.buildNumber={_num:"",_set:function(_ef){
if(_ef){
stproxy.buildNumber._num=_ef;
}
},get:function(_f0){
if(_f0){
_f0(stproxy.buildNumber._num);
}
return stproxy.buildNumber._num;
}};
stproxy.getBuildNumber=function(_f1,_f2){
stproxy.invoke("stproxy.getBuildNumber",[],_f1,_f2);
};
stproxy.onServerAdminMessage=function(_f3,_f4){
};
stproxy.communityFQDN={id:false,_callBacks:[],get:function(_f5,_f6){
stproxy.invoke("stproxy.communityFQDN.get",[],_f5,_f6);
},set:function(id){
stproxy.communityFQDN.id=id;
for(var i=0;i<stproxy.communityFQDN._callBacks.length;i++){
var _f7=stproxy.communityFQDN._callBacks.pop();
_f7(stproxy.communityFQDN.id);
}
},getId:function(_f8){
if(_f8){
if(stproxy.communityFQDN.id){
_f8(stproxy.communityFQDN.id);
}else{
stproxy.communityFQDN._callBacks.push(_f8);
}
}
}};
stproxy.status={set:function(_f9,_fa,_fb,_fc){
stproxy.invoke("stproxy.status.set",[_f9,_fa],_fb,_fc);
}};
stproxy.person={getUserInfo:function(_fd,_fe,_ff){
stproxy.invoke("stproxy.person.getUserInfo",[_fd],_fe,_ff);
},_getConnectionsInfo:function(_100,_101,_102){
stproxy.invoke("stproxy.person.getConnectionsInfo",[_100],_101,_102);
}};
stproxy.buddylist={onLocation:function(_103){
},onAnnouncement:function(_104,_105,_106){
},get:function(_107,_108,_109,_10a){
stproxy.invoke("stproxy.buddylist.get",[_107,_108],function(_10b){
_109(stproxy.json.toJson(_10b));
},_10a);
},addUser:function(_10c,_10d,_10e,_10f){
stproxy.invoke("stproxy.buddylist.addUser",[_10c,_10d],_10e,_10f);
},removeUser:function(_110,_111,_112,_113){
stproxy.invoke("stproxy.buddylist.removeUser",[_110,_111],_112,_113);
},addGroup:function(_114,_115,_116,_117){
stproxy.invoke("stproxy.buddylist.addGroup",[_114,_115],_116,_117);
},removeGroup:function(_118,_119,_11a,_11b){
stproxy.invoke("stproxy.buddylist.removeGroup",[_118,_119],_11a,_11b);
},renameUser:function(_11c,_11d,_11e,_11f){
stproxy.invoke("stproxy.buddylist.renameUser",[_11c,_11d],_11e,_11f);
},renameGroup:function(_120,_121,_122,_123){
stproxy.invoke("stproxy.buddylist.renameGroup",[_120,_121],_122,_123);
},getUsers:function(_124,_125,_126){
stproxy.invoke("stproxy.buddylist.getUsers",[_124],_125,_126);
},getGroups:function(_127,_128,_129){
stproxy.invoke("stproxy.buddylist.getGroups",[_127],_128,_129);
},getGroup:function(_12a,_12b,_12c,_12d){
stproxy.invoke("stproxy.buddylist.getGroup",[_12a,_12b],_12c,_12d);
},sendAnnouncement:function(_12e,_12f,_130,_131,_132){
stproxy.invoke("stproxy.buddylist.sendAnnouncement",[_12e,_12f,_130],_131,_132);
}};
stproxy.watchlist={spamLock:null,updates:[],onLocation:function(_133){
},onUpdate:function(_134){
stproxy.watchlist.updates.push(_134);
if(!stproxy.watchlist.spamLock){
stproxy.watchlist.spamLock=setTimeout(function stproxy_watchlist_onUpdate_settimeout(){
stproxy.watchlist.spamLock=null;
var _135=stproxy.json.toString(stproxy.watchlist.updates);
stproxy.watchlist.updates=[];
stproxy.console.top("STUB stproxy_watchlist_onUpdate_settimeout",[_135]);
stproxy.invoke("stproxy.watchlist.onUpdate",[_135]);
},50);
}
},add:function(_136,_137,_138){
stproxy.invoke("stproxy.watchlist.add",[_136],_137,_138);
},addGroup:function(_139,_13a,_13b){
stproxy.invoke("stproxy.watchlist.addGroup",[_139],_13a,_13b);
},removeGroup:function(_13c,_13d,_13e){
stproxy.invoke("stproxy.watchlist.removeGroup",[_13c],_13d,_13e);
},add_Ext:function(_13f,_140,_141){
stproxy.invoke("stproxy.watchlist.add_Ext",[_13f],_140,_141);
},remove:function(_142,_143,_144){
stproxy.invoke("stproxy.watchlist.remove",[_142],_143,_144);
},getStatus:function(_145,_146,_147){
stproxy.invoke("stproxy.watchlist.getStatus",[_145],_146,_147);
},clear:function(_148,_149){
stproxy.invoke("stproxy.watchlist.clear",[],_148,_149);
},suspend:function(_14a,_14b){
stproxy.invoke("stproxy.watchlist.suspend",[],_14a,_14b);
},resume:function(_14c,_14d){
stproxy.invoke("stproxy.watchlist.resume",[],_14c,_14d);
}};
stproxy.conf={set:function(_14e,_14f){
if(_14e){
stproxy.isWebAv=true;
}else{
stproxy.isWebAv=false;
}
stproxy.invoke("stproxy.conf.set",[_14e,_14f]);
},setMeetingStartedFlag:function(_150){
stproxy.invoke("stproxy.broadcast.setMeetingStartedFlag",[_150]);
},onSetCallStartedFlag:function(_151){
stproxy.av.isMeetingAVStarted=_151;
},init:function(_152,_153,_154){
stproxy.invoke("stproxy.conf.init",[_152],_153,_154);
},config:function(_155,_156,_157,_158,_159,_15a){
stproxy.invoke("stproxy.conf.config",[_155,_156,_157,_158],_159,_15a);
},properties:function(_15b,_15c,_15d,_15e){
stproxy.invoke("stproxy.conf.properties",[_15b,_15c],_15d,_15e);
},monitor:function(_15f,_160,_161,_162,_163,_164,_165,_166){
stproxy.invoke("stproxy.conf.monitor",[_15f,_160,_161,_162,_163,_164],_165,_166);
},start:function(_167,_168,_169,_16a,_16b,_16c,_16d,_16e,_16f,_170){
stproxy.invoke("stproxy.conf.start",[_167,_168,_169,_16a,_16b,_16c,_16d,_16e],_16f,_170);
},join:function(_171,_172,_173,_174,_175,_176){
stproxy.invoke("stproxy.conf.join",[_171,_172,_173,_174],_175,_176);
},leave:function(_177,_178,_179,_17a){
stproxy.invoke("stproxy.conf.leave",[_177,_178],_179,_17a);
},endcall:function(_17b,_17c,_17d,_17e,_17f){
stproxy.invoke("stproxy.conf.endcall",[_17b,_17c,_17d],_17e,_17f);
},setConfProp:function(_180,_181,_182,_183,_184,_185){
stproxy.invoke("stproxy.conf.setConfProp",[_180,_181,_182,_183],_184,_185);
},dial:function(_186,_187,_188,_189,_18a,_18b){
stproxy.invoke("stproxy.conf.dial",[_186,_187,_188,_189],_18a,_18b);
},invite:function(_18c,_18d,_18e,_18f,_190){
stproxy.invoke("stproxy.conf.invite",[_18c,_18d,_18e],_18f,_190);
},add:function(_191,_192,_193,_194){
stproxy.invoke("stproxy.conf.add",[_191,_192],_193,_194);
},associate:function(_195,_196,_197,_198){
stproxy.invoke("stproxy.conf.associate",[_195,_196],_197,_198);
},rename:function(_199,_19a,_19b,_19c){
stproxy.invoke("stproxy.conf.rename",[_199,_19a],_19b,_19c);
},hangup:function(_19d,_19e,_19f,_1a0,_1a1){
stproxy.invoke("stproxy.conf.hangup",[_19d,_19e,_19f],_1a0,_1a1);
},setUserProp:function(_1a2,_1a3,_1a4,_1a5,_1a6,_1a7,_1a8,_1a9){
stproxy.invoke("stproxy.conf.setUserProp",[_1a2,_1a3,_1a4,_1a5,_1a6,_1a7],_1a8,_1a9);
},onCallPropertyChange:function(_1aa,_1ab){
},onCallStarted:function(_1ac){
},onCallTerminated:function(_1ad,_1ae){
},onCallLocked:function(_1af){
},onCallUnlocked:function(_1b0){
},onCallAutoMuted:function(_1b1){
},onCallAutoUnmuted:function(_1b2){
},onCallMuted:function(_1b3){
},onCallUnmuted:function(_1b4){
},onCallMuteLocked:function(_1b5){
},onCallUnmuteUnlocked:function(_1b6){
},onActionCallEnded:function(_1b7){
},onActionCallStarted:function(_1b8){
},onUserUnmuteRequest:function(_1b9,_1ba,_1bb){
},onUserMuteUnlocked:function(_1bc,_1bd){
},onUserMuteLocked:function(_1be,_1bf){
},onUserDisconnected:function(_1c0,_1c1,_1c2,_1c3,_1c4,_1c5){
},onUserConnecting:function(_1c6,_1c7,_1c8){
},onUserConnected:function(_1c9,_1ca,_1cb,_1cc){
},onUserBeginTalking:function(_1cd,_1ce,_1cf){
},onUserEndTalking:function(_1d0,_1d1,_1d2){
},onUserMuted:function(_1d3,_1d4,_1d5){
},onUserUnmuted:function(_1d6,_1d7,_1d8){
},onUserMutedByMod:function(_1d9,_1da,_1db){
},onUserUnmutedByMod:function(_1dc,_1dd,_1de){
},onUserPaused:function(_1df,_1e0,_1e1){
},onUserResumed:function(_1e2,_1e3,_1e4){
},onUserAdded:function(_1e5,_1e6,_1e7){
},onModAdded:function(_1e8,_1e9,_1ea,_1eb){
},onUserError:function(_1ec,_1ed,_1ee,_1ef,_1f0){
},onCallAccept:function(_1f1,_1f2,_1f3,_1f4,_1f5,_1f6,_1f7,_1f8,_1f9){
},onCallInviteResponse:function(_1fa,_1fb,_1fc,_1fd){
},onVideoCallRequest:function(_1fe,_1ff,_200,_201){
},onPropChange:function(_202,_203,_204,_205,_206){
},onProviderList:function(_207,_208){
},onProviderProp:function(_209,_20a){
},onVideoRoomList:function(_20b){
},onTurnAuthToken:function(_20c,_20d){
},onNoAnswerResponseSent:function(_20e){
},onSIPRegCompleted:function(){
}};
stproxy.webavver={get:function(_20f,_210,_211){
stproxy.invoke("stproxy.webavver.get",[_20f],_210,_211);
}};
stproxy.chat={_updateOptions:function(_212){
for(var key in _212){
stproxyConfig.chat[key]=_212[key];
}
},onNewChatReceived:function(_213,_214){
},onTypingMessage:function(_215,_216,_217){
},onMessageReceived:function(_218,msg,_219,_21a){
},onNewMessage:function(_21b,msg){
},onOfflineMessageReceived:function(_21c,text,_21d){
},onChatData:function(_21e,_21f){
},onChatOpen:function(_220){
},onChatClose:function(_221){
}};
stproxy.nwaychat={onNewMessage:function(_222,_223,msg){
},onMessageReceived:function(_224,_225,_226,_227){
},onTyping:function(_228,_229,_22a){
},onInvitationReceived:function(_22b,_22c,_22d){
},onInvitationAccepted:function(_22e,_22f){
},onInvitationDeclined:function(_230,_231){
},onUserJoined:function(_232,_233){
},onUserLeft:function(_234,_235){
}};
stproxy.attributes={add:function(_236,_237,_238){
stproxy.invoke("stproxy.attributes.add",[_236],_237,_238);
},remove:function(_239,_23a,_23b){
stproxy.invoke("stproxy.attributes.remove",[_239],_23a,_23b);
},onUpdate:function(_23c,_23d,_23e){
}};
stproxy.quickfind={get:function(_23f,_240,_241){
stproxy.invoke("stproxy.quickfind.get",[_23f],_240,_241);
},getUsers:function(_242,_243,_244){
stproxy.invoke("stproxy.quickfind.getUsers",[_242],_243,_244);
},getGroups:function(_245,_246,_247){
stproxy.invoke("stproxy.quickfind.getGroups",[_245],_246,_247);
}};
stproxy.privacy={get:function(_248,_249){
stproxy.invoke("stproxy.privacy.get",[],_248,_249);
},add:function(ids,_24a,_24b,_24c){
stproxy.invoke("stproxy.privacy.add",[ids,_24a],_24b,_24c);
}};
stproxy.error={onError:function(_24d,_24e){
},onForceLogout:function(_24f,_250){
},commsError:function(_251,_252,_253,_254){
},onNodeDown:function(){
},onNodeUp:function(){
},onCommunityServerDown:function(){
},onServerDown:function(){
},onSessionExpired:function(){
},onApplicationDown:function(){
},onClusterLogin:function(){
},onLoginByTokenError:function(){
}};
stproxy._utilities={_hc:null,isHighContrast:function(){
if(!stproxy.agent.isFF()){
return false;
}
if(stproxy._utilities._hc!==null){
return stproxy._utilities._hc;
}
try{
var body=document.getElementsByTagName("body")[0];
var div=document.createElement("div");
div.setAttribute("id",new Date().getTime());
div.setAttribute("style","border: 1px solid;"+"border-color:blue red;"+"position: absolute;"+"height: 2px;"+"top: -9999px;"+"background-image: url(\"/stwebclient/dojo.blue/sametime/themes/images/blank.gif\")");
body.appendChild(div);
var cs=window.getComputedStyle(div);
var hc=false;
if(cs){
var bi=cs.backgroundImage;
hc=(cs.borderTopColor==cs.borderRightColor)||(bi!=null&&(bi=="none"||bi=="url(invalid-url:)"));
if(hc){
var _255=body.getAttribute("class");
document.body.setAttribute("class",(_255+" dijit_a11y"));
document.body.setAttribute("className",(_255+" dijit_a11y"));
}
}
div.parentNode.removeChild(div);
return (stproxy._utilities._hc=!!hc);
}
catch(e){
}
return (stproxy._utilities._hc=false);
}};
stproxy.call={byId:function(_256,_257,_258,_259){
stproxy.invoke("stproxy.call.byId",[_256,_257],_258,_259);
},byNumber:function(_25a,_25b,_25c,_25d){
stproxy.invoke("stproxy.call.byNumber",[_25a,_25b],_25c,_25d);
}};
stproxy.capability={set:function(_25e,_25f,_260){
stproxy.invoke("stproxy.capability.set",[_25e],_25f,_260);
}};
stproxy.meeting={getRooms:function(_261,_262){
stproxy.invoke("stproxy.meeting.getRooms",[],_261,_262);
},inviteToMeetingRoom:function(_263,_264,url,_265,_266){
stproxy.invoke("stproxy.meeting.inviteToMeetingRoom",[_263,_264,url],_265,_266);
},createInstantMeeting:function(_267,_268,_269,_26a){
stproxy.invoke("stproxy.meeting.createInstantMeeting",[_267,_268],_269,_26a);
},onInvitation:function(_26b){
}};
stproxy.screencapture={upload:function(_26c,_26d,_26e){
stproxy.invoke("stproxy.screencapture.upload",[_26c],_26d,_26e);
},send:function(_26f,_270,_271,_272,_273){
stproxy.invoke("stproxy.screencapture.send",[_26f,_270,_271],_272,_273);
}};
stproxy.filetransfer={getToken:function(_274,_275){
stproxy.invoke("stproxy.filetransfer.getToken",[],_274,_275);
},send:function(_276,_277,_278,_279,_27a){
stproxy.invoke("stproxy.filetransfer.send",[_276,_277,_278],_279,_27a);
},cancel:function(_27b){
stproxy.invoke("stproxy.filetransfer.cancel",[_27b]);
},onUpload:function(_27c,_27d,_27e,_27f){
},onSendError:function(_280,_281,_282,_283,_284){
},onIncoming:function(_285,_286,_287,_288,_289){
},onComplete:function(_28a,_28b,_28c,_28d,_28e){
},onStarted:function(_28f,_290,_291,_292,_293,_294){
},onDeclined:function(_295,_296,_297,_298,_299,_29a,_29b){
},onStopped:function(_29c,_29d,_29e,_29f,_2a0,_2a1){
},onUpdate:function(_2a2,_2a3,_2a4,_2a5,_2a6,_2a7){
}};
stproxy.fileshare={send:function(_2a8,_2a9,_2aa,_2ab,_2ac,_2ad,_2ae){
stproxy.invoke("stproxy.fileshare.send",[_2a8,_2a9,_2aa,_2ab,_2ac],_2ad,_2ae);
},sendXML:function(data,_2af,_2b0){
stproxy.invoke("stproxy.fileshare.sendXML",[data],_2af,_2b0);
},onIncoming:function(_2b1,_2b2,_2b3,_2b4,_2b5){
}};
stproxy.params={get:function(name,_2b6){
stproxy.invoke("stproxy.params.get",[name],_2b6);
},set:function(name,_2b7){
stproxy.invoke("stproxy.params.set",[name,_2b7]);
}};
stproxy.sound={domObject:document.createElement("audio"),files:{"audio/wav":"alert.wav","audio/mpeg":"alert.mp3","audio/ogg":"alert.ogg"},init:function(){
if(stproxy.sound.domObject.canPlayType){
stproxy.sound.domObject.setAttribute("id","stproxy_sound");
stproxy.sound.domObject.setAttribute("preload","auto");
for(var type in this.files){
if(stproxy.sound.domObject.canPlayType(type)&&stproxy.sound.domObject.canPlayType(type)!="no"){
stproxy.sound.domObject.src=stproxyConfig.server+"/stwebclient/"+this.files[type];
break;
}
}
if(stproxy.sound.domObject.src){
document.body.appendChild(stproxy.sound.domObject);
stproxy.hitch.event(stproxy.sound.domObject,"ended",function(){
this.src=this.currentSrc;
this.load();
if(stproxy.agent.isChrome){
try{
this.currentTime=0;
}
catch(e){
}
}
});
}
}
},play:function(){
try{
if(stproxy.sound.domObject){
stproxy.sound.domObject.play();
}
}
catch(error){
}
}};
stproxy.addUnloadHandler=function(func){
};
stproxy.removeFromWatchlist=function(ids){
};
stproxy.getPlugins=function(_2b8){
stproxyConfig.plugins=(stproxyConfig.plugins||{});
if(_2b8){
_2b8(stproxyConfig.plugins);
}
return stproxyConfig.plugins;
};
stproxy.setConnectClient=function(){
if(stproxyConfig.isConnectClient&&(typeof (stproxy.connect)!="undefined")){
stproxy.connect.local.setAvailable();
}
};
stproxy.setUserPolicies=function(_2b9){
stproxy.policies.set(_2b9);
};
stproxy.setGatekeeper=function(_2ba){
stproxy.policies.setGatekeeper(_2ba);
};
stproxy.setServerAttributes=function(_2bb){
stproxy.serverAttributes=_2bb;
};
stproxy.setIsLoggedIn=function(flag){
stproxy.isLoggedIn=flag;
};
stproxy.setDisplayNames=function(_2bc){
if(typeof (_2bc)=="string"){
_2bc=stproxy.json.toJson(_2bc);
}
for(var i in _2bc){
stproxy.displayNames[i]=_2bc[i];
}
};
stproxy.setEmailCNMap=function(sKey,_2bd){
emailCNMapper[sKey]=_2bd;
};
stproxy.setSessionObject=function(_2be){
stproxy.session=_2be;
};
stproxy.responseBuffer={suspend:function(_2bf){
stproxy.invoke("stproxy.responseBuffer.suspend",[],_2bf);
},resume:function(_2c0){
stproxy.invoke("stproxy.responseBuffer.resume",[],_2c0);
}};
stproxy.resolveUser=function(name,_2c1,_2c2,_2c3){
stproxy.console.top("stproxy.resolveUser",[name,_2c3]);
if(!_2c3){
var _2c4=stproxy.resolve.name(name);
if(_2c4){
if(_2c1){
_2c1(_2c4);
}
return _2c4;
}
}
stproxy.invoke("stproxy.resolveUser",[name,_2c3],_2c1,_2c2);
stproxy.console.bottom("stproxy.resolveUser");
};
stproxy.getIconURL=function(_2c5){
var _2c6=stproxy.uiControl.iconPaths;
if((typeof (_2c5)=="undefined")||!_2c5){
return _2c6.iconOffline;
}
if(typeof (_2c5)=="string"){
_2c5=parseInt(_2c5);
}
var _2c7={0:_2c6.iconOffline,1:_2c6.iconAvailable,2:_2c6.iconAway,3:_2c6.iconDnd,4:_2c6.iconAway,5:_2c6.iconInMeeting,6:_2c6.iconAvailableMobile,7:_2c6.iconAwayMobile,8:_2c6.iconDndMobile,10:_2c6.iconInMeetingMobile};
return (_2c7[_2c5]||_2c6.iconOffline);
};
stproxy.verify={av:{isCallInProgress:function(_2c8){
stproxy.invoke("stproxy.verify.av.isCallInProgress",[],_2c8);
}},meetings:{logout:function(_2c9,_2ca,_2cb){
stproxy.invoke("stproxy.verify.meetings.logout",[!!_2cb],function(_2cc,_2cd){
if(!_2cc){
if(_2cd){
stproxy.login._logout(true,_2c9,_2c9);
}else{
if(_2c9){
_2c9();
}
}
return;
}
stproxy.uiControl.dialogs.showConfirm(stproxy.i18nStrings.leaveMeetingDialogText,function(){
stproxy.login._logout(true,_2c9,_2c9);
},function(){
if(_2ca){
_2ca();
}
},"warning",stproxy.i18nStrings.leaveMeetingDialogTitle,stproxy.i18nStrings.leaveMeetingDialogLeaveButtonText,stproxy.i18nStrings.cancelButtonText);
});
}}};
stproxy.preferences={get:function(_2ce,_2cf){
stproxy.invoke("stproxy.preferences.get",[],_2ce,_2cf);
},set:function(_2d0,_2d1,_2d2){
_2d0=stproxy.json.toString(_2d0);
stproxy.invoke("stproxy.preferences.set",[_2d0],_2d1,_2d2);
},getPreference:function(_2d3,_2d4,_2d5){
stproxy.invoke("stproxy.preferences.getPreference",[_2d3],_2d4,_2d5);
}};
function isAllowed(_2d6){
if(stproxy.API_WHITELIST){
if(stproxy.API_WHITELIST[_2d6]){
return true;
}else{
stproxy.console.error("TARGET INVOCATION EXCEPTION!  ADD METHOD TO WHITELIST! ("+_2d6+")");
return false;
}
}else{
return true;
}
};
function com_ibm_sametime_invoke(_2d7,_2d8){
if(isAllowed(_2d8[0])){
com_ibm_sametime_call(_2d8[0],_2d8[1],null);
}
};
function com_ibm_sametime_invokeWithCallback(_2d9,_2da){
if(isAllowed(_2da[0])){
com_ibm_sametime_call(_2da[0],_2da[2],_2da[1]);
}
};
function com_ibm_sametime_mkArray(obj){
if(obj&&typeof obj==="object"){
try{
if(obj.constructor.toString()=="[object Window]"){
return {};
}
}
catch(e){
return obj;
}
if(typeof obj.length==="number"&&!(obj.propertyIsEnumerable("length"))){
for(var k=0;k<obj.length;k++){
obj[k]=com_ibm_sametime_mkArray(obj[k]);
}
return obj;
}else{
var _2db=false;
for(var l in obj){
if(isNaN(l)){
_2db=true;
break;
}
}
if(_2db){
for(var m in obj){
obj[m]=com_ibm_sametime_mkArray(obj[m]);
}
return obj;
}else{
var _2dc=[];
for(var n in obj){
_2dc.push(com_ibm_sametime_mkArray(obj[n]));
}
return _2dc;
}
}
}else{
return obj;
}
};
function com_ibm_sametime_call(_2dd,_2de,sId){
try{
_2de=com_ibm_sametime_mkArray(_2de);
_2de=_2de||[];
var _2df=_2dd.split(".");
if(sId!=null){
_2de.push(function(){
var _2e0=[];
for(var i=0;i<arguments.length;i++){
_2e0.push(arguments[i]);
}
stproxy.myHub.publish("com.ibm.sametime.invokeCallback",[sId,_2e0]);
});
_2de.push(function(){
var _2e1=[];
for(var i=0;i<arguments.length;i++){
_2e1.push(arguments[i]);
}
stproxy.myHub.publish("com.ibm.sametime.invokeErrorCallback",[sId,_2e1]);
});
}
var _2e2=com_ibm_sametime_getFunctionFromParts(window,_2df);
if(_2e2){
_2e2.stproxyApply(window,_2de||[]);
}
}
catch(e){
stproxy.console.error(e);
stproxy.console.log(_2dd);
}
};
function com_ibm_sametime_invokeCallback(_2e3,_2e4){
com_ibm_sametime_callCallback(_2e4[0],stproxy.oMyHubParams.afnCallbacks,_2e4[1]);
};
function com_ibm_sametime_invokeErrorCallback(_2e5,_2e6){
com_ibm_sametime_callCallback(_2e6[0],stproxy.oMyHubParams.afnErrorCallbacks,_2e6[1]);
};
function com_ibm_sametime_callCallback(sId,_2e7,_2e8){
try{
_2e8=com_ibm_sametime_mkArray(_2e8);
var _2e9=_2e7[sId];
if(_2e9!=null){
delete _2e7[sId];
_2e9.stproxyApply(_2e7,_2e8||[]);
}
}
catch(e){
stproxy.console.error(e);
}
};
function com_ibm_sametime_initCallbackMaps(){
var _2ea=stproxy.oMyHubParams={};
_2ea.nAutoGenCbId=0;
_2ea.afnCallbacks={};
_2ea.afnErrorCallbacks={};
return _2ea;
};
function com_ibm_sametime_getFunctionFromParts(_2eb,_2ec){
var _2ed=_2eb||window;
try{
var _2ee=_2ed;
var _2ef;
for(var i in _2ec){
if(_2ee[_2ec[i]]){
_2ee=_2ee[_2ec[i]];
}else{
return null;
}
}
if(_2ee instanceof _2ed.Function){
return _2ee;
}else{
throw "fnInvoke is not a function!";
}
}
catch(e){
stproxy.console.error(e);
stproxy.console.log(_2ee);
}
return null;
};
stproxy.invoke=function stproxy_invoke(_2f0,_2f1,_2f2,_2f3){
_2f1=com_ibm_sametime_mkArray(_2f1);
var _2f4=stproxy.oMyHubParams;
if(!_2f4){
_2f4=com_ibm_sametime_initCallbackMaps();
}
var sId=(_2f2||_2f3)?(""+_2f4.nAutoGenCbId++):null;
if(_2f2){
_2f4.afnCallbacks[sId]=_2f2;
}
if(_2f3){
_2f4.afnErrorCallbacks[sId]=_2f3;
}
if(sId){
stproxy.myHub.publish("com.ibm.sametime.invokeWithCallback",[_2f0,sId,_2f1]);
}else{
stproxy.myHub.publish("com.ibm.sametime.invoke",[_2f0,_2f1]);
}
};
if(!window.stproxy_xd_comms_loaded){
window.stproxy_xd_comms_loaded=true;
if(!window.isiPhone){
window.isiPhone=false;
}
if(!window.isDevelopment){
window.isDevelopment=false;
}
if(!window.isDebug){
window.isDebug=false;
}
if(!window.isCustomLang){
window.isCustomLang=stproxy.customLang?true:false;
}
if(!window.lang){
window.lang=(stproxy.customLang||"");
}
if(!window.stproxyConfig){
var stproxyConfig={};
}
if(typeof (stproxyConfig.isConnectClient)=="undefined"){
stproxyConfig.isConnectClient=true;
}
if(!stproxyConfig.server){
stproxyConfig.server=window.location.protocol+"//"+window.location.host;
}
(function(){
stproxy.geti18nStrings=function(_2f5){
_2f5(stproxy.json.toString(stproxy.i18nStrings));
};
stproxy.onClientConnected=function(){
var _2f6=function(){
stproxy.console.log("connected.");
if(stproxy.funcs){
for(var i=0;i<stproxy.funcs.length;i++){
try{
stproxy.funcs[i]();
}
catch(e){
stproxy.console.error(e);
}
}
delete stproxy.funcs;
}
stproxy.addOnLoad=function(func){
try{
func();
}
catch(e){
stproxy.console.error(e);
}
};
};
stproxy.invoke("stproxy.cookie.isEnabled",[],function(_2f7){
if(_2f7){
_2f6();
}else{
var _2f8="190px";
var _2f9="460px";
var _2fa=stproxyConfig.server+"/stwebclient/enableChat.jsp?ver=ST30.14_ProxyServer20141121-0138";
if(stproxy.customLang){
_2fa+=("&lang="+stproxy.customLang);
}
var win=window.open(_2fa,"stproxy_enable_chat","personalbar=no,status=0,toolbar=no,location=no,menubar=no,directories=no,resizable=1,scrollbars=yes,height="+_2f8+",width="+_2f9);
if(win){
win.focus();
var _2fb=setInterval(function(){
if(win.closed){
clearInterval(_2fb);
_2f6();
}
},500);
}
}
});
};
stproxy.funcs=[];
stproxy.addOnLoad=function(func,_2fc){
if(true===_2fc){
this.funcs.splice(0,0,func);
}else{
this.funcs.push(func);
}
};
stproxy.addOnLoad(function(){
stproxy.sound.init();
});
stproxy.addOnLoad(function(){
var _2fd=function(resp){
if(resp){
stproxy.communityFQDN.set(resp.communityRef||false);
}
if(stproxyConfig.isConnectClient){
var e=document.createElement("script");
e.src=stproxyConfig.server+"/stbaseapi/connect.js?ver=ST30.14_ProxyServer20141121-0138";
e.type="text/javascript";
document.getElementsByTagName("head")[0].appendChild(e);
}
};
stproxy.communityFQDN.get(_2fd,_2fd);
});
stproxy.uiControl={_isRenderLight:function(){
return false;
},preferences:{store:{},BRING_CHAT_WINDOW_TO_FRONT:"BRING_CHAT_WINDOW_TO_FRONT"},loadInitFuncs:[],addOnLoad:function(func){
stproxy.uiControl.loadInitFuncs.push(func);
},iconPaths:{avatars:{server:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST9_servermessage-large.png"},blank:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/blank.gif",ibmLogo:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ibmLogo.png",sametimeLogo:stproxyConfig.server+"/stwebclient/dojo.blue/"+(window.dojo&&dojo.isIE<=6?"sametime/themes/images/lotusBannerIE6.gif":"sametime/themes/images/lotusBanner.png"),loginAnimGif:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ajax-loader-3.gif",sametimeTitle:stproxyConfig.server+"/stwebclient/dojo.blue/"+(window.dojo&&dojo.isIE<=6?"sametime/themes/images/STLogo_24pt.gif":"sametime/themes/images/sametimeTitle.png"),iconAvailable:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST_Awns_Avail_03.png",iconAway:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST_Awns_Away_03.png",iconDnd:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST_Awns_DND_03.png",iconInMeeting:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST_Awns_InAMtng_03.png",selectionImgURL:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/menuSelectArrow.png",horizSelectionImgURL:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/menuSelectArrowHoriz.png",inviteImgURL:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/invite.png",groupChatIndicator:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST9_group_chat_indicator.png",loadingSpinner16:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/loadingAnimation16.gif",menuIcon:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST_hamburger.png",menuIconDark:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST_hamburger_web.png",menuIconHC:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST_hamburger_HC.png",groupExpandIcon:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST_group_close.png",groupCloseIcon:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST_group_expand.png",collectorRemoveIcon:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST9_close.png",closeChatModel:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST9_close.png",closeChatModelHover:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST9_close-on-hover.png",helpIcon:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/"+((stproxy.customLang&&(stproxy.customLang.indexOf("ar")==0))?"Help12_rtl.png":"Help12.png"),quickFindIcon:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/glass.png",gearContactIcon:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST9_gear.png",menuCheckmark12:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/menuCheckmark12.png",noPhoto:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/noPhoto.png",businessCardClose:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/Close14.png",isTyping:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST9_typing.png",chatMenuIcon:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST_chat.png",chatInviteMenuIcon:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST9_add_to_chat.png",callMenuIcon:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST_call.png",videoMenuIcon:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST_video_call.png",callMenuIconNoPlugin:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST_call_np.png",videoMenuIconNoPlugin:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST_video_call_np.png",meetingMenuIcon:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST_meeting.png",announceMenuIcon:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST_announce.png",mailMenuIcon:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST9_mail_hover.png",refreshMenuIcon:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST9_shelf_refresh.png",addContactMenuIcon:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST9_add_contact.png",manageRoomsMenuIcon:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST9_manage_meetings_gear.png",bodyPluginContactsActive:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST_left_contacts_active.png",bodyPluginContactsInactive:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST_left_contacts_inactive.png",bodyPluginMeetingsActive:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST_left_meetings_active.png",bodyPluginMeetingsInactive:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST_left_meetings_inactive.png",arrowMeetingRoomItemCollapsed:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST9_overflow_chevron.png",arrowMeetingRoomItemExpanded:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST9_overflow_chevron_up.png",dropDownArrow:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST9_open_03.png",profilesBlue16:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ProfilesBlue16.png",profilesGray16:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ProfilesGray16.png",filesBlue16:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/FilesBlue16.png",filesGray16:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/FilesGray16.png",iconAvailableMobile:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST_Awns_Active_Mobile_03_03.png",iconAwayMobile:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST_Awns_Away_Mobile_03_03.png",iconDndMobile:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST_Awns_DND_Mobile_03_03.png",iconInMeetingMobile:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST_Awns_InAMtng_Mobile_03_03.png",iconOffline:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/iconOffline.gif",iconExternalOffline:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST9_externaluser_offline_16x16.png",iconExternalAvailable:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST9_externaluser_available_16x16.png",iconExternalAway:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST9_externaluser_away_16x16.png",iconExternalDnd:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST9_externaluser_dnd_16x16.png",iconExternalMeeting:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/ST9_externaluser_inamtg_16x16.png",iconYahooAvailable:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/Yahoo_Online.gif",iconYahooAway:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/Yahoo_Online.gif",iconYahooDnd:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/Yahoo_Online.gif",iconYahooInMeeting:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/Yahoo_Online.gif",iconYahooOffline:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/Yahoo_Offline.gif",iconAOLAvailable:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/AOL_Online.gif",iconAOLAway:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/AOL_Online.gif",iconAOLDnd:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/AOL_Online.gif",iconAOLInMeeting:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/AOL_Online.gif",iconAOLOffline:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/AOL_Offline.gif",iconGTalkAvailable:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/Google_Online.gif",iconGTalkAway:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/Google_Online.gif",iconGTalkDnd:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/Google_Online.gif",iconGTalkInMeeting:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/Google_Online.gif",iconGTalkOffline:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/Google_Offline.gif",iconDefaultAvailable:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/Comm_Server_Available.gif",iconDefaultAway:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/Comm_Server_Away.gif",iconDefaultDnd:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/Comm_Server_DND.gif",iconDefaultInMeeting:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/Comm_Server_Meeting.gif",iconDefaultOffline:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/CommServer_Offline.gif",iconTelephonyBlank:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/blank.gif",iconTelephonyBusy:stproxyConfig.server+"/stwebclient/dojo.blue/sametime/themes/images/PhoneBusy.png"},confirmLogout:function(_2fe,_2ff,_300){
stproxy.login._logout(_2fe,_2ff,_300);
}};
stproxy.addOnLoad(function(){
var _301=function(e){
if(e.keyCode==27){
stproxy.invoke("stproxy.setEscapeKey",[]);
}
};
if(document.attachEvent){
document.attachEvent("keypress",_301);
}else{
if(document.addEventListener){
document.addEventListener("keypress",_301,false);
}
}
});
var _302=function(){
var _303;
var _304;
var _305={_ids:{},subs:{"com.ibm.sametime.invoke":com_ibm_sametime_invoke,"com.ibm.sametime.invokeWithCallback":com_ibm_sametime_invokeWithCallback,"com.ibm.sametime.invokeCallback":com_ibm_sametime_invokeCallback,"com.ibm.sametime.invokeErrorCallback":com_ibm_sametime_invokeErrorCallback}};
var _306=function(_307,_308){
stproxy.console.log("handleSecurity: "+_308);
for(var sub in _305._ids){
stproxy.myHub.unsubscribe(sub);
}
_305._ids={};
_304.remove();
_303.parentNode.removeChild(_303);
delete stproxy.myHub;
stproxy.initHubManager=stproxy.initHubManager();
};
stproxy.myHub=new OpenAjax.hub.ManagedHub({onPublish:function(_309,data,_30a,_30b){
if(_30a==_30b){
return false;
}else{
return true;
}
},onSubscribe:function(_30c,_30d){
return true;
},onUnsubscribe:function(_30e,_30f){
return true;
},onSecurityAlert:function(_310,_311){
}});
for(var sub in _305.subs){
_305._ids[stproxy.myHub.subscribe(sub,_305.subs[sub])]=true;
}
_303=document.createElement("div");
_303.style.display="none";
document.getElementsByTagName("body")[0].appendChild(_303);
_304=new OpenAjax.hub.IframeContainer(stproxy.myHub,"stiframeproxy",{nonGadget:"true",Container:{onSecurityAlert:_306,onConnect:function(_312){
},onDisconnect:function(_313){
}},IframeContainer:{parent:_303,iframeAttrs:{style:{display:"none"}},timeout:60000,uri:stproxyConfig.server+"/stbaseapi/hubClient.jsp"+("?ver=ST30.14_ProxyServer20141121-0138&lang="+stproxy.customLang+"&isConnectClient="+!!stproxyConfig.isConnectClient)+(isDevelopment?"&isDevelopment=true":"")+(isDebug?"&isDebug=true":""),tunnelURI:(typeof (stproxyConfig.tunnelURI)!="undefined"?stproxyConfig.tunnelURI:stproxyConfig.server+"/stbaseapi/OpenAjaxHub/release/all/rpc_relay.html"),clientRelay:stproxyConfig.server+"/stbaseapi/OpenAjaxHub/release/all/rpc_relay.html"}});
return this;
};
stproxy.initHubManager=_302;
var body=null;
try{
body=document.getElementsByTagName("body")[0];
}
catch(e){
stproxy.console.error(e);
}
if(typeof (body)=="undefined"||body==null){
var _314=window.onload;
window.onload=function(){
if(_314){
_314();
}
_302();
};
}else{
_302();
}
})();
}
if(!window.stproxy_mvc_implementation){
window.stproxy_mvc_implementation=true;
stproxy.chatModelStubs={};
stproxy.AVModelStubs={};
function com_ibm_sametime_chatModel(_315,args){
args=(args||{});
this.userId=_315;
this.is1to1Chat=true;
for(var arg in args){
this[arg]=args[arg];
}
this.isEmbedded=(args.isEmbedded||args.isEmbeded||false);
this.isAnonymous=stproxy.guestStore.contains(_315);
};
function com_ibm_sametime_AVModel(_316,_317,args){
args=(args||{});
this.callId=_316;
if(_317==undefined||_317==""){
this.loginId=(stproxy.session.USERNAME||stproxy.uiControl.loginPerson.id);
}else{
this.loginId=_317;
}
this.isAnonymous=false;
for(var arg in args){
this[arg]=args[arg];
}
if(!this.isCommunityCall&&this.userIds){
if(typeof this.userIds=="string"){
this.numInvitees=1;
}else{
this.numInvitees=this.userIds.length+1;
}
if(this.isIncoming){
this.isModerator=false;
}else{
this.isModerator=true;
}
if(this.numInvitees==1||this.numInvitees==2){
this.is1to1=true;
}else{
this.is1to1=false;
}
}
if(!this.lang){
this.lang="en";
}
_this=this;
};
com_ibm_sametime_chatModel.prototype.connect=function(){
stproxy.invoke("stproxy.connectChat",[this.userId]);
};
com_ibm_sametime_AVModel.prototype.connect=function(){
stproxy.invoke("stproxy.connectAV",[this.callId]);
};
com_ibm_sametime_chatModel.prototype.onEvent=function(_318,_319,_31a){
var _31b=stproxy.chatModelStubs[_318];
if(_31b[_319]){
_31b[_319].stproxyApply(_31b,_31a);
}else{
stproxy.console.log("There no event for this chatModel["+_318+"]:"+_319);
}
};
com_ibm_sametime_AVModel.prototype.onEvent=function(_31c,_31d,_31e){
var _31f=stproxy.AVModelStubs[_31c];
if(_31f[_31d]){
_31f[_31d].stproxyApply(_31f,_31e);
}else{
stproxy.console.log("There no event for this AVModel["+_31c+"]:"+_31d);
}
};
com_ibm_sametime_chatModel.prototype.onAnnouncement=function(_320,_321){
};
com_ibm_sametime_chatModel.prototype.onClose=function(){
};
com_ibm_sametime_chatModel.prototype.onConvertToNway=function(_322){
};
com_ibm_sametime_chatModel.prototype.onIncomingFileShare=function(_323,_324,_325,_326,_327){
};
com_ibm_sametime_chatModel.prototype.onIncomingFileTransfer=function(_328,_329,_32a,_32b,_32c,_32d,_32e){
};
com_ibm_sametime_chatModel.prototype.onFocus=function(_32f){
};
com_ibm_sametime_chatModel.prototype.onInviteUsersError=function(_330,_331){
};
com_ibm_sametime_chatModel.prototype.onMeetingInvitation=function(_332,url){
};
com_ibm_sametime_chatModel.prototype.onMessage=function(_333){
};
com_ibm_sametime_chatModel.prototype.onOpenError=function(code,_334){
};
com_ibm_sametime_chatModel.prototype.onPartnerActive=function(){
};
com_ibm_sametime_chatModel.prototype.onPartnerNotActive=function(){
};
com_ibm_sametime_chatModel.prototype.onRichTextData=function(_335){
};
com_ibm_sametime_chatModel.prototype.onSendMessage=function(_336){
};
com_ibm_sametime_chatModel.prototype.onChatClosed=function(_337){
};
com_ibm_sametime_chatModel.prototype.onSendMessageError=function(code,_338){
};
com_ibm_sametime_chatModel.prototype.onShutDown=function(){
this.close();
};
com_ibm_sametime_AVModel.prototype.close=function(){
if(stproxy.AVModelStubs[this.callId]){
stproxy.invoke("stproxy.closeAV",[this.callId]);
}
stproxy.closeAV(this.callId);
};
com_ibm_sametime_AVModel.prototype.open=function(){
stproxy.invoke("stproxy.openAVModel",[this.callId]);
};
com_ibm_sametime_AVModel.prototype.onFocus=function(_339){
};
com_ibm_sametime_AVModel.prototype.onShutDown=function(){
this.close();
};
com_ibm_sametime_AVModel.prototype.onClose=function(){
};
com_ibm_sametime_AVModel.prototype.monitorPlace=function(lang,_33a,_33b,_33c){
stproxy.confctrl.monitorPlace(this.callId,this.userId,lang,_33a,_33b,_33c);
};
com_ibm_sametime_AVModel.prototype.joinPlace=function(lang,_33d){
stproxy.confctrl.joinPlace(this.callId,this.userId,lang,_33d);
};
com_ibm_sametime_AVModel.prototype.startCall=function(args){
for(var arg in args){
this[arg]=args[arg];
}
stproxy.confctrl.startCall();
};
com_ibm_sametime_AVModel.prototype.dialIn=function(){
stproxy.confctrl.dial(this.callId,this.loginId,stproxy.confctrl.getURI());
};
com_ibm_sametime_AVModel.prototype.endCall=function(){
stproxy.confctrl.endCall();
};
com_ibm_sametime_AVModel.prototype.hangupUser=function(_33e){
if(!this.is1to1&&this.loginId!=_33e&&this.isModerator){
stproxy.confctrl.hangupUser(_33e);
}
};
com_ibm_sametime_AVModel.prototype.leaveCall=function(){
stproxy.confctrl.leaveCall();
};
com_ibm_sametime_AVModel.prototype.endCallNative=function(_33f){
stproxy.confctrl.endCallNative(_33f);
};
com_ibm_sametime_AVModel.prototype.lockCall=function(){
stproxy.confctrl.lockCall();
};
com_ibm_sametime_AVModel.prototype.unlockCall=function(){
stproxy.confctrl.unlockCall();
};
com_ibm_sametime_AVModel.prototype.muteAll=function(){
stproxy.confctrl.muteAll();
};
com_ibm_sametime_AVModel.prototype.unMuteAll=function(){
stproxy.confctrl.unmuteAll();
};
com_ibm_sametime_AVModel.prototype.muteSelf=function(){
stproxy.confctrl.muteMySelf();
};
com_ibm_sametime_AVModel.prototype.unMuteSelf=function(){
stproxy.confctrl.unmuteMySelf();
};
com_ibm_sametime_AVModel.prototype.muteParticipant=function(_340){
stproxy.confctrl.muteParticipant(_340);
};
com_ibm_sametime_AVModel.prototype.unMuteParticipant=function(_341){
stproxy.confctrl.muteParticipant(_341);
};
com_ibm_sametime_AVModel.prototype.inviteUser=function(_342){
stproxy.confctrl.inviteUser(_342);
};
com_ibm_sametime_AVModel.prototype.pauseMyVideo=function(){
stproxy.confctrl.pauseMyVideo();
};
com_ibm_sametime_AVModel.prototype.resumeMyVideo=function(){
stproxy.confctrl.resumeMyVideo();
};
com_ibm_sametime_AVModel.prototype.hideMyVideo=function(){
stproxy.confctrl.hideMyVideo();
};
com_ibm_sametime_AVModel.prototype.showMyVideo=function(){
stproxy.confctrl.showMyVideo();
};
com_ibm_sametime_AVModel.prototype.addVideo=function(){
stproxy.confctrl.addVideo();
};
com_ibm_sametime_AVModel.prototype.removeVideo=function(){
stproxy.confctrl.removeVideo();
};
com_ibm_sametime_AVModel.prototype.startVideo=function(){
stproxy.confctrl.startVideo();
};
com_ibm_sametime_AVModel.prototype.stopVideo=function(){
stproxy.confctrl.stopVideo();
};
com_ibm_sametime_AVModel.prototype.declineStopVideo=function(){
stproxy.confctrl.declineStopVideo();
};
com_ibm_sametime_AVModel.prototype.holdCall=function(){
stproxy.confctrl.holdCall();
};
com_ibm_sametime_AVModel.prototype.resumeCall=function(){
stproxy.confctrl.resumeCall();
};
com_ibm_sametime_AVModel.prototype.getVolumePreference=function(){
stproxy.confctrl.getVolumePreference();
};
com_ibm_sametime_AVModel.prototype.addMyVideo=function(){
stproxy.confctrl.addMyVideo();
};
com_ibm_sametime_AVModel.prototype.playSoundFile=function(_343,loop,_344){
stproxy.confctrl.playSoundFile(_343,loop,_344);
};
com_ibm_sametime_AVModel.prototype.stopPlaySoundFile=function(){
stproxy.confctrl.stopPlaySoundFile();
};
com_ibm_sametime_AVModel.prototype.startMediaStats=function(){
stproxy.confctrl.startMediaStats();
};
com_ibm_sametime_AVModel.prototype.stopMediaStats=function(){
stproxy.confctrl.stopMediaStats();
};
com_ibm_sametime_AVModel.prototype.setDeviceList=function(_345,_346,_347){
};
com_ibm_sametime_AVModel.prototype.getDeviceList=function(){
};
com_ibm_sametime_AVModel.prototype.setMicVolume=function(_348,_349){
};
com_ibm_sametime_AVModel.prototype.getMicVolume=function(_34a){
};
com_ibm_sametime_AVModel.prototype.setSpeakerVolume=function(_34b){
};
com_ibm_sametime_AVModel.prototype.getSpeakerVolume=function(){
};
com_ibm_sametime_AVModel.prototype.onCallPropertyChange=function(_34c,_34d){
};
com_ibm_sametime_AVModel.prototype.onCallStarted=function(_34e){
};
com_ibm_sametime_AVModel.prototype.onCallTerminated=function(_34f,_350){
};
com_ibm_sametime_AVModel.prototype.onCallLocked=function(_351){
};
com_ibm_sametime_AVModel.prototype.onCallUnlocked=function(_352){
};
com_ibm_sametime_AVModel.prototype.onCallMuted=function(_353){
};
com_ibm_sametime_AVModel.prototype.onCallUnmuted=function(_354){
};
com_ibm_sametime_AVModel.prototype.onUserDisconnected=function(_355,_356,_357,_358,_359,_35a){
};
com_ibm_sametime_AVModel.prototype.onUserConnecting=function(_35b,_35c,_35d){
};
com_ibm_sametime_AVModel.prototype.onUserConnected=function(_35e,_35f,_360,_361){
};
com_ibm_sametime_AVModel.prototype.onUserBeginTalking=function(_362,_363,_364){
};
com_ibm_sametime_AVModel.prototype.onUserEndTalking=function(_365,_366,_367){
};
com_ibm_sametime_AVModel.prototype.onUserMuted=function(_368,_369,_36a){
};
com_ibm_sametime_AVModel.prototype.onUserUnmuted=function(_36b,_36c,_36d){
};
com_ibm_sametime_AVModel.prototype.onUserMutedByMod=function(_36e,_36f,_370){
};
com_ibm_sametime_AVModel.prototype.onUserUnmutedByMod=function(_371,_372,_373){
};
com_ibm_sametime_AVModel.prototype.onUserPaused=function(_374,_375,_376){
};
com_ibm_sametime_AVModel.prototype.onUserResumed=function(_377,_378,_379){
};
com_ibm_sametime_AVModel.prototype.onVideoPaused=function(_37a,_37b,_37c){
};
com_ibm_sametime_AVModel.prototype.onVideoResumed=function(_37d,_37e,_37f){
};
com_ibm_sametime_AVModel.prototype.onUserAdded=function(_380,_381,_382){
};
com_ibm_sametime_AVModel.prototype.onModAdded=function(_383,_384,_385,_386){
};
com_ibm_sametime_AVModel.prototype.onUserError=function(_387,_388,_389,_38a,_38b){
};
com_ibm_sametime_AVModel.prototype.onCallAccept=function(_38c,_38d,_38e,_38f,_390,_391,_392){
};
com_ibm_sametime_AVModel.prototype.onCallInviteResponse=function(_393,_394,_395,_396){
};
com_ibm_sametime_AVModel.prototype.onPropChange=function(_397,_398,_399,_39a,_39b){
};
com_ibm_sametime_AVModel.prototype.onWinClose=function(){
};
com_ibm_sametime_AVModel.prototype.onVideoRequest=function(_39c,_39d,_39e,_39f){
};
com_ibm_sametime_AVModel.prototype.onVideoAdded=function(){
};
com_ibm_sametime_AVModel.prototype.onVideoRequested=function(){
};
com_ibm_sametime_AVModel.prototype.onVideoStarted=function(){
};
com_ibm_sametime_AVModel.prototype.onVideoStopped=function(){
};
com_ibm_sametime_AVModel.prototype.onCallHoldCompleted=function(){
};
com_ibm_sametime_AVModel.prototype.onNoResponseTimeout=function(){
};
com_ibm_sametime_AVModel.prototype.onInviteDeclined=function(){
};
com_ibm_sametime_AVModel.prototype.onNoAnswerReceived=function(){
};
com_ibm_sametime_AVModel.prototype.onNoAnswerResponseSent=function(_3a0){
};
com_ibm_sametime_AVModel.prototype.onBusyResponse=function(){
};
com_ibm_sametime_AVModel.prototype.onVideoCallEstablished=function(){
};
com_ibm_sametime_AVModel.prototype.onAudioCallEstablished=function(){
};
com_ibm_sametime_AVModel.prototype.onNativeError=function(err){
};
com_ibm_sametime_AVModel.prototype.onStatisticsUpdate=function(_3a1){
};
com_ibm_sametime_AVModel.prototype.setInviteResponseTimeout=function(_3a2){
stproxy.confctrl.setInviteResponseTimeout(_3a2);
};
com_ibm_sametime_AVModel.prototype.acceptInvitation=function(){
stproxy.confctrl.clearInviteResponseTimeout();
stproxy.confctrl.inviteResponse("none",this.callId,STAVConst.INVITE_ACCEPT_RESPONSE);
if(stproxy.av.isRegistered!=undefined&&stproxy.av.isRegistered!=null){
stproxy.confctrl.startCall();
}else{
}
};
com_ibm_sametime_AVModel.prototype.declineInvitation=function(){
stproxy.confctrl.clearInviteResponseTimeout();
stproxy.confctrl.inviteResponse("none",this.callId,STAVConst.INVITE_DECLINED_RESPONSE);
};
com_ibm_sametime_AVModel.prototype.sendNoAnswerResponse=function(){
stproxy.confctrl.clearInviteResponseTimeout();
stproxy.confctrl.inviteResponse("none",this.callId,STAVConst.INVITE_NOANSWER_RESPONSE);
};
com_ibm_sametime_chatModel.prototype.onTyping=function(_3a3){
};
com_ibm_sametime_chatModel.prototype.close=function(){
if(stproxy.chatModelStubs[this.userId]){
stproxy.invoke("stproxy.closeChat",[this.userId]);
}
stproxy.closeChat(this.userId);
};
com_ibm_sametime_chatModel.prototype.open=function(){
stproxy.invoke("stproxy.openChatModel",[this.userId]);
};
com_ibm_sametime_chatModel.prototype.sendMessage=function(_3a4){
stproxy.sendChatMessage(this.userId,_3a4);
};
com_ibm_sametime_chatModel.prototype.setTyping=function(_3a5){
stproxy.invoke("stproxy.chat.isTyping",[this.userId,_3a5]);
};
com_ibm_sametime_chatModel.prototype.inviteUsers=function(_3a6,_3a7){
stproxy.invoke("stproxy.inviteUsersToChat",[this.userId,_3a6,_3a7]);
};
stproxy.getChatModel=function(_3a8,args){
args=args||{};
_3a8=stproxy.resolve.userId(_3a8);
var _3a9=stproxy.chatModelStubs[_3a8];
if(!_3a9){
_3a9=stproxy.chatModelStubs[_3a8]=new com_ibm_sametime_chatModel(_3a8,args);
stproxy.invoke("stproxy.getChatModel",[_3a8,args],function(){
if(_3a9.isEmbedded){
stproxy.invoke("stproxy.chat.open",[_3a8]);
_3a9.connect();
}
});
}
return _3a9;
};
stproxy.getAVModel=function(_3aa,_3ab,args){
args=args||{};
var _3ac=stproxy.AVModelStubs[_3aa];
if(!_3ac){
_3ac=stproxy.AVModelStubs[_3aa]=new com_ibm_sametime_AVModel(_3aa,_3ab,args);
stproxy.invoke("stproxy.getAVModel",[_3aa,_3ab,args],function(){
if(_3ac.isEmbedded){
_3ac.connect();
}
});
}
if(_3ac){
if(stproxy.confctrl){
stproxy.confctrl.Init(_3ac);
}
}
return _3ac;
};
stproxy.getGroupChatModel=function(_3ad){
var _3ae=stproxy.groupChatModelStubs[_3ad];
if(!_3ae){
_3ae=stproxy.groupChatModelStubs[_3ad]=new com_ibm_sametime_nwayChatModel(_3ad);
}
return _3ae;
};
stproxy.closeChat=function(_3af){
var _3b0=stproxy.chatModelStubs[_3af];
if(_3b0){
delete stproxy.chatModelStubs[_3af];
_3b0.onClose();
}
};
stproxy.closeAV=function(_3b1){
var _3b2=stproxy.AVModelStubs[_3b1];
if(_3b2){
delete stproxy.AVModelStubs[_3b1];
_3b2.onClose();
}
};
stproxy.updateChatModelStub=function(_3b3,_3b4){
_3b3=stproxy.resolve.userId(_3b3);
var _3b5=stproxy.chatModelStubs[_3b3];
if(!_3b5){
_3b5=stproxy.chatModelStubs[_3b3]=new com_ibm_sametime_chatModel(_3b3);
}
for(var i in _3b4){
_3b5[i]=_3b4[i];
}
};
stproxy.updateAVModelStub=function(_3b6,_3b7,_3b8){
var _3b9=stproxy.AVModelStubs[_3b6];
if(!_3b9){
_3b9=stproxy.AVModelStubs[_3b6]=new com_ibm_sametime_AVModel(_3b6,_3b7);
}
for(var i in _3b8){
_3b9[i]=_3b8[i];
}
console.log("mvcIm updateAVModelStub callId=>"+_3b6+" oModel for given callId =>"+_3b9);
};
stproxy.sendChatMessage=function(_3ba,_3bb){
stproxy.invoke("stproxy.sendChatMessage",[_3ba,_3bb]);
};
stproxy.convertChatToGroupChat=function(_3bc,_3bd){
var _3be=stproxy.chatModelStubs[_3bc];
if(_3be){
var _3bf=stproxy.groupChatModelStubs[_3bd];
if(_3bf){
_3be.onConvertToNway(_3bf);
delete stproxy.chatModelStubs[_3bc];
}else{
}
}
};
stproxy.groupChatModelStubs={};
function com_ibm_sametime_nwayChatModel(_3c0,_3c1){
this.placeId=_3c0;
};
com_ibm_sametime_nwayChatModel.prototype.connect=function(){
stproxy.invoke("stproxy.connectGroupChat",[this.placeId]);
};
com_ibm_sametime_nwayChatModel.prototype.onEvent=function(_3c2,_3c3,_3c4){
var _3c5=stproxy.groupChatModelStubs[_3c2];
if(_3c5[_3c3]){
_3c5[_3c3].stproxyApply(_3c5,_3c4);
}else{
stproxy.console.log("There no event for this nwayChatModel["+_3c2+"]:"+_3c3);
}
};
com_ibm_sametime_nwayChatModel.prototype.onInvitationAccepted=function(_3c6){
};
com_ibm_sametime_nwayChatModel.prototype.onInvitationDeclined=function(_3c7){
};
com_ibm_sametime_nwayChatModel.prototype.onOpenError=function(code,_3c8){
};
com_ibm_sametime_nwayChatModel.prototype.onMessage=function(code,_3c9){
};
com_ibm_sametime_nwayChatModel.prototype.onFocus=function(_3ca){
};
com_ibm_sametime_nwayChatModel.prototype.onTyping=function(_3cb,_3cc){
};
com_ibm_sametime_nwayChatModel.prototype.onUserLeft=function(_3cd){
};
com_ibm_sametime_nwayChatModel.prototype.onUserJoined=function(_3ce){
};
com_ibm_sametime_nwayChatModel.prototype.onInviteUsers=function(_3cf){
};
com_ibm_sametime_nwayChatModel.prototype.onSendMessage=function(_3d0){
};
com_ibm_sametime_nwayChatModel.prototype.onSendMessageError=function(_3d1){
};
com_ibm_sametime_nwayChatModel.prototype.onInviteUsersError=function(_3d2,_3d3){
};
com_ibm_sametime_nwayChatModel.prototype.onShutDown=function(){
this.close();
};
com_ibm_sametime_nwayChatModel.prototype.onClose=function(){
};
com_ibm_sametime_nwayChatModel.prototype.inviteUsers=function(_3d4,_3d5){
stproxy.invoke("stproxy.inviteUsersToGroupChat",[this.placeId,_3d4,_3d5]);
};
com_ibm_sametime_nwayChatModel.prototype.setTyping=function(_3d6){
stproxy.invoke("stproxy.nwaychat.setTyping",[this.placeId,_3d6]);
};
com_ibm_sametime_nwayChatModel.prototype.acceptInvitation=function(){
stproxy.invoke("stproxy.nwaychat.acceptInvitation",[this.placeId]);
stproxy.invoke("stproxy.connectGroupChat",[this.placeId]);
};
com_ibm_sametime_nwayChatModel.prototype.declineInvitation=function(){
stproxy.invoke("stproxy.nwaychat.declineInvitation",[this.placeId]);
};
com_ibm_sametime_nwayChatModel.prototype.sendMessage=function(_3d7){
stproxy.invoke("stproxy.sendGroupChatMessage",[this.placeId,_3d7]);
};
com_ibm_sametime_nwayChatModel.prototype.open=function(){
stproxy.invoke("stproxy.openGroupChatModel",[this.placeId]);
};
com_ibm_sametime_nwayChatModel.prototype.close=function(){
if(stproxy.groupChatModelStubs[this.placeId]){
stproxy.invoke("stproxy.closeGroupChat",[this.placeId]);
}
stproxy.closeGroupChat(this.placeId);
};
stproxy.openGroupChat=function(_3d8,_3d9,_3da){
var _3db="stproxy.chat.open";
if(stproxy.isConnectClientAPI(_3db)){
eval("("+stproxy.connect.API_WHITELIST[_3db]+")")(_3d8);
}else{
stproxy.invoke("stproxy.openGroupChat",[_3d8,_3d9],_3da);
}
};
stproxy.closeGroupChat=function(_3dc){
var _3dd=stproxy.groupChatModelStubs[_3dc];
if(_3dd){
delete stproxy.groupChatModelStubs[_3dc];
_3dd.onClose();
}
};
stproxy.updateGroupChatModelStub=function(_3de,_3df){
var _3e0=stproxy.groupChatModelStubs[_3de];
if(!_3e0){
_3e0=stproxy.groupChatModelStubs[_3de]=new com_ibm_sametime_nwayChatModel(_3de);
}
for(var i in _3df){
_3e0[i]=_3df[i];
}
};
stproxy._addNewChatTab=function(_3e1){
stproxy._chatwindow.addOnLoad(function(){
var _3e2=stproxy.getChatModel(_3e1);
if(stproxy.isChatWindow()){
stproxy._onNewChatTab(_3e2);
}else{
stproxy.invoke("stproxy._createChat",[_3e1]);
}
stproxy._chatwindow.bringToFront();
});
};
stproxy._addNewNwayChatTab=function(_3e3){
stproxy._chatwindow.addOnLoad(function(){
var _3e4=stproxy.getGroupChatModel(_3e3);
if(stproxy.isChatWindow()){
stproxy._onNewChatTab(_3e4);
}else{
stproxy.invoke("stproxy._createGroupChat",[_3e3]);
}
stproxy._chatwindow.bringToFront();
});
};
stproxy._onNewChatTab=function(_3e5){
};
stproxy.isChatWindow=function(_3e6){
var _3e7=!!stproxyConfig.isChatWindow;
if(_3e6){
_3e6(_3e7);
}
return _3e7;
};
stproxy._chatwindow={isOpening:false,reference:null,buffer:[],addOnLoad:function(func){
this.buffer.push(func);
if(this.isOpen()){
this.flush();
}
},flush:function(){
while(this.buffer.length>0){
var func=this.buffer.pop();
if(func){
func();
}
}
},connect:function(){
stproxy.invoke("stproxy._chatwindow._connect",[]);
},onConnected:function(){
stproxy._chatwindow.flush();
stproxy._chatwindow.isOpening=false;
},isOpen:function(){
if(stproxy._chatwindow.reference&&!stproxy._chatwindow.reference.closed){
return !stproxy._chatwindow.isOpening;
}else{
stproxy._chatwindow.reset();
return false;
}
},bringToFront:function(_3e8){
if(!stproxy._chatwindow.reference||stproxy._chatwindow.reference.closed){
if(!stproxy._chatwindow.isOpening){
stproxy._chatwindow.reset();
}
return;
}
try{
if(_3e8||(stproxy.windowFocus&&stproxy.windowFocus.isAllowed())){
stproxy._chatwindow.reference.focus();
}
}
catch(e){
stproxy.console.log("[Cannot bring chat window to the front] "+e);
}
},reset:function(){
stproxy._chatwindow.isOpening=false;
stproxy._chatwindow.reference=null;
},init:function(){
if(stproxy.uiControl._uiControl){
return;
}
var key=stproxy.uiControl.preferences.BRING_CHAT_WINDOW_TO_FRONT;
stproxy.preferences.getPreference(key,function(_3e9){
stproxy.uiControl.preferences.store[key]=!!_3e9.BRING_CHAT_WINDOW_TO_FRONT;
});
}};
(function(){
var _3ea=function(){
if(typeof (window.chatAction)=="undefined"){
window.chatAction={};
}
return new Date().getTime();
};
stproxy.addOnLoad(function(){
for(var obj in stproxyConfig){
if(typeof (stproxyConfig[obj])!="object"){
stproxy.params.set(obj,stproxyConfig[obj]);
}
}
var _3eb="560px";
var _3ec="500px";
var _3ed=STAVConst.DEFAULT_2WAYAUDIO_WIDTH+"px";
var _3ee=STAVConst.DEFAULT_2WAYAUDIO_HEIGHT+"px";
var _3ef=STAVConst.DEFAULT_2WAYVIDEO_WIDTH+"px";
var _3f0=STAVConst.DEFAULT_2WAYVIDEO_HEIGHT+"px";
var _3f1="personalbar=no,status=0,toolbar=no,location=no,menubar=no,directories=no,resizable=1,scrollbars=no";
var _3f2="personalbar=no,status=0,toolbar=no,location=no,menubar=no,directories=no,resizable=1,scrollbars=yes,height="+_3ec+",width="+_3eb;
var _3f3=function(obj,_3f4){
var _3f5=new Date().getTime();
obj=(obj||{});
obj.ver="ST30.14_ProxyServer20141121-0138";
obj.server=stproxyConfig.server;
obj.chat=(stproxyConfig.chat||{});
obj.plugins=(stproxyConfig.plugins||{});
obj.noResolve=(stproxyConfig.noResolve||false);
obj.isDevelopment=(isDevelopment||false);
obj.isDebug=(isDebug||false);
if(lang){
obj.lang=lang;
}
var _3f6=stproxy.cookie.base64.encode(encodeURIComponent(stproxy.json.toString(obj)));
stproxy.invoke("stproxy.cookie._setProxyCookie",[_3f5,_3f6],_3f4);
};
stproxy.createChat=function(_3f7){
if(stproxy._chatwindow.isOpening){
stproxy._addNewChatTab(_3f7);
}else{
stproxy._chatwindow.isOpening=true;
_3f3({"userId":_3f7},function(_3f8){
stproxy._chatwindow.reference=window.open(stproxyConfig.server+"/stwebclient/chat.jsp?propId="+_3f8,"",_3f2);
});
}
};
stproxy.createGroupChat=function(_3f9){
if(stproxy._chatwindow.isOpening){
stproxy._addNewNwayChatTab(_3f9);
}else{
stproxy._chatwindow.isOpening=true;
_3f3({"placeId":_3f9},function(_3fa){
stproxy._chatwindow.reference=window.open(stproxyConfig.server+"/stwebclient/chat.jsp?propId="+_3fa,"",_3f2);
});
}
};
stproxy.createAVCall=function(_3fb,_3fc){
var _3fd=stproxy.AVModelStubs[_3fb];
console.log("mvcIm oModel=>"+_3fd+" Opening callPopupTest.jsp");
var _3fe=null;
if(!_3fd.is1to1){
if(_3fd.hasVideo){
_3f0=STAVConst.DEFAULT_NWAYVIDEO_HEIGHT;
}else{
_3ee=STAVConst.DEFAULT_NWAYAUDIO_HEIGHT;
}
}
_3f3({"callId":_3fd.callId},function(_3ff){
_3fd.avWindow=window.open(stproxyConfig.server+"/stwebclient/call.jsp?avPropId="+_3ff,_3fd.callId,_3f1+",height="+((_3fd.hasVideo)?_3f0:_3ee)+",width="+((_3fd.hasVideo)?_3ef:_3ed));
var m=_3fd;
setTimeout(function(){
if(!m.avWindow||(m.avWindow&&m.avWindow.closed)){
m.close();
}
},5000);
});
};
stproxy.conf.onCallAccept=function(_400,_401,_402,_403,_404,_405,_406){
if(_404||_404!=null||stproxyConfig.isAVCallWindow){
return;
}
var args={"hasVideo":(_406==3?true:false),"isIncoming":true,"isAnonymous":false,"callId":_400,"modId":_401,"prodRelVer":_402,"numInvitees":_403,"mtgRoomID":_404,"inviteMsg":_405,"mediaFlag":_406};
console.log("mvcIm stproxy.onCallAccept");
var _407=[stproxy.liveNameModelStubs[(stproxy.session.USERID)]];
var _408=[_407.id];
var _409=[];
_409[0]=_401;
stproxy.openAVCall(_409,args);
};
var _40a=function(arg){
arg=(arg||[]);
return (typeof (arg)=="object")?arg:arg.split(stproxy.DELIMITER);
};
stproxy.createAdder=function(id,_40b){
if(stproxy.uiControl.dialogs){
if(!!_40b){
stproxy.uiControl.dialogs.showAddGroup(id);
}else{
if(stproxy.uiControl.isBuddyListEmpty()){
stproxy.uiControl.dialogs.showError(stproxy.uiControl.i18nStrings.error,stproxy.uiControl.i18nStrings.contactAdderEmptyBuddyList);
}else{
stproxy.uiControl.dialogs.showAddContact(_40a(id));
}
}
}
};
stproxy.createGroupAdder=function(_40c,_40d,_40e){
stproxy.createAdder({"groupId":_40c,"publicGroupId":_40c,"isPublicGroup":!!_40d,"isPublic":!!_40d,"displayName":(_40e||groupdId),"groupName":(_40e||groupdId)},true);
};
stproxy.createAnnouncement=function(_40f){
if(stproxy.uiControl.dialogs){
stproxy.uiControl.dialogs.showSendAnnouncement(_40a(_40f));
}
};
stproxy.createMeeting=function(_410){
if(stproxy.uiControl.dialogs){
stproxy.uiControl.dialogs.showInviteToMeeting(_40a(_410));
}
};
stproxy.createGroupChatInvite=function(_411){
if(stproxy.uiControl.dialogs){
stproxy.uiControl.dialogs.showInviteToChat(_40a(_411));
}
};
});
})();
stproxy.setAllLiveNamesOffline=function(_412,_413){
stproxy.invoke("stproxy.setAllLiveNamesOffline",[_412,_413]);
};
stproxy.liveNameModelStubs={};
function com_ibm_sametime_liveNameModel(_414,_415){
if(_415){
for(var arg in _415){
this[arg]=_415[arg];
}
}
if(emailCNMapper[_414]){
_414=emailCNMapper[_414];
}
this.id=_414;
if(stproxy.isExternalUser(_414)){
this.isExternal=true;
this.displayName=_414.substring(stproxy.EXTERNAL_USER_PREFIX.length);
}else{
this.isExternal=false;
}
if(this.id&&this.displayName){
stproxy.broadcast.setDisplayName(this.id,this.displayName);
}
this.status=stproxy.awareness.OFFLINE;
this.liveNameIndex=_414;
if(stproxy.session.ORGID==_414){
this.liveNameIndex=stproxy.session.USERID;
}
var id=_414;
if(stproxy.isExternalUserId(_414)){
id=stproxy.EXTERNAL_USER_PREFIX+_414.split("::")[1];
}
this.oListeners={};
this.nAutoGenId=0;
};
com_ibm_sametime_liveNameModel.prototype._update=function(_416){
var _417=false;
for(var key in _416){
if(typeof (_416[key])!=="undefined"&&_416[key]!=null){
if(this[key]!=_416[key]){
this[key]=_416[key];
_417=true;
}
}
}
if(_417){
this.onUpdate(this);
}
};
com_ibm_sametime_liveNameModel.prototype.registerForUpdates=function(sId,_418){
if(!sId){
sId="_autogenid_"+this.nAutoGenId++;
}
this.oListeners[sId]=_418;
return sId;
};
com_ibm_sametime_liveNameModel.prototype.unregisterForUpdates=function(sId){
if(this.oListeners[sId]){
delete this.oListeners[sId];
}
this.remove();
};
com_ibm_sametime_liveNameModel.prototype.onUpdate=function(_419){
for(var sId in this.oListeners){
try{
this.oListeners[sId](this);
}
catch(e){
stproxy.console.error(e);
stproxy.error.onError("com_ibm_sametime_liveNameModel.prototype.onUpdate",e);
this.unregisterForUpdates(sId);
}
}
};
com_ibm_sametime_liveNameModel.prototype.remove=function(){
var _41a=stproxy.liveNameModelStubs[this.id]||this;
var _41b=0;
for(var i in _41a.oListeners){
_41b++;
break;
}
for(var sKey in _41a._oAliases){
var _41c=stproxy.liveNameModelStubs[sKey];
if(_41c&&_41c!=_41a){
var _41d=0;
for(var i in _41c.oListeners){
_41d++;
break;
}
if(_41d==0){
delete stproxy.liveNameModelStubs[sKey];
stproxy.invoke("stproxy.removeFromWatchlist",[[_41a.id]]);
}else{
_41b++;
}
}
}
if(_41b==0){
delete stproxy.liveNameModelStubs[_41a.id];
stproxy.invoke("stproxy.removeFromWatchlist",[[_41a.id]]);
}
};
stproxy.UpdateLiveNameModels=function(_41e){
_41e=stproxy.json.toJson(_41e);
for(var _41f in _41e){
var _420=_41e[_41f];
stproxy.UpdateLiveNameModel(_41f,stproxy.json.toString(_420));
}
};
stproxy.UpdateLiveNameModel=function(_421,_422){
_422=stproxy.json.toJson(_422);
var _423=stproxy.liveNameModelStubs;
var _424=[_422.liveNameIndex,_422.resolvedName,_422.displayName,_421];
var sId=_422.id;
for(var i=0;i<_424.length&&!sId;i++){
sId=_424[i];
}
var _425=_423[sId];
for(var i=0;i<_424.length&&!_425;i++){
_425=_423[_424[i]];
}
if(!_425){
return;
}
if(!_423[sId]){
_423[sId]=_425;
delete _423[_425._sKey];
_425._sKey=sId;
}
com_ibm_sametime_liveNameModel.prototype._update.call(_425,_422);
if(!_425._oAliases){
_425._oAliases={};
}
var _426=stproxy.liveNameModelStubs[_425.id];
if(_426&&_426._oAliases){
for(var i in _422){
var _426=stproxy.liveNameModelStubs[_425.id];
if(i=="displayName"||i=="resolvedName"||i=="liveNameIndex"||i=="id"){
_426._oAliases[_422[i]]=true;
}
}
}
for(var _427 in _425._oAliases){
var _428=stproxy.liveNameModelStubs[_427];
if(_428&&_428!=_425){
emailCNMapper[_427]=_425.id;
com_ibm_sametime_liveNameModel.prototype._update.call(_428,_422);
}
}
};
stproxy.getLiveNameModel=function(_429,_42a){
_429=stproxy.resolve.userId(_429);
var _42b=emailCNMapper[_429]||_429;
var _42c=_42b;
if(stproxy.session.ORGID==_429){
_42c=stproxy.session.USERID;
}
var _42d=stproxy.liveNameModelStubs[_42c];
if(!_42d){
_42d=new com_ibm_sametime_liveNameModel(_42c,_42a);
stproxy.liveNameModelStubs[_42c]=_42d;
_42d._sKey=_42c;
stproxy.invoke("stproxy.getLiveNameModel",[_42c,_42a]);
}else{
if(_42d.id){
var _42e=stproxy.liveNameModelStubs[_42d.id];
if(_42e){
_42d=_42e;
}
}
}
return _42d;
};
stproxy.openChat=function(_42f,args){
stproxy.resolveUser(_42f,function(_430){
stproxy._openChat(_430.id,args);
});
};
stproxy._openChat=function(_431,args){
_431=stproxy.resolve.userId(_431);
if(!stproxy._allowOpenChat(_431)){
return;
}
var _432="stproxy.chat.open";
if(stproxy.isConnectClientAPI(_432)){
eval("("+stproxy.connect.API_WHITELIST[_432]+")")(_431);
}else{
stproxy.invoke("stproxy.openChat",[_431,args]);
}
};
stproxy.openAVCall=function(_433,args){
if(args!=undefined){
args["isSTWebInitCalled"]=stproxy.av.isSTWebInitCalled?stproxy.av.isSTWebInitCalled:false;
args["isRegistered"]=stproxy.av.isRegistered?stproxy.av.isRegistered:false;
args["proxySIPURI"]=stproxy.av.getProxySIPURI();
args["webavClientUpdateUrl"]=stproxy.av._serverAttributes.webavClientUpdateUrl?stproxy.av._serverAttributes.webavClientUpdateUrl:stproxyConfig.server+"/stwebav";
}
stproxy.invoke("stproxy.openAVCall",[_433,args]);
console.log("mvcIm openAVCall userId=>"+typeof (_433));
};
stproxy.getDisplayName=function(_434,_435){
stproxy.invoke("stproxy.getDisplayName",[_434],_435);
};
stproxy.disableBeforeUnload=function(){
stproxy.invoke("stproxy.disableBeforeUnload");
};
}
(function(){
if(stproxy.agent.isIE()){
if(typeof String.prototype.trim!=="function"){
String.prototype.trim=function(){
return this.replace(/^\s+|\s+$/g,"");
};
}
}
})();
stproxy.avCommon={isAVInitWindow:function(src){
var cN="avInitWinIframe";
if(src=="stub"){
cN="avInitWinStub";
}
if(cN&&cN!=null){
var _436=stproxy.avCommon.getCookie(cN);
return (_436==window.name);
}else{
console.log("This is NOT avInitWindow");
return false;
}
},getAVInitWindow:function(src){
var _437=null;
var cN="avInitWinIframe";
if(src=="stub"){
cN="avInitWinStub";
}
if(cN&&cN!=null){
var _438=stproxy.avCommon.getCookie(cN);
if(_438&&_438!=null&&_438.length!=0){
_437=window.open("",_438);
if(_437){
if(!_437.stproxy){
_437.close();
_437=null;
}else{
stproxy.avInitWindowRef=_437;
}
}
}
}
console.log("getAVInitWindow - src="+src+" cN="+cN+" retWin="+_437);
return _437;
},getCookie:function(cN){
var v=stproxy.cookie.get(cN);
if(v!=null||v!=undefined){
var t=v.trim();
if(t=="avInitWinStub"||t=="avInitWinIframe"||t=="avInitStatus"||t=="STAVPluginInUse"){
return "";
}
}
return v;
},setCookie:function(cN,_439){
stproxy.cookie.set(cN,_439,{domain:location.hostname.slice(location.hostname.indexOf(".")),path:"/"});
},eraseCookie:function(cN,_43a){
if(!_43a){
document.cookie=cN+"=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT";
}else{
document.cookie=cN+"=;domain="+_43a+";path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT";
}
}};
var STAVConst={SOFTPHONE_PLUGIN_ID:"MFW",SOFTPHONE_PLUGIN_NAME:"stmfwsoftphone",TELEPHPONE_WITH_SIP:"sip",TELEPHPONE_WITHOUT_SIP:"nonsip",SELF_MUTE_AUDIO:0,SELF_UNMUTE_AUDIO:1,SELF_MUTE_VIDEO:2,SELF_UNMUTE_VIDEO:3,PARTICIPANT_MIC_VOICE_LEVEL:4,MUTE_PARTICIPANT:5,UNMUTE_PARTICIPANT:6,SELF_PAUSE:7,SELF_RESUME:8,END_CALL:0,MUTE_ALL:1,UNMUTE_ALL:2,LOCK_CALL:3,UNLOCK_CALL:4,MUTE_ALL_PRESENTATION_MODE:5,UNMUTE_ALL_PRESENTATION_MODE:6,AUDIO_TO_VIDEO:7,VIDEO_TO_AUDIO:8,SAMETIME_AV_PLUGIN_NAME:"IBM Sametime WebPlayer",SAMETIME_AV_PLUGIN_NAME_SQ:"IBM Sametime WebPlayer",SAMETIME_AV_PLUGIN_NAME_SC:"IBM SmartCloud Sametime WebPlayer",SAMETIME_AV_PLUGIN_NAME_SQ_SC:"IBM SmartCloud Sametime WebPlayer",APPLICATION_PUBLIC_PROPERTY_TYPE:"com.ibm.telephony.conferencing.property.ApplicationPublicPropertyType",DEFAULT_DIAL_MODE:"com.ibm.telephony.conferencing.dialmode.Default",PROMPT_DIAL_MODE:"com.ibm.telephony.conferencing.dialmode.Prompt",USER_AUDIOSOURCE_IDENTIFIER:"com.ibm.telephony.conferencing.property.AudioSourceIdentifier",USER_VIDEOSOURCE_IDENTIFIER:"com.ibm.telephony.conferencing.property.VideoSourceIdentifier",VOICE_LEVEL_PROPERTY:"com.ibm.telephony.conferencing.property.VoiceLevel",ROLE_PROPERTY:"com.ibm.telephony.conferencing.property.Role",MODERATOR_USER_ROLE:"com.ibm.telephony.conferencing.property.ModeratorUserRole",PARTICIPANT_USER_ROLE:"com.ibm.telephony.conferencing.property.ParticipantUserRole",PARTICIPANT_SILENCED_PROPERTY:"com.ibm.telephony.conferencing.property.Silenced",PARTICIPANT_UNSILENCED:"com.ibm.telephony.conferencing.property.Muted.Unsilenced",PARTICIPANT_SILENCED:"com.ibm.telephony.conferencing.property.Muted.Silenced",PARTICIPANT_MUTED_PROPERTY:"com.ibm.telephony.conferencing.property.Muted",PARTICIPANT_UNMUTED:"com.ibm.telephony.conferencing.property.Muted.UnMuted",PARTICIPANT_SELF_MUTED:"com.ibm.telephony.conferencing.property.Muted.SelfMuted",PARTICIPANT_PAUSE_PROPERTY:"com.ibm.telephony.conferencing.property.Pause",PARTICIPANT_PAUSED:"com.ibm.telephony.conferencing.property.Pause.Paused",PARTICIPANT_RESUMED:"com.ibm.telephony.conferencing.property.Pause.Resumed",MUTED_VIDEO_PROPERTY:"com.ibm.telephony.conferencing.property.MutedVideo",CALL_MUTED_PROPERTY:"com.ibm.telephony.conferencing.property.Muted",CALL_UNMUTED:"com.ibm.telephony.conferencing.property.Muted.UnMuted",CALL_SILENCED:"com.ibm.telephony.conferencing.Muted.Silenced",CALL_MUTED:"com.ibm.telephony.conferencing.Muted.Muted",CALL_AUTO_MUTE_PROPERTY:"com.ibm.telephony.conferencing.property.AutoMute",CALL_LOCKED_PROPERTY:"com.ibm.telephony.conferencing.property.Locked",CALL_ENDED_PROPERTY:"com.ibm.telephony.conferencing.property.CallEnded",CONFERENCE_PROPERTY_INVITE_INFO:"ConferenceInvitationInfo",MEDIA_CHANGE_PROPERTY:"com.ibm.telephony.conferencing.property.MediaChange",VIDEO_MEDIA:3,AUDIO_MEDIA:1,INVITE_DECLINED:0,INVITE_ACCEPTED:1,INVITE_NO_RESPONSE:2,INVITE_ERROR:3,INVITE_BUSY:6,INVITE_ACCEPT_RESPONSE:"accept",INVITE_DECLINED_RESPONSE:"reject",INVITE_NOANSWER_RESPONSE:"noanswer",INVITE_BUSY_RESPONSE:"busy",DEFAULT_VIDEO_WIDTH:"400px",DEFAULT_VIDEO_HEIGHT:"365px",DEFAULT_TOOLBAR_HEIGHT:"22",DEFAULT_2WAYAUDIO_WIDTH:"410",DEFAULT_2WAYAUDIO_HEIGHT:"310",DEFAULT_2WAYVIDEO_HEIGHT:"335",DEFAULT_2WAYVIDEO_WIDTH:"400",DEFAULT_NWAYAUDIO_HEIGHT:"300",DEFAULT_NWAYAUDIO_WIDTH:"300",DEFAULT_NWAYVIDEO_HEIGHT:"500",DEFAULT_NWAYVIDEO_WIDTH:"500",AUDIO_CALL:1,VIDEO_CALL:3,PLUGIN_STATUS_UNDECIDED:0,PLUGIN_IS_UPTODATE:1,PLUGIN_INSTALL_REQUIRED:2,PLUGIN_UPGRADE_REQUIRED:3,PLUGIN_IN_USE:4,SOFTPHONE_INIT_NOTSTARTED:0,SOFTPHONE_INIT_INPROGRESS:1,SOFTPHONE_INIT_COMPLETED:2,SOFTPHONE_INIT_FAILED:3};
function stproxyAVOnSAMLLoaded(resp){
var t=resp.samlAssertion;
console.log("Response =",resp);
stproxy.av.samlToken=t;
stproxy.av._init();
};
stproxy.av={isConfigCalled:false,avWindowHanldle:null,isRegistered:false,isMeetingAVStarted:false,isConferenceServiceAvailable:false,_serviceProviders:new Array(),_serverAttributes:null,_userPolicies:null,isAnonymous:false,isMainWindow:false,internalServiceProvider:"com.ibm.mediaserver.telephony.conferencing.service.ConferenceService",_defalutProviderId:"com.ibm.mediaserver.telephony.conferencing.service.ConferenceService",loginID:null,samlToken:"",sipUriPrefix_MFW:"WebChatAVClient-",sipUriPrefix_GIPS:"WebAVClient-",appId:"AdhocCall",pluginAttachNode:null,initChild:function(){
if(!stproxy.avCommon.isAVInitWindow("stub")){
stproxy.av.init();
}
},onLogout:function(){
console.log("stproxy.av.onLogout Calling Uninitialize");
if(stproxy.softphone.isInitialized()){
stproxy.softphone.unInit();
stproxy.av.isRegistered=false;
stproxy.av.setBootstrapData("isRegistered",false);
stproxy.av.setMyCapability();
}
},onNativeCallback:function(_43b,resp,_43c){
var _43d=stproxy.avCommon.isAVInitWindow("stub");
var m=stproxy.confctrl.model;
if((!_43d&&m&&m.callId==_43b)||window.name===_43b){
Proxy_OnCallStatusExt(resp,_43c);
}else{
if(_43d){
stproxy.avError.processNativeMainErr(resp);
}
}
},setMeetingStartedFlag:function(_43e){
stproxy.av.isMeetingAVStarted=_43e;
},provision:function(_43f){
console.log("stproxy.av.provision invoking with Id = "+_43f);
stproxy.invoke("stproxy.avCore.provision",[_43f]);
},onUnload:function(){
if(stproxy.avCommon.isAVInitWindow("stub")){
stproxy.avCommon.eraseCookie("avInitStatus",location.hostname.slice(location.hostname.indexOf(".")));
stproxy.av.onLogout();
}else{
if(stproxyConfig.isAVCallWindow&&stproxy.confctrl.model){
stproxy.confctrl.model.close();
}else{
console.log("Model is already Null");
}
}
},init:function(_440){
if(!stproxy.av.isFeatureEnabled("webaudiovideo.onetoonefeature")){
return false;
}
if(!stproxyConfig.isStandAloneWebClient&&!stproxyConfig.isAVCallWindow){
return false;
}
stproxy.av.pluginAttachNode=_440;
stproxy.av.fetchSAMLAssertion();
},fetchSAMLAssertion:function(){
var sc=dojo.create("script");
sc.type="text/javascript";
var b=clientDetect.browser;
var _441="&timeStamp="+new Date().valueOf()+"&"+"userid="+stproxy.session.USERID;
if(b=="Firefox"||b=="Chrome"||b=="Safari"){
sc.onerror=function(){
stproxy.av._init();
};
}else{
if(b=="Explorer"){
sc.onreadystatechange=function(){
if(sc.readyState=="loaded"){
stproxy.av._init();
}
};
}
}
sc.src=window.location.protocol+"//"+window.location.host.replace("webchat","apps")+"/samlproxy?callback=stproxyAVOnSAMLLoaded"+_441;
document.getElementsByTagName("head")[0].appendChild(sc);
},_init:function(){
stproxy.av.isAnonymous=stproxy.login.isAnonymous();
if(stproxy.hasExtension("LotusLive")){
stproxy.av.loginID=stproxy.session.USERID;
}else{
stproxy.person.getUserInfo(stproxy.session.USERID,function(resp){
stproxy.av.loginID=resp.MailAddress?resp.MailAddress:stproxy.session.USERID;
},function(_442,resp){
stproxy.av.loginID=stproxy.session.USERID;
console.log(_442+","+resp);
});
}
stproxy.hitch.connect(stproxy.conf,"onSIPRegCompleted",function(){
stproxy.avCommon.setCookie("avInitStatus","AVInitCompleted");
stproxy.webplayer.getWindowHandle();
stproxy.av.setBootstrapData("avWindowHanldle",stproxy.webplayer.windowHandle);
});
stproxy.hitch.connect(stproxy.login,"onLogout",function(){
if(stproxy.avCommon.isAVInitWindow("stub")){
stproxy.av.onLogout();
stproxy.avCommon.eraseCookie("avInitStatus",location.hostname.slice(location.hostname.indexOf(".")));
}
});
var _443=stproxy.avCommon.getCookie("avInitStatus");
if(window.addEventListener){
window.addEventListener("beforeunload",stproxy.av.onUnload);
}else{
if(window.attachEvent){
window.attachEvent("onunload",stproxy.av.onUnload);
}
}
if(_443&&_443.length&&(_443=="avInitInProgress")){
if(_443=="avInitInProgress"){
stproxy.hitch.connect(stproxy.conf,"onSIPRegCompleted",function(){
stproxy.av.init();
});
console.log("avInit in Progress so skipping Init for now");
return false;
}
}
if(!_443){
if(typeof (MeetingIdSession)!="undefined"||typeof (roomList)!="undefined"){
setTimeout(function(){
if(window.name==""){
window.name="_avInitClientWindow_";
}
stproxy.avCommon.setCookie("avInitWinStub",window.name);
},2000);
}
if(window.name==""){
window.name="_avInitClientWindow_";
}
stproxy.avCommon.setCookie("avInitWinStub",window.name);
}
if(!stproxy.av.isRegistered){
console.log("avInit is either completed or not triggered yet so calling avInit now, Is Registered ="+stproxy.av.isRegistered);
stproxy.webplayer.embed(stproxy.av.pluginAttachNode);
stproxy.conf.set(true);
stproxy.invoke("stproxy.avCore.init");
return true;
}else{
return false;
}
},loadSAML:function(){
stproxy.invoke("stproxy.avCore.loadSAML");
},onLoadSAML:function(saml){
stproxy.av.samlToken=saml;
},unInit:function(){
stproxy.softphone.uninitialize();
},loadServiceProviders:function(){
stproxy.invoke("stproxy.avCore.loadProviderProperties");
},onLoadServiceProvidersData:function(_444){
stproxy.av._serviceProviders=providerProperties;
},loadAVPolicy:function(){
stproxy.invoke("stproxy.avCore.loadAVPolicy");
},onLoadAVPolicy:function(_445){
console.log("avClient onLoadAVPolicy");
stproxy.av._userPolicies=_445;
},loadServerAttributes:function(){
stproxy.invoke("stproxy.avCore.loadServerAttributes");
},onLoadServerAttributes:function(_446){
console.log("avClient onLoadServerAttributes");
stproxy.av._serverAttributes=_446;
},onProviderList:function(_447){
if(stproxy.avCommon.isAVInitWindow("stub")){
console.log("avClient onProviderList");
}
},handleProviderpropForMeeting:function(_448){
if(stproxy.avCommon.isAVInitWindow("stub")){
console.log("avClient onProviderProp");
var _449=_448[0];
for(var _44a in _449){
stproxy.av.loadProviderProperties(_44a,_449[_44a]);
}
if(stproxy.av.isAllCompLoaded){
stproxy.av.onInit();
}
}
},onProviderProp:function(_44b){
if(typeof (MeetingIdSession)!="undefined"||typeof (roomList)!="undefined"){
setTimeout(function(){
stproxy.av.handleProviderpropForMeeting(_44b);
},5000);
}else{
if(stproxy.avCommon.isAVInitWindow("stub")){
console.log("avClient onProviderProp");
var _44c=_44b[0];
for(var _44d in _44c){
stproxy.av.loadProviderProperties(_44d,_44c[_44d]);
}
if(stproxy.av.isAllCompLoaded){
stproxy.av.onInit();
}
}
}
},setCoreProperties:function(id,_44e){
if(stproxy.av._serviceProviders[id]&&stproxy.av._serviceProviders[id].core){
return;
}else{
if(!stproxy.av._serviceProviders[id]){
stproxy.av._serviceProviders[id]={};
}
stproxy.av._serviceProviders[id].core=true;
var _44f=new Object();
for(var i=0;i<_44e.length;i++){
switch(_44e[i].propId){
case "ServiceProviderId":
_44f.ServiceProviderId=_44e[i].propVal;
break;
case "ConferenceServiceName":
_44f.ConferenceServiceName=_44e[i].propVal;
break;
case "TelephoneConferenceEnabled":
_44f.isTelephoneConferenceEnabled=_44e[i].propVal;
break;
case "VideoConferenceEnabled":
_44f.isVideoConferenceEnabled=_44e[i].propVal;
break;
case "SIPConferenceEnabled":
_44f.isSIPConferenceEnabled=_44e[i].propVal;
break;
case "StaticConferenceEnabled":
_44f.StaticConferenceEnabled=_44e[i].propVal;
break;
case "DynamicConferencesEnabled":
_44f.DynamicConferencesEnabled=_44e[i].propVal;
break;
case "MaximumConferenceUsers":
_44f.MaximumConferenceUsers=_44e[i].propVal;
break;
case "MaximumAudioConferenceUsers":
_44f.MaximumAudioConferenceUsers=_44e[i].propVal;
break;
case "MaximumVideoConferenceUsers":
_44f.MaximumVideoConferenceUsers=_44e[i].propVal;
break;
}
}
}
if(id!==null){
stproxy.mixin(stproxy.av._serviceProviders[id],_44f);
}
},setCommonProperties:function(id,_450){
if(stproxy.av._serviceProviders[id]&&stproxy.av._serviceProviders[id].common){
return;
}else{
if(!stproxy.av._serviceProviders[id]){
stproxy.av._serviceProviders[id]={};
}
stproxy.av._serviceProviders[id].common=true;
var _451=new Object();
for(var i=0;i<_450.length;i++){
switch(_450[i].propId){
case "av.sipPRServerHost":
_451.av_sipPRServerHost=_450[i].propVal;
break;
case "TURN_AUTH_TOKEN":
_451.turnAuthToken=_450[i].propVal;
break;
case "av.sipPRServerPort":
_451.av_sipPRServerPort=_450[i].propVal;
break;
case "av.sipPRServerTransportProtocol":
_451.av_sipPRServerTransportProtocol=_450[i].propVal;
break;
case "av.SIPRegistrationExpirationInterval":
_451.av_SIPRegistrationExpirationInterval=_450[i].propVal;
break;
case "sip.proxy.address":
_451.sipProxyAddress=_450[i].propVal;
break;
case "av.enableNATTraversal":
_451.av_enableNATTraversal=_450[i].propVal;
break;
case "av.TurnServerUdpHost":
_451.av_TurnServerUdpHost=_450[i].propVal;
break;
case "av.TurnServerUdpPort":
_451.av_TurnServerUdpPort=_450[i].propVal;
break;
case "av.TurnServerTcpHost":
_451.av_TurnServerTcpHost=_450[i].propVal;
break;
case "av.TurnServerTcpPort":
_451.av_TurnServerTcpPort=_450[i].propVal;
break;
case "av.NATKeepAliveRequestInterval":
_451.av_NATKeepAliveRequestInterval=_450[i].propVal;
break;
case "av.TurnServerAcceptTcp":
_451.av_TurnServerAcceptTcp=_450[i].propVal;
break;
case "av.IceRto":
_451.av_IceRto=_450[i].propVal;
break;
case "av.IceRc":
_451.av_IceRc=_450[i].propVal;
break;
case "av.IceRm":
_451.av_IceRm=_450[i].propVal;
break;
case "av.encryption":
_451.av_encryption=_450[i].propVal;
break;
case "av.audioCodecPreferenceList":
_451.av_audioCodecPreferenceList=_450[i].propVal;
break;
case "av.videoCodecPreferenceList":
_451.av_videoCodecPreferenceList=_450[i].propVal;
break;
case "sip.auth.type":
_451.sipAuthType=_450[i].propVal;
break;
case "av.enableTURNTokenAuth":
_451.av_enableTURNTokenAuth=_450[i].propVal;
break;
case "av.enableTLSCertAutoAccept":
_451.av_enableTLSCertAutoAccept=_450[i].propVal;
break;
case "av.enableHTTPConnect":
_451.av_enableHTTPConnect=_450[i].propVal;
break;
case "av.clientsipPRServerHost":
_451.av_clientsipPRServerHost=_450[i].propVal;
break;
case "av.clientsipPRServerPort":
_451.av_clientsipPRServerPort=_450[i].propVal;
break;
case "av.clientsipPRServerTransportProtocol":
_451.av_clientsipPRServerTransportProtocol=_450[i].propVal;
break;
case "av.enableTURNServerTransportSSL":
_451.av_enableTURNServerTransportSSL=_450[i].propVal;
break;
case "av.MediaTURNNATTraversalEnabled":
_451.av_MediaTURNNATTraversalEnabled=_450[i].propVal;
break;
case "av.MediaTURNTokenAuthEnabled":
_451.av_MediaTURNTokenAuthEnabled=_450[i].propVal;
break;
case "av.MediaTURNNATKeepAliveRequestInterval":
_451.av_MediaTURNNATKeepAliveRequestInterval=_450[i].propVal;
break;
case "av.MediaTURNServerUdpHost":
_451.av_MediaTURNServerUdpHost=_450[i].propVal;
break;
case "av.MediaTURNServerUdpPort":
_451.av_MediaTURNServerUdpPort=_450[i].propVal;
break;
case "av.MediaTURNServerTLSHost":
_451.av_MediaTURNServerTLSHost=_450[i].propVal;
break;
case "av.MediaTURNServerTLSPort":
_451.av_MediaTURNServerTLSPort=_450[i].propVal;
break;
case "av.MediaTURNServerAcceptTcp":
_451.av_MediaTURNServerAcceptTcp=_450[i].propVal;
break;
case "av.MediaTURNServerTcpHost":
_451.av_MediaTURNServerTcpHost=_450[i].propVal;
break;
case "av.MediaTURNServerTcpPort":
_451.av_MediaTURNServerTcpPort=_450[i].propVal;
break;
case "av.MediaTURNIceRto":
_451.av_MediaTURNIceRto=_450[i].propVal;
break;
case "av.MediaTURNIceRc":
_451.av_MediaTURNIceRc=_450[i].propVal;
break;
case "av.MediaTURNIceRm":
_451.av_MediaTURNIceRm=_450[i].propVal;
break;
case "av.MediaTURNServerTransportSSLEnabled":
_451.av_MediaTURNServerTransportSSLEnabled=_450[i].propVal;
break;
}
}
}
if(id!==null){
stproxy.mixin(stproxy.av._serviceProviders[id],_451);
}
},setOptionProperties:function(id,_452){
if(stproxy.av._serviceProviders[id]&&stproxy.av._serviceProviders[id].option){
return;
}else{
if(!stproxy.av._serviceProviders[id]){
stproxy.av._serviceProviders[id]={};
}
stproxy.av._serviceProviders[id].option=true;
var _453=new Object();
for(var i=0;i<_452.length;i++){
switch(_452[i].propId){
case "ClientIdRequired":
_453.ClientIdRequired=_452[i].propVal;
break;
case "ClientIdEnabled":
_453.ClientIdEnabled=_452[i].propVal;
break;
case "ClientIdLabel":
_453.ClientIdLabel=_452[i].propVal;
break;
case "ServiceLocations":
_453.ServiceLocations=_452[i].propVal;
break;
case "ServiceLocationsLabel":
_453.ServiceLocationsLabel=_452[i].propVal;
break;
case "ConferenceOption1Required":
_453.ConferenceOption1Required=_452[i].propVal;
break;
case "ConferenceOption1Enabled":
_453.ConferenceOption1Enabled=_452[i].propVal;
break;
case "OptionLabel1":
_453.OptionLabel1=_452[i].propVal;
break;
case "ConferenceOption2Required":
_453.ConferenceOption2Required=_452[i].propVal;
break;
case "ConferenceOption2Enabled":
_453.ConferenceOption2Enabled=_452[i].propVal;
break;
case "OptionLabel2":
_453.OptionLabel2=_452[i].propVal;
break;
case "ConferenceOption3Required":
_453.ConferenceOption3Required=_452[i].propVal;
break;
case "ConferenceOption3Enabled":
_453.ConferenceOption3Enabled=_452[i].propVal;
break;
case "OptionLabel3":
_453.OptionLabel3=_452[i].propVal;
break;
case "ConferenceOption4Required":
_453.ConferenceOption4Required=_452[i].propVal;
break;
case "ConferenceOption4Enabled":
_453.ConferenceOption4Enabled=_452[i].propVal;
break;
case "OptionLabel4":
_453.OptionLabel4=_452[i].propVal;
break;
case "ClientPasswordRequired":
_453.ClientPasswordRequired=_452[i].propVal;
break;
case "ClientPasswordEnabled":
_453.ClientPasswordEnabled=_452[i].propVal;
break;
case "ClientPasswordLabel":
_453.ClientPasswordLabel=_452[i].propVal;
break;
case "PasscodeLabel":
_453.PasscodeLabel=_452[i].propVal;
break;
}
}
}
if(id!==null){
stproxy.mixin(stproxy.av._serviceProviders[id],_453);
}
},loadProviderProperties:function(_454,_455){
stproxy.av.setCoreProperties(_454,_455);
if(_454==="com.ibm.mediaserver.telephony.conferencing.service.ConferenceService"){
stproxy.av.setCommonProperties(_454,_455);
}
stproxy.av.setOptionProperties(_454,_455);
},isAllCompLoaded:function(){
var _456=0;
var id=stproxy.av._defalutProviderId;
var _457="com.ibm.mediaserver.telephony.conferencing.service.ConferenceService";
if(stproxy.av._serviceProviders[id].core&&stproxy.av._serviceProviders[_457].common){
_456++;
}
if(!_userPolicies){
_456++;
}
if(!_serverAttributes){
_456++;
}
if(!stproxy.av._pluginInfo.webPlayerVersion){
_456++;
}
if(_456==4){
return true;
}else{
return false;
}
},onInit:function(){
console.log("avClient onInit");
stproxy.av.isMainWindow=true;
stproxy.softphone.setMainWindowFlag(true);
stproxy.conf.init([true]);
if(stproxy.av._isWebPlayerRequired()){
if(stproxy.mobile.agent){
stproxy.softphone=stproxy.mobileSoftphone;
stproxy.av.mobile.init();
}else{
stproxy.webplayer.init(stproxy.softphone.getPluginDetails());
}
}else{
console.log("User policy AV policy disabled. Skip download plugin");
}
},onInitNA:function(args){
stproxy.av.getBootstrapData("isRegistered");
stproxy.av.getBootstrapData("avWindowHanldle");
var _458=args[0][0];
for(var _459 in _458){
stproxy.av.loadProviderProperties(_459,_458[_459]);
}
stproxy.av._serverAttributes=args[1];
stproxy.av._userPolicies=args[2];
stproxy.softphone.setAttribute("isSTWebInitCalled",true);
if(stproxy.av._isWebPlayerRequired()){
stproxy.webplayer.init();
if(stproxyConfig.av&&stproxyConfig.av.registerIM){
console.log("IT SEEMS WE ARE SETTING THE registerIm IN THE CHILD WINDOW; IT SHOULD BE SET FROM THE MAIN WINDOW THAT WILL DO THE ACTUAL INIT");
}
}
},getInitWindowHandle:function(_45a){
var _45b=stproxy.av.avWindowHanldle?stproxy.av.avWindowHanldle:null;
console.log("getInitWindowHandle Handle ="+_45b);
return _45b;
},_isWebPlayerRequired:function(){
return (stproxy.av._userPolicies.isAVAllowed&&stproxy.av._userPolicies.isAVAllow_level);
},getBootstrapData:function(_45c){
stproxy.invoke("stproxy.avCore.getBootstrapData",[_45c]);
},onGetBootstrapData:function(data){
console.log("avClient onGetBootstrapData - "+data[0]+",  ="+data[1]);
stproxy.av[data[0]]=data[1];
},setBootstrapData:function(_45d,_45e){
this[_45d]=_45e;
stproxy.invoke("stproxy.avCore.setBootstrapData",[_45d,_45e]);
},setMyCapability:function(){
var voip=true,_45f=false,_460=true,_461=true,_462=true,_463=false,_464="8.5.2";
if(stproxy.av._serverAttributes.isMediaConfigured&&stproxy.av._serverAttributes.isMediaConfigured=="true"&&stproxy.av._userPolicies.isAVAllow_level){
_45f=true;
if(stproxy.av._userPolicies.isAVAllow_level==2){
_463=true;
}
}else{
_45f=false;
_463=false;
_460=false;
console.warn("Audio Video capabiltiy set to false. Please check if media server is up/configured OR user has AV policy.");
}
if(stproxy.softphone.isInitialized()){
_462=true;
}else{
_462=false;
console.warn("SoftPhone is not initialized. Setting capSoftPhone capability to false");
}
var _465="[{'voip':'"+voip+"'},{'audioVideo':'"+_45f+"'},{'voiceChat':'"+_460+"'},{'telephony':'"+_461+"'},{'com.ibm.st.capSoftphone':'"+_462+"'},{'com.ibm.st.capVideoChat':'"+_463+"'},{'com.ibm.st.cap.prodVersion':'"+_464+"'}]";
stproxy.capability.set(_465);
},isFeatureEnabled:function(_466){
if(stproxy.policies.get("webaudiovideo.onetoonefeature")!=null&&stproxy.policies.get("webaudiovideo.onetoonefeature")!=undefined&&stproxy.policies.get("webaudiovideo.onetoonefeature").value=="true"){
return true;
}
return false;
},isMediaConfigured:function(){
var _467=false;
var _468=stproxy.serverAttributes;
for(obj in _468){
if(_468[obj].id=="9062"){
_467=_468[obj].value;
}
}
console.log("avClient isMediaConfigured - "+_467);
return _467;
},isNativeAVPluginReady:function(){
if(stproxy.av&&stproxy.av.isRegistered&&stproxy.softphone&&stproxy.softphone.isInitialized()){
return true;
}
return false;
},isAudioPolicyEnabled:function(){
if(stproxy.av&&stproxy.av._userPolicies&&stproxy.av._userPolicies.isAVAllowed&&(stproxy.av._userPolicies.isAVAllow_level==1||stproxy.av._userPolicies.isAVAllow_level==2)){
return true;
}
return false;
},isAVPolicyEnabled:function(){
if(stproxy.av&&stproxy.av._userPolicies&&stproxy.av._userPolicies.isAVAllowed&&stproxy.av._userPolicies.isAVAllow_level==2){
return true;
}
return false;
},getSoftPhoneStatus:function(){
return (stproxy.softphone.getStatus());
},getPluginStatus:function(){
stproxy.webplayer.checkInstallUpgradeRequirement();
return (stproxy.webplayer.getInstallStatus());
},isUserCapableOfAudio:function(_469,_46a){
var ret=false;
if(_46a.length==1){
if(_469[0].capabilities!=undefined){
var cap=_469[0].capabilities;
if(cap["voiceChat"]&&cap["voiceChat"]=="true"&&cap["com.ibm.st.capSoftphone"]&&cap["com.ibm.st.capSoftphone"]=="true"){
ret=true;
}
}
}else{
var _46b=0;
for(var i in _469){
if(_469[i].capabilities!=undefined){
var cap=_469[i].capabilities;
if(cap["voiceChat"]&&cap["voiceChat"]=="true"&&cap["com.ibm.st.capSoftphone"]&&cap["com.ibm.st.capSoftphone"]=="true"){
_46b++;
}
}
}
ret=(_46b>=Math.floor(_46a.length/2));
}
return ret;
},isUserCapableOfAV:function(_46c,_46d){
var ret=false;
if(_46d.length==1){
if(_46c[0].capabilities!=undefined){
var cap=_46c[0].capabilities;
if(cap["com.ibm.st.capVideoChat"]&&cap["com.ibm.st.capVideoChat"]=="true"&&cap["com.ibm.st.capSoftphone"]&&cap["com.ibm.st.capSoftphone"]=="true"){
ret=true;
}
}
}else{
var _46e=0;
for(var i in _46c){
if(_46c[i].capabilities!=undefined){
var cap=_46c[i].capabilities;
if(cap["com.ibm.st.capVideoChat"]&&cap["com.ibm.st.capVideoChat"]=="true"&&cap["com.ibm.st.capSoftphone"]&&cap["com.ibm.st.capSoftphone"]=="true"){
_46e++;
}
}
}
ret=(_46e>=Math.floor(_46d.length/2));
}
return ret;
},isAudioVideoEnabled:function(_46f,_470){
var ret=false;
if(this.isMediaConfigured()&&this.isNativeAVPluginReady()&&this.isAVPolicyEnabled()){
ret=stproxy.av.isUserCapableOfAV(_46f,_470);
}
return ret;
},isAudioEnabled:function(_471,_472){
var ret=false;
if(this.isMediaConfigured()&&this.isNativeAVPluginReady()&&this.isAudioPolicyEnabled()){
ret=stproxy.av.isUserCapableOfAV(_471,_472);
}
return ret;
},getProxySIPURI:function(){
var _473=stproxy.av.internalServiceProvider;
var _474=stproxy.av._serviceProviders[_473].av_sipPRServerTransportProtocol;
var _475=stproxy.av._serviceProviders[_473].sipProxyAddress;
var _476=stproxy.av._serviceProviders[_473].av_sipPRServerHost;
var _477=stproxy.av._serviceProviders[_473].av_sipPRServerPort;
var sip="";
var _478=null;
if(stproxy.av.isAnonymous){
}else{
var name=encodeURIComponent(stproxy.av.loginID);
if(_474=="TLS"){
_475=_476+":"+_477;
_478="sips:";
}else{
_478="sip:";
}
_478=_478+stproxy.av.sipUriPrefix_MFW+name+"@"+_475;
}
return (_478);
},getStartCallProps:function(_479){
var _47a=5;
var _47b=5;
var _47c=3;
var SPID=stproxy.av._defalutProviderId;
var _47d="",_47e="",_47f="",_480="",_481="",_482="",_483="",_484="";
if(!_479){
_47a=2;
}
var _485="[{'svcloc':'"+_47d+"'},{'passcode':'"+_47e+"'},{'option1':'"+_47f+"'},{'option2':'"+_480+"'},{'option3':'"+_481+"'},{'option4':'"+_482+"'},{'clientid':'"+_483+"'},{'clientpwd':'"+_484+"'},{'mediaflag':'"+_47c+"'},{'expuser':'"+_47a+"'},{'maxuser':'"+_47b+"'},{'svcpid':'"+SPID+"'},{'dialtype':'"+STAVConst.TELEPHPONE_WITH_SIP+"'}]";
return _485;
},getNativeSIPURI:function(){
var name=encodeURIComponent(stproxy.av.loginID);
return stproxy.av.sipUriPrefix_MFW+name;
},getNativeInitParam:function(_486){
var _487=stproxy.av._serverAttributes;
var _488={};
var _489=stproxy.av.internalServiceProvider;
_488.appId=stproxy.av.appId;
_488.NATEnabled=stproxy.av._serviceProviders[_489].av_enableNATTraversal;
if(_488.NATEnabled=="true"){
_488.NATEnabled=true;
}else{
_488.NATEnabled=false;
}
_488.proxyreghost=stproxy.av._serviceProviders[_489].av_sipPRServerHost;
_488.proxyregport=stproxy.av._serviceProviders[_489].av_sipPRServerPort;
_488.SIPTransportProtocol=stproxy.av._serviceProviders[_489].av_sipPRServerTransportProtocol;
_488.TurnServerAcceptTcp=stproxy.av._serviceProviders[_489].av_TurnServerAcceptTcp;
_488.TurnServerUdpHost=stproxy.av._serviceProviders[_489].av_TurnServerUdpHost;
_488.TurnServerUdpPort=stproxy.av._serviceProviders[_489].av_TurnServerUdpPort;
_488.TurnServerTcpHost=stproxy.av._serviceProviders[_489].av_TurnServerTcpHost;
_488.TurnServerTcpPort=stproxy.av._serviceProviders[_489].av_TurnServerTcpPort;
_488.IceRto=stproxy.av._serviceProviders[_489].av_IceRto;
_488.IceRc=stproxy.av._serviceProviders[_489].av_IceRc;
_488.IceRm=stproxy.av._serviceProviders[_489].av_IceRm;
_488.PreferredAudioCodecs=stproxy.av._serviceProviders[_489].av_audioCodecPreferenceList;
_488.PreferredVideoCodecs=stproxy.av._serviceProviders[_489].av_videoCodecPreferenceList;
_488.NATKeepAliveRequestInterval=stproxy.av._serviceProviders[_489].av_NATKeepAliveRequestInterval;
_488.SIPRegistrationExpirationInterval=stproxy.av._serviceProviders[_489].av_SIPRegistrationExpirationInterval;
_488.sipAuthType=stproxy.av._serviceProviders[_489].sipAuthType;
_488.enableTURNTokenAuth=stproxy.av._serviceProviders[_489].av_enableTURNTokenAuth;
_488.enableTLSCertAutoAccept=stproxy.av._serviceProviders[_489].av_enableTLSCertAutoAccept;
_488.enableHTTPConnect=stproxy.av._serviceProviders[_489].av_enableHTTPConnect;
_488.clientsipPRServerHost=stproxy.av._serviceProviders[_489].av_clientsipPRServerHost;
_488.clientsipPRServerPort=stproxy.av._serviceProviders[_489].av_clientsipPRServerPort;
_488.clientsipPRServerTransportProtocol=stproxy.av._serviceProviders[_489].av_clientsipPRServerTransportProtocol;
_488.turnServerTransportSSLEnabled=stproxy.av._serviceProviders[_489].av_enableTURNServerTransportSSL;
_488.mediaTURNNATTraversalEnabled=stproxy.av._serviceProviders[_489].av_MediaTURNNATTraversalEnabled?stproxy.av._serviceProviders[_489].av_MediaTURNNATTraversalEnabled:"";
_488.mediaTURNTokenAuthEnabled=stproxy.av._serviceProviders[_489].av_MediaTURNTokenAuthEnabled?stproxy.av._serviceProviders[_489].av_MediaTURNTokenAuthEnabled:"";
_488.mediaTURNNATKeepAliveRequestInterval=stproxy.av._serviceProviders[_489].av_MediaTURNNATKeepAliveRequestInterval?stproxy.av._serviceProviders[_489].av_MediaTURNNATKeepAliveRequestInterval:"";
_488.mediaTURNServerUdpHost=stproxy.av._serviceProviders[_489].av_MediaTURNServerUdpHost?stproxy.av._serviceProviders[_489].av_MediaTURNServerUdpHost:"";
_488.mediaTURNServerUdpPort=stproxy.av._serviceProviders[_489].av_MediaTURNServerUdpPort?stproxy.av._serviceProviders[_489].av_MediaTURNServerUdpPort:"";
_488.mediaTURNServerTLSHost=stproxy.av._serviceProviders[_489].av_MediaTURNServerTLSHost?stproxy.av._serviceProviders[_489].av_MediaTURNServerTLSHost:"";
_488.mediaTURNServerTLSPort=stproxy.av._serviceProviders[_489].av_MediaTURNServerTLSPort?stproxy.av._serviceProviders[_489].av_MediaTURNServerTLSPort:"";
_488.mediaTURNServerAcceptTcp=stproxy.av._serviceProviders[_489].av_MediaTURNServerAcceptTcp?stproxy.av._serviceProviders[_489].av_MediaTURNServerAcceptTcp:"";
_488.mediaTURNServerTcpHost=stproxy.av._serviceProviders[_489].av_MediaTURNServerTcpHost?stproxy.av._serviceProviders[_489].av_MediaTURNServerTcpHost:"";
_488.mediaTURNServerTcpPort=stproxy.av._serviceProviders[_489].av_MediaTURNServerTcpPort?stproxy.av._serviceProviders[_489].av_MediaTURNServerTcpPort:"";
_488.mediaTURNIceRto=stproxy.av._serviceProviders[_489].av_MediaTURNIceRto?stproxy.av._serviceProviders[_489].av_MediaTURNIceRto:"";
_488.mediaTURNIceRc=stproxy.av._serviceProviders[_489].av_MediaTURNIceRc?stproxy.av._serviceProviders[_489].av_MediaTURNIceRc:"";
_488.mediaTURNIceRm=stproxy.av._serviceProviders[_489].av_MediaTURNIceRm?stproxy.av._serviceProviders[_489].av_MediaTURNIceRm:"";
_488.mediaTURNServerTransportSSLEnabled=stproxy.av._serviceProviders[_489].av_MediaTURNServerTransportSSLEnabled?stproxy.av._serviceProviders[_489].av_MediaTURNServerTransportSSLEnabled:"";
_488.turnAuthToken=stproxy.av._serviceProviders[_489].turnAuthToken?stproxy.av._serviceProviders[_489].turnAuthToken:"";
_488.EncryptionType=_487.EncryptionType;
_488.maxVideoBitRate=_487.maxVideoBitRate;
if(_487.softphonePluginVersion){
_488.softphonePluginVersion=_487.softphonePluginVersion;
}else{
_488.softphonePluginVersion=_486.softphonePluginVersion;
}
stproxy.softphone.setAttribute("_version",_487.softphonePluginVersion);
if(_487.webavClientUpdateUrl){
_488.webavClientUpdateUrl=_487.webavClientUpdateUrl;
}else{
_488.webavClientUpdateUrl=_486.webavClientUpdateUrl;
}
stproxy.webplayer.setAttribute("_webPlayerURL",_487.webavClientUpdateUrl);
if(_487.webPlayerVersion){
_488.webPlayerVersion=_487.webPlayerVersion;
}else{
_488.webPlayerVersion=_486.webPlayerVersion;
}
stproxy.webplayer.setAttribute("_version",_487.webPlayerVersion);
_488.StartingAudioPort=stproxy.av._userPolicies.startingAudioPort;
_488.StartingVideoPort=stproxy.av._userPolicies.startingVideoPort;
if(stproxy.av._userPolicies.maxVideoBitRate){
_488.maxVideoBitRate=stproxy.av._userPolicies.maxVideoBitRate;
}
_488.enableSVC=stproxy.av._userPolicies.enableSVC?stproxy.av._userPolicies.enableSVC:"";
_488.lineRate=stproxy.av._userPolicies.lineRate?stproxy.av._userPolicies.lineRate:"";
_488.enableClientEncryption=stproxy.av._userPolicies.enableClientEncryption?stproxy.av._userPolicies.enableClientEncryption:"";
_488.cutomVideoBitRate=stproxy.av._userPolicies.cutomVideoBitRate?stproxy.av._userPolicies.cutomVideoBitRate:"";
if(stproxy.av.internalServiceProvider===stproxy.av._defalutProviderId){
_488.isInternalServiceProvider=true;
}else{
_488.isInternalServiceProvider=false;
}
_488.isAnonymous=stproxy.av.isAnonymous;
_488.pluginId=STAVConst.SOFTPHONE_PLUGIN_ID;
_488.pluginname=STAVConst.SOFTPHONE_PLUGIN_NAME;
_488.customEnvironment="";
var _48a=document.cookie;
_488.ltpaTokenCookie=stproxy.cookie.get("LtpaToken",_48a);
if(_488.ltpaTokenCookie===undefined||_488.ltpaTokenCookie===""){
_488.ltpaTokenCookie=stproxy.cookie.get("LtpaToken2",_48a);
}
if(_488.PreferredAudioCodecs==""||_488.PreferredAudioCodecs=="undefined"){
_488.PreferredAudioCodecs="ISAC,iLBC,G7221-32000,G7221-24000,G7221-16000,G.711";
}
if(_488.PreferredVideoCodecs==""||_488.PreferredAudioCodecs=="undefined"){
_488.PreferredVideoCodecs="H264,H263";
}
if(_488.SIPTransportProtocol=="TLS"){
_488.sip="sips";
}else{
_488.sip="sip";
}
if(_488.NATKeepAliveRequestInterval==undefined){
_488.NATKeepAliveRequestInterval=-1;
}
if(_488.SIPRegistrationExpirationInterval==undefined){
_488.SIPRegistrationExpirationInterval=-1;
}
if(_488.TurnServerUdpHost==undefined){
_488.TurnServerUdpHost="";
}
if(_488.TurnServerUdpPort==undefined){
_488.TurnServerUdpPort="";
}
if(_488.TurnServerAcceptTcp==undefined){
_488.TurnServerAcceptTcp="";
}
if(_488.TurnServerTcpHost==undefined){
_488.TurnServerTcpHost="";
}
if(_488.TurnServerTcpPort==undefined){
_488.TurnServerTcpPort="";
}
if(_488.IceRto==undefined){
_488.IceRto="";
}
if(_488.IceRc==undefined){
_488.IceRc="";
}
if(_488.IceRm==undefined){
_488.IceRm="";
}
if(stproxy.hasExtension("LotusLive")&&stproxy.av.isFeatureEnabled("webaudiovideo.onetoonefeature")){
_488.samlToken=stproxy.av.samlToken;
_488.isSamlToken=true;
}else{
_488.isSamlToken=false;
}
return _488;
},getServerAttrDetails:function(key){
var _48b=stproxy.serverAttributes;
var _48c="";
for(obj in _48b){
if(_48b[obj].id==key){
_48c=_48b[obj].value;
}
}
return _48c;
}};
stproxy.confctrl={model:null,confId:"",isCallEstablished:false,noResponseTimeout:"",isMediaConfigured:null,dialtype:"",isDialedoutUser:false,isInternalServiceProvider:"",isAnonymous:false,updatedAnonId:"",meetingRoomId:"",isModerator:false,loginID:"",URI_type:0,sipURI:"",telURI:"",teluri:"",sip:"",proxyreghost:"",proxyregport:"",sipProxyAddress:"",EncryptionType:"",SIPTransportProtocol:"",StartingAudioPort:"",StartingVideoPort:"",isTelephonyEnabled:false,isAVEnabled:false,isSIPEnabled:false,maxConfUsers:"",maxVConfUsers:"",maxAConfUsers:"",TurnServerUdpHost:"",TurnServerUdpPort:"",TurnServerAcceptTcp:"",TurnServerTcpHost:"",TurnServerTcpPort:"",IceRto:"",IceRc:"",IceRm:"",SIPRegistrationExpirationInterval:-1,NATKeepAliveRequestInterval:-1,PreferredAudioCodecs:"",PreferredVideoCodecs:"",maxVideoBitRate:"CIF 352x288@15fps 384kbps",NATEnabled:false,webPlayerVersion:"",softphonePluginVersion:"",webavClientUpdateUrl:"",AudioRTCPEnabled:false,VideoRTCPEnabled:true,isConferenceInviteSent:false,isLoggedIn:false,isCallStarted:false,isCallLocked:false,isCallRestart:false,callRestartCount:0,isAudioStarted:false,isVideoStarted:false,isPaused:false,isInvited:false,isUnloaded:false,isLargeMeeting:false,isDialFalure:false,isConferenceServiceAvailable:false,providerList:new Array(),nativeSIPURI:"",UNMUTED:0,MUTED:1,muteStatus:0,clientUserId:"",disConnectCount:0,isPluginInstallFailed:false,isRegistrationFailed:false,isCrashedPreviously:false,initialAddresses:new Array(),userIdsWithMod:new Array(),userIdsWOMod:new Array(),AVCallType:"",propId:"",propVal:"",clientVolArray:new Array(),AVPolicy:"",isAVAllow_level:"",isAllowAccessToTParty:"",SPID:"",isAllowsVideo:0,allowMultipointCalls:0,inviteMsg:null,SPProperties:"",SPPropArray:"",SPPropSTArray:"",SametimeAVProp:"",SPPropSize:0,RespId:"",ServerAttrArray:new Array(),confCallBack:function(){
},confErrCallBack:function(){
},Init:function(){
this.model=arguments[0];
stproxy.connectAVCallbacks(this.model);
stproxy.connectAVErrorHandlers(this.model);
},setUserId:function(_48d){
var _48e=new Array();
_48e[0]=_48d;
stproxy.conf.add(_48e,confCallBack,confErrCallBack);
},setUserList:function(_48f){
stproxy.conf.add(_48f,confCallBack,confErrCallBack);
},getWebPlayerVersionCallback:function(res){
stproxy.confctrl.webPlayerVersion=res.WebPlayer;
stproxy.confctrl.softphonePluginVersion=res.Softphone;
if(stproxy.confctrl.isMeetings()){
handleProxyLogin();
}
},getWebPlayerVersionErrcallback:function(){
if(stproxy.confctrl.isMeetings()){
handleProxyLogin();
}
},leavePlace:function(_490){
stproxy.conf.leave(_490,"true");
},joinCall:function(_491,_492,_493,_494,_495,_496,_497){
stproxy.conf.start(_491,_492,_493,_494,_495,"false",_496,_497);
},dial:function(_498,_499,_49a){
stproxy.conf.dial(_498,_499,_49a);
},addParticipant:function(_49b){
stproxy.conf.add(_49b);
},inviteParticipants:function(_49c,_49d){
stproxy.conf.invite(_49c,_49d);
},inviteResponse:function(_49e,_49f,_4a0){
stproxy.conf.invite(_49e,_49f,_4a0);
},endCallProxy:function(_4a1,_4a2){
stproxy.conf.endcall(_4a1,"true",_4a2);
},getProviderproperties:function(_4a3){
var _4a4=false;
this.getRespSPId(_4a3);
if(this.SametimeAVProp!=""){
this.isInternalServiceProvider=true;
this.getConfigAttributes(this.isInternalServiceProvider);
_4a4=true;
}else{
if(this.SametimeAVProp!=""&&this.SPProperties!=""){
this.isInternalServiceProvider=false;
this.getConfigAttributes(this.isInternalServiceProvider);
_4a4=true;
}
}
return _4a4;
},pauseMyVideo:function(){
if(!this.isPaused){
this.isPaused=true;
stproxy.softphone.pauseVideo(this.model.callId);
var _4a5=new Array();
_4a5[0]=this.model.loginId;
this.isDialedoutUser=stproxy.avUserList.isDialoutUser(this.model.loginId);
this.setUserProperty(STAVConst.SELF_MUTE_VIDEO,_4a5,this.isDialedoutUser);
}else{
console.warn("User is already paused");
}
},resumeMyVideo:function(){
if(this.isPaused){
console.log("");
this.isPaused=false;
stproxy.softphone.resumeVideo(this.model.callId);
var _4a6=new Array();
_4a6[0]=this.model.loginId;
this.isDialedoutUser=stproxy.avUserList.isDialoutUser(this.model.loginId);
this.setUserProperty(STAVConst.SELF_UNMUTE_VIDEO,_4a6,this.isDialedoutUser);
}else{
console.warn("User is already paused");
}
},playSoundFile:function(_4a7,loop,_4a8){
stproxy.softphone.playSoundFile(this.model.callId,_4a7,loop,_4a8);
},stopPlaySoundFile:function(){
stproxy.softphone.stopPlaySoundFile(this.model.callId);
},startMediaStats:function(){
stproxy.softphone.startMediaStats(this.model.callId);
},stopMediaStats:function(){
stproxy.softphone.stopMediaStats(this.model.callId);
},hideMyVideo:function(){
stproxy.softphone.hideMyVideo(this.model.callId);
},showMyVideo:function(){
stproxy.softphone.showMyVideo(this.model.callId);
},getVolumePreference:function(){
stproxy.softphone.getVolumePreference(this.model.callId);
},addVideo:function(){
stproxy.softphone.addVideo(this.model.callId);
},removeVideo:function(){
this._setConfProperty(STAVConst.VIDEO_TO_AUDIO);
stproxy.softphone.removeVideo(this.model.callId);
},startVideo:function(){
if(!this.model.hasVideo){
this._setConfProperty(STAVConst.AUDIO_TO_VIDEO);
stproxy.updateAVModelStub(stproxy.confctrl.model.callId,"",{"hasVideo":true});
stproxy.confctrl.isVideoStarted=true;
}
stproxy.softphone.startVideo(this.model.callId);
},declineStopVideo:function(){
stproxy.updateAVModelStub(stproxy.confctrl.model.callId,"",{"hasVideo":false});
stproxy.confctrl.isVideoStarted=false;
},stopVideo:function(){
stproxy.softphone.stopVideo(this.model.callId);
stproxy.updateAVModelStub(stproxy.confctrl.model.callId,"",{"hasVideo":false});
stproxy.confctrl.isVideoStarted=false;
},addMyVideo:function(){
console.log("stproxy.confctrl addMyVideo");
stproxy.softphone.addVideo(this.model.callId);
this.model["onVideoAdded"].apply("",[this.model.isIncoming]);
},holdCall:function(){
stproxy.softphone.holdCall(this.model.callId);
},resumeCall:function(){
stproxy.softphone.resumeCall(this.model.callId);
this.resumeUser(this.model.loginId);
},handleOnHold:function(){
this.holdUser(this.model.loginId);
stproxy.confctrl.model["onCallHoldCompleted"].stproxyApply();
},holdUser:function(_4a9){
var _4aa=new Array();
_4aa[0]=_4a9;
this.isDialedoutUser=false;
this.setUserProperty(STAVConst.SELF_PAUSE,_4aa,this.isDialedoutUser);
},resumeUser:function(_4ab){
var _4ac=new Array();
_4ac[0]=_4ab;
this.isDialedoutUser=false;
this.setUserProperty(STAVConst.SELF_RESUME,_4ac,this.isDialedoutUser);
},muteParticipant:function(_4ad){
var _4ae=new Array();
_4ae[0]=_4ad;
this.setUserProperty(STAVConst.MUTE_PARTICIPANT,_4ae,stproxy.avUserList.isDialoutUser(_4ad));
},unmuteParticipant:function(_4af){
if(!this.isSelfMuted(_4af)){
var _4b0=new Array();
_4b0[0]=_4af;
this.setUserProperty(STAVConst.UNMUTE_PARTICIPANT,_4b0,stproxy.avUserList.isDialoutUser(_4af));
}
},hangupUser:function(_4b1){
var _4b2=new Array();
_4b2[0]=_4b1;
stproxy.conf.hangup(_4b2,false,this.model.callId);
},inviteUser:function(_4b3){
},toggleMute:function(_4b4){
if(this.muteStatus==this.UNMUTED){
this.muteMySelf(_4b4);
}else{
this.unmuteMySelf(_4b4);
}
},muteMySelf:function(){
if(this.muteStatus==this.UNMUTED){
var _4b5=new Array();
_4b5[0]=this.model.loginId;
this.isDialedoutUser=false;
this.muteStatus=this.MUTED;
stproxy.softphone.muteSelf(this.model.callId);
this.setUserProperty(STAVConst.SELF_MUTE_AUDIO,_4b5,this.isDialedoutUser);
}
},unmuteMySelf:function(){
var _4b6=new Array();
_4b6[0]=this.model.loginId;
this.isDialedoutUser=false;
if(this.muteStatus==this.MUTED){
this.muteStatus=this.UNMUTED;
stproxy.softphone.unmuteSelf(this.model.callId);
if(!this.isPaused){
this.setUserProperty(STAVConst.SELF_UNMUTE_VIDEO,_4b6,this.isDialedoutUser);
}
this.setUserProperty(STAVConst.SELF_UNMUTE_AUDIO,_4b6,this.isDialedoutUser);
}
},muteAll:function(){
this.setConfProperty(STAVConst.MUTE_ALL);
},unmuteAll:function(){
this.setConfProperty(STAVConst.UNMUTE_ALL);
},lockCall:function(){
this.setConfProperty(STAVConst.LOCK_CALL);
},unlockCall:function(){
this.setConfProperty(STAVConst.UNLOCK_CALL);
},endCall:function(){
this.endCallNative();
this.hangupUser(this.model.loginId);
this._setConfProperty(STAVConst.END_CALL);
},mediaChange:function(_4b7){
this._setConfProperty(_4b7);
},joinPlace:function(_4b8,_4b9,lang,_4ba){
stproxy.conf.join(_4b8?_4b8:this.model.callId,_4b9?_4b9:this.model.loginId,lang?lang:this.model.lang,_4ba?_4ba:this.model.isAnonymous);
},monitorPlace:function(_4bb,_4bc,lang,_4bd,_4be,_4bf){
stproxy.conf.monitor(_4bb?_4bb:this.model.callId,_4bc?_4bc:this.model.loginId,lang?lang:this.model.lang,_4bd?_4bd:true,_4be?_4be:this.model.isAnonymous,_4bf?_4bf:false);
},startCall:function(){
if(!stproxy.mobile.agent){
stproxy.webplayer.initWindowHandle(this.model.callId);
}
this.dialtype=STAVConst.TELEPHPONE_WITH_SIP;
this.URI_type=1;
this.isDialFalure=false;
this.getURI();
if(this.model.hasVideo){
this.startVideoCall();
}else{
this.startAudioCall();
}
this.isCrashedPreviously=false;
},startAudioCall:function(){
console.log("startAudioCall");
this.AVCallType=1;
stproxy.softphone.startAudioCall(this.model.callId);
if(this.isMeetings()){
this.startProxyCall();
}else{
this.startProxyCall();
}
},startVideoCall:function(){
console.log("startVideoCall");
this.AVCallType=3;
stproxy.softphone.startVideoCall(this.model.callId);
stproxy.confctrl.startProxyCall();
},startProxyCall:function(){
if(!this.model.properties){
this.model.properties=stproxy.av.getStartCallProps(this.model.isCommunityCall);
}
var _4c0="";
if(this.model.isCommunityCall){
_4c0=this.model.callId;
}
var _4c1=false;
stproxy.conf.start(this.model.callId,this.model.loginId,_4c0,this.getURI(),this.model.properties,this.model.isModerator,this.model.isAnonymous,_4c1);
},startNWayAudio:function(){
},startNWayVideo:function(){
},leaveCall:function(){
this._leaveCall(this.model.loginId,this.model.callId);
if(this.model.is1to1){
this._setConfProperty(STAVConst.END_CALL);
}
this.model.close();
},_leaveCall:function(_4c2,_4c3){
this.endCallNative();
this.hangupUser(_4c2);
stproxy.conf.leave(_4c3,false);
},_setConfProperty:function(_4c4){
var _4c5=null;
var _4c6=null;
var _4c7=STAVConst.APPLICATION_PUBLIC_PROPERTY_TYPE;
if(_4c4==STAVConst.MUTE_ALL){
_4c5=STAVConst.CALL_MUTED_PROPERTY;
_4c6=STAVConst.CALL_MUTED;
}else{
if(_4c4==STAVConst.UNMUTE_ALL){
_4c5=STAVConst.CALL_MUTED_PROPERTY;
_4c6=STAVConst.CALL_UNMUTED;
}else{
if(_4c4==STAVConst.LOCK_CALL){
_4c5=STAVConst.CALL_LOCKED_PROPERTY;
_4c6=true;
}else{
if(_4c4==STAVConst.UNLOCK_CALL){
_4c5=STAVConst.CALL_LOCKED_PROPERTY;
_4c6=false;
}else{
if(_4c4==STAVConst.END_CALL){
_4c5=STAVConst.CALL_ENDED_PROPERTY;
_4c6=true;
}else{
if(_4c4==STAVConst.AUDIO_TO_VIDEO){
_4c5=STAVConst.MEDIA_CHANGE_PROPERTY;
_4c6=STAVConst.VIDEO_MEDIA;
}else{
if(_4c4==STAVConst.VIDEO_TO_AUDIO){
_4c5=STAVConst.MEDIA_CHANGE_PROPERTY;
_4c6=STAVConst.AUDIO_MEDIA;
}
}
}
}
}
}
}
this.setConferenceProperty(_4c5,_4c6,_4c7,this.model.callId,stproxy.confctrl.confCallBack,stproxy.confctrl.confErrCallBack);
},setConferenceProperty:function(_4c8,_4c9,_4ca,_4cb,_4cc,_4cd){
stproxy.conf.setConfProp(_4c8,_4c9,_4ca,_4cb,_4cc,_4cd);
},setUserProperty:function(){
var op=arguments[0];
var _4ce=arguments[1];
var _4cf=arguments[2];
var _4d0=(arguments[3]!=undefined)?arguments[3]:"";
var _4d1=STAVConst.APPLICATION_PUBLIC_PROPERTY_TYPE;
switch(op){
case STAVConst.SELF_MUTE_AUDIO:
stproxy.conf.setUserProp(_4ce,STAVConst.PARTICIPANT_MUTED_PROPERTY,STAVConst.PARTICIPANT_SELF_MUTED,_4d1,_4cf,this.model.callId,stproxy.confctrl.confCallBack,stproxy.confctrl.confErrCallBack);
break;
case STAVConst.SELF_UNMUTE_AUDIO:
stproxy.conf.setUserProp(_4ce,STAVConst.PARTICIPANT_MUTED_PROPERTY,STAVConst.PARTICIPANT_UNMUTED,_4d1,_4cf,this.model.callId,stproxy.confctrl.confCallBack,stproxy.confctrl.confErrCallBack);
break;
case STAVConst.SELF_MUTE_VIDEO:
stproxy.conf.setUserProp(_4ce,STAVConst.MUTED_VIDEO_PROPERTY,STAVConst.PARTICIPANT_SELF_MUTED,_4d1,_4cf,this.model.callId,stproxy.confctrl.confCallBack,stproxy.confctrl.confErrCallBack);
break;
case STAVConst.SELF_UNMUTE_VIDEO:
stproxy.conf.setUserProp(_4ce,STAVConst.MUTED_VIDEO_PROPERTY,STAVConst.PARTICIPANT_UNMUTED,_4d1,_4cf,this.model.callId,stproxy.confctrl.confCallBack,stproxy.confctrl.confErrCallBack);
break;
case STAVConst.PARTICIPANT_MIC_VOICE_LEVEL:
stproxy.conf.setUserProp(_4ce,STAVConst.VOICE_LEVEL_PROPERTY,_4d0,_4d1,_4cf,this.model.callId,stproxy.confctrl.confCallBack,stproxy.confctrl.confErrCallBack);
break;
case STAVConst.MUTE_PARTICIPANT:
stproxy.conf.setUserProp(_4ce,STAVConst.PARTICIPANT_SILENCED_PROPERTY,STAVConst.PARTICIPANT_SILENCED,_4d1,_4cf,this.model.callId,stproxy.confctrl.confCallBack,stproxy.confctrl.confErrCallBack);
break;
case STAVConst.UNMUTE_PARTICIPANT:
stproxy.conf.setUserProp(_4ce,STAVConst.PARTICIPANT_SILENCED_PROPERTY,STAVConst.PARTICIPANT_UNSILENCED,_4d1,_4cf,this.model.callId,stproxy.confctrl.confCallBack,stproxy.confctrl.confErrCallBack);
break;
case STAVConst.SELF_PAUSE:
stproxy.conf.setUserProp(_4ce,STAVConst.PARTICIPANT_PAUSE_PROPERTY,STAVConst.PARTICIPANT_PAUSED,_4d1,_4cf,this.model.callId,stproxy.confctrl.confCallBack,stproxy.confctrl.confErrCallBack);
break;
case STAVConst.SELF_RESUME:
stproxy.conf.setUserProp(_4ce,STAVConst.PARTICIPANT_PAUSE_PROPERTY,STAVConst.PARTICIPANT_RESUMED,_4d1,_4cf,this.model.callId,stproxy.confctrl.confCallBack,stproxy.confctrl.confErrCallBack);
break;
}
},setConfProperty:function(){
var op=arguments[0];
var _4d2=STAVConst.APPLICATION_PUBLIC_PROPERTY_TYPE;
switch(op){
case STAVConst.END_CALL:
stproxy.conf.setConfProp(STAVConst.CALL_ENDED_PROPERTY,"true",_4d2,this.model.callId);
break;
case STAVConst.MUTE_ALL:
stproxy.conf.setConfProp(STAVConst.CALL_MUTED_PROPERTY,STAVConst.CALL_MUTED,_4d2,this.model.callId);
break;
case STAVConst.UNMUTE_ALL:
stproxy.conf.setConfProp(STAVConst.CALL_MUTED_PROPERTY,STAVConst.CALL_UNMUTED,_4d2,this.model.callId);
break;
case STAVConst.LOCK_CALL:
stproxy.conf.setConfProp(STAVConst.CALL_LOCKED_PROPERTY,"true",_4d2,this.model.callId);
break;
case STAVConst.UNLOCK_CALL:
stproxy.conf.setConfProp(STAVConst.CALL_LOCKED_PROPERTY,"false",_4d2,this.model.callId);
break;
case STAVConst.MUTE_ALL_PRESENTATION_MODE:
stproxy.conf.setConfProp(STAVConst.CALL_AUTO_MUTE_PROPERTY,"true",_4d2,this.model.callId);
break;
case STAVConst.UNMUTE_ALL_PRESENTATION_MODE:
stproxy.conf.setConfProp(STAVConst.CALL_AUTO_MUTE_PROPERTY,"false",_4d2,this.model.callId);
break;
}
},endCallNative:function(_4d3){
if(this.isVideoStarted){
stproxy.softphone.stopVideo(this.model.callId);
this.isVideoStarted=false;
}
var _4d4=_4d3?_4d3:false;
if(this.isAudioStarted||_4d4){
if(this.URI_type==1&&this.model){
stproxy.softphone.endCall(this.model.callId);
}else{
console.warn("URI_TYPE is not equals to 1 or AV Model is closed so Native EndCall not called");
}
this.isAudioStarted=false;
}
},setInviteResponseTimeout:function(_4d5){
if(_4d5&&_4d5!=undefined){
if(this.noResponseTimeout){
this.clearInviteResponseTimeout();
}
this.noResponseTimeout=setTimeout("stproxy.confctrl.noResponse()",_4d5);
}
},noResponse:function(){
this.clearInviteResponseTimeout();
this.model.sendNoAnswerResponse();
this.model["onNoResponseTimeout"].stproxyApply("",[this.model.isIncoming]);
},clearInviteResponseTimeout:function(){
if(this.noResponseTimeout!=undefined){
clearTimeout(this.noResponseTimeout);
delete this.noResponseTimeout;
}
},callEstablished:function(_4d6){
switch(_4d6){
case STAVConst.VIDEO_CALL:
stproxy.softphone.startVideo(stproxy.confctrl.model.callId);
this.isVideoStarted=true;
this.isAudioStarted=true;
this.isCallEstablished=true;
break;
case STAVConst.AUDIO_CALL:
this.isAudioStarted=true;
this.isCallEstablished=true;
break;
}
}};
stproxy.webplayer={_fileNameFF:"STWebPlayer.xpi",_fileNameFFMAC:"STWebPlayerMac.xpi",pluginRegistry:new Array(),bSTWebPlayerEmbedded:false,pluginObject:null,xml:"",isMainWindow:false,windowHandle:null,_webPlayerURL:"",_version:"",WebPlayerName:"IBM Sametime WebPlayer",WebPlayerNameOld:"IBM Lotus Sametime WebPlayer",loadPlayerDetailTimeout:null,installStatus:STAVConst.PLUGIN_STATUS_UNDECIDED,wpVer:"new",INFO_LEVEL:"info",DEBUG_LEVEL:"debug",ERROR_LEVEL:"error",getobject:function(){
if(!this.pluginObject){
if(clientDetect.isIE){
this.pluginObject=document.getElementById("STActiveXWebAV");
}
if(clientDetect.isFF||clientDetect.browser=="Chrome"||clientDetect.browser=="Safari"){
this.pluginObject=document.getElementById("npSTPluginWebAV");
}
}
},logMonitorTrace:function(_4d7,_4d8,_4d9){
this.getobject();
if(stproxy.softphone.isSTWebInitCalled){
var _4da=this.updateMonitorTraceLevel(_4d7,_4d8,_4d9);
try{
this.pluginObject.STWeb_LogEvent(_4da);
}
catch(err){
console.error("Error in Monitor traces = "+err);
}
}
},updateMonitorTraceLevel:function(_4db,_4dc,_4dd){
return "***"+_4db+" : "+_4dd+" : "+_4dc+"***";
},registerPlugin:function(args){
var _4de=false;
for(i in this.pluginRegistry){
if(this.pluginRegistry[i].pluginName==args.pluginName){
if(!this.pluginRegistry[i].isRegistered){
this.pluginRegistry[i].isRegistered=true;
}
_4de=true;
break;
}
}
if(!_4de){
args.isRegistered=true;
this.pluginRegistry.push(args);
}
},unregisterPlugin:function(_4df){
for(i in this.pluginRegistry){
if(this.pluginRegistry[i].pluginName==_4df){
if(this.pluginRegistry[i].isRegistered){
this.pluginRegistry[i].isRegistered=false;
}
break;
}
}
},setAttribute:function(_4e0,_4e1){
this[_4e0]=_4e1;
},getAttribute:function(_4e2){
return this[_4e2];
},getWindowHandle:function(){
if(this.windowHandle==null){
this.getobject();
try{
console.log("this.pluginObject => "+this.pluginObject);
this.windowHandle=this.pluginObject.STWeb_GetWindowHandle();
console.log("windowHandle=>"+this.windowHandle);
if(clientDetect.OS=="Mac"){
this.windowHandle=this.windowHandle.replace(":","###");
}
}
catch(e){
console.log("Error - while getting STWeb_GetWindowHandle exception- "+e.description);
}
}
return this.windowHandle;
},composeExecuteXML:function(pmId,_4e3,_4e4,_4e5){
this.xml="<Execute Level='"+pmId+"'><Method ID='"+_4e3+"' Name='"+_4e4+"'>";
var j=(_4e5.args.length);
for(var k=0;k<j;k++){
var x=_4e5.args[k].split(":");
if(clientDetect.OS=="Mac"&&x[0]==="hWndChild"){
x[1]=x[1].replace("###",":");
}
this.xml+="<Parameter Name='"+x[0]+"' Value='"+x[1]+"'/>";
}
this.xml+="</Method></Execute>";
},composeWebPlayerExecuteXml:function(_4e6,_4e7){
var _4e8="<MethodID>"+_4e6+"</MethodID>";
if(_4e7&&_4e7!=""){
for(var key in _4e7){
_4e8=_4e8+"<"+key+">"+_4e7[key]+"</"+key+">";
}
}
console.log("tempXml=>"+_4e8);
return _4e8;
},WebPlayerVersionCheck:function(_4e9){
this.getobject();
var _4ea=_4e9;
return this.pluginObject.STWeb_VersionCompare(_4ea);
},initWindowHandle:function(_4eb){
this.getobject();
var _4ec="<MethodID>InitWindowHandle</MethodID><PluginID>"+STAVConst.SOFTPHONE_PLUGIN_ID+"</PluginID><PHWND>"+stproxy.av.getInitWindowHandle(_4eb)+"</PHWND>";
console.log("initWindowHandle "+_4ec);
this.pluginObject.STWeb_Execute(_4ec,_4ec);
},initNativePlugin:function(_4ed,_4ee){
console.log("stproxy.webplayer.initNativePlugin - enter");
this.getobject();
if(clientDetect.isIE){
this.pluginObject.attachEvent("_OnCallStatus",window["_OnCallStatus"+STAVConst.SOFTPHONE_PLUGIN_ID+stproxy.av.appId]);
}
this.pluginObject.STWeb_Init(_4ed,_4ee);
console.log("stproxy.webplayer.initNativePlugin - exit");
},embed:function(_4ef){
if(this._pluginAttachPoint==undefined){
if(_4ef!=undefined){
if(typeof (_4ef)=="string"){
this._pluginAttachPoint=document.getElementById(_4ef);
if(this._pluginAttachPoint==undefined){
console.log("stproxy.webplayer.embed - ID passed to attach plugin does not exist !");
}
}else{
this._pluginAttachPoint=_4ef;
}
}else{
this._pluginAttachPoint=document.getElementById("stavPluginObj");
if(this._pluginAttachPoint==undefined){
var ele=document.createElement("div");
ele.setAttribute("id","stavPluginObj");
ele.setAttribute("style","overflow: hidden; height: 1px; position: absolute; left: 0px;top: 0px");
try{
if(document.body&&ele){
this._pluginAttachPoint=ele;
document.body.appendChild(this._pluginAttachPoint);
}else{
console.error("stproxy.webplayer.embed - Plugin attach point is required !");
}
}
catch(e){
console.error("Error while creating AV object place holder = "+e);
}
}else{
console.log("Using the stavPluginObj html element for attaching webplayer plugin");
}
}
}else{
console.log("Plugin already embedded !");
}
},clearEmbed:function(){
if(this._pluginAttachPoint){
if(clientDetect.browser==="Firefox"||clientDetect.browser==="Chrome"||clientDetect.browser==="Safari"){
var el=document.getElementById("npSTPluginWebAV");
el.parentNode.removeChild(el);
console.warn("stproxy.webplayer.clearEmbed - Removing the npSTPluginWebAV object");
}else{
if(clientDetect.browser==="Explorer"){
var el=document.getElementById("STActiveXWebAV");
el.parentNode.removeChild(el);
console.warn("stproxy.webplayer.clearEmbed - Removing the STActiveXWebAV object");
}
}
}else{
console.warn("stproxy.webplayer.clearEmbed - Removing the STActiveXWebAV object");
}
},init:function(args){
if(args!=undefined){
this.registerPlugin(args);
this.getWebPlayerVersion();
}else{
stproxy.webplayer._installEmbedWebPlayer();
}
},getWebPlayerVersion:function(){
stproxy.webavver.get("WebPlayerVersion",stproxy.webplayer.onWebPlayerVerCallback,stproxy.webplayer.onWebPlayerVerErrcallback);
},loadPlayerDetails:function(_4f0){
if(stproxy.webplayer._webPlayerURL.length==0){
stproxy.webplayer._webPlayerURL=stproxyConfig.server+"/stwebav";
}
if(stproxy.webplayer._version.length==0&&stproxy.softphone._version.length==0){
for(var _4f1 in _4f0){
var _4f2=_4f1.toLowerCase();
stproxy[_4f2].setAttribute("_version",_4f0[_4f1]);
}
}
},onWebPlayerVerCallback:function(_4f3){
stproxy.webplayer.loadPlayerDetails(_4f3);
stproxy.webplayer._installEmbedWebPlayer();
},onWebPlayerVerErrcallback:function(){
console.error("onWebPlayerVerErrcallback - Webplayer version not found");
},onWebPlayerEmbedded:function(){
for(var obj in this.pluginRegistry){
var _4f4=this.pluginRegistry[obj];
stproxy[_4f4.pluginName][_4f4.initCallback]();
}
},_installEmbedWebPlayer:function(){
console.log("stproxy.webplayer._installEmbedWebPlayer -- enter");
if(!document.getElementById("avWidgetDiv")){
stproxy.webplayer.checkInstallUpgradeRequirement(this._pluginAttachPoint);
}else{
stproxy.webplayer.installStatus=STAVConst.PLUGIN_IS_UPTODATE;
}
if(stproxy.webplayer.installStatus==STAVConst.PLUGIN_IS_UPTODATE){
if(this._pluginAttachPoint){
var pN=this._pluginAttachPoint;
if((clientDetect.browser==="Firefox"||clientDetect.browser==="Chrome")&&(clientDetect.OS=="Windows"||clientDetect.OS=="Windows7")||((clientDetect.browser==="Firefox"||clientDetect.browser==="Safari")&&clientDetect.OS=="Mac")){
var _4f5="application/stwebplayer";
if(stproxy.hasExtension("LotusLive")){
_4f5="application/scwebplayer";
}
if(pN.innerHTML==""){
pN.innerHTML="<OBJECT ID='npSTPluginWebAV' class='stproxy_stwebplayer' type="+_4f5+" align='center' style='height:100%;width:100%'></OBJECT>";
}
this.bSTWebPlayerEmbedded=true;
}
if(clientDetect.browser==="Explorer"&&(clientDetect.OS=="Windows"||clientDetect.OS=="Windows7")){
if(document.getElementById("STActiveXWebAV")==undefined||document.getElementById("STActiveXWebAV")==null){
if(pN.innerHTML==""){
if(stproxy.hasExtension("LotusLive")){
pN.innerHTML="<OBJECT ID='STActiveXWebAV' CLASSID='CLSID:9D973A8D-3131-4B66-A957-49A6CD083BED' style='height:100%;width:100%'></OBJECT>";
}else{
pN.innerHTML="<OBJECT ID='STActiveXWebAV' CLASSID='CLSID:84CADCFA-3BEB-4CF0-8974-241414B2227E' style='height:100%;width:100%'></OBJECT>";
}
}
if(!stproxy.webplayer.bSTWebPlayerEmbedded){
while(!this.waitUntilObjectLoaded()){
this.waitUntilObjectLoaded();
}
}
}else{
stproxy.webplayer.bSTWebPlayerEmbedded=true;
}
}
}else{
console.error("Embed Node is not found");
}
if(stproxy.webplayer.bSTWebPlayerEmbedded){
stproxy.webplayer.onWebPlayerEmbedded();
}else{
console.log("embedWebPlayer - STWebPlayer not embedded");
}
}else{
stproxy.av.setMyCapability();
}
console.log("stproxy.webplayer._installEmbedWebPlayer -- exit - this.bSTWebPlayerEmbedded=> "+this.bSTWebPlayerEmbedded+" installStatus-"+stproxy.webplayer.installStatus);
},waitUntilObjectLoaded:function(){
this.getobject();
if(!this.pluginObject||this.pluginObject==null){
return false;
}
stproxy.webplayer.bSTWebPlayerEmbedded=true;
return true;
},Exec:function(pmId,_4f6,_4f7,_4f8,_4f9){
console.log("Exec methodName=>"+_4f7);
this.getobject();
if(stproxy[_4f6].isInitialized()){
this.composeExecuteXML(pmId,_4f6,_4f7,_4f8);
var _4fa=this.composeWebPlayerExecuteXml(_4f6,_4f9);
console.log("tempXml=>"+_4fa);
this.pluginObject.STWeb_Execute(_4fa,this.xml);
}
},getAVDevice:function(type){
this.getobject();
return this.pluginObject.STWeb_GetDevice(type);
},getInstallStatus:function(){
return stproxy.webplayer.installStatus;
},compareWebplayerVersionExt:function(_4fb){
console.log("stproxy.webplayer - compareWebplayerVersionExt - currentVersion : "+_4fb);
var _4fc=(_4fb.indexOf(",")!=-1?_4fb.split(","):_4fb.split("."));
var _4fd=this._version.split(",");
if(parseInt(_4fc[0])<parseInt(_4fd[0])){
return true;
}else{
if(parseInt(_4fc[0])>parseInt(_4fd[0])){
return false;
}else{
if(parseInt(_4fc[1])<parseInt(_4fd[1])){
return true;
}else{
if(parseInt(_4fc[1])>parseInt(_4fd[1])){
return false;
}else{
if(parseInt(_4fc[2])<parseInt(_4fd[2])){
return true;
}else{
if(parseInt(_4fc[2])>parseInt(_4fd[2])){
return false;
}else{
if(parseInt(_4fc[3])<parseInt(_4fd[3])){
return true;
}else{
if(parseInt(_4fc[3])>=parseInt(_4fd[3])){
return false;
}
}
}
}
}
}
}
}
},getWebPlayerObject:function(){
var _4fe=null;
var isLL=stproxy.hasExtension("LotusLive")?true:false;
if(dojo.isFF>=29){
var _4ff="application/stwebplayer";
if(isLL){
_4ff="application/scwebplayer";
}
var _500=navigator.mimeTypes[_4ff];
if(_500){
_4fe=_500.enabledPlugin;
if(_4fe.name=="IBM Lotus Sametime WebPlayer"){
stproxy.webplayer.wpVer="old";
}
}
}else{
_4fe=navigator.plugins[stproxy.webplayer.WebPlayerName];
if(_4fe==undefined){
_4fe=navigator.plugins[stproxy.webplayer.WebPlayerNameOld];
stproxy.webplayer.wpVer="old";
}
}
return _4fe;
},checkInstallUpgradeRequirement:function(_501){
if(stproxy.webplayer.installStatus){
console.log("InstallCheck was already done. InstallStatus-"+stproxy.webplayer.installStatus);
return;
}
console.log("stproxy.webplayer.checkInstallUpgradeRequirement - attachNode"+_501);
window.customEnvironment=null;
if(stproxy.hasExtension("LotusLive")){
window.customEnvironment="LotusLive";
clientDetect.setLLSettings();
stproxy.webplayer.WebPlayerName="IBM SmartCloud Sametime WebPlayer";
}
if(stproxy.webplayer._version==""){
stproxy.webplayer._version=stproxy.av.getServerAttrDetails("webaudiovideo.playerver");
if(stproxy.webplayer._version==""){
if(!stproxy.webplayer.getWebPlayerVersionInProcess){
stproxy.webavver.get("WebPlayerVersion",stproxy.webplayer.loadPlayerDetails,stproxy.webplayer.onWebPlayerVerErrcallback);
stproxy.webplayer.getWebPlayerVersionInProcess=true;
stproxy.webplayer.loadPlayerDetailTimeout=setTimeout("stproxy.webplayer.checkInstallUpgradeRequirement()",500);
}
return;
}
}else{
stproxy.webplayer.getWebPlayerVersionInProcess=false;
clearTimeout(stproxy.webplayer.loadPlayerDetailTimeout);
}
console.log("stproxy.webplayer.checkInstallUpgradeRequirement - versionloaded - progress to check install status");
stproxy.webplayer.embed(_501);
if(clientDetect.isIE){
if(!stproxy.avCommon.getCookie("STAVPluginInUse")){
if(window.ActiveXObject){
var _502=null;
try{
if(customEnvironment!=undefined&&customEnvironment!=null&&customEnvironment=="LotusLive"){
stproxy.webplayer._pluginAttachPoint.innerHTML="<OBJECT ID='STActiveXWebAV' CLASSID='CLSID:9D973A8D-3131-4B66-A957-49A6CD083BED'></OBJECT>";
}else{
stproxy.webplayer._pluginAttachPoint.innerHTML="<OBJECT ID='STActiveXWebAV' CLASSID='CLSID:84CADCFA-3BEB-4CF0-8974-241414B2227E'></OBJECT>";
}
_502=document.getElementById("STActiveXWebAV");
_502.STWeb_Execute("","");
}
catch(e){
_502=null;
}
if(_502){
var _503="";
try{
_503=_502.STWeb_GetWebPlayerVersion();
}
catch(e){
console.log("checkInstallUpgradeRequirement - exception for STWeb_GetWebPlayerVersion : "+e);
_503="";
}
if((_503=="")||(_503!=""&&stproxy.webplayer.compareWebplayerVersionExt(_503))){
stproxy.webplayer.installStatus=STAVConst.PLUGIN_UPGRADE_REQUIRED;
}
}else{
stproxy.webplayer.installStatus=STAVConst.PLUGIN_INSTALL_REQUIRED;
}
stproxy.webplayer._pluginAttachPoint.innerHTML="";
}
}else{
stproxy.webplayer.installStatus=STAVConst.PLUGIN_IN_USE;
}
}else{
if(clientDetect.isFF||clientDetect.isSafari||clientDetect.isChrome){
var _504=stproxy.webplayer.getWebPlayerObject();
if(_504==undefined||_504==null){
stproxy.webplayer.installStatus=STAVConst.PLUGIN_INSTALL_REQUIRED;
}else{
var _505=false;
if(clientDetect.isFF&&clientDetect.OS=="Mac"){
_505=stproxy.webplayer.compareWebplayerVersionExt(_504.version);
}
if(!(clientDetect.isFF&&clientDetect.OS=="Mac"&&_505==false)){
stproxy.webplayer._pluginAttachPoint.style.display="";
if(stproxy.webplayer._pluginAttachPoint.innerHTML==""){
if(customEnvironment!=undefined&&customEnvironment!=null&&customEnvironment=="LotusLive"){
stproxy.webplayer._pluginAttachPoint.innerHTML="<OBJECT ID='npSTPluginWebAV' type='application/scwebplayer' class='confPanelObject' align='center'></OBJECT>";
}else{
stproxy.webplayer._pluginAttachPoint.innerHTML="<OBJECT ID='npSTPluginWebAV' type='application/stwebplayer' class='confPanelObject' align='center'></OBJECT>";
}
document.getElementById("npSTPluginWebAV").style.height="0px";
}
var _506=stproxy.webplayer._version;
_505=document.getElementById("npSTPluginWebAV").STWeb_VersionCompare(_506);
if(_505=="true"){
_505=true;
}else{
_505=false;
}
stproxy.webplayer._pluginAttachPoint.innerHTML="";
}
if(_505==true){
stproxy.webplayer.installStatus=STAVConst.PLUGIN_UPGRADE_REQUIRED;
}
}
}
}
if(!stproxy.webplayer.installStatus){
stproxy.webplayer.installStatus=STAVConst.PLUGIN_IS_UPTODATE;
}
},bwc:function(_507){
stproxy.invoke("stproxy.broadcast.nativePlugin.wndClose",[_507]);
},wndClose:function(_508){
if(!_508){
setTimeout(function(){
window.focus();
window.close();
},1000);
}else{
if(!stproxy.isChatWindow()){
setTimeout(function(){
location.reload();
},500);
}else{
setTimeout(function(){
window.focus();
window.close();
},500);
}
}
}};
stproxy.av.mobile={init:function(args){
console.log("stproxy mobile _init enter");
if(!this.isSTWebInitCalled){
try{
this.isSTWebInitCalled=true;
stproxy.av.setBootstrapData("isSTWebInitCalled",true);
cordova.exec(stproxy.av.mobile.registerSIPClientSuccess,stproxy.av.mobile.registerSIPClientFailure,"AVCordovaPlugin","avinit",stproxy.av.mobile.getInitXML());
}
catch(e){
this.isSTWebInitCalled=false;
console.log(e);
stproxy.av.setBootstrapData("isSTWebInitCalled",false);
}
}
console.log("stproxy mobile _init Exit");
},getInitXML:function(){
var _509={"softphonePluginVersion":"","webavClientUpdateUrl":"","webPlayerVersion":""};
var args={"nativeSIPURI":stproxy.av.getNativeSIPURI(),"params":stproxy.av.getNativeInitParam(_509)};
console.log("stproxy.av.mobile.getInitXML: args.nativeSIPURI"+args.nativeSIPURI);
var _50a=stproxy.confctrl.encodeXML(args.nativeSIPURI);
var _50b="<Init><RequiredAttributes>"+"<Attribute Name='IsServiceProviderInternal' Value='"+args.params.isInternalServiceProvider+"'/>"+"<Attribute Name='PluginID' Value='"+args.params.pluginId+"'/>"+"<Attribute Name='TurnServerUdpHost' Value='"+args.params.TurnServerUdpHost+"'/>"+"<Attribute Name='TurnServerUdpPort' Value='"+args.params.TurnServerUdpPort+"'/>"+"<Attribute Name='TurnServerAcceptTcp' Value='"+args.params.TurnServerAcceptTcp+"'/>"+"<Attribute Name='TurnServerTcpHost' Value='"+args.params.TurnServerTcpHost+"'/>"+"<Attribute Name='TurnServerTcpPort' Value='"+args.params.TurnServerTcpPort+"'/>"+"<Attribute Name='IceRto' Value='"+args.params.IceRto+"'/>"+"<Attribute Name='IceRc' Value='"+args.params.IceRc+"'/>"+"<Attribute Name='IceRm' Value='"+args.params.IceRm+"'/>"+"<Attribute Name='NATKeepAliveRequestInterval' Value='"+args.params.NATKeepAliveRequestInterval+"'/>"+"<Attribute Name='SIPRegistrationExpirationInterval' Value='"+args.params.SIPRegistrationExpirationInterval+"'/>"+"<Attribute Name='PluginVersion' Value='"+args.params.softphonePluginVersion+"'/>"+"<Attribute Name='Server' Value='"+args.params.webavClientUpdateUrl+"'/>"+"<Attribute Name='ProxyHost' Value='"+args.params.proxyreghost+"'/>"+"<Attribute Name='NATEnabled' Value='"+args.params.NATEnabled+"'/>"+"<Attribute Name='ProxyPort' Value='"+args.params.proxyregport+"'/>"+"<Attribute Name='SIPURI' Value='"+_50a+"'/>"+"<Attribute Name='LtpaToken' Value='"+args.params.ltpaTokenCookie+"'/>"+"<Attribute Name='SIPTransportProtocol' Value='"+args.params.SIPTransportProtocol+"'/>"+"<Attribute Name='EncryptionType' Value='"+args.params.EncryptionType+"'/>"+"<Attribute Name='PreferredAudioCodecs' Value='"+args.params.PreferredAudioCodecs+"'/>"+"<Attribute Name='MaxVideoBitRate' Value='"+args.params.maxVideoBitRate+"'/>"+"<Attribute Name='IsAnonymous' Value='"+args.params.isAnonymous+"'/>"+"<Attribute Name='PreferredVideoCodecs' Value='"+args.params.PreferredVideoCodecs+"'/>"+"<Attribute Name='StartingAudioPort' Value='"+args.params.StartingAudioPort+"'/>"+"<Attribute Name='StartingVideoPort' Value='"+args.params.StartingVideoPort+"'/>"+"<Attribute Name='EnableSVC' Value='"+args.params.enableSVC+"'/>"+"<Attribute Name='LineRate' Value='"+args.params.lineRate+"'/>"+"<Attribute Name='EnableClientEncryption' Value='"+args.params.enableClientEncryption+"'/>"+"<Attribute Name='CustomVideoBitRate' Value='"+args.params.cutomVideoBitRate+"'/>"+"<Attribute Name='EnableTURNTokenAuth' Value='"+args.params.enableTURNTokenAuth+"'/>"+"<Attribute Name='CertAutoAccept' Value='"+args.params.enableTLSCertAutoAccept+"'/>"+"<Attribute Name='EnableHTTPConnect' Value='"+args.params.enableHTTPConnect+"'/>"+"<Attribute Name='AuthenticationType' Value='"+args.params.sipAuthType+"'/> "+"<Attribute Name='ClientSIPProxyHost' Value='"+args.params.clientsipPRServerHost+"'/>"+"<Attribute Name='ClientSIPProxyPort' Value='"+args.params.clientsipPRServerPort+"'/>"+"<Attribute Name='ClientSIPTransport' Value='"+args.params.clientsipPRServerTransportProtocol+"'/>"+"<Attribute Name='TurnServerSSLEnabled' Value='"+args.params.turnServerTransportSSLEnabled+"'/>"+"<Attribute Name='BrowserName' Value='"+clientDetect.browser+"'/>"+"<Attribute Name='ServerDeploymentType' Value='"+args.params.customEnvironment+"'/> "+"</RequiredAttributes></Init>";
return _50b;
},_init:function(args){
console.log("stproxy.softphone.init: args.nativeSIPURI"+args.nativeSIPURI);
},Exec:function(){
},registerSIPClientSuccess:function(){
console.log("Success SIP");
},registerSIPClientFailure:function(){
console.log("Failure SIP");
}};
stproxy.mobileSoftphone={isMainWindow:false,isSTWebInitCalled:false,pluginname:STAVConst.SOFTPHONE_PLUGIN_NAME,pluginId:STAVConst.SOFTPHONE_PLUGIN_ID,_version:"",setMainWindowFlag:function(flag){
this.isMainWindow=flag;
},setAttribute:function(_50c,_50d){
this[_50c]=_50d;
},getAttribute:function(_50e){
return this[_50e];
},getPluginDetails:function(){
var args={"pluginId":this.pluginId,"pluginName":this.pluginname,"initCallback":"init"};
return args;
},init:function(){
console.log("stproxy.softphone.init enter");
},unInit:function(){
},_init:function(args){
},isInitialized:function(){
return (this.isSTWebInitCalled);
},pauseVideo:function(_50f,_510){
},resumeVideo:function(_511,_512){
},hideMyVideo:function(_513,_514){
},showMyVideo:function(_515,_516){
},addVideo:function(_517,_518){
},muteSelf:function(_519,_51a){
},unmuteSelf:function(_51b,_51c){
},startVideoCall:function(_51d,_51e){
console.log("stproxy.mobileSoftphone.startVideoCall enter");
console.log("stproxy.mobileSoftphone.startVideoCall Exit");
},startAudioCall:function(_51f,_520){
console.log("stproxy.mobileSoftphone.startAudioCall enter");
console.log("stproxy.mobileSoftphone.startAudioCall Exit");
},endCall:function(_521,_522){
},startVideo:function(_523,hWnd){
console.log("stproxy.mobileSoftphone.startVideo enter");
console.log("stproxy.mobileSoftphone.startVideo Exit");
},stopVideo:function(_524,hWnd){
},uninitialize:function(_525,_526){
}};
stproxy.connectAVCallbacks=function(_527){
stproxy.hitch.connect(_527,"onCallStarted",function(_528){
console.log("stproxy.confctrl.tcspiCallback onCallStarted");
stproxy.confctrl.isJoin=true;
if(stproxy.confctrl.URI_type==2){
stproxy.confctrl.isAudioStarted=true;
}
if(_527.isModerator&&!stproxy.confctrl.isCallStarted){
stproxy.confctrl.inviteParticipants(_527.userIds,_528);
stproxy.confctrl.isCallStarted=true;
}
});
stproxy.hitch.connect(_527,"onCallTerminated",function(_529,_52a){
stproxy.confctrl.isCallStarted=false;
stproxy.confctrl.isCallEstablished=false;
stproxy.confctrl.leavePlace(stproxy.confctrl.conferenceId);
if(stproxy.confctrl.model){
stproxy.confctrl.model.close();
}
});
stproxy.hitch.connect(_527,"onUserDisconnected",function(_52b,_52c,_52d,_52e,_52f,_530){
if(!_527.isCommunityCall){
if(_527.loginId==_52b){
stproxy.confctrl.leavePlace(_530);
}else{
stproxy.confctrl._leaveCall(_527.loginId,_530);
}
}
stproxy.avUserList.updateConnected(_52b,false);
if(stproxy.confctrl.model){
stproxy.confctrl.model.close();
}
});
stproxy.hitch.connect(_527,"onUserConnected",function(_531,_532,_533,_534){
var _535=false;
if(_533!=null){
_535=(_533.toLowerCase()=="true");
}
if(!stproxy.avUserList.isAdded(_531)){
stproxy.avUserList.addUser(_531,_535);
}else{
stproxy.avUserList.updateUserInfo(_531,"isDialedUser",_535);
}
stproxy.avUserList.updateConnected(_531,true);
});
stproxy.hitch.connect(_527,"onUserBeginTalking",function(_536,_537,_538){
});
stproxy.hitch.connect(_527,"onUserEndTalking",function(_539,_53a,_53b){
});
stproxy.hitch.connect(_527,"onUserMuted",function(_53c,_53d,_53e){
stproxy.avUserList.updateSelfMuted(_53c,true);
if(stproxy.avUserList.isConnected(_527.loginId)){
if(_527.loginId===_53c){
stproxy.confctrl.muteStatus=stproxy.confctrl.MUTED;
}
}
});
stproxy.hitch.connect(_527,"onUserUnmuted",function(_53f,_540,_541){
if(stproxy.avUserList.isConnected(_53f)){
if(stproxy.avUserList.isConnected(_527.loginId)){
if(stproxy.avUserList.isSelfMuted(_53f)||stproxy.avUserList.isMutedByMod(_53f)){
stproxy.avUserList.updateSelfMuted(_53f,false);
stproxy.avUserList.updateMutedByMod(_53f,false);
_527["onUserUnmuted"].apply("",[_53f]);
}
}
}
});
stproxy.hitch.connect(_527,"onUserMutedByMod",function(_542,_543,_544){
if(!stproxy.confctrl.isModerator){
stproxy.avUserList.updateMutedByMod(_542,true);
if(stproxy.avUserList.isConnected(_527.loginId)&&stproxy.avUserList.isConnected(_542)){
stproxy.confctrl.onMuteParticipants(_542);
}
}
});
stproxy.hitch.connect(_527,"onUserUnmutedByMod",function(_545,_546,_547){
if(stproxy.avUserList.isMutedByMod(_545)){
stproxy.avUserList.updateMutedByMod(_545,false);
if(stproxy.avUserList.isConnected(_527.loginId)&&stproxy.avUserList.isConnected(_545)){
if(!stproxy.avUserList.isSelfMuted(_545)){
if(_545===_527.loginId){
stproxy.confctrl.muteStatus=stproxy.confctrl.UNMUTED;
_527["onUserUnmutedByMod"].apply("",[_545]);
}
}
if(!stproxy.confctrl.isPaused){
var _548=new Array();
_548[0]=_545;
stproxy.confctrl.setUserProperty(STAVConst.SELF_MUTE_VIDEO,_548,stproxy.confctrl.isDialedoutUser);
}
}
}
});
stproxy.hitch.connect(_527,"onUserPaused",function(_549,_54a,_54b){
});
stproxy.hitch.connect(_527,"onUserResumed",function(_54c,_54d,_54e){
});
stproxy.hitch.connect(_527,"onUserAdded",function(_54f,_550,_551){
if(!stproxy.avUserList.isAdded(_54f)){
stproxy.avUserList.addUser(_54f);
if(!_527.isModerator&&_527.isIncoming&&!_527.isCommunityCall&&_527.loginId==_54f){
_527.dialIn();
}
}
});
stproxy.hitch.connect(_527,"onModAdded",function(_552,_553,_554,_555){
if(!stproxy.avUserList.isAdded(_552)){
stproxy.avUserList.addUser(_552);
}
});
stproxy.hitch.connect(_527,"onCallAccept",function(_556,_557,_558,_559,_55a,_55b,_55c){
if(!stproxy.confctrl.isInvited){
stproxy.confctrl.inviteMsg=_55b;
stproxy.confctrl.isInvited=true;
stproxy.confctrl.disConnectCount=0;
}
});
stproxy.hitch.connect(_527,"onCallInviteResponse",function(_55d,_55e,_55f,_560){
if(_527.is1to1){
switch(_560){
case STAVConst.INVITE_DECLINED:
_527["onInviteDeclined"].stproxyApply();
break;
case STAVConst.INVITE_ACCEPTED:
console.log("1x1 Invite Accepted response calling self moderator dial from PartId=>"+_55e+", callId => "+_55d);
_527.dialIn();
break;
case STAVConst.INVITE_NO_RESPONSE:
_527["onNoAnswerReceived"].stproxyApply();
break;
case STAVConst.INVITE_ERROR:
alert("is1to1 Invite ERROR =>"+_55d+" "+_55e+" "+_55f+" "+_560);
break;
case STAVConst.INVITE_BUSY:
console.log("1x1 Invite Busy response from PartId=>"+_55e+", callId => "+_55d);
_527["onBusyResponse"].stproxyApply();
break;
}
}else{
switch(_560){
case STAVConst.INVITE_DECLINED:
_527["onInviteDeclined"].stproxyApply();
break;
case STAVConst.INVITE_ACCEPTED:
break;
case STAVConst.INVITE_NO_RESPONSE:
_527["onNoAnswerReceived"].stproxyApply();
break;
case STAVConst.INVITE_ERROR:
console.error("Invite ERROR =>"+_55d+" "+_55e+" "+_55f+" "+_560);
break;
case STAVConst.INVITE_BUSY:
console.log("N-way Invite Busy response from PartId=>"+_55e+", callId => "+_55d);
break;
}
}
});
stproxy.hitch.connect(_527,"onPropChange",function(_561,_562,_563,_564,_565){
if(_564=STAVConst.VOICE_LEVEL_PROPERTY){
if(_561===stproxy.confctrl.model.loginId){
_563=_563*255;
stproxy.avDevicePref.setMicVolumeUpdate(_563);
}else{
_563=_563*100;
stproxy.avDevicePref.updateMicVolume(_561,_563);
}
}
});
stproxy.hitch.connect(_527,"onVideoStarted",function(){
stproxy.confctrl.isVideoStarted=true;
});
stproxy.hitch.connect(_527,"onVideoStopped",function(){
stproxy.confctrl.isVideoStarted=false;
});
};
stproxy.avUserList={usersInfo:new Array()};
stproxy.avUserList.isAdded=function(_566){
var _567=false;
for(var obj in this.usersInfo){
if(this.usersInfo[obj].partId==_566){
_567=true;
}
}
return _567;
};
stproxy.avUserList.isConnected=function(_568){
var _569=false;
for(var obj in this.usersInfo){
if(this.usersInfo[obj].partId==_568){
_569=this.usersInfo[obj].connected;
}
}
return _569;
};
stproxy.avUserList.isSelfMuted=function(_56a){
var _56b=false;
if(_56a.indexOf("guest")!=-1){
_56a=_56a.replace("/","");
}
for(var obj in this.usersInfo){
if(this.usersInfo[obj].partId==_56a){
_56b=this.usersInfo[obj].selfMuted;
}
}
return _56b;
};
stproxy.avUserList.isMutedByMod=function(_56c){
var _56d=false;
for(var obj in this.usersInfo){
if(this.usersInfo[obj].partId==_56c){
_56d=this.usersInfo[obj].mutedByMod;
}
}
return _56d;
};
stproxy.avUserList.isDialoutUser=function(_56e){
for(var obj in this.usersInfo){
if(this.usersInfo[obj].partId==_56e&&this.usersInfo[obj].isDialedUser){
return true;
}
}
return false;
};
stproxy.avUserList.connectedUserCount=function(){
var _56f=0;
for(var obj in this.usersInfo){
if(this.usersInfo[obj].connected){
_56f++;
}
}
return _56f;
};
stproxy.avUserList.isAnyMutedByMod=function(){
var _570=false;
for(var obj in this.usersInfo){
if(this.usersInfo[obj].mutedByMod){
_570=true;
break;
}
}
return _570;
};
stproxy.avUserList.updateConnected=function(_571,_572){
if(!_572&&this.loginID==_571){
for(var obj in this.usersInfo){
this.usersInfo[obj].connected=_572;
}
}else{
for(var obj in this.usersInfo){
if(this.usersInfo[obj].partId==_571){
this.usersInfo[obj].connected=_572;
}
}
}
console.log("stproxy.avUserList.js - updateConnected userId: "+_571+" value:"+_572);
};
stproxy.avUserList.updateSelfMuted=function(_573,_574){
for(var obj in this.usersInfo){
if(this.usersInfo[obj].partId==_573){
this.usersInfo[obj].selfMuted=_574;
}
}
console.log("stproxy.avUserList.js - updateSelfMuted userId: "+_573+" value:"+_574);
};
stproxy.avUserList.updateMutedByMod=function(_575,_576){
for(var obj in this.usersInfo){
if(this.usersInfo[obj].partId==_575){
this.usersInfo[obj].mutedByMod=_576;
}
}
console.log("stproxy.avUserList.js - updateMutedByMod userId: "+_575+" value:"+_576);
};
stproxy.avUserList.updateMicVolume=function(_577,_578){
for(var obj in this.usersInfo){
if(this.usersInfo[obj].partId==_577){
this.usersInfo[obj].micVolume=_578;
}
}
console.log("stproxy.avUserList.js - updateMicVolume userId: "+_577+" value:"+_578);
};
stproxy.avUserList.addUser=function(_579,_57a){
if(_57a==null||_57a==undefined){
_57a=false;
}
if(_579!=null&&_579!=undefined){
this.usersInfo.push({partId:_579,connected:false,selfMuted:false,mutedByMod:false,onHold:false,micVolume:40,isDialedUser:_57a,isTalking:false,audioSourceIdentifire:null,videoSourceIdentifire:null});
}
console.log("stproxy.avUserList.js - addUser userId: "+_579+" isExternalUser:"+_57a);
};
stproxy.avUserList.getValueByKey=function(_57b,_57c,_57d){
var _57e=null;
for(var obj in this.usersInfo){
if(this.usersInfo[obj][_57b]==_57c){
_57e=(this.usersInfo[obj][_57d]);
}
}
return _57e;
};
stproxy.avUserList.getUserInfo=function(_57f,_580){
if(_57f!=null&&_57f!=undefined){
for(var obj in this.usersInfo){
if(this.usersInfo[obj].partId==_57f){
return (this.usersInfo[obj][_580]);
}
}
}
return false;
};
stproxy.avUserList.updateUserInfo=function(_581,_582,_583){
if(_581!=null&&_581!=undefined){
for(var obj in this.usersInfo){
if(this.usersInfo[obj].partId==_581){
this.usersInfo[obj][_582]=_583;
}
}
}
console.log("stproxy.avUserList.js - addUser userId: "+_581+" field:"+_582+" value:"+_583);
};
stproxy.avUserList.removeDialoutUsers=function(_584,_585){
for(var obj in this.usersInfo){
if(this.usersInfo[obj].isDialedUser){
if(_585==this.loginID){
removeUserInParticipantList(this.usersInfo[obj].partId);
if(_584){
this.usersInfo[obj].isDialedUser=false;
}
}else{
if(_585==this.usersInfo[obj].partId){
removeUserInParticipantList(this.usersInfo[obj].partId);
if(_584){
this.usersInfo[obj].isDialedUser=false;
}
}
}
}
}
};
stproxy.avUserList.addDialoutUsers=function(){
if(!this.isDialoutEnabled()){
console.log("stproxy.avUserList.js addDialoutUsers - Dialout Disabled");
return;
}
for(var obj in this.usersInfo){
if(this.usersInfo[obj].isDialedUser){
addUserInParticipantList(this.usersInfo[obj].partId);
}
}
};
stproxy.avUserList.removeUser=function(_586){
for(var obj in this.usersInfo){
if(this.usersInfo[obj].partId==_586){
delete this.usersInfo[obj];
}
}
};
stproxy.avUserList.resetUserInfo=function(_587){
console.log("stproxy.avUserList.js resetUserInfo userId: "+_587);
if(this.loginID==_587){
for(var obj in stproxy.avUserList.usersInfo){
stproxy.avUserList.usersInfo[obj].connected=false;
stproxy.avUserList.usersInfo[obj].selfMuted=false;
stproxy.avUserList.usersInfo[obj].mutedByMod=false;
stproxy.avUserList.usersInfo[obj].onHold=false;
}
}else{
for(var obj in stproxy.avUserList.usersInfo){
if(stproxy.avUserList.usersInfo[obj].partId==_587){
stproxy.avUserList.usersInfo[obj].connected=false;
stproxy.avUserList.usersInfo[obj].selfMuted=false;
stproxy.avUserList.usersInfo[obj].mutedByMod=false;
stproxy.avUserList.usersInfo[obj].onHold=false;
}
}
}
this.removeDialoutUsers(true,_587);
};
stproxy.confctrl.isMeetings=function(_588){
if(_588){
_588(typeof MeetingIdSession!="undefined");
}
return (typeof MeetingIdSession!="undefined");
};
stproxy.confctrl.isAnon=function(){
if(stproxy.confctrl.isMeetings()){
stproxy.confctrl.isAnonymous=(this.model.loginId.indexOf("guest")!=-1);
}
return stproxy.confctrl.isAnonymous;
};
stproxy.confctrl.getNativeSIPURI=function(){
if(stproxy.confctrl.isAnon()){
var name=(stproxy.confctrl.isMeetings()?this.model.loginId:("guest"+this.model.loginId));
stproxy.confctrl.nativeSIPURI=name;
}else{
var name=encodeURIComponent(this.model.loginId);
stproxy.confctrl.nativeSIPURI="WebAVClient-"+name;
}
};
stproxy.confctrl.getURI=function(){
var URI="";
switch(stproxy.confctrl.URI_type){
case 1:
URI=stproxy.av.getProxySIPURI();
break;
case 2:
URI=stproxy.confctrl.getTelURI();
break;
}
return URI;
};
stproxy.confctrl.getSIPURI=function(){
if(stproxy.confctrl.isAnon()){
var name=(stproxy.confctrl.isMeetings()?this.model.loginId:("guest"+this.model.loginId));
stproxy.confctrl.sipURI=stproxy.confctrl.sip+":"+name+"@"+stproxy.confctrl.sipProxyAddress;
}else{
var name=encodeURIComponent(this.model.loginId);
if(stproxy.confctrl.SIPTransportProtocol=="TLS"){
stproxy.confctrl.sipProxyAddress=stproxy.confctrl.proxyreghost+":"+stproxy.confctrl.proxyregport;
}
stproxy.confctrl.sipURI=stproxy.confctrl.sip+":"+"WebAVClient-"+name+"@"+stproxy.confctrl.sipProxyAddress;
}
return (stproxy.confctrl.sipURI);
};
stproxy.confctrl.getTelURI=function(_589){
var num=_589;
if(num.indexOf("sips:")!=-1){
num=num.replace("sips:","");
}else{
if(num.indexOf("h323:")!=-1){
num=num.replace("h323:","");
}else{
if(num.indexOf("sip:")!=-1){
num=num.replace("sip:","");
}else{
if(num.indexOf("tel:")!=-1){
num=num.replace("tel:","");
}
}
}
}
stproxy.confctrl.telURI=num;
return (stproxy.confctrl.telURI);
};
stproxy.confctrl.getTeluri=function(_58a){
var num=_58a;
if(num.indexOf("sips:")!=-1){
num=num.replace("sips:","");
}else{
if(num.indexOf("h323:")!=-1){
num=num.replace("h323:","");
}else{
if(num.indexOf("sip:")!=-1){
num=num.replace("sip:","");
}else{
if(num.indexOf("tel:")!=-1){
num=num.replace("tel:","");
}
}
}
}
stproxy.confctrl.teluri=num;
return (stproxy.confctrl.teluri);
};
stproxy.confctrl.updateTeluriForDialout=function(){
stproxy.confctrl.teluri="tel:"+stproxy.confctrl.teluri;
};
stproxy.confctrl.formatNumbersForDisplay=function(_58b){
var num=_58b;
if(num.indexOf("tel:")!=-1){
num=num.substring(4,num.length);
}
if(num.indexOf("sip:")!=-1){
num=num.substring(4,num.length);
}
if(num.indexOf("sips:")!=-1){
num=num.substring(5,num.length);
}
if(num.indexOf("h323:")!=-1){
num=num.substring(5,num.length);
}
return num;
};
stproxy.confctrl.fetchStartingAudioPort=function(){
var _58c=stproxy.policies.get("im.2017");
var _58d="20830";
if(_58c!=null&&_58c!=undefined&&_58c.value!=null&&_58c.value!=undefined){
_58d=_58c.value;
}else{
var _58e=stproxy.policies.get("2017");
if(_58e!=null&&_58e!=undefined&&_58e.value!=null&&_58e.value!=undefined){
_58d=_58e.value;
}
}
stproxy.confctrl.StartingAudioPort=_58d;
};
stproxy.confctrl.fetchStartingVideoPort=function(){
var _58f=stproxy.policies.get("im.2018");
var _590="20832";
if(_58f!=null&&_58f!=undefined&&_58f.value!=null&&_58f.value!=undefined){
_590=_58f.value;
}else{
var _591=stproxy.policies.get("2018");
if(_591!=null&&_591!=undefined&&_591.value!=null&&_591.value!=undefined){
_590=_591.value;
}
}
stproxy.confctrl.StartingVideoPort=_590;
};
stproxy.confctrl.loadAVPolicy=function(){
if(stproxy.policies.get("av.allowWebClient")!=null&&stproxy.policies.get("av.allowWebClient")!=undefined){
stproxy.confctrl.isAVAllowed=stproxy.policies.get("av.allowWebClient").value;
}else{
stproxy.confctrl.isAVAllowed=1;
}
dojo.publish(loggerConfig.topic,["debug","STAVConferenceController.js","getAVPolicy","isWebAVAVAllowed ["+stproxy.confctrl.isAVAllowed+"]"]);
if(stproxy.policies.get("webaudiovideo.onetoonefeature")!=null&&stproxy.policies.get("webaudiovideo.onetoonefeature")!=undefined){
stproxy.confctrl.isAVFeatureEnabled=stproxy.policies.get("webaudiovideo.onetoonefeature").value;
}else{
stproxy.confctrl.isAVFeatureEnabled="true";
}
dojo.publish(loggerConfig.topic,["debug","STAVConferenceController.js","getAVPolicy","isAVFeatureEnabled ["+stproxy.confctrl.isAVFeatureEnabled+"]"]);
if(stproxy.policies.get("av.avCapAvailableThroughSMS")!=null&&stproxy.policies.get("av.avCapAvailableThroughSMS")!=undefined){
stproxy.confctrl.isAVAllow_level=2;
}else{
stproxy.confctrl.isAVAllow_level=2;
}
dojo.publish(loggerConfig.topic,["debug","STAVConferenceController.js","getAVPolicy","AVAllowed Level ["+stproxy.confctrl.isAVAllow_level+"]"]);
if(stproxy.policies.get("av.customVideoResolution")!=null&&stproxy.policies.get("av.customVideoResolution")!=undefined){
stproxy.confctrl.maxVideoBitRate=stproxy.policies.get("av.customVideoResolution").value;
}else{
if(stproxy.policies.get("av.videoResolution")!=null&&stproxy.policies.get("av.videoResolution")!=undefined){
stproxy.confctrl.maxVideoBitRate=stproxy.policies.get("av.videoResolution").value;
}else{
stproxy.confctrl.maxVideoBitRate="CIF 352x288@15fps 384kbps";
}
}
dojo.publish(loggerConfig.topic,["debug","STAVConferenceController.js","getAVPolicy","videoResolution Policy ["+stproxy.confctrl.maxVideoBitRate+"]"]);
if(stproxy.policies.get("av.allowMultipointCalls")!=null&&stproxy.policies.get("av.allowMultipointCalls")!=undefined){
stproxy.confctrl.allowMultipointCalls=stproxy.policies.get("av.allowMultipointCalls").value;
}else{
stproxy.confctrl.allowMultipointCalls=1;
}
dojo.publish(loggerConfig.topic,["debug","STAVConferenceController.js","getAVPolicy","allowMultipointCalls Policy ["+stproxy.confctrl.allowMultipointCalls+"]"]);
if(stproxy.policies.get("av.allowAccessToTPartyFromCListAndIM")!=null&&stproxy.policies.get("av.allowAccessToTPartyFromCListAndIM")!=undefined){
stproxy.confctrl.isAllowAccessToTParty=stproxy.policies.get("av.allowAccessToTPartyFromCListAndIM").value;
}else{
stproxy.confctrl.isAllowAccessToTParty=1;
}
dojo.publish(loggerConfig.topic,["debug","STAVConferenceController.js","getAVPolicy","allowAccessToTPartyFromCListAndIM Policy ["+stproxy.confctrl.isAllowAccessToTParty+"]"]);
stproxy.confctrl.fetchStartingAudioPort();
stproxy.confctrl.fetchStartingVideoPort();
};
stproxy.confctrl.loadLTPAToken=function(){
stproxy.confctrl.ltpaTokenCookie=dojo.cookie("LtpaToken");
if(stproxy.confctrl.ltpaTokenCookie===undefined||stproxy.confctrl.ltpaTokenCookie===""){
stproxy.confctrl.ltpaTokenCookie=dojo.cookie("LtpaToken2");
}
};
stproxy.confctrl.loadWebPlayerVersion=function(){
stproxy.webavver.get("WebPlayerVersion",stproxy.confctrl.getWebPlayerVersionCallback,stproxy.confctrl.getWebPlayerVersionErrcallback);
stproxy.confctrl.webavClientUpdateUrl=(stproxy.confctrl.isMeetings()?stproxyAddress:stproxyConfig.server+"/stwebav");
console.log("webavClientUpdateUrl=>"+stproxy.confctrl.webavClientUpdateUrl);
stproxy.confctrl.webavClientUpdateUrl=stproxyConfig.server+"/stwebav";
console.log("webavClientUpdateUrl=>"+stproxy.confctrl.webavClientUpdateUrl);
};
stproxy.confctrl.getRespSPId=function(obj){
if(obj.length>0){
for(var i=0;i<obj.length;i++){
if(obj[i].propId=="ServiceProviderId"){
if(obj[i].propVal=="com.ibm.mediaserver.telephony.conferencing.service.ConferenceService"){
stproxy.confctrl.SametimeAVProp=obj;
}else{
if(obj[i].propVal==window.roomInformation.conferencingInfo.id){
stproxy.confctrl.SPProperties=obj;
}
}
}
}
}
};
stproxy.confctrl.isDummyProviderList=function(_592){
if(_592[0].none=="none"){
return true;
}
return false;
};
stproxy.confctrl.getServerAttributes=function(){
dojo.publish(loggerConfig.topic,["exiting","STAVConferenceController.js","getServerAttributes",null]);
stproxy.confctrl.ServerAttrArray=stproxy.serverAttributes;
dojo.publish(loggerConfig.topic,["debug","STAVConferenceController.js","getServerAttributes","ServerAttributes ["+dojo.toJson(stproxy.confctrl.ServerAttrArray)+"]"]);
for(obj in stproxy.confctrl.ServerAttrArray){
if(stproxy.confctrl.ServerAttrArray[obj].id=="av.encryption"){
var encp=stproxy.confctrl.ServerAttrArray[obj].value;
if(encp==0){
stproxy.confctrl.EncryptionType="RC2";
}else{
if(encp==1){
stproxy.confctrl.EncryptionType="SRTP";
}else{
if(encp==2){
stproxy.confctrl.EncryptionType="No Encryption";
}
}
}
}else{
if(stproxy.confctrl.ServerAttrArray[obj].id=="av.videoResolution"){
stproxy.confctrl.maxVideoBitRate=stproxy.confctrl.ServerAttrArray[obj].value;
}else{
if(stproxy.confctrl.ServerAttrArray[obj].id=="web.player.version"){
stproxy.confctrl.webPlayerVersion=stproxy.confctrl.ServerAttrArray[obj].value;
}else{
if(stproxy.confctrl.ServerAttrArray[obj].id=="softphone.plugin.version"){
stproxy.confctrl.softphonePluginVersion=stproxy.confctrl.ServerAttrArray[obj].value;
}else{
if(stproxy.confctrl.ServerAttrArray[obj].id=="webav.client.update.url"){
stproxy.confctrl.webavClientUpdateUrl=stproxy.confctrl.ServerAttrArray[obj].value;
}
}
}
}
}
}
if(stproxy.confctrl.EncryptionType==""||stproxy.confctrl.EncryptionType==undefined){
stproxy.confctrl.EncryptionType="SRTP";
}
dojo.publish(loggerConfig.topic,["exiting","STAVConferenceController.js","getServerAttributes",null]);
};
stproxy.confctrl.getConfigAttributes=function(_593){
dojo.publish(loggerConfig.topic,["entering","STAVConferenceController.js","getConfigAttributes",null]);
dojo.publish(loggerConfig.topic,["debug","STAVConferenceController.js","getConfigAttributes","SametimeAVConfigProperties ["+dojo.toJson(stproxy.confctrl.SametimeAVProp)+"]"]);
dojo.publish(loggerConfig.topic,["debug","STAVConferenceController.js","getConfigAttributes","SPProperties ["+dojo.toJson(stproxy.confctrl.SPProperties)+"]"]);
stproxy.confctrl.SPPropSize=stproxy.confctrl.SametimeAVProp.length;
stproxy.confctrl.SPPropSTArray=new Array();
if(stproxy.confctrl.SPPropSize>0){
for(var i=0;i<stproxy.confctrl.SPPropSize;i++){
stproxy.confctrl.SPPropSTArray[stproxy.confctrl.SametimeAVProp[i].propId]=stproxy.confctrl.SametimeAVProp[i].propVal;
}
stproxy.confctrl.NATEnabled=stproxy.confctrl.SPPropSTArray["av.enableNATTraversal"];
if(stproxy.confctrl.NATEnabled=="true"){
stproxy.confctrl.NATEnabled=true;
}else{
stproxy.confctrl.NATEnabled=false;
}
stproxy.confctrl.proxyreghost=stproxy.confctrl.SPPropSTArray["av.sipPRServerHost"];
stproxy.confctrl.proxyregport=stproxy.confctrl.SPPropSTArray["av.sipPRServerPort"];
stproxy.confctrl.sipProxyAddress=stproxy.confctrl.SPPropSTArray["sip.proxy.address"];
stproxy.confctrl.SIPTransportProtocol=stproxy.confctrl.SPPropSTArray["av.sipPRServerTransportProtocol"];
stproxy.confctrl.PreferredAudioCodecs=stproxy.confctrl.SPPropSTArray["av.audioCodecPreferenceList"];
if(stproxy.confctrl.PreferredAudioCodecs==""||stproxy.confctrl.PreferredAudioCodecs=="undefined"){
stproxy.confctrl.PreferredAudioCodecs="ISAC,iLBC,G7221-32000,G7221-24000,G7221-16000,G.711";
}
stproxy.confctrl.PreferredVideoCodecs=stproxy.confctrl.SPPropSTArray["av.videoCodecPreferenceList"];
if(stproxy.confctrl.PreferredVideoCodecs==""||stproxy.confctrl.PreferredAudioCodecs=="undefined"){
stproxy.confctrl.PreferredVideoCodecs="H264,H263";
}
if(stproxy.confctrl.SIPTransportProtocol=="TLS"){
stproxy.confctrl.sip="sips";
}else{
stproxy.confctrl.sip="sip";
}
stproxy.confctrl.TurnServerUdpHost=stproxy.confctrl.SPPropSTArray["av.TurnServerUdpHost"];
stproxy.confctrl.TurnServerUdpPort=stproxy.confctrl.SPPropSTArray["av.TurnServerUdpPort"];
stproxy.confctrl.TurnServerAcceptTcp=stproxy.confctrl.SPPropSTArray["av.TurnServerAcceptTcp"];
stproxy.confctrl.TurnServerTcpHost=stproxy.confctrl.SPPropSTArray["av.TurnServerTcpHost"];
stproxy.confctrl.TurnServerTcpPort=stproxy.confctrl.SPPropSTArray["av.TurnServerTcpPort"];
stproxy.confctrl.IceRto=stproxy.confctrl.SPPropSTArray["av.IceRto"];
stproxy.confctrl.IceRc=stproxy.confctrl.SPPropSTArray["av.IceRc"];
stproxy.confctrl.IceRm=stproxy.confctrl.SPPropSTArray["av.IceRm"];
if(stproxy.confctrl.TurnServerUdpHost==undefined){
stproxy.confctrl.TurnServerUdpHost="";
}
if(stproxy.confctrl.TurnServerUdpPort==undefined){
stproxy.confctrl.TurnServerUdpPort="";
}
if(stproxy.confctrl.TurnServerAcceptTcp==undefined){
stproxy.confctrl.TurnServerAcceptTcp="";
}
if(stproxy.confctrl.TurnServerTcpHost==undefined){
stproxy.confctrl.TurnServerTcpHost="";
}
if(stproxy.confctrl.TurnServerTcpPort==undefined){
stproxy.confctrl.TurnServerTcpPort="";
}
if(stproxy.confctrl.IceRto==undefined){
stproxy.confctrl.IceRto="";
}
if(stproxy.confctrl.IceRc==undefined){
stproxy.confctrl.IceRc="";
}
if(stproxy.confctrl.IceRm==undefined){
stproxy.confctrl.IceRm="";
}
if(_593){
stproxy.confctrl.isTelephonyEnabled=stproxy.confctrl.SPPropSTArray["TelephoneConferenceEnabled"];
stproxy.confctrl.isAVEnabled=stproxy.confctrl.SPPropSTArray["VideoConferenceEnabled"];
stproxy.confctrl.isSIPEnabled=stproxy.confctrl.SPPropSTArray["SIPConferenceEnabled"];
stproxy.confctrl.maxConfUsers=stproxy.confctrl.SPPropSTArray["MaximumConferenceUsers"];
stproxy.confctrl.maxVConfUsers=stproxy.confctrl.SPPropSTArray["MaximumVideoConferenceUsers"];
stproxy.confctrl.maxAConfUsers=stproxy.confctrl.SPPropSTArray["MaximumAudioConferenceUsers"];
stproxy.confctrl.NATKeepAliveRequestInterval=stproxy.confctrl.SPPropSTArray["av.NATKeepAliveRequestInterval"];
stproxy.confctrl.SIPRegistrationExpirationInterval=stproxy.confctrl.SPPropSTArray["av.SIPRegistrationExpirationInterval"];
if(stproxy.confctrl.NATKeepAliveRequestInterval==undefined){
stproxy.confctrl.NATKeepAliveRequestInterval=-1;
}
if(stproxy.confctrl.SIPRegistrationExpirationInterval==undefined){
stproxy.confctrl.SIPRegistrationExpirationInterval=-1;
}
}
}
if(!_593){
stproxy.confctrl.SPPropArray=new Array();
stproxy.confctrl.SPPropSize=stproxy.confctrl.SPProperties.length;
if(stproxy.confctrl.SPPropSize>0){
for(var i=0;i<stproxy.confctrl.SPPropSize;i++){
stproxy.confctrl.SPPropArray[stproxy.confctrl.SPProperties[i].propId]=stproxy.confctrl.SPProperties[i].propVal;
}
stproxy.confctrl.isTelephonyEnabled=stproxy.confctrl.SPPropArray["TelephoneConferenceEnabled"];
stproxy.confctrl.isAVEnabled=stproxy.confctrl.SPPropArray["VideoConferenceEnabled"];
stproxy.confctrl.isSIPEnabled=stproxy.confctrl.SPPropArray["SIPConferenceEnabled"];
stproxy.confctrl.maxConfUsers=stproxy.confctrl.SPPropArray["MaximumConferenceUsers"];
stproxy.confctrl.maxVConfUsers=stproxy.confctrl.SPPropArray["MaximumVideoConferenceUsers"];
stproxy.confctrl.maxAConfUsers=stproxy.confctrl.SPPropArray["MaximumAudioConferenceUsers"];
}
}
dojo.publish(loggerConfig.topic,["exiting","STAVConferenceController.js","getConfigAttributes",null]);
};
stproxy.confctrl.getMediaServerAttribute=function(){
dojo.publish(loggerConfig.topic,["exiting","STAVConferenceController.js","getMediaServerAttribute",null]);
var _594=new Array();
_594=stproxy.serverAttributes;
dojo.publish(loggerConfig.topic,["debug","STAVConferenceController.js","getMediaServerAttribute","ServerAttributes ["+dojo.toJson(_594)+"]"]);
for(obj in _594){
if(_594[obj].id=="9062"){
stproxy.confctrl.isMediaConfigured=_594[obj].value;
}
}
dojo.publish(loggerConfig.topic,["exiting","STAVConferenceController.js","getMediaServerAttribute",null]);
};
stproxy.confctrl.checkParticipantMaxLimitReached=function(_595){
var _596=0;
if(stproxy.confctrl.URI_type==1){
if(stproxy.confctrl.AVCallType==1){
_596=stproxy.confctrl.maxAConfUsers;
}else{
_596=stproxy.confctrl.maxVConfUsers;
}
}else{
_596=stproxy.confctrl.maxConfUsers;
}
if(_596&&stproxy.confctrl.connectedUserCount()>=_596){
if(_595){
var str=new String(stproxy.confctrl._nlsResources.str_label_participantLimitExceededDlg);
dojo.byId("ErrorStringPartLimitExceededMOD").innerHTML=str.format(1,_596);
if(str!=null){
delete str;
}
dijit.byId("participantLimitExceededDlg").show();
return true;
}else{
if(stproxy.confctrl.connectedUserCount()==_596){
dijit.byId("participantLimitReachedMODDlg").show();
}
return true;
}
}
return false;
};
stproxy.confctrl.setMyCapability=function(){
stproxy.capability.set("voip","true");
stproxy.capability.set("audioVideo","true");
stproxy.capability.set("telephony","true");
stproxy.capability.set("com.ibm.st.capSoftphone","true");
stproxy.capability.set("com.ibm.st.capVideoChat","true");
stproxy.capability.set("com.ibm.st.cap.prodVersion","8.5.0");
};
stproxy.confctrl.isPartTheMod=function(_597){
return (_597==stproxy.confctrl.moderatorId);
};
stproxy.confctrl.iAmTheParticipant=function(_598){
return (_598===this.model.loginId);
};
stproxy.confctrl.encodeXML=function(_599){
var i,s,ch,line,lk,_59a,_59b;
_59a=function(){
lk=_599.charAt(i);
i+=1;
};
_59b=function(){
if(ch<" "||ch>"~"){
line.push("&#"+ch.charCodeAt(0)+";");
}else{
line.push(ch);
}
};
line=[];
i=0;
_59a();
while(i<=_599.length){
ch=lk;
_59a();
switch(ch){
case "<":
line.push("&lt;");
break;
case ">":
line.push("&gt;");
break;
case "&":
line.push("&amp;");
break;
case "\"":
line.push("&quot;");
break;
case "'":
line.push("&#39;");
break;
default:
_59b();
}
}
line=line.join("");
return line;
};
var clientDetect={urlFF:"STWebPlayer.xpi",urlMac:"STWebPlayerMac.xpi",urlIE:"",init:function(){
this.browser=this.searchString(this.dataBrowser)||"An unknown browser";
this.version=this.searchVersion(navigator.userAgent)||this.searchVersion(navigator.appVersion)||"an unknown version";
this.OS=this.searchString(this.dataOS)||"an unknown OS";
if(this.OS=="Windows7"){
this.urlIE="STWebPlayerWin7.CAB";
}else{
if(this.OS=="Windows"){
this.urlIE="STWebPlayer.CAB";
}
}
switch(clientDetect.browser){
case "Firefox":
this.isFF=true;
break;
case "Explorer":
this.isIE=true;
break;
case "Chrome":
this.isChrome=true;
break;
case "Safari":
this.isSafari=true;
break;
}
},setLLSettings:function(){
this.urlFF="STWebPlayerLL.xpi";
this.urlMac="STWebPlayerMacLL.xpi";
if(this.OS=="Windows7"){
if(customEnvironment!=undefined&&customEnvironment!=null&&customEnvironment=="LotusLive"){
this.urlIE="STWebPlayerWin7LL.CAB";
}
}else{
if(this.OS=="Windows"){
if(customEnvironment!=undefined&&customEnvironment!=null&&customEnvironment=="LotusLive"){
this.urlIE="STWebPlayerLL.CAB";
}
}
}
},isWebAVSupported:function(){
if(clientDetect.OS=="Windows"||clientDetect.OS=="Windows7"){
if(clientDetect.browser==="Firefox"||clientDetect.browser==="Explorer"||clientDetect.browser==="Chrome"){
return true;
}
}else{
if(clientDetect.OS=="Mac"){
if(clientDetect.browser==="Firefox"||clientDetect.browser==="Safari"){
return true;
}
}
}
return false;
},searchString:function(data){
for(var i=0;i<data.length;i++){
var _59c=data[i].string;
var _59d=data[i].prop;
this.versionSearchString=data[i].versionSearch||data[i].identity;
if(_59c){
if(_59c.indexOf(data[i].subString)!=-1){
return data[i].identity;
}
}else{
if(_59d){
return data[i].identity;
}
}
}
},searchVersion:function(_59e){
var _59f=_59e.indexOf(this.versionSearchString);
if(_59f==-1){
return;
}
return parseFloat(_59e.substring(_59f+this.versionSearchString.length+1));
},is64BitBrowser:function(){
var _5a0=navigator.userAgent;
if(_5a0.indexOf("Trident/4")!=-1||_5a0.indexOf("Trident/5")!=-1||_5a0.indexOf("Trident/6")!=-1){
var _5a1="x64";
if(_5a0.indexOf(_5a1)!=-1){
return true;
}
}
return false;
},dataBrowser:[{string:navigator.userAgent,subString:"Chrome",identity:"Chrome"},{string:navigator.userAgent,subString:"OmniWeb",versionSearch:"OmniWeb/",identity:"OmniWeb"},{string:navigator.vendor,subString:"Apple",identity:"Safari",versionSearch:"Version"},{prop:window.opera,identity:"Opera"},{string:navigator.vendor,subString:"iCab",identity:"iCab"},{string:navigator.vendor,subString:"KDE",identity:"Konqueror"},{string:navigator.userAgent,subString:"Firefox",identity:"Firefox"},{string:navigator.vendor,subString:"Camino",identity:"Camino"},{string:navigator.userAgent,subString:"Netscape",identity:"Netscape"},{string:navigator.userAgent,subString:"MSIE",identity:"Explorer",versionSearch:"MSIE"},{string:navigator.userAgent,subString:"Gecko",identity:"Mozilla",versionSearch:"rv"},{string:navigator.userAgent,subString:"Mozilla",identity:"Netscape",versionSearch:"Mozilla"}],dataOS:[{string:navigator.userAgent,subString:"Windows NT 5",identity:"Windows"},{string:navigator.userAgent,subString:"Windows NT 6",identity:"Windows7"},{string:navigator.platform,subString:"Mac",identity:"Mac"},{string:navigator.userAgent,subString:"iPhone",identity:"iPhone/iPod"},{string:navigator.platform,subString:"Linux",identity:"Linux"}]};
clientDetect.init();
(function(){
window["_OnCallStatus"+STAVConst.SOFTPHONE_PLUGIN_ID+stproxy.av.appId]=function(_5a2){
Proxy_OnCallStatus(_5a2);
};
})();
function Proxy_OnCallStatus(_5a3){
if(_5a3.indexOf("CALLBACK_JSON")!=-1){
_5a3=_5a3.substring(_5a3.indexOf(":")+1);
var _5a4=eval("("+_5a3+")");
var _5a5=_5a4.response?_5a4.response:"";
if(_5a4.callId){
stproxy.invoke("stproxy.broadcast.onNativeCallback",[_5a4.callId,_5a4.callbackId,_5a5]);
}else{
Proxy_OnCallStatusExt(_5a4.callbackId,_5a5);
}
}else{
Proxy_OnCallStatusExt(_5a3);
}
};
function Proxy_OnCallStatusExt(_5a6,_5a7){
if(_5a6.indexOf("WEBAV32")==-1&&_5a6.indexOf("WEBAV31")==-1){
console.log("Proxy_OnCallStatus - response "+_5a6);
}
switch(_5a6){
case "I101":
stproxy.confctrl.callEstablished(STAVConst.VIDEO_CALL);
break;
case "I104":
break;
case "I103":
stproxy.confctrl.callEstablished(STAVConst.AUDIO_CALL);
break;
case "E101":
break;
case "I100":
stproxy.softphone.setAttribute("status",STAVConst.SOFTPHONE_INIT_COMPLETED);
stproxy.av.setBootstrapData("isRegistered",true);
stproxy.av.setMyCapability();
stproxy.conf["onSIPRegCompleted"].stproxyApply();
stproxy.invoke("stproxy.broadcast.nativePlugin.initChild");
break;
case "I102":
stproxy.avError.processNativeError(_5a6);
break;
case "WEBAV01":
case "WEBAV02":
case "WEBAV03":
case "WEBAV04":
case "WEBAV05":
case "WEBAV06":
stproxy.avError.processNativeMainErr(_5a6);
break;
case "WEBAV07":
case "WEBAV08":
case "WEBAV09":
case "WEBAV10":
stproxy.avError.processNativeError(_5a6);
break;
case "WEBAV11":
case "WEBAV12":
stproxy.avError.processNativeMainErr(_5a6);
break;
case "WEBAV13":
stproxy.avError.processNativeError(_5a6);
break;
case "WEBAV14":
case "WEBAV28":
stproxy.softphone.setAttribute("status",STAVConst.SOFTPHONE_INIT_INPROGRESS);
if(!stproxy.confctrl.isPluginInstallFailed){
console.log("plugin is initializing ... ");
}
break;
case "WEBAV15":
case "WEBAV17":
case "WEBAV19":
case "WEBAV20":
stproxy.avError.processNativeError(_5a6);
break;
case "WEBAV21":
case "WEBAV22":
case "WEBAV23":
case "WEBAV24":
case "WEBAV25":
case "WEBAV26":
case "WEBAV27":
stproxy.avError.processNativeMainErr(_5a6);
break;
case "WEBAV33":
case "WEBAV34":
case "WEBAV35":
case "WEBAV41":
case "WEBAV42":
case "WEBAV43":
case "WEBAV44":
case "WEBAV45":
case "WEBAV46":
case "WEBAV47":
case "WEBAV48":
case "WEBAV49":
case "WEBAV50":
case "WEBAV51":
case "WEBAV52":
case "WEBAV53":
case "WEBAV54":
case "WEBAV56":
case "WEBAV57":
stproxy.avError.processNativeError(_5a6);
break;
case "WEBAV58":
stproxy.avError.processNativeMainErr(_5a6);
break;
case "WEBAV38":
stproxy.confctrl.model["onStatisticsUpdate"].stproxyApply("",[_5a7]);
break;
case "WEBAV59":
stproxy.confctrl.model["onVideoRequested"].stproxyApply();
break;
case "WEBAV60":
stproxy.updateAVModelStub(stproxy.confctrl.model.callId,"",{"hasVideo":true});
stproxy.confctrl.model["onVideoStarted"].stproxyApply();
break;
case "WEBAV61":
stproxy.updateAVModelStub(stproxy.confctrl.model.callId,"",{"hasVideo":false});
stproxy.confctrl.model["onVideoStopped"].stproxyApply();
break;
case "WEBAV63":
stproxy.confctrl.handleOnHold();
break;
case "WEBAV64":
break;
case "WEBAV66":
stproxy.avDevicePref["_handleDeviceListUpdate"].stproxyApply("",["S",_5a7]);
break;
case "WEBAV67":
stproxy.avDevicePref["_handleDeviceListUpdate"].stproxyApply("",["M",_5a7]);
break;
case "WEBAV68":
stproxy.avDevicePref["_handleDeviceListUpdate"].stproxyApply("",["C",_5a7]);
break;
case "WEBAV69":
stproxy.avError.processNativeMainErr(_5a6);
break;
default:
if(_5a6.indexOf("I101")!=-1){
var _5a8=stproxy.webplayer.getWindowHandle();
stproxy.softphone.startVideo(stproxy.confctrl.conferenceId,_5a8);
stproxy.confctrl.isVideoStarted=true;
stproxy.confctrl.isAudioStarted=true;
stproxy.confctrl.isCallEstablished=true;
}else{
if(_5a6.indexOf("WEBAV39")!=-1){
var resp=_5a6;
var _5a9=resp.substring(resp.indexOf(":")+1);
var mic=_5a9.substring(_5a9.indexOf(":")+1,_5a9.indexOf("#"));
var spk=_5a9.substring(_5a9.lastIndexOf(":")+1);
stproxy.confctrl.model["onVolumePreference"].stproxyApply("",[mic,spk]);
}
}
break;
}
};
stproxy.softphone={isMainWindow:true,isSTWebInitCalled:false,pluginname:STAVConst.SOFTPHONE_PLUGIN_NAME,pluginId:STAVConst.SOFTPHONE_PLUGIN_ID,_version:"",status:STAVConst.SOFTPHONE_INIT_NOTSTARTED,setMainWindowFlag:function(flag){
this.isMainWindow=flag;
},setAttribute:function(_5aa,_5ab){
this[_5aa]=_5ab;
},getAttribute:function(_5ac){
return this[_5ac];
},getStatus:function(){
return this.status;
},getPluginDetails:function(){
var args={"pluginId":this.pluginId,"pluginName":this.pluginname,"initCallback":"init"};
return args;
},init:function(){
console.log("stproxy.softphone.init enter");
var _5ad={"softphonePluginVersion":this._version,"webavClientUpdateUrl":stproxy.webplayer.getAttribute("_webPlayerURL"),"webPlayerVersion":stproxy.webplayer.getAttribute("_version")};
var args={"nativeSIPURI":stproxy.av.getNativeSIPURI(),"params":stproxy.av.getNativeInitParam(_5ad)};
if(!this.isSTWebInitCalled){
var _5ae;
try{
console.log("stproxy.softphone.init"+args);
stproxy.softphone._init(args);
stproxy.softphone.status=STAVConst.SOFTPHONE_INIT_INPROGRESS;
this.isSTWebInitCalled=true;
stproxy.av.setBootstrapData("isSTWebInitCalled",true);
if(clientDetect.isIE){
clearTimeout(_5ae);
}
}
catch(e){
this.isSTWebInitCalled=false;
stproxy.av.setBootstrapData("isSTWebInitCalled",false);
if(clientDetect.isIE){
_5ae=setTimeout("stproxy.softphone.init()",2000);
}
}
}
console.log("stproxy.softphone.init exit");
},unInit:function(_5af){
this.uninitialize(_5af);
stproxy.webplayer.unregisterPlugin(this.pluginname);
this.isSTWebInitCalled=false;
},_init:function(args){
console.log("stproxy.softphone.init: args.nativeSIPURI"+args.nativeSIPURI);
var _5b0=stproxy.confctrl.encodeXML(args.nativeSIPURI);
var _5b1="<Init><RequiredAttributes>"+"<Attribute Name='IsServiceProviderInternal' Value='"+args.params.isInternalServiceProvider+"'/>"+"<Attribute Name='PluginID' Value='"+args.params.pluginId+"'/>"+"<Attribute Name='PluginName' Value='"+args.params.pluginname+"'/>"+"<Attribute Name='TurnServerUdpHost' Value='"+args.params.TurnServerUdpHost+"'/>"+"<Attribute Name='TurnServerUdpPort' Value='"+args.params.TurnServerUdpPort+"'/>"+"<Attribute Name='TurnServerAcceptTcp' Value='"+args.params.TurnServerAcceptTcp+"'/>"+"<Attribute Name='TurnServerTcpHost' Value='"+args.params.TurnServerTcpHost+"'/>"+"<Attribute Name='TurnServerTcpPort' Value='"+args.params.TurnServerTcpPort+"'/>"+"<Attribute Name='IceRto' Value='"+args.params.IceRto+"'/>"+"<Attribute Name='IceRc' Value='"+args.params.IceRc+"'/>"+"<Attribute Name='IceRm' Value='"+args.params.IceRm+"'/>"+"<Attribute Name='NATKeepAliveRequestInterval' Value='"+args.params.NATKeepAliveRequestInterval+"'/>"+"<Attribute Name='SIPRegistrationExpirationInterval' Value='"+args.params.SIPRegistrationExpirationInterval+"'/>"+"<Attribute Name='PluginVersion' Value='"+args.params.softphonePluginVersion+"'/>"+"<Attribute Name='Server' Value='"+args.params.webavClientUpdateUrl+"'/>"+"<Attribute Name='ProxyHost' Value='"+args.params.proxyreghost+"'/>"+"<Attribute Name='NATEnabled' Value='"+args.params.NATEnabled+"'/>"+"<Attribute Name='ProxyPort' Value='"+args.params.proxyregport+"'/>"+"<Attribute Name='SIPURI' Value='"+_5b0+"'/>"+"<Attribute Name='LtpaToken' Value='"+args.params.ltpaTokenCookie+"'/>"+"<Attribute Name='SIPTransportProtocol' Value='"+args.params.SIPTransportProtocol+"'/>"+"<Attribute Name='EncryptionType' Value='"+args.params.EncryptionType+"'/>"+"<Attribute Name='PreferredAudioCodecs' Value='"+args.params.PreferredAudioCodecs+"'/>"+"<Attribute Name='MaxVideoBitRate' Value='"+args.params.maxVideoBitRate+"'/>"+"<Attribute Name='IsAnonymous' Value='"+args.params.isAnonymous+"'/>"+"<Attribute Name='PreferredVideoCodecs' Value='"+args.params.PreferredVideoCodecs+"'/>"+"<Attribute Name='StartingAudioPort' Value='"+args.params.StartingAudioPort+"'/>"+"<Attribute Name='StartingVideoPort' Value='"+args.params.StartingVideoPort+"'/>"+"<Attribute Name='EnableSVC' Value='"+args.params.enableSVC+"'/>"+"<Attribute Name='LineRate' Value='"+args.params.lineRate+"'/>"+"<Attribute Name='EnableClientEncryption' Value='"+args.params.enableClientEncryption+"'/>"+"<Attribute Name='CustomVideoBitRate' Value='"+args.params.cutomVideoBitRate+"'/>"+"<Attribute Name='EnableTURNTokenAuth' Value='"+args.params.enableTURNTokenAuth+"'/>"+"<Attribute Name='CertAutoAccept' Value='"+args.params.enableTLSCertAutoAccept+"'/>"+"<Attribute Name='EnableHTTPConnect' Value='"+args.params.enableHTTPConnect+"'/>"+"<Attribute Name='AuthenticationType' Value='"+args.params.sipAuthType+"'/> "+"<Attribute Name='ClientSIPProxyHost' Value='"+args.params.clientsipPRServerHost+"'/>"+"<Attribute Name='ClientSIPProxyPort' Value='"+args.params.clientsipPRServerPort+"'/>"+"<Attribute Name='ClientSIPTransport' Value='"+args.params.clientsipPRServerTransportProtocol+"'/>"+"<Attribute Name='TurnServerSSLEnabled' Value='"+args.params.turnServerTransportSSLEnabled+"'/>"+"<Attribute Name='BrowserName' Value='"+clientDetect.browser+"'/>"+"<Attribute Name='AnonToken' Value='"+args.params.turnAuthToken+"'/>"+"<Attribute Name='ServerDeploymentType' Value='"+args.params.customEnvironment+"'/> "+"<Attribute Name='MediaTURNNATTraversalEnabled' Value='"+args.params.mediaTURNNATTraversalEnabled+"'/>"+"<Attribute Name='MediaTURNTokenAuthEnabled' Value='"+args.params.mediaTURNTokenAuthEnabled+"'/>"+"<Attribute Name='MediaTURNNATKeepAliveRequestInterval' Value='"+args.params.mediaTURNNATKeepAliveRequestInterval+"'/>"+"<Attribute Name='MediaTURNServerUdpHost' Value='"+args.params.mediaTURNServerUdpHost+"'/>"+"<Attribute Name='MediaTURNServerUdpPort' Value='"+args.params.mediaTURNServerUdpPort+"'/>"+"<Attribute Name='MediaTURNServerTLSHost' Value='"+args.params.mediaTURNServerTLSHost+"'/>"+"<Attribute Name='MediaTURNServerTLSPort' Value='"+args.params.mediaTURNServerTLSPort+"'/>"+"<Attribute Name='MediaTURNServerAcceptTcp' Value='"+args.params.mediaTURNServerAcceptTcp+"'/>"+"<Attribute Name='MediaTURNServerTcpHost' Value='"+args.params.mediaTURNServerTcpHost+"'/>"+"<Attribute Name='MediaTURNServerTcpPort' Value='"+args.params.mediaTURNServerTcpPort+"'/>"+"<Attribute Name='MediaTURNIceRto' Value='"+args.params.mediaTURNIceRto+"'/>"+"<Attribute Name='MediaTURNIceRc' Value='"+args.params.mediaTURNIceRc+"'/>"+"<Attribute Name='MediaTURNIceRm' Value='"+args.params.mediaTURNIceRm+"'/>"+"<Attribute Name='AppId' Value='"+args.params.appId+"'/>"+"<Attribute Name='MediaTURNServerTransportSSLEnabled' Value='"+args.params.mediaTURNServerTransportSSLEnabled+"'/>";
if(args.params.isSamlToken){
if(typeof (MeetingIdSession)!="undefined"||typeof (roomList)!="undefined"){
args.params.samlToken=saml_tkn;
}
_5b1=_5b1+"<Attribute Name='SAMLAuthenticationEnable' Value='true'/>"+"<Attribute Name='SAMLToken' Value='"+args.params.samlToken+"'/>";
}else{
_5b1=_5b1+"<Attribute Name='SAMLAuthenticationEnable' Value='false'/>";
}
_5b1=_5b1+"</RequiredAttributes></Init>";
var _5b2="<PluginID>"+this.pluginId+"</PluginID><AppId>"+args.params.appId+"</AppId><PluginName>"+this.pluginname+"</PluginName><PluginVersion>"+args.params.softphonePluginVersion+"</PluginVersion><ServerIP>"+args.params.webavClientUpdateUrl+"</ServerIP>";
stproxy.webplayer.initNativePlugin(_5b2,_5b1);
},isInitialized:function(){
return (this.isSTWebInitCalled);
},playSoundFile:function(_5b3,_5b4,loop,_5b5){
stproxy.webplayer.Exec("PM",stproxy.softphone.pluginname,"PlaySoundFile",{"args":["CallId:"+_5b3,"Filename:"+_5b4,"loop:"+loop,"interval:"+_5b5]});
},stopPlaySoundFile:function(_5b6){
stproxy.webplayer.Exec("PM",stproxy.softphone.pluginname,"StopPlayingSoundFile",{"args":["CallId:"+_5b6]});
},startMediaStats:function(_5b7){
stproxy.webplayer.Exec("PM",stproxy.softphone.pluginname,"StartCollectingMediaStats",{"args":["CallId:"+_5b7]});
},stopMediaStats:function(_5b8){
stproxy.webplayer.Exec("PM",stproxy.softphone.pluginname,"StopCollectingMediaStats",{"args":["CallId:"+_5b8]});
},pauseVideo:function(_5b9){
stproxy.webplayer.Exec("PM",stproxy.softphone.pluginname,"PauseVideo",{"args":["CallId:"+_5b9]});
},resumeVideo:function(_5ba){
stproxy.webplayer.Exec("PM",stproxy.softphone.pluginname,"UnPauseVideo",{"args":["CallId:"+_5ba]});
},hideMyVideo:function(_5bb){
stproxy.webplayer.Exec("PM",stproxy.softphone.pluginname,"HideVideo",{"args":["CallId:"+_5bb]});
},showMyVideo:function(_5bc){
stproxy.webplayer.Exec("PM",stproxy.softphone.pluginname,"UnHideVideo",{"args":["CallId:"+_5bc]});
},addVideo:function(_5bd){
stproxy.webplayer.Exec("PM",stproxy.softphone.pluginname,"CallModeChanged",{"args":["CallId:"+_5bd,"CallMode : 0"]});
},removeVideo:function(_5be){
stproxy.webplayer.Exec("PM",stproxy.softphone.pluginname,"CallModeChanged",{"args":["CallId:"+_5be,"CallMode : 1"]});
},getVolumePreference:function(_5bf){
stproxy.webplayer.Exec("PM",stproxy.softphone.pluginname,"GetMicSpeakerVolume",{"args":["CallId:"+_5bf]});
},getDeviceList:function(_5c0,_5c1){
stproxy.webplayer.Exec("PM",stproxy.softphone.pluginname,"GetDeviceList",{"args":["CallId:"+_5c1,"DeviceType:"+_5c0]});
},muteSelf:function(_5c2){
stproxy.webplayer.Exec("PM",stproxy.softphone.pluginname,"Mute",{"args":["CallId:"+_5c2]});
},unmuteSelf:function(_5c3){
stproxy.webplayer.Exec("PM",stproxy.softphone.pluginname,"UnMute",{"args":["CallId:"+_5c3]});
},startVideoCall:function(_5c4){
console.log("isMainWindow=>"+stproxy.softphone.isMainWindow);
stproxy.webplayer.Exec("PM",stproxy.softphone.pluginname,"StartCall",{"args":["CallId:"+_5c4,"VideoEnabled :true","AutoMute:false","IsServiceProviderInternal:true","isAdhocCall:true"]},{"AppId":stproxy.av.appId});
},startAudioCall:function(_5c5){
stproxy.webplayer.Exec("PM",stproxy.softphone.pluginname,"StartCall",{"args":["CallId:"+_5c5,"VideoEnabled :false","AutoMute:false","IsServiceProviderInternal:true","isAdhocCall:true"]},{"AppId":stproxy.av.appId});
},endCall:function(_5c6){
stproxy.webplayer.Exec("PM",stproxy.softphone.pluginname,"EndCall",{"args":["CallId:"+_5c6]});
},startVideo:function(_5c7){
var _5c8=stproxy.webplayer.getWindowHandle();
if(_5c8){
stproxy.webplayer.Exec("PM",stproxy.softphone.pluginname,"StartVideo",{"args":["CallId:"+_5c7,"Width :240","Height :180","hWndChild:"+_5c8]});
}else{
stproxy.webplayer.Exec("PM",stproxy.softphone.pluginname,"StartVideo",{"args":["CallId:"+_5c7,"Width :240","Height :180"]});
}
},stopVideo:function(_5c9,hWnd){
var _5ca=stproxy.webplayer.getWindowHandle();
if(_5ca){
stproxy.webplayer.Exec("PM",stproxy.softphone.pluginname,"StopVideo",{"args":["CallId:"+_5c9,"hWndChild:"+_5ca]});
}else{
stproxy.webplayer.Exec("PM",stproxy.softphone.pluginname,"StopVideo",{"args":["CallId:"+_5c9]});
}
},holdCall:function(_5cb){
stproxy.webplayer.Exec("PM",stproxy.softphone.pluginname,"HoldCall",{"args":["CallId:"+_5cb]});
},resumeCall:function(_5cc){
stproxy.webplayer.Exec("PM",stproxy.softphone.pluginname,"ResumeCall",{"args":["CallId:"+_5cc]});
},uninitialize:function(_5cd,_5ce){
stproxy.webplayer.Exec("PM",stproxy.softphone.pluginname,"UnInitialize",{"args":["CallId:"+_5cd]});
}};
stproxy[STAVConst.SOFTPHONE_PLUGIN_NAME]=stproxy.softphone;
stproxy.avDevicePref={micSelected:"",spkSelected:"",camSelected:"",deviceMap:null,getDeviceList:function(_5cf){
console.log("AVPref Window Name = "+window.name);
stproxy.softphone.getDeviceList(_5cf,window.name);
},_handleDeviceListUpdate:function(_5d0,_5d1){
var _5d2=stproxy.avDevicePref._parseDeviceList(_5d1);
console.log("_handleDeviceListUpdate deviceType ="+_5d0+" , DeviceList ="+_5d2);
if(_5d0==="M"){
stproxy.avDevicePref["onMicListUpdate"].stproxyApply("",[_5d2]);
}else{
if(_5d0==="S"){
stproxy.avDevicePref["onSpeakerListUpdate"].stproxyApply("",[_5d2]);
}else{
if(_5d0==="C"){
stproxy.avDevicePref["onCameraListUpdate"].stproxyApply("",[_5d2]);
}else{
console.error("No Device type selected");
}
}
}
},onMicListUpdate:function(_5d3){
},onSpeakerListUpdate:function(_5d4){
},onCameraListUpdate:function(_5d5){
},setDevicePref:function(mic,spk,cam){
this.micSelected=(mic.split("$"))[0];
this.spkSelected=(mic.split("$"))[0];
this.camSelected=(mic.split("$"))[0];
stproxy.webplayer.Exec("PM",stproxy.softphone.pluginname,"WriteDeviceList",{"args":["SoundIndex :"+spk,"MicIndex :"+mic,"CameraIndex : "+cam]});
},_parseDeviceList:function(_5d6){
_5d6=_5d6.substring(0,_5d6.indexOf("#"));
var _5d7=_5d6.split(":");
var _5d8=[];
for(var i=0;i<_5d7.length;i++){
var _5d9=_5d7[i].split("$");
_5d8.push(_5d9);
}
if(_5d8[0][0][4]=="0"){
return null;
}else{
_5d8.splice(0,1);
return _5d8;
}
},handleMicVolumeUpdate:function(_5da){
var _5db=new Array();
_5db[0]=stproxy.confctrl.model.loginId;
stproxy.conf.setUserProp(_5db,STAVConst.VOICE_LEVEL_PROPERTY,parseFloat(_5da/100),STAVConst.APPLICATION_PUBLIC_PROPERTY_TYPE,stproxy.confctrl.isDialedoutUser,stproxy.confctrl.model.callId,stproxy.confctrl.confCallBack,stproxy.confctrl.confErrCallBack);
},setMicVolumeUpdate:function(_5dc){
stproxy.webplayer.Exec("PM",stproxy.softphone.pluginname,"AdjustMicVolume",{"args":["CallId:"+stproxy.confctrl.model.callId,"value :"+_5dc]});
},updateMicVolume:function(_5dd,_5de){
for(var obj in this.usersInfo){
if(this.usersInfo[obj].partId==_5dd){
this.usersInfo[obj].micVolume=_5de;
}
}
},setSpeakerVolumeUpdate:function(_5df){
stproxy.webplayer.Exec("PM",stproxy.softphone.pluginname,"AdjustSpeakerVolume",{"args":["CallId:"+stproxy.confctrl.model.callId,"value :"+_5df]});
}};
stproxy.connectAVErrorHandlers=function(_5e0){
stproxy.hitch.connect(stproxy.login,"onLogout",function(){
if(stproxyConfig.isAVCallWindow){
window.close();
}
});
stproxy.hitch.connect(stproxy.error,"commsError",function(_5e1,_5e2,_5e3,_5e4){
stproxy.avError.closeAllCalls();
stproxy.uiControl.dialogs.showError(stproxy.i18nStrings.error,stproxy.i18nStrings.avNetworkDisconnectError);
});
stproxy.hitch.connect(stproxy.error,"onSessionExpired",function(){
stproxy.avError.closeAllCalls();
stproxy.uiControl.dialogs.showError(stproxy.i18nStrings.error,stproxy.i18nStrings.avNetworkDisconnectError);
});
stproxy.hitch.connect(stproxy.error,"onServerDown",function(){
stproxy.avError.closeAllCalls();
stproxy.uiControl.dialogs.showError(stproxy.i18nStrings.error,stproxy.i18nStrings.avNetworkDisconnectError);
});
stproxy.hitch.connect(stproxy.error,"onNodeDown",function(){
stproxy.confctrl.isSTProxyNodeDown=true;
stproxy.avError.checkIfSTProxySessionEnded("TCSPI","onNodeDown");
});
stproxy.hitch.connect(stproxy.error,"onNodeUp",function(){
stproxy.confctrl.isSTProxyNodeDown=false;
});
stproxy.hitch.connect(stproxy.error,"onClusterLogin",function(){
});
stproxy.hitch.connect(stproxy.error,"onError",function(){
});
stproxy.hitch.connect(_5e0,"onUserError",function(_5e5,_5e6,_5e7,_5e8,_5e9){
var _5ea=stproxy.i18nStrings.error;
switch(_5e8){
case "com.ibm.telephony.conferencing.error.DialFailure":
switch(_5e7){
case "participantLimitExceeded":
break;
}
break;
case "com.ibm.telephony.conferencing.error.DialBandwidthLimitOther":
stproxy.uiControl.dialogs.showError(_5ea,stproxy.i18nStrings.avMsgDialBandwidthLimitOther);
break;
case "com.ibm.telephony.conferencing.error.DialBandwidthLimit":
if(_5e5===stproxy.av.loginID){
var _5eb=[stproxy.i18nStrings.avMsgDialBandwidthLimit];
if(_5e7&&_5e7!=""){
_5eb.push(_5e7);
}
stproxy.uiControl.dialogs.showError(_5ea,_5eb,null,null,true);
}
break;
case "com.ibm.telephony.conferencing.error.DialBandwidthUnavailable":
var _5eb=[stproxy.i18nStrings.avMsgDialBandwidthUnavailable];
if(_5e7&&_5e7!=""){
_5eb.push(_5e7);
}
stproxy.uiControl.dialogs.showError(_5ea,_5eb,null,null,true);
break;
case "com.ibm.telephony.conferencing.error.DialBandwidthNoVideo":
if(_5e5===stproxy.av.loginID){
var _5eb=[stproxy.i18nStrings.avMsgDialBandwidthNoVideo];
if(_5e7&&_5e7!=""){
_5eb.push(_5e7);
}
stproxy.uiControl.dialogs.showError(_5ea,_5eb,null,null,true);
if(stproxy.confctrl.isVideoStarted){
stproxy.softphone.stopVideo(_5e6);
stproxy.confctrl.isVideoStarted=false;
}
if(stproxy.confctrl.isAudioStarted){
}
}
break;
case "80000224":
case "80000221":
case "com.ibm.telephony.conferencing.error.ServiceUnavailable":
stproxy.avError.closeAllCalls();
var _5eb=[stproxy.i18nStrings.avMsg80000224_1,stproxy.i18nStrings.avMsg80000224_2,stproxy.i18nStrings.avMsg80000224_3];
if(_5e7&&_5e7!=""){
_5eb.push(_5e7);
}
stproxy.uiControl.dialogs.showError(_5ea,_5eb,null,null,true);
break;
case "com.ibm.telephony.conferencing.error.InvalidExpirationTimeForToken":
stproxy.uiControl.dialogs.showError(_5ea,stproxy.i18nStrings.avMsgInvalidExpirationTimeForToken);
break;
case "com.ibm.telephony.conferencing.error.TokenGenerationFailed":
stproxy.uiControl.dialogs.showError(_5ea,stproxy.i18nStrings.avMsgTokenGenerationFailed);
break;
case "com.ibm.telephony.conferencing.error.MissingConfigForToken":
stproxy.uiControl.dialogs.showError(_5ea,stproxy.i18nStrings.avMsgMissingConfigForToken);
break;
case "com.ibm.telephony.conferencing.error.GeneralException":
stproxy.uiControl.dialogs.showError(_5ea,stproxy.i18nStrings.avMsgGeneralException);
break;
}
});
};
stproxy.avError={checkIfSTProxySessionEnded:function(src,err){
var cc=stproxy.confctrl;
if(cc.isSTProxyNodeDown){
if(cc.sipByeReceived){
this.closeAllCalls();
cc.isLoggedIn=false;
stproxy.uiControl.dialogs.showError(stproxy.i18nStrings.error,stproxy.i18nStrings.avNetworkDisconnectError);
}else{
stproxy.uiControl.dialogs.showInformation(stproxy.i18nStrings.connectionLostTitle,stproxy.i18nStrings.connectionLostMessage);
}
}
},closeAllCalls:function(){
try{
if(stproxy.AVModelStubs){
for(var i in stproxy.AVModelStubs){
var m=stproxy.AVModelStubs[i];
if(m){
var w=m.avWindow;
if(!m.isEmbedded){
if(w&&!w.closed){
w.close();
}
}
}
}
}
}
catch(e){
console.log("stproxy.avError.closeAllCalls - exception : "+e);
}
},processNativeMainErr:function(err){
var _5ec=stproxy.i18nStrings.error;
var d=stproxy.uiControl.dialogs;
switch(err){
case "WEBAV11":
d.showError(_5ec,stproxy.i18nStrings.avConnectFailRefreshMainPage);
stproxy.avError.closeAllCalls();
stproxy.invoke("stproxy.conf.setMeetingStartedFlag",[false]);
break;
case "WEBAV12":
stproxy.softphone.setAttribute("status",STAVConst.SOFTPHONE_INIT_FAILED);
d.showError(_5ec,stproxy.i18nStrings.avMsgSlowNWSIPRegistrationFailed);
break;
case "WEBAV01":
d.showError(_5ec,stproxy.i18nStrings.avMsgFileNotFound);
break;
case "WEBAV02":
d.showError(_5ec,stproxy.i18nStrings.avMsgFileNotFound);
break;
case "WEBAV03":
d.showError(_5ec,stproxy.i18nStrings.avMsgCopyFailed);
break;
case "WEBAV04":
d.showError(_5ec,stproxy.i18nStrings.avMsgFailedToWriteINI);
break;
case "WEBAV05":
stproxy.softphone.setAttribute("status",STAVConst.SOFTPHONE_INIT_FAILED);
var _5ed=[stproxy.i18nStrings.avMsgInvalidRegistrarPort1,stproxy.i18nStrings.avMsgInvalidRegistrarPort2];
d.showError(_5ec,_5ed,null,null,true);
break;
case "WEBAV06":
stproxy.softphone.setAttribute("status",STAVConst.SOFTPHONE_INIT_FAILED);
stproxy.av.setBootstrapData("isRegistered",false);
stproxy.confctrl.isRegistrationFailed=true;
stproxy.av.setMyCapability();
break;
case "WEBAV21":
var _5ed=[stproxy.i18nStrings.avMsgBadInstallationFound1,stproxy.i18nStrings.avMsgBadInstallationFound2];
d.showError(_5ec,_5ed,null,null,true);
break;
case "WEBAV22":
d.showError(_5ec,stproxy.i18nStrings.avMsgErrorConnectingWithServer);
break;
case "WEBAV23":
d.showError(_5ec,stproxy.i18nStrings.avMsgArchiveExtrFailed);
break;
case "WEBAV24":
d.showError(_5ec,stproxy.i18nStrings.avMsgPluginUpdateFailedFileMiss);
break;
case "WEBAV25":
d.showError(_5ec,stproxy.i18nStrings.avMsgPluginUpdateFailedErrDownload);
break;
case "WEBAV26":
d.showError(_5ec,stproxy.i18nStrings.avMsgArchiveExtrFailed);
break;
case "WEBAV27":
d.showError(_5ec,stproxy.i18nStrings.avMsgArchiveExtrFailedFileInUse);
break;
case "WEBAV58":
d.showError(stproxy.i18nStrings.information,stproxy.i18nStrings.avNetworkDisconnectErrorMain);
break;
case "WEBAV69":
var _5ed=[stproxy.i18nStrings.avMsgRegistrationFailed1,stproxy.i18nStrings.avRestartPageTryAgain];
d.showError(_5ec,_5ed,null,null,true);
break;
}
},processCritErrInAVWnd:function(err,msg){
stproxy.uiControl.dialogs.showError(stproxy.i18nStrings.error,msg,function(){
window.close();
});
},processNativeError:function(err){
var _5ee=stproxy.i18nStrings.error;
var d=stproxy.uiControl.dialogs;
switch(err){
case "I102":
stproxy.confctrl.sipByeReceived=true;
stproxy.avError.checkIfSTProxySessionEnded("Native","I102");
break;
case "WEBAV07":
case "WEBAV08":
case "WEBAV09":
break;
case "WEBAV10":
d.showError(_5ee,stproxy.i18nStrings.avMsgCameraDeviceBusy);
break;
case "WEBAV11":
window.close();
break;
case "WEBAV13":
break;
case "WEBAV15":
stproxy.confctrl.isPluginInstallFailed=true;
d.showError(_5ee,stproxy.i18nStrings.avMsgFFProfileNotCreated);
break;
case "WEBAV17":
break;
case "WEBAV19":
var _5ef=[stproxy.i18nStrings.avMsgTLSHandshakeFailure1,stproxy.i18nStrings.avMsgTLSHandshakeFailure2];
d.showError(_5ee,_5ef,null,null,true);
break;
case "WEBAV20":
break;
case "WEBAV33":
var _5ef=[stproxy.i18nStrings.avMsgHttpConnectTimeout1,stproxy.i18nStrings.avMsgHttpConnectTimeout2];
d.showError(_5ee,_5ef,null,null,true);
break;
case "WEBAV34":
d.showError(_5ee,stproxy.i18nStrings.avMsgFailedRetreivePACSettings);
break;
case "WEBAV35":
d.showError(_5ee,stproxy.i18nStrings.avMsgHttpConnectDirectConnectFail);
break;
case "WEBAV41":
d.showError(_5ee,stproxy.i18nStrings.avMsgTLSAuthFailCNNOTFound);
break;
case "WEBAV42":
d.showError(_5ee,stproxy.i18nStrings.avMsgTLSAuthFailSelfSigned);
break;
case "WEBAV43":
d.showError(_5ee,stproxy.i18nStrings.avMsgTLSAuthFailNotFoundInTrustStore);
break;
case "WEBAV44":
d.showError(_5ee,stproxy.i18nStrings.avMsgTURNSvrFailure);
break;
case "WEBAV45":
d.showError(_5ee,stproxy.i18nStrings.avMsgICEConnectivityChkFail);
break;
case "WEBAV46":
d.showError(_5ee,stproxy.i18nStrings.avMsgTokenAuthFailWithTURN);
break;
case "WEBAV47":
break;
case "WEBAV48":
d.showError(_5ee,stproxy.i18nStrings.avMsgTURNConnectFailThruProxy);
break;
case "WEBAV49":
d.showError(_5ee,stproxy.i18nStrings.avMsgTURNClusterActiveNodeDown);
break;
case "WEBAV50":
case "WEBAV51":
case "WEBAV52":
case "WEBAV53":
break;
case "WEBAV54":
d.showError(_5ee,stproxy.i18nStrings.avMsgPropPassedInitRegFail);
break;
case "WEBAV56":
break;
case "WEBAV57":
d.showError(_5ee,stproxy.i18nStrings.avMsgUnableToStartVideo);
break;
}
}};