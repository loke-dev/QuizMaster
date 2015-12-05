"use strict";

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
