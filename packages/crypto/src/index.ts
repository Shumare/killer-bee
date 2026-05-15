import { caesarEncrypt, caesarDecrypt } from './caesar';
import { vigenereEncrypt, vigenereDecrypt } from './vigenere';
import { transpositionEncrypt, transpositionDecrypt } from './transposition';

export { caesarEncrypt, caesarDecrypt } from './caesar';
export { vigenereEncrypt, vigenereDecrypt } from './vigenere';
export { transpositionEncrypt, transpositionDecrypt } from './transposition';

export interface ICrypto {
  encrypt(plaintext: string, keySub1: number, keySub2: string, keyTransposition: string): string;
  decrypt(ciphertext: string, keySub1: number, keySub2: string, keyTransposition: string): string;
}

export class KillerBeeCrypto implements ICrypto {
  encrypt(plaintext: string, keySub1: number, keySub2: string, keyTransposition: string): string {
    const afterCaesar = caesarEncrypt(plaintext, keySub1);
    const afterVigenere = vigenereEncrypt(afterCaesar, keySub2);
    return transpositionEncrypt(afterVigenere, keyTransposition);
  }

  decrypt(ciphertext: string, keySub1: number, keySub2: string, keyTransposition: string): string {
    const afterTransposition = transpositionDecrypt(ciphertext, keyTransposition);
    const afterVigenere = vigenereDecrypt(afterTransposition, keySub2);
    return caesarDecrypt(afterVigenere, keySub1);
  }
}
