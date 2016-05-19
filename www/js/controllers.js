angular.module('app.controllers', [])

// home
  .controller('HomeCtrl', ['$scope', '$state', '$ionicAnalytics', 'Camera', 'GetImageToCrop', function($scope, $state, $ionicAnalytics, Camera, GetImageToCrop){
    console.log('home controller loaded');
    if(typeof analytics !== "undefined") { 
      analytics.trackView("View home screen"); 
      alert('ga exist!');
    }
    $ionicAnalytics.track('View home screen');
    
    mixpanel.track('View home screen');

    $scope.takePicture = function(imageSource) {
      var options = {
        quality: 100,
        // destinationType : navigator.camera.DestinationType.FILE_URI,
        sourceType: imageSource,
        encodingType: navigator.camera.EncodingType.JPG
      };

      Camera.getPicture(options).then(function(imageURI) {
        $scope.lastPhoto = imageURI;
        GetImageToCrop.set($scope.lastPhoto);
        $state.go('crop');
      }, function(err) {
        console.err(err);
      });

      if (imageSource == 1) {
        $ionicAnalytics.track('Took Picture');
        mixpanel.track('Took Picture');
      } else {
        $ionicAnalytics.track('Chose from Library');
        mixpanel.track('Chose from Library');
      }
    };

    // $scope.selectedImage = "img/example-vertical.jpg";
    $scope.selectedImage = "img/example-horizontal.jpg";
    GetImageToCrop.set($scope.selectedImage);

  }])

// crop
  .controller('CropCtrl', ['$scope', '$state', '$ionicAnalytics','GetImageToCrop','GetCropedImage', function ($scope, $state, $ionicAnalytics, GetImageToCrop, GetCropedImage){
    console.log('crop controller loaded');
    
    if(typeof analytics !== "undefined") { analytics.trackView("View crop screen"); }
    $ionicAnalytics.track('View crop screen');
    mixpanel.track('View crop screen');

    var canvas = new fabric.Canvas('cropCanvas', {
          width: window.innerWidth,
          height: window.innerWidth
        }),
        imageToCrop = GetImageToCrop.get();

    fabric.Image.fromURL(imageToCrop, function(image) {

      image.set({
        hasControls: false,
        padding: 9999,
        controlsAboveOverlay: true,
        lockUniScaling: true,
        centeredRotation: false,
        centeredScaling: false,
        // lockRotation: true,
        // lockScalingY: true,
        // lockScalingX: true,
        scaleY: canvas.height / image.getBoundingRectWidth(),
        scaleX: canvas.width / image.getBoundingRectWidth(),
      }).setCoords();



      if ( image.width > image.height ) {     // Largura é maior que a Altura
        var itemAngle     = image.getAngle();
        var itemWidth     = image.width;
        var itemHeight    = image.height;

        // image.setAngle(itemAngle+90).setCoords();

        image.set({
          scaleY: window.innerWidth / itemHeight,
          scaleX: window.innerWidth / itemHeight,
          // lockMovementX: true,
          // lockMovementY: false,
          originX: 'center',
          originY: 'center',
          left: image.getBoundingRectWidth() / 2,
          top: image.getBoundingRectHeight() / 2
        }).setCoords();

      }

      else if ( image.height > image.width ) { // Altura é maior que a Largura
        image.set({
          // lockMovementX: true,
          // lockMovementY: false
        }).setCoords();
      }

      else if ( image.height == image.width ) { // Imagem quadrada
        image.set({
          // lockMovementX: true,
          // lockMovementY: true
        }).setCoords();
      }

      canvas.clear();
      canvas.add(image);
      image.center().setCoords();
      canvas.renderAll();
    });

    // canvas.on({ 'touch:drag':
    //   function() {
    //     var item          = canvas.item(0);
    //         itemWidth     = item.getBoundingRectWidth(),
    //         itemHeight    = item.getBoundingRectHeight(),
    //         itemTop       = item.getBoundingRect().top,
    //         itemLeft      = item.getBoundingRect().left;

    //     if ( item.width > item.height ) {
    //       var itemOffset = itemHeight - canvas.height;

    //       if ( item.top > itemHeight/2 ) {
    //         item.set({top:itemHeight/2});
    //       }
    //       else if ( item.top < itemOffset ) {
    //         item.set({top: itemOffset});
    //       }
    //     }

    //     else if ( item.height > item.width ) {
    //       var itemHeight = item.getBoundingRectHeight();
    //       var itemOffset = canvas.height - itemHeight;

    //       if ( item.top > 0 ) {
    //         item.set({top:0});
    //       }
    //       else if ( item.top < itemOffset ) {
    //         item.set({top: itemOffset});
    //       }
    //     }
    //   }
    // });

    $scope.renderCanvas = function() {
      canvas.deactivateAllWithDispatch(); // hide control selectors from rendering to edit screen
      $scope.cropedImage = canvas.toDataURL({
        format: 'jpg',
        width: 640,
        height: 640,
        quality: 1
      });
      GetCropedImage.set($scope.cropedImage);
      $state.go('edit');
    };
  }])

