import { add_character_if_set, add_word, reset_character, send_key } from "./characters.js";
import { setup_gallery_buttons, display_page } from "./images.js";
import { Mode, Direction, page_buffer_collection, save, load } from "./pages.js";

/** @type {() => HTMLElement} */
let current_text_buffer = () => page_buffer_collection.current_page.get_active().text_buffer;
let current_word = () => {
    const words = current_text_buffer().children;
    const last_word = words[words.length - 1];
    if (!(last_word instanceof HTMLDivElement)) { throw new Error("Could not find word in buffer") }

    return last_word;
}

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
                    const page = page_buffer_collection.current_page;
                    page.set_nearest_active(page.active, Direction.left);
                }
            },
            {
                action: () => {
                    const page = page_buffer_collection.current_page;
                    page.move(page.active, Direction.left);
                },
                modifiers: ['Alt']
            },
        ],
        l: [
            {
                action: () => {
                    const page = page_buffer_collection.current_page;
                    page.set_nearest_active(page.active, Direction.right)
                }
            },
            {
                action: () => {
                    const page = page_buffer_collection.current_page;
                    page.move(page.active, Direction.right);
                },
                modifiers: ['Alt']
            }
        ],
        k: [
            {
                action: () => {
                    const page = page_buffer_collection.current_page;
                    page.set_nearest_active(page.active, Direction.up);
                }
            },
            {
                action: () => {
                    const page = page_buffer_collection.current_page;
                    page.move(page.active, Direction.up);
                },
                modifiers: ['Alt']
            }
        ],
        j: [
            {
                action: () => {
                    const page = page_buffer_collection.current_page;
                    page.set_nearest_active(page.active, Direction.down);
                }
            },
            {
                action: () => {
                    const page = page_buffer_collection.current_page;
                    page.move(page.active, Direction.down);
                },
                modifiers: ['Alt']
            }
        ],
        i: {
            action: () => page_buffer_collection.current_page.get_active().mode = Mode.insert
        },
        "/": [
            {
                // @ts-ignore
                action: () => page_buffer_collection.current_page.get_active().mode = Mode.search
            },
            {
                // @ts-ignore
                action: () => page_buffer_collection.current_page.get_active().mode = Mode.search,
                modifiers: ["Shift"]
            }
        ]
    },

    /** @type {Object.<string, (Binding | Binding[])>} */
    [Mode.insert]: {
        Escape: {
            action: () => page_buffer_collection.current_page.get_active().mode = Mode.normal
        },
        Backspace: {
            action: () => reset_character(current_text_buffer(), 1)
        },
        Tab: {
            action: () => add_character_if_set(current_word())
        },
        " ": {
            action: () => add_word(current_text_buffer(), { check: true })
        },
        Dead: [
            {
                action: (event) => {
                    if (event.code !== "BracketLeft") { return; }
                    key_buffer = Accent.circumflex;
                },
                skip_after: true,
            },
            {
                action: (event) => {
                    if (event.code !== "BracketLeft") { return; }
                    key_buffer = Accent.dieresis;
                },
                skip_after: true,
                modifiers: ["Shift"],
            }
        ],
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

    /** @type {Object.<string, (Binding | Binding[])>} */
    [Mode.search]: {
        Escape: {
            action: () => page_buffer_collection.current_page.get_active().mode = Mode.normal
        },
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

        const current_mode = page_buffer_collection.current_page.get_active().mode;
        const binding = this[current_mode][keypress.key];
        const [action, skip_after] = (() => {
            if (typeof binding === "undefined") {
                return [this[current_mode]._default?.action?.bind(undefined, keypress), false];
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
                return [verified?.action?.bind(undefined, keypress), verified?.skip_after];
            }
        })()

        return wrapper(action, this[current_mode]._after?.action, skip_after);
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
        send_key(current_text_buffer(), String.fromCharCode(event.key.charCodeAt(0), 770));
    }
    else if (key_buffer === Accent.dieresis) {
        send_key(current_text_buffer(), String.fromCharCode(event.key.charCodeAt(0), 776));
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
    if (event.code === "Tab" || event.code === "Space" || event.key === "/") {
        event.preventDefault();
    }

    key_binding.match(event)();
}

(() => {
    // text buffers
    page_buffer_collection.display(1);

    // image display
    setup_gallery_buttons();
    display_page(1);

    // key bindings
    document.onkeydown = handle_keybinding;

    // save & load
    // @ts-ignore
    document.querySelector("#save-button").onmousedown = () => save();
    // @ts-ignore
    document.querySelector("#fileupload").onchange = load;
})()
