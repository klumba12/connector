(function (angular) {
   "use strict";

   angular.module('app', ['ng.connector'])
       .controller('ng.connector.demo.ctrl', ctrl);

   ctrl.$inject = [
      '$scope'
   ];

   function ctrl($scope) {

      $scope.list = [];
      $scope.model = [];
      $scope.selection = [];

      (function setup() {
         var length = 4,
             angle = 270,
             step = 360 / length,
             d = 180;

         for (var i = 0; i < length; i++) {
            var rad = Math.PI * angle / 180;

            $scope.list[i] = {
               top: d * (1 + Math.cos(rad)),
               left: d * (1 + Math.sin(rad))
            };

            angle += step;
         }
      })();


   }
})(angular);