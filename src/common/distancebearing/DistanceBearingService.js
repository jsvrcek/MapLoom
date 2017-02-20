(function() {
  var module = angular.module('loom_distance_bearing_service', []);

  module.provider('distanceBearingService', function() {
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

    function toRadians(num) {
      return num * Math.PI / 180;
    }

    function toDegrees(num) {
      return num * 180 / Math.PI;
    }

    //Returns angle in radians
    this.getBearing = function(startPoint, endPoint) {
      var startLat = toRadians(startPoint.lat);
      var startLon = toRadians(startPoint.lon);
      var endLat = toRadians(endPoint.lat);
      var endLon = toRadians(endPoint.lon);
      var λ1 = startLon;
      var λ2 = endLon;
      var φ2 = endLat;
      var φ1 = startLat;

      var y = Math.sin(λ2 - λ1) * Math.cos(φ2);
      var x = Math.cos(φ1) * Math.sin(φ2) -
          Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
      //Does this need to be absolute?
      var brng = toDegrees(Math.atan2(y, x));

      console.log(brng);
      return brng;
    };


  });
}());
