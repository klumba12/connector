module.exports = Connector;
"use strict";

Connector.$inject = [
    '$compile',
    '$document',
    'ng.connector.utility'];

function Connector($compile, $document, utility) {
    return {
        restrict: 'E',
        scope: {
            canDrag: '=?cnCanDrag',
            canDrop: '=?cnCanDrop',
            model: '=cnModel',
            class: '=?cnClass',
            tooltip: '=?cnTooltip'
        },
        controller: ['$scope', '$element', function ($scope, $element) {
            var self = this,
                body = $element.children()[0];

            this.edges = [];
            this.state = {
                active: false,
                pos: {
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0
                }
            };

            this.select = function () {
                self.pool.select(self);
            };

            this.applyClass = function (edge) {
                var clsAccessor = $scope.class;
                if (angular.isFunction(clsAccessor)) {
                    var cls = clsAccessor(edge.model);
                    if (cls) {
                        edge.element.addClass(cls);
                    }
                }
                else if (angular.isString(clsAccessor)) {
                    edge.element.addClass(clsAccessor);
                }
            };

            this.model = function () {
                return $scope.model;
            };

            this.canDrag = function (e) {
                if (angular.isFunction($scope.canDrag)) {
                    return $scope.canDrag(e);
                }

                return true;
            };

            this.canDrop = function (e) {
                if (angular.isFunction($scope.canDrop)) {
                    return $scope.canDrop(e);
                }

                var pool = this.pool,
                    model = pool.model,
                    source = e.source,
                    target = e.target;

                if (source === target) {
                    return false;
                }

                for (var i = 0, length = model.length; i < length; i++) {
                    var item = model[i];
                    if ((item.start === source && item.end === target) ||
                        (item.start === target && item.end === source)) {
                        return false;
                    }
                }

                return true;
            };

            this.pos = function (edge, dx, dy) {
                var ratio = dy / dx,
                    rad = Math.atan(ratio),
                    deg = rad * (180 / Math.PI),
                    width = Math.ceil(Math.sqrt(dx * dx + dy * dy)),
                    angle = (dx < 0 ? 180 + deg : deg);

                edge.css({
                    width: width + 'px',
                    transform: 'rotateZ(' + angle + 'deg)'
                });

                return {
                    width: width,
                    angle: angle
                };
            };

            this.offset = function () {
                var pool = this.pool;
                if (pool.layout === 'relative') {
                    var top = 0,
                        left = 0,
                        relative = this.pool.body,
                        element = body;

                    do {
                        if (!isNaN(element.offsetLeft)) {
                            left += element.offsetLeft;
                        }

                        if (!isNaN(element.offsetTop)) {
                            top += element.offsetTop;
                        }

                    } while ((element = element.offsetParent) !== relative && element);

                    return {
                        top: top,
                        left: left
                    };
                }

                var p = body.getBoundingClientRect();
                return {
                    top: p.top,
                    left: p.left
                };
            };

            this.posStart = function (edge) {
                var l = body.offsetLeft,
                    t = body.offsetTop,
                    w = body.offsetWidth,
                    h = body.offsetHeight,
                    cx = l + w / 2,
                    cy = t + h / 2,
                    offset = self.offset();

                var sx = offset.left + w / 2,
                    sy = offset.top + h / 2;

                edge.css({
                    left: cx + 'px',
                    top: cy + 'px',
                    transformOrigin: 'top left'
                });

                self.state.pos = offset;
                return {
                    element: edge,
                    offset: [sx, sy]
                };
            };

            this.posEnd = function (edge, sx, sy) {
                var offset = self.offset(),
                    w = body.offsetWidth,
                    h = body.offsetHeight,
                    dx = offset.left + w / 2 - sx,
                    dy = offset.top + h / 2 - sy;

                self.state.pos = offset;
                return self.pos(edge, dx, dy);
            };

            this.dragFactory = function (edge) {
                var sx = edge.offset[0],
                    sy = edge.offset[1];

                return function (e) {
                    var dx = e.clientX - sx,
                        dy = e.clientY - sy;

                    var pos = self.pos(edge.element, dx, dy);
                    utility.safeApply(function () {
                        edge.state.pos = pos;
                    });

                    return pos;
                };
            };

            this.dragendFactory = function (edge) {
                return function () {
                    var pool = self.pool,
                        target = pool.target;

                    if (target) {
                        target.end(edge);

                        utility.safeApply(function () {
                            pool.model.push(edge.model);
                            pool.select(edge);
                        });

                        return edge.model;
                    }
                    else {
                        return null;
                    }
                };
            };

            this.end = function (edge) {
                var sx = edge.offset[0],
                    sy = edge.offset[1],
                    source = edge.source,
                    target = self;

                edge.target = target;
                edge.model.end = target.model();

                var pos = self.posEnd(edge.element, sx, sy);
                edge.state.pos = pos;

                source.edges.push(edge);
                target.edges.push(edge);

                self.applyClass(edge);
                target.applyClass(edge);

                return pos;
            };

            this.start = function (model) {
                var element = angular.element('<ng-connector-edge></ng-connector-edge>'),
                    pos = self.posStart(element),
                    model = model || {start: self.model(), end: null},
                    state = {active: false, pos: {width: 0, angle: 0}},
                    edgeScope = $scope.$new();

                edgeScope.model = model;
                edgeScope.state = state;

                $element.append(element);
                $compile(element)(edgeScope);

                var edge = {
                    scope: edgeScope.source,
                    source: self,
                    target: null,
                    element: pos.element,
                    offset: pos.offset,
                    model: model,
                    state: state
                };

                self.applyClass(edge);
                return edge;
            };

            $scope.$watch(function () {
                return self.state.active;
            }, function (value) {
                if (value) {
                    $element.addClass('active');
                }
                else {
                    $element.removeClass('active');
                }
            });
        }],
        require: ['ngConnector', '^ngConnectorPool'],
        link: function (scope, element, attrs, ctrls) {
            var body = angular.element(element.children()[0]),
                ctrl = ctrls[0],
                pool = ctrls[1];

            ctrl.pool = pool;
            ctrl.attrs = attrs;
            pool.nodes.push(ctrl);

            var mousedown = function (e) {
                e.preventDefault();
                if (!ctrl.canDrag({source: ctrl.model()})) {
                    return;
                }

                var edge = ctrl.start();

                pool.source = ctrl;
                body.addClass('source');
                edge.element.addClass('drag');

                var drag = ctrl.dragFactory(edge),
                    dragend = ctrl.dragendFactory(edge);

                var drop = function (e) {
                    if (!dragend(e)) {
                        edge.element.remove();
                    }

                    pool.source = null;
                    body.removeClass('source');
                    edge.element.removeClass('drag');

                    $document.unbind('mousemove', drag);
                    $document.unbind('mouseup', drop);
                };

                $document.on('mousemove', drag);
                $document.on('mouseup', drop);
            };

            var mouseover = function () {
                if (pool.source) {
                    element.addClass('target');

                    var e = {
                        source: pool.source.model(),
                        target: ctrl.model()
                    };

                    if (ctrl.canDrop(e)) {
                        element.addClass('drop');
                        pool.target = ctrl;
                    }
                    else {
                        element.addClass('no-drop');
                    }
                }
            };

            var mouseout = function () {
                element.removeClass('target');
                element.removeClass('drop');
                element.removeClass('no-drop');

                pool.target = null;
            };

            body.on('mouseout', mouseout);
            body.on('mouseover', mouseover);
            body.on('mousedown', mousedown);

            scope.$on('$destroy', function () {
                body.unbind('mouseout', mouseout);
                body.unbind('mouseover', mouseover);
                body.unbind('mousedown', mousedown);

                pool.hide(ctrl);
                ctrl.edges
                    .filter(function (edge) {
                        return edge.scope;
                    })
                    .forEach(function (edge) {
                        edge.scope.$destroy();
                        edge.scope = null;
                    });
            });
        }
    };
}