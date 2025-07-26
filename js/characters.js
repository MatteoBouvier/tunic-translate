import { vowels, consonants, vowels_rev, consonants_rev, segment_click } from "./segments.js";

/** 
 * Add a character input box to the character buffer
 * @returns {HTMLDivElement} the newly added character
 */
export function add_character() {
    let character_buffer = document.querySelector("#character_buffer");

    let character = document.createElement("div");
    character.classList.add("segment_box", "selectable");

    for (const i of Array(5).keys()) {
        let segment = document.createElement("div");
        segment.classList.add("segment", "vowel", `v${i}`);
        segment.dataset.status = "off";
        segment.onmousedown = segment_click;

        character.appendChild(segment);
    }

    for (const i of Array(7).keys()) {
        let segment = document.createElement("div");
        segment.classList.add("segment", "consonant", `c${i}`);
        segment.dataset.status = "off";
        segment.onmousedown = segment_click;

        character.appendChild(segment);
    }

    character_buffer.appendChild(character);
    return character;
}

/**
 * Write a character (vowel + consonant) to the text buffer
 * @param {boolean} [reset=false] reset current character after writing ?
 */
export function write_character(reset = false) {
    let characters = document.querySelector("#character_buffer").children;

    let text_buffer = "";
    let is_valid = true;

    for (let character of characters) {
        let vowel_code = 0;
        let consonant_code = 0;

        for (const segment of character.querySelectorAll(".vowel")) {
            if (segment.dataset.status == "on") {
                let index = parseInt(segment.classList[2][1]);
                vowel_code += 2 ** index;
            }
        }

        for (const segment of character.querySelectorAll(".consonant")) {
            if (segment.dataset.status == "on") {
                let index = parseInt(segment.classList[2][1]);
                consonant_code += 2 ** index;
            }
        }

        if (vowel_code + consonant_code == 0) { break; }

        let vowel = "";
        let consonant = "";

        if (vowel_code != 0) {
            vowel = vowels[vowel_code];
        }
        if (consonant_code != 0) {
            consonant = consonants[consonant_code];
        }

        if (vowel === undefined) {
            is_valid = false;

            box.classList.add("blink-vowel");
            setTimeout(() => {
                box.classList.remove("blink-vowel")
            }, 3000)
        }

        if (consonant === undefined) {
            is_valid = false;
            box.classList.add("blink-consonant");
            setTimeout(() => {
                box.classList.remove("blink-consonant")
            }, 3000)
        }

        if (vowel != undefined && consonant != undefined) {
            text_buffer += consonant + vowel;
        }
    }

    if (is_valid) {
        let textarea_buffer = document.querySelector("#text_buffer");
        if (textarea_buffer.textContent) {
            text_buffer = ` ${text_buffer}`;
        }

        textarea_buffer.textContent += text_buffer;
    }

    if (reset) {
        reset_character();
    }
}
window.write_character = write_character;


/**
 * Reset character buffer
 * @param {number} [n=-1] number of characters to reset, all by default
 */
export function reset_character(n = -1) {
    if (n === -1) {
        document.querySelector("#character_buffer").textContent = '';
        add_character();
    }

    let characters = document.querySelector("#character_buffer");
    while (n > 0) {
        characters.removeChild(characters.lastChild);
        n--;
    }
}
window.reset_character = reset_character;

/**
 * Set current vowel from string
 * @param {string} letter
 */
export function set_vowel(letter) {
    const characters = document.querySelector("#character_buffer").children;
    let last_character = characters[characters.length - 1];

    if ([...last_character.querySelectorAll(".vowel")].some((segment) => segment.dataset.status == "on")) {
        last_character = add_character();
    }

    const vowel_code = vowels_rev[letter];

    for (const segment of last_character.querySelectorAll(".vowel")) {
        const index = parseInt(segment.classList[2][1]);
        segment.dataset.status = vowel_code & (1 << index) ? "on" : "off";
    }
}


/**
 * Set current consonant from string
 * @param {string} letter
 */
export function set_consonant(letter) {
    const characters = document.querySelector("#character_buffer").children;
    let last_character = characters[characters.length - 1];

    if ([...last_character.querySelectorAll(".consonant")].some((segment) => segment.dataset.status == "on")) {
        last_character = add_character();
    }

    const consonant_code = consonants_rev[letter];

    for (const segment of last_character.querySelectorAll(".consonant")) {
        const index = parseInt(segment.classList[2][1]);
        segment.dataset.status = consonant_code & (1 << index) ? "on" : "off";
    }

}
