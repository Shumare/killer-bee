import { useState } from 'react'
import useFreezebes from '../../hooks/useFreezebes'
import useIngredients from '../../hooks/useIngredients'
import type { CreateFreezebeDTO } from '../../dto/freezbe.dto'

const emptyForm: CreateFreezebeDTO = {
  nom: '',
  description: '',
  pUHT: 0,
  gamme: '',
  ingredientIds: [],
  grammage: 0,
}

export default function FreezebePage() {
  const { freezebes, isLoading, hasError, create, remove } = useFreezebes()
  const { ingredients } = useIngredients()
  const [form, setForm] = useState<CreateFreezebeDTO>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  function set<K extends keyof CreateFreezebeDTO>(field: K, value: CreateFreezebeDTO[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleIngredient(id: number) {
    setForm((prev) => ({
      ...prev,
      ingredientIds: prev.ingredientIds.includes(id)
        ? prev.ingredientIds.filter((x) => x !== id)
        : [...prev.ingredientIds, id],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nom.trim()) return
    setSubmitting(true)
    try {
      await create(form)
      setForm(emptyForm)
    } catch (err) {
      console.error('[FreezebePage] Erreur création', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h2>Modèles Freezbe</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 440, marginBottom: 32 }}>
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
          rows={2}
          style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: 4, resize: 'vertical' }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="Prix UHT (€)"
            type="number"
            min={0}
            step={0.01}
            value={form.pUHT}
            onChange={(e) => set('pUHT', parseFloat(e.target.value) || 0)}
            style={{ flex: 1, padding: '6px 10px', border: '1px solid #ccc', borderRadius: 4 }}
          />
          <input
            placeholder="Grammage (g)"
            type="number"
            min={0}
            value={form.grammage}
            onChange={(e) => set('grammage', parseInt(e.target.value) || 0)}
            style={{ flex: 1, padding: '6px 10px', border: '1px solid #ccc', borderRadius: 4 }}
          />
        </div>
        <input
          placeholder="Gamme"
          value={form.gamme}
          onChange={(e) => set('gamme', e.target.value)}
          style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: 4 }}
        />
        {ingredients.length > 0 && (
          <fieldset style={{ border: '1px solid #ccc', borderRadius: 4, padding: '8px 12px' }}>
            <legend style={{ fontSize: 13, color: '#555' }}>Ingrédients</legend>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ingredients.map((i) => (
                <label key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.ingredientIds.includes(i.id)}
                    onChange={() => toggleIngredient(i.id)}
                  />
                  {i.nom}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <button type="submit" disabled={submitting} style={{ padding: '8px 16px', cursor: 'pointer', alignSelf: 'flex-start' }}>
          {submitting ? 'Ajout...' : '+ Ajouter'}
        </button>
      </form>

      {isLoading && <p style={{ color: '#666' }}>Chargement...</p>}
      {hasError && <p style={{ color: '#c00' }}>Erreur lors du chargement des modèles.</p>}

      {!isLoading && freezebes.length === 0 && (
        <p style={{ color: '#666' }}>Aucun modèle Freezbe pour l'instant.</p>
      )}

      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {freezebes.map((f) => {
          const linkedIngredients = ingredients.filter((i) => f.ingredientIds.includes(i.id))
          return (
            <li key={f.id} style={{ border: '1px solid #eee', borderRadius: 6, padding: '10px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <strong>{f.nom}</strong>
                  <span style={{ marginLeft: 8, fontSize: 13, color: '#888' }}>{f.gamme}</span>
                  {f.description && <p style={{ margin: '4px 0 0', color: '#666', fontSize: 14 }}>{f.description}</p>}
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#555' }}>
                    {f.pUHT.toFixed(2)} € — {f.grammage} g
                  </p>
                  {linkedIngredients.length > 0 && (
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: '#555' }}>
                      Ingrédients : {linkedIngredients.map((i) => i.nom).join(', ')}
                    </p>
                  )}
                </div>
                <button onClick={() => remove(f.id)} style={{ padding: '4px 10px', cursor: 'pointer', color: '#c00', border: '1px solid #c00', borderRadius: 4, background: 'none' }}>
                  Supprimer
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
