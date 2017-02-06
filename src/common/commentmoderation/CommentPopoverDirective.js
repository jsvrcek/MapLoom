(function() {
  var module = angular.module('loom_comment_popover_directive', []);

  module.directive('loomCommentPopover',
      function($translate) {
        return {
          restrict: 'C',
          replace: false,
          link: function(scope, element, attrs) {
            if (!goog.isDefAndNotNull(scope.comment)) {
              scope.comment = scope.$eval(attrs.comment);
            }
            if (!goog.isDefAndNotNull(scope.comment)) {
              element.popover('destroy');
              return;
            }
            var safeName = function(name) {
              if (goog.isDefAndNotNull(name) && name.length > 0) {
                return name;
              }
              return $translate.instant('anonymous');
            };
            var prettyTime = function(time) {
              var date = new Date(time);
              return date.toLocaleDateString() + ' @ ' + date.toLocaleTimeString();
            };

            var content = '<div class="popover-label">' + $translate.instant('author_name') + ':</div>' +
                '<div class="popover-value">' + safeName(scope.comment.username) + '</div>' +
                '<div class="popover-label">' + $translate.instant('comment_time') + ':</div>' +
                '<div class="popover-value">' + prettyTime(scope.comment.submitDate) + '</div>' +
                '<div class="popover-label">' + $translate.instant('comment_title') + ':</div>' +
                '<div class="popover-value">' + scope.comment.title + '</div>' +
                '<div class="popover-label">' + $translate.instant('message') + ':</div>' +
                '<div class="popover-value">' + scope.comment.comment + '</div>';

            element.popover({
              trigger: 'manual',
              animation: false,
              html: true,
              content: content,
              container: 'body',
              title: $translate.instant('id') + ': ' + scope.comment.id
            });

            element.mouseenter(function() {
              if (element.closest('.collapsing').length === 0) {
                element.popover('show');
              }
            });
            element.mouseleave(function() {
              element.popover('hide');
            });
          }
        };
      });
}());
