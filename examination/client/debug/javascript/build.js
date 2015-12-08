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
var list = document.querySelector(".highScore");
var restart = document.querySelector("#restart");
var timerDiv = document.querySelector("#timer");
var nameBox = document.querySelector(".nameBox");

//http://vhost3.lnu.se:20080/question/1
//http://oskaremilsson.se:4004/question/1
var defaultURL = "http://vhost3.lnu.se:20080/question/1";
var urlQ = urlQ || defaultURL;
var urlA;
var requestId;
var i = 1;

var resetQuiz = function() {
    urlQ = defaultURL;
    urlA = "";
};

//Clean up some things for a new game
var cleanUp = function() {
    submit.classList.toggle("visible");
    submit.classList.toggle("hidden");
    timerDiv.classList.add("hidden");
    resetQuiz();
    quiz.clean();
};

//Calls some functions when game is over
var quizComplete = function() {
    resetQuiz();
    quiz.clean();
    timer.stop();
    highscore.saveToLocal(nameBox.value);
    highscore.display();
    timer.clean();
    quiz.quizComplete();
    submit.classList.toggle("visible");
    submit.classList.toggle("hidden");
    list.classList.toggle("hidden");
    restart.classList.toggle("hidden");
    restart.classList.toggle("visible");
    timerDiv.classList.add("hidden");
};

var gameFailed = function() {
    cleanUp();
    timer.stop();
    timer.clean();
    quiz.gameOver();
    list.classList.add("hidden");
    restart.classList.toggle("hidden");
    restart.classList.toggle("visible");
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
        startQuiz.classList.toggle("hidden");
        startQuiz.classList.toggle("visible");
        quiz.clean();
        cleanUp();
        getReq();
        timerDiv.classList.remove("hidden");
        timer.stop();
        timer.start(function() {
        //Callback function when time runs out
        gameFailed();
    });
    } else {
        nameBox.classList.remove("green");
        nameBox.classList.add("red");
    }
});

