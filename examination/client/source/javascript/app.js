var arr = [1, 1, 1, 2, 2, 2, 3, 3, 3];

function shuffle(o) {
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

arr = shuffle(arr).map(function(current) {
    return getColor(current);
});



var start = new Date().getTime(),
    time = 0,
    elapsed = '0.0';
function instance() {
    time += 100;
    elapsed = Math.floor(time / 100) / 10;
    if(Math.round(elapsed) == elapsed) { elapsed += '.0'; }
    document.querySelector("#time").textContent = elapsed;
    var diff = (new Date().getTime() - start) - time;
    window.clearInterval(clearID);
    clearID = window.setTimeout(instance, (100 - diff));
}
var clearID = window.setTimeout(instance, 100);


var squares = document.querySelectorAll("#board div");
for(var i = 0; i< squares.length; i++) {
    squares[i].classList.remove("grey");
    squares[i].classList.add(arr[i]);
}

var toClick = getColor(1 + Math.floor(Math.random() * 3));
document.querySelector("#colorToClick").textContent += toClick;


function getColor(nr) {
    switch(nr) {
        case 1 : return "red";
        case 2 : return "blue";
        case 3 : return "yellow";
    }
}

var hitsToMake = 3;
var hitsMade = 0;
var div = document.querySelector("#board");
div.addEventListener("click", handleClick);

function handleClick(event) {
    if(event.target.classList.contains("grey")) {
        return false;
    }
    if(event.target.classList.contains(toClick)) {
        event.target.classList.remove(toClick)
        event.target.classList.add("grey");
        hitsMade += 1;
        if(hitsMade === hitsToMake) {
            div.removeEventListener("click", handleClick);
            console.log(clearID);
            window.clearInterval(clearID);
        }
    } else {
        console.log("Miss");
    }
}

