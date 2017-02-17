(function() {
  var module = angular.module('loom_distance_bearing_service', []);

  module.provider('searchService', function() {
    var _q;
    var wgs84Sphere = new ol.Sphere(6378137);

    this.$get = function($q) {
      _q = $q;
      return this;
    };

    this.search = function(searchTerm) {
      var retVal = _q.defer();
      return retVal.promise();
    };

    //Returns distance in meters
    this.getDistance = function(startPoint, endPoint) {
      return wgs84Sphere.haversineDistance(startPoint, endPoint);
    };

    //Returns angle in radians
    this.getBearing = function(startPoint, endPoint) {
      //Formula for angle in radians is as follows:
      //p1 l1
      //difference in latitude
      var dY = Math.abs(startPoint.lat, endPoint.lat);
      var atanY = dY * Math.cos(endPoint.lon);
      var atanX = Math.cos(startPoint.lon) * Math.sin(endPoint.lon) - Math.sin(startPoint.lon) *
          Math.cos(endPoint.lon) * cos(dY);

      return Math.atan2(atanY, atanX);
    };


  });
}());
