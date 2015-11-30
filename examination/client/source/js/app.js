/*
 @author - Loke Carlsson
 */

var quiz = require("./quiz");
var ajax = require("./ajax");
var submit = document.querySelector("#submit");
var urlQ = urlQ || "http://vhost3.lnu.se:20080/question/1";
var urlA;
var requestId;
var i = 1;

var getReq = function() {
    ajax.requestGet(urlQ, function(error, response) {
        requestId = JSON.parse(response).id;
        urlA = JSON.parse(response).nextURL;
        var question = JSON.parse(response).question;
        var questionNode = document.createTextNode(question);
        var textClass = document.querySelector(".text");
        textClass.appendChild(questionNode);
    });
};

quiz.switchCase(1);
getReq();

submit.addEventListener("click", function() {
    var answerText = document.querySelector("#inputBox").value;
    var jsonObj = JSON.stringify({
        answer: answerText
    });

    ajax.request({method: "POST", url: urlA, answer: jsonObj}, function(error, response) {
        console.log("next url: " + JSON.parse(response).nextURL);
        urlQ = JSON.parse(response).nextURL;
        if (error === null) {
            quiz.clean();
            i += 1;
            quiz.switchCase(i);
            getReq();
        }

    });

});

//http://vhost3.lnu.se:20080/answer/1
