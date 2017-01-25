(function() {
  var module = angular.module('loom_comment_moderation_service', []);

  module.provider('commentModerationService', function() {
    this.title = 'Comment Moderation';

    this.$get = function() {
      return this;
    };

  });

}());
