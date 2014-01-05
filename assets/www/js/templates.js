//Define an angular module for our app
var sampleApp = angular.module('sampleApp', ['ngRoute', 'sampleApp.directives']);

//Define Routing for app
sampleApp.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
	when('/reports', {
		templateUrl: 'templates/reports.html',
		controller: 'AddSwiperScreenController'
	}).
	when('/home', {
		templateUrl: 'templates/login.html',
		controller: 'AddHomeController'
	}).
	otherwise({
		redirectTo: '/reports'
	});
}]);

angular.module('sampleApp.directives', []).
directive('enhanceJqmView', [function() {
	  return function($scope, el) {
	        setTimeout(function(){$scope.$on('$viewContentLoaded', el.trigger("create"))});
	  };
}]);

sampleApp.controller('AddSwiperScreenController', function($scope) {
	app.initializeTabs();
	app.initializeSwiperScreen();

	$('#hour_field').datetimepicker({
		datepicker:false,
		hours12: true,
		timeHeightInTimePicker: 15,
		format:'H:i'
	});
	
	$('#bp_month_field, #diabetes_month_field').datetimepicker({
		timepicker:false,
		 format:'d.m.Y'
	});
	
	var _name = window.localStorage.getItem("name");
	var _age = parseInt(window.localStorage.getItem("age"));
	var _gender = window.localStorage.getItem("gender");
	var btnTxts = ['Add New', 'Done'];
		
	$scope.user = {name : _name==null ? '' : _name,  age: (_age==null || isNaN(_age)) ? '' : _age, gender: _gender==null ? 'Male': _gender};	
	$scope.alarm = {hour : '00.00', period : 'AM', label : 'Test BP/Sugar Now.'};
	$scope.showPhotoEditBtn = false;
	$scope.showCharts = true;
	$scope.reportBtnTxt = btnTxts[0];
	
	$scope.showOrAddReports = function(){
		if($scope.reportBtnTxt === btnTxts[0]){
			$scope.reportBtnTxt = btnTxts[1];
			$(".add_btn").buttonMarkup({ icon: "check" });
			$scope.showCharts = false;
		}else if($scope.reportBtnTxt === btnTxts[1]){
			$scope.reportBtnTxt = btnTxts[0];
			$(".add_btn").buttonMarkup({ icon: "plus" });
			$scope.showCharts = true;
		}
	}
	
	$scope.savePatientDetails = function(){
		var alertMsg;
		if(window.localStorage.getItem("name") == $scope.user.name &&
				window.localStorage.getItem("age") == $scope.user.age &&
				window.localStorage.getItem("gender") == $scope.user.gender){
			alertMsg = "No Modifications found."
		}else{
			window.localStorage.setItem("name", $scope.user.name);
			window.localStorage.setItem("age", $scope.user.age);
			window.localStorage.setItem("gender", $scope.user.gender);
			
			alertMsg = "Patient Details Saved.";
		}		
		alert(alertMsg);
	};
	
	$scope.setAlarm = function(){
		$scope.alarm.hour = $("#hour_field").val();
		cordova.exec(
					function(successObj) {}, 
					function(errorObj) {alert("Sorry. An error occurred while setting alarm. Please try again.");}, 
					"AlarmPlugin", "SET_ALARM", [$scope.alarm.hour.substring(0,2), $scope.alarm.period, $scope.alarm.label]);
	};
	
	$scope.showOrHideEditButton = function(){
		$scope.showPhotoEditBtn = !$scope.showPhotoEditBtn;
	};
	
	$scope.hideEditButton = function(){
		if($scope.showPhotoEditBtn){
			$scope.showPhotoEditBtn = !$scope.showPhotoEditBtn;
		}
	};
	
	$scope.openGallery = function(){
		navigator.camera.getPicture(function(imageURI) {
				window.localStorage.setItem("photoUri", imageURI);
				$scope.setProfilePic();
		    },function(errorObj) {
		    	alert("Sorry! Try again later.");
		    }, {sourceType : Camera.PictureSourceType.PHOTOLIBRARY} );	

		$scope.hideEditButton();
	};	
	
	$scope.setProfilePic = function(){
		var uri = window.localStorage.getItem("photoUri");
		if(uri != null){
			$('.photo').css('background', 'url(' + uri + ') no-repeat center');
		}		
	};
	
	var chartBackground = {
            type: 'linearGradient',
            x0: 0, y0: 0,
            x1: 0, y1: 1,
            colorStops: [{ offset: 0, color: '#DBEDFF' }, { offset: 1, color: 'white' }]
    };
	
	$('.jqChart').jqChart({
		title: { text: "Diabetes and BP report" },
		background: chartBackground,
		tooltips: {
            disabled: false,
            highlighting: true,
            highlightingFillStyle: 'rgba(255, 127, 255, .9)',
            highlightingStrokeStyle: 'black'
        },
		legend: {
            visible: true,
            allowHideSeries: true,
            location : 'bottom',            
            border: {
                lineWidth: 1,
                strokeStyle: '#999'
            },
            font: '12px sans-serif',
            textFillStyle: '#418CF0',
            background: '#eeeeee',
            margin: 5
        },
        border: {
            cornerRadius: 0,
            lineWidth: 5,
            strokeStyle: '#fff'
        },
        shadows: {
            enabled: true,
            shadowColor: '#b8b8b8',
            shadowBlur: 5,
            shadowOffsetX: 2,
            shadowOffsetY: 1
        },
		axes: [{
	    	   location: 'left',
	    	   minimum: 75,
	    	   maximum: 350,
	    	   interval: 50
       }],      
       noDataMessage: {
           text: 'No records found!',
           font: '14px sans-serif'
       },
       series: [{
    	   	   title: 'Diabetes',
               type: 'column',
               cursor: 'pointer',
               data: [['january', 321], ['february', 275], ['march', 213], ['april', 119], ['may', 147], ['june', 116],
                      ['july', 110], ['august', 118], ['september', 101], ['october', 109], ['november', 97], ['december', 116]]
	   }]
	});
	
	$('.jqChart').bind('tooltipFormat', function (e, data) {
        return data.x + "<br />" + data.y + " mg/dl"
    });
	
});

sampleApp.controller('AddHomeController', function($scope, $location, $http) {
	app.setScreenBounds();
	
	$scope.goto = function(path){
		cordova.exec(function(successObj) {
			if(successObj != null && successObj.length >0){
				var accNames = "";

				$.each(successObj, function( index, accObj ) {
					if(accObj.type == "com.google"){
						accNames += accObj.accName + "\n";
					}
				});
//				alert(accNames);
				$location.path(path);
			}else{
				alert("Sorry. Your device is not registered with google");
			}
		}, function(error) {alert("Sorry. Your device is not registered with google");}, "GetGoogleAccPlugin",
		"GET_GOOGLE_ACC", []);
		
		
		/*$http({method: 'GET', url: 'https://accounts.google.com/o/oauth2/auth?redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=token&client_id=799913527324-cjaa444df51b5tdba0ok745brkg42aaf.apps.googleusercontent.com'}).
		  success(function(data, status, headers, config) {
		    alert("success: "+data);
		  }).
		  error(function(data, status, headers, config) {
			  alert("error: "+data);
		  });*/
	}
});