const MIN_PAGE_NB = 1;
const MAX_PAGE_NB = 28;

export function setup_gallery_buttons() {
    const gallery_button_container = document.querySelector("#gallery-buttons");

    for (let i = MIN_PAGE_NB; i <= MAX_PAGE_NB; i++) {
        let btn = document.createElement("button");
        btn.classList.add("gallery-btn");

        if (i == MIN_PAGE_NB) {
            btn.innerText = i * 2;
            btn.classList.add("gallery-btn-current");
        } else if (i == MAX_PAGE_NB) {
            btn.innerText = i * 2 - 1;
        } else {
            btn.innerText = `${i * 2 - 1}-${i * 2}`;
        }

        btn.onmouseup = () => { display_page(i); };

        gallery_button_container.appendChild(btn);
    }
}
/**
 * @param {number} nb
 */
export function display_page(nb) {
    let image = document.querySelector("#image-gallery img");
    image.src = `images/${nb}.jpg`;

    let current_button = document.querySelector(".gallery-btn-current");
    current_button.classList.remove("gallery-btn-current");

    let new_current_button = document.querySelector("#gallery-buttons").children[nb - 1];
    new_current_button.classList.add("gallery-btn-current");
}

function display_previous_page() {
    let image = document.querySelector("#image-gallery > img");
    const current_page_nb = parseInt(image.src.split("/").at(-1).split(".")[0]);
    const previous_page_nb = Math.max(MIN_PAGE_NB, current_page_nb - 1);

    display_page(previous_page_nb);
}
window.display_previous_page = display_previous_page;

function display_next_page() {
    let image = document.querySelector("#image-gallery > img");
    const current_page_nb = parseInt(image.src.split("/").at(-1).split(".")[0]);
    const next_page_nb = Math.min(MAX_PAGE_NB, current_page_nb + 1);

    display_page(next_page_nb);
}
window.display_next_page = display_next_page;


function handle_zoom_in(node, event) {
    let offsetX = parseInt(node.dataset.offsetX) - event.movementX;
    let offsetY = parseInt(node.dataset.offsetY) - event.movementY;

    node.dataset.offsetX = offsetX;
    node.dataset.offsetY = offsetY;

    node.style.transform = "scale(1.5)";
    node.style.transform += `translate(${offsetX}px, ${offsetY}px)`;
}
window.handle_zoom_in = handle_zoom_in;

function handle_zoom_out(node) {
    node.style.transform = "";

    node.dataset.offsetX = 0;
    node.dataset.offsetY = 0;

}
window.handle_zoom_out = handle_zoom_out;
