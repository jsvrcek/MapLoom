(function() {
  var module = angular.module('loom_comment_moderation_service', []);

  module.provider('commentModerationService', function() {

    this.log = [];

    var log = this.log;
    this.updateCount = 0;

    this.$get = function($translate, $q, $http, mapService) {
      this.title = $translate.instant('comments');
      this.summaryMode = false;

      this.vectorSource = new ol.source.Vector();
      mapService.map.once('postrender', function(evt) {
        mapService.map.addLayer(new ol.layer.Vector({source: this.vectorSource, title: 'Comments'}));
      }.bind(this));

      //TODO: Run check to see if comments are enabled for this map
      console.log('MapService', mapService);
      // TODO: Set limit to 5
      $http({method: 'GET', url: '/maps/' + mapService.id + '/comments'}).then(function(resp) {
        log.length = 0;
        log.push.apply(log, new ol.format.GeoJSON().readFeatures(resp.data));
        ++this.updateCount;
        this.vectorSource.addFeatures(this.log);
      }.bind(this));

      //TODO: Replace with http call
      this.timeSearch = function(startTime, endTime) {
        var defer = $q.defer();
        defer.resolve(log);
        return defer.promise;
      };

      this.enableSummaryMode = function() {
        this.summaryMode = true;
        this.title = $translate.instant('comment_summary');
      };

      this.enableLatestMode = function() {
        this.summaryMode = false;
        this.title = $translate.instant('comments');
      };


      return this;
    };

  });

}());
