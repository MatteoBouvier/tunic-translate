import { vowels_rev } from "./vowels.js";
import { consonants_rev } from "./consonants.js";
import { segment_click, match_letter } from "./segments.js";

/** 
 * Add a character input box to the character buffer
 * @param {HTMLElement} buffer
 * @returns {HTMLDivElement} the newly added character
 */
export function add_character(buffer) {
    let character = document.createElement("div");
    character.classList.add("segment_box", "selectable");

    // vowel segments
    for (let i = 0; i < 5; i++) {
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
    for (let i = 0; i < 7; i++) {
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
    buffer.appendChild(character);

    if (buffer.children.length > 1) {
        /** @type {HTMLElement} */
        let bar = buffer.firstElementChild.querySelector(".Hbar");
        bar.classList.remove("noshow");
        bar.style.width = `${buffer.children.length * 80}px`;

        buffer.classList.add("short_hbar");
    }

    return character;
}

/**
 * @param {HTMLElement} buffer
 */
export function add_character_if_set(buffer) {
    const characters = buffer.children;
    const last_character = characters[characters.length - 1];

    /** @type {HTMLElement[]} */
    // @ts-ignore
    const segments = Array.from(last_character.children);

    if (segments.some((segment) => segment.dataset.status == "on")) {
        add_character(buffer);
    }
}

/**
 * Write a character (vowel + consonant) to the text buffer
 * @param {boolean} [reset=false] reset current character after writing ?
 */
export function write_character(reset = false) {
    /** @type {HTMLDivElement[]} */
    // @ts-ignore
    let characters = document.querySelector("#character_buffer").children;

    let text_buffer = "";
    let is_valid = true;

    for (let character of characters) {
        let [vowel, consonant, _] = match_letter(character);
        if (vowel === "" && consonant === "") { break; }

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
            /** @type {HTMLElement} */
            const circle = character.querySelector(".circle");
            if (circle.dataset.status === "on") {
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
globalThis.write_character = write_character;


/**
 * Reset character buffer
 * @param {HTMLElement} buffer
 * @param {number} [n=-1] number of characters to reset, all by default
 */
export function reset_character(buffer, n = -1) {
    if (n === -1) {
        buffer.textContent = '';
        buffer.classList.remove("short_hbar");
        add_character(buffer);
        return;
    }

    while (n > 0) {
        buffer.removeChild(buffer.lastChild);
        n--;
    }

    if (buffer.children.length === 0) {
        buffer.classList.remove("short_hbar");

        add_character(buffer);
    }
    else if (buffer.children.length === 1) {
        buffer.classList.remove("short_hbar");

        let bar = buffer.firstElementChild.querySelector(".Hbar");
        bar.classList.add("noshow");
    }
    else {
        /** @type {HTMLElement} */
        let bar = buffer.firstElementChild.querySelector(".Hbar");
        bar.style.width = `${buffer.children.length * 80}px`;
    }
}
globalThis.reset_character = reset_character;

/**
 * @param {Element} character
 */
function is_vowel_set(character) {
    /** @type {HTMLElement[]} */
    const segments = Array.from(character.querySelectorAll(".vowel"));
    if (segments.some((segment) => segment.dataset.status == "on")) {
        return true;
    }
    return false;
}

/**
 * @param {Element} character
 */
function is_consonant_set(character) {
    /** @type {HTMLElement[]} */
    const segments = Array.from(character.querySelectorAll(".consonant"));
    if (segments.some((segment) => segment.dataset.status == "on")) {
        return true;
    }
    return false;
}

/**
 * Set current vowel from string
 * @param {HTMLElement} buffer
 * @param {string} letter
 */
export function set_vowel(buffer, letter) {
    const characters = buffer.children;
    let last_character = characters[characters.length - 1];

    if (is_vowel_set(last_character)) {
        last_character = add_character(buffer);
    }

    const vowel_code = vowels_rev.get(letter);

    /** @type {NodeListOf<HTMLElement>} */
    const vowels = last_character.querySelectorAll(".vowel");
    for (const segment of vowels) {
        const index = parseInt(segment.classList[2][1]);
        const new_status = vowel_code & (1 << index) ? "on" : "off";
        segment.dataset.status = new_status;

        if (index === 2) {
            /** @type {HTMLElement} */
            const v2 = last_character.querySelector(".v2-bottom");
            v2.dataset.status = new_status;
        }
    }

    last_character.querySelector(".char-description").innerHTML += letter;
}


/**
 * Set current consonant from string
 * @param {HTMLElement} buffer
 * @param {string} letter
 */
export function set_consonant(buffer, letter) {
    const characters = buffer.children;
    let last_character = characters[characters.length - 1];

    if (is_consonant_set(last_character)) {
        last_character = add_character(buffer);
    }

    if (is_vowel_set(last_character)) {
        /** @type {HTMLElement} */
        const circle = last_character.querySelector(".circle");
        circle.dataset.status = "on";
    }

    const consonant_code = consonants_rev.get(letter);

    /** @type {NodeListOf<HTMLElement>} */
    const consonants = last_character.querySelectorAll(".consonant");
    for (const segment of consonants) {
        const index = parseInt(segment.classList[2][1]);
        segment.dataset.status = consonant_code & (1 << index) ? "on" : "off";
    }

    last_character.querySelector(".char-description").innerHTML += letter;
}


/**
 * @param {HTMLElement} buffer
 * @param {string} letter
 */
export function send_key(buffer, letter) {
    if (vowels_rev.has(letter)) {
        set_vowel(buffer, letter);
    } else if (consonants_rev.has(letter)) {
        set_consonant(buffer, letter);
    }
}
