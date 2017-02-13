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
        //TODO: Run check to see if comments are enabled for this map
        mapService.map.addLayer(new ol.layer.Vector({source: this.vectorSource, metadata: {
          title: 'Comments', uniqueID: 'comments', editable: false}}));
      }.bind(this));

      // TODO: Set limit to 5
      $http({method: 'GET', url: '/maps/' + mapService.id + '/comments'}).then(function(resp) {
        log.length = 0;
        log.push.apply(log, new ol.format.GeoJSON().readFeatures(resp.data));
        ++this.updateCount;
        this.vectorSource.addFeatures(this.log);
      }.bind(this));

      //TODO: Replace with http call
      this.timeSearch = function(startTime, endTime) {
        return $http({method: 'GET', url: '/maps/' + mapService.id + '/comments?start_date=' + startTime +
              '&end_date=' + endTime}).then(function(resp) {
          return new ol.format.GeoJSON().readFeatures(resp.data);
        });
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
