import { useEffect, useState } from 'react'
import { normalizeSuccess, normalizeFailure, normalizePending, type NormalizedResponse } from '@killer-bee/middleware-local'
import { getAllIngredients, createIngredient, updateIngredient, deleteIngredient } from '../api/ingredient.api'
import type { IngredientDTO, CreateIngredientDTO, UpdateIngredientDTO } from '../dto/ingredient.dto'

export default function useIngredients() {
  const [ingredients, setIngredients] = useState<IngredientDTO[]>([])
  const [state, setState] = useState<NormalizedResponse<IngredientDTO[] | null>>(normalizePending())

  async function load() {
    setState(normalizePending())
    try {
      const data = await getAllIngredients()
      setIngredients(data)
      setState(normalizeSuccess(data))
    } catch (err) {
      console.error('[useIngredients] Erreur lors du chargement', err)
      setState(normalizeFailure((err as Error).message ?? 'Erreur de chargement'))
    }
  }

  async function create(body: CreateIngredientDTO) {
    const created = await createIngredient(body)
    setIngredients((prev) => [...prev, created])
    return created
  }

  async function update(id: number, body: UpdateIngredientDTO) {
    const updated = await updateIngredient(id, body)
    setIngredients((prev) => prev.map((i) => (i.id === id ? updated : i)))
    return updated
  }

  async function remove(id: number) {
    await deleteIngredient(id)
    setIngredients((prev) => prev.filter((i) => i.id !== id))
  }

  useEffect(() => { load() }, [])

  return {
    ingredients,
    isLoading: state.status === 'pending',
    hasError: state.status === 'failure',
    errorMessage: state.error,
    create,
    update,
    remove,
    reload: load,
  }
}
