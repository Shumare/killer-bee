export function buildHeaders(token?: string): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export function isSuccessStatus(status: number): boolean {
  return status >= 200 && status < 300
}
