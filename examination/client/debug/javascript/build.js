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

},{"./ajax":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMS4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYWpheC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogVGhpcyBjYWxsYmFjayBmdW5jdGlvbiBzZW5kcyByZXF1ZXN0IHRvIHRoZSBkYXRhYmFzZVxuICogQHBhcmFtIGNvbmZpZ1xuICogQHBhcmFtIGNhbGxiYWNrXG4gKi9cbmZ1bmN0aW9uIHJlcXVlc3QoY29uZmlnLCBjYWxsYmFjaykge1xuXG4gICAgY29uZmlnLnVybCA9IGNvbmZpZy51cmwgfHwgXCJcIjtcbiAgICBjb25maWcubWV0aG9kID0gY29uZmlnLm1ldGhvZCB8fCBcInBvc3RcIjtcbiAgICBjb25maWcuY29udGVudHR5cGUgPSBjb25maWcuY29udGVudHR5cGUgfHwgXCJhcHBsaWNhdGlvbi9qc29uXCI7XG4gICAgY29uZmlnLmFuc3dlciA9IGNvbmZpZy5hbnN3ZXIgfHwgbnVsbDtcblxuICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIHJlcS5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbigpIHtcblxuICAgICAgICBpZiAocmVxLnN0YXR1cyA+IDQwMCkge1xuICAgICAgICAgICAgY2FsbGJhY2socmVxLnN0YXR1cyk7XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjayhudWxsLCByZXEucmVzcG9uc2VUZXh0KTtcblxuICAgIH0pO1xuXG4gICAgcmVxLm9wZW4oY29uZmlnLm1ldGhvZCwgY29uZmlnLnVybCk7XG4gICAgcmVxLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgY29uZmlnLmNvbnRlbnR0eXBlKTtcbiAgICByZXEuc2VuZChjb25maWcuYW5zd2VyKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgcmVxdWVzdDogcmVxdWVzdFxufTtcbiIsInZhciBhamF4ID0gcmVxdWlyZShcIi4vYWpheFwiKTtcbnZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbnZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGUxXCIpO1xudmFyIHN1Ym1pdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3VibWl0XCIpO1xudmFyIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xudmFyIHVybCA9IHVybCB8fCBcImh0dHA6Ly92aG9zdDMubG51LnNlOjIwMDgwL3F1ZXN0aW9uLzFcIjtcblxuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNhcmVhXCIpLmFwcGVuZENoaWxkKG5vZGUpO1xuXG5yZXEuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24oKSB7XG4gICAgdmFyIHF1ZXN0aW9uID0gSlNPTi5wYXJzZShyZXEucmVzcG9uc2VUZXh0KS5xdWVzdGlvbjtcbiAgICB2YXIgcXVlc3Rpb25Ob2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUocXVlc3Rpb24pO1xuICAgIHZhciB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiUXVlc3Rpb24gXCIgKyBKU09OLnBhcnNlKHJlcS5yZXNwb25zZVRleHQpLmlkKTtcbiAgICB2YXIgdGV4dENsYXNzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi50ZXh0XCIpO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0aXRsZVwiKS5hcHBlbmRDaGlsZCh0aXRsZSk7XG4gICAgdGV4dENsYXNzLmFwcGVuZENoaWxkKHF1ZXN0aW9uTm9kZSk7XG59KTtcblxucmVxLm9wZW4oXCJHRVRcIiwgdXJsKTtcbnJlcS5zZW5kKCk7XG5cbnN1Ym1pdC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFuc3dlclRleHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2lucHV0Qm94XCIpLnZhbHVlO1xuICAgIHZhciBqc29uT2JqID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBhbnN3ZXI6IGFuc3dlclRleHRcbiAgICB9KTtcbiAgICBhamF4LnJlcXVlc3Qoe21ldGhvZDogXCJQT1NUXCIsIHVybDogXCJodHRwOi8vdmhvc3QzLmxudS5zZToyMDA4MC9hbnN3ZXIvMVwiLCBhbnN3ZXI6IGpzb25PYmp9LCBmdW5jdGlvbihlcnJvciwgcmVzcG9uc2UpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKEpTT04ucGFyc2UocmVzcG9uc2UpLm5leHRVUkwpO1xuICAgICAgICB1cmwgPSBKU09OLnBhcnNlKHJlc3BvbnNlKS5uZXh0VVJMO1xuICAgIH0pO1xufSk7XG4iXX0=
