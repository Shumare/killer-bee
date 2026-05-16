import { get, post, put, del } from './client'
import type { ProcessDTO, CreateProcessDTO, UpdateProcessDTO } from '../dto/process.dto'

export function getAllProcesses(): Promise<ProcessDTO[]> {
  return get<ProcessDTO[]>('/api/processes')
}

export function getProcessById(id: number): Promise<ProcessDTO> {
  return get<ProcessDTO>(`/api/processes/${id}`)
}

export function createProcess(body: CreateProcessDTO): Promise<ProcessDTO> {
  return post<ProcessDTO>('/api/processes', body)
}

export function updateProcess(id: number, body: UpdateProcessDTO): Promise<ProcessDTO> {
  return put<ProcessDTO>(`/api/processes/${id}`, body)
}

export function deleteProcess(id: number): Promise<void> {
  return del<void>(`/api/processes/${id}`)
}
