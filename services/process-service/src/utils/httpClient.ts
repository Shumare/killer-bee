import { encrypt, decrypt } from '../security/crypto/cipher'
import { generateToken } from './generateToken'
import { log } from './logger'

const SERVICE_TOKEN = generateToken({ userId: 0 })

async function request<T>(url: string, method: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${SERVICE_TOKEN}`,
  }

  let requestBody: string | undefined
  if (body !== undefined) {
    headers['Content-Type'] = 'text/plain; charset=utf-8'
    requestBody = encrypt(JSON.stringify(body))
  }

  log.debug(`→ [inter-service] ${method} ${url}`, { category: 'communication', url, method })

  const res = await fetch(url, { method, headers, body: requestBody })

  if (!res.ok) {
    log.warn(`← [inter-service] ${method} ${url} ${res.status}`, {
      category: 'communication',
      url,
      method,
      status: res.status,
    })
    throw Object.assign(new Error(`Appel inter-service échoué : ${res.status}`), { status: res.status })
  }

  const ciphertext = await res.text()
  log.debug(`← [inter-service] ${method} ${url} ${res.status}`, { category: 'communication', status: res.status })
  return JSON.parse(decrypt(ciphertext)) as T
}

export function interGet<T>(url: string): Promise<T> {
  return request<T>(url, 'GET')
}

export function interPost<T>(url: string, body: unknown): Promise<T> {
  return request<T>(url, 'POST', body)
}
