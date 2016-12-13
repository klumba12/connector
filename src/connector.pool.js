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
         model: '=cnModel',
         selection: '=?cnSelection',
         tooltip: '=?cnTooltip',
         debounce: '=?cnDebounce',
         style: '=?cnStyle',
         template: '=?cnTemplate',
         layout: '@cnLayout'
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