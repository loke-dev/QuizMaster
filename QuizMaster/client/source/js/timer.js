"use strict";

var t;
var defaultTime = 20;
var seconds = defaultTime;
var startTime = 0;
var endTime = 0;
var totalTime = 0;
var savedTime = 0;

//Grabs the current time
function getDate() {
    var d = new Date();
    return d.getTime();
}

//Starts the timer with callback function that gets called when the time runs out
function start(callback) {
    var div = document.querySelector("#timer");
    t = setInterval(function() {
        seconds -= 0.1;
        div.textContent = seconds.toFixed(0);
        if (seconds <= 0) {
            callback();
        }
    }, 100);

    startTime = getDate();
}

//Stop the timer
function stop() {
    endTime = getDate();
    savedTime = (endTime - startTime) / 1000;
    if (savedTime <= defaultTime) {
        totalTime += savedTime;
    }

    clearInterval(t);
    seconds = defaultTime;
}

//Clears all the timer variables
function clean() {
    startTime = 0;
    endTime = 0;
    totalTime = 0;
    savedTime = 0;
}

//Returns the total time for current game
function display() {
    return totalTime.toFixed(3);
}

module.exports = {
    start: start,
    stop: stop,
    display: display,
    clean: clean
};
