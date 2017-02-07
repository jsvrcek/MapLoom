(function() {

  var module = angular.module('loom_comment_search_directive', []);

  module.directive('loomCommentSearch',
      function($rootScope, commentModerationService, $translate,
               pulldownService, dialogService, $window) {
        return {
          templateUrl: 'commentmoderation/partial/commentsearch.tpl.html',
          link: function(scope, element, attrs) {
            scope.startDate = [new Date().toISOString()];
            scope.endDate = [new Date().toISOString()];
            scope.active = true;
            scope.contentHidden = true;
            scope.isLoading = false;

            element.closest('.modal').on('hidden.bs.modal', function(e) {
              if (!scope.$$phase && !$rootScope.$$phase) {
                scope.$apply(function() {
                  scope.contentHidden = true;
                });
              } else {
                scope.contentHidden = true;
              }
            });
            element.closest('.modal').on('show.bs.modal', function(e) {
              if (!scope.$$phase && !$rootScope.$$phase) {
                scope.$apply(function() {
                  scope.contentHidden = false;
                });
              } else {
                scope.contentHidden = false;
              }
            });

            scope.cancel = function() {
              element.closest('.modal').modal('hide');
              scope.isLoading = false;
            };

            scope.onSearch = function() {
              scope.isLoading = true;
              var startTime = new Date(scope.startDate[0]).getTime();
              var endTime = new Date(scope.endDate[0]).getTime();
              commentModerationService.timeSearch(startTime, endTime).then(function(resp) {
                if (resp.length === 0) {
                  //TODO: Check to make sure translation is there
                  dialogService.open($translate.instant('comments'),
                      $translate.instant('no_comments_in_time_range'), [$translate.instant('btn_ok')]);
                  scope.isLoading = false;
                } else {
                  // commentModerationService.setTitle($translate.instant('summary_of_comments'));
                  commentModerationService.enableSummaryMode();
                  scope.cancel();
                }
              }, function(resp) {
                //TODO: Fill in translation for comment unknown error
                dialogService.error($translate.instant('error'),
                    $translate.instant('comment_unknown_error'), [$translate.instant('btn_ok')]);
                scope.isLoading = false;
              });
            };

            //TODO: Make sure this works
            scope.exportCSV = function() {
              var repo = geogigService.getRepoById(historyService.layer.get('metadata').repoId);
              var startTime = new Date(scope.startDate[0]).getTime();
              var endTime = new Date(scope.endDate[0]).getTime();
              var untilTime = startTime < endTime ? endTime : startTime;
              var sinceTime = startTime < endTime ? startTime : endTime;
              var path = historyService.pathFilter;
              var until = historyService.layer.get('metadata').branchName;
              // TODO: Make this work with a proxy once it supports authentication
              var url = repo.url + '/log.csv?until=' + until + '&path=' +
                  path + '&sinceTime=' + sinceTime + '&untilTime=' + untilTime + '&summary=true';
              $window.open(url);
            };
          }
        };
      }
  );
})();
