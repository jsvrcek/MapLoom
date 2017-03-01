(function() {
  var module = angular.module('loom_breadcrumbs_directive', []);

  module.directive('loomBreadcrumbs',
      function(breadcrumbsService, mapService) {
        return {
          replace: true,
          scope: {},
          templateUrl: 'breadcrumbs/partials/breadcrumbs.tpl.html',
          link: function(scope, element) {
            var displayLayer, displaySource;

            scope.display = false;
            scope.model = {
              currentDate: moment(),
              startDate: '',
              endDate: '',
              tailNumber: '',
              errors: undefined
            };


            scope.toggleVisibility = function() {
              $(element.find('.endDate .datepicker')).data('DateTimePicker').setEndDate(new Date());
              $(element.find('.startDate .datepicker')).data('DateTimePicker').setEndDate(new Date());
              scope.display = !scope.display;
              scope.model.currentDate = moment();
            };

            scope.clear = function() {
              scope.model.errors = undefined;
              if (displaySource) {
                displaySource.clear();
              }
            };

            scope.search = function() {
              scope.model.errors = undefined;
              breadcrumbsService.getBreadcrumbs(scope.model.startDate, scope.model.endDate, scope.model.tailNumber).
                  then(function(resp) {
                    var jsonReader = new ol.format.GeoJSON();
                    if (!displayLayer) {
                      displaySource = new ol.source.Vector({});
                      displayLayer = new ol.layer.Vector({source: displaySource});
                      mapService.map.addLayer(displayLayer);
                    }
                    displaySource.clear();
                    if (resp.error) {
                      scope.model.errors = resp.error;
                      return;
                    }
                    var features = jsonReader.readFeatures(resp, {dataProjection: 'EPSG:4326',
                      featureProjection: mapService.map.getView().getProjection()});
                    displaySource.addFeatures(features);
                  });
            };

            scope.$watch('model.startDate', function() {
              $(element.find('.endDate .datepicker')).data('DateTimePicker').setStartDate(scope.model.startDate);
            });
            scope.$watch('model.endDate', function() {
              $(element.find('.startDate .datepicker')).data('DateTimePicker').setEndDate(scope.model.endDate);
            });

          }
        };
      });
})();
