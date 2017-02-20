(function() {
  var module = angular.module('loom_distance_bearing_directive', []);

  module.directive('loomDistanceBearing',
      function(mapService, distanceBearingService) {
        return {
          replace: true,
          templateUrl: 'distancebearing/partials/distanceBearing.tpl.html',
          link: function(scope, element) {
            var control = new ol.control.Control({element: element[0]});

            scope.distanceConversionObject = {
              'm' : 1,
              'km' : 1 / 1000,
              'nm' : 1 / 1852,
              'mi' : 1 / 1609.34
            };

            scope.bearingConversionObject = {
              'rad' : Math.PI / 180,
              '°' : 1
            };

            mapService.map.addControl(control);
            scope.display = true;

            scope.model = {
              departure: {
                name: '',
                lat: 50.06639,
                lon: 5.714722
              },
              destination: {
                name: '',
                lat: 58.64389,
                lon: 3.07
              },
              distanceUnitsMultiplier: scope.distanceConversionObject.nm,
              bearingUnitsMultiplier: scope.bearingConversionObject['°'],
              //Should be 968.9km
              distance: 0,
              //Should be 0.15916917577
              bearing: 0,
              displayOnMap: false
            };

            scope.showOnMap = function() {
              if (!scope.model.displayOnMap) {
                distanceBearingService.clearLine();
              } else {
                distanceBearingService.showLine(scope.model.departure, scope.model.destination);
              }
            };

            scope.toggleVisibility = function() {
              scope.display = !scope.display;
            };

            scope.calculate = function() {
              scope.model.distance = distanceBearingService.getDistance(scope.model.departure,
                  scope.model.destination);
              scope.model.bearing = distanceBearingService.getBearing(scope.model.departure,
                  scope.model.destination);
              scope.showOnMap();
            };
          }
        };
      });
})();
