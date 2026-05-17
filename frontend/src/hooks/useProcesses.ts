import { useEffect, useState } from 'react'
import { normalizeSuccess, normalizeFailure, normalizePending, type NormalizedResponse } from '@killer-bee/middleware-local'
import { getAllProcesses, createProcess, updateProcess, deleteProcess } from '../api/process.api'
import type { ProcessDTO, CreateProcessDTO, UpdateProcessDTO } from '../dto/process.dto'

export default function useProcesses() {
  const [processes, setProcesses] = useState<ProcessDTO[]>([])
  const [state, setState] = useState<NormalizedResponse<ProcessDTO[]>>(normalizePending())

  async function load() {
    setState(normalizePending())
    try {
      const data = await getAllProcesses()
      setProcesses(data)
      setState(normalizeSuccess(data))
    } catch (err) {
      console.error('[useProcesses] Erreur lors du chargement', err)
      setState(normalizeFailure((err as Error).message ?? 'Erreur de chargement'))
    }
  }

  async function create(body: CreateProcessDTO) {
    const created = await createProcess(body)
    setProcesses((prev) => [...prev, created])
    return created
  }

  async function update(id: number, body: UpdateProcessDTO) {
    const updated = await updateProcess(id, body)
    setProcesses((prev) => prev.map((p) => (p.id === id ? updated : p)))
    return updated
  }

  async function remove(id: number) {
    await deleteProcess(id)
    setProcesses((prev) => prev.filter((p) => p.id !== id))
  }

  useEffect(() => { load() }, [])

  return {
    processes,
    isLoading: state.status === 'pending',
    hasError: state.status === 'failure',
    errorMessage: state.error,
    create,
    update,
    remove,
    reload: load,
  }
}
