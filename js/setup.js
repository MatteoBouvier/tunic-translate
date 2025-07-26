import { set_vowel, set_consonant, write_character, reset_character } from "./characters.js";
import { build_letter, vowels, consonants } from "./segments.js";

let key_buffer = "";

function handle_keybinding(event) {
    if (event.code == "BracketLeft") {
        if (event.shiftKey) {
            key_buffer = "dieresis";
        } else {
            key_buffer = "circumflex";
        }

        return;
    }

    let key = event.key;

    if (key == "æ") {
        key = "á";
    }
    else if (key == " ") {
        key = "";
        write_character();
        reset_character();
    }
    else if (key_buffer == "circumflex") {
        if (key === 'a') {
            key = "â";
        } else if (key == 'e') {
            key = "ê";
        } else if (key == 'i') {
            key = "î";
        } else if (key == "o") {
            key = "ô";
        } else if (key == "u") {
            key = "û";
        } else {
            key = "";
        }
    }
    else if (key_buffer == "dieresis") {
        if (key === 'a') {
            key = "ä";
        } else if (key == 'i') {
            key = "ï";
        } else if (key == "y") {
            key = "ÿ";
        } else {
            key = "";
        }
    }
    key_buffer = "";

    if (key === "" || event.altKey || event.shiftKey || event.ctrlKey || event.metaKey) { return; }

    if (['a', 'á', 'à', 'â', 'ä', 'e', 'é', 'è', 'ê', 'i', 'î', 'ï', 'o', 'ô', 'u', 'û', 'y', 'ÿ'].indexOf(key) !== -1) {
        set_vowel(key);
    } else if (
        ["c", "ç", "v", "d", "f", "h", "ħ", "s", "w", "l", "j", "ß", "q", "k", "z", "b", "g", "m", "µ", "r", "p", "t", "n", "x"].indexOf(key) !== -1
    ) {
        set_consonant(key);
    }
}

(() => {
    let container = document.querySelector("#vowels_container");
    for (const [code, letter] of Object.entries(vowels)) {
        container.appendChild(build_letter(code, letter, true));
    }

    container = document.querySelector("#consonants_container");
    for (const [code, letter] of Object.entries(consonants)) {
        container.appendChild(build_letter(code, letter, false));
    }

    document.onkeydown = handle_keybinding;
})()
