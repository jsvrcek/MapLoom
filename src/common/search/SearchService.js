(function() {
  var module = angular.module('loom_search_service', []);

  var httpService_ = null;
  var q_ = null;
  var mapService_ = null;
  var searchlayer_ = null;

  module.provider('searchService', function() {
    this.$get = function($rootScope, $http, $q, $translate, configService, mapService) {
      httpService_ = $http;
      q_ = $q;
      mapService_ = mapService;

      searchlayer_ = new ol.layer.Vector({
        metadata: {
          title: $translate.instant('search_results'),
          internalLayer: true
        },
        source: new ol.source.Vector({
          parser: null
        }),
        style: function(feature, resolution) {
          return [new ol.style.Style({
            image: new ol.style.Circle({
              radius: 8,
              fill: new ol.style.Fill({
                color: '#D6AF38'
              }),
              stroke: new ol.style.Stroke({
                color: '#000000'
              })
            })
          })];
        }
      });

      $rootScope.$on('translation_change', function() {
        searchlayer_.get('metadata').title = $translate.instant('search');
      });

      return this;
    };

    this.performSearch = function(address) {
      var promise = q_.defer();
      var url = "/geoserver/geonode/ows?service=WFS&version=1.0.0&request=GetFeature&outputFormat=application%2Fjson&typeName=geonode:ERAMAP_BASES_MV&maxFeatures=50&filter=<Filter><PropertyIsLike wildCard='*' singleChar='.' escape='!'><PropertyName>LOCATION_NAME</PropertyName><Literal>*" +
          address.toUpperCase() + '*</Literal></PropertyIsLike></Filter>';

      httpService_.get(url).then(function(response) {
        if (goog.isDefAndNotNull(response.data) && goog.isArray(response.data.features)) {
          var results = [];
          forEachArrayish(response.data.features, function(result) {
            results.push({
              location: result.geometry.coordinates,
              boundingbox: [result.geometry.coordinates[1], result.geometry.coordinates[1], result.geometry.coordinates[0], result.geometry.coordinates[0]],
              name: result.properties.TITLE
            });
          });
          promise.resolve(results);
        } else {
          promise.reject(response.status);
        }
      }, function(reject) {
        promise.reject(reject.status);
      });

      return promise.promise;
    };

    this.populateSearchLayer = function(results) {
      searchlayer_.getSource().clear();
      mapService_.map.removeLayer(searchlayer_);
      mapService_.map.addLayer(searchlayer_);
      forEachArrayish(results, function(result) {
        var olFeature = new ol.Feature();
        olFeature.setGeometry(new ol.geom.Point(ol.proj.transform(result.location, 'EPSG:4326',
            mapService_.map.getView().getProjection())));
        searchlayer_.getSource().addFeature(olFeature);
      });
    };

    this.clearSearchLayer = function() {
      searchlayer_.getSource().clear();
      mapService_.map.removeLayer(searchlayer_);
    };
  });
}());
