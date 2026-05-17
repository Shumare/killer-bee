import { env } from './config/env'
import { createServer } from './config/server'
import { logConnection } from './utils/logger'

const app = createServer()

app.listen(env.PORT, () => {
  logConnection(`Serveur démarré sur le port ${env.PORT}`, { env: env.NODE_ENV })
})
