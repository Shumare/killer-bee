type LogLevel = 'info' | 'warn' | 'error'

type LogEntry = {
  level: LogLevel
  category: 'connection' | 'access' | 'validation' | 'communication' | 'routing' | 'operation'
  message: string
  meta?: Record<string, unknown>
  timestamp: string
}

function log(entry: LogEntry): void {
  const prefix = `[${entry.level.toUpperCase()}][${entry.category}]`
  console.log(`${prefix} ${entry.timestamp} — ${entry.message}`, entry.meta ?? '')
}

export function logConnection(message: string, meta?: Record<string, unknown>): void {
  log({ level: 'info', category: 'connection', message, meta, timestamp: new Date().toISOString() })
}

export function logAccessDenied(message: string, meta?: Record<string, unknown>): void {
  log({ level: 'warn', category: 'access', message, meta, timestamp: new Date().toISOString() })
}

export function logValidationError(message: string, meta?: Record<string, unknown>): void {
  log({ level: 'warn', category: 'validation', message, meta, timestamp: new Date().toISOString() })
}

export function logCommunicationError(message: string, meta?: Record<string, unknown>): void {
  log({ level: 'error', category: 'communication', message, meta, timestamp: new Date().toISOString() })
}

export function logRoutingAnomaly(message: string, meta?: Record<string, unknown>): void {
  log({ level: 'warn', category: 'routing', message, meta, timestamp: new Date().toISOString() })
}

export function logSensitiveOperation(message: string, meta?: Record<string, unknown>): void {
  log({ level: 'info', category: 'operation', message, meta, timestamp: new Date().toISOString() })
}
