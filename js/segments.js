const vowels = {
    0b00001: "à",
    0b00010: "á",
    0b00011: "â",
    0b00110: "a",
    0b00111: "ä",
    0b01000: "è",
    0b01100: "e",
    0b01111: "ê",
    0b10000: "é",
    0b11000: "u",
    0b10100: "i",
    0b10110: "ï",
    0b10111: "î",
    0b11011: "û",
    0b11100: "y",
    0b11101: "ÿ",
    0b11110: "o",
    0b11111: "ô",
};
const consonants = {
    0b1100000: "c",
    0b1110000: "ç",
    0b0011000: "v",
    0b0010110: "d",
    0b0001110: "f",
    0b1001110: "h",
    0b0101110: "ħ",
    0b0011110: "s",
    0b1111110: "w",
    0b1000011: "l",
    0b0100011: "j",
    0b1100011: "ß",
    0b1010011: "q",
    0b1001011: "k",
    0b1111011: "z",
    0b0000111: "b",
    0b1000111: "g",
    0b1100111: "m",
    0b0010111: "µ",
    0b1010111: "r",
    0b0001111: "p",
    0b0101111: "t",
    0b0011111: "n",
    0b1111111: "x",
};

function rev(obj) {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));
}

const vowels_rev = rev(vowels);
const consonants_rev = rev(consonants);

/**
 * @param {binary} code binary representation of active segments
 * @param {string} letter
 * @param {bool} is_vowel
 * @returns {HTMLDivElement}
*/
function build_letter(code, letter, is_vowel) {
    let container = document.createElement("div");
    container.classList.add("card");

    let letter_container = document.createElement("div");
    letter_container.textContent = letter;
    letter_container.style.textAlign = "center";
    letter_container.style.paddingTop = "3px";

    let box = document.createElement("div");
    box.classList.add("segment_box", "small")

    let prefix;
    let length;
    if (is_vowel) {
        prefix = "v";
        length = 5;
    } else {
        prefix = "c";
        length = 7;
    }

    for (const i of Array(length).keys()) {
        if (code & (1 << i)) {
            segment = document.createElement("div");
            segment.classList.add("segment", prefix + i);
            segment.dataset.status = "on";
            box.appendChild(segment)
        }
    }

    container.appendChild(box);
    container.appendChild(letter_container);

    container.addEventListener("mouseup", () => {
        if (is_vowel) {
            set_vowel(letter);
        } else {
            set_consonant(letter);
        }
    });

    return container;
}


/**
 * @param {string} letter
 */
function set_vowel(letter) {
    const box = document.querySelector("#input_box").children[0];
    const vowel_code = vowels_rev[letter];

    for (const segment of box.querySelectorAll(".vowel")) {
        let index = parseInt(segment.classList[2][1]);
        segment.dataset.status = vowel_code & (1 << index) ? "on" : "off";
    }
}


/**
 * @param {string} letter
 */
function set_consonant(letter) {
    const box = document.querySelector("#input_box").children[0];
    const consonant_code = consonants_rev[letter];

    for (const segment of box.querySelectorAll(".consonant")) {
        let index = parseInt(segment.classList[2][1]);
        segment.dataset.status = consonant_code & (1 << index) ? "on" : "off";
    }

}


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

    if (key_buffer == "circumflex") {
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
            key_buffer = "";
            return;
        }
    } else if (key_buffer == "dieresis") {
        if (key === 'a') {
            key = "ä";
        } else if (key == 'i') {
            key = "ï";
        } else if (key == "y") {
            key = "ÿ";
        } else {
            key_buffer = "";
            return;
        }
    }
    key_buffer = "";

    if (event.altKey || event.shiftKey || event.ctrlKey || event.metaKey) { return; }

    if (['a', 'á', 'à', 'â', 'ä', 'e', 'é', 'è', 'ê', 'i', 'î', 'ï', 'o', 'ô', 'u', 'û', 'y', 'ÿ'].indexOf(key) !== -1) {
        set_vowel(key);
    } else if (
        ["c", "ç", "v", "d", "f", "h", "ħ", "s", "w", "l", "j", "ß", "q", "k", "z", "b", "g", "m", "µ", "r", "p", "t", "n", "x"].indexOf(key) !== -1
    ) {
        set_consonant(key);
    }
}

function setup() {
    let container = document.querySelector("#vowels_container");
    for (const [code, letter] of Object.entries(vowels)) {
        container.appendChild(build_letter(code, letter, true));
    }

    container = document.querySelector("#consonants_container");
    for (const [code, letter] of Object.entries(consonants)) {
        container.appendChild(build_letter(code, letter, false));
    }

    document.onkeydown = handle_keybinding;
}

/**
 * @param {HTMLDivElement} segment */
function segment_click(segment) {
    let new_status = segment.dataset.status == "off" ? "on" : "off";
    segment.dataset.status = new_status;
}

function write_character() {
    let box = document.querySelector("#input_box").children[0];

    let vowel_code = 0;
    let consonant_code = 0;

    for (const segment of box.querySelectorAll(".vowel")) {
        if (segment.dataset.status == "on") {
            let index = parseInt(segment.classList[2][1]);
            vowel_code += 2 ** index;
        }
    }

    for (const segment of box.querySelectorAll(".consonant")) {
        if (segment.dataset.status == "on") {
            let index = parseInt(segment.classList[2][1]);
            consonant_code += 2 ** index;
        }
    }

    if (vowel_code + consonant_code == 0) { return; }

    let vowel = "";
    let consonant = "";

    if (vowel_code != 0) {
        vowel = vowels[vowel_code];
    }
    if (consonant_code != 0) {
        consonant = consonants[consonant_code];
    }

    if (vowel === undefined) {
        box.classList.add("blink-vowel");
        setTimeout(() => {
            box.classList.remove("blink-vowel")
        }, 3000)
    }

    if (consonant === undefined) {
        box.classList.add("blink-consonant");
        setTimeout(() => {
            box.classList.remove("blink-consonant")
        }, 3000)
    }

    if (vowel != undefined && consonant != undefined) {
        document.querySelector("#text_buffer").textContent += consonant + vowel;
    }
}

setup()
