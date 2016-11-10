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