import { caesarEncrypt, caesarDecrypt } from '../caesar';
import { vigenereEncrypt, vigenereDecrypt } from '../vigenere';
import { transpositionEncrypt, transpositionDecrypt } from '../transposition';
import { KillerBeeCrypto } from '../index';

// ---------------------------------------------------------------------------
// Caesar
// ---------------------------------------------------------------------------
describe('caesarEncrypt', () => {
  it('shifts uppercase letters by positive shift', () => {
    expect(caesarEncrypt('ABC', 3)).toBe('DEF');
  });

  it('shifts lowercase letters by positive shift', () => {
    expect(caesarEncrypt('abc', 3)).toBe('def');
  });

  it('wraps around Z', () => {
    expect(caesarEncrypt('XYZ', 3)).toBe('ABC');
    expect(caesarEncrypt('xyz', 3)).toBe('abc');
  });

  it('preserves case independently', () => {
    expect(caesarEncrypt('aAbBzZ', 1)).toBe('bBcCaA');
  });

  it('leaves non-letter characters unchanged', () => {
    expect(caesarEncrypt('Hello, World! 123', 13)).toBe('Uryyb, Jbeyq! 123');
  });

  it('handles empty string', () => {
    expect(caesarEncrypt('', 5)).toBe('');
  });

  it('handles shift of 0', () => {
    expect(caesarEncrypt('Hello', 0)).toBe('Hello');
  });

  it('handles shift larger than 26', () => {
    expect(caesarEncrypt('A', 27)).toBe('B');
    expect(caesarEncrypt('A', 52)).toBe('A');
  });

  it('handles negative shift', () => {
    expect(caesarEncrypt('DEF', -3)).toBe('ABC');
  });
});

describe('caesarDecrypt', () => {
  it('is the inverse of caesarEncrypt', () => {
    const samples = ['Hello, World!', 'ABCxyz123!@#', '', 'ZzAa'];
    for (const text of samples) {
      for (const shift of [0, 1, 13, 25, 26, -3]) {
        expect(caesarDecrypt(caesarEncrypt(text, shift), shift)).toBe(text);
      }
    }
  });

  it('shifts backward for positive shift', () => {
    expect(caesarDecrypt('DEF', 3)).toBe('ABC');
  });
});

// ---------------------------------------------------------------------------
// Vigenère
// ---------------------------------------------------------------------------
describe('vigenereEncrypt', () => {
  it('encrypts a simple string', () => {
    expect(vigenereEncrypt('ATTACKATDAWN', 'LEMON')).toBe('LXFOPVEFRNHR');
  });

  it('preserves case', () => {
    expect(vigenereEncrypt('attackatdawn', 'lemon')).toBe('lxfopvefrnhr');
  });

  it('leaves non-letter characters unchanged and does not advance key index for them', () => {
    const withSpaces = vigenereEncrypt('A B C', 'KEY');
    const withoutSpaces = vigenereEncrypt('ABC', 'KEY');
    expect(withSpaces[0]).toBe(withoutSpaces[0]);
    expect(withSpaces[2]).toBe(withoutSpaces[1]);
    expect(withSpaces[4]).toBe(withoutSpaces[2]);
    expect(withSpaces[1]).toBe(' ');
    expect(withSpaces[3]).toBe(' ');
  });

  it('handles empty string', () => {
    expect(vigenereEncrypt('', 'KEY')).toBe('');
  });

  it('handles empty key', () => {
    expect(vigenereEncrypt('ABC', '')).toBe('ABC');
  });

  it('cycles the key', () => {
    const result = vigenereEncrypt('AAAA', 'AB');
    expect(result).toBe('ABAB');
  });
});

describe('vigenereDecrypt', () => {
  it('is the inverse of vigenereEncrypt', () => {
    const samples = ['ATTACKATDAWN', 'Hello World!', '', '123 abc XYZ'];
    for (const text of samples) {
      for (const key of ['LEMON', 'KEY', 'A', 'ZZ']) {
        expect(vigenereDecrypt(vigenereEncrypt(text, key), key)).toBe(text);
      }
    }
  });

  it('decrypts the classic example', () => {
    expect(vigenereDecrypt('LXFOPVEFRNHR', 'LEMON')).toBe('ATTACKATDAWN');
  });
});

// ---------------------------------------------------------------------------
// Transposition
// ---------------------------------------------------------------------------
describe('transpositionEncrypt', () => {
  it('encrypts with a simple key', () => {
    // key "KEY": sorted order E=1, K=0, Y=2 → read col 1, col 0, col 2
    // text "HELLOWORLD" with 3 cols:
    //   H E L
    //   L O W
    //   O R L
    //   D X X  (padded)
    // col 1 (E): E, O, R, X → EORX
    // col 0 (K): H, L, O, D → HLOD
    // col 2 (Y): L, W, L, X → LWLX
    // result: EORXHLODLWLX
    expect(transpositionEncrypt('HELLOWORLD', 'KEY')).toBe('EORXHLODLWLX');
  });

  it('handles text that fills grid exactly (no padding)', () => {
    // "ABC" with key "BA" → 2 cols, 1 row + needs padding if length=3
    // Actually "AB" with key "BA": 2 cols, 1 row, no padding
    // BA sorted: A=1, B=0 → col 1, col 0 → B, A → BA
    expect(transpositionEncrypt('AB', 'BA')).toBe('BA');
  });

  it('pads incomplete last row with X', () => {
    // "A" with key "BA": 2 cols → grid: A X
    // sorted: A=1, B=0 → col 1 = X, col 0 = A → XA
    expect(transpositionEncrypt('A', 'BA')).toBe('XA');
  });

  it('handles empty string', () => {
    expect(transpositionEncrypt('', 'KEY')).toBe('');
  });

  it('handles empty key', () => {
    expect(transpositionEncrypt('HELLO', '')).toBe('HELLO');
  });

  it('handles single-character key (identity, just pads)', () => {
    // single col: sorted order is just [0], read col 0 = all chars
    expect(transpositionEncrypt('HELLO', 'A')).toBe('HELLO');
  });
});

