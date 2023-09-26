export default function pickLetters(lang = "fr", lettersTable = [], frequencyTable = []) {

    let latinCharsetTable = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    let frequencyTableFr = [7.8, 2, 4, 3.8, 11, 1.4, 3, 2.3, 8.6, 0.21, 0.97, 5.3, 2.7, 7.2, 6.1, 2.8, 0.19, 7.3, 8.7, 6.7, 3.3, 1, 0.91, 0.27, 1.6, 0.44];

    switch (lang) {
        case "fr":
            lettersTable = latinCharsetTable;
            frequencyTable = frequencyTableFr;
            break;

        default:
            if (!lettersTable || !frequencyTable) {
                throw new Error("invalid charset or frequency table");
            }
            break;
    }
    
    let frequencyAccumulation = 0;
    let randomLetterProbability = Math.random() * 100;
    let letterIndex = 0;
    while (randomLetterProbability > frequencyAccumulation) {
        frequencyAccumulation += frequencyTable[letterIndex];
        letterIndex++;
    }

    return lettersTable[letterIndex - 1];
}