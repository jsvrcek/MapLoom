(function() {
  var module = angular.module('loom_comment_moderation_service', []);

  module.provider('commentModerationService', function() {

    this.log = [];

    var log = this.log;
    this.updateCount = 0;

    this.$get = function($translate, $q, $http, mapService) {
      var baseURL = '/maps/' + mapService.id + '/comments';
      this.title = $translate.instant('comments');
      this.summaryMode = false;
      this.latestDraw = undefined;

      this.vectorSource = new ol.source.Vector();
      this.drawControl = new ol.interaction.Draw({
        source: this.vectorSource,
        type: 'Point'
      });

      mapService.map.once('postrender', function() {
        //TODO: Run check to see if comments are enabled for this map
        mapService.map.addLayer(new ol.layer.Vector({source: this.vectorSource, metadata: {
          title: 'Comments', uniqueID: 'comments'}}));
        mapService.map.addInteraction(this.drawControl);

        this.drawControl.on('drawend', function(drawEvt) {
          this.latestDraw = drawEvt.feature;
          $('#commentAddWindow').modal('toggle');
        }.bind(this));


      }.bind(this));

      $http({method: 'GET', url: baseURL + '?limit=5'}).then(function(resp) {
        log.length = 0;
        log.push.apply(log, new ol.format.GeoJSON().readFeatures(resp.data));
        ++this.updateCount;
        this.vectorSource.addFeatures(this.log);
      }.bind(this));

      this.timeSearch = function(startTime, endTime) {
        return $http({method: 'GET', url: baseURL + '?start_date=' + startTime +
              '&end_date=' + endTime}).then(function(resp) {
          return new ol.format.GeoJSON().readFeatures(resp.data);
        });
      };

      this.addComment = function(title, message, category, location) {
        //TODO: Reproject, convert to geojson
        location = '';
        return $http({
          method: 'POST',
          url: baseURL,
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          xsrfCookieName: 'csrftoken',
          xsrfHeaderName: 'X-CSRFToken',
          data: $.param({
            title: title,
            message: message,
            category: category,
            feature_geom: location,
            map_id: mapService.id
          })
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
