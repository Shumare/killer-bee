import { env } from './config/env'
import { createServer } from './config/server'
import { log } from './utils/logger'

log.debug('Initialisation du service', { category: 'connection', env: env.NODE_ENV })

const app = createServer()

const server = app.listen(env.PORT, () => {
  log.info(`Serveur démarré sur le port ${env.PORT}`, { category: 'connection', port: env.PORT, env: env.NODE_ENV })
})

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    log.crit(`Port ${env.PORT} déjà utilisé — démarrage impossible`, { category: 'connection', port: env.PORT, code: err.code })
  } else {
    log.crit(`Erreur serveur au démarrage : ${err.message}`, { category: 'connection', code: err.code })
  }
  process.exit(1)
})

process.on('SIGTERM', () => {
  log.notice('Signal SIGTERM reçu — arrêt gracieux en cours', { category: 'connection' })
  server.close(() => {
    log.info('Serveur arrêté proprement', { category: 'connection' })
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  log.notice('Signal SIGINT reçu — arrêt gracieux en cours', { category: 'connection' })
  server.close(() => process.exit(0))
})

process.on('uncaughtException', (err: Error) => {
  log.emerg(`Exception non capturée : ${err.message}`, { category: 'communication', stack: err.stack })
  process.exit(1)
})

process.on('unhandledRejection', (reason: unknown) => {
  log.emerg('Promesse rejetée non gérée', { category: 'communication', reason: String(reason) })
  process.exit(1)
})
