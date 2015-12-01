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