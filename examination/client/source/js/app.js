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

