angular.module('app.services', [])

.factory('Camera', ['$q', function($q) {

  return {
    getPicture: function(options) {
      var q = $q.defer();

      navigator.camera.getPicture(function(result) {
        // Do any magic you need
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, options);

      return q.promise;
    }
  }
}])

.factory('GetImageToCrop', function() {
 var imageToCrop = {}

 function set(data) {
   imageToCrop = data;
 }

 function get() {
  return imageToCrop;
 }

 return {
  set: set,
  get: get
 }

})

.factory('GetCropedImage', function() {
 var cropedImage = {}

 function set(data) {
   cropedImage = data;
 }

 function get() {
  return cropedImage;
 }

 return {
  set: set,
  get: get
 }

})

.factory('GalleryPacks', function($http) {
  console.log('factory galleryPacks loaded')
  var packs = [];

  return {
    get: function () {
      $http.get("js/data/gallery.json")
        .success(function (response)
        {
          for (var i = 0, ii = response.length; i < ii; i++) {
            packs.push(response[i]);
          }
        })
       .error(function(data) {
          console.log("ERROR");
        }
      );
      return packs;
    }
  }
})

.factory('GetShareImage', function() {
 var readyImage = {}

 function set(data) {
   readyImage = data;
 }

 function get() {
  return readyImage;
 }

 return {
  set: set,
  get: get
 }
})
