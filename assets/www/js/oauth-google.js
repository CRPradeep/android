/*
 * oauth-google.js
 * oAuth Dependencies
 *  - Google whitelist URL (With allow subdomains="true")
 *  	https://google.com
 *  	http://google.com
 *  	https://ssl.gstatic.com
 *  
 * Version 1.0
 * Pending Items:
 * 	- Whitelist URL updation
 */
var oAuthGoogle = function(){
	var authClientId = '';
	var authDeviceData = null;
	var authClientSecret = "";
	var authScope = []; 
	var authUserCodeExpireTime = null;
	var authAccessCodeExpireTime = null;
	var authAccessCode = null;
	var userChildWindow = null;
	
	/*
	 * Function Name : initEnv
	 * Inputs : client id, client secret, scope of the authentication
	 * scope Ex : ["https://gdata.youtube.com"]
	 * Initialize the required variables for object
	 */
	this.initEnv = function(clientId,clientSecret,scope){
		authClientId = clientId;
		authClientSecret = clientSecret;
		authScope = scope;
		authAccessCodeExpireTime = widget.preferences.getItem( 'oAuthGoogleAccessExpire');
		authAccessCode = widget.preferences.getItem( 'oAuthGoogleAccessToken');
	};
	/*
	 * Function Name : isLogin
	 * Returns the login status of google based on the accesstoken
	 */
	this.isLogin = function(){
		var availableAccessToken = widget.preferences.getItem( 'oAuthGoogleAccessToken');
		if(availableAccessToken != null)
			return true;
		else
			return false;
	};
	/*
	 * Function Name : returnAccessCode
	 * Inputs : callback function
	 * Return the accesscode to the callback function
	 */
	this.returnAccessCode = function(callback){
		if(authAccessCode != null){
			var curTime = Math.floor((new Date().getTime())/1000) + 60;
			if(authAccessCodeExpireTime > curTime){
				window[callback](authAccessCode);
			}
			else{
				refreshAccessToken(callback);
			}
		}
		else{
			getUserCode(callback);
		}
	};
	/*
	 * Function Name : logOut
	 * logout the user by removing the refresh and access token from memory
	 */
	this.logOut = function(){
		 widget.preferences.removeItem( 'oAuthGoogleAccessExpire');
		 widget.preferences.removeItem( 'oAuthGoogleAccessToken');
		 widget.preferences.removeItem('oAuthGoogleRefreshToken');	
		 authAccessCodeExpireTime = null;
		 authAccessCode = null;
	};
	
	/*
	 * Function Name : getUserCode
	 * Input : callback
	 * Invoked internally - not accessible through object
	 * Retrieve the user code and initiate the user authentication process
	 */
	var getUserCode = function(callback){
		var _authScope = escape(authScope.join("+")).replace(/\//g,"%2F");
    	var userTokenURL = "https://accounts.google.com/o/oauth2/device/code?" 
    		+ "scope=" + $.trim(_authScope) + "&" 
    		+ "client_id=" + authClientId;
    	
    	$.ajax({
		 	url:userTokenURL,
		 	type:"POST",
		 	headers:{
		 		"Content-Type": "application/x-www-form-urlencoded"
		 	},
		 	success:function(data){
		 		authDeviceData = data;//user_code,device_code, expires_in, verification_url, intervel		 			
		 		authDeviceData.expires_in = Math.floor((new Date()).getTime()/1000) + data.expires_in - 60;
		 		userChildWindow = window.open(authDeviceData.verification_url, '_blank');
		 		window.userWindowIntervel = self.setInterval(authenticateUser,500,callback);
		 		window.userCodeIntervel = setTimeout(validateIdle,120000,callback);
		 	},
		 	error:function(xhr,status,data){
		 		console.error("Google OAuth : ", xhr.status," ",status);
		 		window[callback](false);
		 	}
		 });
	};
	
	/*
	 * Function Name : refreshAccessToken
	 * Input : callback
	 * Invoked internally - not accessible through object
	 * Refresh the expired access token
	 */
	var refreshAccessToken = function(callback){		
		var urlToken ="https://accounts.google.com/o/oauth2/token";	
		var dataval ="client_id=" + authClientId + "&" +
			"client_secret=" + authClientSecret + "&" + 
			"refresh_token=" + widget.preferences.getItem('oAuthGoogleRefreshToken') +"&" +
			"grant_type=refresh_token";
		$.ajax({
			url:urlToken,
			data:dataval,
			type:"POST",
			crossDomain:true,
			success:function(response){
				authAccessCode = response.access_token;
				widget.preferences.setItem( 'oAuthGoogleAccessToken', response.access_token);				
				authAccessCodeExpireTime = Math.floor((new Date().getTime())/1000) + response.expires_in;
				widget.preferences.setItem( 'oAuthGoogleAccessExpire',authAccessCodeExpireTime);
				window[callback](authAccessCode);
			},
			error:function(xhr,status,code){
				console.error("Google OAuth : ", xhr.status," ",status);
				window[callback](false);
			}
		});
	};
	
	/*
	 * Function Name : getAccessToken
	 * Input : callback
	 * Invoked internally - not accessible through object
	 * Retrieves the access token on successful user authentication 
	 */
	var getAccessToken = function(callback){
		var self = this;
		var urlToken ="https://accounts.google.com/o/oauth2/token"; 
		var dataval ="client_id=" + authClientId + "&" +
			"client_secret=" + authClientSecret + "&" + 
			"code=" + authDeviceData.device_code +"&" +
			"grant_type=http://oauth.net/grant_type/device/1.0";		
			$.ajax({
				url:urlToken,
				data:dataval,
				type:"POST",
				crossDomain:true,
				success:function(response){
					if(response.error != null){
						var interval = authDeviceData.interval * 1000;
						setTimeout(function(){getAccessToken(callback);},interval);
					}
					else{
						widget.preferences.setItem( 'oAuthGoogleRefreshToken', response.refresh_token);
						authAccessCode = response.access_token;
						widget.preferences.setItem( 'oAuthGoogleAccessToken', response.access_token);				
						authAccessCodeExpireTime = Math.floor((new Date().getTime())/1000) + response.expires_in;
						widget.preferences.setItem( 'oAuthGoogleAccessExpire',authAccessCodeExpireTime);
						window[callback](authAccessCode);
					}
				},
				error:function(xhr,status,code){
					console.error("Google OAuth : ", xhr.status," ",status);
					window[callback](false);
				}
			});		
	};
	
	/*
	 * Function Name : authenticateUser
	 * Input : callback
	 * Invoked internally - not accessible through object
	 * Monitors the child browser and terminates on approval(Approve/Deny) 
	 */
	var authenticateUser = function(callback) {
		var currentURL = userChildWindow.window.location.href;
		var userCodeCallbackURL = 'https://accounts.google.com/o/oauth2/device/usercode';
		var approvalCallbackURL = 'https://accounts.google.com/o/oauth2/device/approval';
		var userCallback = currentURL.indexOf(userCodeCallbackURL);
		var approvalCallback = currentURL.indexOf(approvalCallbackURL);		
		var currentTime =  Math.floor((new Date().getTime())/1000)
		var _expires_in = authDeviceData.expires_in - currentTime;
		if(userCallback == 0) {			
			var userCodeElem = userChildWindow.window.document.getElementById("user_code");
			if(userCodeElem != null){
				userChildWindow.window.document.getElementById("user_code").value = authDeviceData.user_code;
				userChildWindow.window.document.getElementById("user_code_form").submit();
			}
		}
		if(approvalCallback == 0){
			var approved = userChildWindow.window.document.getElementById("approval_message");
			var denied = userChildWindow.window.document.getElementById("deny_message");
			if(approved != null || denied != null){
				window.clearInterval(userWindowIntervel);
				clearTimeout(userCodeIntervel);
				userChildWindow.close();
				if(approved != null){
					getAccessToken(callback);
					logOutGoogle();
				}
				else{
					console.warn("Google OAuth : User approval required for authentication");
					window[callback](false);
				}
			}
		}
		if(_expires_in <1){
			alert("Authentication process invalidated. Try Again.");
			window.clearInterval(userWindowIntervel);
			clearTimeout(userCodeIntervel);
			userChildWindow.close();
			logOutGoogle();
		}
	};
	/*
	 * Function Name : logOutGoogle
	 * Invoked internally - not accessible through object
	 * Logout the user account from the browser on closing of childbrowser,
	 */
	var logOutGoogle = function(){
		$.ajax({
			url:"https://www.google.com/accounts/Logout",
			success:function(data){	
			},
			error:function(xhr,status,data){ 
				console.warn("Google OAuth :  User is not logged in");
	     	}
		});
	}
	
	/*
	 * Check the status of childBrowser every 2 minutes and prompt the user for authentication 
	 * Function Name : validateIdle
	 * Invoked internally - not accessible through object
	 * Validates the user idle status.
	 */
	var validateIdle = function(callback){
		var currentTime =  Math.floor((new Date().getTime())/1000);
		var _expires_in = authDeviceData.expires_in - currentTime;
		var confirmation = "Your taking too long to authorize the request.\n";
		confirmation += "Process will be invalidated in " + _expires_in + " seconds by default";
		confirmation += "\n\t\tOk - Continue\n\t\tCancel - Abort";
		
		if((!confirm(confirmation)) || _expires_in < 1){
			window.clearInterval(userWindowIntervel);
			clearTimeout(userCodeIntervel);
			userChildWindow.close();
			logOutGoogle();
			window[callback](false);
		}
		else
			window.userCodeIntervel = setTimeout(validateIdle,120000,callback);
	}
};

