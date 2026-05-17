type AuditEvent =
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'access_denied'
  | 'token_invalid'
  | 'validation_error'
  | 'sensitive_operation'

type AuditEntry = {
  event: AuditEvent
  userId?: number
  ip?: string
  path?: string
  detail?: string
  timestamp: string
}

function writeAuditEntry(entry: AuditEntry): void {
  console.log(`[AUDIT] ${JSON.stringify(entry)}`)
}

export function logLoginAttempt(email: string, ip?: string): void {
  writeAuditEntry({ event: 'login_attempt', detail: email, ip, timestamp: new Date().toISOString() })
}

export function logLoginSuccess(userId: number, ip?: string): void {
  writeAuditEntry({ event: 'login_success', userId, ip, timestamp: new Date().toISOString() })
}

export function logLoginFailure(email: string, reason: string, ip?: string): void {
  writeAuditEntry({ event: 'login_failure', detail: `${email}: ${reason}`, ip, timestamp: new Date().toISOString() })
}

export function logAccessDenied(userId: number | undefined, path: string): void {
  writeAuditEntry({ event: 'access_denied', userId, path, timestamp: new Date().toISOString() })
}

export function logValidationError(path: string, detail: string): void {
  writeAuditEntry({ event: 'validation_error', path, detail, timestamp: new Date().toISOString() })
}

export function logSensitiveOperation(userId: number, detail: string): void {
  writeAuditEntry({ event: 'sensitive_operation', userId, detail, timestamp: new Date().toISOString() })
}
