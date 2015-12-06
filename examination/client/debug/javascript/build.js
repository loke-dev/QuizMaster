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
var submit = document.querySelector("#submit");
var startQuiz = document.querySelector("#startQuiz");
var timerDiv = document.querySelector("#timer");
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
    quiz.clean();
    cleanUp();
    getReq();
    timerDiv.classList.remove("hidden");
    timer.stop();
    timer.start(function() {
        //Callback function when time runs out
        gameOver();
    });
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


},{"./ajax":1,"./quiz":3,"./timer":4}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMS4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYWpheC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9xdWl6LmpzIiwiY2xpZW50L3NvdXJjZS9qcy90aW1lci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcbi8qKlxuICogVGhpcyBjYWxsYmFjayBmdW5jdGlvbiBzZW5kcyByZXF1ZXN0IHRvIHRoZSBkYXRhYmFzZVxuICogQHBhcmFtIGNvbmZpZ1xuICogQHBhcmFtIGNhbGxiYWNrXG4gKi9cbmZ1bmN0aW9uIHJlcXVlc3QoY29uZmlnLCBjYWxsYmFjaykge1xuXG4gICAgY29uZmlnLnVybCA9IGNvbmZpZy51cmwgfHwgXCJcIjtcbiAgICBjb25maWcubWV0aG9kID0gY29uZmlnLm1ldGhvZCB8fCBcInBvc3RcIjtcbiAgICBjb25maWcuY29udGVudHR5cGUgPSBjb25maWcuY29udGVudHR5cGUgfHwgXCJhcHBsaWNhdGlvbi9qc29uXCI7XG4gICAgY29uZmlnLmFuc3dlciA9IGNvbmZpZy5hbnN3ZXIgfHwgbnVsbDtcblxuICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIHJlcS5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbigpIHtcblxuICAgICAgICBpZiAocmVxLnN0YXR1cyA+PSA0MDApIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlcS5zdGF0dXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVxLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmVxLm9wZW4oY29uZmlnLm1ldGhvZCwgY29uZmlnLnVybCk7XG4gICAgcmVxLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgY29uZmlnLmNvbnRlbnR0eXBlKTtcbiAgICByZXEuc2VuZChjb25maWcuYW5zd2VyKTtcbn1cblxuZnVuY3Rpb24gcmVxdWVzdEdldCh1cmwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHJlcUdldCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgcmVxR2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIGlmIChyZXFHZXQuc3RhdHVzID49IDQwMCkge1xuICAgICAgICAgICAgY2FsbGJhY2socmVxR2V0LnN0YXR1cyk7XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjayhudWxsLCByZXFHZXQucmVzcG9uc2VUZXh0KTtcblxuICAgIH0pO1xuXG4gICAgcmVxR2V0Lm9wZW4oXCJHRVRcIiwgdXJsKTtcbiAgICByZXFHZXQuc2VuZCgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICByZXF1ZXN0OiByZXF1ZXN0LFxuICAgIHJlcXVlc3RHZXQ6IHJlcXVlc3RHZXRcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qXG4gQGF1dGhvciAtIExva2UgQ2FybHNzb25cbiAqL1xuXG52YXIgcXVpeiA9IHJlcXVpcmUoXCIuL3F1aXpcIik7XG52YXIgYWpheCA9IHJlcXVpcmUoXCIuL2FqYXhcIik7XG52YXIgdGltZXIgPSByZXF1aXJlKFwiLi90aW1lclwiKTtcbnZhciBzdWJtaXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N1Ym1pdFwiKTtcbnZhciBzdGFydFF1aXogPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0UXVpelwiKTtcbnZhciB0aW1lckRpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGltZXJcIik7XG52YXIgZGVmYXVsdFVSTCA9IFwiaHR0cDovL29za2FyZW1pbHNzb24uc2U6NDAwNC9xdWVzdGlvbi8xXCI7XG52YXIgdXJsUSA9IHVybFEgfHwgZGVmYXVsdFVSTDtcbnZhciB1cmxBO1xudmFyIHJlcXVlc3RJZDtcbnZhciBpID0gMTtcblxuLy9DbGVhbiB1cCBzb21lIHRoaW5ncyBmb3IgYSBuZXcgZ2FtZVxudmFyIGNsZWFuVXAgPSBmdW5jdGlvbigpIHtcbiAgICBzdGFydFF1aXouY2xhc3NMaXN0LnRvZ2dsZShcImhpZGRlblwiKTtcbiAgICBzdGFydFF1aXouY2xhc3NMaXN0LnRvZ2dsZShcInZpc2libGVcIik7XG4gICAgc3VibWl0LmNsYXNzTGlzdC50b2dnbGUoXCJ2aXNpYmxlXCIpO1xuICAgIHN1Ym1pdC5jbGFzc0xpc3QudG9nZ2xlKFwiaGlkZGVuXCIpO1xuICAgIHRpbWVyRGl2LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgdXJsUSA9IGRlZmF1bHRVUkw7XG4gICAgdXJsQSA9IFwiXCI7XG59O1xuXG4vL0NhbGxzIHNvbWUgZnVuY3Rpb25zIHdoZW4gZ2FtZSBpcyBvdmVyXG52YXIgZ2FtZU92ZXIgPSBmdW5jdGlvbigpIHtcbiAgICBjbGVhblVwKCk7XG4gICAgcXVpei5jbGVhbigpO1xuICAgIHRpbWVyLnN0b3AoKTtcbiAgICBxdWl6LmdhbWVPdmVyKCk7XG59O1xuXG4vL0dFVCByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXJcbnZhciBnZXRSZXEgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodXJsUSkge1xuICAgICAgICBhamF4LnJlcXVlc3RHZXQodXJsUSwgZnVuY3Rpb24oZXJyb3IsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB2YXIgYWx0cyA9IEpTT04ucGFyc2UocmVzcG9uc2UpLmFsdGVybmF0aXZlcztcbiAgICAgICAgICAgIHZhciBxdWVzdHMgPSBKU09OLnBhcnNlKHJlc3BvbnNlKS5xdWVzdGlvbjtcbiAgICAgICAgICAgIHJlcXVlc3RJZCA9IEpTT04ucGFyc2UocmVzcG9uc2UpLmlkO1xuICAgICAgICAgICAgcXVpei5jcmVhdGVUZW1wbGF0ZShpLCBxdWVzdHMsIGFsdHMpO1xuICAgICAgICAgICAgdXJsQSA9IEpTT04ucGFyc2UocmVzcG9uc2UpLm5leHRVUkw7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbi8vU3RhcnRzIHRoZSBxdWl6XG5zdGFydFF1aXouYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgIHF1aXouY2xlYW4oKTtcbiAgICBjbGVhblVwKCk7XG4gICAgZ2V0UmVxKCk7XG4gICAgdGltZXJEaXYuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcbiAgICB0aW1lci5zdG9wKCk7XG4gICAgdGltZXIuc3RhcnQoZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vQ2FsbGJhY2sgZnVuY3Rpb24gd2hlbiB0aW1lIHJ1bnMgb3V0XG4gICAgICAgIGdhbWVPdmVyKCk7XG4gICAgfSk7XG59KTtcblxuLy9Qb3N0cyB0aGUgYW5zd2VyIHRvIHRoZSBzZXJ2ZXJcbnN1Ym1pdC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgdmFyIGpzb25PYmogPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGFuc3dlcjogcXVpei5hbnN3ZXIoaSlcbiAgICB9KTtcblxuICAgIGFqYXgucmVxdWVzdCh7bWV0aG9kOiBcIlBPU1RcIiwgdXJsOiB1cmxBLCBhbnN3ZXI6IGpzb25PYmp9LCBmdW5jdGlvbihlcnJvciwgcmVzcG9uc2UpIHtcbiAgICAgICAgcXVpei5jbGVhbigpO1xuXG4gICAgICAgIGlmICgoZXJyb3IgPT09IG51bGwgfHwgZXJyb3IgPCA0MDApICYmIEpTT04ucGFyc2UocmVzcG9uc2UpLm5leHRVUkwpIHtcbiAgICAgICAgICAgIHVybFEgPSBKU09OLnBhcnNlKHJlc3BvbnNlKS5uZXh0VVJMO1xuICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgZ2V0UmVxKCk7XG4gICAgICAgICAgICB0aW1lckRpdi5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xuICAgICAgICAgICAgdGltZXIuc3RvcCgpO1xuICAgICAgICAgICAgdGltZXIuc3RhcnQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgLy9DYWxsYmFjayBmdW5jdGlvbiB3aGVuIHRpbWUgcnVucyBvdXRcbiAgICAgICAgICAgICAgICBnYW1lT3ZlcigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBnYW1lT3ZlcigpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbn0pO1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHRlbXBsYXRlID0gZnVuY3Rpb24ocXVlc3QpIHtcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlXCIgKyBxdWVzdCk7XG4gICAgdmFyIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYXJlYVwiKS5hcHBlbmRDaGlsZChub2RlKTtcbn07XG5cbnZhciBjbGVhbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYXJlYVwiKTtcbiAgICB3aGlsZSAoZWwuaGFzQ2hpbGROb2RlcygpKSB7XG4gICAgICAgIGVsLnJlbW92ZUNoaWxkKGVsLmxhc3RDaGlsZCk7XG4gICAgfVxufTtcblxudmFyIGdhbWVPdmVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNlbmRUZW1wbGF0ZVwiKTtcbiAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5hcmVhXCIpLmFwcGVuZENoaWxkKG5vZGUpO1xufTtcblxudmFyIGFuc3dlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhbnN3ZXJUZXh0O1xuICAgIHZhciByYWRpb3MgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5TmFtZShcInJhZGlvXCIpO1xuICAgIHZhciB2YWx1ZTtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJhZGlvcy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICBpZiAocmFkaW9zW2pdLmNoZWNrZWQpIHtcbiAgICAgICAgICAgIHZhbHVlID0gcmFkaW9zW2pdLnZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuaW5wdXRCb3hcIikpIHtcbiAgICAgICAgYW5zd2VyVGV4dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuaW5wdXRCb3hcIikudmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYW5zd2VyVGV4dCA9IHZhbHVlO1xuICAgIH1cblxuICAgIHJldHVybiBhbnN3ZXJUZXh0O1xuXG59O1xuXG52YXIgZ2VuUmFkaW8gPSBmdW5jdGlvbihhbHRlcm5hdGl2ZXMpIHtcbiAgICB2YXIgYWx0cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGFsdGVybmF0aXZlcyk7XG4gICAgdmFyIG51bUFsdCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGFsdGVybmF0aXZlcykubGVuZ3RoO1xuICAgIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgbnVtQWx0OyBqICs9IDEpIHtcbiAgICAgICAgdmFyIHJhZGlvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuICAgICAgICB2YXIgYWx0VGV4dCA9IGFsdHNbal07XG4gICAgICAgIHZhciBhbHQgPSBhbHRlcm5hdGl2ZXNbYWx0VGV4dF07XG4gICAgICAgIHZhciB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYWx0KTtcbiAgICAgICAgcmFkaW8udGl0bGUgPSAoaiArIDEpO1xuICAgICAgICByYWRpby50eXBlID0gXCJyYWRpb1wiO1xuICAgICAgICByYWRpby5uYW1lID0gXCJyYWRpb1wiO1xuICAgICAgICByYWRpby52YWx1ZSA9IGFsdHNbal07XG4gICAgICAgIGZyYWcuYXBwZW5kQ2hpbGQocmFkaW8pO1xuICAgICAgICBmcmFnLmFwcGVuZENoaWxkKHRleHQpO1xuICAgICAgICBmcmFnLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJiclwiKSk7XG4gICAgICAgIHJhZGlvLmNsYXNzTGlzdC5hZGQoXCJyYWRpb1wiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnJhZztcbn07XG5cbnZhciBnZW5JbnB1dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpbnB1dEJveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcbiAgICBpbnB1dEJveC50eXBlID0gXCJ0ZXh0XCI7XG4gICAgaW5wdXRCb3gucGxhY2Vob2xkZXIgPSBcIllvdXIgYW5zd2VyIGhlcmUuLlwiO1xuICAgIGlucHV0Qm94LmNsYXNzTGlzdC5hZGQoXCJpbnB1dEJveFwiKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmlucHV0RGl2XCIpLmFwcGVuZENoaWxkKGlucHV0Qm94KTtcbn07XG5cbnZhciBjcmVhdGVUZW1wbGF0ZSA9IGZ1bmN0aW9uKGksIHF1ZXN0aW9uLCBhbHRlcm5hdGl2ZXMpIHtcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlXCIpO1xuICAgIHZhciBub2RlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmFyZWFcIikuYXBwZW5kQ2hpbGQobm9kZSk7XG5cbiAgICB2YXIgdGl0bGVOciA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGkpO1xuICAgIHZhciBxdWVzdGlvbk5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShxdWVzdGlvbik7XG4gICAgdmFyIHRleHRDbGFzcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV4dFwiKTtcblxuICAgIHRleHRDbGFzcy5hcHBlbmRDaGlsZChxdWVzdGlvbk5vZGUpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGl0bGVcIikuYXBwZW5kQ2hpbGQodGl0bGVOcik7XG5cbiAgICBpZiAoYWx0ZXJuYXRpdmVzKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucmFkaW9EaXZcIikuYXBwZW5kQ2hpbGQoZ2VuUmFkaW8oYWx0ZXJuYXRpdmVzKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZ2VuSW5wdXQoKTtcbiAgICB9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHRlbXBsYXRlOnRlbXBsYXRlLFxuICAgIGNsZWFuOmNsZWFuLFxuICAgIGdhbWVPdmVyOmdhbWVPdmVyLFxuICAgIGFuc3dlcjphbnN3ZXIsXG4gICAgY3JlYXRlVGVtcGxhdGU6Y3JlYXRlVGVtcGxhdGVcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHQ7XG52YXIgZGVmYXVsdFRpbWUgPSAyMDtcbnZhciBzZWNvbmRzID0gZGVmYXVsdFRpbWU7XG52YXIgc3RhcnRUaW1lID0gMDtcbnZhciBlbmRUaW1lID0gMDtcbnZhciB0b3RhbFRpbWUgPSAwO1xudmFyIHNhdmVkVGltZSA9IDA7XG5cbmZ1bmN0aW9uIGdldERhdGUoKSB7XG4gICAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICAgIHJldHVybiBkLmdldFRpbWUoKTtcbn1cblxuZnVuY3Rpb24gc3RhcnQoY2FsbGJhY2spIHtcbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0aW1lclwiKTtcbiAgICB0ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlY29uZHMgLT0gMC4xO1xuICAgICAgICBkaXYudGV4dENvbnRlbnQgPSBzZWNvbmRzLnRvRml4ZWQoMSk7XG4gICAgICAgIGlmIChzZWNvbmRzIDw9IDApIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICB9LCAxMDApO1xuXG4gICAgc3RhcnRUaW1lID0gZ2V0RGF0ZSgpO1xufVxuXG5mdW5jdGlvbiBzdG9wKCkge1xuICAgIGVuZFRpbWUgPSBnZXREYXRlKCk7XG4gICAgc2F2ZWRUaW1lID0gKGVuZFRpbWUgLSBzdGFydFRpbWUpIC8gMTAwMDtcbiAgICBpZiAoc2F2ZWRUaW1lIDw9IGRlZmF1bHRUaW1lKSB7XG4gICAgICAgIHRvdGFsVGltZSArPSBzYXZlZFRpbWU7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic2F2ZWQgXCIgKyBzYXZlZFRpbWUpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInRvdGFsIFwiICsgdG90YWxUaW1lKTtcbiAgICB9XG5cbiAgICBjbGVhckludGVydmFsKHQpO1xuICAgIHNlY29uZHMgPSBkZWZhdWx0VGltZTtcbn1cblxuZnVuY3Rpb24gZGlzcGxheSgpIHtcbiAgICB2YXIgdGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRvdGFsVGltZS50b0ZpeGVkKDMpKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmhpZ2hTY29yZVwiKS5hcHBlbmRDaGlsZCh0ZXh0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc3RhcnQ6IHN0YXJ0LFxuICAgIHN0b3A6IHN0b3Bcbn07XG4iXX0=