describe('transpositionDecrypt', () => {
  it('is the inverse of transpositionEncrypt', () => {
    const key = 'KEY';
    const ciphertext = transpositionEncrypt('HELLOWORLD', key);
    expect(transpositionDecrypt(ciphertext, key)).toBe('HELLOWORLDXX');
  });

  it('returns padded text when decrypting (decrypt is lossless, padding included)', () => {
    const original = 'ATTACKATDAWN';
    const key = 'ZEBRA';
    const cipher = transpositionEncrypt(original, key);
    const decrypted = transpositionDecrypt(cipher, key);
    expect(decrypted.startsWith(original)).toBe(true);
    expect(decrypted).toBe('ATTACKATDAWNXXX');
  });

  it('handles empty string', () => {
    expect(transpositionDecrypt('', 'KEY')).toBe('');
  });

  it('handles empty key', () => {
    expect(transpositionDecrypt('HELLO', '')).toBe('HELLO');
  });

  it('reverses the classic test case', () => {
    expect(transpositionDecrypt('EORXHLODLWLX', 'KEY')).toBe('HELLOWORLDXX');
  });
});

// ---------------------------------------------------------------------------
// KillerBeeCrypto — full pipeline
// ---------------------------------------------------------------------------
describe('KillerBeeCrypto', () => {
  const crypto = new KillerBeeCrypto();

  it('encrypt then decrypt returns original text (strip padding)', () => {
    const plaintext = 'HELLO';
    const keySub1 = 3;
    const keySub2 = 'KEY';
    const keyTransposition = 'BAT';
    const encrypted = crypto.encrypt(plaintext, keySub1, keySub2, keyTransposition);
    const decrypted = crypto.decrypt(encrypted, keySub1, keySub2, keyTransposition);
    // decrypted may have trailing X padding — original is a prefix
    expect(decrypted.startsWith(plaintext) || decrypted === plaintext).toBe(true);
  });

  it('full round-trip when plaintext fills grid exactly', () => {
    // ATTACKATDAWN = 12 chars, key ZEBRA = 5 cols → 12/5 = 2.4 → 3 rows = 15 chars, padded
    // Use a plaintext that fills exactly: 10 chars, key of 5 → 2 rows, no padding
    const plaintext = 'HELLOWORLD';
    const encrypted = crypto.encrypt(plaintext, 1, 'AB', 'ABCDE');
    const decrypted = crypto.decrypt(encrypted, 1, 'AB', 'ABCDE');
    expect(decrypted).toBe(plaintext);
  });

  it('handles empty plaintext', () => {
    const encrypted = crypto.encrypt('', 5, 'KEY', 'BAT');
    expect(encrypted).toBe('');
    expect(crypto.decrypt('', 5, 'KEY', 'BAT')).toBe('');
  });

  it('preserves non-letter characters through the pipeline', () => {
    // digits and symbols should pass through Caesar and Vigenère unchanged
    const plaintext = '12345!@#$%';
    const encrypted = crypto.encrypt(plaintext, 7, 'LEMON', 'ABCDE');
    const decrypted = crypto.decrypt(encrypted, 7, 'LEMON', 'ABCDE');
    expect(decrypted).toBe(plaintext);
  });

  it('is sensitive to key changes', () => {
    const plaintext = 'SECRETMESSAGE';
    const enc1 = crypto.encrypt(plaintext, 3, 'KEY', 'BAT');
    const enc2 = crypto.encrypt(plaintext, 4, 'KEY', 'BAT');
    const enc3 = crypto.encrypt(plaintext, 3, 'KEYS', 'BAT');
    const enc4 = crypto.encrypt(plaintext, 3, 'KEY', 'BATS');
    expect(enc1).not.toBe(enc2);
    expect(enc1).not.toBe(enc3);
    expect(enc1).not.toBe(enc4);
  });

  it('preserves case through the full pipeline', () => {
    // All lowercase input: result of Caesar+Vigenere on letters remains lowercase
    const plaintext = 'hello';
    const enc = crypto.encrypt(plaintext, 1, 'a', 'AB');
    // decrypt back
    const dec = crypto.decrypt(enc, 1, 'a', 'AB');
    expect(dec.toLowerCase()).toBe(dec);
  });

  it('works with shift=0 and single-char key (identity-like)', () => {
    const plaintext = 'ABCDE';
    const encrypted = crypto.encrypt(plaintext, 0, 'A', 'ABCDE');
    const decrypted = crypto.decrypt(encrypted, 0, 'A', 'ABCDE');
    expect(decrypted).toBe(plaintext);
  });

  it('works with large shift values', () => {
    const plaintext = 'TESTMESSAGE';
    const encrypted = crypto.encrypt(plaintext, 52, 'LONGKEY', 'CRYPTO');
    const decrypted = crypto.decrypt(encrypted, 52, 'LONGKEY', 'CRYPTO');
    expect(decrypted.startsWith(plaintext) || decrypted === plaintext).toBe(true);
  });

  it('encrypt produces different output than plaintext', () => {
    const plaintext = 'ATTACKATDAWN';
    const encrypted = crypto.encrypt(plaintext, 3, 'LEMON', 'ZEBRA');
    expect(encrypted).not.toBe(plaintext);
  });
});
