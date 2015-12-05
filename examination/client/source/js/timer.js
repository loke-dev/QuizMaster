"use strict";

//var Timer = function() {
//    this.seconds = 0;
//    this.div = document.querySelector("#timer");
//    this.intervalID = undefined;
//};
//
//Timer.prototype.Start = function() {
//    var _this = this;
//    _this.intervalID = setInterval(function() {
//        _this.seconds += 0.1;
//        _this.div.textContent = _this.seconds.toFixed(1);
//    }, 100);
//};
//
//Timer.prototype.Stop = function() {
//    window.clearInterval(this.intervalID);
//};
//
//module.exports = Timer;

var t;
var seconds = 20;

function start(callback) {
    var div = document.querySelector("#timer");
    t = setInterval(function() {
        seconds -= 0.1;
        div.textContent = seconds.toFixed(1);
        if (seconds <= 0) {
            callback();
        }
    }, 100);

}

function stop() {
    clearInterval(t);
    seconds = 20;
}

module.exports = {
    start: start,
    stop: stop
};