restart.addEventListener("click", function() {
    location.reload();
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

    if (quiz.answer(i)) {
        ajax.request({method: "POST", url: urlA, answer: jsonObj}, function(error, response) {
        quiz.clean();
        try {
            if ((error === null || error < 400) && JSON.parse(response).nextURL) {
                urlQ = JSON.parse(response).nextURL;
                i += 1;
                getReq();
                timerDiv.classList.remove("hidden");
                timer.stop();
                timer.start(function() {
                //Callback function when time runs out
                gameFailed();
            });
            } else if (error >= 400 && JSON.parse(response).nextURL) {
                gameFailed();
            } else {
                quizComplete();
            }
        }
        catch (err) {
            if (error !== null) {
                console.log("You answered wrong, try again! " + err);
                gameFailed();
            } else {
                quizComplete();
            }
        }
    });
    }

});


},{"./ajax":1,"./highscore":3,"./quiz":4,"./timer":5}],3:[function(require,module,exports){
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

var quizComplete = function() {
    var template = document.querySelector("#quizComplete");
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
    createTemplate:createTemplate,
    quizComplete:quizComplete
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMS4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYWpheC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9oaWdoc2NvcmUuanMiLCJjbGllbnQvc291cmNlL2pzL3F1aXouanMiLCJjbGllbnQvc291cmNlL2pzL3RpbWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcbi8qKlxuICogVGhpcyBjYWxsYmFjayBmdW5jdGlvbiBzZW5kcyByZXF1ZXN0IHRvIHRoZSBkYXRhYmFzZVxuICogQHBhcmFtIGNvbmZpZ1xuICogQHBhcmFtIGNhbGxiYWNrXG4gKi9cbmZ1bmN0aW9uIHJlcXVlc3QoY29uZmlnLCBjYWxsYmFjaykge1xuXG4gICAgY29uZmlnLnVybCA9IGNvbmZpZy51cmwgfHwgXCJcIjtcbiAgICBjb25maWcubWV0aG9kID0gY29uZmlnLm1ldGhvZCB8fCBcInBvc3RcIjtcbiAgICBjb25maWcuY29udGVudHR5cGUgPSBjb25maWcuY29udGVudHR5cGUgfHwgXCJhcHBsaWNhdGlvbi9qc29uXCI7XG4gICAgY29uZmlnLmFuc3dlciA9IGNvbmZpZy5hbnN3ZXIgfHwgbnVsbDtcblxuICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIHJlcS5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbigpIHtcblxuICAgICAgICBpZiAocmVxLnN0YXR1cyA+PSA0MDApIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlcS5zdGF0dXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVxLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmVxLm9wZW4oY29uZmlnLm1ldGhvZCwgY29uZmlnLnVybCk7XG4gICAgcmVxLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgY29uZmlnLmNvbnRlbnR0eXBlKTtcbiAgICByZXEuc2VuZChjb25maWcuYW5zd2VyKTtcbn1cblxuZnVuY3Rpb24gcmVxdWVzdEdldCh1cmwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHJlcUdldCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgcmVxR2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIGlmIChyZXFHZXQuc3RhdHVzID49IDQwMCkge1xuICAgICAgICAgICAgY2FsbGJhY2socmVxR2V0LnN0YXR1cyk7XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjayhudWxsLCByZXFHZXQucmVzcG9uc2VUZXh0KTtcblxuICAgIH0pO1xuXG4gICAgcmVxR2V0Lm9wZW4oXCJHRVRcIiwgdXJsKTtcbiAgICByZXFHZXQuc2VuZCgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICByZXF1ZXN0OiByZXF1ZXN0LFxuICAgIHJlcXVlc3RHZXQ6IHJlcXVlc3RHZXRcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qXG4gQGF1dGhvciAtIExva2UgQ2FybHNzb25cbiAqL1xuXG52YXIgcXVpeiA9IHJlcXVpcmUoXCIuL3F1aXpcIik7XG52YXIgYWpheCA9IHJlcXVpcmUoXCIuL2FqYXhcIik7XG52YXIgdGltZXIgPSByZXF1aXJlKFwiLi90aW1lclwiKTtcbnZhciBoaWdoc2NvcmUgPSByZXF1aXJlKFwiLi9oaWdoc2NvcmVcIik7XG52YXIgc3VibWl0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdWJtaXRcIik7XG52YXIgc3RhcnRRdWl6ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGFydFF1aXpcIik7XG52YXIgbGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuaGlnaFNjb3JlXCIpO1xudmFyIHJlc3RhcnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Jlc3RhcnRcIik7XG52YXIgdGltZXJEaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RpbWVyXCIpO1xudmFyIG5hbWVCb3ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLm5hbWVCb3hcIik7XG5cbi8vaHR0cDovL3Zob3N0My5sbnUuc2U6MjAwODAvcXVlc3Rpb24vMVxuLy9odHRwOi8vb3NrYXJlbWlsc3Nvbi5zZTo0MDA0L3F1ZXN0aW9uLzFcbnZhciBkZWZhdWx0VVJMID0gXCJodHRwOi8vdmhvc3QzLmxudS5zZToyMDA4MC9xdWVzdGlvbi8xXCI7XG52YXIgdXJsUSA9IHVybFEgfHwgZGVmYXVsdFVSTDtcbnZhciB1cmxBO1xudmFyIHJlcXVlc3RJZDtcbnZhciBpID0gMTtcblxudmFyIHJlc2V0UXVpeiA9IGZ1bmN0aW9uKCkge1xuICAgIHVybFEgPSBkZWZhdWx0VVJMO1xuICAgIHVybEEgPSBcIlwiO1xufTtcblxuLy9DbGVhbiB1cCBzb21lIHRoaW5ncyBmb3IgYSBuZXcgZ2FtZVxudmFyIGNsZWFuVXAgPSBmdW5jdGlvbigpIHtcbiAgICBzdWJtaXQuY2xhc3NMaXN0LnRvZ2dsZShcInZpc2libGVcIik7XG4gICAgc3VibWl0LmNsYXNzTGlzdC50b2dnbGUoXCJoaWRkZW5cIik7XG4gICAgdGltZXJEaXYuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcbiAgICByZXNldFF1aXooKTtcbiAgICBxdWl6LmNsZWFuKCk7XG59O1xuXG4vL0NhbGxzIHNvbWUgZnVuY3Rpb25zIHdoZW4gZ2FtZSBpcyBvdmVyXG52YXIgcXVpekNvbXBsZXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmVzZXRRdWl6KCk7XG4gICAgcXVpei5jbGVhbigpO1xuICAgIHRpbWVyLnN0b3AoKTtcbiAgICBoaWdoc2NvcmUuc2F2ZVRvTG9jYWwobmFtZUJveC52YWx1ZSk7XG4gICAgaGlnaHNjb3JlLmRpc3BsYXkoKTtcbiAgICB0aW1lci5jbGVhbigpO1xuICAgIHF1aXoucXVpekNvbXBsZXRlKCk7XG4gICAgc3VibWl0LmNsYXNzTGlzdC50b2dnbGUoXCJ2aXNpYmxlXCIpO1xuICAgIHN1Ym1pdC5jbGFzc0xpc3QudG9nZ2xlKFwiaGlkZGVuXCIpO1xuICAgIGxpc3QuY2xhc3NMaXN0LnRvZ2dsZShcImhpZGRlblwiKTtcbiAgICByZXN0YXJ0LmNsYXNzTGlzdC50b2dnbGUoXCJoaWRkZW5cIik7XG4gICAgcmVzdGFydC5jbGFzc0xpc3QudG9nZ2xlKFwidmlzaWJsZVwiKTtcbiAgICB0aW1lckRpdi5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xufTtcblxudmFyIGdhbWVGYWlsZWQgPSBmdW5jdGlvbigpIHtcbiAgICBjbGVhblVwKCk7XG4gICAgdGltZXIuc3RvcCgpO1xuICAgIHRpbWVyLmNsZWFuKCk7XG4gICAgcXVpei5nYW1lT3ZlcigpO1xuICAgIGxpc3QuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcbiAgICByZXN0YXJ0LmNsYXNzTGlzdC50b2dnbGUoXCJoaWRkZW5cIik7XG4gICAgcmVzdGFydC5jbGFzc0xpc3QudG9nZ2xlKFwidmlzaWJsZVwiKTtcbn07XG5cbi8vR0VUIHJlcXVlc3QgdG8gdGhlIHNlcnZlclxudmFyIGdldFJlcSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh1cmxRKSB7XG4gICAgICAgIGFqYXgucmVxdWVzdEdldCh1cmxRLCBmdW5jdGlvbihlcnJvciwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHZhciBhbHRzID0gSlNPTi5wYXJzZShyZXNwb25zZSkuYWx0ZXJuYXRpdmVzO1xuICAgICAgICAgICAgdmFyIHF1ZXN0cyA9IEpTT04ucGFyc2UocmVzcG9uc2UpLnF1ZXN0aW9uO1xuICAgICAgICAgICAgcmVxdWVzdElkID0gSlNPTi5wYXJzZShyZXNwb25zZSkuaWQ7XG4gICAgICAgICAgICBxdWl6LmNyZWF0ZVRlbXBsYXRlKGksIHF1ZXN0cywgYWx0cyk7XG4gICAgICAgICAgICB1cmxBID0gSlNPTi5wYXJzZShyZXNwb25zZSkubmV4dFVSTDtcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuLy9TdGFydHMgdGhlIHF1aXpcbnN0YXJ0UXVpei5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubmFtZUJveFwiKS52YWx1ZSkge1xuICAgICAgICBzdGFydFF1aXouY2xhc3NMaXN0LnRvZ2dsZShcImhpZGRlblwiKTtcbiAgICAgICAgc3RhcnRRdWl6LmNsYXNzTGlzdC50b2dnbGUoXCJ2aXNpYmxlXCIpO1xuICAgICAgICBxdWl6LmNsZWFuKCk7XG4gICAgICAgIGNsZWFuVXAoKTtcbiAgICAgICAgZ2V0UmVxKCk7XG4gICAgICAgIHRpbWVyRGl2LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XG4gICAgICAgIHRpbWVyLnN0b3AoKTtcbiAgICAgICAgdGltZXIuc3RhcnQoZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vQ2FsbGJhY2sgZnVuY3Rpb24gd2hlbiB0aW1lIHJ1bnMgb3V0XG4gICAgICAgIGdhbWVGYWlsZWQoKTtcbiAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBuYW1lQm94LmNsYXNzTGlzdC5yZW1vdmUoXCJncmVlblwiKTtcbiAgICAgICAgbmFtZUJveC5jbGFzc0xpc3QuYWRkKFwicmVkXCIpO1xuICAgIH1cbn0pO1xuXG5yZXN0YXJ0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICBsb2NhdGlvbi5yZWxvYWQoKTtcbn0pO1xuXG5uYW1lQm94LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBmdW5jdGlvbigpIHtcbiAgICBuYW1lQm94LmNsYXNzTGlzdC5yZW1vdmUoXCJyZWRcIik7XG4gICAgbmFtZUJveC5jbGFzc0xpc3QuYWRkKFwiZ3JlZW5cIik7XG59KTtcblxuLy9Qb3N0cyB0aGUgYW5zd2VyIHRvIHRoZSBzZXJ2ZXJcbnN1Ym1pdC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgdmFyIGpzb25PYmogPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGFuc3dlcjogcXVpei5hbnN3ZXIoaSlcbiAgICB9KTtcblxuICAgIGlmIChxdWl6LmFuc3dlcihpKSkge1xuICAgICAgICBhamF4LnJlcXVlc3Qoe21ldGhvZDogXCJQT1NUXCIsIHVybDogdXJsQSwgYW5zd2VyOiBqc29uT2JqfSwgZnVuY3Rpb24oZXJyb3IsIHJlc3BvbnNlKSB7XG4gICAgICAgIHF1aXouY2xlYW4oKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICgoZXJyb3IgPT09IG51bGwgfHwgZXJyb3IgPCA0MDApICYmIEpTT04ucGFyc2UocmVzcG9uc2UpLm5leHRVUkwpIHtcbiAgICAgICAgICAgICAgICB1cmxRID0gSlNPTi5wYXJzZShyZXNwb25zZSkubmV4dFVSTDtcbiAgICAgICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICAgICAgZ2V0UmVxKCk7XG4gICAgICAgICAgICAgICAgdGltZXJEaXYuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcbiAgICAgICAgICAgICAgICB0aW1lci5zdG9wKCk7XG4gICAgICAgICAgICAgICAgdGltZXIuc3RhcnQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgLy9DYWxsYmFjayBmdW5jdGlvbiB3aGVuIHRpbWUgcnVucyBvdXRcbiAgICAgICAgICAgICAgICBnYW1lRmFpbGVkKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IgPj0gNDAwICYmIEpTT04ucGFyc2UocmVzcG9uc2UpLm5leHRVUkwpIHtcbiAgICAgICAgICAgICAgICBnYW1lRmFpbGVkKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHF1aXpDb21wbGV0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnJvciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiWW91IGFuc3dlcmVkIHdyb25nLCB0cnkgYWdhaW4hIFwiICsgZXJyKTtcbiAgICAgICAgICAgICAgICBnYW1lRmFpbGVkKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHF1aXpDb21wbGV0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG4gICAgfVxuXG59KTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB0aW1lciA9IHJlcXVpcmUoXCIuL3RpbWVyXCIpO1xudmFyIG9ialRvU2F2ZSA9IFtdO1xudmFyIG9iakZldGNoZWQgPSBbXTtcblxuZnVuY3Rpb24gZGlzcGxheSgpIHtcbiAgICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb2JqVG9TYXZlLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHZhciBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtcbiAgICAgICAgbGkuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoKGkgKyAxKSArIFwiLiBQbGF5ZXI6IFwiICsgb2JqVG9TYXZlW2ldLm5hbWUgKyBcIiAtIFRpbWU6IFwiICsgb2JqVG9TYXZlW2ldLnRpbWUpKTtcbiAgICAgICAgZnJhZy5hcHBlbmRDaGlsZChsaSk7XG4gICAgfVxuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5oaWdoU2NvcmVcIikuYXBwZW5kQ2hpbGQoZnJhZyk7XG5cbn1cblxuZnVuY3Rpb24gc2F2ZVRvTG9jYWwocGxheWVyKSB7XG4gICAgdmFyIGhpZ2hTY29yZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiaGlnaFNjb3JlXCIpO1xuICAgIHZhciBvYmpUb1B1c2ggPSB7XG4gICAgICAgIG5hbWU6IHBsYXllcixcbiAgICAgICAgdGltZTogdGltZXIuZGlzcGxheSgpXG4gICAgfTtcblxuICAgIG9iakZldGNoZWQgPSBKU09OLnBhcnNlKGhpZ2hTY29yZSk7XG5cbiAgICBpZiAob2JqRmV0Y2hlZCkge1xuICAgICAgICBpZiAob2JqRmV0Y2hlZC5sZW5ndGggPCA1KSB7XG4gICAgICAgICAgICBvYmpUb1NhdmUgPSBvYmpGZXRjaGVkO1xuICAgICAgICAgICAgb2JqVG9TYXZlLnB1c2gob2JqVG9QdXNoKTtcbiAgICAgICAgICAgIG9ialRvU2F2ZS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChhLnRpbWUpIC0gcGFyc2VGbG9hdChiLnRpbWUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSBlbHNlIGlmIChvYmpGZXRjaGVkLmxlbmd0aCA+PSA1KSB7XG4gICAgICAgICAgICBpZiAodGltZXIuZGlzcGxheSgpIDwgb2JqRmV0Y2hlZFs0XSkge1xuICAgICAgICAgICAgICAgIG9iakZldGNoZWQucG9wKCk7XG4gICAgICAgICAgICAgICAgb2JqVG9TYXZlID0gb2JqRmV0Y2hlZDtcbiAgICAgICAgICAgICAgICBvYmpUb1NhdmUucHVzaChvYmpUb1B1c2gpO1xuICAgICAgICAgICAgICAgIG9ialRvU2F2ZS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoYS50aW1lKSAtIHBhcnNlRmxvYXQoYi50aW1lKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgb2JqVG9TYXZlLnB1c2gob2JqVG9QdXNoKTtcbiAgICB9XG5cbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImhpZ2hTY29yZVwiLCBKU09OLnN0cmluZ2lmeShvYmpUb1NhdmUpKTtcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBkaXNwbGF5OiBkaXNwbGF5LFxuICAgIHNhdmVUb0xvY2FsOiBzYXZlVG9Mb2NhbFxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgdGVtcGxhdGUgPSBmdW5jdGlvbihxdWVzdCkge1xuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGVcIiArIHF1ZXN0KTtcbiAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5hcmVhXCIpLmFwcGVuZENoaWxkKG5vZGUpO1xufTtcblxudmFyIGNsZWFuID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5hcmVhXCIpO1xuICAgIHdoaWxlIChlbC5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICAgICAgZWwucmVtb3ZlQ2hpbGQoZWwubGFzdENoaWxkKTtcbiAgICB9XG59O1xuXG52YXIgZ2FtZU92ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2VuZFRlbXBsYXRlXCIpO1xuICAgIHZhciBub2RlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmFyZWFcIikuYXBwZW5kQ2hpbGQobm9kZSk7XG59O1xuXG52YXIgcXVpekNvbXBsZXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNxdWl6Q29tcGxldGVcIik7XG4gICAgdmFyIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYXJlYVwiKS5hcHBlbmRDaGlsZChub2RlKTtcbn07XG5cbnZhciBhbnN3ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYW5zd2VyVGV4dDtcbiAgICB2YXIgcmFkaW9zID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeU5hbWUoXCJyYWRpb1wiKTtcbiAgICB2YXIgdmFsdWU7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCByYWRpb3MubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgaWYgKHJhZGlvc1tqXS5jaGVja2VkKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHJhZGlvc1tqXS52YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmlucHV0Qm94XCIpKSB7XG4gICAgICAgIGFuc3dlclRleHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmlucHV0Qm94XCIpLnZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGFuc3dlclRleHQgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gYW5zd2VyVGV4dDtcblxufTtcblxudmFyIGdlblJhZGlvID0gZnVuY3Rpb24oYWx0ZXJuYXRpdmVzKSB7XG4gICAgdmFyIGFsdHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhhbHRlcm5hdGl2ZXMpO1xuICAgIHZhciBudW1BbHQgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhhbHRlcm5hdGl2ZXMpLmxlbmd0aDtcbiAgICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IG51bUFsdDsgaiArPSAxKSB7XG4gICAgICAgIHZhciByYWRpbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcbiAgICAgICAgdmFyIGFsdFRleHQgPSBhbHRzW2pdO1xuICAgICAgICB2YXIgYWx0ID0gYWx0ZXJuYXRpdmVzW2FsdFRleHRdO1xuICAgICAgICB2YXIgdGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGFsdCk7XG4gICAgICAgIHJhZGlvLnRpdGxlID0gKGogKyAxKTtcbiAgICAgICAgcmFkaW8udHlwZSA9IFwicmFkaW9cIjtcbiAgICAgICAgcmFkaW8ubmFtZSA9IFwicmFkaW9cIjtcbiAgICAgICAgcmFkaW8udmFsdWUgPSBhbHRzW2pdO1xuICAgICAgICBmcmFnLmFwcGVuZENoaWxkKHJhZGlvKTtcbiAgICAgICAgZnJhZy5hcHBlbmRDaGlsZCh0ZXh0KTtcbiAgICAgICAgZnJhZy5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnJcIikpO1xuICAgICAgICByYWRpby5jbGFzc0xpc3QuYWRkKFwicmFkaW9cIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZyYWc7XG59O1xuXG52YXIgZ2VuSW5wdXQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaW5wdXRCb3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gICAgaW5wdXRCb3gudHlwZSA9IFwidGV4dFwiO1xuICAgIGlucHV0Qm94LnBsYWNlaG9sZGVyID0gXCJZb3VyIGFuc3dlciBoZXJlLi5cIjtcbiAgICBpbnB1dEJveC5jbGFzc0xpc3QuYWRkKFwiaW5wdXRCb3hcIik7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5pbnB1dERpdlwiKS5hcHBlbmRDaGlsZChpbnB1dEJveCk7XG4gICAgaW5wdXRCb3guZm9jdXMoKTtcbn07XG5cbnZhciBjcmVhdGVUZW1wbGF0ZSA9IGZ1bmN0aW9uKGksIHF1ZXN0aW9uLCBhbHRlcm5hdGl2ZXMpIHtcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlXCIpO1xuICAgIHZhciBub2RlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmFyZWFcIikuYXBwZW5kQ2hpbGQobm9kZSk7XG5cbiAgICB2YXIgdGl0bGVOciA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGkpO1xuICAgIHZhciBxdWVzdGlvbk5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShxdWVzdGlvbik7XG4gICAgdmFyIHRleHRDbGFzcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV4dFwiKTtcblxuICAgIHRleHRDbGFzcy5hcHBlbmRDaGlsZChxdWVzdGlvbk5vZGUpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGl0bGVcIikuYXBwZW5kQ2hpbGQodGl0bGVOcik7XG5cbiAgICBpZiAoYWx0ZXJuYXRpdmVzKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucmFkaW9EaXZcIikuYXBwZW5kQ2hpbGQoZ2VuUmFkaW8oYWx0ZXJuYXRpdmVzKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZ2VuSW5wdXQoKTtcbiAgICB9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHRlbXBsYXRlOnRlbXBsYXRlLFxuICAgIGNsZWFuOmNsZWFuLFxuICAgIGdhbWVPdmVyOmdhbWVPdmVyLFxuICAgIGFuc3dlcjphbnN3ZXIsXG4gICAgY3JlYXRlVGVtcGxhdGU6Y3JlYXRlVGVtcGxhdGUsXG4gICAgcXVpekNvbXBsZXRlOnF1aXpDb21wbGV0ZVxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgdDtcbnZhciBkZWZhdWx0VGltZSA9IDIwO1xudmFyIHNlY29uZHMgPSBkZWZhdWx0VGltZTtcbnZhciBzdGFydFRpbWUgPSAwO1xudmFyIGVuZFRpbWUgPSAwO1xudmFyIHRvdGFsVGltZSA9IDA7XG52YXIgc2F2ZWRUaW1lID0gMDtcblxuZnVuY3Rpb24gZ2V0RGF0ZSgpIHtcbiAgICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gICAgcmV0dXJuIGQuZ2V0VGltZSgpO1xufVxuXG5mdW5jdGlvbiBzdGFydChjYWxsYmFjaykge1xuICAgIHZhciBkaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RpbWVyXCIpO1xuICAgIHQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgICAgc2Vjb25kcyAtPSAwLjE7XG4gICAgICAgIGRpdi50ZXh0Q29udGVudCA9IHNlY29uZHMudG9GaXhlZCgwKTtcbiAgICAgICAgaWYgKHNlY29uZHMgPD0gMCkge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgIH0sIDEwMCk7XG5cbiAgICBzdGFydFRpbWUgPSBnZXREYXRlKCk7XG59XG5cbmZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgZW5kVGltZSA9IGdldERhdGUoKTtcbiAgICBzYXZlZFRpbWUgPSAoZW5kVGltZSAtIHN0YXJ0VGltZSkgLyAxMDAwO1xuICAgIGlmIChzYXZlZFRpbWUgPD0gZGVmYXVsdFRpbWUpIHtcbiAgICAgICAgdG90YWxUaW1lICs9IHNhdmVkVGltZTtcbiAgICB9XG5cbiAgICBjbGVhckludGVydmFsKHQpO1xuICAgIHNlY29uZHMgPSBkZWZhdWx0VGltZTtcbn1cblxuZnVuY3Rpb24gY2xlYW4oKSB7XG4gICAgc3RhcnRUaW1lID0gMDtcbiAgICBlbmRUaW1lID0gMDtcbiAgICB0b3RhbFRpbWUgPSAwO1xuICAgIHNhdmVkVGltZSA9IDA7XG59XG5cbmZ1bmN0aW9uIGRpc3BsYXkoKSB7XG4gICAgcmV0dXJuIHRvdGFsVGltZS50b0ZpeGVkKDMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzdGFydDogc3RhcnQsXG4gICAgc3RvcDogc3RvcCxcbiAgICBkaXNwbGF5OiBkaXNwbGF5LFxuICAgIGNsZWFuOiBjbGVhblxufTtcbiJdfQ==
