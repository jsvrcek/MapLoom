
(function() {
  var module = angular.module('loom_feature_info_box_directive', []);

  module.directive('loomFeatureInfoBox',
      function($translate, featureManagerService, mapService, historyService, dialogService, tableViewService, $rootScope, $http) {

        return {
          replace: false,
          restrict: 'A',
          templateUrl: 'featuremanager/partial/featureinfobox.tpl.html',
          link: function(scope) {
            scope.featureManagerService = featureManagerService;
            scope.mapService = mapService;
            scope.loadingHistory = false;
            scope.deletingFeature = false;

            scope.$on('feature-info-click', function() {
              scope.$apply(function() {
                scope.featureManagerService = featureManagerService;
              });
            });

            scope.isUrl = function(str) {
              if (!/^(f|ht)tps?:\/\//i.test(str)) {
                return false;
              }
              return true;
            };

            scope.isShowingAttributes = function() {
              var schema = featureManagerService.getSelectedLayer().get('metadata').schema;

              // if there is no schema, do not hide attributes
              if (!goog.isDefAndNotNull(schema)) {
                return true;
              }

              var properties = featureManagerService.getSelectedItemProperties();
              for (var index = 0; index < properties.length; index++) {
                if (goog.isDefAndNotNull(schema[properties[index][0]]) && schema[properties[index][0]].visible) {
                  return true;
                }
              }
              return false;
            };

            scope.isAttributeVisible = function(property) {
              var schema = featureManagerService.getSelectedLayer().get('metadata').schema;

              // if there is no schema, show the attribute. only filter out if there is schema and attr is set to hidden
              if (!goog.isDefAndNotNull(schema) || !schema.hasOwnProperty(property)) {
                return true;
              }

              return schema[property].visible;
            };


            scope.showFeatureHistory = function() {
              if (!scope.loadingHistory) {
                var layer = featureManagerService.getSelectedLayer();
                if (goog.isDefAndNotNull(layer)) {
                  var metadata = layer.get('metadata');
                  if (goog.isDefAndNotNull(metadata)) {
                    if (goog.isDefAndNotNull(metadata.isGeoGig) && metadata.isGeoGig) {
                      var nativeLayer = metadata.nativeName;
                      var featureId = featureManagerService.getSelectedItem().id;
                      var fid = nativeLayer + '/' + featureId;
                      scope.loadingHistory = true;
                      historyService.setTitle($translate.instant('history_for', {value: featureId}));
                      var promise = historyService.getHistory(layer, fid);
                      if (goog.isDefAndNotNull(promise)) {
                        promise.then(function() {
                          scope.loadingHistory = false;
                        }, function() {
                          scope.loadingHistory = false;
                        });
                      } else {
                        scope.loadingHistory = false;
                      }
                    }
                  }
                }
              }
            };

            scope.deleteFeature = function() {
              if (!scope.deletingFeature) {
                dialogService.warn($translate.instant('delete_feature'), $translate.instant('sure_delete_feature'),
                    [$translate.instant('yes_btn'), $translate.instant('no_btn')], false).then(function(button) {
                  switch (button) {
                    case 0:
                      scope.deletingFeature = true;
                      featureManagerService.deleteFeature().then(function(resolve) {
                        scope.deletingFeature = false;
                      }, function(reject) {
                        scope.deletingFeature = false;
                        dialogService.error($translate.instant('error'),
                            $translate.instant('unable_to_delete_feature', {value: reject}),
                            [$translate.instant('btn_ok')], false);
                      });
                      break;
                    case 1:
                      break;
                  }
                });
              }
            };

            scope.showTable = function(layer) {
              layer.get('metadata').loadingTable = true;
              tableViewService.showTable(layer, featureManagerService.getSelectedItem()).then(function() {
                layer.get('metadata').loadingTable = false;
                featureManagerService.hide();
                $('#table-view-window').modal('show');
              }, function() {
                layer.get('metadata').loadingTable = false;
                dialogService.error($translate.instant('show_table'), $translate.instant('show_table_failed'));
              });
            };

            scope.isLoadingTable = function(layer) {
              var loadingTable = layer.get('metadata').loadingTable;
              return goog.isDefAndNotNull(loadingTable) && loadingTable === true;
            };

            scope.setAsSpatialFilter = function() {
              var feature = mapService.editLayer.getSource().getFeatures()[0];
              feature.setId(featureManagerService.getSelectedItem().id);

              if (feature.getGeometry().getType() === 'Point') {
                $rootScope.$broadcast('enterSpatialFilterRadius', feature);
              } else {
                mapService.addToSpatialFilterLayer(feature);
                featureManagerService.hide();
              }
            };

            scope.toggleFuelRing = function() {
              var feature = featureManagerService.getSelectedItem();
              var fuelRangeVectorSource;
              var selectedLayer = featureManagerService.getSelectedLayer();
              var featureLayerProjection = ol.proj.get(selectedLayer.get('metadata').projection);

              if (!mapService.fuelRangeLayer) {
                fuelRangeVectorSource = new ol.source.Vector({});
                var fuelRangeLayer = new ol.layer.Vector({source: fuelRangeVectorSource,
                  metadata: {editable: false, name: 'Fuel Range', title: 'Fuel Range', uniqueID: 'fuelRangeLayer',
                    bbox: {crs: mapService.map.getView().getProjection().code_}
                  }
                });
                mapService.map.addLayer(fuelRangeLayer);
                mapService.fuelRangeLayer = fuelRangeLayer;
              } else {
                fuelRangeVectorSource = mapService.fuelRangeLayer.getSource();
              }

              //We keep a reference to the fuel ring, associated with the feature's id
              var fuelRingReference = mapService.fuelRangeLayer.get(feature.id);

              if (!fuelRingReference) {
                var rangeInNauticalMiles = featureManagerService.getSelectedItem().properties.REMAINING_FUEL_RANGE_NM;
                var rangeInMeters = rangeInNauticalMiles * ol.proj.METERS_PER_UNIT['m'] * 1852;

                var circle = ol.geom.Polygon.circular(
                    ol.sphere.NORMAL,
                    feature.geometry.coordinates,
                    rangeInMeters
                    );
                //Need to transform into the view's projection before displaying it
                circle.transform(featureLayerProjection, mapService.map.getView().getProjection());
                fuelRingReference = new ol.Feature(circle);
                fuelRangeVectorSource.addFeature(fuelRingReference);
                mapService.fuelRangeLayer.set(feature.id, fuelRingReference);

                var unsub = selectedLayer.getSource().on('change', function() {
                  var layerMetadata = selectedLayer.get('metadata');
                  var requestURL = layerMetadata.url + '/wfs?service=wfs&request=GetFeature&outputFormat=json&version=' +
                      settings.WFSVersion + '&typeNames=' + layerMetadata.name + '&featureID=' + feature.id;

                  $http({method: 'GET', url: requestURL}).then(function success(response) {
                    var featureData = response.data.features[0];

                    if (featureData && featureData.properties.REMAINING_FUEL_RANGE_NM) {

                      var updatedRangeInMeters = featureData.properties.REMAINING_FUEL_RANGE_NM *
                          ol.proj.METERS_PER_UNIT['m'] * 1852;

                      var updateCircle = ol.geom.Polygon.circular(
                          ol.sphere.NORMAL,
                          featureData.geometry.coordinates,
                          updatedRangeInMeters
                          );

                      updateCircle.transform(featureLayerProjection, mapService.map.getView().getProjection());

                      fuelRingReference.setGeometry(updateCircle);
                    } else {
                      selectedLayer.getSource().unByKey(fuelRingReference.get('unsubscribeKey'));
                      fuelRangeVectorSource.removeFeature(fuelRingReference);
                      mapService.fuelRangeLayer.unset(feature.id);
                    }
                  });
                });
                fuelRingReference.set('unsubscribeKey', unsub);
              } else {
                //When removing the fuel ring, clean up all the listeners
                selectedLayer.getSource().unByKey(fuelRingReference.get('unsubscribeKey'));
                fuelRangeVectorSource.removeFeature(fuelRingReference);
                mapService.fuelRangeLayer.unset(feature.id);
              }
            };

          }
        };
      }
  );
})();
