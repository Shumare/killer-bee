const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  return response.json() as Promise<T>
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
