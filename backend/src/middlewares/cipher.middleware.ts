import type { RequestHandler } from 'express'
import { encrypt, decrypt } from '../security/crypto/cipher'

export const encryptResponse: RequestHandler = (_req, res, next) => {
  const originalJson = res.json.bind(res)
  res.json = function (data: unknown) {
    const ciphertext = encrypt(JSON.stringify(data))
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end(ciphertext)
    return res
  }
  void originalJson
  next()
}

export const decryptBody: RequestHandler = (req, _res, next) => {
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) return next()

  let raw = ''
  req.setEncoding('utf8')
  req.on('data', (chunk: string) => { raw += chunk })
  req.on('end', () => {
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
