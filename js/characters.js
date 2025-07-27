import { vowels_rev } from "./vowels.js";
import { consonants_rev } from "./consonants.js";
import { segment_click, match_letter } from "./segments.js";

/** 
 * Add a character input box to the character buffer
 * @returns {HTMLDivElement} the newly added character
 */
export function add_character() {
    let character_buffer = document.querySelector("#character_buffer");

    let character = document.createElement("div");
    character.classList.add("segment_box", "selectable");

    // vowel segments
    for (const i of Array(5).keys()) {
        let segment = document.createElement("div");
        segment.classList.add("segment", "vowel", `v${i}`);
        segment.dataset.status = "off";
        segment.onmousedown = segment_click;

        character.appendChild(segment);
    }

    let segment = document.createElement("div");
    segment.classList.add("segment", `v2-bottom`);
    segment.dataset.status = "off";
    segment.onmousedown = segment_click;

    character.appendChild(segment);

    // consonant segments
    for (const i of Array(7).keys()) {
        let segment = document.createElement("div");
        segment.classList.add("segment", "consonant", `c${i}`);

        segment.dataset.status = "off";
        segment.onmousedown = segment_click;

        character.appendChild(segment);
    }

    // bottom circle
    let circle = document.createElement("div");
    circle.classList.add("circle");
    circle.dataset.status = "off";
    circle.onmousedown = segment_click;

    character.appendChild(circle);

    // horizontal bar
    let bar = document.createElement("div");
    bar.classList.add("Hbar", "noshow");

    character.appendChild(bar);

    // human readable
    let description = document.createElement("div");
    description.classList.add("char-description");

    character.appendChild(description);

    // finally append character
    character_buffer.appendChild(character);

    if (character_buffer.children.length > 1) {
        let bar = character_buffer.firstChild.querySelector(".Hbar");
        bar.classList.remove("noshow");
        bar.style.width = `${character_buffer.children.length * 80}px`;

        character_buffer.classList.add("short_hbar");
    }

    return character;
}

export function add_character_if_set() {
    const characters = document.querySelector("#character_buffer").children;
    let last_character = characters[characters.length - 1];

    if ([...last_character.children].some((segment) => segment.dataset.status == "on")) {
        add_character();
    }
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
        let [vowel, consonant, _] = match_letter(character);
        if (vowel === "" && consonant_code === "") { break; }

        if (vowel === undefined) {
            is_valid = false;

            character.classList.add("blink-vowel");
            setTimeout(() => {
                character.classList.remove("blink-vowel")
            }, 3000)
        }

        if (consonant === undefined) {
            is_valid = false;
            character.classList.add("blink-consonant");
            setTimeout(() => {
                character.classList.remove("blink-consonant")
            }, 3000)
        }

        if (vowel != undefined && consonant != undefined) {
            if (character.querySelector(".circle").dataset.status === "on") {
                text_buffer += vowel + consonant;
            } else {
                text_buffer += consonant + vowel;
            }
        }
    }

    if (is_valid) {
        let textarea_buffer = document.querySelector("#text_buffer");
        if (textarea_buffer.textContent) {
            text_buffer = ` ${text_buffer}`;
        }

        textarea_buffer.textContent += text_buffer;

        if (reset) {
            reset_character();
        }
    }

}
window.write_character = write_character;


/**
 * Reset character buffer
 * @param {number} [n=-1] number of characters to reset, all by default
 */
export function reset_character(n = -1) {
    let characters = document.querySelector("#character_buffer");

    if (n === -1) {
        characters.textContent = '';
        characters.classList.remove("short_hbar");
        add_character();
        return;
    }

    while (n > 0) {
        characters.removeChild(characters.lastChild);
        n--;
    }

    if (characters.children.length === 0) {
        characters.classList.remove("short_hbar");

        add_character();
    }
    else if (characters.children.length === 1) {
        characters.classList.remove("short_hbar");

        let bar = characters.firstChild.querySelector(".Hbar");
        bar.classList.add("noshow");
    }
    else {
        let bar = characters.firstChild.querySelector(".Hbar");
        bar.style.width = `${character_buffer.children.length * 80}px`;
    }
}
window.reset_character = reset_character;

function is_vowel_set(character) {
    if ([...character.querySelectorAll(".vowel")].some((segment) => segment.dataset.status == "on")) {
        return true;
    }
    return false;
}

function is_consonant_set(character) {
    if ([...character.querySelectorAll(".consonant")].some((segment) => segment.dataset.status == "on")) {
        return true;
    }
    return false;
}

/**
 * Set current vowel from string
 * @param {string} letter
 */
export function set_vowel(letter) {
    const characters = document.querySelector("#character_buffer").children;
    let last_character = characters[characters.length - 1];

    if (is_vowel_set(last_character)) {
        last_character = add_character();
    }

    const vowel_code = vowels_rev[letter];

    for (const segment of last_character.querySelectorAll(".vowel")) {
        const index = parseInt(segment.classList[2][1]);
        const new_status = vowel_code & (1 << index) ? "on" : "off";
        segment.dataset.status = new_status;

        if (index === 2) {
            last_character.querySelector(".v2-bottom").dataset.status = new_status;
        }
    }

    last_character.querySelector(".char-description").innerHTML += letter;
}


/**
 * Set current consonant from string
 * @param {string} letter
 */
export function set_consonant(letter) {
    const characters = document.querySelector("#character_buffer").children;
    let last_character = characters[characters.length - 1];

    if (is_consonant_set(last_character)) {
        last_character = add_character();
    }

    if (is_vowel_set(last_character)) {
        last_character.querySelector(".circle").dataset.status = "on";
    }

    const consonant_code = consonants_rev[letter];

    for (const segment of last_character.querySelectorAll(".consonant")) {
        const index = parseInt(segment.classList[2][1]);
        segment.dataset.status = consonant_code & (1 << index) ? "on" : "off";
    }

    last_character.querySelector(".char-description").innerHTML += letter;
}
