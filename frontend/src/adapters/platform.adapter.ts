export type MessageStatus = 'success' | 'failure' | 'pending' | 'warning'

export type NormalizedResponse<T> = {
  status: MessageStatus
  data: T
  error: string | null
}

export function adaptSuccess<T>(data: T): NormalizedResponse<T> {
  return { status: 'success', data, error: null }
}

export function adaptFailure(message: string): NormalizedResponse<null> {
  return { status: 'failure', data: null, error: message }
}

export function adaptPending<T>(): NormalizedResponse<T | null> {
  return { status: 'pending', data: null, error: null }
}
