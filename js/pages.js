import { add_character, add_word, cleanup_word } from "./characters.js";
import { consonants } from "./consonants.js";
import { MAX_PAGE_NB, MIN_PAGE_NB } from "./constants.js";
import { build_letter } from "./segments.js";
import { vowels } from "./vowels.js";

/** @typedef {RootNode|RowNode|ColNode|TextNode} GraphNode */
/** @typedef {string[] | StringArray} NestedStringArray */
/** @typedef {NestedStringArray[]} StringArray */

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

/**
* @param {RootNode|RowNode|ColNode} parent - parent node to add to
* @param {RowNode|ColNode|TextNode} child - child node to add
* @param {number} [after] - insert after index (last child by default, -1 to insert as first child)
*/
function _add(parent, child, after) {
    if (typeof after === "undefined") {
        after = parent.children.length - 1;
    }

    if (!parent.children.length) {
        parent.dom.appendChild(child.dom);
    }
    else if (after === -1) {
        parent.children[0].dom.insertAdjacentElement("beforebegin", child.dom);
    }
    else {
        parent.children[after].dom.insertAdjacentElement("afterend", child.dom);
    }

    // @ts-ignore
    parent.children.splice(after + 1, 0, child);
    child.parent = parent;
}

class RowNode {
    /** 
     * @param {(ColNode|TextNode)[]} children
     */
    constructor(...children) {
        /** @type {(ColNode|TextNode)[]} */
        this.children = [];
        /** @type {ColNode|RootNode|null} */
        this.parent = null;
        /** @type {HTMLDivElement} */
        this.dom = document.createElement("div");
        this.dom.classList.add("row");

        for (const child of children) {
            this.add(child);
        }
    }

    /**
     * @param {string} prefix
     */
    toString(prefix) {
        return prefix + `Row<${this.index}>\n` + this.children.map((child) => child.toString(prefix + "\t")).join("\n");
    }

    toJSON() {
        return this.children.map((c) => c.toJSON());
    }

    /** @returns {number[]} */
    get index() {
        return [...this.parent.index, this.parent.children.indexOf(this)];
    }

    /**
    * @param {ColNode|TextNode} child - child node to add
    * @param {number} [after] - insert after index (last child by default)
    */
    add(child, after) { _add(this, child, after) }

    /**
    * @param {ColNode|TextNode} node
    * @param {number} at - replacement index
    */
    replace_child(node, at) {
        this.dom.replaceChild(node.dom, this.children[at].dom);
        this.children[at] = node;
        node.parent = this;
    }

    /** 
     * @param {number} at
     */
    remove(at) {
        if (this.children.length === 1) {
            if (at !== 0) {
                throw new Error("Invalid index")
            }

            this.parent.remove(this.index.at(-1));
        }
        else {
            this.dom.children[at].remove();
            this.children.splice(at, 1);
        }
    }

    /**
     * @param {RowNode} other
     */
    merge(other) {
        this.dom.append(...other.dom.children);
        this.children.push(...other.children);

        for (const child of other.children) {
            child.parent = this;
        }
    }
}

class ColNode {
    /**
     * @param {RowNode[]} children
     */
    constructor(...children) {
        /** @type {(RowNode)[]} */
        this.children = [];
        /** @type {?RowNode} */
        this.parent = null;
        /** @type {?HTMLElement} */
        this.dom = document.createElement("div");
        this.dom.classList.add("box");

        for (const child of children) {
            this.add(child);
        }
    }

    /**
     * @param {string} prefix
     */
    toString(prefix) {
        return prefix + `Col<${this.index}>\n` + this.children.map((child) => child.toString(prefix + "\t")).join("\n");
    }

    toJSON() {
        return this.children.map((c) => c.toJSON());
    }

    /** @returns {number[]} */
    get index() {
        return [...this.parent.index, this.parent.children.indexOf(this)];
    }

    /**
    * @param {RowNode} child - child node to add
    * @param {number} [after] - insert after index (last child by default, -1 to insert as first child)
    */
    add(child, after) { _add(this, child, after) }

    /** 
     * @param {number} at
     */
    remove(at) {
        this.dom.children[at].remove();
        this.children.splice(at, 1);

        if (this.children.length === 1) {
            this.parent.merge(this.children[0]);
            this.parent.remove(this.index.at(-1));
        }
    }
}

class RootNode extends ColNode {
    /**
     * @param {RowNode[]} [children=[]] 
     */
    constructor(...children) {
        super(...children);
        delete this.parent;
    }

    toString() {
        return "Root\n" + this.children.map((child) => child.toString("\t")).join("\n")
    }

    /** @returns {number[]} */
    get index() {
        return [];
    }

    /**
    * @param {RowNode} child - child node to add
    * @param {number} [after] - insert after index (last child by default)
    */
    add(child, after) { _add(this, child, after) }

