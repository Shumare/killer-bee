import { useEffect, useState } from 'react'
import {
  getAllIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from '../api/ingredient.api'
import type { IngredientDTO, CreateIngredientDTO, UpdateIngredientDTO } from '../dto/ingredient.dto'

export default function useIngredients() {
  const [ingredients, setIngredients] = useState<IngredientDTO[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  async function load() {
    setIsLoading(true)
    setHasError(false)
    try {
      const data = await getAllIngredients()
      setIngredients(data)
    } catch (err) {
      console.error('[useIngredients] Erreur lors du chargement', err)
      setHasError(true)
    } finally {
      setIsLoading(false)
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

  return { ingredients, isLoading, hasError, create, update, remove, reload: load }
}
