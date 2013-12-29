/*
 * Filename: upload-google.js
 * Version: 1.0
 * Author: Prokarma, Inc.
 * - Description
 *   > specific to the application
 *   > handles the youtube uploading functionality
 *  -------------------------------------------------------------
 * Copyright (c) 2013 Prokarma, Inc.
 * All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE.
 * The copyright notice above does not evidence any actual or
 * intended publication of such source code.
 * --------------------------------------------------------------
 */

var YoutubeUpload = function(){};
var uploadSystem = new FileSystem();
YoutubeUpload.prototype = {
		callback : null,
		accessToken :'',
		key : '',
		fileName : '',
		totalFiles : 0,
		totalUploaded : 0,
		totalRequested : 0,
		failed: "",
		success: "",
		failure: "",
		
		/*
		 * Function Name : multiUpload
		 * Input : fileset as array of file names, accesstoken, developerkey
		 * Upload multiple files to youtube
		 */
		multiUpload:function(fileSet,accessToken,key,callback){
			var self = this;
			self.callback = callback;
			self.totalFiles = fileSet.length;
			self.totalUploaded = 0;
			self.totalRequested = 0;
			self.success = "";
			self.failure = "";
			$(".filecount").text("1 of "+self.totalFiles);
			$(fileSet).each(function(index,fileName){
				self.upload(fileName, accessToken, key);
			});
		},
		
		/*
		 * Function Name: Upload
		 * Input : filname, accesstoken, developerkey, callback function
		 * Upload : fetch the file from device and send it to processing for other functions
		 */
		upload:function(fileName,accessToken,key){
			var self = this;
			var data = '';
			var category = 'Music';
			self.accessToken = accessToken;
			self.key = key;
			self.fileName = fileName;			
			uploadSystem.readFile("video",fileName,function(filedata){
				data = filedata;
				//
				var filter = new tizen.AttributeFilter("contentURI", "CONTAINS", fileName);
				tizen.content.find(function(contents){
					var content = contents[0];
					self.formData(data,content.mimeType.replace("3gpp","3gp"),content.title,widget.name,category,content.description,fileName);
					}, function(){console.log(appLog  + " : error");},null, filter,null);

				
			});
		},
		
		/*
		 * Function Name : formData
		 * Input : filebase64 data, file format, title, description, category, keywords
		 * form the data suitable to upload for youtube.
		 */
		
		formData:function(data,format,title,description,category,keywords,fileName){
			var self = this;
			var template = "--VIDEOCONTENT\r\n" 
				+ "Content-Type: application/atom+xml; charset=UTF-8\r\n\r\n" 
				+ '<?xml version="1.0"?>' 
				+ '<entry xmlns="http://www.w3.org/2005/Atom" ' 
				+ 'xmlns:media="http://search.yahoo.com/mrss/" '
				+ 'xmlns:yt="http://gdata.youtube.com/schemas/2007">' 
				+ '<media:group>' 
				+ '<media:title type="plain">' + title + '</media:title>' 
				+ '<media:description type="plain">' + description + '</media:description>' 
				+ '<media:category scheme="http://gdata.youtube.com/schemas/2007/categories.cat">' 
				+ category + '</media:category>' 
				+ '<media:keywords>' + keywords + '</media:keywords>'
				+ '</media:group>' 
				+ '</entry>\r\n' 
				+ "--VIDEOCONTENT\r\n" 
				+ "Content-Type: " + format + "\r\n" 
				+ "Content-Transfer-Encoding: base64\r\n\r\n"
				+ data + "\r\n--VIDEOCONTENT--";			
			self.directUpload(template,fileName).bind(self);
		},
		/*
		 * Function Name : directupload
		 * Input : template to be uploaded
		 * Uploads the formatted data to the youtube
		 */
		directUpload:function(template,fileName){
			var self= this;
			try{
			 	$.ajax({
				 	url:"http://uploads.gdata.youtube.com/feeds/api/users/default/uploads",
				 	type:"POST",
				 	headers:{
				 		"Authorization" : "Bearer " + this.accessToken,
				 		"GData-Version" : "2",
				 		"X-GData-Key": "key=" + this.key,
				 		"Slug" : fileName.replace(/^.*[\\\/]/, ''),
				 		"Content-Type" : 'multipart/related; boundary="VIDEOCONTENT"',
				 		"Content-Length" : template.length,
				 		"Connection" : "close",
				 	},
				 	beforeSend:function(){
				 		if(self.totalUploaded == 0 && self.totalRequested == 0){
				 			
				 			//$("#progress-div").css("display","block");
				 			//$("#progressbar").progress( "running", true);
				 		}
				 			
				 		self.totalRequested++;
				 	},
				 	data:template,
				 	success: function(data){
				 		self.success += fileName.replace(/^.*[\\\/]/, '') + ", ";
				 	},
				 	error:function(shr,status,data){
				 		self.failure += fileName.replace(/^.*[\\\/]/, '') + ", ";
				 		//custom.alert(fileName.replace(/^.*[\\\/]/, '') + " cannot be uploaded for some reason. Try again later.");
				 	},
				 	complete:function(){
				 		self.totalUploaded++;
				 		$(".filecount").text((self.totalUploaded+1)+" of "+self.totalFiles);
				 		if(self.totalUploaded == self.totalFiles)
				 			{
				 			//$("#progress-div").css("display","none");
				 			self.callback(self.success,self.failure);
				 			}
				 	}
				 });
				}
				catch(e){console.log(appLog + " : " + e)}
		}
};
