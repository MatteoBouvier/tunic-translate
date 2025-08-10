import { add_character } from "./characters.js";
import { page_buffer_collection } from "./pages.js";

/**
 * @readonly
 * @enum {string}
 */
export const Mode = Object.freeze({
    normal: "normal",
    insert: "insert"
})

/**
 * @readonly
 * @enum {string}
 */
export const Direction = Object.freeze({
    right: "right",
    left: "left",
    up: "up",
    down: "down",
})

export let current = {
    /** @type {Mode} mode */
    mode: Mode.normal,
}

/**
 * @param {string} content
 * @param {Object} opts
 * @param {boolean} [opts.active=false]
 * @returns {HTMLDivElement}
 */
export function make_text_buffer(content, { active = false }) {
    let wrapper = document.createElement("div");
    wrapper.classList.add("text-buffer-wrapper");

    if (active) {
        wrapper.classList.add("active");
    }

    // text buffer
    let buffer = document.createElement("div");
    buffer.classList.add("text-buffer");
    buffer.innerText = content;
    buffer.onclick = update_active;
    wrapper.appendChild(buffer);

    // button add right
    let button_right = document.createElement("div");
    button_right.classList.add("text-buffer-button", "right");
    button_right.onmouseup = add_text_buffer;
    button_right.innerHTML = "&#xFF0B;";
    wrapper.appendChild(button_right);

    // button add bottom
    let button_bottom = document.createElement("div");
    button_bottom.classList.add("text-buffer-button", "bottom");
    button_bottom.onmouseup = add_text_buffer;
    button_bottom.innerHTML = "&#xFF0B;";
    wrapper.appendChild(button_bottom);

    // button remove
    let button_remove = document.createElement("div");
    button_remove.classList.add("text-buffer-button", "top", "right");
    button_remove.onmouseup = remove_text_buffer;
    button_remove.innerHTML = "&#xFF0D";
    wrapper.appendChild(button_remove);

    return wrapper
}

function update_active() {
    page_buffer_collection.current.set_active(this.parentElement);
}

/**
 * @param {Mode} mode
 */
export function set_mode(mode) {
    current.mode = mode;

    if (mode === Mode.insert) {
        current.active.classList.add("insert");
        add_character(current.active.querySelector(".text-buffer"));
    }
    else {
        current.active.classList.remove("insert");
    }
}

/**
 * @param {MouseEvent} event
 */
function add_text_buffer(event) {
    const button = event.target;
    if (!(button instanceof HTMLElement)) {
        throw new Error("Got invalid button");
    }

    const wrapper = button.parentElement;

    if (button.classList.contains("right")) {
        page_buffer_collection.current.add(wrapper, Direction.right);

    } else if (button.classList.contains("bottom")) {
        page_buffer_collection.current.add(wrapper, Direction.down);

    } else {
        throw new Error("Got invalid direction");
    }
}

/**
 * @param {MouseEvent} event
 */
function remove_text_buffer(event) {
    const button = event.target;
    if (!(button instanceof HTMLElement)) {
        throw new Error("Got invalid button");
    }

    const wrapper = button.parentElement;
    page_buffer_collection.current.remove(wrapper);
}
