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
        var alts = JSON.parse(response).alternatives;
        var quests = JSON.parse(response).question;
        requestId = JSON.parse(response).id;
        urlA = JSON.parse(response).nextURL;
        console.log(quests);
        console.log(alts);
        quiz.createTemplate(i, quests, alts);
    });
};

startQuiz.addEventListener("click", function() {
    startQuiz.classList.add("hidden");
    startQuiz.classList.remove("visible");
    submit.classList.add("visible");
    submit.classList.remove("hidden");
    quiz.clean();
    //quiz.switchCase(1);
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
            //quiz.switchCase(i);
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
    clean:clean,
    switchCase:switchCase,
    answer:answer,
    createTemplate:createTemplate
};

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMS4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYWpheC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9xdWl6LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBUaGlzIGNhbGxiYWNrIGZ1bmN0aW9uIHNlbmRzIHJlcXVlc3QgdG8gdGhlIGRhdGFiYXNlXG4gKiBAcGFyYW0gY29uZmlnXG4gKiBAcGFyYW0gY2FsbGJhY2tcbiAqL1xuZnVuY3Rpb24gcmVxdWVzdChjb25maWcsIGNhbGxiYWNrKSB7XG5cbiAgICBjb25maWcudXJsID0gY29uZmlnLnVybCB8fCBcIlwiO1xuICAgIGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kIHx8IFwicG9zdFwiO1xuICAgIGNvbmZpZy5jb250ZW50dHlwZSA9IGNvbmZpZy5jb250ZW50dHlwZSB8fCBcImFwcGxpY2F0aW9uL2pzb25cIjtcbiAgICBjb25maWcuYW5zd2VyID0gY29uZmlnLmFuc3dlciB8fCBudWxsO1xuXG4gICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgcmVxLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIGlmIChyZXEuc3RhdHVzID49IDQwMCkge1xuICAgICAgICAgICAgY2FsbGJhY2socmVxLnN0YXR1cyk7XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjayhudWxsLCByZXEucmVzcG9uc2VUZXh0KTtcblxuICAgIH0pO1xuXG4gICAgcmVxLm9wZW4oY29uZmlnLm1ldGhvZCwgY29uZmlnLnVybCk7XG4gICAgcmVxLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgY29uZmlnLmNvbnRlbnR0eXBlKTtcbiAgICByZXEuc2VuZChjb25maWcuYW5zd2VyKTtcbn1cblxuZnVuY3Rpb24gcmVxdWVzdEdldCh1cmwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHJlcUdldCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgcmVxR2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIGlmIChyZXFHZXQuc3RhdHVzID4gNDAwKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhyZXFHZXQuc3RhdHVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHJlcUdldC5yZXNwb25zZVRleHQpO1xuXG4gICAgfSk7XG5cbiAgICByZXFHZXQub3BlbihcIkdFVFwiLCB1cmwpO1xuICAgIHJlcUdldC5zZW5kKCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHJlcXVlc3Q6IHJlcXVlc3QsXG4gICAgcmVxdWVzdEdldDogcmVxdWVzdEdldFxufTtcbiIsIi8qXG4gQGF1dGhvciAtIExva2UgQ2FybHNzb25cbiAqL1xuXG52YXIgcXVpeiA9IHJlcXVpcmUoXCIuL3F1aXpcIik7XG52YXIgYWpheCA9IHJlcXVpcmUoXCIuL2FqYXhcIik7XG52YXIgc3VibWl0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdWJtaXRcIik7XG52YXIgc3RhcnRRdWl6ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGFydFF1aXpcIik7XG52YXIgdXJsUSA9IHVybFEgfHwgXCJodHRwOi8vdmhvc3QzLmxudS5zZToyMDA4MC9xdWVzdGlvbi8xXCI7XG52YXIgdXJsQTtcbnZhciByZXF1ZXN0SWQ7XG52YXIgaSA9IDE7XG5cbnZhciBnZXRSZXEgPSBmdW5jdGlvbigpIHtcbiAgICBhamF4LnJlcXVlc3RHZXQodXJsUSwgZnVuY3Rpb24oZXJyb3IsIHJlc3BvbnNlKSB7XG4gICAgICAgIHZhciBhbHRzID0gSlNPTi5wYXJzZShyZXNwb25zZSkuYWx0ZXJuYXRpdmVzO1xuICAgICAgICB2YXIgcXVlc3RzID0gSlNPTi5wYXJzZShyZXNwb25zZSkucXVlc3Rpb247XG4gICAgICAgIHJlcXVlc3RJZCA9IEpTT04ucGFyc2UocmVzcG9uc2UpLmlkO1xuICAgICAgICB1cmxBID0gSlNPTi5wYXJzZShyZXNwb25zZSkubmV4dFVSTDtcbiAgICAgICAgY29uc29sZS5sb2cocXVlc3RzKTtcbiAgICAgICAgY29uc29sZS5sb2coYWx0cyk7XG4gICAgICAgIHF1aXouY3JlYXRlVGVtcGxhdGUoaSwgcXVlc3RzLCBhbHRzKTtcbiAgICB9KTtcbn07XG5cbnN0YXJ0UXVpei5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgc3RhcnRRdWl6LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgc3RhcnRRdWl6LmNsYXNzTGlzdC5yZW1vdmUoXCJ2aXNpYmxlXCIpO1xuICAgIHN1Ym1pdC5jbGFzc0xpc3QuYWRkKFwidmlzaWJsZVwiKTtcbiAgICBzdWJtaXQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcbiAgICBxdWl6LmNsZWFuKCk7XG4gICAgLy9xdWl6LnN3aXRjaENhc2UoMSk7XG4gICAgZ2V0UmVxKCk7XG59KTtcblxuc3VibWl0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICB2YXIganNvbk9iaiA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgYW5zd2VyOiBxdWl6LmFuc3dlcihpKVxuICAgIH0pO1xuXG4gICAgYWpheC5yZXF1ZXN0KHttZXRob2Q6IFwiUE9TVFwiLCB1cmw6IHVybEEsIGFuc3dlcjoganNvbk9ian0sIGZ1bmN0aW9uKGVycm9yLCByZXNwb25zZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm5leHQgdXJsOiBcIiArIEpTT04ucGFyc2UocmVzcG9uc2UpLm5leHRVUkwpO1xuICAgICAgICB1cmxRID0gSlNPTi5wYXJzZShyZXNwb25zZSkubmV4dFVSTDtcbiAgICAgICAgaWYgKGVycm9yID09PSBudWxsKSB7XG4gICAgICAgICAgICBxdWl6LmNsZWFuKCk7XG4gICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICAvL3F1aXouc3dpdGNoQ2FzZShpKTtcbiAgICAgICAgICAgIGdldFJlcSgpO1xuICAgICAgICB9IGVsc2UgaWYgKGVycm9yID49IDQwMCkge1xuICAgICAgICAgICAgc3RhcnRRdWl6LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XG4gICAgICAgICAgICBzdGFydFF1aXouY2xhc3NMaXN0LmFkZChcInZpc2libGVcIik7XG4gICAgICAgICAgICBzdWJtaXQuY2xhc3NMaXN0LnJlbW92ZShcInZpc2libGVcIik7XG4gICAgICAgICAgICBzdWJtaXQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcbiAgICAgICAgICAgIHF1aXouY2xlYW4oKTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbn0pO1xuIiwidmFyIHRlbXBsYXRlID0gZnVuY3Rpb24ocXVlc3QpIHtcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RlbXBsYXRlXCIgKyBxdWVzdCk7XG4gICAgdmFyIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYXJlYVwiKS5hcHBlbmRDaGlsZChub2RlKTtcbn07XG5cbnZhciBjbGVhbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYXJlYVwiKTtcbiAgICB3aGlsZSAoZWwuaGFzQ2hpbGROb2RlcygpKSB7XG4gICAgICAgIGVsLnJlbW92ZUNoaWxkKGVsLmxhc3RDaGlsZCk7XG4gICAgfVxufTtcblxudmFyIHN3aXRjaENhc2UgPSBmdW5jdGlvbihpKSB7XG4gICAgc3dpdGNoIChpKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidGVtcGxhdGUgMVwiKTtcbiAgICAgICAgICAgIHRlbXBsYXRlKDEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidGVtcGxhdGUgMlwiKTtcbiAgICAgICAgICAgIHRlbXBsYXRlKDIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidGVtcGxhdGUgM1wiKTtcbiAgICAgICAgICAgIHRlbXBsYXRlKDMpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidGVtcGxhdGUgNFwiKTtcbiAgICAgICAgICAgIHRlbXBsYXRlKDQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidGVtcGxhdGUgNVwiKTtcbiAgICAgICAgICAgIHRlbXBsYXRlKDUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidGVtcGxhdGUgNlwiKTtcbiAgICAgICAgICAgIHRlbXBsYXRlKDYpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNzpcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidGVtcGxhdGUgN1wiKTtcbiAgICAgICAgICAgIHRlbXBsYXRlKDcpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufTtcblxudmFyIGFuc3dlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhbnN3ZXJUZXh0O1xuICAgIHZhciByYWRpb3MgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5TmFtZShcInJhZGlvXCIpO1xuICAgIHZhciB2YWx1ZTtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJhZGlvcy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICBpZiAocmFkaW9zW2pdLmNoZWNrZWQpIHtcbiAgICAgICAgICAgIHZhbHVlID0gcmFkaW9zW2pdLnZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuaW5wdXRCb3hcIikpIHtcbiAgICAgICAgYW5zd2VyVGV4dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuaW5wdXRCb3hcIikudmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYW5zd2VyVGV4dCA9IHZhbHVlO1xuICAgIH1cblxuICAgIHJldHVybiBhbnN3ZXJUZXh0O1xuXG59O1xuXG52YXIgY3JlYXRlVGVtcGxhdGUgPSBmdW5jdGlvbihpLCBxdWVzdGlvbiwgYWx0ZXJuYXRpdmVzKSB7XG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZW1wbGF0ZVwiKTtcbiAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5hcmVhXCIpLmFwcGVuZENoaWxkKG5vZGUpO1xuXG4gICAgdmFyIHRpdGxlTnIgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShpKTtcbiAgICB2YXIgcXVlc3Rpb25Ob2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUocXVlc3Rpb24pO1xuICAgIHZhciB0ZXh0Q2xhc3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnRleHRcIik7XG5cbiAgICB0ZXh0Q2xhc3MuYXBwZW5kQ2hpbGQocXVlc3Rpb25Ob2RlKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnRpdGxlXCIpLmFwcGVuZENoaWxkKHRpdGxlTnIpO1xuXG4gICAgaWYgKGFsdGVybmF0aXZlcykge1xuXG4gICAgICAgIHZhciBhbHRzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYWx0ZXJuYXRpdmVzKTtcbiAgICAgICAgdmFyIG51bUFsdCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGFsdGVybmF0aXZlcykubGVuZ3RoO1xuXG4gICAgICAgIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG51bUFsdDsgaiArPSAxKSB7XG4gICAgICAgICAgICB2YXIgcmFkaW8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gICAgICAgICAgICB2YXIgYWx0VGV4dCA9IGFsdHNbal07XG4gICAgICAgICAgICB2YXIgYWx0ID0gYWx0ZXJuYXRpdmVzW2FsdFRleHRdO1xuICAgICAgICAgICAgdmFyIHRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShhbHQpO1xuICAgICAgICAgICAgcmFkaW8udGl0bGUgPSAoaiArIDEpO1xuICAgICAgICAgICAgcmFkaW8udHlwZSA9IFwicmFkaW9cIjtcbiAgICAgICAgICAgIHJhZGlvLm5hbWUgPSBcInJhZGlvXCI7XG4gICAgICAgICAgICByYWRpby52YWx1ZSA9IGFsdHNbal07XG4gICAgICAgICAgICBmcmFnLmFwcGVuZENoaWxkKHJhZGlvKTtcbiAgICAgICAgICAgIGZyYWcuYXBwZW5kQ2hpbGQodGV4dCk7XG4gICAgICAgICAgICBmcmFnLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJiclwiKSk7XG4gICAgICAgICAgICByYWRpby5jbGFzc0xpc3QuYWRkKFwicmFkaW9cIik7XG4gICAgICAgIH1cblxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnJhZGlvRGl2XCIpLmFwcGVuZENoaWxkKGZyYWcpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGlucHV0Qm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuICAgICAgICBpbnB1dEJveC50eXBlID0gXCJ0ZXh0XCI7XG4gICAgICAgIGlucHV0Qm94LnBsYWNlaG9sZGVyID0gXCJZb3VyIGFuc3dlciBoZXJlLi5cIjtcbiAgICAgICAgaW5wdXRCb3guY2xhc3NMaXN0LmFkZChcImlucHV0Qm94XCIpO1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmlucHV0RGl2XCIpLmFwcGVuZENoaWxkKGlucHV0Qm94KTtcbiAgICB9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHRlbXBsYXRlOnRlbXBsYXRlLFxuICAgIGNsZWFuOmNsZWFuLFxuICAgIHN3aXRjaENhc2U6c3dpdGNoQ2FzZSxcbiAgICBhbnN3ZXI6YW5zd2VyLFxuICAgIGNyZWF0ZVRlbXBsYXRlOmNyZWF0ZVRlbXBsYXRlXG59O1xuIl19
