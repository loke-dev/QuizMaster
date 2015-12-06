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

//Posts the answer to the server
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMS4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYWpheC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9xdWl6LmpzIiwiY2xpZW50L3NvdXJjZS9qcy90aW1lci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuLyoqXG4gKiBUaGlzIGNhbGxiYWNrIGZ1bmN0aW9uIHNlbmRzIHJlcXVlc3QgdG8gdGhlIGRhdGFiYXNlXG4gKiBAcGFyYW0gY29uZmlnXG4gKiBAcGFyYW0gY2FsbGJhY2tcbiAqL1xuZnVuY3Rpb24gcmVxdWVzdChjb25maWcsIGNhbGxiYWNrKSB7XG5cbiAgICBjb25maWcudXJsID0gY29uZmlnLnVybCB8fCBcIlwiO1xuICAgIGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kIHx8IFwicG9zdFwiO1xuICAgIGNvbmZpZy5jb250ZW50dHlwZSA9IGNvbmZpZy5jb250ZW50dHlwZSB8fCBcImFwcGxpY2F0aW9uL2pzb25cIjtcbiAgICBjb25maWcuYW5zd2VyID0gY29uZmlnLmFuc3dlciB8fCBudWxsO1xuXG4gICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgcmVxLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIGlmIChyZXEuc3RhdHVzID49IDQwMCkge1xuICAgICAgICAgICAgY2FsbGJhY2socmVxLnN0YXR1cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXEucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXEub3Blbihjb25maWcubWV0aG9kLCBjb25maWcudXJsKTtcbiAgICByZXEuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBjb25maWcuY29udGVudHR5cGUpO1xuICAgIHJlcS5zZW5kKGNvbmZpZy5hbnN3ZXIpO1xufVxuXG5mdW5jdGlvbiByZXF1ZXN0R2V0KHVybCwgY2FsbGJhY2spIHtcbiAgICB2YXIgcmVxR2V0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICByZXFHZXQuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgaWYgKHJlcUdldC5zdGF0dXMgPj0gNDAwKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhyZXFHZXQuc3RhdHVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHJlcUdldC5yZXNwb25zZVRleHQpO1xuXG4gICAgfSk7XG5cbiAgICByZXFHZXQub3BlbihcIkdFVFwiLCB1cmwpO1xuICAgIHJlcUdldC5zZW5kKCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHJlcXVlc3Q6IHJlcXVlc3QsXG4gICAgcmVxdWVzdEdldDogcmVxdWVzdEdldFxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLypcbiBAYXV0aG9yIC0gTG9rZSBDYXJsc3NvblxuICovXG5cbnZhciBxdWl6ID0gcmVxdWlyZShcIi4vcXVpelwiKTtcbnZhciBhamF4ID0gcmVxdWlyZShcIi4vYWpheFwiKTtcbnZhciB0aW1lciA9IHJlcXVpcmUoXCIuL3RpbWVyXCIpO1xudmFyIHN1Ym1pdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3VibWl0XCIpO1xudmFyIHN0YXJ0UXVpeiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhcnRRdWl6XCIpO1xudmFyIHRpbWVyRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0aW1lclwiKTtcbnZhciBkZWZhdWx0VVJMID0gXCJodHRwOi8vb3NrYXJlbWlsc3Nvbi5zZTo0MDA0L3F1ZXN0aW9uLzFcIjtcbnZhciB1cmxRID0gdXJsUSB8fCBkZWZhdWx0VVJMO1xudmFyIHVybEE7XG52YXIgcmVxdWVzdElkO1xudmFyIGkgPSAxO1xuXG52YXIgY2xlYW5VcCA9IGZ1bmN0aW9uKCkge1xuICAgIHN0YXJ0UXVpei5jbGFzc0xpc3QudG9nZ2xlKFwiaGlkZGVuXCIpO1xuICAgIHN0YXJ0UXVpei5jbGFzc0xpc3QudG9nZ2xlKFwidmlzaWJsZVwiKTtcbiAgICBzdWJtaXQuY2xhc3NMaXN0LnRvZ2dsZShcInZpc2libGVcIik7XG4gICAgc3VibWl0LmNsYXNzTGlzdC50b2dnbGUoXCJoaWRkZW5cIik7XG4gICAgdGltZXJEaXYuY2xhc3NMaXN0LnRvZ2dsZShcInZpc2libGVcIik7XG4gICAgdGltZXJEaXYuY2xhc3NMaXN0LnRvZ2dsZShcImhpZGRlblwiKTtcbiAgICB1cmxRID0gZGVmYXVsdFVSTDtcbiAgICB1cmxBID0gXCJcIjtcbn07XG5cbnZhciBnYW1lT3ZlciA9IGZ1bmN0aW9uKCkge1xuICAgIGNsZWFuVXAoKTtcbiAgICBxdWl6LmNsZWFuKCk7XG4gICAgdGltZXIuc3RvcCgpO1xuICAgIHF1aXouZ2FtZU92ZXIoKTtcbn07XG5cbnZhciBnZXRSZXEgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodXJsUSkge1xuICAgICAgICBhamF4LnJlcXVlc3RHZXQodXJsUSwgZnVuY3Rpb24oZXJyb3IsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB2YXIgYWx0cyA9IEpTT04ucGFyc2UocmVzcG9uc2UpLmFsdGVybmF0aXZlcztcbiAgICAgICAgICAgIHZhciBxdWVzdHMgPSBKU09OLnBhcnNlKHJlc3BvbnNlKS5xdWVzdGlvbjtcbiAgICAgICAgICAgIHJlcXVlc3RJZCA9IEpTT04ucGFyc2UocmVzcG9uc2UpLmlkO1xuICAgICAgICAgICAgcXVpei5jcmVhdGVUZW1wbGF0ZShpLCBxdWVzdHMsIGFsdHMpO1xuICAgICAgICAgICAgdXJsQSA9IEpTT04ucGFyc2UocmVzcG9uc2UpLm5leHRVUkw7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbnN0YXJ0UXVpei5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgcXVpei5jbGVhbigpO1xuICAgIGNsZWFuVXAoKTtcbiAgICBnZXRSZXEoKTtcbiAgICB0aW1lci5zdG9wKCk7XG4gICAgdGltZXIuc3RhcnQoZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vQ2FsbGJhY2sgZnVuY3Rpb24gd2hlbiB0aW1lIHJ1bnMgb3V0XG4gICAgICAgIGdhbWVPdmVyKCk7XG4gICAgfSk7XG59KTtcblxuLy9Qb3N0cyB0aGUgYW5zd2VyIHRvIHRoZSBzZXJ2ZXJcbnN1Ym1pdC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgdmFyIGpzb25PYmogPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGFuc3dlcjogcXVpei5hbnN3ZXIoaSlcbiAgICB9KTtcblxuICAgIGFqYXgucmVxdWVzdCh7bWV0aG9kOiBcIlBPU1RcIiwgdXJsOiB1cmxBLCBhbnN3ZXI6IGpzb25PYmp9LCBmdW5jdGlvbihlcnJvciwgcmVzcG9uc2UpIHtcbiAgICAgICAgcXVpei5jbGVhbigpO1xuICAgICAgICBpZiAoZXJyb3IgPT09IG51bGwgfHwgZXJyb3IgPCA0MDApIHtcbiAgICAgICAgICAgIHVybFEgPSBKU09OLnBhcnNlKHJlc3BvbnNlKS5uZXh0VVJMO1xuICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgZ2V0UmVxKCk7XG4gICAgICAgICAgICB0aW1lci5zdG9wKCk7XG4gICAgICAgICAgICB0aW1lci5zdGFydCgpO1xuICAgICAgICB9IGVsc2UgaWYgKGVycm9yID49IDQwMCkge1xuICAgICAgICAgICAgZ2FtZU92ZXIoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB0ZW1wbGF0ZSA9IGZ1bmN0aW9uKHF1ZXN0KSB7XG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZVwiICsgcXVlc3QpO1xuICAgIHZhciBub2RlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmFyZWFcIikuYXBwZW5kQ2hpbGQobm9kZSk7XG59O1xuXG52YXIgY2xlYW4gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmFyZWFcIik7XG4gICAgd2hpbGUgKGVsLmhhc0NoaWxkTm9kZXMoKSkge1xuICAgICAgICBlbC5yZW1vdmVDaGlsZChlbC5sYXN0Q2hpbGQpO1xuICAgIH1cbn07XG5cbnZhciBnYW1lT3ZlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZW5kVGVtcGxhdGVcIik7XG4gICAgdmFyIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYXJlYVwiKS5hcHBlbmRDaGlsZChub2RlKTtcbn07XG5cbnZhciBhbnN3ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYW5zd2VyVGV4dDtcbiAgICB2YXIgcmFkaW9zID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeU5hbWUoXCJyYWRpb1wiKTtcbiAgICB2YXIgdmFsdWU7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCByYWRpb3MubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgaWYgKHJhZGlvc1tqXS5jaGVja2VkKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHJhZGlvc1tqXS52YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmlucHV0Qm94XCIpKSB7XG4gICAgICAgIGFuc3dlclRleHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmlucHV0Qm94XCIpLnZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGFuc3dlclRleHQgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gYW5zd2VyVGV4dDtcblxufTtcblxudmFyIGNyZWF0ZVRlbXBsYXRlID0gZnVuY3Rpb24oaSwgcXVlc3Rpb24sIGFsdGVybmF0aXZlcykge1xuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGVcIik7XG4gICAgdmFyIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYXJlYVwiKS5hcHBlbmRDaGlsZChub2RlKTtcblxuICAgIHZhciB0aXRsZU5yID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoaSk7XG4gICAgdmFyIHF1ZXN0aW9uTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHF1ZXN0aW9uKTtcbiAgICB2YXIgdGV4dENsYXNzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXh0XCIpO1xuXG4gICAgdGV4dENsYXNzLmFwcGVuZENoaWxkKHF1ZXN0aW9uTm9kZSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi50aXRsZVwiKS5hcHBlbmRDaGlsZCh0aXRsZU5yKTtcblxuICAgIGlmIChhbHRlcm5hdGl2ZXMpIHtcbiAgICAgICAgdmFyIGFsdHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhhbHRlcm5hdGl2ZXMpO1xuICAgICAgICB2YXIgbnVtQWx0ID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYWx0ZXJuYXRpdmVzKS5sZW5ndGg7XG4gICAgICAgIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG51bUFsdDsgaiArPSAxKSB7XG4gICAgICAgICAgICB2YXIgcmFkaW8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gICAgICAgICAgICB2YXIgYWx0VGV4dCA9IGFsdHNbal07XG4gICAgICAgICAgICB2YXIgYWx0ID0gYWx0ZXJuYXRpdmVzW2FsdFRleHRdO1xuICAgICAgICAgICAgdmFyIHRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShhbHQpO1xuICAgICAgICAgICAgcmFkaW8udGl0bGUgPSAoaiArIDEpO1xuICAgICAgICAgICAgcmFkaW8udHlwZSA9IFwicmFkaW9cIjtcbiAgICAgICAgICAgIHJhZGlvLm5hbWUgPSBcInJhZGlvXCI7XG4gICAgICAgICAgICByYWRpby52YWx1ZSA9IGFsdHNbal07XG4gICAgICAgICAgICBmcmFnLmFwcGVuZENoaWxkKHJhZGlvKTtcbiAgICAgICAgICAgIGZyYWcuYXBwZW5kQ2hpbGQodGV4dCk7XG4gICAgICAgICAgICBmcmFnLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJiclwiKSk7XG4gICAgICAgICAgICByYWRpby5jbGFzc0xpc3QuYWRkKFwicmFkaW9cIik7XG4gICAgICAgIH1cblxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnJhZGlvRGl2XCIpLmFwcGVuZENoaWxkKGZyYWcpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGlucHV0Qm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuICAgICAgICBpbnB1dEJveC50eXBlID0gXCJ0ZXh0XCI7XG4gICAgICAgIGlucHV0Qm94LnBsYWNlaG9sZGVyID0gXCJZb3VyIGFuc3dlciBoZXJlLi5cIjtcbiAgICAgICAgaW5wdXRCb3guY2xhc3NMaXN0LmFkZChcImlucHV0Qm94XCIpO1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmlucHV0RGl2XCIpLmFwcGVuZENoaWxkKGlucHV0Qm94KTtcbiAgICB9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHRlbXBsYXRlOnRlbXBsYXRlLFxuICAgIGNsZWFuOmNsZWFuLFxuICAgIGdhbWVPdmVyOmdhbWVPdmVyLFxuICAgIGFuc3dlcjphbnN3ZXIsXG4gICAgY3JlYXRlVGVtcGxhdGU6Y3JlYXRlVGVtcGxhdGVcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLy92YXIgVGltZXIgPSBmdW5jdGlvbigpIHtcbi8vICAgIHRoaXMuc2Vjb25kcyA9IDA7XG4vLyAgICB0aGlzLmRpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGltZXJcIik7XG4vLyAgICB0aGlzLmludGVydmFsSUQgPSB1bmRlZmluZWQ7XG4vL307XG4vL1xuLy9UaW1lci5wcm90b3R5cGUuU3RhcnQgPSBmdW5jdGlvbigpIHtcbi8vICAgIHZhciBfdGhpcyA9IHRoaXM7XG4vLyAgICBfdGhpcy5pbnRlcnZhbElEID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4vLyAgICAgICAgX3RoaXMuc2Vjb25kcyArPSAwLjE7XG4vLyAgICAgICAgX3RoaXMuZGl2LnRleHRDb250ZW50ID0gX3RoaXMuc2Vjb25kcy50b0ZpeGVkKDEpO1xuLy8gICAgfSwgMTAwKTtcbi8vfTtcbi8vXG4vL1RpbWVyLnByb3RvdHlwZS5TdG9wID0gZnVuY3Rpb24oKSB7XG4vLyAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsSUQpO1xuLy99O1xuLy9cbi8vbW9kdWxlLmV4cG9ydHMgPSBUaW1lcjtcblxudmFyIHQ7XG52YXIgc2Vjb25kcyA9IDIwO1xuXG5mdW5jdGlvbiBzdGFydChjYWxsYmFjaykge1xuICAgIHZhciBkaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RpbWVyXCIpO1xuICAgIHQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgICAgc2Vjb25kcyAtPSAwLjE7XG4gICAgICAgIGRpdi50ZXh0Q29udGVudCA9IHNlY29uZHMudG9GaXhlZCgxKTtcbiAgICAgICAgaWYgKHNlY29uZHMgPD0gMCkge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgIH0sIDEwMCk7XG5cbn1cblxuZnVuY3Rpb24gc3RvcCgpIHtcbiAgICBjbGVhckludGVydmFsKHQpO1xuICAgIHNlY29uZHMgPSAyMDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc3RhcnQ6IHN0YXJ0LFxuICAgIHN0b3A6IHN0b3Bcbn07XG4iXX0=
