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
