import { get, post, put, del } from './client'
import type { FreezebeDTO, CreateFreezebeDTO, UpdateFreezebeDTO } from '../dto/freezbe.dto'

export function getAllFreezebes(): Promise<FreezebeDTO[]> {
  return get<FreezebeDTO[]>('/api/freezbe')
}

export function getFreezebeById(id: number): Promise<FreezebeDTO> {
  return get<FreezebeDTO>(`/api/freezbe/${id}`)
}

export function createFreezebe(body: CreateFreezebeDTO): Promise<FreezebeDTO> {
  return post<FreezebeDTO>('/api/freezbe', body)
}

export function updateFreezebe(id: number, body: UpdateFreezebeDTO): Promise<FreezebeDTO> {
  return put<FreezebeDTO>(`/api/freezbe/${id}`, body)
}

export function searchFreezebes(nom: string): Promise<FreezebeDTO[]> {
  return get<FreezebeDTO[]>(`/api/freezbe/search?nom=${encodeURIComponent(nom)}`)
}

export function deleteFreezebe(id: number): Promise<void> {
  return del<void>(`/api/freezbe/${id}`)
}
