import { vowels } from "./vowels.js";
import { consonants } from "./consonants.js";
import { add_character_if_set, reset_character, send_key } from "./characters.js";
import { build_letter } from "./segments.js";
import { setup_gallery_buttons, display_page } from "./images.js";
import { make_text_buffer, current, find_nearest, set_active, set_mode, Mode } from "./text.js";

/** @type {() => HTMLElement} */
let current_text_buffer = () => current.active.querySelector(".text-buffer");

/**
 * @readonly
 * @enum {string}
 */
const Accent = Object.freeze({
    dieresis: "dieresis",
    circumflex: "circumflex"
})

/** @type {?Accent} */
let key_buffer = null;

/** 
 * A key binding definition.
 * @typedef {Object} Binding
 * @property {(arg0: KeyboardEvent) => void} action - action to perform for the key binding
 * @property {?string[]} [modifiers] - key modifiers that must be pressed (Alt, Shift, Ctrl, Meta)
 * @property {boolean} [skip_after=false] - do not call _after() callback for this binding
 */

const key_binding = {
    /** @type {Object.<string, (Binding | Binding[])>} */
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
            action: () => set_mode(Mode.insert)
        }
    },

    /** @type {Object.<string, (Binding | Binding[])>} */
    [Mode.insert]: {
        Escape: {
            action: () => set_mode(Mode.normal)
        },
        Backspace: {
            action: () => reset_character(current_text_buffer(), 1)
        },
        Tab: {
            action: () => add_character_if_set(current_text_buffer())
        },
        Dead: {
            action: (event) => {
                if (event.code !== "BracketLeft") { return; }

                if (event.shiftKey) {
                    key_buffer = Accent.dieresis;
                } else {
                    key_buffer = Accent.circumflex;
                }
            },
            skip_after: true,
        },
        "æ": {
            action: () => send_key(current_text_buffer(), "á")
        },
        _default: {
            action: (event) => send_key(current_text_buffer(), event.key),
        },
        _after: {
            action: () => key_buffer = null,
        }
    },

    /**
     * Add a key-binding
     * @param {string | string[]} key
     * @param {(() => void)|((arg0: KeyboardEvent) => void)} action
     * @param {Object} opts
     * @param {boolean} [opts.needs_event=false] - KeyboardEvent should be passed to the action function ?
     * @param {boolean} [opts.alt=false] - Alt modifier is set ?
     * @param {boolean} [opts.shift=false] - Shift modifier is set ?
     * @param {boolean} [opts.ctrl=false] - Ctrl modifier is set ?
     * @param {boolean} [opts.meta=false] - Meta modifier is set ?
     * @param {Mode} [opts.mode=Mode.normal]
     * @param {boolean} [opts.skip_after=false]
     */
    add(key, action, { alt = false, shift = false, ctrl = false, meta = false, mode = Mode.normal, skip_after = false }) {
        if (Array.isArray(key)) {
            for (const k of key) {
                this.add(k, action, { alt, shift, ctrl, meta, mode, skip_after });
            }
            return;
        }

        const mod_args = [alt, shift, ctrl, meta];
        const modifiers = ["Alt", "Shift", "Ctrl", "Meta"].filter((_, index) => mod_args[index]);
        const key_bind = {
            action: action,
            modifiers: modifiers,
            skip_after: skip_after
        }

        if (key in this[mode]) {
            if (!Array.isArray(this[mode][key])) {
                this[mode][key] = [this[mode][key]];
            }

            this[mode][key].push(key_bind);
        }
        else {
            this[mode][key] = key_bind;
        }
    },

    /**
     * Match a pressed key with a key-binding's action
     * @param {KeyboardEvent} keypress
     * @returns {() => void}
     */
    match(keypress) {
        function wrapper(action = () => { }, _after = () => { }, skip_after = false) {
            if (skip_after) {
                return () => action();
            }

            return () => {
                action();
                _after();
            }
        }

        const binding = this[current.mode][keypress.key];
        const [action, skip_after] = (() => {
            if (typeof binding === "undefined") {
                return [this[current.mode]._default?.action?.bind(undefined, keypress), false];
            }
            else if (Array.isArray(binding)) {
                for (const b of binding) {
                    let verified = this.verify_modifiers(keypress, b);
                    if (verified !== null) {
                        return [verified.action.bind(undefined, keypress), verified.skip_after];
                    }
                }

                return [undefined, false];

            } else {
                let verified = this.verify_modifiers(keypress, binding);
                return [verified?.action?.bind(undefined, keypress), verified.skip_after];
            }
        })()

        return wrapper(action, this[current.mode]._after?.action, skip_after);
    },

    /**
     * Verify modifiers were correctly set for a key binding
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

key_binding.add(Array.from("aeiouy"), (event) => {
    if (key_buffer === Accent.circumflex) {
        send_key(current_text_buffer(), event.key + "\u0302");
    }
    else if (key_buffer === Accent.dieresis) {
        send_key(current_text_buffer(), event.key + "\u0308");
    }
    else {
        send_key(current_text_buffer(), event.key);
    }
}, { mode: Mode.insert });


/**
 * @param {KeyboardEvent} event
 */
function handle_keybinding(event) {
    // disable default Tab action
    if (event.code === "Tab") {
        event.preventDefault();
    }

    key_binding.match(event)();

    // else if (key == " ") {
    //     key = "";
    //     write_character(true);
    // }
    // else if (key == "Delete") {
    //     key = "";
    //     reset_character();
    // }
    //

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

    // add_character();

    // image display
    setup_gallery_buttons();
    display_page(1);

    // key bindings
    document.onkeydown = handle_keybinding;
})()
