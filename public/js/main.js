import pickLetters from "./lettersPicker.js";
import createIdRoom from "./createIdRoom.js";
import { setCookie, getCookie } from "./cookie.js";

// RANDOM LETTERS PICKER

let lettersDiv = document.getElementById("lettersDiv");
let letterDiv = document.createElement('div');
letterDiv.classList.add('letter');

if(lettersDiv) {
    for (let i = 0; i < 3; i++) {

        letterDiv.textContent = pickLetters("fr");
        lettersDiv.appendChild(letterDiv);
        letterDiv = letterDiv.cloneNode(false);
    }
}

if(document.getElementById("idRoom")) {
    setCookie('idRoom', createIdRoom(), 1);
    document.getElementById("idRoom").innerHTML = getCookie('idRoom');
}