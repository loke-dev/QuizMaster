"use strict";

var timer = require("./timer");
var objToSave = [];
var objFetched = [];

var tempTime = 3.53;

function display(player) {
}

function getLocal(player) {
    //localStorage.setItem(player, objParsed);
}

function sort(obj) {
    var arr = [];
    var prop;
    for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push({
                    key: prop,
                    value: obj[prop]
                });
        }
    }

    arr.sort(function(a, b) {
            return a.value - b.value;
        });

    return arr; // returns array

}

function saveToLocal(player) {
    var objToPush = {};
    var highScore = localStorage.getItem("highScore");

    objToPush[player] = timer.display();
    console.log(timer.display());

    objFetched = JSON.parse(highScore);

    if (highScore) {
        if (objFetched.length < 5 && objFetched.length > 0) {
            objToSave = objFetched;
            objToSave.push(objToPush);
            console.log(objFetched.length);
        } else if (highScore.length >= 5) {
            if (timer.display() > objFetched[4]) {

            } else {
                sort(objToSave);
                console.log(objFetched.length);
            }
        }
    } else {
        objToSave.push(objToPush);
    }

    localStorage.setItem("highScore", JSON.stringify(objToSave));

}

module.exports = {
    display: display,
    getLocal: getLocal,
    saveToLocal: saveToLocal
};

//localStorage.setItem('myObject', JSON.stringify(myObject));
//
//myObject = JSON.parse(localStorage.getItem('myObject'));
