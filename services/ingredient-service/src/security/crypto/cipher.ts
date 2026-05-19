import { env } from '../../config/env'

const keyBytes: number[] = Array.from(Buffer.from(env.CIPHER_KEY, 'utf8'))
const kLen = keyBytes.length
const colCount = (keyBytes[0] % 3) + 3

function argsort(arr: number[]): number[] {
  return arr.map((_, i) => i).sort((a, b) => arr[a] - arr[b] || a - b)
}

function vigenereEncrypt(text: string): string {
  return text.split('').map((c, i) =>
    String.fromCharCode((c.charCodeAt(0) + keyBytes[i % kLen]) % 256)
  ).join('')
}

function vigenereDecrypt(text: string): string {
  return text.split('').map((c, i) =>
    String.fromCharCode((c.charCodeAt(0) - keyBytes[i % kLen] + 256) % 256)
  ).join('')
}

function columnEncrypt(text: string): [string, number] {
  const padLen = (colCount - (text.length % colCount)) % colCount
  const padded = text + '\x00'.repeat(padLen)
  const rows = padded.length / colCount
  const colKeyBytes = Array.from({ length: colCount }, (_, i) => keyBytes[i % kLen])
  const colOrder = argsort(colKeyBytes)

  let result = ''
  for (const col of colOrder) {
    for (let row = 0; row < rows; row++) {
      result += padded[row * colCount + col]
    }
  }
  return [result, padLen]
}

function columnDecrypt(text: string, padLen: number): string {
  const rows = text.length / colCount
  const colKeyBytes = Array.from({ length: colCount }, (_, i) => keyBytes[i % kLen])
  const colOrder = argsort(colKeyBytes)
  const grid: string[][] = Array.from({ length: rows }, () => new Array(colCount).fill(''))

  let pos = 0
  for (const col of colOrder) {
    for (let row = 0; row < rows; row++) {
      grid[row][col] = text[pos++]
    }
  }

  const reconstructed = grid.map(row => row.join('')).join('')
  return padLen > 0 ? reconstructed.slice(0, -padLen) : reconstructed
}

function xorKey(text: string): string {
  return text.split('').map((c, i) =>
    String.fromCharCode(c.charCodeAt(0) ^ keyBytes[kLen - 1 - (i % kLen)])
  ).join('')
}

export function encrypt(plaintext: string): string {
  const s1 = vigenereEncrypt(plaintext)
  const [t, padLen] = columnEncrypt(s1)
  const s2 = xorKey(t)
  return Buffer.from(String.fromCharCode(padLen) + s2, 'binary').toString('base64')
}

export function decrypt(ciphertext: string): string {
  const raw = Buffer.from(ciphertext, 'base64').toString('binary')
  const padLen = raw.charCodeAt(0)
  const t = xorKey(raw.slice(1))
  const s1 = columnDecrypt(t, padLen)
  return vigenereDecrypt(s1)
}
