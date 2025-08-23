import { vowels_rev } from "./vowels.js";
import { consonants_rev } from "./consonants.js";
import { segment_click } from "./segments.js";

/**
 * Add a character input box to the word
 * @param {HTMLDivElement} word
 * @returns {HTMLDivElement} the newly added character
 */
export function add_character(word) {
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
    word.appendChild(character);

    if (word.children.length > 1) {
        /** @type {HTMLElement} */
        let bar = word.firstElementChild.querySelector(".Hbar");
        bar.classList.remove("noshow");
        bar.style.width = `${word.children.length * 80}px`;

        word.classList.add("short_hbar");
    }

    return character;
}

/**
 * @param {HTMLDivElement} word
 */
export function add_character_if_set(word) {
    const characters = word.children;
    const last_character = characters[characters.length - 1];

    /** @type {HTMLElement[]} */
    // @ts-ignore
    const segments = Array.from(last_character.children);

    if (segments.some((segment) => segment.dataset.status == "on")) {
        add_character(word);
    }
}

/**
 * Add a word wrapper box to the character buffer
 * @param {HTMLElement} buffer
 * @param {boolean} [check=false] - check if a word can be added (previous word is not empty)
 * @returns {HTMLDivElement} the newly added character
 */
export function add_word(buffer, check = false) {
    if (check) {
        const last_word = buffer.children[buffer.children.length - 1];
        const last_character = last_word.children[last_word.children.length - 1];

        /** @type {HTMLElement[]} */
        // @ts-ignore
        const segments = Array.from(last_character.children);
        if (!segments.some((segment) => segment.dataset.status === "on")) { return }
    }

    const word = document.createElement("div");
    word.classList.add("word");

    buffer.appendChild(word);
    add_character(word)
    return word
}


/**
 * Reset character buffer
 * @param {HTMLElement} buffer
 * @param {number} [n=-1] number of characters to reset, all by default
 */
export function reset_character(buffer, n = -1) {
    /** @type {HTMLDivElement} */
    // @ts-ignore
    const word = buffer.children[buffer.children.length - 1];

    if (n === -1) {
        word.textContent = '';
        word.classList.remove("short_hbar");
        add_character(word);
        return;
    }

    while (n > 0) {
        word.removeChild(word.lastChild);
        n--;
    }

    if (word.children.length === 0) {
        if (buffer.children.length === 1) {
            word.classList.remove("short_hbar");

            add_character(word);
        } else {
            buffer.removeChild(word);
        }
    }
    else if (word.children.length === 1) {
        word.classList.remove("short_hbar");

        let bar = word.firstElementChild.querySelector(".Hbar");
        bar.classList.add("noshow");
    }
    else {
        /** @type {HTMLElement} */
        let bar = word.firstElementChild.querySelector(".Hbar");
        bar.style.width = `${word.children.length * 80}px`;
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
    const words = buffer.children;
    const last_word = words[words.length - 1];
    if (!(last_word instanceof HTMLDivElement)) { throw new Error("Could not find last word of buffer") }

    const characters = last_word.children;
    let last_character = characters[characters.length - 1];

    if (is_vowel_set(last_character)) {
        last_character = add_character(last_word);
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
    const words = buffer.children;
    const last_word = words[words.length - 1];
    if (!(last_word instanceof HTMLDivElement)) { throw new Error("Could not find last word of buffer") }

    const characters = last_word.children;
    let last_character = characters[characters.length - 1];

    if (is_consonant_set(last_character)) {
        last_character = add_character(last_word);
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
    //DEBUG :else {
    //    console.log(letter)
    //}
}
