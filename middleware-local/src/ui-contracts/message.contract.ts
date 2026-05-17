export type MessageStatus = 'success' | 'failure' | 'pending' | 'warning'

export type UIBehavior = 'toast' | 'banner' | 'loader' | 'error-message' | 'empty-state'

export type NormalizedResponse<T> = {
  status: MessageStatus
  data: T
  error: string | null
}

export const STATUS_UI_MAP: Record<MessageStatus, UIBehavior> = {
  success: 'toast',
  failure: 'error-message',
  pending: 'loader',
  warning: 'banner',
}
