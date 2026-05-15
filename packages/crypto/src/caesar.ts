const UPPER_A = 65;
const LOWER_A = 97;
const ALPHABET_SIZE = 26;

function shiftChar(char: string, shift: number): string {
  const code = char.charCodeAt(0);
  if (code >= UPPER_A && code <= UPPER_A + ALPHABET_SIZE - 1) {
    return String.fromCharCode(((code - UPPER_A + shift % ALPHABET_SIZE + ALPHABET_SIZE) % ALPHABET_SIZE) + UPPER_A);
  }
  if (code >= LOWER_A && code <= LOWER_A + ALPHABET_SIZE - 1) {
    return String.fromCharCode(((code - LOWER_A + shift % ALPHABET_SIZE + ALPHABET_SIZE) % ALPHABET_SIZE) + LOWER_A);
  }
  return char;
}

export function caesarEncrypt(text: string, shift: number): string {
  return text.split('').map((c) => shiftChar(c, shift)).join('');
}

export function caesarDecrypt(text: string, shift: number): string {
  return caesarEncrypt(text, -shift);
}
