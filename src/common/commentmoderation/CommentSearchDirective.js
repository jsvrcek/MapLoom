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

            //We need to drop the milliseconds as python expects a different format
            function convertDateToISO(date) {
              function pad(number) {
                if (number < 10) {
                  return '0' + number;
                }
                return number;
              }
              return date.getUTCFullYear() +
                  '-' + pad(date.getUTCMonth() + 1) +
                  '-' + pad(date.getUTCDate()) +
                  'T' + pad(date.getUTCHours()) +
                  ':' + pad(date.getUTCMinutes()) +
                  ':' + pad(date.getUTCSeconds()) +
                  'UTC';
            }

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
              var startTime = convertDateToISO(new Date(scope.startDate[0]));
              var endTime = convertDateToISO(new Date(scope.endDate[0]));
              commentModerationService.timeSearch(startTime, endTime).then(function(resp) {
                if (resp.length === 0) {
                  dialogService.open($translate.instant('comments'),
                      $translate.instant('no_comments_in_time_range'), [$translate.instant('btn_ok')]);
                  scope.isLoading = false;
                } else {
                  commentModerationService.enableSummaryMode();
                  scope.cancel();
                }
              }, function(resp) {
                dialogService.error($translate.instant('error'),
                    $translate.instant('comment_unknown_error'), [$translate.instant('btn_ok')]);
                scope.isLoading = false;
              });
            };

            scope.exportCSV = function() {
              var startTime = convertDateToISO(new Date(scope.startDate[0]));
              var endTime = convertDateToISO(new Date(scope.endDate[0]));
              var url = commentModerationService.csvExport(startTime, endTime);
              $window.open(url);
            };
          }
        };
      }
  );
})();
