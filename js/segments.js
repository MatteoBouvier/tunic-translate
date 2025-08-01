import { vowels } from "./vowels.js";
import { consonants } from "./consonants.js";
import { set_vowel, set_consonant } from "./characters.js"

/**
 * @param {number} code - binary representation of active segments
 * @param {string} letter
 * @param {boolean} is_vowel
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

    for (let i = 0; i < length; i++) {
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
 * @param {HTMLDivElement} character
 * @returns {[(string|undefined), (string|undefined), boolean]}
 */
export function match_letter(character) {
    let vowel_code = 0;
    let consonant_code = 0;

    for (const segment of character.querySelectorAll(".vowel")) {
        if (segment instanceof HTMLElement && segment.dataset.status == "on") {
            const index = parseInt(segment.classList[2][1]);
            vowel_code += 2 ** index;
        }
    }

    for (const segment of character.querySelectorAll(".consonant")) {
        if (segment instanceof HTMLElement && segment.dataset.status == "on") {
            const index = parseInt(segment.classList[2][1]);
            consonant_code += 2 ** index;
        }
    }

    const vowel = vowel_code === 0 ? "" : vowels[vowel_code];
    const consonant = consonant_code === 0 ? "" : consonants[consonant_code];

    /** @type {HTMLElement} */
    const circle = character.querySelector(".circle");
    const reversed = circle.dataset.status == "on";

    return [vowel, consonant, reversed];
}


export function segment_click() {
    let new_status = this.dataset.status == "off" ? "on" : "off";
    let character = this.parentNode;
    this.dataset.status = new_status;

    if (this.classList.contains("v2")) {
        character.querySelector(".v2-bottom").dataset.status = new_status;
    }

    if (this.classList.contains("v2-bottom")) {
        character.querySelector(".v2").dataset.status = new_status;
    }

    let [vowel, consonant, reversed] = match_letter(character);
    vowel = vowel === undefined ? "?" : vowel;
    consonant = consonant === undefined ? "?" : consonant;
    character.querySelector(".char-description").innerText = reversed ? vowel + consonant : consonant + vowel;
}
