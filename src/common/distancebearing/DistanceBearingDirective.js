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
            scope.display = false;

            scope.model = {
              departure: {
                name: '',
                fullName: undefined,
                lat: undefined,
                lon: undefined
              },
              destination: {
                name: '',
                fullName: undefined,
                lat: undefined,
                lon: undefined
              },
              distanceUnitsMultiplier: scope.distanceConversionObject.nm,
              bearingUnitsMultiplier: scope.bearingConversionObject['°'],
              distance: 0,
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

            scope.retrieveCoordinates = function(loc) {
              distanceBearingService.search(scope.model[loc].name).then(function(resp) {
                if (resp.error) {
                  scope.model[loc].lat = undefined;
                  scope.model[loc].lon = undefined;
                  scope.model[loc].fullName = resp.error;
                } else {
                  scope.model[loc].lat = resp.coordinates.lat;
                  scope.model[loc].lon = resp.coordinates.lon;
                  scope.model[loc].fullName = resp.address;
                }
              });
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
