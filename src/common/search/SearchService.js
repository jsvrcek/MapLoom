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

    this.performSearch = function(searchTerm) {
      //Given a layerName and the propertyName, generates the url string to make the wfs feature search for the searchTerm
      function generateURL(layerName, propertyName) {
        return '/geoserver/geonode/ows?service=WFS&version=1.0.0&request=GetFeature&outputFormat=application%2Fjson&typeName=' + layerName +
            "&maxFeatures=50&filter=<Filter><PropertyIsLike wildCard='*' singleChar='.' escape='!'><PropertyName>" + propertyName +
            '</PropertyName><Literal>*' +
            searchTerm.toUpperCase() + '*</Literal></PropertyIsLike></Filter>';
      }

      function convertResponseIntoResults(response) {
        if (goog.isDefAndNotNull(response.data) && goog.isArray(response.data.features)) {
          var results = [];
          forEachArrayish(response.data.features, function(result) {
            results.push({
              location: result.geometry.coordinates,
              boundingbox: [+result.geometry.coordinates[1] - 0.3, +result.geometry.coordinates[1] + 0.3, +result.geometry.coordinates[0] - 0.1, +result.geometry.coordinates[0] + 0.1],
              name: result.properties.TITLE
            });
          });
          return results;
        } else {
          return [];
        }
      }

      //Generate a url for BASES, AIR, and CHECK
      //On all promises returning ($q.all([])), parse them all into a single list, sort by tailnumber, resolve the returned promise
      var bases = httpService_.get(generateURL('geonode:ERAMAP_BASES_MV', 'LOCATION_NAME')).then(convertResponseIntoResults);
      var air = httpService_.get(generateURL('geonode:ERAMAP_AIRCRAFT_AIR_MV', 'ASSET_NAME')).then(convertResponseIntoResults);
      var check = httpService_.get(generateURL('geonode:ERAMAP_AIRCRAFT_CHECK_MV', 'ASSET_NAME')).then(convertResponseIntoResults);

      return q_.all([bases, air, check]).then(function(results) {
        var unsortedArray = [];
        forEachArrayish(results, function(arr) {
          unsortedArray = unsortedArray.concat(arr);
        });
        //Sort by display names
        return unsortedArray.sort(function(a, b) {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
      });
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
