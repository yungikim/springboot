/**
 * CommonJS V 2.5
 * Copyrightⓒ 2009 - 2011 Hyung-goo Yeo All rights reserved.
 */
var protocol = location.protocol;
(function(){
var pb="insert_adjacent_html",pD="type",pQ="Microsoft",pk="XMLHTTP",pf="XMLDOM",pm="content",pG="application",pB="form",px="urlencoded",pT="charset";
var ha="BackgroundImageCache",yM="January",uU="February",nA="March",gC="April",gp="May",oq="June",oN="July",_J="August",yZ="September",eX="October",ou="November",$b="December",D="Sunday",aQ="Monday",ak="Tuesday",af="Wednesday",am="Thursday",aG="Friday",aB="Saturday",ax="일",aT="월",ag="화",aE="수",aw="목",aR="금",aj="토",aK=/^[ \r\n\t]*/g,aI="",aW=/[ \r\n\t]*$/g,aY=/[\r\n]*/g,ah=".",al=/([\d])(\d{3})(\.[\d]*)?$/,aF="$1,$2$3",an=/[\d]\d{3},/,aS=/([\d])(\d{3}),/,ai="$1,$2,",ao=/"/g,aO="&#34;",aH=/&/g,ae="&amp;",aP=/</g,av="&lt;",aL=/>/g,ar="&gt;",as="string",at="&",aV="=",ad=/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2}),\s*(\d{1,2})(((\+|\-)\d{2,4})|Z)$/i,ay=/(\+|\-)\d{2}$/,az="00",a1="$2-$3-$1 $4:$5:$6 UTC$8",a6=/utcz/i,a9="UTC",a5=/(\d{4})\.(\d{1,2})\.(\d{1,2})/gi,a0="$1-$2-$3",a3=/ ze9/i,a4=/(utc|gmt)/i,a7=" UTC+0900",a8=/오전/g,a2="AM",Ma=/오후/g,MU="PM",MA=/(\d{4})-(\d{1,2})-(\d{1,2})/gi,MC="$2-$3-$1",Mp=/(AM|PM)\s*(\d{2}:\d{2}(:\d{2})?)/gi,Mq="$2 $1",MN=/\-/g,MJ="/",MZ="{%",MX="}",Mu="0",Mb="$QQQQ$",MD="$QQQ$",MQ="$RRRR$",Mk="$RRR$",Mf="오전",Mm="오후",MG="GMT",MB="+",Mx="-",MT=":",Mg=/\$/g,ME="\\$",Mw="g",MR="yyyy-MM-dd",Mj="object",MK='splice',MI='join',MW="function",MY='tagName',Mh=/msie/i,Ml=/gecko/i,MF=/webkit/i,Mn=/firefox/i,MS=/chrome/i,Mi=/opera/i,Mo=/(?:msie |firefox\/|version\/|opera\/|chrome\/|safari\/)([\d\.]*)/i,Mc='',MO=' ',MH=/\s+/,Me="|",MP=" ",Mv="number",ML=/^on/,Mr=/^on/i,Ms="on",Mt="left",MV="wheel",Md="right",My="%",Mz="100%",M1="beforeEnd",M6="span",M9="afterBegin",M5="beforeBegin",M0="afterEnd",M3=""+pb+"에 정의되지 않은 "+pD+"임 ->",M4="{",M7=""+pQ+"."+pk+"",M8=/[^\u0000\u0009\u000A\u000D\u0020-\uD7FF\uF900-\uFFFD]/,M2=""+pQ+"."+pf+"",Ua=/([^\u0000\u0009\u000A\u000D\u0020-\uD7FF\uF900-\uFFFD])/gi,UM="?",UU="GET",UA="p",UC="POST",Up=""+pm+"-"+pD+"",Uq=""+pG+"/x-www-"+pB+"-"+px+"; "+pT+"=UTF-8",UN="text",UJ="i",UZ="text/xml",UX="; expires=",Uu="; path=",Ub="; domain=",UD="; secure",UQ="_lower_hash",Uk="_hash",Uf=";",Um="=;expires=";
var UB=Date,Ux=Function,UT=Math,Ug=Number,UE=Object,Uw=RegExp,UR=String,Uj=decodeURIComponent,UK=encodeURIComponent,UI=isNaN,UW=true,UY=false,Uh=document,UF=window,Un=alert;
try{var UG=ActiveXObject,Ul=event;}catch(e){}
var US="uniqueID",Ui="compatMode",Uo="XMLHttpRequest",Uc="execCommand",UO="extend",UH="toString",Ue="replace",UP="trim",Uv="indexOf",UL="substring",Ur="search",Us="lastIndexOf",Ut="length",UV="right",Ud="left",Uy="split",Uz="toLowerCase",U1="charCodeAt",U6="byte_length",U9="test",U5="parse",U0="prototype",U3="fixed_length",U4="getTimezoneOffset",U7="abs",U8="zero_prefix",U2="getHours",Aa="getFullYear",AM="getMonth",AU="getDate",AA="getMinutes",AC="getSeconds",Ap="getMilliseconds",Aq="getDay",AN="format",AJ="to_array",AZ="shift",AX="apply",Au="concat",Ab="event",AD="__browser",AQ="user_agent",Ak="navigator",Af="userAgent",Am="is_ie",AG="is_gecko",AB="is_webkit",Ax="is_firefox",AT="is_chrome",Ag="is_safari",AE="is_opera",Aw="version",AR="match",Aj="language",AK="browserLanguage",AI="userLanguage",AW="__dom",AY="add_class",Ah="className",Al="join",AF="push",An="remove_class",AS="get_position",Ai="offsetLeft",Ao="offsetTop",Ac="offsetParent",AO="parentNode",AH="scrollLeft",Ae="scrollTop",AP="get_window",Av="ownerDocument",AL="parentWindow",Ar="get_size",As="insert_adjacent_html",At="insertAdjacentHTML",AV="get_stylesheets",Ad="styleSheets",Ay="ownerNode",Az="id",A1="stylesheet",A6="addRule",A9="rules",A5="style",A0="currentStyle",A3="remove_node",A4="removeNode",A7="add_event_listener",A8="addEventListener",A2="attachEvent",Ca="remove_event_listener",CM="removeEventListener",CU="detachEvent",CA="srcElement",CC="toElement",Cp="clientX",Cq="clientY",CN="x",CJ="y",CZ="screenX",CX="screenY",Cu="returnValue",Cb="cancelBubble",CD="src_element",CQ="offsetX",Ck="offsetY",Cf="offsetWidth",Cm="offsetHeight",CG="buttons",CB="button",Cx="zoom",CT="defaultView",Cg="document",CE="createElement",Cw="appendChild",CR="innerHTML",Cj="firstChild",CK="insertBefore",CI="removeChild",CW="nextSibling",CY="cssRules",Ch="insertRule",Cl="getComputedStyle",CF="target",Cn="relatedTarget",CS="currentTarget",Ci="pageX",Co="pageY",Cc="preventDefault",CO="stopPropagation",CH="layerX",Ce="layerY",CP="__xml",Cv="node_text",CL="text",Cr="get_xmlhttp",Cs="get_xml_doc",Ct="responseText",CV="loadXML",Cd="responseXML",Cy="documentElement",Cz="textContent",C1="request",C6="getTime",C9="open",C5="setRequestHeader",C0="encode",C3="onreadystatechange",C4="bind",C7="_state_change",C8="send",C2="_return_object",pa="readyState",pM="getResponseHeader",pU="__cookie",pA="set",pC="cookie",pp="toGMTString",pq="_hash",pN="_lower_hash",pJ="get",pZ="to_hash",pX="remove";
(function(){var Q=Uh[US]&&Uh[Ui]&&!UF[Uo]&&Uh[Uc];try{if(!!Q){Q(ha,UY,UW);}}catch(oh){};var k=[yM,uU,nA,gC,gp,oq,oN,_J,yZ,eX,ou,$b];var f=[D,aQ,ak,af,am,aG,aB];var G=[ax,aT,ag,aE,aw,aR,aj];UE[UO]=function(M,U){for(var a in U)M[a]=U[a];return M;};var B={trim:function(){return this[UH]()[Ue](aK,aI)[Ue](aW,aI);},inline:function(){return this[UH]()[UP]()[Ue](aY,aI);},comma:function(){var a=this[UH]();var M=aI;if(a!=aI){if(a[Uv](ah)!=-1){M=a[UL](a[Uv](ah));a=a[UL](0,a[Uv](ah));}a=a[Ue](al,aF);while(a[Ur](an)!=-1){a=a[Ue](aS,ai);}}return a+M;},attribute_text:function(){return this[UH]()[Ue](ao,aO);},html_text:function(){return this[UH]()[Ue](aH,ae)[Ue](aP,av)[Ue](aL,ar);},left:function(a){return(typeof(a)==as?this[UH]()[UL](0,this[Uv](a)):this[UH]()[UL](0,a));},left_back:function(a){var M=this[UH]();return(typeof(a)==as?M[UL](0,M[Us](a)):M[UL](0,M[Ut]-a));},right:function(a){var M=this[UH]();return(typeof(a)==as?M[UL](M[Uv](a)+a[Ut],M[Ut]):M[UL](M[Ut]-a));},right_back:function(a){var M=this[UH]();return(typeof(a)==as?M[UL](M[Us](a)+a[Ut],M[Ut]):M[UL](a));},middle:function(a,M){return this[UV](a)[Ud](M);},encode:function(){return UK(this[UH]());},decode:function(){return Uj(this[UH]());},to_hash:function(p,q,N){var a=this[Uy](p||at);var M=N||UY;var U={};var A;try{for(var C=0;C<a[Ut];C++){if(a[C][UP]()==aI)continue;A=a[C][Uy](q||aV);if(A[1]!=null)U[(M?A[0][UP]()[Uz]():A[0][UP]())]=A[1][UP]();}return U;}catch(a){return null;}},byte_length:function(){var a=0;var M=this[UH]();for(var U=0;U<M[Ut];U++){a+=(M[U1](U)>128?2:1);}return a;},fixed_length:function(Z,X,u,b,D){var a=0,M=aI,U,A,C,p,q,N;X=(X||aI)[UH]();if(X[Ut]>1||(D&&X[U6]()>1))return null;A=this[UH]();Z=Z||2;u=(u==null?UY:u);b=(b==null?UW:b);D=D||UY;U=D?A[U6]():A[Ut];a=Z-U;if(a==0||(a<0&&!b))return A;if(a>0){if(X!=aI)for(var J=0;J<a;J++)M+=X;return(u?M+A:A+M);}if(a<0){if(!D){if(u){return A[UL](A[Ut]-Z);}else{return A[UL](0,Z);}}else{C=0;if(u){q=0;N=1;}else{q=A[Ut]-1;N=-1;}while(a<0){p=A[U1](q)>128?2:1;a+=p;C++;q+=N;}return u?A[UL](C):A[UL](0,A[Ut]-C);}}return aI;},to_date:function(){try{var a=null,M;var U=this[UH]();if(U==aI)return null;var A=ad;if(A[U9](U)){if(U[Ur](ay)!=-1)U+=az;U=U[Ue](A,a1)[Ue](a6,a9);}else{U=U[Ue](a5,a0);U=U[Ue](a3,aI);U=(U[Ur](a4)!=-1?U:U+a7);U=U[Ue](a8,a2)[Ue](Ma,MU);U=U[Ue](MA,MC);U=U[Ue](Mp,Mq);}M=UB[U5](U);if(UI(M)){M=UB[U5](U[Ue](MN,MJ));}a=new UB(M);return(UI(a)?null:a);}catch(e){var a=UB[U5](date_str);return(UI(a)?null:a);}},format:function(){var a=this[UH]();for(var M=0;M<arguments[Ut];M++){a=a[Ue](MZ+(M+1)+MX,arguments[M]);}return a;}};UE[UO](UR[U0],B);UE[UO](Ug[U0],B);UE[UO](Ug[U0],{zero_prefix:function(a){return this[UH]()[U3](a,Mu,UW,UY,UY);}});UE[UO](UB[U0],{format:function(u){var U,C,p,q;U=(this[U4]()>0?UW:UY);C=UT[U7](this[U4]());q=C % 60;p=(C-q)/60;q=q[U8](2);p=p[U8](2);var N=this[U2]();N=N>12?N-12:N;var J={yyyy:this[Aa](),yy:this[Aa]()[UH]()[UL](2),MMMM:Mb,MMM:MD,MM:(this[AM]()+1)[U8](2),M:(this[AM]()+1),dd:this[AU]()[U8](2),d:this[AU](),HH:this[U2]()[U8](2),H:this[U2](),hh:N[U8](2),h:N,mm:this[AA]()[U8](2),m:this[AA](),ss:this[AC]()[U8](2),s:this[AC](),SSS:this[Ap]()[U8](3),S:this[Ap](),EEEE:MQ,EEE:Mk,eee:G[this[Aq]()],A:(this[U2]()<12?a2:MU),a:(this[U2]()<12?Mf:Mm),Z:MG+(U?MB:Mx)+p+MT+q,z:(U?MB:Mx)+p+q,$QQQQ$:k[this[AM]()],$QQQ$:k[this[AM]()][UL](0,3),$RRRR$:f[this[Aq]()],$RRR$:f[this[Aq]()][UL](0,3)};for(var X in J)u=u[Ue](new Uw(X[Ue](Mg,ME),Mw),J[X]);return u;},to_date_string:function(){return this[AN](MR);}});UE[UO](UE,{is_array:function(a){return a!=null&&typeof(a)==Mj&&MK in a&&MI in a;},to_array:function(U){var a=[];if(U!=null&&U[Ut]!=null&&typeof(U)!=as&&typeof(U)!=MW&&!(MY in U)){for(var M=0;M<U[Ut];M++)a[M]=U[M];}else{a=[U];}return a;},contains:function(M,U){for(var a=0;a<U[Ut];a++){if(M==U[a])return UW;}return UY;},clone:function(p,q){function pu(U,A,C){for(var a in A){if(typeof(A[a])!=Mj){U[a]=A[a];}else{U[a]=pu({},A[a]);}}if(C!=null){for(var M in C){U[M]=C[M];}}return U;}return pu({},p,q);},bind:function(){var a=UE[AJ](arguments);a[AZ]();var M=a[AZ](),U=a[AZ]();return function(){return U[AX](M,a[Au](UE[AJ](arguments)));};
},bind_event_listener:function(){var M=UE[AJ](arguments),U=M[AZ](),A=M[AZ](),C=M[AZ]();return function(a){return C[AX](A,[a||U[Ab]][Au](M));};}});UF[AD]=new function(){this[AQ]=UF[Ak][Af];this[Am]=Mh[U9](this[AQ]);this[AG]=Ml[U9](this[AQ]);this[AB]=MF[U9](this[AQ]);this[Ax]=Mn[U9](this[AQ]);this[AT]=MS[U9](this[AQ]);this[Ag]=!this[AT]&&/safari/i[U9](this[AQ]);this[AE]=Mi[U9](this[AQ]);this[Aw]=(this[AQ][AR](Mo)||[])[1];if(this[Am]){this[Aj]=navigator[AK];}else{this[Aj]=(navigator[Aj]?navigator[Aj]:navigator[AI]);}};UF[AW]=new function(){var q,N,J;this[AY]=function(U,A){if(!U||U[Ah]==null)return;var a=U[Ah]||Mc;if(a[Uv](A)==-1){U[Ah]=(U[Ah]+MO+A)[UP]();}var M=a[Uy](MH);if((Me+M[Al](Me)+Me)[Uv](Me+A+Me)==-1){M[AF](A);U[Ah]=M[Al](MP)[UP]();}};this[An]=function(C,p){if(!C||C[Ah]==null)return;var a=C[Ah]||Mc;if(a[Uv](p)==-1)return;var M=a[Uy](MH);var U=UY;for(var A=M[Ut]-1;A>=0;A--){if(M[A]==p){U=UW;delete M[A];}}if(U)C[Ah]=M[Al](MP)[UP]();};this[AS]=function(U,A){var a=0;y=0;var M=U;while(U){if(A==U)break;if(U==M){a+=U[Ai];y+=U[Ao];M=U[Ac];}U=U[AO];if(U!=null){a-=U[AH];y-=U[Ae];}if(U==null||!U[Ac])U=null;}return{x:a,y:y};};if(__browser[Am]){this[AP]=function(a){return a[Av][AL];};this[Ar]=function(a){};this[As]=function(a,M,U){a[At](M,U);};this[AV]=function(U,A){var a=U[Ad];if(typeof(A)==Mv){return a[A];}else{for(var M=0;M<a[Ut];M++){if((a[M][Ay]&&a[M][Ay][Az]==A)||a[M][Az]==A){return a[M];}}}return null;};this[A1]={add_rule:function(a,M,U,A){A=(A==null?-1:A);if(M!=aI&&U!=aI){a[A6](M,U,A);return a[A9][(A==-1?a[A9][Ut]-1:A)];}else{return null;}},rules:function(a){return a[A9];}};this[A5]={current_style:function(a,M){return a[A0][M];}};this[A3]=function(a,M){try{if(a!=null){return a[A4]((M==null?UW:M));}else{return UY;}}catch(e){return UY;}};this[A7]=function(a,M,U){if(a[A8]){M=M[Ue](ML,aI);a[A8](M,U,UY);return U;}else{if(M[Ur](Mr)==-1)M=Ms+M;a[A2](M,U);}return U;};this[Ca]=function(a,M,U){if(a[CM]){M=M[Ue](ML,aI);a[CM](M,U,UY);}else{if(M[Ur](Mr)==-1)M=Ms+M;a[CU](M,U);}};this[Ab]={src_element:function(a){return a[CA];},related_target:function(a){return a[CC];},info:function(a){return{target:a[CA],current_target:a[CA],related_target:a[CC],client_x:a[Cp],client_y:a[Cq],page_x:a[CN],page_y:a[CJ],screen_x:a[CZ],screen_y:a[CX]};},return_value:function(a,M){a[Cu]=M;},cancel_bubble:function(a,M){a[Cb]=M;},offset_xy:function(U){var a=__dom[Ab][CD](U);var M=__dom[AS](a);M[CN]+=U[CQ];M[CJ]+=U[Ck];return{x:U[CQ],y:U[Ck],page_x:M[CN],page_y:M[CJ],client_x:U[Cp],client_y:U[Cq]};},target_offset:function(A,C){var a=__dom[Ab][CD](A);var M=__dom[AS](a);M[CN]+=A[CQ];M[CJ]+=A[Ck];var U=__dom[AS](C);return{x:M[CN]-U[CN],y:M[CJ]-U[CJ],page_x:M[CN],page_y:M[CJ],client_x:A[Cp],client_y:A[Cq],target_x:U[CN],target_y:U[CJ],target_width:C[Cf],target_height:C[Cm]};},button:function(U){var a;var M=(U[CG]?U[CG]:U[CB]);switch(M){case 1:a=Mt;break;case 4:a=MV;break;case 2:a=Md;break;default:a=U[CB];}return a;}};this[Cx]=function(U,A){var a;var M=U[A5];if(M[Cx]==null||M[Cx][Uv](My)==-1){M[Cx]=Mz;}a=Ug(M[Cx][UH]()[Ue](My,aI));if(A==MB){a+=10;}else{a-=10;}if(a<100)a=100;M[Cx]=a+My;};}else{this[AP]=function(a){return a[Av][CT];};this[As]=function(a,M,U){switch(M){case M1:q=__dom[AP](a)[Cg][CE](M6);a[Cw](q);q[CR]=U;while(q[Cj]!=null){a[CK](q[Cj],q);}a[CI](q);break;case M9:q=__dom[AP](a)[Cg][CE](M6);N=a[Cj];if(N==null){a[Cw](q);}else{a[CK](q,N);}q[CR]=U;while(q[Cj]!=null){a[CK](q[Cj],q);}a[CI](q);break;case M5:J=a[AO];q=__dom[AP](a)[Cg][CE](M6);J[CK](q,a);q[CR]=U;while(q[Cj]!=null){J[CK](q[Cj],q);}J[CI](q);break;case M0:J=a[AO];q=__dom[AP](a)[Cg][CE](M6);N=a[CW];if(N==null){J[Cw](q);}else{J[CK](q,N);}q[CR]=U;while(q[Cj]!=null){J[CK](q[Cj],q);}J[CI](q);break;default:Un(M3+M);break;}};this[AV]=function(U,A){var a=U[Ad];if(typeof(A)==Mv){return a[A];}else{for(var M=0;M<a[Ut];M++){if(a[M][Ay][Az]==A){return a[M];}}}return null;};this[A1]={add_rule:function(a,M,U,A){if(A==null){A=a[CY][Ut];}if(M!=aI&&U!=aI){a[Ch](M+M4+U+MX,A);return a[CY][A];}else{return null;}},rules:function(a){return a[CY];}};this[A5]={current_style:function(a,M){return __dom[AP](a)[Cl](a,null)[M];
}};this[A3]=function(a,M){try{if(a!=null){a[AO][CI](a);return UW;}else{return UY;}}catch(e){return UY;}};this[A7]=function(a,M,U){M=M[Ue](ML,aI);a[A8](M,U,UY);return U;};this[Ca]=function(a,M,U){M=M[Ue](ML,aI);a[CM](M,U,UY);};this[Ab]={src_element:function(a){return a[CF];},related_target:function(a){return a[Cn];},info:function(a){return{target:a[CF],current_target:a[CS],related_target:a[Cn],client_x:a[Cp],client_y:a[Cq],page_x:a[Ci],page_y:a[Co],screen_x:a[CZ],screen_y:a[CX]};},return_value:function(a,M){if(!M){a[Cc]();}},cancel_bubble:function(a,M){if(M){a[CO]();}},offset_xy:function(a){return{x:a[CH],y:a[Ce],page_x:a[Ci],page_y:a[Co],client_x:a[Cp],client_y:a[Cq]};},target_offset:function(M,U){var a=__dom[AS](U);return{x:M[Ci]-a[CN],y:M[Co]-a[CJ],page_x:M[Ci],page_y:M[Co],client_x:M[Cp],client_y:M[Cq],target_x:a[CN],target_y:a[CJ],target_width:U[Cf],target_height:U[Cm]};},button:function(M){var a;switch(M[CB]){case 0:a=Mt;break;case 1:a=MV;break;case 2:a=Md;break;default:a=M[CB];break;}return a;}};this[Cx]=function(a,M){};}};UF[CP]=new function(){if(__browser[Am]){this[Cv]=function(a){try{if(a!=null){return ('innerText' in a?a.innerText:([Cz] in a?a[Cz]:a[CL]))[UP]();}else{return aI;}}catch(e){return aI;}};this[Cr]=function(){try{return new UG(M7);}catch(e){return null;}};this[Cs]=function(A){var a,M,U;try{if(A[Ct][Ur](M8)!=-1){a=new UG(M2);M=A[Ct][Ue](Ua,UM);a[CV](M);}else{a=A[Cd];}U=a[Cy];}catch(e){U=null;}return U;};}else{this[Cv]=function(a){try{if(a!=null){return a[Cz][UP]();}else{return aI;}}catch(e){return aI;}};this[Cr]=function(){try{return new XMLHttpRequest();}catch(e){return null;}};this[Cs]=function(a){try{return a[Cd][Cy];}catch(e){return null;}};}this[C1]=function(q,N,J,Z,X,u,b){var a=this[Cr]();var M=[],U=null;var A;try{Z=(Z==null?UY:Z);J=(J==null?Mj:J);A=(b==null||!b?at+(new UB())[C6]()[UH](16):aI);q=q||UU;q=q==UA?UC:q;q=q==Mw?UU:q;a[C9](q,N+A,Z);if(u!=null){a[C5](Up,Uq);if(typeof(u)==as){U=u;}else{for(var C in 	u){M[AF](C+aV+(u[C]||aI)[C0]());}U=(M[Ut]!=0?M[Al](at):null);}}if(Z){a[C3]=UE[C4](UF,this,this[C7],a,X,J);}a[C8](U);if(!Z){var p=(this[C2](a,J[Uz]()));return p;}else{return UW;}}catch(e){return UY;}};this[C7]=function(a,M,U){if(a[pa]==4){M(this[C2](a,U[Uz]()));}};this[C2]=function(U,A){try{if(A==Mj)return U;if(A==UN)return U[Ct];var a=new Uw(A,UJ);var M;if(U[pM](Up)[Ur](a)!=-1){if(A==UZ){M=this[Cs](U);}else{M=U[Ct];}return{valid:(M!=null?UW:UY),value:M,object:U};}else{return{valid:UY,value:null,object:U};}}catch(e){return{valid:UY,value:null,object:U};}};};UF[pU]=new function(){this[pA]=function(a,M,U,A,C,p){if(a==null||a==aI)return UY;try{if(U!=null)U=new UB((new UB())[C6]()+(U*1000*60*60));Uh[pC]=a+aV+M[C0]()+(U!=null?UX+U[pp]():aI)+Uu+(A!=null?A:MJ)+(C!=null?Ub+C:aI)+(p!=null&&p?UD:aI);return UW;}catch(e){return UY;}};this[pq]=null;this[pN]=null;this[pJ]=function(M,U,A){try{var a=(U?UQ:Uk);A=(A==null?UW:A);if(this[a]==null||A){this[a]=Uh[pC][pZ](Uf,null,U);}return(this[a]!=null&&this[a][M]!=null?this[a][M]:null);}catch(e){return null;}};this[pX]=function(M,U,A){try{var a=new UB(1970,1,1,12,1,1);if(this[pJ](M)!=null){Uh[pC]=M+Um+a[pp]()+Uu+(U!=null?U:MJ)+(A!=null?Ub+A:aI);}return UW;}catch(e){return UY;}};};})();
})();
function URLQueryString(url){
	this.url_query = {};
	this.query = (url.indexOf("?")!= -1?url.substring(url.indexOf("?")):url);
	this.query_string = (this.query.indexOf("&") != -1?this.query.substring(this.query.indexOf("&")):"");
	this.query_string = (this.query_string.indexOf("#") != -1?this.query_string.substring(0, this.query_string.indexOf("#")):this.query_string);
	var query_string_arr = this.query_string.split("&");
	for(var i = 1; i < query_string_arr.length; i++){
		var tmpStr = query_string_arr[i].split("=");
		this.url_query[tmpStr[0].toLowerCase()] = [tmpStr[0], tmpStr[1]];
	}
}
URLQueryString.prototype.get = function(param){
	return (this.url_query[param.toLowerCase()]||[])[1];
};
URLQueryString.prototype.set = function(param, val){
	this.url_query[param.toLowerCase()] = [param, val.encode()];
};
URLQueryString.prototype.remove = function(param){
	delete this.url_query[param.toLowerCase()];
};
URLQueryString.prototype.toString = function(){
	var str = [];
	for(var idx in this.url_query){
		if(idx) str.push(this.url_query[idx][0] + "=" + this.url_query[idx][1]);
	}
	return str.join("&");
};
function get_attachment_type(att_names){
	var ext = "";
	if(att_names.lastIndexOf(".") != -1){
		ext = att_names.substring(att_names.lastIndexOf(".") + 1);
		if(ext.search(/[^A-Za-z0-9]/) != -1){
			ext = ext.substring(0, ext.search(/[^A-Za-z0-9]/));
		}
	}
	
	return ext;
}
function get_attachment_img(att_names){
	var ext = "";
	if(att_names.lastIndexOf(".") != -1){
		ext = att_names.substring(att_names.lastIndexOf(".") + 1);
		if(ext.search(/[^A-Za-z0-9]/) != -1){
			ext = ext.substring(0, ext.search(/[^A-Za-z0-9]/));
		}
	}
	switch (ext){
		case "pptx":
		case "ppt" :
			imgtag = "<img src=\"/ep/common/lib.nsf/ppt.gif\" alt=\"\" />";
			break;
		case "xlsx":
		case "xls" :
		case "csv" :
			imgtag = "<img src=\"/ep/common/lib.nsf/excel.gif\" alt=\"\" />";
			break;
		case "docx":
		case "doc" :
			imgtag = "<img src=\"/ep/common/lib.nsf/word.gif\" alt=\"\" />";
			break;
		case "pdf":
			imgtag = "<img src=\"/ep/common/lib.nsf/pdf.gif\" alt=\"\" />";
			break;
		case "zip":
			imgtag = "<img src=\"/ep/common/lib.nsf/zip.gif\" alt=\"\" />";
			break;
		case "gif":
			imgtag = "<img src=\"/ep/common/lib.nsf/gif.gif\" alt=\"\" />";
			break;
		case "jpg":
			imgtag = "<img src=\"/ep/common/lib.nsf/jpg.gif\" alt=\"\" />";
			break;
		case "txt":
			imgtag = "<img src=\"/ep/common/lib.nsf/note.jpg\" alt=\"\" />";
			break;
		default :
			imgtag = "<img src=\"/ep/common/lib.nsf/unknown.gif\" alt=\"\" />";
			break;
	}
	
	return imgtag;
}
function getAttachmentIcon(ext){
	switch (ext){
		case "pptx" :
		case "ppt" :
			imgtag = "<img src=\"/portal/attachment/att_ppt.png\" alt=\"\" align=\"absmiddle\" />";
			break;
		case "xlsx" :
		case "xls" :
		case "csv" :
			imgtag = "<img src=\"/portal/attachment/att_xls.png\" alt=\"\" align=\"absmiddle\" />";
			break;
		case "docx" :
		case "doc" :
			imgtag = "<img src=\"/portal/attachment/att_doc.png\" alt=\"\" align=\"absmiddle\" />";
			break;
		case "pdf" :
			imgtag = "<img src=\"/portal/attachment/att_pdf.png\" alt=\"\" align=\"absmiddle\" />";
			break;
		case "zip" :
			imgtag = "<img src=\"/portal/attachment/att_zip.png\" alt=\"\" align=\"absmiddle\" />";
			break;
		case "gif" :
		case "jpg" :
		case "jpeg" :
		case "bmp" :
		case "psd" :
		case "png" :
			imgtag = "<img src=\"/portal/attachment/att_img.png\" alt=\"\" align=\"absmiddle\" />";
			break;
		case "txt" :
			imgtag = "<img src=\"/portal/attachment/att_txt.png\" alt=\"\" align=\"absmiddle\" />";
			break;
		case "hwp" :
			imgtag = "<img src=\"/portal/attachment/att_hwp.png\" alt=\"\" align=\"absmiddle\" />";
			break;
		case "html" :
		case "htm" :
			imgtag = "<img src=\"/portal/attachment/att_html.png\" alt=\"\" align=\"absmiddle\" />";
			break;
		case "exe" :
			imgtag = "<img src=\"/portal/attachment/att_exe.png\" alt=\"\" align=\"absmiddle\" />";
			break;
		default :
			imgtag = "<img src=\"/portal/attachment/att_etc.png\" alt=\"\" align=\"absmiddle\" />";
			break;
	}
	return imgtag;
}
function check() {	
	var f = document.getElementsByTagName("input");
	j=0;
	checkDoc = new Array();
	realcount = 0;
	for (i=0; i<f.length; i++) {
		if (f[i].type == 'checkbox' && !(f[i].name != null && f[i].name == "Check")) {
			if (f[i].checked == true) {
				if (f[i].name != 'Check'){
					realcount = realcount + 1;
				}
				checkDoc[j] = f[i].value;
				j += 1;
			}
		}	
	}
}
//popup창 띄우기
function open_subwin(url, width, height, scrollbars, win_name, resizable) {
	var opt_scrollbars = (scrollbars == null)?"yes":scrollbars;
	var opt_resizable = (resizable == null)?"yes":resizable;
	var window_name = (win_name == null)?"subwin":win_name;
	//var winFeature = set_center(width, height) + ",menubar=no,resizable=no ,scrollbars="+opt_scrollbars;
	var winFeature = set_center(width, height) + ",menubar=no,resizable="+opt_resizable+",scrollbars="+opt_scrollbars;
	var subwin = window.open(url, window_name, winFeature);
	return subwin;
}
function set_center(win_width, win_height) {
	winx = Math.ceil((screen.availWidth - win_width) / 2);
	winy = Math.ceil((screen.availHeight - win_height) / 2);
	return "left=" + winx + ",top=" + winy + ",width=" + win_width + ",height=" + win_height;
}
function disabledButton(flag){
	var btnId = document.getElementById("id_button");
	var btnId2 = document.getElementById("id_button2");
	var btnIds;
	var objs;
	if(btnId[0] != null){
		btnIds = btnId;
	}else{
		btnIds = new Array();
		btnIds.push(btnId);
	}
	for(var i = 0 ; i < btnIds.length; i++){
		if(btnIds[i] != null){
			objs = btnIds[i].getElementsByTagName("A");
			for(var j = 0; j < objs.length; j++){
				objs[j].disabled = (flag?true:false);
			}
		}
	}
	if (btnId2 != null){
		if(btnId2[0] != null){
			btnIds = btnId2;
		}else{
			btnIds = new Array();
			btnIds.push(btnId2);
		}
		for(var i = 0 ; i < btnIds.length; i++){
			if(btnIds[i] != null){
				objs = btnIds[i].getElementsByTagName("A");
				for(var j = 0; j < objs.length; j++){
					objs[j].disabled = (flag?true:false);
				}
			}
		}
	}
}
function findSelected(fieldname) {
	var selectedvalue="";
	for (var i=0; i<fieldname.length; i++) {
		if (fieldname[i].checked == true) {
			selectedvalue = fieldname[i].value;
		}
	}
	return(selectedvalue);
}
function dispAttachLink(){
	var html = "";
	var obj = document.getElementById("id_attachurl");
	if (obj == null || obj == "undefined"){
		return;
	}
	var tmp = attachinfo.split("<br>");
	
	if (attachinfo != ""){
		for (i=0; i < tmp.length; i++){
			imgtag = get_attachment_img(tmp[i])
			url = imgtag + "&nbsp;" + tmp[i];
			html +=  "<li style=\"padding:3px 0px;\">" + url + "</li>";
		}
	}
	if (attachinfo != ""){
		html = "<ul>" + html + "</ul>";
	}
	document.getElementById("id_attachurl").innerHTML = html;
}
function BTN_ACTION(action){
	this.control_id = null;
	this.action = action;
	this.action_key = {};
	this.draw_object_id = [];
	this.selected_item = null;
	for(var i = 0; i < this.action.length; i++) this.action_key[this.action[i].id] = this.action[i];
	BTN_ACTION.set(this);
}
BTN_ACTION.DRAW_TYPE_INSERT = 1 << 0;
BTN_ACTION.DRAW_TYPE_WRITE 	= 1 << 1;
BTN_ACTION.DRAW_TYPE_RETURN_HTML = 1 << 2;
BTN_ACTION.BTN_STYLE_TYPE01 = 1;
BTN_ACTION.BTN_STYLE_TYPE02 = 2;
BTN_ACTION.BTN_STYLE_TYPE03 = 3;
BTN_ACTION.BTN_STYLE_TYPE04 = 4;
BTN_ACTION.BTN_STYLE_TYPE05 = 5;
BTN_ACTION.BTN_STYLE_TYPE06 = 6;
BTN_ACTION.BTN_STYLE_TYPE07 = 7;
BTN_ACTION.BTN_STYLE_TYPE08 = 8;
BTN_ACTION.BTN_STYLE_TYPE09 = 9;
BTN_ACTION.BTN_STYLE_TYPE10 = 10;
BTN_ACTION.BTN_STYLE_TYPE11 = 11;
BTN_ACTION.BTN_STYLE_TYPE12 = 12;
BTN_ACTION.BTN_STYLE_TYPE21 = 21;
BTN_ACTION.BTN_STYLE_TYPE22 = 22;
BTN_ACTION.BTN_STYLE_TYPE23 = 23;
BTN_ACTION.BTN_STYLE_TYPE_TAB = 1 << 9;
BTN_ACTION.BTN_STYLE_RIGHT = 1 << 10;
BTN_ACTION.BTN_STYLE_LEFT = 1 << 11;
BTN_ACTION.BTN_SPAN_TAG = 1 << 12;
BTN_ACTION.BTN_NO_WRAPPER = 1 << 13;
BTN_ACTION.prototype.set_title =function(id, title){
	var obj;
	this.action_key[id].title = title;
	for(var i = 0; i < this.draw_object_id.length; i++){
		obj = document.getElementById('btn_action_' + id + this.draw_object_id[i] + '_a');
		if(obj) obj.innerHTML = title;
	}
};
BTN_ACTION.prototype.get_title = function(id){
	return this.action_key[id].title;
};
BTN_ACTION.prototype.set_href = function(id, href){
	var obj;
	for(var i = 0; i < this.draw_object_id.length; i++){
		obj = document.getElementById('btn_action_' + id + this.draw_object_id[i] + '_a');
		if(obj) obj.href = href;
	}
};
BTN_ACTION.prototype.set_func =function(id, func){
	if(this.action_key[id]) this.action_key[id].func= func;
};
BTN_ACTION.prototype.show = function(id){
	var objs = this.get_obj(id);
	for(var i = 0; i < objs.length; i++){
		objs[i].style.display = "";
	}
};
BTN_ACTION.prototype.hidden = function(id){
	var objs = this.get_obj(id);
	for(var i = 0; i < objs.length; i++){
		objs[i].style.display = "none";
	}
};
BTN_ACTION.prototype.select = function(id){
	if(this.selected_item) this._set_item_state(this.selected_item, false);
	this._set_item_state(id, true);
	this.selected_item = id;
};
BTN_ACTION.prototype._set_item_state = function(id, is_selected){
	var objs = this.get_obj(id);
	for(var i = 0; i < objs.length; i++){
		objs[i].className = (
			is_selected?
				(objs[i].className.search(/cls_btn_selected/)==-1?objs[i].className + " cls_btn_selected":"")
				:
				objs[i].className.replace(/ cls_btn_selected/g, ""));
	}
};
BTN_ACTION.prototype.get_obj = function(id){
	var objs = [], obj;
	for(var i = 0; i < this.draw_object_id.length; i++){
		obj = document.getElementById('btn_action_' + id + this.draw_object_id[i]);
		if(obj) objs.push(obj);
	}
	return objs;
};
BTN_ACTION.prototype.run = function(id){
	this.select(id);
	return this.action_key[id].func();
};
BTN_ACTION.prototype.draw = function(draw_type, btn_type, container, btn_style, item_styles){
	var wrapper;
	var wrapper_tag = 'div';
	var inner_div_class = 'cls_btn_float_left ';
	if((draw_type&BTN_ACTION.DRAW_TYPE_INSERT) != 0) wrapper = document.getElementById(container);
	var html = '';
	if((btn_type & 0x00ff) == 0 && (btn_type & BTN_ACTION.BTN_STYLE_TYPE_TAB) == 0){
		btn_type |= BTN_ACTION.BTN_STYLE_TYPE05;
	}
	var alignClass = "cls_btn_align_" + ((btn_type & BTN_ACTION.BTN_STYLE_RIGHT) != 0?"right ":"left ");
	var className = "cls_btn_style_" + ((btn_type & BTN_ACTION.BTN_STYLE_TYPE_TAB) != 0?"tab":(btn_type & 0x00ff));
	var is_right = (btn_type & BTN_ACTION.BTN_STYLE_RIGHT) != 0;
	var start, end, offset;
	if(is_right){
		start = this.action.length - 1, end = 0, offset = -1;
	}else{
		start = 0; end = this.action.length - 1, offset = 1;
	}
	if((btn_type & BTN_ACTION.BTN_SPAN_TAG) != 0){
		wrapper_tag = "span";
		inner_div_class = '';
		alignClass = '';
	}
	var key = "_" + this.control_id + "_" + this.draw_object_id.length;
	this.draw_object_id.push(key);
	if((btn_type & BTN_ACTION.BTN_NO_WRAPPER) == 0) 
		html += '<div class="' + className + '_wrapper"' + (btn_style?' style="' + btn_style + '"':'') + '>';
	for(var i = start; (is_right?i >= end:i <= end); i+=offset){
		var item_style = (item_styles&&item_styles[this.action[i].id]?item_styles[this.action[i].id]:
					(this.action[i].style?this.action[i].style:''));
		html += '<' + wrapper_tag + ' id="btn_action_' + this.action[i].id + key + '" class="cls_btn ' + alignClass + className + '"'
				+ (item_style?' style="' + item_style + '"':'') + '>';
		html += '<' + wrapper_tag + ' class="cls_btn_1 ' + inner_div_class  + className + '_1"><' + wrapper_tag + ' class="cls_btn_2 ' + inner_div_class  + className + '_2">';
		html += '<a ' + (!__browser.is_ie?'href="javascript:;"':'href="#"') + ' onclick="BTN_ACTION.get(\'' + this.control_id + '\').run(\'' + this.action[i].id + '\');" class="' + inner_div_class + '" id="btn_action_' + this.action[i].id + key + '_a">';
		html += this.action[i].title;
		html += '</a>';
		html += '</' + wrapper_tag + '></' + wrapper_tag + '></' + wrapper_tag + '>';
	}
	if((btn_type & BTN_ACTION.BTN_STYLE_TYPE_TAB) != 0) html += '<div class="' + className + '_tmp_wrapper"></div>';
	if((btn_type & BTN_ACTION.BTN_NO_WRAPPER) == 0){
		if((btn_type & BTN_ACTION.BTN_STYLE_TYPE_TAB) != 0){
			html += '</div>';
		}else{
			html += '<div class="cls_button_clear"></div></div>';
		}
	}
	if((draw_type&BTN_ACTION.DRAW_TYPE_INSERT) != 0){
		wrapper.innerHTML = html;
	}else if((draw_type&BTN_ACTION.DRAW_TYPE_WRITE) != 0){
		document.write(html);
	}else if((draw_type&BTN_ACTION.DRAW_TYPE_RETURN_HTML) != 0){
		return html;
	}
};
BTN_ACTION.control_hash = {};
BTN_ACTION.control_hash_count = 0;
BTN_ACTION.set = function(obj){
	var id = "BTN_ACTION_" + (BTN_ACTION.control_hash_count++);
	BTN_ACTION.control_hash[id] = obj;
	obj.control_id = id;
};
BTN_ACTION.get = function(id){
	return BTN_ACTION.control_hash[id];
};
function ACTION_LISTENER(){}
ACTION_LISTENER.action_hash = {};
ACTION_LISTENER.action_hash_count = 0;
ACTION_LISTENER.set= function(func){
	var key = "LISTENER_" + (ACTION_LISTENER.action_hash_count++);
	ACTION_LISTENER.action_hash[key] = func;
	return key;
};
ACTION_LISTENER.get= function(key){
	return ACTION_LISTENER.action_hash[key];
};
function PORTAL_IFRAME_RESIZE(){
	this.control_id = null;
	this.doc = document;
	this.url_query = new URLQueryString(this.doc.location.href);
	this.resize = function(){
		if(!this.url_query.get("iframe_key")) return;
		var request_frame = this.doc.getElementById("request_frame_" + this.control_id);
		if(request_frame == null){
			request_frame = this.doc.createElement("iframe");
			request_frame.id = "request_frame_" + this.control_id;
			request_frame.style.display = "none";
			this.doc.body.appendChild(request_frame);			
		}
		request_frame.src = this.url_query.get("iframe_path").decode() + "?open&iframe_key=" + this.url_query.get("iframe_key") + "&height=" + this.doc.body.scrollHeight + "&" + (new Date()).getTime().toString(16);
	};
	PORTAL_IFRAME_RESIZE.set(this);
}
PORTAL_IFRAME_RESIZE.control_hash = {};
PORTAL_IFRAME_RESIZE.control_hash_count = 0;
PORTAL_IFRAME_RESIZE.set = function(obj){
	var id = "PORTAL_IFRAME_RESIZE_" + (PORTAL_IFRAME_RESIZE.control_hash_count++);
	PORTAL_IFRAME_RESIZE.control_hash[id] = obj;
	obj.control_id = id;
};
PORTAL_IFRAME_RESIZE.get = function(id){
	return PORTAL_IFRAME_RESIZE.control_hash[id];
};
String.prototype.len_chk = function() {
	if (this.length > 50) {
		alert("제목 문자열이 제한길이를 초과하였습니다.");
		return false;
	} else {
		return true;
	}
};
// Session check
function sessionCheck(){
	var result = __xml.request("g", "/ep/common/lib.nsf/checksessionstatus?Openpage", "text", false);
	try{
		result = eval("(" + result + ")");
		if(result.status == "login") return true;
	}catch(e){			
	}
	alert((window._i18n?window._i18n.g("session_time_out_and_login"):"세션이 종료되어 실행 할 수 없습니다. 다시 Login 후에 실행하십시오."));
	var swidth = 380;
	var sheight = 220;
	var sx = Math.ceil((screen.availWidth-swidth)/2);
	var sy = Math.ceil((screen.availHeight-sheight)/2);
	url = "/domcfg.nsf/popup_login?Open&loginmode=1";
	window.open(url,'_blank',"resizable, scrollbars=auto, left=" + sx +",top=" + sy +",width=" + swidth +",height=" + sheight);
	return false;
}
function printBeforeInitBody(bodyDivId, printDivId){
	var bodyDiv = document.getElementById(bodyDivId);
	var printDiv = document.getElementById(printDivId);
	if(!bodyDiv || !printDiv) return;
	try{
		var iframes = bodyDiv.getElementsByTagName("iframe");
		if(iframes.length > 0){
			printDiv.innerHTML = iframes[0].contentWindow.document.body.parentNode.innerHTML;
		}else{
			printDiv.innerHTML = bodyDiv.innerHTML;
		}
	}catch(e){
		printDiv.innerHTML = bodyDiv.innerHTML;
	}
}
function printAfterInitBody(printDivId){
	var printDiv = document.getElementById(printDivId);
	if(!printDiv) return;
	printDiv.innerHTML = "";
}
function clearOptions(obj){
	if (obj.options[0].text == NoPersonMSG) return;
	var optlen = obj.options.length;
	for(var i = optlen-1; i >= 0; i--) {
		obj.options[i] = null;
	}
	if (obj.options.length == 0) {
		addOption(obj, NoPersonMSG, "0");		
	}
}
function init_menu_top(obj){
	try{
		/*document.domain=domain;
		parent.parent.EP_TOP.menu_init(obj);*/
		var iframe = document.createElement("iframe");
		iframe.style.display = "none";
		iframe.src = "http:////ep_top_call?open&" + obj;
		document.body.appendChild(iframe);
	}catch(e){}
}
function init_menu_highlight(id){
	var obj = document.getElementById(id);
	if(obj != null){
		remove_background();
		__dom.add_class(obj, "active");
		active_background_obj  = obj;
	}
}
function browsercheck(){
	var key = navigator.userAgent.toLowerCase();
	var br = "";
	if( key.indexOf("msie") > 0 ){    // Internet Explorer
		br = "ie";
	}else if( key.indexOf("opera") > 0 ){  // Opera
		br = "opera";
	}else if( key.indexOf("firefox") > 0 ){  // Firefox
		br = "firefox"
	}else if( key.indexOf("safari") > 0 ){  // Safari or Chrome
  		  if( key.indexOf("chrome") > 0 ) {   // Chrome
          			br = "chrome";
  		  }else{                                        // Safari
			var inx1 = key.indexOf("window");
			if (inx1 > 0){
				br = "PCSafari";
			}else{
				br = "MacSafari";
			}
  		  }
	}
	return br;
}
function getInternetExplorerVersion() {    
    var rv = -1; // Return value assumes failure.    
    if (navigator.appName == 'Microsoft Internet Explorer') {        
         var ua = navigator.userAgent;        
         var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");        
         if (re.exec(ua) != null)            
             rv = parseFloat(RegExp.$1);    
         }    
    return rv; 
} 
function show_user_info(notesid){
	if (notesid.toUpperCase().indexOf("CN=") >= 0){
		var url = protocol + "////vwPersonByNotesid/" + encodeURIComponent(notesid) + "?OpenDocument&cp=portal";
	}else{
		var url = protocol + "////vwPersonByEmpNo/" + encodeURIComponent(notesid) + "?OpenDocument&cp=portal";
	}
	var subwin = open_subwin(url, "700", "500", "yes", "show_user", "yes");
	subwin.focus();
}
function msgbox_confirm(param, func_param){
	try{
		_form._msgbox.show("<div><strong>" + param + "</strong></div><br><div align=\"center\"><table cellpadding=0 cellspacing=0 border=0><tr><td><div id=\"top_btn\"><a href=\"#\" onclick=\"_form._msgbox.hidden(); " + func_param + "(true)\"><span name=\"button2\">" + _i18n.g("kp_yes") + "</span></a></div></td><td width=\"3\">&nbsp;</td><td><div id=\"top_btn\"><a href=\"#\" onclick=\"_form._msgbox.hidden(); " + func_param + "(false)\"><span name=\"button2\">" + _i18n.g("kp_no") + "</span></a></div></td></tr></table></div>");
	}catch(e){
		_msgbox.show("<div><strong>" + param + "</strong></div><br><div align=\"center\"><table cellpadding=0 cellspacing=0 border=0><tr><td><div id=\"top_btn\"><a href=\"#\" onclick=\"_msgbox.hidden(); " + func_param + "(true)\"><span name=\"button2\">" + _i18n.g("kp_yes") + "</span></a></div></td><td width=\"3\">&nbsp;</td><td><div id=\"top_btn\"><a href=\"#\" onclick=\"_msgbox.hidden(); " + func_param + "(false)\"><span name=\"button2\">" + _i18n.g("kp_no") + "</span></a></div></td></tr></table></div>");
	}
}
function getCheckedValue(object){
	var lists=new Array();
	var inc=0;
	for(var i=0;i < object.length;i++){
		if(object[i].checked){
			lists[inc++]=object[i].value;
		}
	}
	return lists.toString();
}
var _ret_location = "";
function getLocation() {
	try{
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(showPosition);
		}else{
			_ret_location = "";
		}
	}catch(e){
		_ret_location = "";
	}
}
function showPosition(position) {
	var _latitude = position.coords.latitude.toFixed(2);
	var _longitude = position.coords.longitude.toFixed(2);
	_ret_location = _latitude.toString() + "-spl-" + _longitude.toString();
}
Date.prototype.format = function(f) {
	if (!this.valueOf()) return " ";
	var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
	var d = this;
	return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
		switch ($1) {
			case "yyyy": return d.getFullYear();
			case "yy": return (d.getFullYear() % 1000).zf(2);
			case "MM": return (d.getMonth() + 1).zf(2);
			case "dd": return d.getDate().zf(2);
			case "E": return weekName[d.getDay()];
			case "HH": return d.getHours().zf(2);
			case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
			case "mm": return d.getMinutes().zf(2);
			case "ss": return d.getSeconds().zf(2);
			case "a/p": return d.getHours() < 12 ? "오전" : "오후";
			default: return $1;
		}
	});
};
String.prototype.string = function(len){var s = '', i = 0; while (i++ < len) { s += this; } return s;};
String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
Number.prototype.zf = function(len){return this.toString().zf(len);};
function get_attachment_icon(att_names, mode, ownerkey, filekey, metadata){
	var fname = "";
	var ext = "";
	att_names = att_names.toString();
	if(att_names.lastIndexOf(".") != -1){
		ext = att_names.substring(att_names.lastIndexOf(".") + 1);
		if(ext.search(/[^A-Za-z0-9]/) != -1){
			ext = ext.substring(0, ext.search(/[^A-Za-z0-9]/));
		}
	}
	fname = att_names.split("." + ext)[0];
	switch (ext.toLowerCase()){
	case "pptx" :
	case "ppt" :
		if (mode == "list"){
			imgtag = "<img src=\"/" + libpath + "/ico_type_powerpoint.png\" alt=\"\" />";
		}else if (mode == "chat"){
			imgtag = "<img src=\"/" + libpath + "/powerpoint_32.png\" alt=\"\" />";
		}else{
			imgtag = "<img src=\"" + document.location.protocol + "//" + appserver + ":" + uploadPort + "/pubfiledownload/" + ownerkey + "/" + filekey + "_thumb.png\" onerror='this.src=\"/" + libpath + "/thm_ppt.png\"' " + (mode == "chat_detail" ? "class=\"kfiles_detail_img\"": "") + " alt=\"\" style=\"max-width:204px;\"/>";
		}
		break;
	case "xlsx" :
	case "xls" :
		if (mode == "list"){
			imgtag = "<img src=\"/" + libpath + "/ico_type_excel.png\" alt=\"\" />";
		}else if (mode == "chat"){
			imgtag = "<img src=\"/" + libpath + "/excel_32.png\" alt=\"\" />";
		}else{
			imgtag = "<img src=\"" + document.location.protocol + "//" + appserver + ":" + uploadPort + "/pubfiledownload/" + ownerkey + "/" + filekey + "_thumb.png\" onerror='this.src=\"/" + libpath + "/thm_excel.png\"' " + (mode == "chat_detail" ? "class=\"kfiles_detail_img\"": "") + " alt=\"\" style=\"max-width:204px;\"/>";
		}
		break;
	case "csv" :
		if (mode == "list"){
			imgtag = "<img src=\"/" + libpath + "/ico_type_excel.png\" alt=\"\" />";
		}else if (mode == "chat"){
			imgtag = "<img src=\"/" + libpath + "/excel_32.png\" alt=\"\" />";
		}else{
			imgtag = "<img src=\"/" + libpath + "/thm_excel.png\" " + (mode == "chat_detail" ? "class=\"kfiles_detail_img\"": "") + " alt=\"\" />";
		}
		break;
	case "docx" :
	case "doc" :
		if (mode == "list"){
			imgtag = "<img src=\"/" + libpath + "/ico_type_word.png\" alt=\"\" />";
		}else if (mode == "chat"){
			imgtag = "<img src=\"/" + libpath + "/word_32.png\" alt=\"\" />";
		}else{
			imgtag = "<img src=\"" + document.location.protocol + "//" + appserver + ":" + uploadPort + "/pubfiledownload/" + ownerkey + "/" + filekey + "_thumb.png\" onerror='this.src=\"/" + libpath + "/thm_word.png\"' " + (mode == "chat_detail" ? "class=\"kfiles_detail_img\"": "") + " alt=\"\" style=\"max-width:204px;\"/>";
		}
		break;
	case "hwp" :
		if (mode == "list"){
			imgtag = "<img src=\"/" + libpath + "/ico_type_hwp.png\" alt=\"\" />";
		}else if (mode == "chat"){
			imgtag = "<img src=\"/" + libpath + "/hwp_32.png\" alt=\"\" />";
		}else{
//			imgtag = "<img src=\"/" + libpath + "/thm_hwp.png\" " + (mode == "chat_detail" ? "class=\"kfiles_detail_img\"": "") + " alt=\"\" />";
			imgtag = "<img src=\"" + document.location.protocol + "//" + appserver + ":" + uploadPort + "/pubfiledownload/" + ownerkey + "/" + filekey + "_thumb.png\" onerror='this.src=\"/" + libpath + "/thm_hwp.png\"' " + (mode == "chat_detail" ? "class=\"kfiles_detail_img\"": "") + " alt=\"\" style=\"max-width:204px;\"/>";
		}
		break;
	case "pdf" :
		if (mode == "list"){
			imgtag = "<img src=\"/" + libpath + "/ico_type_pdf.png\" alt=\"\" />";
		}else if (mode == "chat"){
			imgtag = "<img src=\"/" + libpath + "/pdf_32.png\" alt=\"\" />";
		}else{
			imgtag = "<img src=\"" + document.location.protocol + "//" + appserver + ":" + uploadPort + "/pubfiledownload/" +ownerkey + "/" + filekey + "_thumb1.png\" onerror='this.src=\"/" + libpath + "/thm_pdf.png\"' " + (mode == "chat_detail" ? "class=\"kfiles_detail_img\"": "") + " alt=\"\" style=\"max-width:204px;\"/>";
		}
		break;
	case "zip" :
	case "jar" :
	case "tar" :
	case "7z" :
	case "alz" :
		if (mode == "list"){
			imgtag = "<img src=\"/" + libpath + "/ico_type_zip.png\" alt=\"\" />";
		}else if (mode == "chat"){
			imgtag = "<img src=\"/" + libpath + "/zip_32.png\" alt=\"\" />";
		}else{
			imgtag = "<img src=\"/" + libpath + "/thm_zip.png\" " + (mode == "chat_detail" ? "class=\"kfiles_detail_img\"": "") + " alt=\"\" />";
		}
		break;
	case "gif" :
	case "bmp" :
	case "jpg" :
	case "jpeg" :
	case "png" :
		//이미지 파일은 chat 모드에서도 썸네일로 보여준다
		if (mode == "list"){
			imgtag = "<img src=\"/" + libpath + "/ico_type_image.png\" alt=\"\" />";
		}else{
			/*if (metadata){
				//메타 데이터가 있고 width 값이 250 보다 작으면 원래 크기로 보여준다.
				var meta_json = eval("(" + metadata + ")");
				var img_width = (meta_json.width ? meta_json.width : 250);
				imgtag = "<img src=\"" + document.location.protocol + "//" + appserver + ":" + uploadPort + "/pubfiledownload/" +ownerkey + "/" + filekey + "_thumb.png\" onerror='this.src=\"/" + libpath + "/thm_image.png\"' " + (mode == "chat_detail" ? "class=\"kfiles_detail_img\"": "") + " alt=\"\"" + (img_width < 250 ? " style=\"width:" + img_width + "px !important;\"" : "") + "/>";
			}else{
				imgtag = "<img src=\"" + document.location.protocol + "//" + appserver + ":" + uploadPort + "/pubfiledownload/" +ownerkey + "/" + filekey + "_thumb.png\" onerror='this.src=\"/" + libpath + "/thm_image.png\"' " + (mode == "chat_detail" ? "class=\"kfiles_detail_img\"": "") + " alt=\"\" />";
			}*/
			imgtag = "<img src=\"" + document.location.protocol + "//" + appserver + ":" + uploadPort + "/pubfiledownload/" +ownerkey + "/" + filekey + "_thumb.png\" onerror='this.src=\"/" + libpath + "/thm_image.png\"' " + (mode == "chat_detail" ? "class=\"kfiles_detail_img\"": "") + " alt=\"\" style=\"max-width:204px;\"/>";
		}
		break;
	case "txt" :
		if (mode == "list"){
			imgtag = "<img src=\"/" + libpath + "/ico_type_text.png\" alt=\"\" />";
		}else if (mode == "chat"){
			imgtag = "<img src=\"/" + libpath + "/text_32.png\" alt=\"\" />";
		}else{
			imgtag = "<img src=\"" + document.location.protocol + "//" + appserver + ":" + uploadPort + "/pubfiledownload/" + ownerkey + "/" + filekey + "_thumb.png\" onerror='this.src=\"/" + libpath + "/thm_text.png\"' " + (mode == "chat_detail" ? "class=\"kfiles_detail_img\"": "") + " alt=\"\" style=\"max-width:204px;\"/>";
		}
		break;
	case "avi" :
	case "mov" :
	case "wmv" :
	case "mp4" :
	case "mkv" :
	case "flv" :
	case "3gp" :
		if (mode == "list"){
			imgtag = "<img src=\"/" + libpath + "/ico_type_movie.png\" alt=\"\" />";
//		}else if (mode == "chat"){
//			imgtag = "<img src=\"/" + libpath + "/movie_32.png\" alt=\"\" />";
		}else{
			imgtag = "<img src=\"" + document.location.protocol + "//" + appserver + ":" + uploadPort + "/pubfiledownload/" + ownerkey + "/" + filekey + "_thumb.png\" onerror='this.src=\"/" + libpath + "/thm_movie.png\"' " + (mode == "chat_detail" ? "class=\"kfiles_detail_img\"": "") + " alt=\"\" style=\"max-width:204px;\"/>";
		}
		break;
	case "exe" :
		if (mode == "list"){
			imgtag = "<img src=\"/" + libpath + "/ico_type_exe.png\" alt=\"\" />";
		}else if (mode == "chat"){
			imgtag = "<img src=\"/" + libpath + "/exe_32.png\" alt=\"\" />";
		}else{
			imgtag = "<img src=\"/" + libpath + "/thm_exe.png\" " + (mode == "chat_detail" ? "class=\"kfiles_detail_img\"": "") + " alt=\"\" />";
		}
		break;
	default :
		if (mode == "list"){
			imgtag = "<img src=\"/" + libpath + "/ico_type_unknown.png\" alt=\"\" />";
		}else if (mode == "chat"){
			imgtag = "<img src=\"/" + libpath + "/unknown_32.png\" alt=\"\" />";
		}else{
			imgtag = "<img src=\"/" + libpath + "/thm_unknown.png\" " + (mode == "chat_detail" ? "class=\"kfiles_detail_img\"": "") + " alt=\"\" />";
		}
		break;
	}
	return imgtag;
}
/* qtip dialogue */
// Alert/Confirm/Prompt
function dialogue(content, title) {
	$('<div />').qtip({
		content: {
			text: content,
			title: title
		},
		position: {
			my: 'center', at: 'center',
			target: $(window)
		},
		show: {
			ready: true,
			modal: {
				on: true,
				blur: false
			}
		},
		hide: false,
		style: {
			classes: 'qtip-bootstrap dialogue'
		},
		events: {
			render: function(event, api) {
				$('button', api.elements.content).click(function(e) {
					api.hide(e);
				});
			},
			hide: function(event, api) { api.destroy(); }
		}
	});
}
window.kportalAlert = function(alert_text) {
	alert_text = alert_text.replace(/\r\n|\r|\n/g, "<br>");
	var message = $('<p />', { html: alert_text }),
		div = $('<div />'),
		ok = $('<button />', {
			text: 'OK',
			'class': 'full'
		});
//	dialogue( message.add(ok), '메시지' );
	dialogue( message.add(div.append(ok)), _i18n.g("kportal_alert") );
}
window.Prompt = function() {
	var message = $('<p />', { text: 'What do you think about these custom dialogues?' }),
		input = $('<input />', { val: 'Fantastic!' }),
		ok = $('<button />', {
			text: 'Ok'
		}),
		cancel = $('<button />', {
			text: 'Cancel'
		});
	dialogue( message.add(input).add(ok).add(cancel), 'Attention!' );
}
window.kportalConfirm = function(confirn_text, callback) {
	confirn_text = confirn_text.replace(/\r\n|\r|\n/g, "<br>");
	var message = $('<p />', { html: confirn_text }),
		div = $('<div />'),
		ok = $('<button />', {
			id : 'kportal_confirm_ok',
			text: 'OK',
			click: function() { callback(true); }
		}),
		cancel = $('<button />', {
			id : 'kportal_confirm_cancel',
			text: 'CANCEL',
			click: function() { callback(false); }
		});
//	dialogue( message.add(ok).add(cancel), '확인' );
	dialogue( message.add(div.append(ok).append(cancel)), _i18n.g("kportal_confirm") );
}
function set_qtip(){
	$('[title]').qtip({
		style: {
			/*classes: 'qtip-dark qtip-rounded'*/
			/*classes: 'qtip-tipsy'*/
			classes: 'qtip-youtube'
		},
		position: {
			my: 'top center',
			at: 'bottom center'
		},
		hide: {
			event: 'click mouseleave'
		}
	});
}
function make_random_id(){
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (var i = 0; i < 32; i++ ){
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
