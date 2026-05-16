const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { headers: extraHeaders, ...restOptions } = options
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(extraHeaders as Record<string, string>),
    },
    ...restOptions,
  })

  if (!response.ok) {
    console.error(`[API] ${options.method ?? 'GET'} ${path} — HTTP ${response.status}`)
    throw new Error(`HTTP ${response.status}`)
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as unknown as T
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
