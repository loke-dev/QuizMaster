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

quiz.start();

var cleanUp = function() {
    startQuiz.classList.toggle("hidden");
    startQuiz.classList.toggle("visible");
    submit.classList.toggle("visible");
    submit.classList.toggle("hidden");
    timerDiv.classList.toggle("visible");
    timerDiv.classList.toggle("hidden");
    urlQ = defaultURL;
    urlA = "";
};

var gameOver = function() {
    cleanUp();
    quiz.clean();
    timer.stop();
    quiz.gameOver();
};

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

startQuiz.addEventListener("click", function() {
    quiz.clean();
    cleanUp();
    getReq();
    timer.stop();
    timer.start(function() {
        //Callback function when time runs out
        gameOver();
    });
});

submit.addEventListener("click", function() {
    var jsonObj = JSON.stringify({
        answer: quiz.answer(i)
    });

    ajax.request({method: "POST", url: urlA, answer: jsonObj}, function(error, response) {
        quiz.clean();
        if (error === null || error < 400) {
            urlQ = JSON.parse(response).nextURL;
            i += 1;
            getReq();
            timer.stop();
            timer.start();
        } else if (error >= 400) {
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

var start = function() {
    var template = document.querySelector("#startTemplate");
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

        document.querySelector(".radioDiv").appendChild(frag);

    } else {
        var inputBox = document.createElement("input");
        inputBox.type = "text";
        inputBox.placeholder = "Your answer here..";
        inputBox.classList.add("inputBox");
        document.querySelector(".inputDiv").appendChild(inputBox);
    }

};

module.exports = {
    template:template,
    start:start,
    clean:clean,
    gameOver:gameOver,
    answer:answer,
    createTemplate:createTemplate
};

},{}],4:[function(require,module,exports){
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

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMS4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYWpheC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9xdWl6LmpzIiwiY2xpZW50L3NvdXJjZS9qcy90aW1lci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcbi8qKlxuICogVGhpcyBjYWxsYmFjayBmdW5jdGlvbiBzZW5kcyByZXF1ZXN0IHRvIHRoZSBkYXRhYmFzZVxuICogQHBhcmFtIGNvbmZpZ1xuICogQHBhcmFtIGNhbGxiYWNrXG4gKi9cbmZ1bmN0aW9uIHJlcXVlc3QoY29uZmlnLCBjYWxsYmFjaykge1xuXG4gICAgY29uZmlnLnVybCA9IGNvbmZpZy51cmwgfHwgXCJcIjtcbiAgICBjb25maWcubWV0aG9kID0gY29uZmlnLm1ldGhvZCB8fCBcInBvc3RcIjtcbiAgICBjb25maWcuY29udGVudHR5cGUgPSBjb25maWcuY29udGVudHR5cGUgfHwgXCJhcHBsaWNhdGlvbi9qc29uXCI7XG4gICAgY29uZmlnLmFuc3dlciA9IGNvbmZpZy5hbnN3ZXIgfHwgbnVsbDtcblxuICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIHJlcS5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbigpIHtcblxuICAgICAgICBpZiAocmVxLnN0YXR1cyA+PSA0MDApIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlcS5zdGF0dXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVxLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmVxLm9wZW4oY29uZmlnLm1ldGhvZCwgY29uZmlnLnVybCk7XG4gICAgcmVxLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgY29uZmlnLmNvbnRlbnR0eXBlKTtcbiAgICByZXEuc2VuZChjb25maWcuYW5zd2VyKTtcbn1cblxuZnVuY3Rpb24gcmVxdWVzdEdldCh1cmwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHJlcUdldCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgcmVxR2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIGlmIChyZXFHZXQuc3RhdHVzID49IDQwMCkge1xuICAgICAgICAgICAgY2FsbGJhY2socmVxR2V0LnN0YXR1cyk7XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjayhudWxsLCByZXFHZXQucmVzcG9uc2VUZXh0KTtcblxuICAgIH0pO1xuXG4gICAgcmVxR2V0Lm9wZW4oXCJHRVRcIiwgdXJsKTtcbiAgICByZXFHZXQuc2VuZCgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICByZXF1ZXN0OiByZXF1ZXN0LFxuICAgIHJlcXVlc3RHZXQ6IHJlcXVlc3RHZXRcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qXG4gQGF1dGhvciAtIExva2UgQ2FybHNzb25cbiAqL1xuXG52YXIgcXVpeiA9IHJlcXVpcmUoXCIuL3F1aXpcIik7XG52YXIgYWpheCA9IHJlcXVpcmUoXCIuL2FqYXhcIik7XG52YXIgdGltZXIgPSByZXF1aXJlKFwiLi90aW1lclwiKTtcbnZhciBzdWJtaXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N1Ym1pdFwiKTtcbnZhciBzdGFydFF1aXogPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0UXVpelwiKTtcbnZhciB0aW1lckRpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGltZXJcIik7XG52YXIgZGVmYXVsdFVSTCA9IFwiaHR0cDovL29za2FyZW1pbHNzb24uc2U6NDAwNC9xdWVzdGlvbi8xXCI7XG52YXIgdXJsUSA9IHVybFEgfHwgZGVmYXVsdFVSTDtcbnZhciB1cmxBO1xudmFyIHJlcXVlc3RJZDtcbnZhciBpID0gMTtcblxucXVpei5zdGFydCgpO1xuXG52YXIgY2xlYW5VcCA9IGZ1bmN0aW9uKCkge1xuICAgIHN0YXJ0UXVpei5jbGFzc0xpc3QudG9nZ2xlKFwiaGlkZGVuXCIpO1xuICAgIHN0YXJ0UXVpei5jbGFzc0xpc3QudG9nZ2xlKFwidmlzaWJsZVwiKTtcbiAgICBzdWJtaXQuY2xhc3NMaXN0LnRvZ2dsZShcInZpc2libGVcIik7XG4gICAgc3VibWl0LmNsYXNzTGlzdC50b2dnbGUoXCJoaWRkZW5cIik7XG4gICAgdGltZXJEaXYuY2xhc3NMaXN0LnRvZ2dsZShcInZpc2libGVcIik7XG4gICAgdGltZXJEaXYuY2xhc3NMaXN0LnRvZ2dsZShcImhpZGRlblwiKTtcbiAgICB1cmxRID0gZGVmYXVsdFVSTDtcbiAgICB1cmxBID0gXCJcIjtcbn07XG5cbnZhciBnYW1lT3ZlciA9IGZ1bmN0aW9uKCkge1xuICAgIGNsZWFuVXAoKTtcbiAgICBxdWl6LmNsZWFuKCk7XG4gICAgdGltZXIuc3RvcCgpO1xuICAgIHF1aXouZ2FtZU92ZXIoKTtcbn07XG5cbnZhciBnZXRSZXEgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodXJsUSkge1xuICAgICAgICBhamF4LnJlcXVlc3RHZXQodXJsUSwgZnVuY3Rpb24oZXJyb3IsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB2YXIgYWx0cyA9IEpTT04ucGFyc2UocmVzcG9uc2UpLmFsdGVybmF0aXZlcztcbiAgICAgICAgICAgIHZhciBxdWVzdHMgPSBKU09OLnBhcnNlKHJlc3BvbnNlKS5xdWVzdGlvbjtcbiAgICAgICAgICAgIHJlcXVlc3RJZCA9IEpTT04ucGFyc2UocmVzcG9uc2UpLmlkO1xuICAgICAgICAgICAgcXVpei5jcmVhdGVUZW1wbGF0ZShpLCBxdWVzdHMsIGFsdHMpO1xuICAgICAgICAgICAgdXJsQSA9IEpTT04ucGFyc2UocmVzcG9uc2UpLm5leHRVUkw7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbnN0YXJ0UXVpei5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgcXVpei5jbGVhbigpO1xuICAgIGNsZWFuVXAoKTtcbiAgICBnZXRSZXEoKTtcbiAgICB0aW1lci5zdG9wKCk7XG4gICAgdGltZXIuc3RhcnQoZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vQ2FsbGJhY2sgZnVuY3Rpb24gd2hlbiB0aW1lIHJ1bnMgb3V0XG4gICAgICAgIGdhbWVPdmVyKCk7XG4gICAgfSk7XG59KTtcblxuc3VibWl0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICB2YXIganNvbk9iaiA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgYW5zd2VyOiBxdWl6LmFuc3dlcihpKVxuICAgIH0pO1xuXG4gICAgYWpheC5yZXF1ZXN0KHttZXRob2Q6IFwiUE9TVFwiLCB1cmw6IHVybEEsIGFuc3dlcjoganNvbk9ian0sIGZ1bmN0aW9uKGVycm9yLCByZXNwb25zZSkge1xuICAgICAgICBxdWl6LmNsZWFuKCk7XG4gICAgICAgIGlmIChlcnJvciA9PT0gbnVsbCB8fCBlcnJvciA8IDQwMCkge1xuICAgICAgICAgICAgdXJsUSA9IEpTT04ucGFyc2UocmVzcG9uc2UpLm5leHRVUkw7XG4gICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICBnZXRSZXEoKTtcbiAgICAgICAgICAgIHRpbWVyLnN0b3AoKTtcbiAgICAgICAgICAgIHRpbWVyLnN0YXJ0KCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZXJyb3IgPj0gNDAwKSB7XG4gICAgICAgICAgICBnYW1lT3ZlcigpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbn0pO1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHRlbXBsYXRlID0gZnVuY3Rpb24ocXVlc3QpIHtcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlXCIgKyBxdWVzdCk7XG4gICAgdmFyIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYXJlYVwiKS5hcHBlbmRDaGlsZChub2RlKTtcbn07XG5cbnZhciBzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhcnRUZW1wbGF0ZVwiKTtcbiAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5hcmVhXCIpLmFwcGVuZENoaWxkKG5vZGUpO1xufTtcblxudmFyIGNsZWFuID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5hcmVhXCIpO1xuICAgIHdoaWxlIChlbC5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICAgICAgZWwucmVtb3ZlQ2hpbGQoZWwubGFzdENoaWxkKTtcbiAgICB9XG59O1xuXG52YXIgZ2FtZU92ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2VuZFRlbXBsYXRlXCIpO1xuICAgIHZhciBub2RlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmFyZWFcIikuYXBwZW5kQ2hpbGQobm9kZSk7XG59O1xuXG52YXIgYW5zd2VyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFuc3dlclRleHQ7XG4gICAgdmFyIHJhZGlvcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKFwicmFkaW9cIik7XG4gICAgdmFyIHZhbHVlO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgcmFkaW9zLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgIGlmIChyYWRpb3Nbal0uY2hlY2tlZCkge1xuICAgICAgICAgICAgdmFsdWUgPSByYWRpb3Nbal0udmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5pbnB1dEJveFwiKSkge1xuICAgICAgICBhbnN3ZXJUZXh0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5pbnB1dEJveFwiKS52YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBhbnN3ZXJUZXh0ID0gdmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFuc3dlclRleHQ7XG5cbn07XG5cbnZhciBjcmVhdGVUZW1wbGF0ZSA9IGZ1bmN0aW9uKGksIHF1ZXN0aW9uLCBhbHRlcm5hdGl2ZXMpIHtcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlXCIpO1xuICAgIHZhciBub2RlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmFyZWFcIikuYXBwZW5kQ2hpbGQobm9kZSk7XG5cbiAgICB2YXIgdGl0bGVOciA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGkpO1xuICAgIHZhciBxdWVzdGlvbk5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShxdWVzdGlvbik7XG4gICAgdmFyIHRleHRDbGFzcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV4dFwiKTtcblxuICAgIHRleHRDbGFzcy5hcHBlbmRDaGlsZChxdWVzdGlvbk5vZGUpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGl0bGVcIikuYXBwZW5kQ2hpbGQodGl0bGVOcik7XG5cbiAgICBpZiAoYWx0ZXJuYXRpdmVzKSB7XG4gICAgICAgIHZhciBhbHRzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYWx0ZXJuYXRpdmVzKTtcbiAgICAgICAgdmFyIG51bUFsdCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGFsdGVybmF0aXZlcykubGVuZ3RoO1xuICAgICAgICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBudW1BbHQ7IGogKz0gMSkge1xuICAgICAgICAgICAgdmFyIHJhZGlvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuICAgICAgICAgICAgdmFyIGFsdFRleHQgPSBhbHRzW2pdO1xuICAgICAgICAgICAgdmFyIGFsdCA9IGFsdGVybmF0aXZlc1thbHRUZXh0XTtcbiAgICAgICAgICAgIHZhciB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYWx0KTtcbiAgICAgICAgICAgIHJhZGlvLnRpdGxlID0gKGogKyAxKTtcbiAgICAgICAgICAgIHJhZGlvLnR5cGUgPSBcInJhZGlvXCI7XG4gICAgICAgICAgICByYWRpby5uYW1lID0gXCJyYWRpb1wiO1xuICAgICAgICAgICAgcmFkaW8udmFsdWUgPSBhbHRzW2pdO1xuICAgICAgICAgICAgZnJhZy5hcHBlbmRDaGlsZChyYWRpbyk7XG4gICAgICAgICAgICBmcmFnLmFwcGVuZENoaWxkKHRleHQpO1xuICAgICAgICAgICAgZnJhZy5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnJcIikpO1xuICAgICAgICAgICAgcmFkaW8uY2xhc3NMaXN0LmFkZChcInJhZGlvXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5yYWRpb0RpdlwiKS5hcHBlbmRDaGlsZChmcmFnKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBpbnB1dEJveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcbiAgICAgICAgaW5wdXRCb3gudHlwZSA9IFwidGV4dFwiO1xuICAgICAgICBpbnB1dEJveC5wbGFjZWhvbGRlciA9IFwiWW91ciBhbnN3ZXIgaGVyZS4uXCI7XG4gICAgICAgIGlucHV0Qm94LmNsYXNzTGlzdC5hZGQoXCJpbnB1dEJveFwiKTtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5pbnB1dERpdlwiKS5hcHBlbmRDaGlsZChpbnB1dEJveCk7XG4gICAgfVxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0ZW1wbGF0ZTp0ZW1wbGF0ZSxcbiAgICBzdGFydDpzdGFydCxcbiAgICBjbGVhbjpjbGVhbixcbiAgICBnYW1lT3ZlcjpnYW1lT3ZlcixcbiAgICBhbnN3ZXI6YW5zd2VyLFxuICAgIGNyZWF0ZVRlbXBsYXRlOmNyZWF0ZVRlbXBsYXRlXG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8vdmFyIFRpbWVyID0gZnVuY3Rpb24oKSB7XG4vLyAgICB0aGlzLnNlY29uZHMgPSAwO1xuLy8gICAgdGhpcy5kaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RpbWVyXCIpO1xuLy8gICAgdGhpcy5pbnRlcnZhbElEID0gdW5kZWZpbmVkO1xuLy99O1xuLy9cbi8vVGltZXIucHJvdG90eXBlLlN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4vLyAgICB2YXIgX3RoaXMgPSB0aGlzO1xuLy8gICAgX3RoaXMuaW50ZXJ2YWxJRCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuLy8gICAgICAgIF90aGlzLnNlY29uZHMgKz0gMC4xO1xuLy8gICAgICAgIF90aGlzLmRpdi50ZXh0Q29udGVudCA9IF90aGlzLnNlY29uZHMudG9GaXhlZCgxKTtcbi8vICAgIH0sIDEwMCk7XG4vL307XG4vL1xuLy9UaW1lci5wcm90b3R5cGUuU3RvcCA9IGZ1bmN0aW9uKCkge1xuLy8gICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbElEKTtcbi8vfTtcbi8vXG4vL21vZHVsZS5leHBvcnRzID0gVGltZXI7XG5cbnZhciB0O1xudmFyIHNlY29uZHMgPSAyMDtcblxuZnVuY3Rpb24gc3RhcnQoY2FsbGJhY2spIHtcbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0aW1lclwiKTtcbiAgICB0ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlY29uZHMgLT0gMC4xO1xuICAgICAgICBkaXYudGV4dENvbnRlbnQgPSBzZWNvbmRzLnRvRml4ZWQoMSk7XG4gICAgICAgIGlmIChzZWNvbmRzIDw9IDApIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICB9LCAxMDApO1xuXG59XG5cbmZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgY2xlYXJJbnRlcnZhbCh0KTtcbiAgICBzZWNvbmRzID0gMjA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHN0YXJ0OiBzdGFydCxcbiAgICBzdG9wOiBzdG9wXG59O1xuIl19
