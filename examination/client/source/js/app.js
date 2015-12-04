/*
 @author - Loke Carlsson
 */

var quiz = require("./quiz");
var ajax = require("./ajax");
var submit = document.querySelector("#submit");
var startQuiz = document.querySelector("#startQuiz");
var urlQ = urlQ || "http://oskaremilsson.se:4000/question/1";
var urlA;
var requestId;
var i = 1;

quiz.start();

var getReq = function() {
    if (urlQ) {
        ajax.requestGet(urlQ, function(error, response) {
        var alts = JSON.parse(response).alternatives;
        var quests = JSON.parse(response).question;
        requestId = JSON.parse(response).id;
        urlA = JSON.parse(response).nextURL;
        quiz.createTemplate(i, quests, alts);
    });
    }
};

startQuiz.addEventListener("click", function() {
    startQuiz.classList.add("hidden");
    startQuiz.classList.remove("visible");
    submit.classList.add("visible");
    submit.classList.remove("hidden");
    quiz.clean();
    getReq();
});

submit.addEventListener("click", function() {
    var jsonObj = JSON.stringify({
        answer: quiz.answer(i)
    });

    ajax.request({method: "POST", url: urlA, answer: jsonObj}, function(error, response) {
        quiz.clean();
        if (error === null || error < 400) {
            i += 1;
            urlQ = JSON.parse(response).nextURL;
            getReq();
        } else if (error >= 400) {
            startQuiz.classList.remove("hidden");
            startQuiz.classList.add("visible");
            submit.classList.remove("visible");
            submit.classList.add("hidden");
            urlQ = "http://oskaremilsson.se:4000/question/1";
            urlA = "";
            quiz.gameOver();
        }
    });

});

