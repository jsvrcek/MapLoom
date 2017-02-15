
(function() {
  var module = angular.module('loom_comment_info_box_directive', []);

  module.directive('loomCommentInfoBox',
      function() {

        return {
          replace: false,
          restrict: 'A',
          templateUrl: 'commentmoderation/partial/commentinfobox.tpl.html',
          link: function(scope) {
            scope.updateComment = function(status) {
              scope.commentModerationService.modifyComment(scope.item.id_, status);
            };
          }
        };
      }
  );
})();
