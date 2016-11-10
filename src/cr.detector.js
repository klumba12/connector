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