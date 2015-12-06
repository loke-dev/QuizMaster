"use strict";

var t;
var defaultTime = 20;
var seconds = defaultTime;
var startTime = 0;
var endTime = 0;
var totalTime = 0;
var savedTime = 0;

function getDate() {
    var d = new Date();
    return d.getTime();
}

function start(callback) {
    var div = document.querySelector("#timer");
    t = setInterval(function() {
        seconds -= 0.1;
        div.textContent = seconds.toFixed(1);
        if (seconds <= 0) {
            callback();
        }
    }, 100);

    startTime = getDate();
}

function stop() {
    endTime = getDate();
    savedTime = (endTime - startTime) / 1000;
    if (savedTime <= defaultTime) {
        totalTime += savedTime;
        console.log("saved " + savedTime);
        console.log("total " + totalTime);
    }

    clearInterval(t);
    seconds = defaultTime;
}

function display() {
    var text = document.createTextNode(totalTime.toFixed(3));
    document.querySelector(".highScore").appendChild(text);
}

module.exports = {
    start: start,
    stop: stop
};
