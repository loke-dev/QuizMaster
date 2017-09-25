(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
/**
 * Function to post answer to the server with callback function
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


//GET request
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
var defaultURL = "http://vhost3.lnu.se:20080/question/1";
var urlQ = urlQ || defaultURL;
var urlA;
var requestId;
var i = 1;

//Reset all the URL's
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

//Calls several functions when game is over
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

//Calls several functions when the players answer is wrong
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

//Starts the quiz on button click
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

//reloads the page when restart button is pressed
restart.addEventListener("click", function() {
    location.reload();
});

//Check to see if the input box for playername contains letters
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

//Prints the highscore on screen in a list
function display() {
    var frag = document.createDocumentFragment();

    for (var i = 0; i < objToSave.length; i += 1) {
        var li = document.createElement("li");
        li.appendChild(document.createTextNode((i + 1) + ". Player: " + objToSave[i].name + " - Time: " + objToSave[i].time));
        frag.appendChild(li);
    }

    document.querySelector(".highScore").appendChild(frag);

}

//Handles the fetching, sorting, adding and pushing up to local storage
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

//Function to clean the area which templates are appended to
var clean = function() {
    var el = document.querySelector(".area");
    while (el.hasChildNodes()) {
        el.removeChild(el.lastChild);
    }
};

//Template for when the game is over
var gameOver = function() {
    var template = document.querySelector("#endTemplate");
    var node = document.importNode(template.content, true);
    document.querySelector(".area").appendChild(node);
};

//Template for when the game is complete
var quizComplete = function() {
    var template = document.querySelector("#quizComplete");
    var node = document.importNode(template.content, true);
    document.querySelector(".area").appendChild(node);
};

//Function that handles the extraction of answer from inputbox or radiobuttons
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

//Function that generates radiobuttons
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

//Function that generates a inputbox
var genInput = function() {
    var inputBox = document.createElement("input");
    inputBox.type = "text";
    inputBox.placeholder = "Your answer here..";
    inputBox.classList.add("inputBox");
    document.querySelector(".inputDiv").appendChild(inputBox);
    inputBox.focus();
};

//Creates a template for each question
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

//Grabs the current time
function getDate() {
    var d = new Date();
    return d.getTime();
}

//Starts the timer with callback function that gets called when the time runs out
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

//Stop the timer
function stop() {
    endTime = getDate();
    savedTime = (endTime - startTime) / 1000;
    if (savedTime <= defaultTime) {
        totalTime += savedTime;
    }

    clearInterval(t);
    seconds = defaultTime;
}

//Clears all the timer variables
function clean() {
    startTime = 0;
    endTime = 0;
    totalTime = 0;
    savedTime = 0;
}

//Returns the total time for current game
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMS4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYWpheC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9oaWdoc2NvcmUuanMiLCJjbGllbnQvc291cmNlL2pzL3F1aXouanMiLCJjbGllbnQvc291cmNlL2pzL3RpbWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuLyoqXG4gKiBGdW5jdGlvbiB0byBwb3N0IGFuc3dlciB0byB0aGUgc2VydmVyIHdpdGggY2FsbGJhY2sgZnVuY3Rpb25cbiAqIEBwYXJhbSBjb25maWdcbiAqIEBwYXJhbSBjYWxsYmFja1xuICovXG5mdW5jdGlvbiByZXF1ZXN0KGNvbmZpZywgY2FsbGJhY2spIHtcblxuICAgIGNvbmZpZy51cmwgPSBjb25maWcudXJsIHx8IFwiXCI7XG4gICAgY29uZmlnLm1ldGhvZCA9IGNvbmZpZy5tZXRob2QgfHwgXCJwb3N0XCI7XG4gICAgY29uZmlnLmNvbnRlbnR0eXBlID0gY29uZmlnLmNvbnRlbnR0eXBlIHx8IFwiYXBwbGljYXRpb24vanNvblwiO1xuICAgIGNvbmZpZy5hbnN3ZXIgPSBjb25maWcuYW5zd2VyIHx8IG51bGw7XG5cbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICByZXEuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgaWYgKHJlcS5zdGF0dXMgPj0gNDAwKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhyZXEuc3RhdHVzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHJlcS5yZXNwb25zZVRleHQpO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIHJlcS5vcGVuKGNvbmZpZy5tZXRob2QsIGNvbmZpZy51cmwpO1xuICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIGNvbmZpZy5jb250ZW50dHlwZSk7XG4gICAgcmVxLnNlbmQoY29uZmlnLmFuc3dlcik7XG59XG5cblxuLy9HRVQgcmVxdWVzdFxuZnVuY3Rpb24gcmVxdWVzdEdldCh1cmwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHJlcUdldCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgcmVxR2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIGlmIChyZXFHZXQuc3RhdHVzID49IDQwMCkge1xuICAgICAgICAgICAgY2FsbGJhY2socmVxR2V0LnN0YXR1cyk7XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjayhudWxsLCByZXFHZXQucmVzcG9uc2VUZXh0KTtcblxuICAgIH0pO1xuXG4gICAgcmVxR2V0Lm9wZW4oXCJHRVRcIiwgdXJsKTtcbiAgICByZXFHZXQuc2VuZCgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICByZXF1ZXN0OiByZXF1ZXN0LFxuICAgIHJlcXVlc3RHZXQ6IHJlcXVlc3RHZXRcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qXG4gQGF1dGhvciAtIExva2UgQ2FybHNzb25cbiAqL1xuXG52YXIgcXVpeiA9IHJlcXVpcmUoXCIuL3F1aXpcIik7XG52YXIgYWpheCA9IHJlcXVpcmUoXCIuL2FqYXhcIik7XG52YXIgdGltZXIgPSByZXF1aXJlKFwiLi90aW1lclwiKTtcbnZhciBoaWdoc2NvcmUgPSByZXF1aXJlKFwiLi9oaWdoc2NvcmVcIik7XG52YXIgc3VibWl0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdWJtaXRcIik7XG52YXIgc3RhcnRRdWl6ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGFydFF1aXpcIik7XG52YXIgbGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuaGlnaFNjb3JlXCIpO1xudmFyIHJlc3RhcnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Jlc3RhcnRcIik7XG52YXIgdGltZXJEaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RpbWVyXCIpO1xudmFyIG5hbWVCb3ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLm5hbWVCb3hcIik7XG52YXIgZGVmYXVsdFVSTCA9IFwiaHR0cDovL3Zob3N0My5sbnUuc2U6MjAwODAvcXVlc3Rpb24vMVwiO1xudmFyIHVybFEgPSB1cmxRIHx8IGRlZmF1bHRVUkw7XG52YXIgdXJsQTtcbnZhciByZXF1ZXN0SWQ7XG52YXIgaSA9IDE7XG5cbi8vUmVzZXQgYWxsIHRoZSBVUkwnc1xudmFyIHJlc2V0UXVpeiA9IGZ1bmN0aW9uKCkge1xuICAgIHVybFEgPSBkZWZhdWx0VVJMO1xuICAgIHVybEEgPSBcIlwiO1xufTtcblxuLy9DbGVhbiB1cCBzb21lIHRoaW5ncyBmb3IgYSBuZXcgZ2FtZVxudmFyIGNsZWFuVXAgPSBmdW5jdGlvbigpIHtcbiAgICBzdWJtaXQuY2xhc3NMaXN0LnRvZ2dsZShcInZpc2libGVcIik7XG4gICAgc3VibWl0LmNsYXNzTGlzdC50b2dnbGUoXCJoaWRkZW5cIik7XG4gICAgdGltZXJEaXYuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcbiAgICByZXNldFF1aXooKTtcbiAgICBxdWl6LmNsZWFuKCk7XG59O1xuXG4vL0NhbGxzIHNldmVyYWwgZnVuY3Rpb25zIHdoZW4gZ2FtZSBpcyBvdmVyXG52YXIgcXVpekNvbXBsZXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmVzZXRRdWl6KCk7XG4gICAgcXVpei5jbGVhbigpO1xuICAgIHRpbWVyLnN0b3AoKTtcbiAgICBoaWdoc2NvcmUuc2F2ZVRvTG9jYWwobmFtZUJveC52YWx1ZSk7XG4gICAgaGlnaHNjb3JlLmRpc3BsYXkoKTtcbiAgICB0aW1lci5jbGVhbigpO1xuICAgIHF1aXoucXVpekNvbXBsZXRlKCk7XG4gICAgc3VibWl0LmNsYXNzTGlzdC50b2dnbGUoXCJ2aXNpYmxlXCIpO1xuICAgIHN1Ym1pdC5jbGFzc0xpc3QudG9nZ2xlKFwiaGlkZGVuXCIpO1xuICAgIGxpc3QuY2xhc3NMaXN0LnRvZ2dsZShcImhpZGRlblwiKTtcbiAgICByZXN0YXJ0LmNsYXNzTGlzdC50b2dnbGUoXCJoaWRkZW5cIik7XG4gICAgcmVzdGFydC5jbGFzc0xpc3QudG9nZ2xlKFwidmlzaWJsZVwiKTtcbiAgICB0aW1lckRpdi5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xufTtcblxuLy9DYWxscyBzZXZlcmFsIGZ1bmN0aW9ucyB3aGVuIHRoZSBwbGF5ZXJzIGFuc3dlciBpcyB3cm9uZ1xudmFyIGdhbWVGYWlsZWQgPSBmdW5jdGlvbigpIHtcbiAgICBjbGVhblVwKCk7XG4gICAgdGltZXIuc3RvcCgpO1xuICAgIHRpbWVyLmNsZWFuKCk7XG4gICAgcXVpei5nYW1lT3ZlcigpO1xuICAgIGxpc3QuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcbiAgICByZXN0YXJ0LmNsYXNzTGlzdC50b2dnbGUoXCJoaWRkZW5cIik7XG4gICAgcmVzdGFydC5jbGFzc0xpc3QudG9nZ2xlKFwidmlzaWJsZVwiKTtcbn07XG5cbi8vR0VUIHJlcXVlc3QgdG8gdGhlIHNlcnZlclxudmFyIGdldFJlcSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh1cmxRKSB7XG4gICAgICAgIGFqYXgucmVxdWVzdEdldCh1cmxRLCBmdW5jdGlvbihlcnJvciwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHZhciBhbHRzID0gSlNPTi5wYXJzZShyZXNwb25zZSkuYWx0ZXJuYXRpdmVzO1xuICAgICAgICAgICAgdmFyIHF1ZXN0cyA9IEpTT04ucGFyc2UocmVzcG9uc2UpLnF1ZXN0aW9uO1xuICAgICAgICAgICAgcmVxdWVzdElkID0gSlNPTi5wYXJzZShyZXNwb25zZSkuaWQ7XG4gICAgICAgICAgICBxdWl6LmNyZWF0ZVRlbXBsYXRlKGksIHF1ZXN0cywgYWx0cyk7XG4gICAgICAgICAgICB1cmxBID0gSlNPTi5wYXJzZShyZXNwb25zZSkubmV4dFVSTDtcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuLy9TdGFydHMgdGhlIHF1aXogb24gYnV0dG9uIGNsaWNrXG5zdGFydFF1aXouYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLm5hbWVCb3hcIikudmFsdWUpIHtcbiAgICAgICAgc3RhcnRRdWl6LmNsYXNzTGlzdC50b2dnbGUoXCJoaWRkZW5cIik7XG4gICAgICAgIHN0YXJ0UXVpei5jbGFzc0xpc3QudG9nZ2xlKFwidmlzaWJsZVwiKTtcbiAgICAgICAgcXVpei5jbGVhbigpO1xuICAgICAgICBjbGVhblVwKCk7XG4gICAgICAgIGdldFJlcSgpO1xuICAgICAgICB0aW1lckRpdi5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xuICAgICAgICB0aW1lci5zdG9wKCk7XG4gICAgICAgIHRpbWVyLnN0YXJ0KGZ1bmN0aW9uKCkge1xuICAgICAgICAvL0NhbGxiYWNrIGZ1bmN0aW9uIHdoZW4gdGltZSBydW5zIG91dFxuICAgICAgICBnYW1lRmFpbGVkKCk7XG4gICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbmFtZUJveC5jbGFzc0xpc3QucmVtb3ZlKFwiZ3JlZW5cIik7XG4gICAgICAgIG5hbWVCb3guY2xhc3NMaXN0LmFkZChcInJlZFwiKTtcbiAgICB9XG59KTtcblxuLy9yZWxvYWRzIHRoZSBwYWdlIHdoZW4gcmVzdGFydCBidXR0b24gaXMgcHJlc3NlZFxucmVzdGFydC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgbG9jYXRpb24ucmVsb2FkKCk7XG59KTtcblxuLy9DaGVjayB0byBzZWUgaWYgdGhlIGlucHV0IGJveCBmb3IgcGxheWVybmFtZSBjb250YWlucyBsZXR0ZXJzXG5uYW1lQm94LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBmdW5jdGlvbigpIHtcbiAgICBuYW1lQm94LmNsYXNzTGlzdC5yZW1vdmUoXCJyZWRcIik7XG4gICAgbmFtZUJveC5jbGFzc0xpc3QuYWRkKFwiZ3JlZW5cIik7XG59KTtcblxuLy9Qb3N0cyB0aGUgYW5zd2VyIHRvIHRoZSBzZXJ2ZXJcbnN1Ym1pdC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgdmFyIGpzb25PYmogPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGFuc3dlcjogcXVpei5hbnN3ZXIoaSlcbiAgICB9KTtcblxuICAgIGlmIChxdWl6LmFuc3dlcihpKSkge1xuICAgICAgICBhamF4LnJlcXVlc3Qoe21ldGhvZDogXCJQT1NUXCIsIHVybDogdXJsQSwgYW5zd2VyOiBqc29uT2JqfSwgZnVuY3Rpb24oZXJyb3IsIHJlc3BvbnNlKSB7XG4gICAgICAgIHF1aXouY2xlYW4oKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICgoZXJyb3IgPT09IG51bGwgfHwgZXJyb3IgPCA0MDApICYmIEpTT04ucGFyc2UocmVzcG9uc2UpLm5leHRVUkwpIHtcbiAgICAgICAgICAgICAgICB1cmxRID0gSlNPTi5wYXJzZShyZXNwb25zZSkubmV4dFVSTDtcbiAgICAgICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICAgICAgZ2V0UmVxKCk7XG4gICAgICAgICAgICAgICAgdGltZXJEaXYuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcbiAgICAgICAgICAgICAgICB0aW1lci5zdG9wKCk7XG4gICAgICAgICAgICAgICAgdGltZXIuc3RhcnQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgLy9DYWxsYmFjayBmdW5jdGlvbiB3aGVuIHRpbWUgcnVucyBvdXRcbiAgICAgICAgICAgICAgICBnYW1lRmFpbGVkKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IgPj0gNDAwICYmIEpTT04ucGFyc2UocmVzcG9uc2UpLm5leHRVUkwpIHtcbiAgICAgICAgICAgICAgICBnYW1lRmFpbGVkKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHF1aXpDb21wbGV0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnJvciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiWW91IGFuc3dlcmVkIHdyb25nLCB0cnkgYWdhaW4hIFwiICsgZXJyKTtcbiAgICAgICAgICAgICAgICBnYW1lRmFpbGVkKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHF1aXpDb21wbGV0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG4gICAgfVxuXG59KTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB0aW1lciA9IHJlcXVpcmUoXCIuL3RpbWVyXCIpO1xudmFyIG9ialRvU2F2ZSA9IFtdO1xudmFyIG9iakZldGNoZWQgPSBbXTtcblxuLy9QcmludHMgdGhlIGhpZ2hzY29yZSBvbiBzY3JlZW4gaW4gYSBsaXN0XG5mdW5jdGlvbiBkaXNwbGF5KCkge1xuICAgIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvYmpUb1NhdmUubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdmFyIGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO1xuICAgICAgICBsaS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgoaSArIDEpICsgXCIuIFBsYXllcjogXCIgKyBvYmpUb1NhdmVbaV0ubmFtZSArIFwiIC0gVGltZTogXCIgKyBvYmpUb1NhdmVbaV0udGltZSkpO1xuICAgICAgICBmcmFnLmFwcGVuZENoaWxkKGxpKTtcbiAgICB9XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmhpZ2hTY29yZVwiKS5hcHBlbmRDaGlsZChmcmFnKTtcblxufVxuXG4vL0hhbmRsZXMgdGhlIGZldGNoaW5nLCBzb3J0aW5nLCBhZGRpbmcgYW5kIHB1c2hpbmcgdXAgdG8gbG9jYWwgc3RvcmFnZVxuZnVuY3Rpb24gc2F2ZVRvTG9jYWwocGxheWVyKSB7XG4gICAgdmFyIGhpZ2hTY29yZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiaGlnaFNjb3JlXCIpO1xuICAgIHZhciBvYmpUb1B1c2ggPSB7XG4gICAgICAgIG5hbWU6IHBsYXllcixcbiAgICAgICAgdGltZTogdGltZXIuZGlzcGxheSgpXG4gICAgfTtcblxuICAgIG9iakZldGNoZWQgPSBKU09OLnBhcnNlKGhpZ2hTY29yZSk7XG5cbiAgICBpZiAob2JqRmV0Y2hlZCkge1xuICAgICAgICBpZiAob2JqRmV0Y2hlZC5sZW5ndGggPCA1KSB7XG4gICAgICAgICAgICBvYmpUb1NhdmUgPSBvYmpGZXRjaGVkO1xuICAgICAgICAgICAgb2JqVG9TYXZlLnB1c2gob2JqVG9QdXNoKTtcbiAgICAgICAgICAgIG9ialRvU2F2ZS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChhLnRpbWUpIC0gcGFyc2VGbG9hdChiLnRpbWUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSBlbHNlIGlmIChvYmpGZXRjaGVkLmxlbmd0aCA+PSA1KSB7XG4gICAgICAgICAgICBpZiAodGltZXIuZGlzcGxheSgpIDwgb2JqRmV0Y2hlZFs0XSkge1xuICAgICAgICAgICAgICAgIG9iakZldGNoZWQucG9wKCk7XG4gICAgICAgICAgICAgICAgb2JqVG9TYXZlID0gb2JqRmV0Y2hlZDtcbiAgICAgICAgICAgICAgICBvYmpUb1NhdmUucHVzaChvYmpUb1B1c2gpO1xuICAgICAgICAgICAgICAgIG9ialRvU2F2ZS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoYS50aW1lKSAtIHBhcnNlRmxvYXQoYi50aW1lKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgb2JqVG9TYXZlLnB1c2gob2JqVG9QdXNoKTtcbiAgICB9XG5cbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImhpZ2hTY29yZVwiLCBKU09OLnN0cmluZ2lmeShvYmpUb1NhdmUpKTtcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBkaXNwbGF5OiBkaXNwbGF5LFxuICAgIHNhdmVUb0xvY2FsOiBzYXZlVG9Mb2NhbFxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vL0Z1bmN0aW9uIHRvIGNsZWFuIHRoZSBhcmVhIHdoaWNoIHRlbXBsYXRlcyBhcmUgYXBwZW5kZWQgdG9cbnZhciBjbGVhbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYXJlYVwiKTtcbiAgICB3aGlsZSAoZWwuaGFzQ2hpbGROb2RlcygpKSB7XG4gICAgICAgIGVsLnJlbW92ZUNoaWxkKGVsLmxhc3RDaGlsZCk7XG4gICAgfVxufTtcblxuLy9UZW1wbGF0ZSBmb3Igd2hlbiB0aGUgZ2FtZSBpcyBvdmVyXG52YXIgZ2FtZU92ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2VuZFRlbXBsYXRlXCIpO1xuICAgIHZhciBub2RlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmFyZWFcIikuYXBwZW5kQ2hpbGQobm9kZSk7XG59O1xuXG4vL1RlbXBsYXRlIGZvciB3aGVuIHRoZSBnYW1lIGlzIGNvbXBsZXRlXG52YXIgcXVpekNvbXBsZXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNxdWl6Q29tcGxldGVcIik7XG4gICAgdmFyIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYXJlYVwiKS5hcHBlbmRDaGlsZChub2RlKTtcbn07XG5cbi8vRnVuY3Rpb24gdGhhdCBoYW5kbGVzIHRoZSBleHRyYWN0aW9uIG9mIGFuc3dlciBmcm9tIGlucHV0Ym94IG9yIHJhZGlvYnV0dG9uc1xudmFyIGFuc3dlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhbnN3ZXJUZXh0O1xuICAgIHZhciByYWRpb3MgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5TmFtZShcInJhZGlvXCIpO1xuICAgIHZhciB2YWx1ZTtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJhZGlvcy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICBpZiAocmFkaW9zW2pdLmNoZWNrZWQpIHtcbiAgICAgICAgICAgIHZhbHVlID0gcmFkaW9zW2pdLnZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuaW5wdXRCb3hcIikpIHtcbiAgICAgICAgYW5zd2VyVGV4dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuaW5wdXRCb3hcIikudmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYW5zd2VyVGV4dCA9IHZhbHVlO1xuICAgIH1cblxuICAgIHJldHVybiBhbnN3ZXJUZXh0O1xuXG59O1xuXG4vL0Z1bmN0aW9uIHRoYXQgZ2VuZXJhdGVzIHJhZGlvYnV0dG9uc1xudmFyIGdlblJhZGlvID0gZnVuY3Rpb24oYWx0ZXJuYXRpdmVzKSB7XG4gICAgdmFyIGFsdHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhhbHRlcm5hdGl2ZXMpO1xuICAgIHZhciBudW1BbHQgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhhbHRlcm5hdGl2ZXMpLmxlbmd0aDtcbiAgICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IG51bUFsdDsgaiArPSAxKSB7XG4gICAgICAgIHZhciByYWRpbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcbiAgICAgICAgdmFyIGFsdFRleHQgPSBhbHRzW2pdO1xuICAgICAgICB2YXIgYWx0ID0gYWx0ZXJuYXRpdmVzW2FsdFRleHRdO1xuICAgICAgICB2YXIgdGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGFsdCk7XG4gICAgICAgIHJhZGlvLnRpdGxlID0gKGogKyAxKTtcbiAgICAgICAgcmFkaW8udHlwZSA9IFwicmFkaW9cIjtcbiAgICAgICAgcmFkaW8ubmFtZSA9IFwicmFkaW9cIjtcbiAgICAgICAgcmFkaW8udmFsdWUgPSBhbHRzW2pdO1xuICAgICAgICBmcmFnLmFwcGVuZENoaWxkKHJhZGlvKTtcbiAgICAgICAgZnJhZy5hcHBlbmRDaGlsZCh0ZXh0KTtcbiAgICAgICAgZnJhZy5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnJcIikpO1xuICAgICAgICByYWRpby5jbGFzc0xpc3QuYWRkKFwicmFkaW9cIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZyYWc7XG59O1xuXG4vL0Z1bmN0aW9uIHRoYXQgZ2VuZXJhdGVzIGEgaW5wdXRib3hcbnZhciBnZW5JbnB1dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpbnB1dEJveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcbiAgICBpbnB1dEJveC50eXBlID0gXCJ0ZXh0XCI7XG4gICAgaW5wdXRCb3gucGxhY2Vob2xkZXIgPSBcIllvdXIgYW5zd2VyIGhlcmUuLlwiO1xuICAgIGlucHV0Qm94LmNsYXNzTGlzdC5hZGQoXCJpbnB1dEJveFwiKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmlucHV0RGl2XCIpLmFwcGVuZENoaWxkKGlucHV0Qm94KTtcbiAgICBpbnB1dEJveC5mb2N1cygpO1xufTtcblxuLy9DcmVhdGVzIGEgdGVtcGxhdGUgZm9yIGVhY2ggcXVlc3Rpb25cbnZhciBjcmVhdGVUZW1wbGF0ZSA9IGZ1bmN0aW9uKGksIHF1ZXN0aW9uLCBhbHRlcm5hdGl2ZXMpIHtcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlXCIpO1xuICAgIHZhciBub2RlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmFyZWFcIikuYXBwZW5kQ2hpbGQobm9kZSk7XG5cbiAgICB2YXIgdGl0bGVOciA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGkpO1xuICAgIHZhciBxdWVzdGlvbk5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShxdWVzdGlvbik7XG4gICAgdmFyIHRleHRDbGFzcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV4dFwiKTtcblxuICAgIHRleHRDbGFzcy5hcHBlbmRDaGlsZChxdWVzdGlvbk5vZGUpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGl0bGVcIikuYXBwZW5kQ2hpbGQodGl0bGVOcik7XG5cbiAgICBpZiAoYWx0ZXJuYXRpdmVzKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucmFkaW9EaXZcIikuYXBwZW5kQ2hpbGQoZ2VuUmFkaW8oYWx0ZXJuYXRpdmVzKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZ2VuSW5wdXQoKTtcbiAgICB9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGNsZWFuOmNsZWFuLFxuICAgIGdhbWVPdmVyOmdhbWVPdmVyLFxuICAgIGFuc3dlcjphbnN3ZXIsXG4gICAgY3JlYXRlVGVtcGxhdGU6Y3JlYXRlVGVtcGxhdGUsXG4gICAgcXVpekNvbXBsZXRlOnF1aXpDb21wbGV0ZVxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgdDtcbnZhciBkZWZhdWx0VGltZSA9IDIwO1xudmFyIHNlY29uZHMgPSBkZWZhdWx0VGltZTtcbnZhciBzdGFydFRpbWUgPSAwO1xudmFyIGVuZFRpbWUgPSAwO1xudmFyIHRvdGFsVGltZSA9IDA7XG52YXIgc2F2ZWRUaW1lID0gMDtcblxuLy9HcmFicyB0aGUgY3VycmVudCB0aW1lXG5mdW5jdGlvbiBnZXREYXRlKCkge1xuICAgIHZhciBkID0gbmV3IERhdGUoKTtcbiAgICByZXR1cm4gZC5nZXRUaW1lKCk7XG59XG5cbi8vU3RhcnRzIHRoZSB0aW1lciB3aXRoIGNhbGxiYWNrIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgd2hlbiB0aGUgdGltZSBydW5zIG91dFxuZnVuY3Rpb24gc3RhcnQoY2FsbGJhY2spIHtcbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0aW1lclwiKTtcbiAgICB0ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlY29uZHMgLT0gMC4xO1xuICAgICAgICBkaXYudGV4dENvbnRlbnQgPSBzZWNvbmRzLnRvRml4ZWQoMCk7XG4gICAgICAgIGlmIChzZWNvbmRzIDw9IDApIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICB9LCAxMDApO1xuXG4gICAgc3RhcnRUaW1lID0gZ2V0RGF0ZSgpO1xufVxuXG4vL1N0b3AgdGhlIHRpbWVyXG5mdW5jdGlvbiBzdG9wKCkge1xuICAgIGVuZFRpbWUgPSBnZXREYXRlKCk7XG4gICAgc2F2ZWRUaW1lID0gKGVuZFRpbWUgLSBzdGFydFRpbWUpIC8gMTAwMDtcbiAgICBpZiAoc2F2ZWRUaW1lIDw9IGRlZmF1bHRUaW1lKSB7XG4gICAgICAgIHRvdGFsVGltZSArPSBzYXZlZFRpbWU7XG4gICAgfVxuXG4gICAgY2xlYXJJbnRlcnZhbCh0KTtcbiAgICBzZWNvbmRzID0gZGVmYXVsdFRpbWU7XG59XG5cbi8vQ2xlYXJzIGFsbCB0aGUgdGltZXIgdmFyaWFibGVzXG5mdW5jdGlvbiBjbGVhbigpIHtcbiAgICBzdGFydFRpbWUgPSAwO1xuICAgIGVuZFRpbWUgPSAwO1xuICAgIHRvdGFsVGltZSA9IDA7XG4gICAgc2F2ZWRUaW1lID0gMDtcbn1cblxuLy9SZXR1cm5zIHRoZSB0b3RhbCB0aW1lIGZvciBjdXJyZW50IGdhbWVcbmZ1bmN0aW9uIGRpc3BsYXkoKSB7XG4gICAgcmV0dXJuIHRvdGFsVGltZS50b0ZpeGVkKDMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzdGFydDogc3RhcnQsXG4gICAgc3RvcDogc3RvcCxcbiAgICBkaXNwbGF5OiBkaXNwbGF5LFxuICAgIGNsZWFuOiBjbGVhblxufTtcbiJdfQ==
