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

            scope.isMerge = function(commit) {
              return goog.isDefAndNotNull(commit.parents) && goog.isArray(commit.parents.id) &&
                  commit.parents.id.length > 1;
            };

            function updateVariables(newLog, oldLog) {
              if (goog.isDefAndNotNull(oldLog) && oldLog.length === 0) {
                $timeout(function() {
                  scrollPane.scrollTop(0);
                },1);
              }
              scope.log = commentModerationService.log;
              scope.commentModerationService = commentModerationService;
            }

            scope.getCommitAuthor = function(commit) {
              if (goog.isDefAndNotNull(commit.author) && goog.isDefAndNotNull(commit.author['name'])) {
                return commit.author['name'].length > 0 ? commit.author['name'] : $translate.instant('anonymous');
              }
              return $translate.instant('anonymous');
            };

            scope.getCommitTime = function(commit) {
              var date = moment(new Date(commit.author.timestamp));
              date.lang($translate.use());
              return date.format('L') + ' @ ' + date.format('LT');
            };

            scope.commentClicked = function(commit) {
              if (scope.loadingDiff !== false) {
                return;
              }
              commit.loading = true;
              scope.loadingDiff = true;
              $('.loom-history-popover').popover('hide');
              var lastCommitId = '0000000000000000000000000000000000000000';
              if (goog.isDefAndNotNull(commit.parents) && goog.isObject(commit.parents)) {
                if (goog.isDefAndNotNull(commit.parents.id)) {
                  if (goog.isArray(commit.parents.id)) {
                    lastCommitId = commit.parents.id[0];
                  } else {
                    lastCommitId = commit.parents.id;
                  }
                }
              }
              var diffOptions = new GeoGigDiffOptions();
              diffOptions.oldRefSpec = lastCommitId;
              diffOptions.newRefSpec = commit.id;
              diffOptions.showGeometryChanges = true;
              diffOptions.pathFilter = commentModerationService.pathFilter;
              diffOptions.show = 1000;
              diffService.performDiff(commentModerationService.repoId, diffOptions).then(function(response) {
                if (goog.isDefAndNotNull(response.Feature)) {
                  if (goog.isDefAndNotNull(response.nextPage) && response.nextPage === true) {
                    dialogService.warn($translate.instant('warning'),
                        $translate.instant('too_many_changes'), [$translate.instant('btn_ok')]);
                  } else {
                    diffService.setTitle($translate.instant('summary_of_changes'));
                    pulldownService.showDiffPanel();
                    //diffService_.clickCallback = featureClicked;
                  }
                } else {
                  dialogService.open($translate.instant('history'),
                      $translate.instant('no_changes_in_commit'), [$translate.instant('btn_ok')]);
                }
                commit.loading = false;
                scope.loadingDiff = false;
              }, function(reject) {
                //failed to get diff
                dialogService.error($translate.instant('error'),
                    $translate.instant('diff_unknown_error'), [$translate.instant('btn_ok')]);
                scope.loadingDiff = false;
                commit.loading = false;
              });
            };

            updateVariables();

            scope.$watch('commentModerationService.log', updateVariables, true);
          }
        };
      });
}());
