(function() {
  var module = angular.module('loom_comment_moderation_controller', []);

  module.controller('LoomCommentModerationController',
      function($scope, commentModerationService) {
        function assignScopeVariables() {
          $scope.title = commentModerationService.title;
        }
        assignScopeVariables();
      });
})();
