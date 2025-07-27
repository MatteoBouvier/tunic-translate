import { set_vowel, set_consonant } from "./characters.js"

export const vowels = {
    0b00001: "à",
    0b00010: "á",
    0b00011: "â",
    0b00110: "a",
    0b00111: "ä",
    0b01000: "è",
    0b01100: "e",
    0b01111: "ê",
    0b10000: "é",
    0b11000: "u",
    0b10100: "i",
    0b10110: "ï",
    0b10111: "î",
    0b11011: "û",
    0b11100: "y",
    0b11101: "ÿ",
    0b11110: "o",
    0b11111: "ô",
};
export const consonants = {
    0b1100000: "c",
    0b1110000: "ç",
    0b0011000: "v",
    0b0010110: "d",
    0b0001110: "f",
    0b1001110: "h",
    0b0101110: "ħ",
    0b0011110: "s",
    0b1111110: "w",
    0b1000011: "l",
    0b0100011: "j",
    0b1100011: "ß",
    0b1010011: "q",
    0b1001011: "k",
    0b1111011: "z",
    0b0000111: "b",
    0b1000111: "g",
    0b1100111: "m",
    0b0010111: "µ",
    0b1010111: "r",
    0b0001111: "p",
    0b0101111: "t",
    0b0011111: "n",
    0b1111111: "x",
};

function rev(obj) {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));
}

export const vowels_rev = rev(vowels);
export const consonants_rev = rev(consonants);

/**
 * @param {binary} code binary representation of active segments
 * @param {string} letter
 * @param {bool} is_vowel
 * @returns {HTMLDivElement}
*/
export function build_letter(code, letter, is_vowel) {
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

    for (const i of Array(length).keys()) {
        if (code & (1 << i)) {
            let segment = document.createElement("div");
            segment.classList.add("segment", prefix + i);
            segment.dataset.status = "on";
            box.appendChild(segment)
        }
    }

    container.appendChild(box);
    container.appendChild(letter_container);

    container.addEventListener("mouseup", () => {
        if (is_vowel) {
            set_vowel(letter);
        } else {
            set_consonant(letter);
        }
    });

    return container;
}


/**
 * @param {HTMLDivElement} segment */
export function segment_click() {
    let new_status = this.dataset.status == "off" ? "on" : "off";
    this.dataset.status = new_status;

    if (this.classList.contains("v2")) {
        this.parentNode.querySelector(".v2-bottom").dataset.status = new_status;
    }

    if (this.classList.contains("v2-bottom")) {
        this.parentNode.querySelector(".v2").dataset.status = new_status;
    }
}
