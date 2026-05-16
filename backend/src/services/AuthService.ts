import type { LoginRequestDTO, LoginResponseDTO } from '../dto/LoginRequestDTO'
import { mapUserToLoginResponse } from '../mappers/auth.mapper'
import { UserRepository } from '../repositories/UserRepository'
import { comparePassword } from '../utils/hashPassword'
import { generateToken } from '../utils/generateToken'
import { logLoginAttempt, logLoginSuccess, logLoginFailure } from '../security/audit/audit.logger'

export const AuthService = {
  async login(credentials: LoginRequestDTO): Promise<LoginResponseDTO> {
    logLoginAttempt(credentials.email)

    const user = await UserRepository.findByEmail(credentials.email)
    if (!user) {
      logLoginFailure(credentials.email, 'utilisateur introuvable')
      throw new Error('Identifiants invalides')
    }

    const isValid = await comparePassword(credentials.password, user.password)
    if (!isValid) {
      logLoginFailure(credentials.email, 'mot de passe incorrect')
      throw new Error('Identifiants invalides')
    }

    logLoginSuccess(user.id)
    const token = generateToken({ userId: user.id })
    return mapUserToLoginResponse(user, token)
  },

  async logout(): Promise<void> {},
}
