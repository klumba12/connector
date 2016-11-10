module.exports = utility;
"use strict";

utility.$inject = ['$rootScope'];

function utility($root) {
   return {
      safeApply: function (f) {
         var phase = $root.$$phase;
         if (phase == '$apply' || phase == '$digest') {
            if (f && (typeof(f) === 'function')) {
               f();
            }
         } else {
            $root.$apply(f);
         }
      }
   };
}
