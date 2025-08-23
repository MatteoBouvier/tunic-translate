class TrieNode {
    constructor() {
        /** @type {Object.<string, TrieNode>}*/
        this.children = {};
        /** @type {boolean} */
        this.is_end_of_word = false;
        /** @type {[number, number[]][]}*/
        this.locations = [];
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
     * @param {string} str
     */
    search(str) {
        let node = this.root;
        for (const char of str) {
            if (!node.children[char]) {
                return [];
            }

            node = node.children[char];
        }

        let words = [];
        /** @type {[string, TrieNode][]}*/
        let nodes_to_visit = [[str, node]];

        while (nodes_to_visit.length) {
            const [word, node] = nodes_to_visit.pop();

            if (node.is_end_of_word) {
                words.push(word);
            }

            for (const [char, child] of Object.entries(node.children)) {
                nodes_to_visit.push([word + char, child]);
            }
        }

        return words;
    }
}
