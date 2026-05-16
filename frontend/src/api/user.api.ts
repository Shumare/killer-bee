import type { UserResponseDTO, UpdateProfileDTO } from '../dto/user.dto'
import { get, put } from './client'

export function getUser(id: number): Promise<UserResponseDTO> {
  return get<UserResponseDTO>(`/api/users/${id}`)
}

export function updateProfile(id: number, data: UpdateProfileDTO): Promise<UserResponseDTO> {
  return put<UserResponseDTO>(`/api/users/${id}`, data)
}
