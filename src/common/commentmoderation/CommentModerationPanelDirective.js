(function() {
  var module = angular.module('loom_comment_moderation_panel_directive', []);

  module.directive('loomCommentModerationPanel',
      function($rootScope, $timeout, $translate, diffService, dialogService, commentModerationService, pulldownService) {
        return {
          //restrict: 'C',
          //replace: true,
          templateUrl: 'commentmoderation/partial/commentmoderationpanel.tpl.html',
          link: function(scope, element, attrs) {
            scope.loadingDiff = false;
            var scrollPane = element.find('.comment-moderation-scroll-pane');
            var raw = scrollPane[0];

            scrollPane.bind('scroll', function() {
              if (commentModerationService.nextPage && raw.scrollTop + raw.offsetHeight >= raw.scrollHeight - 47) {
                scope.$apply(function() {
                  commentModerationService.getMoreHistory();
                });
              }
            });

            scope.$on('comment-moderation-refreshed', function(event, numInserted) {
              if (raw.scrollTop !== 0) {
                var height = scrollPane.find('.list-group-item')[0].offsetHeight - 1;
                raw.scrollTop = raw.scrollTop + height * numInserted;
              }
            });

            scope.isLoading = function(commit) {
              return goog.isDefAndNotNull(commit.loading) && commit.loading === true;
            };

            function updateVariables(newLog, oldLog) {
              if (goog.isDefAndNotNull(oldLog) && oldLog.length === 0) {
                $timeout(function() {
                  scrollPane.scrollTop(0);
                },1);
              }
              scope.log = commentModerationService.log;
              scope.title = commentModerationService.title;
              scope.summaryMode = commentModerationService.summaryMode;
              scope.commentModerationService = commentModerationService;
            }


            scope.commentClicked = function(comment) {
              // $('.loom-comment-popover').popover('hide');
              // pulldownService.showDiffPanel();
            };

            updateVariables();

            scope.$watch('commentModerationService.log', updateVariables, true);
            scope.$watch('commentModerationService.summaryMode', updateVariables, true);
          }
        };
      });
}());
