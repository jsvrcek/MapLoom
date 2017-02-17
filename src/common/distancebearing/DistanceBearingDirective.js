(function() {
  var module = angular.module('loom_distance_bearing_directive', []);

  module.directive('loomDistanceBearing',
      function(mapService) {
        return {
          replace: true,
          templateUrl: 'distancebearing/partials/distanceBearing.tpl.html',
          link: function(scope, element) {
            var control = new ol.control.Control({element: element[0]});
            mapService.map.addControl(control);
            scope.display = true;

            scope.toggleVisibility = function() {
              scope.display = !scope.display;
            };

            scope.calculate = function() {

            };
          }
        };
      });
})();
