import { useState } from 'react'
import useFreezebes from '../../hooks/useFreezebes'
import useIngredients from '../../hooks/useIngredients'
import type { FreezebeDTO, CreateFreezebeDTO } from '../../dto/freezbe.dto'

const emptyForm: CreateFreezebeDTO = { nom: '', description: '', pUHT: 0, gamme: '', ingredientIds: [], grammage: 0 }

export default function FreezebePage() {
  const { freezebes, isLoading, hasError, create, update, remove } = useFreezebes()
  const { ingredients } = useIngredients()
  const [form, setForm] = useState<CreateFreezebeDTO>(emptyForm)
  const [editing, setEditing] = useState<FreezebeDTO | null>(null)
  const [search, setSearch] = useState('')
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

  function startEdit(item: FreezebeDTO) {
    setEditing(item)
    setForm({ nom: item.nom, description: item.description, pUHT: item.pUHT, gamme: item.gamme, ingredientIds: [...item.ingredientIds], grammage: item.grammage })
  }

  function cancelEdit() {
    setEditing(null)
    setForm(emptyForm)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nom.trim()) return
    setSubmitting(true)
    try {
      if (editing) {
        await update(editing.id, form)
        cancelEdit()
      } else {
        await create(form)
        setForm(emptyForm)
      }
    } catch (err) {
      console.error('[FreezebePage] Erreur soumission', err)
    } finally {
      setSubmitting(false)
    }
  }

  const displayed = search.trim()
    ? freezebes.filter((f) => f.nom.toLowerCase().includes(search.toLowerCase()) || f.gamme.toLowerCase().includes(search.toLowerCase()))
    : freezebes

  const inputStyle = { padding: '6px 10px', border: '1px solid #ccc', borderRadius: 4, width: '100%', boxSizing: 'border-box' as const }

  return (
    <div>
      <h2>Modèles Freezbe</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, maxWidth: 440 }}>
        <input
          placeholder="Rechercher par nom ou gamme..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ padding: '6px 12px', cursor: 'pointer' }}>
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 440, marginBottom: 32, padding: 16, border: '1px solid #e0e0e0', borderRadius: 6, background: editing ? '#fffbf0' : '#fafafa' }}>
        <strong style={{ fontSize: 14 }}>{editing ? `Modifier : ${editing.nom}` : 'Nouveau modèle'}</strong>
        <input placeholder="Nom" value={form.nom} onChange={(e) => set('nom', e.target.value)} style={inputStyle} />
        <textarea placeholder="Description" value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="Prix UHT (€)" type="number" min={0} step={0.01} value={form.pUHT} onChange={(e) => set('pUHT', parseFloat(e.target.value) || 0)} style={{ flex: 1, ...inputStyle }} />
          <input placeholder="Grammage (g)" type="number" min={0} value={form.grammage} onChange={(e) => set('grammage', parseInt(e.target.value) || 0)} style={{ flex: 1, ...inputStyle }} />
        </div>
        <input placeholder="Gamme" value={form.gamme} onChange={(e) => set('gamme', e.target.value)} style={inputStyle} />
        {ingredients.length > 0 && (
          <fieldset style={{ border: '1px solid #ccc', borderRadius: 4, padding: '8px 12px' }}>
            <legend style={{ fontSize: 13, color: '#555' }}>Ingrédients</legend>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ingredients.map((i) => (
                <label key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.ingredientIds.includes(i.id)} onChange={() => toggleIngredient(i.id)} />
                  {i.nom}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={submitting} style={{ padding: '8px 16px', cursor: 'pointer' }}>
            {submitting ? '...' : editing ? 'Mettre à jour' : '+ Ajouter'}
          </button>
          {editing && (
            <button type="button" onClick={cancelEdit} style={{ padding: '8px 16px', cursor: 'pointer', background: 'none', border: '1px solid #ccc', borderRadius: 4 }}>
              Annuler
            </button>
          )}
        </div>
      </form>

      {isLoading && <p style={{ color: '#666' }}>Chargement...</p>}
      {hasError && <p style={{ color: '#c00' }}>Erreur lors du chargement.</p>}
      {!isLoading && displayed.length === 0 && <p style={{ color: '#666' }}>Aucun résultat.</p>}

      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {displayed.map((f) => {
          const linked = ingredients.filter((i) => f.ingredientIds.includes(i.id))
          return (
            <li key={f.id} style={{ border: `1px solid ${editing?.id === f.id ? '#f0a500' : '#eee'}`, borderRadius: 6, padding: '10px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <strong>{f.nom}</strong>
                  <span style={{ marginLeft: 8, fontSize: 13, color: '#888' }}>{f.gamme}</span>
                  {f.description && <p style={{ margin: '4px 0 0', color: '#666', fontSize: 14 }}>{f.description}</p>}
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#555' }}>{f.pUHT.toFixed(2)} € — {f.grammage} g</p>
                  {linked.length > 0 && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#555' }}>Ingrédients : {linked.map((i) => i.nom).join(', ')}</p>}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => startEdit(f)} style={{ padding: '4px 10px', cursor: 'pointer', border: '1px solid #555', borderRadius: 4, background: 'none' }}>
                    Modifier
                  </button>
                  <button onClick={() => remove(f.id)} style={{ padding: '4px 10px', cursor: 'pointer', color: '#c00', border: '1px solid #c00', borderRadius: 4, background: 'none' }}>
                    Supprimer
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
