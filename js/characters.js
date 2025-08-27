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
    let characters = word.querySelector(".characters");
    characters.appendChild(character);

    if (characters.children.length > 1) {
        /** @type {HTMLElement} */
        let bar = characters.firstElementChild.querySelector(".Hbar");
        bar.classList.remove("noshow");
        bar.style.width = `${characters.children.length * 80}px`;

        characters.classList.add("short_hbar");
    }

    return character;
}

/**
 * @param {HTMLDivElement} word
 */
export function add_character_if_set(word) {
    const last_character = word.firstElementChild.lastChild;

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
 * @param {Object} opts
 * @param {boolean} [opts.check=false] - check if a word can be added (previous word is not empty) ?
 * @param {boolean} [opts.record_previous=true] - record previous word ?
 * @returns {HTMLDivElement} the newly added character
 */
export function add_word(buffer, { check = false, record_previous = true } = {}) {
    if (check) {
        const last_word = buffer.lastChild;
        const last_character = last_word.querySelector(".characters").lastChild;

        /** @type {HTMLElement[]} */
        // @ts-ignore
        const segments = Array.from(last_character.children);
        if (!segments.some((segment) => segment.dataset.status === "on")) { return }
    }

    //TODO: move record to send_key, here only set .is_end_of_word
    if (record_previous) {
        const last_word = buffer.lastChild;
        let word_text = "";

        for (const char of last_word.querySelector(".characters").children) {
            word_text += char.querySelector(".char-description").innerHTML;
        }

        page_buffer_collection.words.insert(word_text,
            page_buffer_collection.displayed,
            page_buffer_collection.current_page.active
        );
    }

    const word = document.createElement("div");
    word.classList.add("word", "box");

    const characters = document.createElement("div");
    characters.classList.add("characters");
    word.appendChild(characters);

    const meaning = document.createElement("div");
    meaning.classList.add("meaning");
    word.appendChild(meaning);

    buffer.appendChild(word);
    add_character(word)
    return word
}

/**
 * Remove the last character/word of a buffer if the character/word is not set
 * @param {HTMLElement} buffer
 */
export function cleanup_word(buffer) {
    const last_word = buffer.lastChild;
    if (last_word === null) { return }
    const last_character = last_word.firstElementChild.lastChild;

    /** @type {HTMLElement[]} */
    // @ts-ignore
    const segments = Array.from(last_character.querySelectorAll(".segment"));
    if (segments.every((segment) => segment.dataset.status === "off")) {
        reset_character(buffer, 1, false);
    }
}


/**
 * Reset character buffer
 * @param {HTMLElement} buffer
 * @param {number} [n=-1] - number of characters to reset, all by default
 * @param {boolean} [keep_one_word=true] - keep at least one empty word in the buffer
 */
export function reset_character(buffer, n = -1, keep_one_word = true) {
    /** @type {HTMLDivElement} */
    // @ts-ignore
    const word = buffer.lastChild;
    let characters = word.firstElementChild;

    if (n === -1) {
        characters.textContent = '';
        word.classList.remove("short_hbar");
        add_character(word);
        return;
    }

    while (n > 0) {
        characters.removeChild(characters.lastChild);
        n--;
    }

    if (characters.children.length === 0) {
        if (keep_one_word && buffer.children.length === 1) {
            word.classList.remove("short_hbar");

            add_character(word);
        } else {
            buffer.removeChild(word);
        }
    }
    else if (characters.children.length === 1) {
        word.classList.remove("short_hbar");

        let bar = characters.firstElementChild.querySelector(".Hbar");
        bar.classList.add("noshow");
    }
    else {
        /** @type {HTMLElement} */
        let bar = characters.firstElementChild.querySelector(".Hbar");
        console.log(word)
        bar.style.width = `${characters.children.length * 80}px`;
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

    const characters = last_word.firstElementChild.children;
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

    const characters = last_word.firstElementChild.children;
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
 * @param {Object} opts
 * @param {boolean} [opts.meaning=false]
 */
export function send_key(buffer, letter, { meaning = false } = {}) {
    if (meaning) {
        letter = letter.toLowerCase();
        if (!vowels_rev.has(letter) && !consonants_rev.has(letter)) { return }

        const last_word = buffer.lastChild;
        let meaning = last_word.lastChild;
        meaning.innerText += letter;
    }
    else {
        if (vowels_rev.has(letter)) {
            set_vowel(buffer, letter);
        } else if (consonants_rev.has(letter)) {
            set_consonant(buffer, letter);
        }
        //DEBUG :else {
        //    console.log(letter)
        //}
    }
}
