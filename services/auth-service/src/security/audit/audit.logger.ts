import { log } from '../../utils/logger'

// Événements d'audit de sécurité — niveau RFC 5424 selon la criticité
// notice  : tentative normale, opération sensible attendue
// warn    : échec d'authentification, accès refusé, token invalide
// alert   : nécessite une action immédiate (ex : brute-force détecté)

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
}

function writeAuditEntry(entry: AuditEntry, level: 'notice' | 'info' | 'warn' | 'alert'): void {
  const meta = { category: 'audit', ...entry }
  const msg = `[AUDIT] ${entry.event}`
  if (level === 'alert')  log.alert(msg, meta)
  else if (level === 'warn') log.warn(msg, meta)
  else if (level === 'info') log.info(msg, meta)
  else                       log.notice(msg, meta)
}

export function logLoginAttempt(email: string, ip?: string): void {
  writeAuditEntry({ event: 'login_attempt', detail: email, ip }, 'notice')
}

export function logLoginSuccess(userId: number, ip?: string): void {
  writeAuditEntry({ event: 'login_success', userId, ip }, 'info')
}

export function logLoginFailure(email: string, reason: string, ip?: string): void {
  writeAuditEntry({ event: 'login_failure', detail: `${email}: ${reason}`, ip }, 'warn')
}

export function logAccessDenied(userId: number | undefined, path: string): void {
  writeAuditEntry({ event: 'access_denied', userId, path }, 'warn')
}

export function logValidationError(path: string, detail: string): void {
  writeAuditEntry({ event: 'validation_error', path, detail }, 'warn')
}

export function logSensitiveOperation(userId: number, detail: string): void {
  writeAuditEntry({ event: 'sensitive_operation', userId, detail }, 'notice')
}
