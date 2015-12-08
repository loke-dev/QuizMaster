"use strict";

var timer = require("./timer");
var objToSave = [];
var objFetched = [];

function display() {
    var frag = document.createDocumentFragment();

    for (var i = 0; i < objToSave.length; i += 1) {
        var li = document.createElement("li");
        li.appendChild(document.createTextNode((i + 1) + ". Player: " + objToSave[i].name + " - Time: " + objToSave[i].time));
        frag.appendChild(li);
    }

    document.querySelector(".highScore").appendChild(frag);

}

function saveToLocal(player) {
    var highScore = localStorage.getItem("highScore");
    var objToPush = {
        name: player,
        time: timer.display()
    };

    objFetched = JSON.parse(highScore);

    if (objFetched) {
        if (objFetched.length < 5) {
            objToSave = objFetched;
            objToSave.push(objToPush);
            objToSave.sort(function(a, b) {
                return parseFloat(a.time) - parseFloat(b.time);
            });

        } else if (objFetched.length >= 5) {
            if (timer.display() < objFetched[4]) {
                objFetched.pop();
                objToSave = objFetched;
                objToSave.push(objToPush);
                objToSave.sort(function(a, b) {
                    return parseFloat(a.time) - parseFloat(b.time);
                });
            } else {
                return;
            }
        }
    } else {
        objToSave.push(objToPush);
    }

    localStorage.setItem("highScore", JSON.stringify(objToSave));

}

module.exports = {
    display: display,
    saveToLocal: saveToLocal
};
