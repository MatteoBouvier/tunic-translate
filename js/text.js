export function make_text_buffer() {
    let wrapper = document.createElement("div");
    wrapper.classList.add("text-buffer-wrapper");

    // text buffer
    let buffer = document.createElement("div");
    buffer.classList.add("text-buffer");
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

function add_text_buffer_right(source) {
    source.insertAdjacentElement("afterend", make_text_buffer());
}

function add_text_buffer_bottom(source) {
    let new_row = document.createElement("div");
    new_row.classList.add("row");
    new_row.appendChild(make_text_buffer());

    let parent_row = source.parentElement;

    if (parent_row.children.length == 1) {
        parent_row.insertAdjacentElement("afterend", new_row);
    }
    else {
        const box = document.createElement("div");
        box.classList.add("box");
        source.insertAdjacentElement("beforebegin", box);
        let row = document.createElement("div");
        row.classList.add("row");
        row.appendChild(source);
        box.appendChild(row);
        box.appendChild(new_row);
    }

}

function add_text_buffer(event) {
    const button = event.target;
    const wrapper = button.parentElement;

    if (button.classList.contains("right")) {
        add_text_buffer_right(wrapper);

    } else if (button.classList.contains("bottom")) {
        add_text_buffer_bottom(wrapper);

    } else {
        throw new Error("Got invalid direction", where);
    }
}

function remove_text_buffer(event) {
    const button = event.target;
    const wrapper = button.parentElement;
    const parent = wrapper.parentElement;

    wrapper.remove();
    cleanup(parent);
}

function cleanup(node) {
    if (node.id === "text-buffer-container") { return; }

    if (node.classList.contains("row") && node.children.length == 0) {
        if (node.parentElement.id === "text-buffer-container" && node.parentElement.children.length == 1) {
            node.appendChild(make_text_buffer());
        }
        else {
            const parent = node.parentElement;
            node.remove();
            cleanup(parent)
        }
    }
    else if (node.classList.contains("box") && node.children.length == 1) {
        for (let child of [...node.children[0].children]) {
            node.insertAdjacentElement("beforebegin", child);
        }
        node.remove();
    }
}
