(function() {
  var module = angular.module('loom_distance_bearing_directive', []);

  module.directive('loomDistanceBearing',
      function(mapService, distanceBearingService) {
        return {
          replace: true,
          templateUrl: 'distancebearing/partials/distanceBearing.tpl.html',
          link: function(scope, element) {
            var control = new ol.control.Control({element: element[0]});
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
              distanceUnits: {
                label: ''
              },
              bearingUnits: {
                label: ''
              },
              //Should be 968.9km
              distance: 0,
              //Should be 0.15916917577
              bearing: 0
            };

            scope.toggleVisibility = function() {
              scope.display = !scope.display;
            };

            scope.calculate = function() {
              scope.model.distance = distanceBearingService.getDistance(scope.model.departure,
                  scope.model.destination);
              scope.model.bearing = distanceBearingService.getBearing(scope.model.departure,
                  scope.model.destination);
            };
          }
        };
      });
})();
