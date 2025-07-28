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

    image.src = `images/${previous_page_nb}.jpg`;
}
window.display_previous_page = display_previous_page;

function display_next_page() {
    let image = document.querySelector("#image-gallery > img");
    const current_page_nb = parseInt(image.src.split("/").at(-1).split(".")[0]);
    const next_page_nb = Math.min(MAX_PAGE_NB, current_page_nb + 1);

    image.src = `images/${next_page_nb}.jpg`;
}
window.display_next_page = display_next_page;
