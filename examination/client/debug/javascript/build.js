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

        if (req.status > 400) {
            callback(req.status);
        }

        callback(null, req.responseText);

    });

    req.open(config.method, config.url);
    req.setRequestHeader("Content-Type", config.contenttype);
    req.send(config.answer);
}

module.exports = {
    request: request
};

},{}],2:[function(require,module,exports){
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

},{"./ajax":1,"./quiz":3}],3:[function(require,module,exports){
var quiz = function(quest, url) {
    var currentQuest = quest || 1;
    var currentUrl = url;
    var req = new XMLHttpRequest();
    var template = document.querySelector("#template" + currentQuest);
    var node = document.importNode(template.content, true);
    document.querySelector(".area").appendChild(node);

    req.addEventListener("load", function() {
        var question = JSON.parse(req.responseText).question;
        var questionNode = document.createTextNode(question);
        var title = document.createTextNode("Question " + JSON.parse(req.responseText).id);
        var textClass = document.querySelector(".text");

        document.querySelector("#title").appendChild(title);
        textClass.appendChild(questionNode);
    });

    req.open("GET", currentUrl);
    req.send();

};

var clean = function() {
    var el = document.querySelector(".area");
    while (el.hasChildNodes()) {
        el.removeChild(el.lastChild);
    }
};

module.exports = {
    quiz:quiz,
    clean:clean
};

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMS4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYWpheC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9xdWl6LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBUaGlzIGNhbGxiYWNrIGZ1bmN0aW9uIHNlbmRzIHJlcXVlc3QgdG8gdGhlIGRhdGFiYXNlXG4gKiBAcGFyYW0gY29uZmlnXG4gKiBAcGFyYW0gY2FsbGJhY2tcbiAqL1xuZnVuY3Rpb24gcmVxdWVzdChjb25maWcsIGNhbGxiYWNrKSB7XG5cbiAgICBjb25maWcudXJsID0gY29uZmlnLnVybCB8fCBcIlwiO1xuICAgIGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kIHx8IFwicG9zdFwiO1xuICAgIGNvbmZpZy5jb250ZW50dHlwZSA9IGNvbmZpZy5jb250ZW50dHlwZSB8fCBcImFwcGxpY2F0aW9uL2pzb25cIjtcbiAgICBjb25maWcuYW5zd2VyID0gY29uZmlnLmFuc3dlciB8fCBudWxsO1xuXG4gICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgcmVxLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIGlmIChyZXEuc3RhdHVzID4gNDAwKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhyZXEuc3RhdHVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHJlcS5yZXNwb25zZVRleHQpO1xuXG4gICAgfSk7XG5cbiAgICByZXEub3Blbihjb25maWcubWV0aG9kLCBjb25maWcudXJsKTtcbiAgICByZXEuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBjb25maWcuY29udGVudHR5cGUpO1xuICAgIHJlcS5zZW5kKGNvbmZpZy5hbnN3ZXIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICByZXF1ZXN0OiByZXF1ZXN0XG59O1xuIiwiLypcbiBAYXV0aG9yIC0gTG9rZSBDYXJsc3NvblxuICovXG5cbnZhciBxdWl6ID0gcmVxdWlyZShcIi4vcXVpelwiKTtcbnZhciBhamF4ID0gcmVxdWlyZShcIi4vYWpheFwiKTtcbnZhciBzdWJtaXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N1Ym1pdFwiKTtcbnZhciB1cmxRID0gdXJsUSB8fCBcImh0dHA6Ly92aG9zdDMubG51LnNlOjIwMDgwL3F1ZXN0aW9uLzFcIjtcblxuZm9yICh2YXIgaSA9IDE7IGkgPD0gMjsgaSArPSAxKSB7XG4gICAgLy9xdWl6LmNsZWFuKCk7XG4gICAgcXVpei5xdWl6KGksIHVybFEpO1xufVxuXG52YXIgdXJsQSA9IFwiaHR0cDovL3Zob3N0My5sbnUuc2U6MjAwODAvYW5zd2VyL1wiICsgaTtcblxuc3VibWl0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICB2YXIgYW5zd2VyVGV4dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjaW5wdXRCb3hcIikudmFsdWU7XG4gICAgdmFyIGpzb25PYmogPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGFuc3dlcjogYW5zd2VyVGV4dFxuICAgIH0pO1xuICAgIGFqYXgucmVxdWVzdCh7bWV0aG9kOiBcIlBPU1RcIiwgdXJsOiB1cmxBLCBhbnN3ZXI6IGpzb25PYmp9LCBmdW5jdGlvbihlcnJvciwgcmVzcG9uc2UpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKEpTT04ucGFyc2UocmVzcG9uc2UpLm5leHRVUkwpO1xuICAgICAgICBjb25zb2xlLmxvZyh1cmxRKTtcbiAgICAgICAgdXJsUSA9IEpTT04ucGFyc2UocmVzcG9uc2UpLm5leHRVUkw7XG4gICAgfSk7XG5cbn0pO1xuXG4vL2h0dHA6Ly92aG9zdDMubG51LnNlOjIwMDgwL2Fuc3dlci8xXG4iLCJ2YXIgcXVpeiA9IGZ1bmN0aW9uKHF1ZXN0LCB1cmwpIHtcbiAgICB2YXIgY3VycmVudFF1ZXN0ID0gcXVlc3QgfHwgMTtcbiAgICB2YXIgY3VycmVudFVybCA9IHVybDtcbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZVwiICsgY3VycmVudFF1ZXN0KTtcbiAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5hcmVhXCIpLmFwcGVuZENoaWxkKG5vZGUpO1xuXG4gICAgcmVxLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcXVlc3Rpb24gPSBKU09OLnBhcnNlKHJlcS5yZXNwb25zZVRleHQpLnF1ZXN0aW9uO1xuICAgICAgICB2YXIgcXVlc3Rpb25Ob2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUocXVlc3Rpb24pO1xuICAgICAgICB2YXIgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlF1ZXN0aW9uIFwiICsgSlNPTi5wYXJzZShyZXEucmVzcG9uc2VUZXh0KS5pZCk7XG4gICAgICAgIHZhciB0ZXh0Q2xhc3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnRleHRcIik7XG5cbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0aXRsZVwiKS5hcHBlbmRDaGlsZCh0aXRsZSk7XG4gICAgICAgIHRleHRDbGFzcy5hcHBlbmRDaGlsZChxdWVzdGlvbk5vZGUpO1xuICAgIH0pO1xuXG4gICAgcmVxLm9wZW4oXCJHRVRcIiwgY3VycmVudFVybCk7XG4gICAgcmVxLnNlbmQoKTtcblxufTtcblxudmFyIGNsZWFuID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5hcmVhXCIpO1xuICAgIHdoaWxlIChlbC5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICAgICAgZWwucmVtb3ZlQ2hpbGQoZWwubGFzdENoaWxkKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBxdWl6OnF1aXosXG4gICAgY2xlYW46Y2xlYW5cbn07XG4iXX0=
