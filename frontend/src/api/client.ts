import { encrypt, decrypt } from '../security/cipher'
import { getToken } from '../security/token.registry'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { headers: extraHeaders, body, ...restOptions } = options

  const encryptedBody = body && typeof body === 'string' ? encrypt(body) : body
  const token = getToken()

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'text/plain',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(extraHeaders as Record<string, string>),
    },
    body: encryptedBody,
    ...restOptions,
  })

  if (!response.ok) {
    console.error(`[API] ${options.method ?? 'GET'} ${path} — HTTP ${response.status}`)
    try {
      const ciphertext = await response.text()
      const plaintext = decrypt(ciphertext)
      const errorData = JSON.parse(plaintext) as { message?: string }
      throw new Error(errorData.message ?? `HTTP ${response.status}`)
    } catch {
      throw new Error(`HTTP ${response.status}`)
    }
  }

  if (response.status === 204) return undefined as unknown as T

  const ciphertext = await response.text()
  const plaintext = decrypt(ciphertext)
  return JSON.parse(plaintext) as T
}

export function get<T>(path: string, headers?: HeadersInit): Promise<T> {
  return request<T>(path, { method: 'GET', headers })
}

export function post<T>(path: string, body: unknown, headers?: HeadersInit): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body), headers })
}

export function put<T>(path: string, body: unknown, headers?: HeadersInit): Promise<T> {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body), headers })
}

export function del<T>(path: string, headers?: HeadersInit): Promise<T> {
  return request<T>(path, { method: 'DELETE', headers })
}
