/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);

	(function (angular) {

	   angular.module('ng.connector', [])
	       .service('ng.connector.job', __webpack_require__(5))
	       .service('ng.connector.merge', __webpack_require__(6))
	       .service('ng.connector.event', function () {
	          var Event = __webpack_require__(7);
	          return Event;
	       })
	       .service('ng.connector.utility', __webpack_require__(8))
	       .service('ng.connector.crDetector', function () {
	          var detector = __webpack_require__(9);
	          return detector;
	       })
	       .directive('ngConnectorPool', __webpack_require__(10))
	       .directive('ngConnector', __webpack_require__(11))
	       .directive('ngConnectorEdge', __webpack_require__(12))
	       .directive('ngConnectorEdg' +
	           'eTemplate', __webpack_require__(13));

	})(angular);

/***/ },
/* 1 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */
/***/ function(module, exports) {

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

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = merge;
	"use strict";

	merge.$inject = ['$filter'];

	function toArray(obj) {
	   var buffer = [];
	   angular.forEach(obj, function (value, key) {
	      buffer.push({
	         key: key,
	         value: value
	      });
	   });
	   return buffer;
	}

	function merge($filter) {
	   var orderBy = $filter('orderBy');

	   return function (settings) {
	      settings =
	          angular.extend({
	             equals: function (l, r) {
	                return l == r;
	             },
	             update: function (l, r, left, i) {
	                return 0;
	             },
	             remove: function (l, left, i) {
	                left.splice(i, 1);
	                return -1;
	             },
	             insert: function (r, left) {
	                left.push(r);
	                return 1;
	             },
	             order: [],
	          }, settings);

	      return function (left, right, result) {
	         var ls = angular.isArray(left) ? left.slice() : toArray(left),
	             rs = angular.isArray(right) ? right.slice() : toArray(right),
	             updated = 0,
	             deleted = 0,
	             inserted = 0;

	         result = result || left;

	         for (var i = 0, lsLength = ls.length; i < lsLength; i++) {
	            var l = ls[i];
	            var matched = false;
	            for (var j = 0, rsLength = rs.length; j < rsLength; j++) {
	               var r = rs[j];
	               if (settings.equals(l, r, i, j)) {
	                  settings.update(l, r, result, result.indexOf(l));
	                  updated++;
	                  matched = true;
	                  rs.splice(j, 1);
	                  break;
	               }
	            }

	            if (!matched) {
	               settings.remove(l, result, result.indexOf(l));
	               deleted++;
	            }
	         }

	         inserted = rs.length;
	         for (var i = 0; i < inserted; i++) {
	            settings.insert(rs[i], result);
	         }

	         var order = angular.isArray(settings.order) ? settings.order : [settings.order];
	         if (order.length) {
	            var orders = settings.order.map(function (o) {
	                   var key = Object.keys(o)[0];
	                   return o[key] === 'asc' ? key : '-' + key;
	                }),
	                orderedResult = orderBy(result, orders);

	            for (var i = 0, length = result.length; i < length; i++) {
	               result[i] = orderedResult[i];
	            }
	         }

	         return {
	            updated: updated,
	            deleted: deleted,
	            inserted: inserted
	         };
	      };
	   };
	}

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = Event;

	function Event() {
	   var events = [];

	   this.on = function (f) {
	      events.push(f);
	      return function () {
	         var index = events.indexOf(f);
	         if (index >= 0) {
	            events.splice(index, 1);
	         }
	      }
	   };

	   this.emit = function (e) {
	      var temp = events.slice();
	      for (var i = 0, length = temp.length; i < length; i++) {
	         temp[i](e);
	      }
	   };
	}


/***/ },
/* 8 */
/***/ function(module, exports) {

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


/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = crDetector;

	function crDetector(model) {
	   // impl. of topology sort algorithm

	   model = model.slice();
	   var nodes = Object
	           .keys(model
	               .reduce(function (memo, e) {
	                  memo[e.start] = true;
	                  memo[e.end] = true;
	                  return memo
	               }, {}))
	           .map(function (x) {
	              return parseInt(x);
	           }),
	       ended = model
	           .reduce(function (memo, e) {
	              var end = e.end;
	              if (memo.hasOwnProperty(end)) {
	                 var xs = memo[end];
	                 xs[e.start] = true;
	              }
	              else {
	                 var xs = {};
	                 xs[e.start] = true;
	                 memo[end] = xs;
	              }

	              return memo;
	           }, {}),
	       visited = nodes //Set of all nodes with no incoming edges
	           .filter(function (n) {
	              return !ended.hasOwnProperty(n);
	           });

	   while (visited.length) {
	      var n = visited.pop(),
	          temp = [];

	      for (var i = 0, length = model.length; i < length; i++) {
	         var edge = model[i];
	         if (edge.start === n) {
	            var m = edge.end;
	            if (ended.hasOwnProperty(m)) {//has no other incoming edges
	               var ss = ended[m];
	               delete ss[n];
	               if (Object.keys(ss).length > 0) {
	                  continue;
	               }

	               delete ended[m];
	            }

	            visited.push(m);
	            continue;
	         }

	         temp.push(edge);
	      }

	      model = temp;
	   }


	   return model.length > 0;
	};

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = ConnectorPool;

	ConnectorPool.$inject = [
	   '$log',
	   'ng.connector.merge',
	   'ng.connector.job',
	   'ng.connector.event'
	];

	function ConnectorPool($log, merge, jobLine, Event) {
	   return {
	      restrict: 'E',
	      scope: {
	         model: '=model',
	         selection: '=?selection',
	         tooltip: '=?tooltip',
	         debounce: '=?debounce',
	         style: '=?style',
	         template: '=?template',
	         layout: '@layout'
	      },
	      controller: ['$scope', '$element', function ($scope, $element) {
	         var self = this,
	             job = jobLine($scope.debounce || 0),
	             voidQueue = [],
	             invalidateQueue = [],
	             state = {
	                init: false
	             };

	         this.body = $element.children()[0];
	         this.target = null;
	         this.source = null;
	         this.model = $scope.model;
	         this.nodes = [];
	         this.layout = $scope.layout || 'absolute';
	         this.layoutEvent = new Event();

	         var equalsM = function (x) {
	            var start = x.start,
	                end = x.end;
	            return function (y) {
	               return start === y.start && end === y.end;
	            };
	         };

	         var edges = function (nodes) {
	            return (nodes || self.nodes)
	                .map(function (node) {
	                   return node.edges;
	                })
	                .reduce(function (memo, edges) {
	                   var es = edges
	                       .filter(function (e) {
	                          return memo.indexOf(e) < 0;
	                       });

	                   memo.push.apply(memo, es);
	                   return memo;
	                }, []);
	         };

	         var find = function (point) {
	            var nodes = self.nodes,
	                index = nodes.findIndex(function (node) {
	                   var model = node.model();
	                   return model === point;
	                });

	            return index >= 0 ? nodes[index] : null;
	         };

	         var findPath = function (model) {
	            var start = find(model.start),
	                end = find(model.end);

	            var result = [];
	            if (start) {
	               result.push(start);
	            }

	            if (end) {
	               result.push(end);
	            }

	            return result;
	         };

	         var contains = function (model) {
	            var ms = self.model;
	            for (var i = 0, length = ms.length; i < length; i++) {
	               var m = ms[i];
	               if (m.start === model || m.end === model) {
	                  return true;
	               }
	            }

	            return false;
	         };

	         var indexOf = function (source, model) {
	            var equals = equalsM(model);
	            return source.findIndex(equals);
	         };

	         var voidy = function (node) {
	            var model = node.model(),
	                edges = node.edges.map(function (edge) {
	                   return edge.model;
	                });

	            edges.forEach(remove);

	            if (contains(model)) {
	               voidQueue.push.apply(voidQueue, edges);
	            }
	         };

	         var build = function (model) {
	            var path = findPath(model);
	            if (path.length === 2) {
	               var source = path[0],
	                   target = path[1],
	                   edge = source.start(model);

	               target.end(edge);
	               self.layoutEvent.emit(edge);
	               return true;
	            }

	            return false;
	         };

	         var remove = function (model) {
	            var path = findPath(model),
	                equals = equalsM(model);
	            path.forEach(function (node) {
	               var edges = node.edges;

	               var i = 0;
	               while (i < edges.length) {
	                  var edge = edges[i];
	                  if (equals(edge.model)) {
	                     if (edge.state.active) {
	                        self.select(null);
	                     }

	                     node.edges.splice(i, 1);
	                     edge.element.remove();
	                  }
	                  else {
	                     i++;
	                  }
	               }
	            });
	         };

	         var invalidate = function () {
	            $log.debug('ng-connector-pool: invalidate [%s]', voidQueue.length);

	            var i = 0;
	            while (i < voidQueue.length) {
	               var model = voidQueue[i];
	               if (build(model)) {
	                  voidQueue.splice(i, 1);
	               }
	               else {
	                  i++;
	               }
	            }
	         };

	         var layout = function (nodes) {
	            var newNodes = nodes.filter(function (n) {
	               return invalidateQueue.indexOf(n) < 0;
	            });

	            if (newNodes.length) {
	               invalidateQueue.push.apply(invalidateQueue, newNodes);
	               job(function () {
	                  $log.debug('ng-connector-pool: layout [%s]', invalidateQueue.length);

	                  $element.addClass('layout');
	                  var newEdges = edges(newNodes);
	                  newEdges.forEach(function (edge) {
	                     edge.element.addClass('layout');
	                  });

	                  return function () {
	                     var es = edges(invalidateQueue);
	                     es.forEach(function (edge) {
	                        var posStart = edge.source.posStart(edge.element),
	                            posEnd =
	                                edge.target.posEnd(
	                                    posStart.element,
	                                    posStart.offset[0],
	                                    posStart.offset[1]);

	                        edge.state.pos = posEnd;
	                        self.layoutEvent.emit(edge);
	                        edge.element.removeClass('layout');
	                     });

	                     invalidateQueue.length = 0;
	                     $element.removeClass('layout');
	                  }
	               });
	            }
	         };

	         var update = merge({
	            equals: function (l, r) {
	               return equalsM(l)(r);
	            },
	            update: angular.noop,
	            remove: function (l) {
	               var index = indexOf(voidQueue, l);
	               if (index >= 0) {
	                  voidQueue.splice(index, 1);
	               }

	               remove(l);
	            },
	            insert: function (l) {
	               if (!build(l)) {
	                  voidQueue.push(l);
	               }
	            }
	         });

	         var resetSelection = function () {
	            self.nodes.forEach(function (node) {
	               node.state.active = false;
	            });

	            edges().forEach(function (edge) {
	               edge.state.active = false;
	            });
	         };

	         var onSelectionChanged = function (selection) {
	            if (selection && selection.length) {
	               var model = selection[0],
	                   es = edges(),
	                   equals = equalsM(model),
	                   index = es.findIndex(function (edge) {
	                      return equals(edge.model);
	                   });

	               if (index >= 0) {
	                  var edge = es[index];
	                  if (!edge.state.active) {
	                     self.select(edge, selection);
	                  }

	                  return;
	               }
	            }

	            self.select(null, selection);
	         };

	         this.style = function (source, e) {
	            var accessor = $scope.style;
	            if (angular.isFunction(accessor)) {
	               return accessor({
	                  source: source,
	                  data: {
	                     model: e.model,
	                     pos: e.state.pos
	                  }
	               });
	            }
	            else if (angular.isString(accessor)) {
	               return accessor;
	            }

	            return {};
	         };

	         this.template = function (source, e) {
	            var accessor = $scope.template;
	            if (angular.isFunction(accessor)) {
	               return accessor({
	                  source: source,
	                  data: {
	                     model: e.model,
	                     pos: e.state.pos
	                  }
	               });
	            }
	            else if (angular.isString(accessor)) {
	               return accessor;
	            }

	            return null;
	         };

	         this.tooltip = function (edge) {
	            var accessor = $scope.tooltip;
	            if (angular.isFunction(accessor)) {
	               return accessor(edge.model);
	            }
	            else if (angular.isString(accessor)) {
	               return accessor;
	            }
	         };

	         this.select = function (edge, selection) {
	            resetSelection();

	            if (edge) {
	               var model = edge.model,
	                   path = findPath(model);

	               if (path.length === 2) {
	                  path[0].state.active = true;
	                  path[1].state.active = true;
	               }

	               edge.state.active = true;
	               if (selection) {
	                  selection.length = 0;
	                  selection.push(model);
	               }
	               else {
	                  $scope.selection = [model];
	               }
	            }
	            else {
	               if (selection) {
	                  selection.length = 0;
	               }
	               else {
	                  $scope.selection = [];
	               }
	            }
	         };

	         this.hide = function (node) {
	            $log.debug('ng-connector-pool: hide');

	            var index = self.nodes.indexOf(node);
	            if (index < 0) {
	               throw new Error('ng-connector: can\'t find node');
	            }

	            self.nodes.splice(index, 1);
	            voidy(node);
	         };

	         $scope.$watch('model', function (newValue, oldValue) {
	            if (!newValue) {
	               $scope.model = [];
	            }

	            self.model = $scope.model;
	            if (state.init) {
	               update(oldValue || [], self.model);
	            }
	            else {
	               update([], self.model);
	               state.init = true;
	            }
	         });

	         $scope.$watch(
	             function () {
	                if (voidQueue.length) {
	                   invalidate();
	                }

	                return self.nodes.length;
	             },
	             angular.noop);

	         $scope.$watch(function () {
	            var nodes = self.nodes
	                .filter(function (node) {
	                   var length = node.edges.length;
	                   if (!length) {
	                      return false;
	                   }

	                   var offset = node.offset(),
	                       originOffset = node.state.pos,
	                       posChanged = offset.left !== originOffset.left ||
	                           offset.top !== originOffset.top;

	                   // if(posChanged && $scope.debounce){
	                   // 	node.state.pos.left = offset.left;
	                   // 	node.state.pos.top = offset.top;
	                   // }

	                   return posChanged;
	                });

	            if (nodes.length > 0) {
	               layout(nodes);
	            }

	            return true;
	         }, angular.noop);

	         $scope.$watch('selection', function (selection) {
	            onSelectionChanged(selection);
	         });
	      }]
	   };
	}

/***/ },
/* 11 */
/***/ function(module, exports) {

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
	         canDrag: '=?canDrag',
	         canDrop: '=?canDrop',
	         model: '=model',
	         class: '=?class',
	         tooltip: '=?tooltip',
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

/***/ },
/* 12 */
/***/ function(module, exports) {

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

/***/ },
/* 13 */
/***/ function(module, exports) {

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

/***/ }
/******/ ]);