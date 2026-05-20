import type { UserResponseDTO, UpdateProfileDTO } from '../dto/user.dto'
import { get, put } from './client'

export function getUser(id: string): Promise<UserResponseDTO> {
  return get<UserResponseDTO>(`/api/users/${id}`)
}

export function updateProfile(id: string, data: UpdateProfileDTO): Promise<UserResponseDTO> {
  return put<UserResponseDTO>(`/api/users/${id}`, data)
}
