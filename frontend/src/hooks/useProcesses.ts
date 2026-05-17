import { useEffect, useState } from 'react'
import {
  getAllProcesses,
  createProcess,
  updateProcess,
  deleteProcess,
} from '../api/process.api'
import type { ProcessDTO, CreateProcessDTO, UpdateProcessDTO } from '../dto/process.dto'

export default function useProcesses() {
  const [processes, setProcesses] = useState<ProcessDTO[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  async function load() {
    setIsLoading(true)
    setHasError(false)
    try {
      const data = await getAllProcesses()
      setProcesses(data)
    } catch (err) {
      console.error('[useProcesses] Erreur lors du chargement', err)
      setHasError(true)
    } finally {
      setIsLoading(false)
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

  return { processes, isLoading, hasError, create, update, remove, reload: load }
}
