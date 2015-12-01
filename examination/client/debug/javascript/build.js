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
        }

        callback(null, req.responseText);

    });

    req.open(config.method, config.url);
    req.setRequestHeader("Content-Type", config.contenttype);
    req.send(config.answer);
}

function requestGet(url, callback) {
    var reqGet = new XMLHttpRequest();

    reqGet.addEventListener("load", function() {

        if (reqGet.status > 400) {
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

},{"./ajax":1,"./quiz":3}],3:[function(require,module,exports){
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

var switchCase = function(i) {
    switch (i) {
        case 1:
            console.log("template 1");
            template(1);
            break;
        case 2:
            console.log("template 2");
            template(2);
            break;
        case 3:
            console.log("template 3");
            template(3);
            break;
        case 4:
            console.log("template 4");
            template(4);
            break;
        case 5:
            console.log("template 5");
            template(5);
            break;
        case 6:
            console.log("template 6");
            template(6);
            break;
        case 7:
            console.log("template 7");
            template(7);
            break;
    }
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
    var titleNr = document.createTextNode(i);
    var questionNode = document.createTextNode(question);
    var textClass = document.querySelector(".text");
    textClass.appendChild(questionNode);
    document.querySelector(".title").appendChild(titleNr);

};

module.exports = {
    template:template,
    clean:clean,
    switchCase:switchCase,
    answer:answer,
    createTemplate:createTemplate
};

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMS4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYWpheC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9xdWl6LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIFRoaXMgY2FsbGJhY2sgZnVuY3Rpb24gc2VuZHMgcmVxdWVzdCB0byB0aGUgZGF0YWJhc2VcbiAqIEBwYXJhbSBjb25maWdcbiAqIEBwYXJhbSBjYWxsYmFja1xuICovXG5mdW5jdGlvbiByZXF1ZXN0KGNvbmZpZywgY2FsbGJhY2spIHtcblxuICAgIGNvbmZpZy51cmwgPSBjb25maWcudXJsIHx8IFwiXCI7XG4gICAgY29uZmlnLm1ldGhvZCA9IGNvbmZpZy5tZXRob2QgfHwgXCJwb3N0XCI7XG4gICAgY29uZmlnLmNvbnRlbnR0eXBlID0gY29uZmlnLmNvbnRlbnR0eXBlIHx8IFwiYXBwbGljYXRpb24vanNvblwiO1xuICAgIGNvbmZpZy5hbnN3ZXIgPSBjb25maWcuYW5zd2VyIHx8IG51bGw7XG5cbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICByZXEuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgaWYgKHJlcS5zdGF0dXMgPj0gNDAwKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhyZXEuc3RhdHVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHJlcS5yZXNwb25zZVRleHQpO1xuXG4gICAgfSk7XG5cbiAgICByZXEub3Blbihjb25maWcubWV0aG9kLCBjb25maWcudXJsKTtcbiAgICByZXEuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBjb25maWcuY29udGVudHR5cGUpO1xuICAgIHJlcS5zZW5kKGNvbmZpZy5hbnN3ZXIpO1xufVxuXG5mdW5jdGlvbiByZXF1ZXN0R2V0KHVybCwgY2FsbGJhY2spIHtcbiAgICB2YXIgcmVxR2V0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICByZXFHZXQuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgaWYgKHJlcUdldC5zdGF0dXMgPiA0MDApIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlcUdldC5zdGF0dXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVxR2V0LnJlc3BvbnNlVGV4dCk7XG5cbiAgICB9KTtcblxuICAgIHJlcUdldC5vcGVuKFwiR0VUXCIsIHVybCk7XG4gICAgcmVxR2V0LnNlbmQoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgcmVxdWVzdDogcmVxdWVzdCxcbiAgICByZXF1ZXN0R2V0OiByZXF1ZXN0R2V0XG59O1xuIiwiLypcbiBAYXV0aG9yIC0gTG9rZSBDYXJsc3NvblxuICovXG5cbnZhciBxdWl6ID0gcmVxdWlyZShcIi4vcXVpelwiKTtcbnZhciBhamF4ID0gcmVxdWlyZShcIi4vYWpheFwiKTtcbnZhciBzdWJtaXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N1Ym1pdFwiKTtcbnZhciBzdGFydFF1aXogPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0UXVpelwiKTtcbnZhciB1cmxRID0gdXJsUSB8fCBcImh0dHA6Ly92aG9zdDMubG51LnNlOjIwMDgwL3F1ZXN0aW9uLzFcIjtcbnZhciB1cmxBO1xudmFyIHJlcXVlc3RJZDtcbnZhciBpID0gMTtcblxudmFyIGdldFJlcSA9IGZ1bmN0aW9uKCkge1xuICAgIGFqYXgucmVxdWVzdEdldCh1cmxRLCBmdW5jdGlvbihlcnJvciwgcmVzcG9uc2UpIHtcbiAgICAgICAgcmVxdWVzdElkID0gSlNPTi5wYXJzZShyZXNwb25zZSkuaWQ7XG4gICAgICAgIHVybEEgPSBKU09OLnBhcnNlKHJlc3BvbnNlKS5uZXh0VVJMO1xuICAgICAgICBxdWl6LmNyZWF0ZVRlbXBsYXRlKGksIEpTT04ucGFyc2UocmVzcG9uc2UpLnF1ZXN0aW9uLCBKU09OLnBhcnNlKHJlc3BvbnNlKS5hbHRlcm5hdGl2ZXMpO1xuICAgIH0pO1xufTtcblxuc3RhcnRRdWl6LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICBzdGFydFF1aXouY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcbiAgICBzdGFydFF1aXouY2xhc3NMaXN0LnJlbW92ZShcInZpc2libGVcIik7XG4gICAgc3VibWl0LmNsYXNzTGlzdC5hZGQoXCJ2aXNpYmxlXCIpO1xuICAgIHN1Ym1pdC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xuICAgIHF1aXouY2xlYW4oKTtcbiAgICBxdWl6LnN3aXRjaENhc2UoMSk7XG4gICAgZ2V0UmVxKCk7XG59KTtcblxuc3VibWl0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICB2YXIganNvbk9iaiA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgYW5zd2VyOiBxdWl6LmFuc3dlcihpKVxuICAgIH0pO1xuXG4gICAgYWpheC5yZXF1ZXN0KHttZXRob2Q6IFwiUE9TVFwiLCB1cmw6IHVybEEsIGFuc3dlcjoganNvbk9ian0sIGZ1bmN0aW9uKGVycm9yLCByZXNwb25zZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm5leHQgdXJsOiBcIiArIEpTT04ucGFyc2UocmVzcG9uc2UpLm5leHRVUkwpO1xuICAgICAgICB1cmxRID0gSlNPTi5wYXJzZShyZXNwb25zZSkubmV4dFVSTDtcbiAgICAgICAgaWYgKGVycm9yID09PSBudWxsKSB7XG4gICAgICAgICAgICBxdWl6LmNsZWFuKCk7XG4gICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICBxdWl6LnN3aXRjaENhc2UoaSk7XG4gICAgICAgICAgICBnZXRSZXEoKTtcbiAgICAgICAgfSBlbHNlIGlmIChlcnJvciA+PSA0MDApIHtcbiAgICAgICAgICAgIHN0YXJ0UXVpei5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xuICAgICAgICAgICAgc3RhcnRRdWl6LmNsYXNzTGlzdC5hZGQoXCJ2aXNpYmxlXCIpO1xuICAgICAgICAgICAgc3VibWl0LmNsYXNzTGlzdC5yZW1vdmUoXCJ2aXNpYmxlXCIpO1xuICAgICAgICAgICAgc3VibWl0LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgICAgICAgICBxdWl6LmNsZWFuKCk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG59KTtcbiIsInZhciB0ZW1wbGF0ZSA9IGZ1bmN0aW9uKHF1ZXN0KSB7XG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZVwiICsgcXVlc3QpO1xuICAgIHZhciBub2RlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmFyZWFcIikuYXBwZW5kQ2hpbGQobm9kZSk7XG59O1xuXG52YXIgY2xlYW4gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmFyZWFcIik7XG4gICAgd2hpbGUgKGVsLmhhc0NoaWxkTm9kZXMoKSkge1xuICAgICAgICBlbC5yZW1vdmVDaGlsZChlbC5sYXN0Q2hpbGQpO1xuICAgIH1cbn07XG5cbnZhciBzd2l0Y2hDYXNlID0gZnVuY3Rpb24oaSkge1xuICAgIHN3aXRjaCAoaSkge1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInRlbXBsYXRlIDFcIik7XG4gICAgICAgICAgICB0ZW1wbGF0ZSgxKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInRlbXBsYXRlIDJcIik7XG4gICAgICAgICAgICB0ZW1wbGF0ZSgyKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInRlbXBsYXRlIDNcIik7XG4gICAgICAgICAgICB0ZW1wbGF0ZSgzKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInRlbXBsYXRlIDRcIik7XG4gICAgICAgICAgICB0ZW1wbGF0ZSg0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInRlbXBsYXRlIDVcIik7XG4gICAgICAgICAgICB0ZW1wbGF0ZSg1KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInRlbXBsYXRlIDZcIik7XG4gICAgICAgICAgICB0ZW1wbGF0ZSg2KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDc6XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInRlbXBsYXRlIDdcIik7XG4gICAgICAgICAgICB0ZW1wbGF0ZSg3KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn07XG5cbnZhciBhbnN3ZXIgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBhbnN3ZXJUZXh0O1xuXG4gICAgdmFyIHJhZGlvcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKFwicmFkaW9cIik7XG4gICAgdmFyIHZhbHVlO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgcmFkaW9zLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgIGlmIChyYWRpb3Nbal0uY2hlY2tlZCkge1xuICAgICAgICAgICAgdmFsdWUgPSByYWRpb3Nbal0udmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5pbnB1dEJveFwiKSkge1xuICAgICAgICBhbnN3ZXJUZXh0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5pbnB1dEJveFwiKS52YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBhbnN3ZXJUZXh0ID0gdmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFuc3dlclRleHQ7XG5cbn07XG5cbnZhciBjcmVhdGVUZW1wbGF0ZSA9IGZ1bmN0aW9uKGksIHF1ZXN0aW9uLCBhbHRlcm5hdGl2ZXMpIHtcbiAgICB2YXIgdGl0bGVOciA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGkpO1xuICAgIHZhciBxdWVzdGlvbk5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShxdWVzdGlvbik7XG4gICAgdmFyIHRleHRDbGFzcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudGV4dFwiKTtcbiAgICB0ZXh0Q2xhc3MuYXBwZW5kQ2hpbGQocXVlc3Rpb25Ob2RlKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnRpdGxlXCIpLmFwcGVuZENoaWxkKHRpdGxlTnIpO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0ZW1wbGF0ZTp0ZW1wbGF0ZSxcbiAgICBjbGVhbjpjbGVhbixcbiAgICBzd2l0Y2hDYXNlOnN3aXRjaENhc2UsXG4gICAgYW5zd2VyOmFuc3dlcixcbiAgICBjcmVhdGVUZW1wbGF0ZTpjcmVhdGVUZW1wbGF0ZVxufTtcbiJdfQ==
