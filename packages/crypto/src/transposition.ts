const PADDING_CHAR = 'X';

function getSortedOrder(key: string): number[] {
  return key
    .split('')
    .map((char, index) => ({ char, index }))
    .sort((a, b) => a.char.localeCompare(b.char) || a.index - b.index)
    .map((item) => item.index);
}

export function transpositionEncrypt(text: string, key: string): string {
  const numCols = key.length;
  if (numCols === 0) return text;

  const numRows = Math.ceil(text.length / numCols);
  const padded = text.padEnd(numRows * numCols, PADDING_CHAR);

  const order = getSortedOrder(key);

  let result = '';
  for (const col of order) {
    for (let row = 0; row < numRows; row++) {
      result += padded[row * numCols + col];
    }
  }
  return result;
}

export function transpositionDecrypt(ciphertext: string, key: string): string {
  const numCols = key.length;
  if (numCols === 0) return ciphertext;

  const numRows = Math.ceil(ciphertext.length / numCols);
  const order = getSortedOrder(key);

  const grid: string[][] = Array.from({ length: numRows }, () => Array(numCols).fill(''));

  let pos = 0;
  for (const col of order) {
    for (let row = 0; row < numRows; row++) {
      grid[row][col] = ciphertext[pos++];
    }
  }

  return grid.map((row) => row.join('')).join('');
}
