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
    obj.sort(function(a, b) {
        return parseFloat(a.time) - parseFloat(b.time);
    });
}

function saveToLocal(player) {
    var highScore = localStorage.getItem("highScore");
    var objToPush = {
        name: player,
        time: timer.display()
    };

    objFetched = JSON.parse(highScore);

    if (highScore) {
        if (objFetched.length < 5 && objFetched.length > 0) {
            objToSave = objFetched;
            objToSave.push(objToPush);
            objToSave.sort(function(a, b) {
                return parseFloat(a.time) - parseFloat(b.time);
            });
            console.log(objFetched.length);
        } else if (highScore.length >= 5) {
            if (timer.display() > objFetched[4]) {
                objFetched.pop();
                objToSave = objFetched;
                objToSave.push(objToPush);
                objToSave.sort(function(a, b) {
                    return parseFloat(a.time) - parseFloat(b.time);
                });
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
