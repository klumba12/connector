module.exports = ConnectorEdge;

function ConnectorEdge() {
   return {
      restrict: 'E',
      template: '<div class="ng-connector-edge"' +
      'ng-click="pool.select(self)"' +
      'ng-class="{active: state.active, left: state.pos.angle >= 90 && state.pos.angle < 270}">' +
      '<div class="ng-connector-edge-body">' +
      '<ng-connector-edge-template>' +
      '</ng-connector-edge-template>' +
      '</div>' +
      '</div>',
      replace: true,
      require: '^ngConnectorPool',
      link: function (scope, element, attrs, pool) {
         scope.pool = pool;
         scope.self = scope;
      }
   };
}