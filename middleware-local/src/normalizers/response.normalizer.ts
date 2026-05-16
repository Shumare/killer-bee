import type { MessageStatus, NormalizedResponse } from '../ui-contracts/message.contract'

export function normalizeSuccess<T>(data: T): NormalizedResponse<T> {
  return { status: 'success', data, error: null }
}

export function normalizeFailure(message: string): NormalizedResponse<null> {
  return { status: 'failure', data: null, error: message }
}

export function normalizePending<T>(): NormalizedResponse<T | null> {
  return { status: 'pending', data: null, error: null }
}

export function normalizeWarning<T>(data: T, message: string): NormalizedResponse<T> {
  return { status: 'warning', data, error: message }
}

export function normalizeHttpResponse<T>(
  status: number,
  data: T | null,
  errorMessage?: string
): NormalizedResponse<T | null> {
  if (status >= 200 && status < 300) return normalizeSuccess(data as T)
  if (status >= 400 && status < 500) return normalizeFailure(errorMessage ?? 'Requête invalide')
  return normalizeFailure(errorMessage ?? 'Erreur serveur')
}

export function resolveStatus(httpCode: number): MessageStatus {
  if (httpCode >= 200 && httpCode < 300) return 'success'
  if (httpCode === 202) return 'pending'
  if (httpCode >= 400 && httpCode < 500) return 'failure'
  return 'failure'
}
