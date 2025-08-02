(() => {
  // js/vowels.js
  var vowels = /* @__PURE__ */ new Map([
    [1, "\xE0"],
    [2, "\xE1"],
    [3, "\xE2"],
    [6, "a"],
    [7, "\xE4"],
    [8, "\xE8"],
    [12, "e"],
    [15, "\xEA"],
    [16, "\xE9"],
    [24, "u"],
    [20, "i"],
    [22, "\xEF"],
    [23, "\xEE"],
    [27, "\xFB"],
    [28, "y"],
    [29, "\xFF"],
    [30, "o"],
    [31, "\xF4"]
  ]);
  var vowels_rev = new Map(Array.from(vowels, ([k, v]) => [v, k]));

  // js/consonants.js
  var consonants = /* @__PURE__ */ new Map([
    [96, "c"],
    [112, "\xE7"],
    [24, "v"],
    [22, "d"],
    [14, "f"],
    [78, "h"],
    [46, "\u0127"],
    [30, "s"],
    [126, "w"],
    [67, "l"],
    [35, "j"],
    [99, "\xDF"],
    [83, "q"],
    [75, "k"],
    [123, "z"],
    [7, "b"],
    [71, "g"],
    [103, "m"],
    [23, "\xB5"],
    [87, "r"],
    [15, "p"],
    [47, "t"],
    [31, "n"],
    [127, "x"]
  ]);
  var consonants_rev = new Map(Array.from(consonants, ([k, v]) => [v, k]));

  // js/segments.js
  function build_letter(code, letter, is_vowel) {
    let container = document.createElement("div");
    container.classList.add("card");
    let letter_container = document.createElement("div");
    letter_container.textContent = letter;
    letter_container.style.textAlign = "center";
    letter_container.style.paddingTop = "3px";
    let box = document.createElement("div");
    box.classList.add("segment_box", "small");
    let prefix;
    let length;
    if (is_vowel) {
      prefix = "v";
      length = 5;
    } else {
      prefix = "c";
      length = 7;
    }
    for (let i = 0; i < length; i++) {
      if (code & 1 << i) {
        let segment = document.createElement("div");
        segment.classList.add("segment", prefix + i);
        segment.dataset.status = "on";
        box.appendChild(segment);
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
  function match_letter(character) {
    let vowel_code = 0;
    let consonant_code = 0;
    for (const segment of character.querySelectorAll(".vowel")) {
      if (segment instanceof HTMLElement && segment.dataset.status == "on") {
        const index = parseInt(segment.classList[2][1]);
        vowel_code += 2 ** index;
      }
    }
    for (const segment of character.querySelectorAll(".consonant")) {
      if (segment instanceof HTMLElement && segment.dataset.status == "on") {
        const index = parseInt(segment.classList[2][1]);
        consonant_code += 2 ** index;
      }
    }
    const vowel = vowel_code === 0 ? "" : vowels.get(vowel_code);
    const consonant = consonant_code === 0 ? "" : consonants.get(consonant_code);
    const circle = character.querySelector(".circle");
    const reversed = circle.dataset.status == "on";
    return [vowel, consonant, reversed];
  }
  function segment_click() {
    let new_status = this.dataset.status == "off" ? "on" : "off";
    let character = this.parentNode;
    this.dataset.status = new_status;
    if (this.classList.contains("v2")) {
      character.querySelector(".v2-bottom").dataset.status = new_status;
    }
    if (this.classList.contains("v2-bottom")) {
      character.querySelector(".v2").dataset.status = new_status;
    }
    let [vowel, consonant, reversed] = match_letter(character);
    vowel = vowel === void 0 ? "?" : vowel;
    consonant = consonant === void 0 ? "?" : consonant;
    character.querySelector(".char-description").innerText = reversed ? vowel + consonant : consonant + vowel;
  }

  // js/characters.js
  function add_character(buffer) {
    let character = document.createElement("div");
    character.classList.add("segment_box", "selectable");
    for (let i = 0; i < 5; i++) {
      let segment2 = document.createElement("div");
      segment2.classList.add("segment", "vowel", `v${i}`);
      segment2.dataset.status = "off";
      segment2.onmousedown = segment_click;
      character.appendChild(segment2);
    }
    let segment = document.createElement("div");
    segment.classList.add("segment", `v2-bottom`);
    segment.dataset.status = "off";
    segment.onmousedown = segment_click;
    character.appendChild(segment);
    for (let i = 0; i < 7; i++) {
      let segment2 = document.createElement("div");
      segment2.classList.add("segment", "consonant", `c${i}`);
      segment2.dataset.status = "off";
      segment2.onmousedown = segment_click;
      character.appendChild(segment2);
    }
    let circle = document.createElement("div");
    circle.classList.add("circle");
    circle.dataset.status = "off";
    circle.onmousedown = segment_click;
    character.appendChild(circle);
    let bar = document.createElement("div");
    bar.classList.add("Hbar", "noshow");
    character.appendChild(bar);
    let description = document.createElement("div");
    description.classList.add("char-description");
    character.appendChild(description);
    buffer.appendChild(character);
    if (buffer.children.length > 1) {
      let bar2 = buffer.firstElementChild.querySelector(".Hbar");
      bar2.classList.remove("noshow");
      bar2.style.width = `${buffer.children.length * 80}px`;
      buffer.classList.add("short_hbar");
    }
    return character;
  }
  function add_character_if_set(buffer) {
    const characters = buffer.children;
    const last_character = characters[characters.length - 1];
    const segments = Array.from(last_character.children);
    if (segments.some((segment) => segment.dataset.status == "on")) {
      add_character(buffer);
    }
  }
  function write_character(reset = false) {
    let characters = document.querySelector("#character_buffer").children;
    let text_buffer = "";
    let is_valid = true;
    for (let character of characters) {
      let [vowel, consonant, _] = match_letter(character);
      if (vowel === "" && consonant === "") {
        break;
      }
      if (vowel === void 0) {
        is_valid = false;
        character.classList.add("blink-vowel");
        setTimeout(() => {
          character.classList.remove("blink-vowel");
        }, 3e3);
      }
      if (consonant === void 0) {
        is_valid = false;
        character.classList.add("blink-consonant");
        setTimeout(() => {
          character.classList.remove("blink-consonant");
        }, 3e3);
      }
      if (vowel != void 0 && consonant != void 0) {
        const circle = character.querySelector(".circle");
        if (circle.dataset.status === "on") {
          text_buffer += vowel + consonant;
        } else {
          text_buffer += consonant + vowel;
        }
      }
    }
    if (is_valid) {
      let textarea_buffer = document.querySelector("#text_buffer");
      if (textarea_buffer.textContent) {
        text_buffer = ` ${text_buffer}`;
      }
      textarea_buffer.textContent += text_buffer;
      if (reset) {
        reset_character();
      }
    }
  }
  globalThis.write_character = write_character;
  function reset_character(buffer, n = -1) {
    if (n === -1) {
      buffer.textContent = "";
      buffer.classList.remove("short_hbar");
      add_character(buffer);
      return;
    }
    while (n > 0) {
      buffer.removeChild(buffer.lastChild);
      n--;
    }
    if (buffer.children.length === 0) {
      buffer.classList.remove("short_hbar");
      add_character(buffer);
    } else if (buffer.children.length === 1) {
      buffer.classList.remove("short_hbar");
      let bar = buffer.firstElementChild.querySelector(".Hbar");
      bar.classList.add("noshow");
    } else {
      let bar = buffer.firstElementChild.querySelector(".Hbar");
      bar.style.width = `${buffer.children.length * 80}px`;
    }
  }
  globalThis.reset_character = reset_character;
  function is_vowel_set(character) {
    const segments = Array.from(character.querySelectorAll(".vowel"));
    if (segments.some((segment) => segment.dataset.status == "on")) {
      return true;
    }
    return false;
  }
  function is_consonant_set(character) {
    const segments = Array.from(character.querySelectorAll(".consonant"));
    if (segments.some((segment) => segment.dataset.status == "on")) {
      return true;
    }
    return false;
  }
  function set_vowel(buffer, letter) {
    const characters = buffer.children;
    let last_character = characters[characters.length - 1];
    if (is_vowel_set(last_character)) {
      last_character = add_character(buffer);
    }
    const vowel_code = vowels_rev.get(letter);
    const vowels2 = last_character.querySelectorAll(".vowel");
    for (const segment of vowels2) {
      const index = parseInt(segment.classList[2][1]);
      const new_status = vowel_code & 1 << index ? "on" : "off";
      segment.dataset.status = new_status;
      if (index === 2) {
        const v2 = last_character.querySelector(".v2-bottom");
        v2.dataset.status = new_status;
      }
    }
    last_character.querySelector(".char-description").innerHTML += letter;
  }
  function set_consonant(buffer, letter) {
    const characters = buffer.children;
    let last_character = characters[characters.length - 1];
    if (is_consonant_set(last_character)) {
      last_character = add_character(buffer);
    }
    if (is_vowel_set(last_character)) {
      const circle = last_character.querySelector(".circle");
      circle.dataset.status = "on";
    }
    const consonant_code = consonants_rev.get(letter);
    const consonants2 = last_character.querySelectorAll(".consonant");
    for (const segment of consonants2) {
      const index = parseInt(segment.classList[2][1]);
      segment.dataset.status = consonant_code & 1 << index ? "on" : "off";
    }
    last_character.querySelector(".char-description").innerHTML += letter;
  }
  function send_key(buffer, letter) {
    if (vowels_rev.has(letter)) {
      set_vowel(buffer, letter);
    } else if (consonants_rev.has(letter)) {
      set_consonant(buffer, letter);
    }
  }

  // js/images.js
  var MIN_PAGE_NB = 1;
  var MAX_PAGE_NB = 28;
  function setup_gallery_buttons() {
    const gallery_button_container = document.querySelector("#gallery-buttons");
    for (let i = MIN_PAGE_NB; i <= MAX_PAGE_NB; i++) {
      let btn = document.createElement("button");
      btn.classList.add("gallery-btn");
      if (i == MIN_PAGE_NB) {
        btn.innerText = `${i * 2}`;
        btn.classList.add("gallery-btn-current");
      } else if (i == MAX_PAGE_NB) {
        btn.innerText = `${i * 2 - 1}`;
      } else {
        btn.innerText = `${i * 2 - 1}-${i * 2}`;
      }
      btn.onmouseup = () => {
        display_page(i);
      };
      gallery_button_container.appendChild(btn);
    }
  }
  function display_page(nb) {
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
  globalThis.display_previous_page = display_previous_page;
  function display_next_page() {
    let image = document.querySelector("#image-gallery > img");
    const current_page_nb = parseInt(image.src.split("/").at(-1).split(".")[0]);
    const next_page_nb = Math.min(MAX_PAGE_NB, current_page_nb + 1);
    display_page(next_page_nb);
  }
  globalThis.display_next_page = display_next_page;
  function handle_zoom_in(node, event) {
    let offsetX = parseInt(node.dataset.offsetX) - event.movementX;
    let offsetY = parseInt(node.dataset.offsetY) - event.movementY;
    node.dataset.offsetX = offsetX.toString();
    node.dataset.offsetY = offsetY.toString();
    node.style.transform = "scale(1.5)";
    node.style.transform += `translate(${offsetX}px, ${offsetY}px)`;
  }
  globalThis.handle_zoom_in = handle_zoom_in;
  function handle_zoom_out(node) {
    node.style.transform = "";
    node.dataset.offsetX = "0";
    node.dataset.offsetY = "0";
  }
  globalThis.handle_zoom_out = handle_zoom_out;

  // js/text.js
  var Mode = Object.freeze({
    normal: "normal",
    insert: "insert"
  });
  var current = {
    active: void 0,
    mode: Mode.normal
  };
  function make_text_buffer(active = false) {
    let wrapper = document.createElement("div");
    wrapper.classList.add("text-buffer-wrapper");
    if (active) {
      wrapper.classList.add("active");
      current.active = wrapper;
    }
    let buffer = document.createElement("div");
    buffer.classList.add("text-buffer");
    buffer.onclick = update_active;
    wrapper.appendChild(buffer);
    let button_right = document.createElement("div");
    button_right.classList.add("text-buffer-button", "right");
    button_right.onmouseup = add_text_buffer;
    button_right.innerHTML = "&#xFF0B;";
    wrapper.appendChild(button_right);
    let button_bottom = document.createElement("div");
    button_bottom.classList.add("text-buffer-button", "bottom");
    button_bottom.onmouseup = add_text_buffer;
    button_bottom.innerHTML = "&#xFF0B;";
    wrapper.appendChild(button_bottom);
    let button_remove = document.createElement("div");
    button_remove.classList.add("text-buffer-button", "top", "right");
    button_remove.onmouseup = remove_text_buffer;
    button_remove.innerHTML = "&#xFF0D";
    wrapper.appendChild(button_remove);
    return wrapper;
  }
  function update_active() {
    set_active(this.parentElement);
  }
  function set_active(buffer) {
    current.active.classList.remove("active");
    current.active = buffer;
    current.active.classList.add("active");
  }
  function set_mode(mode) {
    current.mode = mode;
    if (mode === Mode.insert) {
      current.active.classList.add("insert");
      add_character(current.active.querySelector(".text-buffer"));
    } else {
      current.active.classList.remove("insert");
    }
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
    } else {
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
    if (!(button instanceof HTMLElement)) {
      throw new Error("Got invalid button");
    }
    const wrapper = button.parentElement;
    if (button.classList.contains("right")) {
      add_text_buffer_right(wrapper);
    } else if (button.classList.contains("bottom")) {
      add_text_buffer_bottom(wrapper);
    } else {
      throw new Error("Got invalid direction");
    }
  }
  function remove_text_buffer(event) {
    const button = event.target;
    if (!(button instanceof HTMLElement)) {
      throw new Error("Got invalid button");
    }
    const wrapper = button.parentElement;
    const parent = wrapper.parentElement;
    if (wrapper.classList.contains("active")) {
      for (const direction of Object.keys(Direction)) {
        let sibling = find_nearest(wrapper, direction);
        if (sibling !== null) {
          set_active(sibling);
          break;
        }
      }
    }
    wrapper.remove();
    cleanup(parent);
  }
  function cleanup(node) {
    if (node.id === "text-buffer-container") {
      return;
    }
    if (node.classList.contains("row") && node.children.length == 0) {
      if (node.parentElement.id === "text-buffer-container" && node.parentElement.children.length == 1) {
        node.appendChild(make_text_buffer(true));
      } else {
        const parent = node.parentElement;
        node.remove();
        cleanup(parent);
      }
    } else if (node.classList.contains("box") && node.children.length == 1) {
      for (let child of [...node.children[0].children]) {
        node.insertAdjacentElement("beforebegin", child);
      }
      node.remove();
    }
  }
  var Direction = Object.freeze({
    right: "right",
    left: "left",
    up: "up",
    down: "down"
  });
  function find_nearest(buffer, direction) {
    const element = (() => {
      if (direction === Direction.right) {
        return buffer.nextElementSibling;
      } else if (direction === Direction.left) {
        return buffer.previousElementSibling;
      } else if (direction === Direction.up) {
        let sibling = buffer.parentElement.previousElementSibling;
        return sibling?.children[0];
      } else if (direction === Direction.down) {
        let sibling = buffer.parentElement.nextElementSibling;
        return sibling?.children[0];
      } else {
        throw new Error("Invalid direction " + direction);
      }
    })();
    if (element instanceof HTMLDivElement) {
      return element;
    } else if (typeof element === "undefined") {
      return null;
    }
    throw new Error("Got Invalid sibling");
  }

  // js/setup.js
  console.log("bonjour");
  var current_text_buffer = () => current.active.querySelector(".text-buffer");
  var Accent = Object.freeze({
    dieresis: "dieresis",
    circumflex: "circumflex"
  });
  var key_buffer = null;
  var key_binding = {
    /** @type {Object.<string, (Binding | Binding[])>} */
    [Mode.normal]: {
      h: [
        {
          action: () => {
            let sibling = find_nearest(current.active, Direction.left);
            if (sibling !== null) {
              set_active(sibling);
            }
          }
        },
        {
          action: () => {
            let sibling = find_nearest(current.active, Direction.left);
            if (sibling !== null) {
              sibling.insertAdjacentElement(
                "beforebegin",
                current.active
              );
            }
          },
          modifiers: ["Alt"]
        }
      ],
      l: [
        {
          action: () => {
            let sibling = find_nearest(current.active, Direction.right);
            if (sibling !== null) {
              set_active(sibling);
            }
          }
        },
        {
          action: () => {
            let sibling = find_nearest(current.active, Direction.right);
            if (sibling !== null) {
              sibling.insertAdjacentElement(
                "afterend",
                current.active
              );
            }
          },
          modifiers: ["Alt"]
        }
      ],
      k: [
        {
          action: () => {
            let sibling = find_nearest(current.active, Direction.up);
            if (sibling !== null) {
              set_active(sibling);
            }
          }
        },
        {
          action: () => {
            let sibling = find_nearest(current.active, Direction.up);
            if (sibling !== null) {
              sibling.insertAdjacentElement(
                "beforebegin",
                current.active
              );
            } else {
              console.log("TODO");
            }
          },
          modifiers: ["Alt"]
        }
      ],
      j: [
        {
          action: () => {
            let sibling = find_nearest(current.active, Direction.down);
            if (sibling !== null) {
              set_active(sibling);
            }
          }
        },
        {
          action: () => {
            let sibling = find_nearest(current.active, Direction.down);
            if (sibling !== null) {
              sibling.insertAdjacentElement(
                "afterend",
                current.active
              );
            }
          },
          modifiers: ["Alt"]
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
          if (event.code !== "BracketLeft") {
            return;
          }
          if (event.shiftKey) {
            key_buffer = Accent.dieresis;
          } else {
            key_buffer = Accent.circumflex;
          }
        },
        skip_after: true
      },
      \u00E6: {
        action: () => send_key(current_text_buffer(), "\xE1")
      },
      _default: {
        action: (event) => send_key(current_text_buffer(), event.key)
      },
      _after: {
        action: () => key_buffer = null
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
    add(key, action, {
      alt = false,
      shift = false,
      ctrl = false,
      meta = false,
      mode = Mode.normal,
      skip_after = false
    }) {
      if (Array.isArray(key)) {
        for (const k of key) {
          this.add(k, action, {
            alt,
            shift,
            ctrl,
            meta,
            mode,
            skip_after
          });
        }
        return;
      }
      const mod_args = [alt, shift, ctrl, meta];
      const modifiers = ["Alt", "Shift", "Ctrl", "Meta"].filter(
        (_, index) => mod_args[index]
      );
      const key_bind = {
        action,
        modifiers,
        skip_after
      };
      if (key in this[mode]) {
        if (!Array.isArray(this[mode][key])) {
          this[mode][key] = [this[mode][key]];
        }
        this[mode][key].push(key_bind);
      } else {
        this[mode][key] = key_bind;
      }
    },
    /**
     * Match a pressed key with a key-binding's action
     * @param {KeyboardEvent} keypress
     * @returns {() => void}
     */
    match(keypress) {
      function wrapper(action2 = () => {
      }, _after = () => {
      }, skip_after2 = false) {
        if (skip_after2) {
          return () => action2();
        }
        return () => {
          action2();
          _after();
        };
      }
      const binding = this[current.mode][keypress.key];
      const [action, skip_after] = (() => {
        if (typeof binding === "undefined") {
          return [
            this[current.mode]._default?.action?.bind(
              void 0,
              keypress
            ),
            false
          ];
        } else if (Array.isArray(binding)) {
          for (const b of binding) {
            let verified = this.verify_modifiers(keypress, b);
            if (verified !== null) {
              return [
                verified.action.bind(void 0, keypress),
                verified.skip_after
              ];
            }
          }
          return [void 0, false];
        } else {
          let verified = this.verify_modifiers(keypress, binding);
          return [
            verified?.action?.bind(void 0, keypress),
            verified.skip_after
          ];
        }
      })();
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
      if (keypress.altKey === modifiers.includes("Alt") && keypress.shiftKey === modifiers.includes("Shift") && keypress.ctrlKey === modifiers.includes("Ctrl") && keypress.metaKey === modifiers.includes("Meta")) {
        return binding;
      }
      return null;
    }
  };
  key_binding.add(
    Array.from("aeiouy"),
    (event) => {
      if (key_buffer === Accent.circumflex) {
        send_key(current_text_buffer(), event.key + "\u0302");
      } else if (key_buffer === Accent.dieresis) {
        send_key(current_text_buffer(), event.key + "\u0308");
      } else {
        send_key(current_text_buffer(), event.key);
      }
    },
    { mode: Mode.insert }
  );
  function handle_keybinding(event) {
    if (event.code === "Tab") {
      event.preventDefault();
    }
    key_binding.match(event)();
  }
  (() => {
    document.querySelector("#text-buffer-container > .row").appendChild(make_text_buffer(true));
    let container = document.querySelector("#vowels_container");
    for (const [code, letter] of vowels) {
      container.appendChild(build_letter(code, letter, true));
    }
    container = document.querySelector("#consonants_container");
    for (const [code, letter] of consonants) {
      container.appendChild(build_letter(code, letter, false));
    }
    setup_gallery_buttons();
    display_page(1);
    document.onkeydown = handle_keybinding;
  })();
})();
