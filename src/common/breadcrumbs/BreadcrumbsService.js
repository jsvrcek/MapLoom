(function() {
  var module = angular.module('loom_breadcrumbs_service', []);

  module.provider('breadcrumbsService', function() {
    var _http;

    function getBreadcrumbs(startDate, endDate, tailNumber) {
      return _http({
        method: 'GET',
        url: '/breadcrumbs?startDate=' + startDate + '&endDate=' + endDate + '&tailNumber=' + tailNumber
      }).then(function(resp) {
        return resp.data;
      });
    }

    this.$get = function($http) {
      _http = $http;
      this.getBreadcrumbs = getBreadcrumbs;
      return this;
    };

  });
}());
