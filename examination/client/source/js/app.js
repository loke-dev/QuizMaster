/*
 @author - Loke Carlsson
 */

var quiz = require("./quiz");
var ajax = require("./ajax");
var submit = document.querySelector("#submit");
var urlQ = urlQ || "http://vhost3.lnu.se:20080/question/1";

for (var i = 1; i <= 2; i += 1) {
    //quiz.clean();
    quiz.quiz(i, urlQ);
}

var urlA = "http://vhost3.lnu.se:20080/answer/" + i;

submit.addEventListener("click", function() {
    var answerText = document.querySelector("#inputBox").value;
    var jsonObj = JSON.stringify({
        answer: answerText
    });
    ajax.request({method: "POST", url: urlA, answer: jsonObj}, function(error, response) {
        console.log(error);
        console.log(response);
        console.log(JSON.parse(response).nextURL);
        console.log(urlQ);
        urlQ = JSON.parse(response).nextURL;
    });

});

//http://vhost3.lnu.se:20080/answer/1
