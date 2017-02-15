
(function() {
  var module = angular.module('loom_comment_info_box_directive', []);

  module.directive('loomCommentInfoBox',
      function() {

        return {
          replace: false,
          restrict: 'A',
          templateUrl: 'commentmoderation/partial/commentinfobox.tpl.html',
          link: function(scope) {
            var overlay = scope.mapService.map.getOverlayById('comment-view-box');
            scope.updateComment = function(status) {
              scope.commentModerationService.modifyComment(scope.item.id_, status);
              scope.mapService.map.removeOverlay(overlay);
            };

            scope.isDate = function(fieldName) {
              return fieldName === 'submit_date_time' || fieldName === 'approved_date';
            };

          }
        };
      }
  );
})();
