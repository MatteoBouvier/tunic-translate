class TrieNode {
    constructor() {
        /** @type {Object.<string, TrieNode>}*/
        this.children = {};
        /** @type {boolean} */
        this.is_end_of_word = false;
        /** @type {[number, number[]][]}*/
        this.locations = [];
        /** @type {string} */
        this.meaning = "";
    }
}


export class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    /**
     * @param {string} word - a word to insert
     * @param {number} page
     * @param {number[]} buffer_index
     */
    insert(word, page, buffer_index) {
        let node = this.root;
        for (const char of word) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }

            node = node.children[char];
        }

        node.is_end_of_word = true;
        node.locations.push([page, buffer_index])
    }

    /**
     * @param {string} word
     * @returns {TrieNode}
     */
    get(word) {
        let node = this.root;

        for (const char of word) {
            if (!node.children[char]) {
                throw new Error(`Word '${word}' not in Trie`)
            }

            node = node.children[char];
        }

        if (!node.is_end_of_word) {
            throw new Error(`Word '${word}' not in Trie`)
        }

        return node;
    }

    /**
     * @param {string} word - a word to insert
     * @param {string} meaning - the meaning (translation) of the word
     */
    set_meaning(word, meaning) {
        this.get(word).meaning = meaning;
    }

    /**
     * @param {string} str
     * @returns {[string, TrieNode][]}
     */
    search(str) {
        let node = this.root;
        for (const char of str) {
            if (!node.children[char]) {
                return [];
            }

            node = node.children[char];
        }

        /** @type {[string, TrieNode][]} */
        let words = [];
        /** @type {[string, TrieNode][]}*/
        let nodes_to_visit = [[str, node]];

        while (nodes_to_visit.length) {
            const [word, node] = nodes_to_visit.pop();

            if (node.is_end_of_word) {
                words.push([word, node]);
            }

            for (const [char, child] of Object.entries(node.children)) {
                nodes_to_visit.push([word + char, child]);
            }
        }

        return words;
    }
}


/**
 * @param {[string, TrieNode][]} matches 
 */
function populate_search_list(matches) {
    const body = document.querySelector(".drawer-body");
    body.innerHTML = "";

    for (const [match, node] of matches) {
        let res = document.createElement("div");
        res.classList.add("match-result");

        let text = document.createElement("div");
        text.classList.add("match-result-text");
        text.innerText = match;
        res.appendChild(text);

        let meaning = document.createElement("div");
        meaning.classList.add("match-result-meaning");
        if (node.meaning) {
            meaning.innerText = `(${node.meaning})`
        }
        res.appendChild(meaning);

        let locations = document.createElement("div");
        locations.classList.add("box", "gap5");
        for (const [page_nb, buffer_index] of node.locations) {
            let location = document.createElement("a");
            location.innerText = `> page ${page_nb} @ ${buffer_index}`;
            location.onclick = () => page_buffer_collection.display(page_nb);

            locations.appendChild(location);
        }
        res.appendChild(locations);

        body.appendChild(res);
    }
}
globalThis.populate_search_list = populate_search_list;