// edit
  .controller('EditCtrl', ['$scope','$state', '$ionicAnalytics', '$ionicModal', 'GetCropedImage', 'GetShareImage', '$cordovaSocialSharing', function ($scope, $state, $ionicAnalytics, $ionicModal, GetCropedImage, GetShareImage, $cordovaSocialSharing){
    if(typeof analytics !== "undefined") { analytics.trackView("View edit screen"); }
    $ionicAnalytics.track('View edit screen');
    mixpanel.track('View edit screen');

    if( /(android)/i.test(navigator.userAgent) ) { 
      angular.element(savePhotoButton).remove();
    }

    if( /(android)/i.test(navigator.userAgent) && window.innerHeight < 481 ) {
      setTimeout(function() {
        AdMob.showInterstitial(); // show full banner  
        $ionicAnalytics.track('View interstitial banner');
        mixpanel.track('View interstitial banner');
      }, 10000);  
    }

    var watermark = 'img/instafunk-watermark.png',
        canvasImage = GetCropedImage.get(),
        stickerControls   = document.getElementById('stickerControls'),
        screenControls    = document.getElementById('screenControls'),
        canvas = new fabric.Canvas('photoCanvas', {
          backgroundImage: canvasImage,
          selection: false,
          width: window.innerWidth,
          height: window.innerWidth
        });

    fabric.Image.fromURL(watermark, function(wm) {
      wm.scale(0.5).set({
        alignY: 'mid',
        alignX: 'mid',
        top: window.innerWidth - 35,
        left: window.innerWidth - 90,
        lockUniScaling: true,
        centeredScaling: true,
        hasControls: false,
        lockMovementX: true,
        lockMovementY: true,
        selectable: false
      });
      canvas.add(wm);
      wm.setCoords();
      wm.name = "watermark";
      wm.bringToFront();
    });

    canvas.setBackgroundImage(canvasImage);

    var rect = new fabric.Rect({
      width: 2000,
      height: 2000,
      left: -100,
      top: -100,
      fill: '#ffffff',
      opacity: 0,
      selectable: false
    });

    setTimeout(function() {
      rect.name = "overlay";
      canvas.add(rect);
      rect.setCoords();
      rect.sendToBack();
    }, 2);
  

    $scope.addSticker = function(image, title) {
      if(typeof analytics !== "undefined") { analytics.trackEvent("Sticker", "added", title); }
      
      $ionicAnalytics.track('Added sticker', {
        sticker_name: title
      });
      
      mixpanel.track("Added sticker", {
        sticker_name: title
      });
      
      fabric.Image.fromURL(image, function(img) {
        img.scale(0.2).set({
          alignY: 'max',
          alignX: 'max',
          lockUniScaling: true,
          centeredScaling: true,
          padding: 20,
          controlsAboveOverlay: true
        });
        img.setControlsVisibility({
          'bl': false, 
          'br': false, 
          'tl': false, 
          'tr': false, 
          'mtr': false
        });

        canvas.add(img);
        img.perPixelTargetFind = true;
        img.center().setCoords();
        img.bringToFront();
        canvas.setActiveObject(img);
        
      });

      $scope.modal.hide();
    }

    $ionicModal.fromTemplateUrl('templates/gallery.html', function($ionicModal) {
      $scope.modal = $ionicModal;
    }, {
      scope: $scope,
      animation: 'slide-in-up'
    });

    $scope.openGallery = function() {
      $scope.modal.show();
    };
    $scope.closeGallery = function() {
      $scope.modal.hide();
    };

    // Cleanup the modal
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });

    $scope.resetProgress = function() {
      navigator.notification.confirm("Tem certeza que deseja recomeçar?", function(buttonIndex) {
          switch(buttonIndex) {
              case 1:
                  canvas.clear();
                  canvas.backgroundImage = 0;
                  canvas.backgroundColor = '#ffffff';
                  canvas.renderAll();
                  $state.go('home');
                  window.location.reload(true);
                  break;
              case 2:
                  console.log("continuar editando");
                  break;
          }
      }, "Apagar e recomeçar", [ "Sim, começar do zero", "Não, continuar editando"]);
    }

    // Share via native app modal
    $scope.shareNative = function() {
      

      if( /(android)/i.test(navigator.userAgent) ) { 
        window.plugins.spinnerDialog.show(
          null, // title
          "AGUENTA AÍ QUE O BAGULHO É DOIDO", // message
          true // non-dismissable
        );

        // hide after 5000 milliseconds
        setTimeout(function() {
          window.plugins.spinnerDialog.hide();
        }, 10000);
      }

      $scope.readyImage = canvas.toDataURL({
        format: 'png',
        multiplier: 4
      });

      GetShareImage.set($scope.readyImage);

      window.plugins.socialsharing.share(null, null, $scope.readyImage,
        function(){},
        function(e){
          window.plugins.spinnerDialog.hide();
          $ionicAnalytics.track('Sharing complete');
          mixpanel.track('Sharing complete');
          $state.go('success');
        }
      )
    }

    $scope.savePhoto = function() {
      
      $scope.readyImage = canvas.toDataURL({
        format: 'png',
        multiplier: 4
      });

      window.plugins.socialsharing.saveToPhotoAlbum($scope.readyImage,
        function(){
          $ionicAnalytics.track('Saved photo');
          mixpanel.track('Saved photo');
          
          navigator.notification.confirm("Quer compartilhar a imagem nas redes sociais agora?", function(buttonIndex) {
            switch(buttonIndex) {
              case 1:
                $scope.shareNative();
                break;
              case 2:
                break;
            }
          }, "Foto salva no seu album!", [ "Quero compartilhar", "Continuar editando"]);

        }
      )
    }

    canvas.on('object:selected', function(e) {
      var activeObject = e.target;
      activeObject.perPixelTargetFind = false;
      activeObject.set({padding: 9999});

      canvas.forEachObject(function(obj){
        if ( obj.name == 'watermark') {
          obj.bringToFront().setCoords(); // bring watermark to front    
        }
        if ( obj.name == 'overlay') {
          obj.set({opacity: 0.5});
          obj.bringToFront().setCoords(); 
          // obj.sendBackwards();
        }
      });

      activeObject.bringToFront().setCoords();
      

      $scope.deleteSticker = function() {
        activeObject.remove();
      }

      $scope.clearStickers = function() {
        navigator.notification.confirm("Tem certeza que deseja apagar todos adesivos?", function(buttonIndex) {
          switch(buttonIndex) {
            case 1:
              canvas.clear();
              fabric.Image.fromURL(watermark, function(wm) {
                wm.scale(0.5).set({
                  alignY: 'mid',
                  alignX: 'mid',
                  top: window.innerWidth - 35,
                  left: window.innerWidth - 90,
                  lockUniScaling: true,
                  centeredScaling: true,
                  hasControls: false,
                  lockMovementX: true,
                  lockMovementY: true,
                  selectable: false
                });
                canvas.add(wm);
                wm.setCoords();
                wm.name = "watermark";
                wm.bringToFront();
              });
              var rect = new fabric.Rect({
                width: 2000,
                height: 2000,
                left: -100,
                top: -100,
                fill: '#ffffff',
                opacity: 0,
                selectable: false
              });

              setTimeout(function() {
                rect.name = "overlay";
                canvas.add(rect);
                rect.setCoords();
                rect.sendToBack();
              }, 10);

              if ( angular.element(stickerControls).hasClass('ng-show') ) {
                angular.element(stickerControls).removeClass('ng-show').addClass('ng-hide');
                angular.element(screenControls).removeClass('ng-hide').addClass('ng-show');
              }

              break;
            case 2:
              break;
          }
        }, "Apagar todos adesivos", [ "Sim, quero limpar tudo", "Não, deixa pra lá"]); 
      }

      $scope.sendBackSticker = function() {
        activeObject.sendBackwards().sendBackwards();
        canvas.forEachObject(function(obj){
          if ( obj.name == 'overlay') {
            obj.sendBackwards().sendBackwards();
          }
        });
      }

      $scope.flipSticker = function() {
        var flipped = activeObject.get('flipX');

        if ( flipped == false ) {
          activeObject.set('flipX', true);
        } else {
          activeObject.set('flipX', false);
        }
        canvas.renderAll();
      }

      $scope.doneSticker = function() {
        canvas.deactivateAllWithDispatch().renderAll();
      }

      if ( angular.element(stickerControls).hasClass('ng-hide') ) {
        angular.element(stickerControls).removeClass('ng-hide').addClass('ng-show');
        angular.element(screenControls).removeClass('ng-show').addClass('ng-hide');
      }

      

    });

    canvas.on('before:selection:cleared', function(e) {
      canvas.getActiveObject().set({padding: 20}).perPixelTargetFind = true;
      
      if ( angular.element(stickerControls).hasClass('ng-show') ) {
        angular.element(stickerControls).removeClass('ng-show').addClass('ng-hide');
        angular.element(screenControls).removeClass('ng-hide').addClass('ng-show');
      }

      canvas.forEachObject(function(obj){
        if ( obj.name == 'overlay') {
          obj.sendToBack();
          obj.set({
            opacity: 0
          });
        }
        if ( obj.name == 'watermark') {
          obj.bringToFront(); // bring watermark to front
        }
      });

    });

    canvas.on('selection:cleared', function() {
      canvas.forEachObject(function(obj){
        if ( obj.name == 'watermark') {
          obj.bringToFront().setCoords(); // bring watermark to front    
        }

        obj.set({padding: 20}).setCoords();
        canvas.renderAll();
        
      });
    });

  }])

