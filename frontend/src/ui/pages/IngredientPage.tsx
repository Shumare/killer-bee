import { useState } from 'react'
import useIngredients from '../../hooks/useIngredients'
import type { CreateIngredientDTO } from '../../dto/ingredient.dto'

const emptyForm: CreateIngredientDTO = { nom: '', description: '' }

export default function IngredientPage() {
  const { ingredients, isLoading, hasError, create, remove } = useIngredients()
  const [form, setForm] = useState<CreateIngredientDTO>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  function set(field: keyof CreateIngredientDTO, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nom.trim()) return
    setSubmitting(true)
    try {
      await create(form)
      setForm(emptyForm)
    } catch (err) {
      console.error('[IngredientPage] Erreur création', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h2>Ingrédients</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400, marginBottom: 32 }}>
        <input
          placeholder="Nom"
          value={form.nom}
          onChange={(e) => set('nom', e.target.value)}
          style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: 4 }}
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
          style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: 4, resize: 'vertical' }}
        />
        <button type="submit" disabled={submitting} style={{ padding: '8px 16px', cursor: 'pointer', alignSelf: 'flex-start' }}>
          {submitting ? 'Ajout...' : '+ Ajouter'}
        </button>
      </form>

      {isLoading && <p style={{ color: '#666' }}>Chargement...</p>}
      {hasError && <p style={{ color: '#c00' }}>Erreur lors du chargement des ingrédients.</p>}

      {!isLoading && ingredients.length === 0 && (
        <p style={{ color: '#666' }}>Aucun ingrédient pour l'instant.</p>
      )}

      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ingredients.map((i) => (
          <li key={i.id} style={{ border: '1px solid #eee', borderRadius: 6, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{i.nom}</strong>
              {i.description && <p style={{ margin: '4px 0 0', color: '#666', fontSize: 14 }}>{i.description}</p>}
            </div>
            <button onClick={() => remove(i.id)} style={{ padding: '4px 10px', cursor: 'pointer', color: '#c00', border: '1px solid #c00', borderRadius: 4, background: 'none' }}>
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