    /**
     * @param {number} at
     */
    remove(at) {
        this.dom.children[at].remove();
        this.children.splice(at, 1);
    }
}

class TextNode {
    /** @type {Mode} */
    #mode;

    /**
    * @param {string} [content=""]
    * @param {boolean} [active=false]
    */
    constructor(content = "", active = false) {
        /** @type {?RowNode} */
        this.parent = null;
        /** @type {HTMLElement} */
        this.dom = make_text_buffer(content, { active });
        this.#mode = Mode.normal;
    }

    /** @returns {HTMLElement} */
    get text_buffer() {
        return this.dom.querySelector(".text-buffer");
    }

    get content() {
        return this.text_buffer.innerHTML;
    }

    /**
     * @param {string} prefix
     */
    toString(prefix) {
        return prefix + `Text<${this.index}> ${this.content}\n`;
    }

    toJSON() {
        return this.content;
    }

    /** @returns {number[]} */
    get index() {
        return [...this.parent.index, this.parent.children.indexOf(this)];
    }

    /** @returns {Mode} */
    get mode() {
        return this.#mode;
    }

    /**
     * @param {Mode} mode
     */
    set mode(mode) {
        this.#mode = mode;
        const text_buffer = this.text_buffer;

        if (mode === Mode.insert) {
            text_buffer.parentElement.classList.add("insert");
            add_word(text_buffer);
            show_manual_select_letters(this.index[0]);
        }
        else {
            text_buffer.parentElement.classList.remove("insert");
            hide_manual_select_letters(this.index[0]);
            cleanup_word(this.text_buffer);
        }
    }
}

class PageGraph {
    /** 
     * @param {RootNode} [root]
     * @param {number[]} [active]
     */
    constructor(root, active) {
        if (typeof root === "undefined") {
            /** @type {RootNode} */
            this.root = new RootNode(
                new RowNode(
                    new TextNode("", true)
                )
            );

            /** @type {number[]} */
            this.active = [0, 0]
        }
        else {
            this.root = root;
            this.active = active ?? [0, 0];
        }
    }

    /** 
     * @param {NestedStringArray[]} data
     * @param {number[]} active
     */
    static fromObject(data, active) {
        /**
         * @param {NestedStringArray} level_data
         * @param {number[]} [active]
         */
        function parse_row(level_data, active = [-1]) {
            let children = [];

            for (const [i, data] of Object.entries(level_data)) {
                if (typeof data === "string") {
                    children.push(new TextNode(data, parseInt(i) === active[0]));
                }
                else {
                    children.push(parse_col(data, parseInt(i) === active[0] ? active.slice(1) : undefined));
                }
            }

            return new RowNode(...children);
        }

        /**
         * @param {NestedStringArray} level_data
         * @param {number[]} [active]
         */
        function parse_col(level_data, active = [-1]) {
            let children = [];

            for (const [i, data] of Object.entries(level_data)) {
                if (typeof data === "string") {
                    throw new Error("Got unexpected string while parsing ColNode data");
                }
                children.push(parse_row(data, parseInt(i) === active[0] ? active.slice(1) : undefined));
            }

            return new ColNode(...children);
        }

        /** @type {RowNode[]} */
        let children = [];
        for (const [i, level_data] of Object.entries(data)) {
            children.push(parse_row(level_data, parseInt(i) === active[0] ? active.slice(1) : undefined));
        }

        return new PageGraph(new RootNode(...children), active);
    }

    toString() {
        return this.root.toString();
    }

    toJSON() {
        return JSON.stringify(this.root.toJSON());
    }

    /**
     * @template {GraphNode} T
     * @param {number[]} index
     * @param {new () => T} [node_type]
     * @returns {T}
     */
    get(index, node_type) {
        /** @type {GraphNode} */
        let node = this.root;

        for (let i of index) {
            if (node instanceof TextNode) {
                throw new Error("Got TextNode before end of index.");
            }
            if (i >= node.children.length) {
                throw new Error("Children index out of bounds.");
            }
            node = node.children[i];
        }

        if (typeof node_type == "undefined" || node instanceof node_type) {
            // @ts-ignore
            return node;
        }

        throw new Error(`Got wrong node type at index ${index}: expected ${node_type.name}, got ${node.constructor.name} (${node})`)
    }

    get_active() {
        return this.get(this.active, TextNode);
    }

