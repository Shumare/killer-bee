import { useEffect, useState } from 'react'
import { normalizeSuccess, normalizeFailure, normalizePending, type NormalizedResponse } from '@killer-bee/middleware-local'
import { getAllFreezebes, createFreezebe, updateFreezebe, deleteFreezebe } from '../api/freezbe.api'
import type { FreezebeDTO, CreateFreezebeDTO, UpdateFreezebeDTO } from '../dto/freezbe.dto'

export default function useFreezebes() {
  const [freezebes, setFreezebes] = useState<FreezebeDTO[]>([])
  const [state, setState] = useState<NormalizedResponse<FreezebeDTO[] | null>>(normalizePending())

  async function load() {
    setState(normalizePending())
    try {
      const data = await getAllFreezebes()
      setFreezebes(data)
      setState(normalizeSuccess(data))
    } catch (err) {
      console.error('[useFreezebes] Erreur lors du chargement', err)
      setState(normalizeFailure((err as Error).message ?? 'Erreur de chargement'))
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

  return {
    freezebes,
    isLoading: state.status === 'pending',
    hasError: state.status === 'failure',
    errorMessage: state.error,
    create,
    update,
    remove,
    reload: load,
  }
}
