import { vowels_list, vowels } from "./vowels.js";
import { consonants_list, consonants } from "./consonants.js";
import { set_vowel, set_consonant, add_character, add_character_if_set, write_character, reset_character } from "./characters.js";
import { build_letter } from "./segments.js";
import { setup_gallery_buttons, display_page } from "./images.js";

let key_buffer = "";

function handle_keybinding(event) {
    // disable default Tab action
    if (event.keyCode === 9) {
        event.preventDefault();
    }

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
        write_character(true);
    }
    else if (key == "Delete") {
        key = "";
        reset_character();
    }
    else if (key == "Backspace") {
        key = "";
        reset_character(1);
    }
    else if (key == "Tab") {
        key = "";
        add_character_if_set();
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

    if (vowels_list.indexOf(key) !== -1) {
        set_vowel(key);
    } else if (consonants_list.indexOf(key) !== -1) {
        set_consonant(key);
    }
}

(() => {
    // character buffer
    let container = document.querySelector("#vowels_container");
    for (const [code, letter] of Object.entries(vowels)) {
        container.appendChild(build_letter(code, letter, true));
    }

    container = document.querySelector("#consonants_container");
    for (const [code, letter] of Object.entries(consonants)) {
        container.appendChild(build_letter(code, letter, false));
    }

    add_character();

    // image display
    setup_gallery_buttons();
    display_page(1);

    // key bindings
    document.onkeydown = handle_keybinding;
})()
