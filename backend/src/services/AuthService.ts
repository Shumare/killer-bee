import type { LoginRequestDTO, LoginResponseDTO } from '../dto/LoginRequestDTO'
import { mapUserToLoginResponse } from '../mappers/auth.mapper'
import { UserRepository } from '../repositories/UserRepository'
import { comparePassword } from '../utils/hashPassword'
import { generateToken } from '../utils/generateToken'

export const AuthService = {
  async login(credentials: LoginRequestDTO): Promise<LoginResponseDTO> {
    const user = await UserRepository.findByEmail(credentials.email)
    if (!user) throw new Error('Utilisateur introuvable')

    const isValid = await comparePassword(credentials.password, user.password)
    if (!isValid) throw new Error('Mot de passe incorrect')

    const token = generateToken({ userId: user.id })
    return mapUserToLoginResponse(user, token)
  },

  async logout(): Promise<void> {
    // Invalidation du token à implémenter avec la base de données
  },
}
