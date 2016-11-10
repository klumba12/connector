module.exports = job;
"use strict";

job.$inject = ['$q', '$timeout'];

function job($q, $timeout) {
   return function (delay) {
      var timeout = null;
      var canceler = null;
      return function (f) {
         if (timeout) {
            $timeout.cancel(timeout);
            timeout = null;
         }

         if (canceler) {
            canceler.resolve();
            canceler = null;
         }

         var job = f();
         if (job) {
            var doJob = function () {
               timeout = null;
               canceler = $q.defer();
               job(canceler.promise);
            };

            if (angular.isUndefined(delay) || delay === 0) {
               doJob();
            }
            else {
               timeout = $timeout(doJob, delay);
            }
         }
      };
   };
}