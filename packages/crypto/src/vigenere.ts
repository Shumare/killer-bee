const UPPER_A = 65;
const LOWER_A = 97;
const ALPHABET_SIZE = 26;

function isLetter(char: string): boolean {
  const code = char.charCodeAt(0);
  return (code >= UPPER_A && code <= UPPER_A + ALPHABET_SIZE - 1) ||
         (code >= LOWER_A && code <= LOWER_A + ALPHABET_SIZE - 1);
}

function keyShift(keyChar: string): number {
  const code = keyChar.toUpperCase().charCodeAt(0);
  return code - UPPER_A;
}

export function vigenereEncrypt(text: string, key: string): string {
  if (key.length === 0) return text;
  const upperKey = key.toUpperCase();
  let keyIndex = 0;
  return text.split('').map((c) => {
    if (!isLetter(c)) return c;
    const shift = keyShift(upperKey[keyIndex % upperKey.length]);
    keyIndex++;
    const code = c.charCodeAt(0);
    const isUpper = code >= UPPER_A && code <= UPPER_A + ALPHABET_SIZE - 1;
    const base = isUpper ? UPPER_A : LOWER_A;
    return String.fromCharCode(((code - base + shift) % ALPHABET_SIZE) + base);
  }).join('');
}

export function vigenereDecrypt(text: string, key: string): string {
  if (key.length === 0) return text;
  const upperKey = key.toUpperCase();
  let keyIndex = 0;
  return text.split('').map((c) => {
    if (!isLetter(c)) return c;
    const shift = keyShift(upperKey[keyIndex % upperKey.length]);
    keyIndex++;
    const code = c.charCodeAt(0);
    const isUpper = code >= UPPER_A && code <= UPPER_A + ALPHABET_SIZE - 1;
    const base = isUpper ? UPPER_A : LOWER_A;
    return String.fromCharCode(((code - base - shift + ALPHABET_SIZE) % ALPHABET_SIZE) + base);
  }).join('');
}