    /**
     * @param {number[]} index
     * @returns {boolean}
     */
    exists(index) {
        try {
            this.get(index);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * @param {HTMLElement} element
     * @returns {number[]}
     */
    get_index(element) {
        /** @type {GraphNode[]} */
        const queue = [this.root];
        const visited = new Set();

        while (queue.length) {
            const vertex = queue.shift();

            if (vertex.dom === element) {
                return vertex.index;
            }

            if (!(vertex instanceof TextNode) && !visited.has(vertex)) {
                visited.add(vertex);

                for (const child of vertex.children) {
                    queue.push(child);
                }
            }
        }

        throw new Error("Could not find element in page graph.")
    }

    /**
     * @param {number[]} index
     * @param {boolean} row
     * @returns {RowNode|ColNode|TextNode}
     */
    #first_existing_parent(index, row) {
        const offset = row ? 1 : 2;
        while (!this.exists(index)) {
            if (index.at(-offset) === 0) {
                index = index.slice(0, -2);
                continue;
            }

            index[index.length - offset]--;
        }
        return this.get(index);
    }

    /** 
     * @param {RowNode|ColNode|TextNode} node
     * @param {"first" | "last"} nth
     */
    #nth_text_child(node, nth) {
        while (!(node instanceof TextNode)) {
            if (nth === "first") {
                node = node.children[0];
            }
            else {
                node = node.children.at(-1);
            }
        }

        return node
    }

    /**
     * @param {number[]} index
     * @returns {number[]}
     */
    static #carry_negative(index) {
        for (let i = index.length - 1; i >= 0; i--) {
            if (index[i] < 0) {
                index[i - 2] -= 1;
                index[i] = 0;
            }
        }

        return index;
    }

    /**
     * @param {number[]} index
     * @param {number[]} nb_children
     * @returns {number[]}
     */
    static #carry_overflow(index, nb_children) {
        for (let i = index.length - 1; i >= 0; i--) {
            if (index[i] >= nb_children[i]) {
                index[i - 2] += 1;
                index[i] = 0;
            }
        }

        return index;
    }

    /**
     * @param {number[]|HTMLElement} element
     * @param {Direction} direction
     * @param {Object} opts
     * @param {boolean} [opts.shallow=false]
     * @returns {GraphNode}
     */
    find_nearest(element, direction, { shallow = false } = {}) {
        const index = element instanceof HTMLElement ? this.get_index(element) : element;
        const nb_children = index
            .map((_, i, arr) => arr.slice(0, i))
            .map((e, i) => (i % 2 ? this.get(e, RowNode) : this.get(e, ColNode)).children.length);
        let new_index, row;
        /** @type {"first" | "last"} */
        let nth = "first";

        if (direction === Direction.right) {
            new_index = PageGraph.#carry_overflow(index.with(-1, index.at(-1) + 1), nb_children);
            row = false;
        }
        else if (direction === Direction.down) {
            new_index = PageGraph.#carry_overflow(index.with(-2, index.at(-2) + 1), nb_children);
            row = true;
        }
        else if (direction === Direction.left) {
            new_index = PageGraph.#carry_negative(index.with(-1, index.at(-1) - 1));
            row = false;
        }
        else if (direction === Direction.up) {
            new_index = PageGraph.#carry_negative(index.with(-2, index.at(-2) - 1));
            row = true;
            nth = "last";
        }
        else {
            throw new Error("Got invalid direction.")
        }

        const node = this.#first_existing_parent(new_index, row)

        if (shallow) {
            return node;
        }
        return this.#nth_text_child(node, nth);
    }

    /** @param {number[]|HTMLElement} element */
    set_active(element) {
        const index = element instanceof HTMLElement ? this.get_index(element) : element;

        this.get(this.active, TextNode).dom.classList.remove("active");
        this.get(index, TextNode).dom.classList.add("active");
        this.active = index;
    }

    /**
     * @param {number[]|HTMLElement} element
     * @param {Direction} direction
     */
    set_nearest_active(element, direction) {
        const index = this.find_nearest(element, direction).index;
        this.set_active(index);
    }

    /**
     * @param {number[]|HTMLElement} element
     * @param {Direction} direction
     */
    move(element, direction) {
        const a_index = element instanceof HTMLElement ? this.get_index(element) : element;
        const a_node = this.get(a_index, TextNode);

        const b_node = this.find_nearest(element, direction, { shallow: true });
        const b_index = b_node.index;

        this.active = b_index;

        switch (direction) {
            case Direction.right:
            case Direction.left:
                let children = b_node.parent.children;
                [children[b_index.at(-1)], children[a_index.at(-1)]] = [children[a_index.at(-1)], children[b_index.at(-1)]]

                if (direction === Direction.right) {
                    a_node.parent.dom.insertBefore(b_node.dom, a_node.dom);
                }
                else {
                    a_node.parent.dom.insertBefore(a_node.dom, b_node.dom);
                }
                break;

            case Direction.down:
            case Direction.up:
                if (!(b_node instanceof TextNode)) {
                    throw new Error("Invalid neighbor node");
                }

                const row = new RowNode(a_node);

                if (direction === Direction.down) {
                    b_node.parent.parent.add(row)
                    a_node.parent.parent.remove(a_index.at(-2))
                }
                else {
                    b_node.parent.parent.add(row, -1)
                    a_node.parent.parent.remove(a_index.at(-2) + 1)
                }

                break;
        }
    }

    /**
     * @param {number[]|HTMLElement} parent
     * @param {Direction} direction - 'right' or 'down'
    */
    add(parent, direction) {
        const index = parent instanceof HTMLElement ? this.get_index(parent) : parent;

        if (direction === Direction.right) {
            this.get(index, TextNode).parent.add(new TextNode(), index.at(-1));
        }
        else if (direction === Direction.down) {
            const source_node = this.get(index, TextNode);
            const new_row = new RowNode(new TextNode());

            if (source_node.parent.children.length === 1) {
                source_node.parent.parent.add(new_row, index.at(-1));
            } else {
                const row = new RowNode();
                const col = new ColNode(row, new_row);

                source_node.parent.replace_child(col, index.at(-1));
                row.add(source_node);
            }

        }
        else {
            throw new Error(`Got invalid direction '${direction}'`);
        }
    }

    /** 
     * @param {number[]|HTMLElement} source
     */
    remove(source) {
        if (source instanceof HTMLElement) {
            source = this.get_index(source);
        }

        const row = this.get(source, TextNode).parent;
        row.remove(source.at(-1));
    }
}

