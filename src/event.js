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
