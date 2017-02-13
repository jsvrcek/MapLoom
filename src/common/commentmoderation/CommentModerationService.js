(function() {
  var module = angular.module('loom_comment_moderation_service', []);

  module.provider('commentModerationService', function() {

    this.log = [];

    var log = this.log;

    this.$get = function($translate, $q, $http, mapService) {
      this.title = $translate.instant('comments');
      this.summaryMode = false;

      //TODO: Set limit to 5
      $http({method: 'GET', url: '/maps/' + mapService.id + '/comments'}).then(function(resp) {
        for (var i = 0; i < resp.data.features.length; ++i) {
          resp.data.features[i].geometry = JSON.parse(resp.data.features[i].geometry);
        }
        this.log = resp.data;
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
