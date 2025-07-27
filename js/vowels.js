export const vowels_list = ['a', 'á', 'à', 'â', 'ä', 'e', 'é', 'è', 'ê', 'i', 'î', 'ï', 'o', 'ô', 'u', 'û', 'y', 'ÿ'];

export const vowels = {
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

export const vowels_rev = Object.fromEntries(Object.entries(vowels).map(([k, v]) => [v, k]));
