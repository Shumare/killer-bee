import type { LoginRequestDTO, LoginResponseDTO } from '../dto/auth.dto'
import { post } from './client'

export function login(credentials: LoginRequestDTO): Promise<LoginResponseDTO> {
  return post<LoginResponseDTO>('/api/auth/login', credentials)
}

export function logout(): Promise<void> {
  return post<void>('/api/auth/logout', {})
}
