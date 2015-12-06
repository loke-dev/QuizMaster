"use strict";

var timer = require("./timer");


function display(player) {
    console.log(timer.display());
    console.log(player);
}

function getLocal(player) {
    localStorage.setItem(player, ":)");
}

module.exports = {
    display: display,
    getLocal: getLocal
};

