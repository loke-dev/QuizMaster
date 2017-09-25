"use strict";

//Function to clean the area which templates are appended to
var clean = function() {
    var el = document.querySelector(".area");
    while (el.hasChildNodes()) {
        el.removeChild(el.lastChild);
    }
};

//Template for when the game is over
var gameOver = function() {
    var template = document.querySelector("#endTemplate");
    var node = document.importNode(template.content, true);
    document.querySelector(".area").appendChild(node);
};

//Template for when the game is complete
var quizComplete = function() {
    var template = document.querySelector("#quizComplete");
    var node = document.importNode(template.content, true);
    document.querySelector(".area").appendChild(node);
};

//Function that handles the extraction of answer from inputbox or radiobuttons
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

//Function that generates radiobuttons
var genRadio = function(alternatives) {
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

    return frag;
};

//Function that generates a inputbox
var genInput = function() {
    var inputBox = document.createElement("input");
    inputBox.type = "text";
    inputBox.placeholder = "Your answer here..";
    inputBox.classList.add("inputBox");
    document.querySelector(".inputDiv").appendChild(inputBox);
    inputBox.focus();
};

//Creates a template for each question
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
        document.querySelector(".radioDiv").appendChild(genRadio(alternatives));
    } else {
        genInput();
    }

};

module.exports = {
    clean:clean,
    gameOver:gameOver,
    answer:answer,
    createTemplate:createTemplate,
    quizComplete:quizComplete
};
