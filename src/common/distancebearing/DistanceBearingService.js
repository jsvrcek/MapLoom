(function() {
  var module = angular.module('loom_distance_bearing_service', []);

  module.provider('distanceBearingService', function() {
    var _q, _mapService;
    var wgs84Sphere = new ol.Sphere(6378137);
    var displayLayer, displaySource;

    this.$get = function($q, mapService) {
      _q = $q;
      _mapService = mapService;
      return this;
    };

    this.search = function(searchTerm) {
      var retVal = _q.defer();
      return retVal.promise();
    };

    //Returns distance in meters
    //Inputs are either ol.geom.Points or objects matching:
    // {lat: 5, lon: 15} or an array [lon, lat]
    this.getDistance = function(startPoint, endPoint) {
      var start = convertToArray(startPoint);
      var end = convertToArray(endPoint);
      var distance = wgs84Sphere.haversineDistance(start, end);

      // console.log(wgs84Sphere.offset(start, distance, toRadians(this.getBearing(startPoint, endPoint))));
      return distance;
    };

    function toRadians(num) {
      return num * Math.PI / 180;
    }

    function toDegrees(num) {
      return num * 180 / Math.PI;
    }

    function convertToArray(point) {
      if (point.flatCoordinates) {
        return point.flatCoordinates;
      } else if (point.length) {
        return point;
      }
      return [point.lon, point.lat];
    }

    function convertToOlPoint(point) {
      if (point.flatCoordinates) {
        return point;
      } else if (point.length) {
        return new ol.geom.Point(point);
      }
      return new ol.geom.Point([point.lon, point.lat]);
    }

    this.showLine = function(start, end) {
      var startPoint = convertToArray(start);
      var endPoint = convertToArray(end);
      var newLine = new ol.geom.LineString([startPoint, endPoint]);
      if (!displayLayer) {
        displaySource = new ol.source.Vector({});
        displayLayer = new ol.layer.Vector({source: displaySource});
        _mapService.map.addLayer(displayLayer);
      }
      newLine.transform(ol.proj.get('EPSG:4326'), _mapService.map.getView().getProjection());
      displaySource.clear();
      displaySource.addFeature(new ol.Feature(newLine));
    };

    this.clearLine = function() {
      if (displaySource) {
        displaySource.clear();
      }
    };

    //Returns angle in degrees
    //Inputs are either ol.geom.Points or objects matching:
    // {lat: 5, lon: 15} or an array [lon, lat]
    this.getBearing = function(startPoint, endPoint) {
      var start = convertToArray(startPoint);
      var end = convertToArray(endPoint);

      var startLat = toRadians(start[1]);
      var startLon = toRadians(start[0]);
      var endLat = toRadians(end[1]);
      var endLon = toRadians(end[0]);

      var y = Math.sin(endLon - startLon) * Math.cos(endLat);
      var x = Math.cos(startLat) * Math.sin(endLat) -
          Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLon - startLon);
      var result = toDegrees(Math.atan2(y, x));
      if (result < 0) {
        result += 360;
      }
      return result;
    };


  });
}());
