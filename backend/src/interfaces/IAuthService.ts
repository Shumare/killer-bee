import type { LoginRequestDTO, LoginResponseDTO } from '../dto/LoginRequestDTO'

export interface IAuthService {
  login(credentials: LoginRequestDTO): Promise<LoginResponseDTO>
  logout(): Promise<void>
}