export let page_buffer_collection = {
    /** @type {Object.<number, PageGraph>} */
    pages: {},
    /** @type {number} */
    displayed: 1,

    /** @returns {PageGraph} */
    get current_page() {
        return this.pages[this.displayed];
    },

    /** @param {number} page_nb */
    display(page_nb) {
        document.querySelector("#text-buffer-container").replaceChildren(this.pages[page_nb].root.dom);
        this.displayed = page_nb;
    },

    /** @param {number} page_nb */
    toString(page_nb) {
        return this.pages[page_nb].toString()
    }
};
globalThis.page_buffer_collection = page_buffer_collection;

for (let i = MIN_PAGE_NB; i <= MAX_PAGE_NB; i++) {
    page_buffer_collection.pages[i] = new PageGraph()
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
    buffer.onclick = () => {
        page_buffer_collection.current_page.set_active(wrapper);
    };
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
        page_buffer_collection.current_page.add(wrapper, Direction.right);

    } else if (button.classList.contains("bottom")) {
        page_buffer_collection.current_page.add(wrapper, Direction.down);

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
    page_buffer_collection.current_page.remove(wrapper);
}

/**
 * @param {number} index - row index to insert after
 */
function show_manual_select_letters(index) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("item");

    const vowels_title = document.createElement("h1");
    vowels_title.innerText = "Vowels";
    wrapper.appendChild(vowels_title);

    const vowels_container = document.createElement("div");
    vowels_container.id = "vowels_container";
    for (const [code, letter] of vowels) {
        vowels_container.appendChild(build_letter(code, letter, true));
    }
    wrapper.appendChild(vowels_container);

    const consonants_title = document.createElement("h1");
    consonants_title.innerText = "Consonants";
    wrapper.appendChild(consonants_title);

    const consonants_container = document.createElement("div");
    consonants_container.id = "consonants_container";
    for (const [code, letter] of consonants) {
        consonants_container.appendChild(build_letter(code, letter, false));
    }
    wrapper.appendChild(consonants_container);

    page_buffer_collection.current_page.get([index]).dom.insertAdjacentElement("afterend", wrapper);
}

/**
 * @param {number} index - row index after which to hide
 */
function hide_manual_select_letters(index) {
    const wrapper = page_buffer_collection.current_page.get([]).dom.children[index + 1];

    if (typeof wrapper === "undefined") { return }
    page_buffer_collection.current_page.get([]).dom.removeChild(wrapper);
}

export async function load() {
    const raw_data = await this.files[0].text();
    const data = JSON.parse(raw_data)

    for (const [page_nb, page_data] of Object.entries(data)) {
        page_buffer_collection.pages[page_nb] = PageGraph.fromObject(JSON.parse(page_data["data"]), page_data["active"]);
    }

    page_buffer_collection.display(1);
}

export function save() {
    let data = {};

    for (const [page_nb, page] of Object.entries(page_buffer_collection.pages)) {
        data[page_nb] = { data: page.toJSON(), active: page.active };
    }

    const blob = new Blob([JSON.stringify(data)], { type: 'text/plain' });
    const dataURL = URL.createObjectURL(blob);

    const downloadLink = document.createElement('a');
    downloadLink.href = dataURL;
    downloadLink.download = 'tunic_translator.json';
    downloadLink.click();

    URL.revokeObjectURL(dataURL);
}