// gallery
  .controller('GalleryCtrl', ['$scope','$http', '$ionicAnalytics', 'GalleryPacks', function ($scope, $http, $ionicAnalytics, GalleryPacks) {
    console.log('GalleryCtrl loaded');
    if(typeof analytics !== "undefined") { analytics.trackView("View gallery screen"); }
    $ionicAnalytics.track('View gallery screen');
    mixpanel.track('View gallery screen');

    $scope.packs = GalleryPacks.get();
    
  }])


// success
  .controller('SuccessCtrl', ['$scope', '$state', '$ionicAnalytics', 'GetShareImage', '$cordovaSocialSharing', function($scope, $state, $ionicAnalytics, GetShareImage, $cordovaSocialSharing) {
    console.log('success controller loaded');
    if(typeof analytics !== "undefined") { analytics.trackView("Success view"); }
    $ionicAnalytics.track('View success screen');
    mixpanel.track('View success screen');

    var preImage = GetShareImage.get();
        // media = new Media("audio/success.mp3", null);
    
    // media.play(); // play success song
    $scope.imagePreview = preImage; // render the shared image


    // if (window.admob) { 
      setTimeout(function() {
        AdMob.showInterstitial(); // show full banner
        $ionicAnalytics.track('View interstitial banner');
        mixpanel.track('View interstitial banner');
      }, 2000);
      
    // }
    
    // Share via native app modal
    $scope.shareNative = function() {

      
      window.plugins.socialsharing.share(null, null, preImage,
        function(){},
        function(){
          $ionicAnalytics.track('Sharing complete');
          mixpanel.track('Sharing complete');
          $state.go('success');
        }
      )
    }

    $scope.startOver = function() {
      $state.go('home');

      setTimeout(function() {
        window.location.reload(true);
      }, 100);
    }
  }]);