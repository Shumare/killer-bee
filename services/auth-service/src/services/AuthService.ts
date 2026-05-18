import type { LoginRequestDTO, LoginResponseDTO } from '../dto/LoginRequestDTO'
import { mapUserToLoginResponse } from '../mappers/auth.mapper'
import { UserRepository } from '../repositories/UserRepository'
import { comparePassword } from '../utils/hashPassword'
import { generateToken } from '../utils/generateToken'
import { log } from '../utils/logger'
import { logLoginAttempt, logLoginSuccess, logLoginFailure } from '../security/audit/audit.logger'

export const AuthService = {
  async login(credentials: LoginRequestDTO): Promise<LoginResponseDTO> {
    log.debug('AuthService.login — début', { category: 'operation', email: credentials.email })
    logLoginAttempt(credentials.email)

    log.debug('Recherche de l\'utilisateur en base', { category: 'operation', email: credentials.email })
    const user = await UserRepository.findByEmail(credentials.email)
    if (!user) {
      log.warn('Tentative de connexion — utilisateur introuvable', { category: 'audit', email: credentials.email })
      logLoginFailure(credentials.email, 'utilisateur introuvable')
      throw new Error('Identifiants invalides')
    }

    log.debug('Vérification du mot de passe', { category: 'operation' })
    const isValid = await comparePassword(credentials.password, user.password)
    if (!isValid) {
      log.warn('Tentative de connexion — mot de passe incorrect', { category: 'audit', email: credentials.email })
      logLoginFailure(credentials.email, 'mot de passe incorrect')
      throw new Error('Identifiants invalides')
    }

    log.info('Authentification réussie — génération du token JWT', { category: 'audit', userId: user.id })
    logLoginSuccess(user.id)
    const token = generateToken({ userId: user.id })
    return mapUserToLoginResponse(user, token)
  },

  async logout(): Promise<void> {
    log.debug('AuthService.logout — session terminée', { category: 'operation' })
  },
}
