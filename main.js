import {letterPicker} from "./letterPicker.js";

// RANDOM LETTERS PICKER

let lettersDiv = document.getElementById("lettersDiv");
let letterDiv = document.createElement('div');
letterDiv.classList.add('letter');

for (let i = 0; i < 3; i++) {

    letterDiv.textContent = letterPicker.pickLetter("fr");
    lettersDiv.appendChild(letterDiv);
    letterDiv = letterDiv.cloneNode(false);

}