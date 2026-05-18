const CAESAR_SHIFT = 7
const BLOCK_SIZE = 4

function substitute1Caesar(text: string): string {
  return text.split('').map(c => String.fromCharCode((c.charCodeAt(0) + CAESAR_SHIFT) % 256)).join('')
}

function reverseSubstitute1Caesar(text: string): string {
  return text.split('').map(c => String.fromCharCode((c.charCodeAt(0) - CAESAR_SHIFT + 256) % 256)).join('')
}

function substitute2XorMask(text: string): string {
  return text.split('').map(c => String.fromCharCode(c.charCodeAt(0) ^ 0xAA)).join('')
}

function transposeBlocks(text: string): string {
  const result: string[] = []
  for (let i = 0; i < text.length; i += BLOCK_SIZE) {
    result.push(text.slice(i, i + BLOCK_SIZE).split('').reverse().join(''))
  }
  return result.join('')
}

export function encrypt(plaintext: string): string {
  const s1 = substitute1Caesar(plaintext)
  const t = transposeBlocks(s1)
  const s2 = substitute2XorMask(t)
  return Buffer.from(s2, 'binary').toString('base64')
}

export function decrypt(ciphertext: string): string {
  const s2 = Buffer.from(ciphertext, 'base64').toString('binary')
  const t = substitute2XorMask(s2)
  const s1 = transposeBlocks(t)
  return reverseSubstitute1Caesar(s1)
}
