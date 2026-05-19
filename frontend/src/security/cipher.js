const key = import.meta.env.VITE_CIPHER_KEY ?? 'killer-bee-default-key';
const keyBytes = [...key].map(c => c.charCodeAt(0));
const kLen = keyBytes.length;
const colCount = (keyBytes[0] % 3) + 3;
function argsort(arr) {
    return arr.map((_, i) => i).sort((a, b) => arr[a] - arr[b] || a - b);
}
function vigenereEncrypt(text) {
    return [...text].map((c, i) => String.fromCharCode((c.charCodeAt(0) + keyBytes[i % kLen]) % 256)).join('');
}
function vigenereDecrypt(text) {
    return [...text].map((c, i) => String.fromCharCode((c.charCodeAt(0) - keyBytes[i % kLen] + 256) % 256)).join('');
}
function columnEncrypt(text) {
    const padLen = (colCount - (text.length % colCount)) % colCount;
    const padded = text + '\x00'.repeat(padLen);
    const rows = padded.length / colCount;
    const colKeyBytes = Array.from({ length: colCount }, (_, i) => keyBytes[i % kLen]);
    const colOrder = argsort(colKeyBytes);
    let result = '';
    for (const col of colOrder) {
        for (let row = 0; row < rows; row++) {
            result += padded[row * colCount + col];
        }
    }
    return [result, padLen];
}
function columnDecrypt(text, padLen) {
    const rows = text.length / colCount;
    const colKeyBytes = Array.from({ length: colCount }, (_, i) => keyBytes[i % kLen]);
    const colOrder = argsort(colKeyBytes);
    const grid = Array.from({ length: rows }, () => new Array(colCount).fill(''));
    let pos = 0;
    for (const col of colOrder) {
        for (let row = 0; row < rows; row++) {
            grid[row][col] = text[pos++];
        }
    }
    const reconstructed = grid.map(row => row.join('')).join('');
    return padLen > 0 ? reconstructed.slice(0, -padLen) : reconstructed;
}
function xorKey(text) {
    return [...text].map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ keyBytes[kLen - 1 - (i % kLen)])).join('');
}
export function encrypt(plaintext) {
    const s1 = vigenereEncrypt(plaintext);
    const [t, padLen] = columnEncrypt(s1);
    const s2 = xorKey(t);
    return btoa(String.fromCharCode(padLen) + s2);
}
export function decrypt(ciphertext) {
    const raw = atob(ciphertext);
    const padLen = raw.charCodeAt(0);
    const t = xorKey(raw.slice(1));
    const s1 = columnDecrypt(t, padLen);
    return vigenereDecrypt(s1);
}
