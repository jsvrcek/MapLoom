(function() {
  var module = angular.module('loom_comment_moderation_service', []);

  module.provider('commentModerationService', function() {

    this.log = [
      {
        username: 'testUser1',
        id: 1,
        ipAddress: '127.0.0.1',
        submitDate: new Date('2017-01-25T10:57:24+0000'),
        status: 'approved',
        comment: 'Example comment 1',
        visible: true,
        title: 'Example Title 1'
      },
      {
        username: undefined,
        id: 2,
        ipAddress: '127.0.0.22',
        submitDate: new Date('2017-01-15T20:27:24+0000'),
        status: 'pending',
        comment: 'Example comment 2',
        visible: true,
        title: 'Example Title 2'
      },
      {
        username: 'testUser3',
        id: 3,
        ipAddress: '127.0.0.3',
        submitDate: new Date('2017-01-27T13:45:24+0000'),
        status: 'rejected',
        comment: 'Example comment 3',
        visible: true,
        title: 'Example Title 3'
      },
      {
        username: 'testUser4',
        id: 4,
        ipAddress: '127.0.0.4',
        submitDate: new Date('2016-05-21T01:04:24+0000'),
        status: 'pending',
        comment: 'Example comment 2',
        visible: true,
        title: 'Example Title 2'
      },
      {
        username: 'testUser5',
        id: 5,
        ipAddress: '127.0.0.4',
        submitDate: new Date('2016-09-01T15:19:24+0000'),
        status: 'pending',
        comment: 'Example comment 5',
        visible: true,
        title: 'Example Title 5'
      },
      {
        username: 'testUser6',
        id: 6,
        ipAddress: '127.0.0.6',
        submitDate: new Date('2017-01-02T01:04:24+0000'),
        status: 'pending',
        comment: 'Example comment 6',
        visible: true,
        title: 'Example Title 6'
      },
      {
        username: 'testUser7',
        id: 7,
        ipAddress: '127.0.0.4',
        submitDate: new Date(),
        status: 'pending',
        comment: 'Example comment 7',
        visible: true,
        title: 'Example Title 7'
      }
    ];

    var log = this.log;

    this.$get = function($translate, $q) {
      this.title = $translate.instant('comments');
      this.summaryMode = false;


      //TODO: Replace with http call
      this.timeSearch = function(startTime, endTime) {
        var defer = $q.defer();
        defer.resolve(log);
        return defer.promise;
      };

      this.enableSummaryMode = function() {
        this.summaryMode = true;
        this.title = $translate.instant('comment_summary');
      };

      this.enableLatestMode = function() {
        this.summaryMode = false;
        this.title = $translate.instant('comments');
      };


      return this;
    };

  });

}());
