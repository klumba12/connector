require('../assets/connector.scss');

(function (angular) {

   angular.module('ng.connector', [])
       .service('ng.connector.job', require('./job'))
       .service('ng.connector.merge', require('./merge'))
       .service('ng.connector.event', function () {
          var Event = require('./event');
          return Event;
       })
       .service('ng.connector.utility', require('./utility'))
       .service('ng.connector.crDetector', function () {
          var detector = require('./cr.detector');
          return detector;
       })
       .directive('ngConnectorPool', require('./connector.pool'))
       .directive('ngConnector', require('./connector'))
       .directive('ngConnectorEdge', require('./connector.edge'))
       .directive('ngConnectorEdg' +
           'eTemplate', require('./connector.template'));

})(angular);