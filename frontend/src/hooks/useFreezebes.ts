import { useEffect, useState } from 'react'
import {
  getAllFreezebes,
  createFreezebe,
  updateFreezebe,
  deleteFreezebe,
} from '../api/freezbe.api'
import type { FreezebeDTO, CreateFreezebeDTO, UpdateFreezebeDTO } from '../dto/freezbe.dto'

export default function useFreezebes() {
  const [freezebes, setFreezebes] = useState<FreezebeDTO[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  async function load() {
    setIsLoading(true)
    setHasError(false)
    try {
      const data = await getAllFreezebes()
      setFreezebes(data)
    } catch (err) {
      console.error('[useFreezebes] Erreur lors du chargement', err)
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  async function create(body: CreateFreezebeDTO) {
    const created = await createFreezebe(body)
    setFreezebes((prev) => [...prev, created])
    return created
  }

  async function update(id: number, body: UpdateFreezebeDTO) {
    const updated = await updateFreezebe(id, body)
    setFreezebes((prev) => prev.map((f) => (f.id === id ? updated : f)))
    return updated
  }

  async function remove(id: number) {
    await deleteFreezebe(id)
    setFreezebes((prev) => prev.filter((f) => f.id !== id))
  }

  useEffect(() => { load() }, [])

  return { freezebes, isLoading, hasError, create, update, remove, reload: load }
}
