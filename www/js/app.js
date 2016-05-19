angular.module('app', ['ionic', 'ionic.service.core', 'ionic.service.push', 'ionic.service.analytics', 'ngCordova', 'app.controllers', 'app.services'])

.run(function($ionicPlatform, $ionicUser, $ionicAnalytics, $cordovaStatusbar) {
  $ionicPlatform.ready(function() {
    $cordovaStatusbar.overlaysWebView(true)
    $cordovaStatusBar.style(1);

    $ionicAnalytics.register();

    $ionicUser.identify({
      user_id: $ionicUser.generateGUID()
    });

    if(typeof analytics !== undefined) {
        if( /(android)/i.test(navigator.userAgent) ) { 
            analytics.startTrackerWithId("UA-30792962-13");
        } else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
            analytics.startTrackerWithId("UA-30792962-12");
        } 
    } else {
        console.log("Google Analytics Unavailable");
    }

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }

    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    
   

  });
})

.config(function($stateProvider, $urlRouterProvider,$ionicAppProvider, $compileProvider) {

  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);

  $ionicAppProvider.identify({
    app_id: 'fce11c10',
    api_key: 'b9cc59645b7bc3fb5ea5dd0d167953ffaaa6a9aebd14b237',
    dev_push: true
  });

  $stateProvider
    .state('home', {
        url: '/',
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'
    })
    .state('crop', {
        url: 'crop',
        templateUrl: 'templates/crop.html',
        controller: 'CropCtrl'
    })
    .state('edit', {
        url: 'edit',
        templateUrl: 'templates/edit.html',
        controller: 'EditCtrl'
    })
    // .state('share', {
    //     url: 'share',
    //     templateUrl: 'templates/share.html',
    //     controller: 'ShareCtrl'
    // })
    .state('success', {
        url: 'success',
        templateUrl: 'templates/success.html',
        controller: 'SuccessCtrl'
    });


  $urlRouterProvider.otherwise('/');

})