import { vowels, consonants, vowels_rev, consonants_rev } from "./segments.js";

/**
 * Write a character (vowel + consonant) to the text buffer
 */
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
        vowel = vowels[vowel_code];
    }
    if (consonant_code != 0) {
        consonant = consonants[consonant_code];
    }

    if (vowel === undefined) {
        box.classList.add("blink-vowel");
        setTimeout(() => {
            box.classList.remove("blink-vowel")
        }, 3000)
    }

    if (consonant === undefined) {
        box.classList.add("blink-consonant");
        setTimeout(() => {
            box.classList.remove("blink-consonant")
        }, 3000)
    }

    if (vowel != undefined && consonant != undefined) {
        document.querySelector("#text_buffer").textContent += consonant + vowel;
    }
}
window.write_character = write_character;

/**
 * Set current vowel from string
 * @param {string} letter
 */
export function set_vowel(letter) {
    const box = document.querySelector("#input_box").children[0];
    const vowel_code = vowels_rev[letter];

    for (const segment of box.querySelectorAll(".vowel")) {
        let index = parseInt(segment.classList[2][1]);
        segment.dataset.status = vowel_code & (1 << index) ? "on" : "off";
    }
}


/**
 * Set current consonant from string
 * @param {string} letter
 */
export function set_consonant(letter) {
    const box = document.querySelector("#input_box").children[0];
    const consonant_code = consonants_rev[letter];

    for (const segment of box.querySelectorAll(".consonant")) {
        let index = parseInt(segment.classList[2][1]);
        segment.dataset.status = consonant_code & (1 << index) ? "on" : "off";
    }

}
