var ajax = require("./ajax");
var req = new XMLHttpRequest();
var template = document.querySelector("#template1");
var submit = document.querySelector("#submit");
var node = document.importNode(template.content, true);
var url = url || "http://vhost3.lnu.se:20080/question/1";

document.querySelector("#area").appendChild(node);

req.addEventListener("load", function() {
    var question = JSON.parse(req.responseText).question;
    var questionNode = document.createTextNode(question);
    var title = document.createTextNode("Question " + JSON.parse(req.responseText).id);
    var textClass = document.querySelector(".text");

    document.querySelector("#title").appendChild(title);
    textClass.appendChild(questionNode);
});

req.open("GET", url);
req.send();

submit.addEventListener("click", function() {
    var answerText = document.querySelector("#inputBox").value;
    var jsonObj = JSON.stringify({
        answer: answerText
    });
    ajax.request({method: "POST", url: "http://vhost3.lnu.se:20080/answer/1", answer: jsonObj}, function(error, response) {
        console.log(error);
        console.log(response);
        console.log(JSON.parse(response).nextURL);
        url = JSON.parse(response).nextURL;
    });
});
