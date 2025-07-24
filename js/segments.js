const vowels = {
    "00001": "é",
    "00011": "u",
    "00010": "è",
    "00101": "i",
    "00110": "e",
    "00111": "y",
    "01000": "á",
    "01100": "a",
    "01101": "ï",
    "01111": "o",
    "10000": "à",
    "10111": "ÿ",
    "11000": "â",
    "11011": "û",
    "11100": "ä",
    "11101": "î",
    "11110": "ê",
    "11111": "ô",
};
const consonants = {
    "0000011": "c",
    "0000111": "ç",
    "0001100": "v",
    "0110100": "d",
    "0111000": "f",
    "0111001": "h",
    "0111010": "ħ",
    "0111100": "s",
    "0111111": "w",
    "1100001": "l",
    "1100010": "j",
    "1100011": "ß",
    "1100101": "q",
    "1101001": "k",
    "1101111": "z",
    "1110000": "b",
    "1110001": "g",
    "1110011": "m",
    "1110100": "µ",
    "1110101": "r",
    "1111000": "p",
    "1111010": "t",
    "1111100": "n",
    "1111111": "x",
};

/**
 * @param {string} code
 * @param {string} letter
 * @param {bool} is_vowel
 * @returns {HTMLDivElement}
*/
function build_letter(code, letter, is_vowel) {
    let container = document.createElement("div");
    container.classList.add("card");

    let letter_container = document.createElement("div");
    letter_container.textContent = letter;
    letter_container.style.textAlign = "center";
    letter_container.style.paddingTop = "3px";

    let box = document.createElement("div");
    box.classList.add("segment_box", "small")

    let prefix = is_vowel ? "v" : "c";

    for (const [i, active] of [...code].entries()) {
        if (active == "1") {
            segment = document.createElement("div");
            segment.classList.add("segment", prefix + (i + 1));
            segment.dataset.status = "on";
            box.appendChild(segment)
        }
    }

    container.appendChild(box);
    container.appendChild(letter_container);

    return container;
}


function setup() {
    let container = document.querySelector("#vowels_container");
    for (const [code, letter] of Object.entries(vowels).sort()) {
        container.appendChild(build_letter(code, letter, true));
    }

    container = document.querySelector("#consonants_container");
    for (const [code, letter] of Object.entries(consonants).sort()) {
        container.appendChild(build_letter(code, letter, false));
    }
}

/**
 * @param {HTMLDivElement} segment */
function segment_mouseup(segment) {
    let new_status = segment.dataset.status == "off" ? "on" : "off";
    segment.dataset.status = new_status;
}

setup()
