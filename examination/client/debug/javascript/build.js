(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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


},{"./ajax":1,"./quiz":3}],3:[function(require,module,exports){
var template = function(quest) {
    var template = document.querySelector("#template" + quest);
    var node = document.importNode(template.content, true);
    document.querySelector(".area").appendChild(node);
};

var start = function() {
    var template = document.querySelector("#startTemplate");
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

        document.querySelector(".radioDiv").appendChild(frag);

    } else {
        var inputBox = document.createElement("input");
        inputBox.type = "text";
        inputBox.placeholder = "Your answer here..";
        inputBox.classList.add("inputBox");
        document.querySelector(".inputDiv").appendChild(inputBox);
    }

};

module.exports = {
    template:template,
    start:start,
    clean:clean,
    gameOver:gameOver,
    answer:answer,
    createTemplate:createTemplate
};

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMS4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYWpheC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9xdWl6LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBUaGlzIGNhbGxiYWNrIGZ1bmN0aW9uIHNlbmRzIHJlcXVlc3QgdG8gdGhlIGRhdGFiYXNlXG4gKiBAcGFyYW0gY29uZmlnXG4gKiBAcGFyYW0gY2FsbGJhY2tcbiAqL1xuZnVuY3Rpb24gcmVxdWVzdChjb25maWcsIGNhbGxiYWNrKSB7XG5cbiAgICBjb25maWcudXJsID0gY29uZmlnLnVybCB8fCBcIlwiO1xuICAgIGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kIHx8IFwicG9zdFwiO1xuICAgIGNvbmZpZy5jb250ZW50dHlwZSA9IGNvbmZpZy5jb250ZW50dHlwZSB8fCBcImFwcGxpY2F0aW9uL2pzb25cIjtcbiAgICBjb25maWcuYW5zd2VyID0gY29uZmlnLmFuc3dlciB8fCBudWxsO1xuXG4gICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgcmVxLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIGlmIChyZXEuc3RhdHVzID49IDQwMCkge1xuICAgICAgICAgICAgY2FsbGJhY2socmVxLnN0YXR1cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXEucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXEub3Blbihjb25maWcubWV0aG9kLCBjb25maWcudXJsKTtcbiAgICByZXEuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBjb25maWcuY29udGVudHR5cGUpO1xuICAgIHJlcS5zZW5kKGNvbmZpZy5hbnN3ZXIpO1xufVxuXG5mdW5jdGlvbiByZXF1ZXN0R2V0KHVybCwgY2FsbGJhY2spIHtcbiAgICB2YXIgcmVxR2V0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICByZXFHZXQuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgaWYgKHJlcUdldC5zdGF0dXMgPj0gNDAwKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhyZXFHZXQuc3RhdHVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHJlcUdldC5yZXNwb25zZVRleHQpO1xuXG4gICAgfSk7XG5cbiAgICByZXFHZXQub3BlbihcIkdFVFwiLCB1cmwpO1xuICAgIHJlcUdldC5zZW5kKCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHJlcXVlc3Q6IHJlcXVlc3QsXG4gICAgcmVxdWVzdEdldDogcmVxdWVzdEdldFxufTtcbiIsIi8qXG4gQGF1dGhvciAtIExva2UgQ2FybHNzb25cbiAqL1xuXG52YXIgcXVpeiA9IHJlcXVpcmUoXCIuL3F1aXpcIik7XG52YXIgYWpheCA9IHJlcXVpcmUoXCIuL2FqYXhcIik7XG52YXIgc3VibWl0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdWJtaXRcIik7XG52YXIgc3RhcnRRdWl6ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGFydFF1aXpcIik7XG52YXIgdXJsUSA9IHVybFEgfHwgXCJodHRwOi8vb3NrYXJlbWlsc3Nvbi5zZTo0MDAwL3F1ZXN0aW9uLzFcIjtcbnZhciB1cmxBO1xudmFyIHJlcXVlc3RJZDtcbnZhciBpID0gMTtcblxucXVpei5zdGFydCgpO1xuXG52YXIgZ2V0UmVxID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHVybFEpIHtcbiAgICAgICAgYWpheC5yZXF1ZXN0R2V0KHVybFEsIGZ1bmN0aW9uKGVycm9yLCByZXNwb25zZSkge1xuICAgICAgICB2YXIgYWx0cyA9IEpTT04ucGFyc2UocmVzcG9uc2UpLmFsdGVybmF0aXZlcztcbiAgICAgICAgdmFyIHF1ZXN0cyA9IEpTT04ucGFyc2UocmVzcG9uc2UpLnF1ZXN0aW9uO1xuICAgICAgICByZXF1ZXN0SWQgPSBKU09OLnBhcnNlKHJlc3BvbnNlKS5pZDtcbiAgICAgICAgdXJsQSA9IEpTT04ucGFyc2UocmVzcG9uc2UpLm5leHRVUkw7XG4gICAgICAgIHF1aXouY3JlYXRlVGVtcGxhdGUoaSwgcXVlc3RzLCBhbHRzKTtcbiAgICB9KTtcbiAgICB9XG59O1xuXG5zdGFydFF1aXouYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgIHN0YXJ0UXVpei5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xuICAgIHN0YXJ0UXVpei5jbGFzc0xpc3QucmVtb3ZlKFwidmlzaWJsZVwiKTtcbiAgICBzdWJtaXQuY2xhc3NMaXN0LmFkZChcInZpc2libGVcIik7XG4gICAgc3VibWl0LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XG4gICAgcXVpei5jbGVhbigpO1xuICAgIGdldFJlcSgpO1xufSk7XG5cbnN1Ym1pdC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgdmFyIGpzb25PYmogPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGFuc3dlcjogcXVpei5hbnN3ZXIoaSlcbiAgICB9KTtcblxuICAgIGFqYXgucmVxdWVzdCh7bWV0aG9kOiBcIlBPU1RcIiwgdXJsOiB1cmxBLCBhbnN3ZXI6IGpzb25PYmp9LCBmdW5jdGlvbihlcnJvciwgcmVzcG9uc2UpIHtcbiAgICAgICAgcXVpei5jbGVhbigpO1xuICAgICAgICBpZiAoZXJyb3IgPT09IG51bGwgfHwgZXJyb3IgPCA0MDApIHtcbiAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgIHVybFEgPSBKU09OLnBhcnNlKHJlc3BvbnNlKS5uZXh0VVJMO1xuICAgICAgICAgICAgZ2V0UmVxKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZXJyb3IgPj0gNDAwKSB7XG4gICAgICAgICAgICBzdGFydFF1aXouY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcbiAgICAgICAgICAgIHN0YXJ0UXVpei5jbGFzc0xpc3QuYWRkKFwidmlzaWJsZVwiKTtcbiAgICAgICAgICAgIHN1Ym1pdC5jbGFzc0xpc3QucmVtb3ZlKFwidmlzaWJsZVwiKTtcbiAgICAgICAgICAgIHN1Ym1pdC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xuICAgICAgICAgICAgdXJsUSA9IFwiaHR0cDovL29za2FyZW1pbHNzb24uc2U6NDAwMC9xdWVzdGlvbi8xXCI7XG4gICAgICAgICAgICB1cmxBID0gXCJcIjtcbiAgICAgICAgICAgIHF1aXouZ2FtZU92ZXIoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KTtcblxuIiwidmFyIHRlbXBsYXRlID0gZnVuY3Rpb24ocXVlc3QpIHtcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlXCIgKyBxdWVzdCk7XG4gICAgdmFyIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYXJlYVwiKS5hcHBlbmRDaGlsZChub2RlKTtcbn07XG5cbnZhciBzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhcnRUZW1wbGF0ZVwiKTtcbiAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5hcmVhXCIpLmFwcGVuZENoaWxkKG5vZGUpO1xufTtcblxudmFyIGNsZWFuID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5hcmVhXCIpO1xuICAgIHdoaWxlIChlbC5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICAgICAgZWwucmVtb3ZlQ2hpbGQoZWwubGFzdENoaWxkKTtcbiAgICB9XG59O1xuXG52YXIgZ2FtZU92ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2VuZFRlbXBsYXRlXCIpO1xuICAgIHZhciBub2RlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmFyZWFcIikuYXBwZW5kQ2hpbGQobm9kZSk7XG59O1xuXG52YXIgYW5zd2VyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFuc3dlclRleHQ7XG4gICAgdmFyIHJhZGlvcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKFwicmFkaW9cIik7XG4gICAgdmFyIHZhbHVlO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgcmFkaW9zLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgIGlmIChyYWRpb3Nbal0uY2hlY2tlZCkge1xuICAgICAgICAgICAgdmFsdWUgPSByYWRpb3Nbal0udmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5pbnB1dEJveFwiKSkge1xuICAgICAgICBhbnN3ZXJUZXh0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5pbnB1dEJveFwiKS52YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBhbnN3ZXJUZXh0ID0gdmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFuc3dlclRleHQ7XG5cbn07XG5cbnZhciBjcmVhdGVUZW1wbGF0ZSA9IGZ1bmN0aW9uKGksIHF1ZXN0aW9uLCBhbHRlcm5hdGl2ZXMpIHtcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlXCIpO1xuICAgIHZhciBub2RlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmFyZWFcIikuYXBwZW5kQ2hpbGQobm9kZSk7XG5cbiAgICB2YXIgdGl0bGVOciA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGkpO1xuICAgIHZhciBxdWVzdGlvbk5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShxdWVzdGlvbik7XG4gICAgdmFyIHRleHRDbGFzcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV4dFwiKTtcblxuICAgIHRleHRDbGFzcy5hcHBlbmRDaGlsZChxdWVzdGlvbk5vZGUpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGl0bGVcIikuYXBwZW5kQ2hpbGQodGl0bGVOcik7XG5cbiAgICBpZiAoYWx0ZXJuYXRpdmVzKSB7XG4gICAgICAgIHZhciBhbHRzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYWx0ZXJuYXRpdmVzKTtcbiAgICAgICAgdmFyIG51bUFsdCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGFsdGVybmF0aXZlcykubGVuZ3RoO1xuICAgICAgICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBudW1BbHQ7IGogKz0gMSkge1xuICAgICAgICAgICAgdmFyIHJhZGlvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuICAgICAgICAgICAgdmFyIGFsdFRleHQgPSBhbHRzW2pdO1xuICAgICAgICAgICAgdmFyIGFsdCA9IGFsdGVybmF0aXZlc1thbHRUZXh0XTtcbiAgICAgICAgICAgIHZhciB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYWx0KTtcbiAgICAgICAgICAgIHJhZGlvLnRpdGxlID0gKGogKyAxKTtcbiAgICAgICAgICAgIHJhZGlvLnR5cGUgPSBcInJhZGlvXCI7XG4gICAgICAgICAgICByYWRpby5uYW1lID0gXCJyYWRpb1wiO1xuICAgICAgICAgICAgcmFkaW8udmFsdWUgPSBhbHRzW2pdO1xuICAgICAgICAgICAgZnJhZy5hcHBlbmRDaGlsZChyYWRpbyk7XG4gICAgICAgICAgICBmcmFnLmFwcGVuZENoaWxkKHRleHQpO1xuICAgICAgICAgICAgZnJhZy5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnJcIikpO1xuICAgICAgICAgICAgcmFkaW8uY2xhc3NMaXN0LmFkZChcInJhZGlvXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5yYWRpb0RpdlwiKS5hcHBlbmRDaGlsZChmcmFnKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBpbnB1dEJveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcbiAgICAgICAgaW5wdXRCb3gudHlwZSA9IFwidGV4dFwiO1xuICAgICAgICBpbnB1dEJveC5wbGFjZWhvbGRlciA9IFwiWW91ciBhbnN3ZXIgaGVyZS4uXCI7XG4gICAgICAgIGlucHV0Qm94LmNsYXNzTGlzdC5hZGQoXCJpbnB1dEJveFwiKTtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5pbnB1dERpdlwiKS5hcHBlbmRDaGlsZChpbnB1dEJveCk7XG4gICAgfVxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0ZW1wbGF0ZTp0ZW1wbGF0ZSxcbiAgICBzdGFydDpzdGFydCxcbiAgICBjbGVhbjpjbGVhbixcbiAgICBnYW1lT3ZlcjpnYW1lT3ZlcixcbiAgICBhbnN3ZXI6YW5zd2VyLFxuICAgIGNyZWF0ZVRlbXBsYXRlOmNyZWF0ZVRlbXBsYXRlXG59O1xuIl19
