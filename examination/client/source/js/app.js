/*
 @author - Loke Carlsson
 */

var quiz = require("./quiz");
var ajax = require("./ajax");
var submit = document.querySelector("#submit");
var startQuiz = document.querySelector("#startQuiz");
var urlQ = urlQ || "http://vhost3.lnu.se:20080/question/1";
var urlA;
var requestId;
var i = 1;

var getReq = function() {
    ajax.requestGet(urlQ, function(error, response) {
        requestId = JSON.parse(response).id;
        urlA = JSON.parse(response).nextURL;
        quiz.createTemplate(i, JSON.parse(response).question, JSON.parse(response).alternatives);
    });
};

startQuiz.addEventListener("click", function() {
    startQuiz.classList.add("hidden");
    startQuiz.classList.remove("visible");
    submit.classList.add("visible");
    submit.classList.remove("hidden");
    quiz.clean();
    quiz.switchCase(1);
    getReq();
});

submit.addEventListener("click", function() {
    var jsonObj = JSON.stringify({
        answer: quiz.answer(i)
    });

    ajax.request({method: "POST", url: urlA, answer: jsonObj}, function(error, response) {
        console.log("next url: " + JSON.parse(response).nextURL);
        urlQ = JSON.parse(response).nextURL;
        if (error === null) {
            quiz.clean();
            i += 1;
            quiz.switchCase(i);
            getReq();
        } else if (error >= 400) {
            startQuiz.classList.remove("hidden");
            startQuiz.classList.add("visible");
            submit.classList.remove("visible");
            submit.classList.add("hidden");
            quiz.clean();
        }

    });

});
