import winston from 'winston'

// ── RFC 5424 log levels (0 = le plus critique) ───────────────────────────────
const RFC5424_LEVELS = {
  emerg:  0, // Urgence   — système inutilisable, arrêt immédiat
  alert:  1, // Alerte    — action immédiate requise (ex : brute-force)
  crit:   2, // Critique  — défaillance critique (ex : port indisponible)
  error:  3, // Erreur    — erreur d'exécution récupérable
  warn:   4, // Warn      — anomalie client, token invalide, validation
  notice: 5, // Notice    — événement métier significatif (login, CRUD)
  info:   6, // Info      — flux normal, démarrage, réponse 2xx
  debug:  7, // Debug     — diagnostic, entrée de fonction, requête SQL
}

winston.addColors({
  emerg:  'bold underline red',
  alert:  'bold red',
  crit:   'bold magenta',
  error:  'red',
  warn:   'yellow',
  notice: 'cyan',
  info:   'green',
  debug:  'blue',
})

// ── Types ────────────────────────────────────────────────────────────────────

export type LogCategory =
  | 'connection'
  | 'http'
  | 'access'
  | 'validation'
  | 'communication'
  | 'routing'
  | 'operation'
  | 'audit'

export type LogMeta = Record<string, unknown>

export interface AppLogger extends winston.Logger {
  emerg:  winston.LeveledLogMethod
  alert:  winston.LeveledLogMethod
  crit:   winston.LeveledLogMethod
  notice: winston.LeveledLogMethod
}

// ── Formats ──────────────────────────────────────────────────────────────────

const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ level, timestamp, message, service, category, ...rest }) => {
    const cat = category ? `[${String(category)}] ` : ''
    const meta = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : ''
    return `[${String(timestamp)}] ${String(level).padEnd(6)} [${String(service)}] ${cat}${String(message)}${meta}`
  }),
)

const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
)

// ── Factory ──────────────────────────────────────────────────────────────────

function createAppLogger(service: string): AppLogger {
  const isDev = process.env.NODE_ENV !== 'production'
  return winston.createLogger({
    levels: RFC5424_LEVELS,
    level:  isDev ? 'debug' : 'info',
    defaultMeta: { service },
    transports: [
      new winston.transports.Console({
        format: isDev ? devFormat : prodFormat,
      }),
    ],
  }) as AppLogger
}

export const log = createAppLogger('freezbe-service')

// ── Helpers sémantiques (rétrocompatibilité) ─────────────────────────────────

export function logConnection(message: string, meta?: LogMeta): void {
  log.info(message, { category: 'connection', ...meta })
}

export function logAccessDenied(message: string, meta?: LogMeta): void {
  log.warn(message, { category: 'access', ...meta })
}

export function logValidationError(message: string, meta?: LogMeta): void {
  log.warn(message, { category: 'validation', ...meta })
}

export function logCommunicationError(message: string, meta?: LogMeta): void {
  log.error(message, { category: 'communication', ...meta })
}

export function logRoutingAnomaly(message: string, meta?: LogMeta): void {
  log.notice(message, { category: 'routing', ...meta })
}

export function logSensitiveOperation(message: string, meta?: LogMeta): void {
  log.notice(message, { category: 'operation', ...meta })
}
