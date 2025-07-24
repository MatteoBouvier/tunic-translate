const vowels = {
    "00001": "à",
    "00010": "á",
    "00011": "â",
    "00110": "a",
    "00111": "ä",
    "01000": "è",
    "01100": "e",
    "01111": "ê",
    "10000": "é",
    "11000": "u",
    "10100": "i",
    "10110": "ï",
    "10111": "î",
    "11011": "û",
    "11100": "y",
    "11101": "ÿ",
    "11110": "o",
    "11111": "ô",
};
const consonants = {
    "1100000": "c",
    "1110000": "ç",
    "0011000": "v",
    "0010110": "d",
    "0001110": "f",
    "1001110": "h",
    "0101110": "ħ",
    "0011110": "s",
    "1111110": "w",
    "1000011": "l",
    "0100011": "j",
    "1100011": "ß",
    "1010011": "q",
    "1001011": "k",
    "1111011": "z",
    "0000111": "b",
    "1000111": "g",
    "1100111": "m",
    "0010111": "µ",
    "1010111": "r",
    "0001111": "p",
    "0101111": "t",
    "0011111": "n",
    "1111111": "x",
};

function rev(obj) {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));
}

const vowels_rev = rev(vowels);
const consonants_rev = rev(consonants);

/**
 * @param {string} code binary representation of active segments
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

    let prefix;
    let length;
    if (is_vowel) {
        prefix = "v";
        length = 5;
    } else {
        prefix = "c";
        length = 7;
    }

    let code_value = parseInt(code, 2);
    for (const i of Array(length).keys()) {
        if (code_value & (2 ** i)) {
            segment = document.createElement("div");
            segment.classList.add("segment", prefix + i);
            segment.dataset.status = "on";
            box.appendChild(segment)
        }
    }

    container.appendChild(box);
    container.appendChild(letter_container);

    container.addEventListener("mouseup", function() {
        let box = document.querySelector("#input_box").children[0];

        if (is_vowel) {
            const vowel_code = parseInt(vowels_rev[letter], 2);
            console.log(letter, vowel_code);

            for (const segment of box.querySelectorAll(".vowel")) {
                let index = parseInt(segment.classList[2][1]);
                segment.dataset.status = vowel_code & (2 ** index) ? "on" : "off";
            }
        } else {
            const consonant_code = parseInt(consonants_rev[letter], 2);

            for (const segment of box.querySelectorAll(".consonant")) {
                let index = parseInt(segment.classList[2][1]);
                segment.dataset.status = consonant_code & (2 ** index) ? "on" : "off";
            }
        }
    });

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

function write_character() {
    let box = document.querySelector("#input_box").children[0];

    let vowel_code = 0;
    let consonant_code = 0;

    for (const segment of box.querySelectorAll(".vowel")) {
        if (segment.dataset.status == "on") {
            let index = parseInt(segment.classList[2][1]);
            vowel_code += 2 ** index;
        }
    }

    for (const segment of box.querySelectorAll(".consonant")) {
        if (segment.dataset.status == "on") {
            let index = parseInt(segment.classList[2][1]);
            consonant_code += 2 ** index;
        }
    }

    if (vowel_code + consonant_code == 0) { return; }

    let vowel = "";
    let consonant = "";

    if (vowel_code != 0) {
        vowel = vowels[vowel_code.toString(2).padStart(5, "0")];
    }
    if (consonant_code != 0) {
        consonant = consonants[consonant_code.toString(2).padStart(7, "0")];
    }

    if (vowel === undefined) {
        console.log("invalid vowel");
        // blink red
    }

    if (consonant === undefined) {
        console.log("invalid consonant");
        // blink red
    }

    if (vowel != undefined && consonant != undefined) {
        console.log(consonant + vowel);
    }
}

setup()
