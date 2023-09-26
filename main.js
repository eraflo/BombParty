
import {letterPicker} from "./letterPicker.js";

// RANDOM LETTERS PICKER

let lettersDiv = document.getElementById("lettersDiv");
let letterDiv = document.createElement('div');
letterDiv.classList.add('letter');

let lettersPicked = []

for (let i = 0; i < 3; i++) {

    lettersPicked.push(letterPicker.pickLetter("fr"));

}

letterDiv.textContent = lettersPicked[i];
lettersDiv.appendChild(letterDiv);
letterDiv = letterDiv.cloneNode(false);