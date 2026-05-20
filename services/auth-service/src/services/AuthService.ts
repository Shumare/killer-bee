import type { LoginRequestDTO, LoginResponseDTO } from '../dto/LoginRequestDTO'
import { authenticateWithAD } from './ldap.service'
import { generateToken } from '../utils/generateToken'
import { log } from '../utils/logger'
import { logLoginAttempt, logLoginSuccess, logLoginFailure } from '../security/audit/audit.logger'

const ROLE_MAP: Record<string, { role: string; schema: string }> = {
  GRP_RD:   { role: 'rd',    schema: 'SCH_RD'   },
  GRP_TEST: { role: 'test',  schema: 'SCH_TEST'  },
  GRP_PROD: { role: 'prod',  schema: 'SCH_PROD'  },
  GRP_DBA:  { role: 'admin', schema: 'dbo'       },
}

export const AuthService = {
  async login(credentials: LoginRequestDTO): Promise<LoginResponseDTO> {
    log.debug('AuthService.login — début', { category: 'operation', username: credentials.username })
    logLoginAttempt(credentials.username)

    const adUser = await authenticateWithAD(credentials.username, credentials.password)
    if (!adUser) {
      log.warn('Tentative de connexion AD échouée', { category: 'audit', username: credentials.username })
      logLoginFailure(credentials.username, 'identifiants invalides')
      throw Object.assign(new Error('Identifiants invalides'), { status: 401 })
    }

    const groupKey = Object.keys(ROLE_MAP).find((g) =>
      adUser.memberOf.some((m) => m.includes(g))
    )
    const mapped = groupKey ? ROLE_MAP[groupKey] : { role: 'user', schema: 'SCH_USR' }

    log.info('Authentification AD réussie — génération du token', { category: 'audit', username: adUser.sAMAccountName, role: mapped.role })
    logLoginSuccess(adUser.sAMAccountName)

    const token = generateToken({
      sub:       adUser.sAMAccountName,
      full_name: adUser.displayName,
      email:     adUser.mail,
      role:      mapped.role,
      schema:    mapped.schema,
    })

    return { access_token: token, full_name: adUser.displayName, username: adUser.sAMAccountName }
  },

  async logout(): Promise<void> {
    log.debug('AuthService.logout — session terminée', { category: 'operation' })
  },
}
