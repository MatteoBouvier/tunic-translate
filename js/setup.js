import { vowels_list, vowels } from "./vowels.js";
import { consonants_list, consonants } from "./consonants.js";
import { set_vowel, set_consonant, add_character, add_character_if_set, write_character, reset_character } from "./characters.js";
import { build_letter } from "./segments.js";
import { setup_gallery_buttons, display_page } from "./images.js";
import { make_text_buffer, current, find_nearest, set_active } from "./text.js";

let key_buffer = "";

/**
 * @readonly
 * @enum {string}
 */
const Mode = Object.freeze({
    normal: "normal",
    insert: "insert"
})

/** 
 * A key binding definition.
 * @typedef {Object} Binding
 * @property {() => void} action - action to perform for the key binding
 * @property {?string[]} modifiers - key modifiers that must be pressed (Alt, Shift, Ctrl, Meta)
 */

/** @type {Object.<Mode, Object.<string, (Binding | Binding[])>>} */
const key_binding = {
    [Mode.normal]: {
        h: [
            {
                action: () => {
                    let sibling = find_nearest(current.active, "left");
                    if (sibling !== null) {
                        set_active(sibling);
                    }
                }
            },
            {
                action: () => {
                    let sibling = find_nearest(current.active, "left");
                    if (sibling !== null) {
                        sibling.insertAdjacentElement("beforebegin", current.active);
                    }
                },
                modifiers: ['Alt']
            },
        ],
        l: [
            {
                action: () => {
                    let sibling = find_nearest(current.active, "right");
                    if (sibling !== null) {
                        set_active(sibling);
                    }
                }
            },
            {
                action: () => {
                    let sibling = find_nearest(current.active, "right");
                    if (sibling !== null) {
                        sibling.insertAdjacentElement("afterend", current.active);
                    }
                },
                modifiers: ['Alt']
            }
        ],
        k: [
            {
                action: () => {
                    let sibling = find_nearest(current.active, "up");
                    if (sibling !== null) {
                        set_active(sibling);
                    }
                }
            },
            {
                action: () => {
                    let sibling = find_nearest(current.active, "up");
                    if (sibling !== null) {
                        sibling.insertAdjacentElement("beforebegin", current.active);
                    }
                },
                modifiers: ['Alt']
            }
        ],
        j: [
            {
                action: () => {
                    let sibling = find_nearest(current.active, "down");
                    if (sibling !== null) {
                        set_active(sibling);
                    }
                }
            },
            {
                action: () => {
                    let sibling = find_nearest(current.active, "down");
                    if (sibling !== null) {
                        sibling.insertAdjacentElement("afterend", current.active);
                    }
                },
                modifiers: ['Alt']
            }
        ],
        i: {
            action: () => { current.mode = Mode.insert }
        }
    },
    [Mode.insert]: {
        Escape: {
            action: () => { current.mode = Mode.normal }
        }
    },

    /**
     * match a pressed key with a key-binding's action
     * @param {KeyboardEvent} keypress
     * @returns {() => void|undefined}
     */
    match(keypress) {
        const binding = this[current.mode][keypress.key];
        if (typeof binding === "undefined") {
            return undefined;
        }
        else if (Array.isArray(binding)) {
            for (const b of binding) {
                let verified = this.verify_modifiers(keypress, b);
                if (verified !== null) {
                    return verified.action;
                }
            }

            return undefined;

        } else {
            return this.verify_modifiers(keypress, binding)?.action;
        }
    },

    /**
     * Match a pressed key with a key-binding's action
     * @param {KeyboardEvent} keypress
     * @param {Binding} binding
     * @returns {?Binding}
     */
    verify_modifiers(keypress, binding) {
        let modifiers = binding.modifiers ?? [];

        if (keypress.altKey === modifiers.includes("Alt")
            && keypress.shiftKey === modifiers.includes("Shift")
            && keypress.ctrlKey === modifiers.includes("Ctrl")
            && keypress.metaKey === modifiers.includes("Meta")) {
            return binding;
        }

        return null;
    }
}

function handle_keybinding(event) {
    // disable default Tab action
    if (event.keyCode === 9) {
        event.preventDefault();
    }

    let action = key_binding.match(event) ?? (() => { });
    action();

    // if (event.code == "BracketLeft") {
    //     if (event.shiftKey) {
    //         key_buffer = "dieresis";
    //     } else {
    //         key_buffer = "circumflex";
    //     }
    //
    //     return;
    // }
    //
    // let key = event.key;
    //
    // if (key == "æ") {
    //     key = "á";
    // }
    // else if (key == " ") {
    //     key = "";
    //     write_character(true);
    // }
    // else if (key == "Delete") {
    //     key = "";
    //     reset_character();
    // }
    // else if (key == "Backspace") {
    //     key = "";
    //     reset_character(1);
    // }
    // else if (key == "Tab") {
    //     key = "";
    //     add_character_if_set();
    // }
    // else if (key == "Escape") {
    //     key = "";
    //     current.active.classList.remove("active");
    // }
    // else if (key_buffer == "circumflex") {
    //     if (key === 'a') {
    //         key = "â";
    //     } else if (key == 'e') {
    //         key = "ê";
    //     } else if (key == 'i') {
    //         key = "î";
    //     } else if (key == "o") {
    //         key = "ô";
    //     } else if (key == "u") {
    //         key = "û";
    //     } else {
    //         key = "";
    //     }
    // }
    // else if (key_buffer == "dieresis") {
    //     if (key === 'a') {
    //         key = "ä";
    //     } else if (key == 'i') {
    //         key = "ï";
    //     } else if (key == "y") {
    //         key = "ÿ";
    //     } else {
    //         key = "";
    //     }
    // }
    // key_buffer = "";
    //
    // if (current.mode === "normal") {
    //     if (key === "h") {
    //         let sibling = find_nearest(current.active, "left");
    //         if (sibling !== null) {
    //             set_active(sibling);
    //         }
    //     }
    //     else if (key === "l") {
    //         let sibling = find_nearest(current.active, "right");
    //         if (sibling !== null) {
    //             set_active(sibling);
    //         }
    //     }
    //     else if (key === "k") {
    //         let sibling = find_nearest(current.active, "up");
    //         if (sibling !== null) {
    //             set_active(sibling);
    //         }
    //     }
    //     else if (key === "j") {
    //         let sibling = find_nearest(current.active, "down");
    //         if (sibling !== null) {
    //             set_active(sibling);
    //         }
    //     }
    // }
    // else if (current.mode === "insert") {
    //     if (key === "" || event.altKey || event.shiftKey || event.ctrlKey || event.metaKey) { return; }
    //
    //     if (vowels_list.indexOf(key) !== -1) {
    //         set_vowel(key);
    //     } else if (consonants_list.indexOf(key) !== -1) {
    //         set_consonant(key);
    //     }
    // }

}

(() => {
    // character buffer
    document.querySelector("#text-buffer-container > .row").appendChild(make_text_buffer(true));

    let container = document.querySelector("#vowels_container");
    for (const [code, letter] of vowels) {
        container.appendChild(build_letter(code, letter, true));
    }

    container = document.querySelector("#consonants_container");
    for (const [code, letter] of consonants) {
        container.appendChild(build_letter(code, letter, false));
    }

    add_character();

    // image display
    setup_gallery_buttons();
    display_page(1);

    // key bindings
    document.onkeydown = handle_keybinding;
})()
