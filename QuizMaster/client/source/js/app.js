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

