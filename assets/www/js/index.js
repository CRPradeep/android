/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
		// Application Constructor
		initialize: function() {
			this.bindEvents();			
		},
		// Bind Event Listeners
		//
		// Bind any events that are required on startup. Common events are:
		// 'load', 'deviceready', 'offline', and 'online'.
		bindEvents: function() {
			document.addEventListener('deviceready', this.onDeviceReady, false);
			/*var supportsOrientationChange = "onorientationchange" in window,
			orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

			window.addEventListener(orientationEvent, this.setScreenBounds, false);*/
		},
		// deviceready Event Handler
		//
		// The scope of 'this' is the event. In order to call the 'receivedEvent'
		// function, we must explicity call 'app.receivedEvent(...);'
		onDeviceReady: function() {
			navigator.splashscreen.hide();			
		},
		
		initializeTabs: function(){
			myTabs = $('.tabs').swiper({
				mode:'horizontal',
				slidesPerView : 1.5,
				offsetSlidesBefore : 0.25,
				offsetPxAfter : 100,
				initialSlide: window.localStorage.getItem("name") ==null ? 2 : 0,
				shortSwipes : true,
				pagination: document.getElementById("pagination"),
				createPagination : true,
				paginationClickable: true,
				onSlideChangeEnd: app.onTabChanged,
				loop: false
			});
			setTimeout(function(){
				app.alignTabContent();	
			}, 500);			
		},
		
		initializeSwiperScreen: function(){
			app.setScreenBounds();
			mySwiper = $('.swiper-container').swiper({
				mode:'horizontal',
				shortSwipes : true,
				initialSlide: window.localStorage.getItem("name") ==null ? 2 : 0,
				onSlideChangeEnd: app.onSlideChanged,
				loop: false,
				simulateTouch: false
			}); 
			app.alignTabContent();
		},
		
		onSlideChanged : function(e){
			myTabs.swipeTo(mySwiper.activeIndex, 0, false);
			app.alignTabContent();	
		},
		
		onTabChanged : function(e){
			mySwiper.swipeTo(myTabs.activeIndex, 0, false);	
			
			app.alignTabContent();
		},

		alignTabContent : function(){
			var _activeIndex = myTabs.activeIndex;
			if(_activeIndex != mySwiper.getFirstSlide().index()){
				var prevEle = myTabs.getSlide(_activeIndex-1);				
				$(prevEle).css('text-align','right').trigger("true", 500);
				$(prevEle).css('color','#ccc').trigger("true");
			}
			if(_activeIndex != mySwiper.getLastSlide().index()){
				var nextEle = myTabs.getSlide(_activeIndex+1);				
				$(nextEle).css('text-align','left').trigger("true", 500);	
				$(nextEle).css('color','#ccc').trigger("true");
			}
			var currEle = myTabs.getSlide(_activeIndex);
			$(currEle).css('text-align','center').trigger("true", 500);
		},
		
		setScreenBounds: function(){
			var availableWidth = window.screen.availWidth;
			var availableHeight = window.screen.availHeight;

			var height = availableHeight > availableWidth ? availableHeight : availableWidth;

			if(window.orientation != 0){
				var height = availableHeight > availableWidth ? availableWidth : availableHeight;
			}
			
			$(".swiper-container").css("height", (height-55)+"px").trigger("true");
			$(".home_wrapper").css("height", height+"px").trigger("true");
			
		},
		
		refreshView: function(){
			$(".apps").trigger("create");
		},
};
