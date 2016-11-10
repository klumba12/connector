module.exports = ConnectorEdgeTemplate;
"use strict";

function ConnectorEdgeTemplate($compile) {
   return {
      restrict: 'E',
      template: '',
      replace: true,
      require: '^ngConnectorPool',
      link: function (scope, element, attrs, pool) {
         scope.pool = pool;

         var defaultTemplate =
                 '<div class="ng-connector-edge-tooltip"><span>{{pool.tooltip(self)}}</span></div>' +
                 '<div ng-style="pool.style(\'edge-start\', self)" class="ng-connector-edge-start ng-connector-edge-handle" ng-show="state.pos.width > 0"></div>' +
                 '<div ng-style="pool.style(\'edge-end\', self)" class="ng-connector-edge-end ng-connector-edge-handle" ng-show="state.pos.width > 0"></div>',
             templateScope = null;

         var invalidate = function () {
            destroy();

            var template = angular.element(pool.template('edge', scope) || defaultTemplate);
            templateScope = scope.$new();
            element.replaceWith(template);
            $compile(template)(templateScope);
            element = template;
         };

         var destroy = function () {
            if (templateScope) {
               templateScope.$destroy();

               templateScope = null;
            }
         };

         pool.layoutEvent.on(function (e) {
            if (e.model === scope.model) {
               invalidate();
            }
         });

         scope.$on('$destroy', destroy);
      }
   };
}