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
/*.directive('chart', function() {
        return {
          restrict: 'A',
          link: function($scope, $elm, $attr) {
            // Create the data table.
            var data = new google.visualization.DataTable();
            data.addColumn('string', '(mg/dl)');
            data.addColumn('number', 'Blood Sugar');
            data.addRows([
              ['January', 300],
              ['February', 281],
              ['March', 213],
              ['April', 207],
              ['May', 174],
              ['June', 158],
              ['July', 140],
              ['August', 133],
              ['September', 112],
              ['October', 120],
              ['November', 99],
              ['December', 105],
            ]);

            var name = window.localStorage.getItem("name") == null ? 'Your' : window.localStorage.getItem("name");
            // Set chart options
            var options = {'title': name + "'s BP and Blood Sugar Chart",
                           'width':window.screen.availWidth-50,
                           'height':window.screen.availHeight-100};

            // Instantiate and draw our chart, passing in some options.
            var chart = new google.visualization.ColumnChart($elm[0]);
            chart.draw(data, options);
          }
      }
 });*/

sampleApp.controller('AddSwiperScreenController', function($scope) {
	app.initializeTabs();
	app.initializeSwiperScreen();

	$('#hour_field').datetimepicker({
		datepicker:false,
		hours12: true,
		timeHeightInTimePicker: 15,
		format:'H:i'
	});
	
	var _name = window.localStorage.getItem("name");
	var _age = parseInt(window.localStorage.getItem("age"));
	var _gender = window.localStorage.getItem("gender");
		
	$scope.user = {name : _name==null ? '' : _name,  age: (_age==null || isNaN(_age)) ? '' : _age, gender: _gender==null ? 'Male': _gender};	
	$scope.alarm = {hour : '00.00', period : 'AM', label : 'Test BP/Sugar Now.'};

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
	
	$scope.openGallery = function(){
		navigator.camera.getPicture(function(imageURI) {
				window.localStorage.setItem("photoUri", imageURI);
				$scope.setProfilePic();
		    },function(errorObj) {
		    	alert("Sorry! Try again later.");
		    }, {sourceType : Camera.PictureSourceType.PHOTOLIBRARY} );
	};	
	
	$scope.setProfilePic = function(){
		var uri = window.localStorage.getItem("photoUri");
		if(uri != null){
			$('.photo').css('background', 'url(' + uri + ') no-repeat center');
		}		
	};
	
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