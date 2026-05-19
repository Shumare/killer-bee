import type { RequestHandler } from 'express'
import { encrypt, decrypt } from '../security/crypto/cipher'

const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH'])
const MAX_BODY_BYTES = 1_048_576 // 1 MB

export const encryptResponse: RequestHandler = (_req, res, next) => {
  res.json = function (data: unknown) {
    const ciphertext = encrypt(JSON.stringify(data))
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end(ciphertext)
    return res
  }
  next()
}

export const decryptBody: RequestHandler = (req, _res, next) => {
  if (!BODY_METHODS.has(req.method)) return next()

  let raw = ''
  let size = 0
  req.setEncoding('utf8')
  req.on('data', (chunk: string) => {
    size += Buffer.byteLength(chunk)
    if (size <= MAX_BODY_BYTES) raw += chunk
  })
  req.on('end', () => {
    if (size > MAX_BODY_BYTES) {
      next(Object.assign(new Error('Corps de requête trop volumineux'), { status: 413 }))
      return
    }
    if (!raw) return next()
    try {
      const decrypted = decrypt(raw)
      req.body = JSON.parse(decrypted)
      next()
    } catch {
      next(Object.assign(new Error('Corps de requête invalide ou non chiffré'), { status: 400 }))
    }
  })
  req.on('error', next)
}
