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
var player = document.querySelector(".nameBox");
var nameBox = document.querySelector(".nameBox");

//http://vhost3.lnu.se:20080/question/1
//"http://oskaremilsson.se:4004/question/1"
var defaultURL = "http://vhost3.lnu.se:20080/question/1";
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
    timer.clean();
    quiz.gameOver();
};

var getPlayerName = function() {
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
        highscore.getLocal(player);
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
            highscore.display();
        }
    });

});


},{"./ajax":1,"./highscore":3,"./quiz":4,"./timer":5}],3:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMS4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYWpheC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9oaWdoc2NvcmUuanMiLCJjbGllbnQvc291cmNlL2pzL3F1aXouanMiLCJjbGllbnQvc291cmNlL2pzL3RpbWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKipcbiAqIFRoaXMgY2FsbGJhY2sgZnVuY3Rpb24gc2VuZHMgcmVxdWVzdCB0byB0aGUgZGF0YWJhc2VcbiAqIEBwYXJhbSBjb25maWdcbiAqIEBwYXJhbSBjYWxsYmFja1xuICovXG5mdW5jdGlvbiByZXF1ZXN0KGNvbmZpZywgY2FsbGJhY2spIHtcblxuICAgIGNvbmZpZy51cmwgPSBjb25maWcudXJsIHx8IFwiXCI7XG4gICAgY29uZmlnLm1ldGhvZCA9IGNvbmZpZy5tZXRob2QgfHwgXCJwb3N0XCI7XG4gICAgY29uZmlnLmNvbnRlbnR0eXBlID0gY29uZmlnLmNvbnRlbnR0eXBlIHx8IFwiYXBwbGljYXRpb24vanNvblwiO1xuICAgIGNvbmZpZy5hbnN3ZXIgPSBjb25maWcuYW5zd2VyIHx8IG51bGw7XG5cbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICByZXEuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgaWYgKHJlcS5zdGF0dXMgPj0gNDAwKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhyZXEuc3RhdHVzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHJlcS5yZXNwb25zZVRleHQpO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJlcS5vcGVuKGNvbmZpZy5tZXRob2QsIGNvbmZpZy51cmwpO1xuICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIGNvbmZpZy5jb250ZW50dHlwZSk7XG4gICAgcmVxLnNlbmQoY29uZmlnLmFuc3dlcik7XG59XG5cbmZ1bmN0aW9uIHJlcXVlc3RHZXQodXJsLCBjYWxsYmFjaykge1xuICAgIHZhciByZXFHZXQgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIHJlcUdldC5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbigpIHtcblxuICAgICAgICBpZiAocmVxR2V0LnN0YXR1cyA+PSA0MDApIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlcUdldC5zdGF0dXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVxR2V0LnJlc3BvbnNlVGV4dCk7XG5cbiAgICB9KTtcblxuICAgIHJlcUdldC5vcGVuKFwiR0VUXCIsIHVybCk7XG4gICAgcmVxR2V0LnNlbmQoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgcmVxdWVzdDogcmVxdWVzdCxcbiAgICByZXF1ZXN0R2V0OiByZXF1ZXN0R2V0XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKlxuIEBhdXRob3IgLSBMb2tlIENhcmxzc29uXG4gKi9cblxudmFyIHF1aXogPSByZXF1aXJlKFwiLi9xdWl6XCIpO1xudmFyIGFqYXggPSByZXF1aXJlKFwiLi9hamF4XCIpO1xudmFyIHRpbWVyID0gcmVxdWlyZShcIi4vdGltZXJcIik7XG52YXIgaGlnaHNjb3JlID0gcmVxdWlyZShcIi4vaGlnaHNjb3JlXCIpO1xudmFyIHN1Ym1pdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3VibWl0XCIpO1xudmFyIHN0YXJ0UXVpeiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhcnRRdWl6XCIpO1xudmFyIHRpbWVyRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0aW1lclwiKTtcbnZhciBwbGF5ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLm5hbWVCb3hcIik7XG52YXIgbmFtZUJveCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubmFtZUJveFwiKTtcblxuLy9odHRwOi8vdmhvc3QzLmxudS5zZToyMDA4MC9xdWVzdGlvbi8xXG4vL1wiaHR0cDovL29za2FyZW1pbHNzb24uc2U6NDAwNC9xdWVzdGlvbi8xXCJcbnZhciBkZWZhdWx0VVJMID0gXCJodHRwOi8vdmhvc3QzLmxudS5zZToyMDA4MC9xdWVzdGlvbi8xXCI7XG52YXIgdXJsUSA9IHVybFEgfHwgZGVmYXVsdFVSTDtcbnZhciB1cmxBO1xudmFyIHJlcXVlc3RJZDtcbnZhciBpID0gMTtcblxuLy9DbGVhbiB1cCBzb21lIHRoaW5ncyBmb3IgYSBuZXcgZ2FtZVxudmFyIGNsZWFuVXAgPSBmdW5jdGlvbigpIHtcbiAgICBzdGFydFF1aXouY2xhc3NMaXN0LnRvZ2dsZShcImhpZGRlblwiKTtcbiAgICBzdGFydFF1aXouY2xhc3NMaXN0LnRvZ2dsZShcInZpc2libGVcIik7XG4gICAgc3VibWl0LmNsYXNzTGlzdC50b2dnbGUoXCJ2aXNpYmxlXCIpO1xuICAgIHN1Ym1pdC5jbGFzc0xpc3QudG9nZ2xlKFwiaGlkZGVuXCIpO1xuICAgIHRpbWVyRGl2LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgdXJsUSA9IGRlZmF1bHRVUkw7XG4gICAgdXJsQSA9IFwiXCI7XG59O1xuXG4vL0NhbGxzIHNvbWUgZnVuY3Rpb25zIHdoZW4gZ2FtZSBpcyBvdmVyXG52YXIgZ2FtZU92ZXIgPSBmdW5jdGlvbigpIHtcbiAgICBjbGVhblVwKCk7XG4gICAgcXVpei5jbGVhbigpO1xuICAgIHRpbWVyLnN0b3AoKTtcbiAgICB0aW1lci5jbGVhbigpO1xuICAgIHF1aXouZ2FtZU92ZXIoKTtcbn07XG5cbnZhciBnZXRQbGF5ZXJOYW1lID0gZnVuY3Rpb24oKSB7XG59O1xuXG4vL0dFVCByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXJcbnZhciBnZXRSZXEgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodXJsUSkge1xuICAgICAgICBhamF4LnJlcXVlc3RHZXQodXJsUSwgZnVuY3Rpb24oZXJyb3IsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB2YXIgYWx0cyA9IEpTT04ucGFyc2UocmVzcG9uc2UpLmFsdGVybmF0aXZlcztcbiAgICAgICAgICAgIHZhciBxdWVzdHMgPSBKU09OLnBhcnNlKHJlc3BvbnNlKS5xdWVzdGlvbjtcbiAgICAgICAgICAgIHJlcXVlc3RJZCA9IEpTT04ucGFyc2UocmVzcG9uc2UpLmlkO1xuICAgICAgICAgICAgcXVpei5jcmVhdGVUZW1wbGF0ZShpLCBxdWVzdHMsIGFsdHMpO1xuICAgICAgICAgICAgdXJsQSA9IEpTT04ucGFyc2UocmVzcG9uc2UpLm5leHRVUkw7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbi8vU3RhcnRzIHRoZSBxdWl6XG5zdGFydFF1aXouYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLm5hbWVCb3hcIikudmFsdWUpIHtcbiAgICAgICAgaGlnaHNjb3JlLmdldExvY2FsKHBsYXllcik7XG4gICAgICAgIHF1aXouY2xlYW4oKTtcbiAgICAgICAgY2xlYW5VcCgpO1xuICAgICAgICBnZXRSZXEoKTtcbiAgICAgICAgdGltZXJEaXYuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcbiAgICAgICAgdGltZXIuc3RvcCgpO1xuICAgICAgICB0aW1lci5zdGFydChmdW5jdGlvbigpIHtcbiAgICAgICAgLy9DYWxsYmFjayBmdW5jdGlvbiB3aGVuIHRpbWUgcnVucyBvdXRcbiAgICAgICAgZ2FtZU92ZXIoKTtcbiAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBuYW1lQm94LmNsYXNzTGlzdC5yZW1vdmUoXCJncmVlblwiKTtcbiAgICAgICAgbmFtZUJveC5jbGFzc0xpc3QuYWRkKFwicmVkXCIpO1xuICAgIH1cbn0pO1xuXG5uYW1lQm94LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBmdW5jdGlvbigpIHtcbiAgICBuYW1lQm94LmNsYXNzTGlzdC5yZW1vdmUoXCJyZWRcIik7XG4gICAgbmFtZUJveC5jbGFzc0xpc3QuYWRkKFwiZ3JlZW5cIik7XG59KTtcblxuLy9Qb3N0cyB0aGUgYW5zd2VyIHRvIHRoZSBzZXJ2ZXJcbnN1Ym1pdC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgdmFyIGpzb25PYmogPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGFuc3dlcjogcXVpei5hbnN3ZXIoaSlcbiAgICB9KTtcblxuICAgIGFqYXgucmVxdWVzdCh7bWV0aG9kOiBcIlBPU1RcIiwgdXJsOiB1cmxBLCBhbnN3ZXI6IGpzb25PYmp9LCBmdW5jdGlvbihlcnJvciwgcmVzcG9uc2UpIHtcbiAgICAgICAgcXVpei5jbGVhbigpO1xuXG4gICAgICAgIGlmICgoZXJyb3IgPT09IG51bGwgfHwgZXJyb3IgPCA0MDApICYmIEpTT04ucGFyc2UocmVzcG9uc2UpLm5leHRVUkwpIHtcbiAgICAgICAgICAgIHVybFEgPSBKU09OLnBhcnNlKHJlc3BvbnNlKS5uZXh0VVJMO1xuICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgZ2V0UmVxKCk7XG4gICAgICAgICAgICB0aW1lckRpdi5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xuICAgICAgICAgICAgdGltZXIuc3RvcCgpO1xuICAgICAgICAgICAgdGltZXIuc3RhcnQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgLy9DYWxsYmFjayBmdW5jdGlvbiB3aGVuIHRpbWUgcnVucyBvdXRcbiAgICAgICAgICAgICAgICBnYW1lT3ZlcigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBnYW1lT3ZlcigpO1xuICAgICAgICAgICAgaGlnaHNjb3JlLmRpc3BsYXkoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB0aW1lciA9IHJlcXVpcmUoXCIuL3RpbWVyXCIpO1xuXG5cbmZ1bmN0aW9uIGRpc3BsYXkocGxheWVyKSB7XG4gICAgY29uc29sZS5sb2codGltZXIuZGlzcGxheSgpKTtcbiAgICBjb25zb2xlLmxvZyhwbGF5ZXIpO1xufVxuXG5mdW5jdGlvbiBnZXRMb2NhbChwbGF5ZXIpIHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShwbGF5ZXIsIFwiOilcIik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGRpc3BsYXk6IGRpc3BsYXksXG4gICAgZ2V0TG9jYWw6IGdldExvY2FsXG59O1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHRlbXBsYXRlID0gZnVuY3Rpb24ocXVlc3QpIHtcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlXCIgKyBxdWVzdCk7XG4gICAgdmFyIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYXJlYVwiKS5hcHBlbmRDaGlsZChub2RlKTtcbn07XG5cbnZhciBjbGVhbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYXJlYVwiKTtcbiAgICB3aGlsZSAoZWwuaGFzQ2hpbGROb2RlcygpKSB7XG4gICAgICAgIGVsLnJlbW92ZUNoaWxkKGVsLmxhc3RDaGlsZCk7XG4gICAgfVxufTtcblxudmFyIGdhbWVPdmVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNlbmRUZW1wbGF0ZVwiKTtcbiAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5hcmVhXCIpLmFwcGVuZENoaWxkKG5vZGUpO1xufTtcblxudmFyIGFuc3dlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhbnN3ZXJUZXh0O1xuICAgIHZhciByYWRpb3MgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5TmFtZShcInJhZGlvXCIpO1xuICAgIHZhciB2YWx1ZTtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJhZGlvcy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICBpZiAocmFkaW9zW2pdLmNoZWNrZWQpIHtcbiAgICAgICAgICAgIHZhbHVlID0gcmFkaW9zW2pdLnZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuaW5wdXRCb3hcIikpIHtcbiAgICAgICAgYW5zd2VyVGV4dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuaW5wdXRCb3hcIikudmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYW5zd2VyVGV4dCA9IHZhbHVlO1xuICAgIH1cblxuICAgIHJldHVybiBhbnN3ZXJUZXh0O1xuXG59O1xuXG52YXIgZ2VuUmFkaW8gPSBmdW5jdGlvbihhbHRlcm5hdGl2ZXMpIHtcbiAgICB2YXIgYWx0cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGFsdGVybmF0aXZlcyk7XG4gICAgdmFyIG51bUFsdCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGFsdGVybmF0aXZlcykubGVuZ3RoO1xuICAgIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgbnVtQWx0OyBqICs9IDEpIHtcbiAgICAgICAgdmFyIHJhZGlvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuICAgICAgICB2YXIgYWx0VGV4dCA9IGFsdHNbal07XG4gICAgICAgIHZhciBhbHQgPSBhbHRlcm5hdGl2ZXNbYWx0VGV4dF07XG4gICAgICAgIHZhciB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYWx0KTtcbiAgICAgICAgcmFkaW8udGl0bGUgPSAoaiArIDEpO1xuICAgICAgICByYWRpby50eXBlID0gXCJyYWRpb1wiO1xuICAgICAgICByYWRpby5uYW1lID0gXCJyYWRpb1wiO1xuICAgICAgICByYWRpby52YWx1ZSA9IGFsdHNbal07XG4gICAgICAgIGZyYWcuYXBwZW5kQ2hpbGQocmFkaW8pO1xuICAgICAgICBmcmFnLmFwcGVuZENoaWxkKHRleHQpO1xuICAgICAgICBmcmFnLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJiclwiKSk7XG4gICAgICAgIHJhZGlvLmNsYXNzTGlzdC5hZGQoXCJyYWRpb1wiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnJhZztcbn07XG5cbnZhciBnZW5JbnB1dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpbnB1dEJveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcbiAgICBpbnB1dEJveC50eXBlID0gXCJ0ZXh0XCI7XG4gICAgaW5wdXRCb3gucGxhY2Vob2xkZXIgPSBcIllvdXIgYW5zd2VyIGhlcmUuLlwiO1xuICAgIGlucHV0Qm94LmNsYXNzTGlzdC5hZGQoXCJpbnB1dEJveFwiKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmlucHV0RGl2XCIpLmFwcGVuZENoaWxkKGlucHV0Qm94KTtcbiAgICBpbnB1dEJveC5mb2N1cygpO1xufTtcblxudmFyIGNyZWF0ZVRlbXBsYXRlID0gZnVuY3Rpb24oaSwgcXVlc3Rpb24sIGFsdGVybmF0aXZlcykge1xuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGVcIik7XG4gICAgdmFyIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYXJlYVwiKS5hcHBlbmRDaGlsZChub2RlKTtcblxuICAgIHZhciB0aXRsZU5yID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoaSk7XG4gICAgdmFyIHF1ZXN0aW9uTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHF1ZXN0aW9uKTtcbiAgICB2YXIgdGV4dENsYXNzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXh0XCIpO1xuXG4gICAgdGV4dENsYXNzLmFwcGVuZENoaWxkKHF1ZXN0aW9uTm9kZSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi50aXRsZVwiKS5hcHBlbmRDaGlsZCh0aXRsZU5yKTtcblxuICAgIGlmIChhbHRlcm5hdGl2ZXMpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5yYWRpb0RpdlwiKS5hcHBlbmRDaGlsZChnZW5SYWRpbyhhbHRlcm5hdGl2ZXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBnZW5JbnB1dCgpO1xuICAgIH1cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgdGVtcGxhdGU6dGVtcGxhdGUsXG4gICAgY2xlYW46Y2xlYW4sXG4gICAgZ2FtZU92ZXI6Z2FtZU92ZXIsXG4gICAgYW5zd2VyOmFuc3dlcixcbiAgICBjcmVhdGVUZW1wbGF0ZTpjcmVhdGVUZW1wbGF0ZVxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgdDtcbnZhciBkZWZhdWx0VGltZSA9IDIwO1xudmFyIHNlY29uZHMgPSBkZWZhdWx0VGltZTtcbnZhciBzdGFydFRpbWUgPSAwO1xudmFyIGVuZFRpbWUgPSAwO1xudmFyIHRvdGFsVGltZSA9IDA7XG52YXIgc2F2ZWRUaW1lID0gMDtcblxuZnVuY3Rpb24gZ2V0RGF0ZSgpIHtcbiAgICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gICAgcmV0dXJuIGQuZ2V0VGltZSgpO1xufVxuXG5mdW5jdGlvbiBzdGFydChjYWxsYmFjaykge1xuICAgIHZhciBkaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RpbWVyXCIpO1xuICAgIHQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgICAgc2Vjb25kcyAtPSAwLjE7XG4gICAgICAgIGRpdi50ZXh0Q29udGVudCA9IHNlY29uZHMudG9GaXhlZCgwKTtcbiAgICAgICAgaWYgKHNlY29uZHMgPD0gMCkge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgIH0sIDEwMCk7XG5cbiAgICBzdGFydFRpbWUgPSBnZXREYXRlKCk7XG59XG5cbmZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgZW5kVGltZSA9IGdldERhdGUoKTtcbiAgICBzYXZlZFRpbWUgPSAoZW5kVGltZSAtIHN0YXJ0VGltZSkgLyAxMDAwO1xuICAgIGlmIChzYXZlZFRpbWUgPD0gZGVmYXVsdFRpbWUpIHtcbiAgICAgICAgdG90YWxUaW1lICs9IHNhdmVkVGltZTtcbiAgICAgICAgY29uc29sZS5sb2coXCJzYXZlZCBcIiArIHNhdmVkVGltZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwidG90YWwgXCIgKyB0b3RhbFRpbWUpO1xuICAgIH1cblxuICAgIGNsZWFySW50ZXJ2YWwodCk7XG4gICAgc2Vjb25kcyA9IGRlZmF1bHRUaW1lO1xufVxuXG5mdW5jdGlvbiBjbGVhbigpIHtcbiAgICBzdGFydFRpbWUgPSAwO1xuICAgIGVuZFRpbWUgPSAwO1xuICAgIHRvdGFsVGltZSA9IDA7XG4gICAgc2F2ZWRUaW1lID0gMDtcbn1cblxuZnVuY3Rpb24gZGlzcGxheSgpIHtcbiAgICByZXR1cm4gdG90YWxUaW1lLnRvRml4ZWQoMyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHN0YXJ0OiBzdGFydCxcbiAgICBzdG9wOiBzdG9wLFxuICAgIGRpc3BsYXk6IGRpc3BsYXksXG4gICAgY2xlYW46IGNsZWFuXG59O1xuIl19
