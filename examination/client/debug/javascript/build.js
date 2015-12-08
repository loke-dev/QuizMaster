(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
/**
 * This callback function sends request to the database
 * @param config
 * @param callback
 */
function request(config, callback) {

    config.url = config.url || "";
    config.method = config.method || "post";
    config.contenttype = config.contenttype || "application/json";
    config.answer = config.answer || null;

    var req = new XMLHttpRequest();

    req.addEventListener("load", function() {

        if (req.status >= 400) {
            callback(req.status);
        } else {
            callback(null, req.responseText);
        }

    });

    req.open(config.method, config.url);
    req.setRequestHeader("Content-Type", config.contenttype);
    req.send(config.answer);
}

function requestGet(url, callback) {
    var reqGet = new XMLHttpRequest();

    reqGet.addEventListener("load", function() {

        if (reqGet.status >= 400) {
            callback(reqGet.status);
        }

        callback(null, reqGet.responseText);

    });

    reqGet.open("GET", url);
    reqGet.send();
}

module.exports = {
    request: request,
    requestGet: requestGet
};

},{}],2:[function(require,module,exports){
"use strict";
/*
 @author - Loke Carlsson
 */

var quiz = require("./quiz");
var ajax = require("./ajax");
var timer = require("./timer");
var highscore = require("./highscore");
var submit = document.querySelector("#submit");
var startQuiz = document.querySelector("#startQuiz");
var timerDiv = document.querySelector("#timer");
var nameBox = document.querySelector(".nameBox");

//http://vhost3.lnu.se:20080/question/1
//"http://oskaremilsson.se:4004/question/1"
var defaultURL = "http://oskaremilsson.se:4004/question/1";
var urlQ = urlQ || defaultURL;
var urlA;
var requestId;
var i = 1;

//Clean up some things for a new game
var cleanUp = function() {
    startQuiz.classList.toggle("hidden");
    startQuiz.classList.toggle("visible");
    submit.classList.toggle("visible");
    submit.classList.toggle("hidden");
    timerDiv.classList.add("hidden");
    urlQ = defaultURL;
    urlA = "";
};

//Calls some functions when game is over
var gameOver = function() {
    cleanUp();
    quiz.clean();
    timer.stop();
    highscore.getLocal(nameBox.value);
    highscore.display(nameBox.value);
    highscore.saveToLocal(nameBox.value);
    timer.clean();
    quiz.gameOver();
};

//GET request to the server
var getReq = function() {
    if (urlQ) {
        ajax.requestGet(urlQ, function(error, response) {
            var alts = JSON.parse(response).alternatives;
            var quests = JSON.parse(response).question;
            requestId = JSON.parse(response).id;
            quiz.createTemplate(i, quests, alts);
            urlA = JSON.parse(response).nextURL;
        });
    }
};

//Starts the quiz
startQuiz.addEventListener("click", function() {
    if (document.querySelector(".nameBox").value) {
        quiz.clean();
        cleanUp();
        getReq();
        timerDiv.classList.remove("hidden");
        timer.stop();
        timer.start(function() {
        //Callback function when time runs out
        gameOver();
    });
    } else {
        nameBox.classList.remove("green");
        nameBox.classList.add("red");
    }
});

nameBox.addEventListener("keyup", function() {
    nameBox.classList.remove("red");
    nameBox.classList.add("green");
});

//Posts the answer to the server
submit.addEventListener("click", function() {
    var jsonObj = JSON.stringify({
        answer: quiz.answer(i)
    });

    ajax.request({method: "POST", url: urlA, answer: jsonObj}, function(error, response) {
        quiz.clean();

        if ((error === null || error < 400) && JSON.parse(response).nextURL) {
            urlQ = JSON.parse(response).nextURL;
            i += 1;
            getReq();
            timerDiv.classList.remove("hidden");
            timer.stop();
            timer.start(function() {
                //Callback function when time runs out
                gameOver();
            });
        } else {
            gameOver();
        }
    });

});


},{"./ajax":1,"./highscore":3,"./quiz":4,"./timer":5}],3:[function(require,module,exports){
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

},{"./timer":5}],4:[function(require,module,exports){
"use strict";

var template = function(quest) {
    var template = document.querySelector("#template" + quest);
    var node = document.importNode(template.content, true);
    document.querySelector(".area").appendChild(node);
};

var clean = function() {
    var el = document.querySelector(".area");
    while (el.hasChildNodes()) {
        el.removeChild(el.lastChild);
    }
};

var gameOver = function() {
    var template = document.querySelector("#endTemplate");
    var node = document.importNode(template.content, true);
    document.querySelector(".area").appendChild(node);
};

var answer = function() {
    var answerText;
    var radios = document.getElementsByName("radio");
    var value;
    for (var j = 0; j < radios.length; j += 1) {
        if (radios[j].checked) {
            value = radios[j].value;
        }
    }

    if (document.querySelector(".inputBox")) {
        answerText = document.querySelector(".inputBox").value;
    } else {
        answerText = value;
    }

    return answerText;

};

var genRadio = function(alternatives) {
    var alts = Object.getOwnPropertyNames(alternatives);
    var numAlt = Object.getOwnPropertyNames(alternatives).length;
    var frag = document.createDocumentFragment();
    for (var j = 0; j < numAlt; j += 1) {
        var radio = document.createElement("input");
        var altText = alts[j];
        var alt = alternatives[altText];
        var text = document.createTextNode(alt);
        radio.title = (j + 1);
        radio.type = "radio";
        radio.name = "radio";
        radio.value = alts[j];
        frag.appendChild(radio);
        frag.appendChild(text);
        frag.appendChild(document.createElement("br"));
        radio.classList.add("radio");
    }

    return frag;
};

var genInput = function() {
    var inputBox = document.createElement("input");
    inputBox.type = "text";
    inputBox.placeholder = "Your answer here..";
    inputBox.classList.add("inputBox");
    document.querySelector(".inputDiv").appendChild(inputBox);
    inputBox.focus();
};

var createTemplate = function(i, question, alternatives) {
    var template = document.querySelector("#template");
    var node = document.importNode(template.content, true);
    document.querySelector(".area").appendChild(node);

    var titleNr = document.createTextNode(i);
    var questionNode = document.createTextNode(question);
    var textClass = document.querySelector(".text");

    textClass.appendChild(questionNode);
    document.querySelector(".title").appendChild(titleNr);

    if (alternatives) {
        document.querySelector(".radioDiv").appendChild(genRadio(alternatives));
    } else {
        genInput();
    }

};

module.exports = {
    template:template,
    clean:clean,
    gameOver:gameOver,
    answer:answer,
    createTemplate:createTemplate
};

},{}],5:[function(require,module,exports){
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
        div.textContent = seconds.toFixed(0);
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

function clean() {
    startTime = 0;
    endTime = 0;
    totalTime = 0;
    savedTime = 0;
}

function display() {
    return totalTime.toFixed(3);
}

module.exports = {
    start: start,
    stop: stop,
    display: display,
    clean: clean
};

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMS4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYWpheC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9oaWdoc2NvcmUuanMiLCJjbGllbnQvc291cmNlL2pzL3F1aXouanMiLCJjbGllbnQvc291cmNlL2pzL3RpbWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcbi8qKlxuICogVGhpcyBjYWxsYmFjayBmdW5jdGlvbiBzZW5kcyByZXF1ZXN0IHRvIHRoZSBkYXRhYmFzZVxuICogQHBhcmFtIGNvbmZpZ1xuICogQHBhcmFtIGNhbGxiYWNrXG4gKi9cbmZ1bmN0aW9uIHJlcXVlc3QoY29uZmlnLCBjYWxsYmFjaykge1xuXG4gICAgY29uZmlnLnVybCA9IGNvbmZpZy51cmwgfHwgXCJcIjtcbiAgICBjb25maWcubWV0aG9kID0gY29uZmlnLm1ldGhvZCB8fCBcInBvc3RcIjtcbiAgICBjb25maWcuY29udGVudHR5cGUgPSBjb25maWcuY29udGVudHR5cGUgfHwgXCJhcHBsaWNhdGlvbi9qc29uXCI7XG4gICAgY29uZmlnLmFuc3dlciA9IGNvbmZpZy5hbnN3ZXIgfHwgbnVsbDtcblxuICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIHJlcS5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbigpIHtcblxuICAgICAgICBpZiAocmVxLnN0YXR1cyA+PSA0MDApIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlcS5zdGF0dXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVxLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmVxLm9wZW4oY29uZmlnLm1ldGhvZCwgY29uZmlnLnVybCk7XG4gICAgcmVxLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgY29uZmlnLmNvbnRlbnR0eXBlKTtcbiAgICByZXEuc2VuZChjb25maWcuYW5zd2VyKTtcbn1cblxuZnVuY3Rpb24gcmVxdWVzdEdldCh1cmwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHJlcUdldCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgcmVxR2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIGlmIChyZXFHZXQuc3RhdHVzID49IDQwMCkge1xuICAgICAgICAgICAgY2FsbGJhY2socmVxR2V0LnN0YXR1cyk7XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjayhudWxsLCByZXFHZXQucmVzcG9uc2VUZXh0KTtcblxuICAgIH0pO1xuXG4gICAgcmVxR2V0Lm9wZW4oXCJHRVRcIiwgdXJsKTtcbiAgICByZXFHZXQuc2VuZCgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICByZXF1ZXN0OiByZXF1ZXN0LFxuICAgIHJlcXVlc3RHZXQ6IHJlcXVlc3RHZXRcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qXG4gQGF1dGhvciAtIExva2UgQ2FybHNzb25cbiAqL1xuXG52YXIgcXVpeiA9IHJlcXVpcmUoXCIuL3F1aXpcIik7XG52YXIgYWpheCA9IHJlcXVpcmUoXCIuL2FqYXhcIik7XG52YXIgdGltZXIgPSByZXF1aXJlKFwiLi90aW1lclwiKTtcbnZhciBoaWdoc2NvcmUgPSByZXF1aXJlKFwiLi9oaWdoc2NvcmVcIik7XG52YXIgc3VibWl0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdWJtaXRcIik7XG52YXIgc3RhcnRRdWl6ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGFydFF1aXpcIik7XG52YXIgdGltZXJEaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RpbWVyXCIpO1xudmFyIG5hbWVCb3ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLm5hbWVCb3hcIik7XG5cbi8vaHR0cDovL3Zob3N0My5sbnUuc2U6MjAwODAvcXVlc3Rpb24vMVxuLy9cImh0dHA6Ly9vc2thcmVtaWxzc29uLnNlOjQwMDQvcXVlc3Rpb24vMVwiXG52YXIgZGVmYXVsdFVSTCA9IFwiaHR0cDovL29za2FyZW1pbHNzb24uc2U6NDAwNC9xdWVzdGlvbi8xXCI7XG52YXIgdXJsUSA9IHVybFEgfHwgZGVmYXVsdFVSTDtcbnZhciB1cmxBO1xudmFyIHJlcXVlc3RJZDtcbnZhciBpID0gMTtcblxuLy9DbGVhbiB1cCBzb21lIHRoaW5ncyBmb3IgYSBuZXcgZ2FtZVxudmFyIGNsZWFuVXAgPSBmdW5jdGlvbigpIHtcbiAgICBzdGFydFF1aXouY2xhc3NMaXN0LnRvZ2dsZShcImhpZGRlblwiKTtcbiAgICBzdGFydFF1aXouY2xhc3NMaXN0LnRvZ2dsZShcInZpc2libGVcIik7XG4gICAgc3VibWl0LmNsYXNzTGlzdC50b2dnbGUoXCJ2aXNpYmxlXCIpO1xuICAgIHN1Ym1pdC5jbGFzc0xpc3QudG9nZ2xlKFwiaGlkZGVuXCIpO1xuICAgIHRpbWVyRGl2LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgdXJsUSA9IGRlZmF1bHRVUkw7XG4gICAgdXJsQSA9IFwiXCI7XG59O1xuXG4vL0NhbGxzIHNvbWUgZnVuY3Rpb25zIHdoZW4gZ2FtZSBpcyBvdmVyXG52YXIgZ2FtZU92ZXIgPSBmdW5jdGlvbigpIHtcbiAgICBjbGVhblVwKCk7XG4gICAgcXVpei5jbGVhbigpO1xuICAgIHRpbWVyLnN0b3AoKTtcbiAgICBoaWdoc2NvcmUuZ2V0TG9jYWwobmFtZUJveC52YWx1ZSk7XG4gICAgaGlnaHNjb3JlLmRpc3BsYXkobmFtZUJveC52YWx1ZSk7XG4gICAgaGlnaHNjb3JlLnNhdmVUb0xvY2FsKG5hbWVCb3gudmFsdWUpO1xuICAgIHRpbWVyLmNsZWFuKCk7XG4gICAgcXVpei5nYW1lT3ZlcigpO1xufTtcblxuLy9HRVQgcmVxdWVzdCB0byB0aGUgc2VydmVyXG52YXIgZ2V0UmVxID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHVybFEpIHtcbiAgICAgICAgYWpheC5yZXF1ZXN0R2V0KHVybFEsIGZ1bmN0aW9uKGVycm9yLCByZXNwb25zZSkge1xuICAgICAgICAgICAgdmFyIGFsdHMgPSBKU09OLnBhcnNlKHJlc3BvbnNlKS5hbHRlcm5hdGl2ZXM7XG4gICAgICAgICAgICB2YXIgcXVlc3RzID0gSlNPTi5wYXJzZShyZXNwb25zZSkucXVlc3Rpb247XG4gICAgICAgICAgICByZXF1ZXN0SWQgPSBKU09OLnBhcnNlKHJlc3BvbnNlKS5pZDtcbiAgICAgICAgICAgIHF1aXouY3JlYXRlVGVtcGxhdGUoaSwgcXVlc3RzLCBhbHRzKTtcbiAgICAgICAgICAgIHVybEEgPSBKU09OLnBhcnNlKHJlc3BvbnNlKS5uZXh0VVJMO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG4vL1N0YXJ0cyB0aGUgcXVpelxuc3RhcnRRdWl6LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5uYW1lQm94XCIpLnZhbHVlKSB7XG4gICAgICAgIHF1aXouY2xlYW4oKTtcbiAgICAgICAgY2xlYW5VcCgpO1xuICAgICAgICBnZXRSZXEoKTtcbiAgICAgICAgdGltZXJEaXYuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcbiAgICAgICAgdGltZXIuc3RvcCgpO1xuICAgICAgICB0aW1lci5zdGFydChmdW5jdGlvbigpIHtcbiAgICAgICAgLy9DYWxsYmFjayBmdW5jdGlvbiB3aGVuIHRpbWUgcnVucyBvdXRcbiAgICAgICAgZ2FtZU92ZXIoKTtcbiAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBuYW1lQm94LmNsYXNzTGlzdC5yZW1vdmUoXCJncmVlblwiKTtcbiAgICAgICAgbmFtZUJveC5jbGFzc0xpc3QuYWRkKFwicmVkXCIpO1xuICAgIH1cbn0pO1xuXG5uYW1lQm94LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBmdW5jdGlvbigpIHtcbiAgICBuYW1lQm94LmNsYXNzTGlzdC5yZW1vdmUoXCJyZWRcIik7XG4gICAgbmFtZUJveC5jbGFzc0xpc3QuYWRkKFwiZ3JlZW5cIik7XG59KTtcblxuLy9Qb3N0cyB0aGUgYW5zd2VyIHRvIHRoZSBzZXJ2ZXJcbnN1Ym1pdC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgdmFyIGpzb25PYmogPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGFuc3dlcjogcXVpei5hbnN3ZXIoaSlcbiAgICB9KTtcblxuICAgIGFqYXgucmVxdWVzdCh7bWV0aG9kOiBcIlBPU1RcIiwgdXJsOiB1cmxBLCBhbnN3ZXI6IGpzb25PYmp9LCBmdW5jdGlvbihlcnJvciwgcmVzcG9uc2UpIHtcbiAgICAgICAgcXVpei5jbGVhbigpO1xuXG4gICAgICAgIGlmICgoZXJyb3IgPT09IG51bGwgfHwgZXJyb3IgPCA0MDApICYmIEpTT04ucGFyc2UocmVzcG9uc2UpLm5leHRVUkwpIHtcbiAgICAgICAgICAgIHVybFEgPSBKU09OLnBhcnNlKHJlc3BvbnNlKS5uZXh0VVJMO1xuICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgZ2V0UmVxKCk7XG4gICAgICAgICAgICB0aW1lckRpdi5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xuICAgICAgICAgICAgdGltZXIuc3RvcCgpO1xuICAgICAgICAgICAgdGltZXIuc3RhcnQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgLy9DYWxsYmFjayBmdW5jdGlvbiB3aGVuIHRpbWUgcnVucyBvdXRcbiAgICAgICAgICAgICAgICBnYW1lT3ZlcigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBnYW1lT3ZlcigpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbn0pO1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHRpbWVyID0gcmVxdWlyZShcIi4vdGltZXJcIik7XG52YXIgb2JqVG9TYXZlID0gW107XG52YXIgb2JqRmV0Y2hlZCA9IFtdO1xuXG52YXIgdGVtcFRpbWUgPSAzLjUzO1xuXG5mdW5jdGlvbiBkaXNwbGF5KHBsYXllcikge1xufVxuXG5mdW5jdGlvbiBnZXRMb2NhbChwbGF5ZXIpIHtcbiAgICAvL2xvY2FsU3RvcmFnZS5zZXRJdGVtKHBsYXllciwgb2JqUGFyc2VkKTtcbn1cblxuZnVuY3Rpb24gc29ydChvYmopIHtcbiAgICB2YXIgYXJyID0gW107XG4gICAgdmFyIHByb3A7XG4gICAgZm9yIChwcm9wIGluIG9iaikge1xuICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgICBhcnIucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGtleTogcHJvcCxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG9ialtwcm9wXVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXJyLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgICAgcmV0dXJuIGEudmFsdWUgLSBiLnZhbHVlO1xuICAgICAgICB9KTtcblxuICAgIHJldHVybiBhcnI7IC8vIHJldHVybnMgYXJyYXlcblxufVxuXG5mdW5jdGlvbiBzYXZlVG9Mb2NhbChwbGF5ZXIpIHtcbiAgICB2YXIgb2JqVG9QdXNoID0ge307XG4gICAgdmFyIGhpZ2hTY29yZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiaGlnaFNjb3JlXCIpO1xuXG4gICAgb2JqVG9QdXNoW3BsYXllcl0gPSB0aW1lci5kaXNwbGF5KCk7XG4gICAgY29uc29sZS5sb2codGltZXIuZGlzcGxheSgpKTtcblxuICAgIG9iakZldGNoZWQgPSBKU09OLnBhcnNlKGhpZ2hTY29yZSk7XG5cbiAgICBpZiAoaGlnaFNjb3JlKSB7XG4gICAgICAgIGlmIChvYmpGZXRjaGVkLmxlbmd0aCA8IDUgJiYgb2JqRmV0Y2hlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBvYmpUb1NhdmUgPSBvYmpGZXRjaGVkO1xuICAgICAgICAgICAgb2JqVG9TYXZlLnB1c2gob2JqVG9QdXNoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG9iakZldGNoZWQubGVuZ3RoKTtcbiAgICAgICAgfSBlbHNlIGlmIChoaWdoU2NvcmUubGVuZ3RoID49IDUpIHtcbiAgICAgICAgICAgIGlmICh0aW1lci5kaXNwbGF5KCkgPiBvYmpGZXRjaGVkWzRdKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNvcnQob2JqVG9TYXZlKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhvYmpGZXRjaGVkLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBvYmpUb1NhdmUucHVzaChvYmpUb1B1c2gpO1xuICAgIH1cblxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiaGlnaFNjb3JlXCIsIEpTT04uc3RyaW5naWZ5KG9ialRvU2F2ZSkpO1xuXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGRpc3BsYXk6IGRpc3BsYXksXG4gICAgZ2V0TG9jYWw6IGdldExvY2FsLFxuICAgIHNhdmVUb0xvY2FsOiBzYXZlVG9Mb2NhbFxufTtcblxuLy9sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnbXlPYmplY3QnLCBKU09OLnN0cmluZ2lmeShteU9iamVjdCkpO1xuLy9cbi8vbXlPYmplY3QgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdteU9iamVjdCcpKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgdGVtcGxhdGUgPSBmdW5jdGlvbihxdWVzdCkge1xuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGVcIiArIHF1ZXN0KTtcbiAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5hcmVhXCIpLmFwcGVuZENoaWxkKG5vZGUpO1xufTtcblxudmFyIGNsZWFuID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5hcmVhXCIpO1xuICAgIHdoaWxlIChlbC5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICAgICAgZWwucmVtb3ZlQ2hpbGQoZWwubGFzdENoaWxkKTtcbiAgICB9XG59O1xuXG52YXIgZ2FtZU92ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2VuZFRlbXBsYXRlXCIpO1xuICAgIHZhciBub2RlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmFyZWFcIikuYXBwZW5kQ2hpbGQobm9kZSk7XG59O1xuXG52YXIgYW5zd2VyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFuc3dlclRleHQ7XG4gICAgdmFyIHJhZGlvcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKFwicmFkaW9cIik7XG4gICAgdmFyIHZhbHVlO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgcmFkaW9zLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgIGlmIChyYWRpb3Nbal0uY2hlY2tlZCkge1xuICAgICAgICAgICAgdmFsdWUgPSByYWRpb3Nbal0udmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5pbnB1dEJveFwiKSkge1xuICAgICAgICBhbnN3ZXJUZXh0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5pbnB1dEJveFwiKS52YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBhbnN3ZXJUZXh0ID0gdmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFuc3dlclRleHQ7XG5cbn07XG5cbnZhciBnZW5SYWRpbyA9IGZ1bmN0aW9uKGFsdGVybmF0aXZlcykge1xuICAgIHZhciBhbHRzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYWx0ZXJuYXRpdmVzKTtcbiAgICB2YXIgbnVtQWx0ID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYWx0ZXJuYXRpdmVzKS5sZW5ndGg7XG4gICAgdmFyIGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBudW1BbHQ7IGogKz0gMSkge1xuICAgICAgICB2YXIgcmFkaW8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gICAgICAgIHZhciBhbHRUZXh0ID0gYWx0c1tqXTtcbiAgICAgICAgdmFyIGFsdCA9IGFsdGVybmF0aXZlc1thbHRUZXh0XTtcbiAgICAgICAgdmFyIHRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShhbHQpO1xuICAgICAgICByYWRpby50aXRsZSA9IChqICsgMSk7XG4gICAgICAgIHJhZGlvLnR5cGUgPSBcInJhZGlvXCI7XG4gICAgICAgIHJhZGlvLm5hbWUgPSBcInJhZGlvXCI7XG4gICAgICAgIHJhZGlvLnZhbHVlID0gYWx0c1tqXTtcbiAgICAgICAgZnJhZy5hcHBlbmRDaGlsZChyYWRpbyk7XG4gICAgICAgIGZyYWcuYXBwZW5kQ2hpbGQodGV4dCk7XG4gICAgICAgIGZyYWcuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJyXCIpKTtcbiAgICAgICAgcmFkaW8uY2xhc3NMaXN0LmFkZChcInJhZGlvXCIpO1xuICAgIH1cblxuICAgIHJldHVybiBmcmFnO1xufTtcblxudmFyIGdlbklucHV0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGlucHV0Qm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuICAgIGlucHV0Qm94LnR5cGUgPSBcInRleHRcIjtcbiAgICBpbnB1dEJveC5wbGFjZWhvbGRlciA9IFwiWW91ciBhbnN3ZXIgaGVyZS4uXCI7XG4gICAgaW5wdXRCb3guY2xhc3NMaXN0LmFkZChcImlucHV0Qm94XCIpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuaW5wdXREaXZcIikuYXBwZW5kQ2hpbGQoaW5wdXRCb3gpO1xuICAgIGlucHV0Qm94LmZvY3VzKCk7XG59O1xuXG52YXIgY3JlYXRlVGVtcGxhdGUgPSBmdW5jdGlvbihpLCBxdWVzdGlvbiwgYWx0ZXJuYXRpdmVzKSB7XG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZVwiKTtcbiAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5hcmVhXCIpLmFwcGVuZENoaWxkKG5vZGUpO1xuXG4gICAgdmFyIHRpdGxlTnIgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShpKTtcbiAgICB2YXIgcXVlc3Rpb25Ob2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUocXVlc3Rpb24pO1xuICAgIHZhciB0ZXh0Q2xhc3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnRleHRcIik7XG5cbiAgICB0ZXh0Q2xhc3MuYXBwZW5kQ2hpbGQocXVlc3Rpb25Ob2RlKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnRpdGxlXCIpLmFwcGVuZENoaWxkKHRpdGxlTnIpO1xuXG4gICAgaWYgKGFsdGVybmF0aXZlcykge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnJhZGlvRGl2XCIpLmFwcGVuZENoaWxkKGdlblJhZGlvKGFsdGVybmF0aXZlcykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGdlbklucHV0KCk7XG4gICAgfVxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0ZW1wbGF0ZTp0ZW1wbGF0ZSxcbiAgICBjbGVhbjpjbGVhbixcbiAgICBnYW1lT3ZlcjpnYW1lT3ZlcixcbiAgICBhbnN3ZXI6YW5zd2VyLFxuICAgIGNyZWF0ZVRlbXBsYXRlOmNyZWF0ZVRlbXBsYXRlXG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB0O1xudmFyIGRlZmF1bHRUaW1lID0gMjA7XG52YXIgc2Vjb25kcyA9IGRlZmF1bHRUaW1lO1xudmFyIHN0YXJ0VGltZSA9IDA7XG52YXIgZW5kVGltZSA9IDA7XG52YXIgdG90YWxUaW1lID0gMDtcbnZhciBzYXZlZFRpbWUgPSAwO1xuXG5mdW5jdGlvbiBnZXREYXRlKCkge1xuICAgIHZhciBkID0gbmV3IERhdGUoKTtcbiAgICByZXR1cm4gZC5nZXRUaW1lKCk7XG59XG5cbmZ1bmN0aW9uIHN0YXJ0KGNhbGxiYWNrKSB7XG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGltZXJcIik7XG4gICAgdCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWNvbmRzIC09IDAuMTtcbiAgICAgICAgZGl2LnRleHRDb250ZW50ID0gc2Vjb25kcy50b0ZpeGVkKDApO1xuICAgICAgICBpZiAoc2Vjb25kcyA8PSAwKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgfSwgMTAwKTtcblxuICAgIHN0YXJ0VGltZSA9IGdldERhdGUoKTtcbn1cblxuZnVuY3Rpb24gc3RvcCgpIHtcbiAgICBlbmRUaW1lID0gZ2V0RGF0ZSgpO1xuICAgIHNhdmVkVGltZSA9IChlbmRUaW1lIC0gc3RhcnRUaW1lKSAvIDEwMDA7XG4gICAgaWYgKHNhdmVkVGltZSA8PSBkZWZhdWx0VGltZSkge1xuICAgICAgICB0b3RhbFRpbWUgKz0gc2F2ZWRUaW1lO1xuICAgICAgICBjb25zb2xlLmxvZyhcInNhdmVkIFwiICsgc2F2ZWRUaW1lKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJ0b3RhbCBcIiArIHRvdGFsVGltZSk7XG4gICAgfVxuXG4gICAgY2xlYXJJbnRlcnZhbCh0KTtcbiAgICBzZWNvbmRzID0gZGVmYXVsdFRpbWU7XG59XG5cbmZ1bmN0aW9uIGNsZWFuKCkge1xuICAgIHN0YXJ0VGltZSA9IDA7XG4gICAgZW5kVGltZSA9IDA7XG4gICAgdG90YWxUaW1lID0gMDtcbiAgICBzYXZlZFRpbWUgPSAwO1xufVxuXG5mdW5jdGlvbiBkaXNwbGF5KCkge1xuICAgIHJldHVybiB0b3RhbFRpbWUudG9GaXhlZCgzKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc3RhcnQ6IHN0YXJ0LFxuICAgIHN0b3A6IHN0b3AsXG4gICAgZGlzcGxheTogZGlzcGxheSxcbiAgICBjbGVhbjogY2xlYW5cbn07XG4iXX0=
