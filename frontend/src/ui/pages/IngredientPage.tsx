import { useState } from 'react'
import useIngredients from '../../hooks/useIngredients'
import type { IngredientDTO, CreateIngredientDTO } from '../../dto/ingredient.dto'
import { requiredString, hasErrors, type FormErrors } from '../../utils/validate'

type Fields = 'nom' | 'description'

const emptyForm: CreateIngredientDTO = { nom: '', description: '' }

function validate(form: CreateIngredientDTO): FormErrors<Fields> {
  return {
    nom: requiredString(form.nom, 'Le nom') ?? undefined,
  }
}

const errorStyle = { color: '#c00', fontSize: 12, marginTop: 2 }
const inputStyle = (hasError: boolean): React.CSSProperties => ({
  padding: '6px 10px',
  border: `1px solid ${hasError ? '#c00' : '#ccc'}`,
  borderRadius: 4,
  width: '100%',
  boxSizing: 'border-box',
})

export default function IngredientPage() {
  const { ingredients, isLoading, hasError, create, update, remove } = useIngredients()
  const [form, setForm] = useState<CreateIngredientDTO>(emptyForm)
  const [editing, setEditing] = useState<IngredientDTO | null>(null)
  const [errors, setErrors] = useState<FormErrors<Fields>>({})
  const [search, setSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function set(field: keyof CreateIngredientDTO, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field as Fields]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function startEdit(item: IngredientDTO) {
    setEditing(item)
    setForm({ nom: item.nom, description: item.description })
    setErrors({})
  }

  function cancelEdit() {
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(form)
    if (hasErrors(errs)) { setErrors(errs); return }
    setSubmitting(true)
    try {
      if (editing) { await update(editing.id, form); cancelEdit() }
      else { await create(form); setForm(emptyForm) }
    } catch (err) {
      console.error('[IngredientPage] Erreur soumission', err)
    } finally {
      setSubmitting(false)
    }
  }

  const displayed = search.trim()
    ? ingredients.filter((i) => i.nom.toLowerCase().includes(search.toLowerCase()))
    : ingredients

  return (
    <div>
      <h2>Ingrédients</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, maxWidth: 400 }}>
        <input
          placeholder="Rechercher par nom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputStyle(false)}
        />
        {search && <button onClick={() => setSearch('')} style={{ padding: '6px 12px', cursor: 'pointer' }}>✕</button>}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 400, marginBottom: 32, padding: 16, border: '1px solid #e0e0e0', borderRadius: 6, background: editing ? '#fffbf0' : '#fafafa' }}>
        <strong style={{ fontSize: 14 }}>{editing ? `Modifier : ${editing.nom}` : 'Nouvel ingrédient'}</strong>

        <div>
          <input
            placeholder="Nom *"
            value={form.nom}
            onChange={(e) => set('nom', e.target.value)}
            style={inputStyle(!!errors.nom)}
          />
          {errors.nom && <p style={errorStyle}>{errors.nom}</p>}
        </div>

        <div>
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            style={{ ...inputStyle(false), resize: 'vertical' }}
          />
        </div>

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
        {displayed.map((i) => (
          <li key={i.id} style={{ border: `1px solid ${editing?.id === i.id ? '#f0a500' : '#eee'}`, borderRadius: 6, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{i.nom}</strong>
              {i.description && <p style={{ margin: '4px 0 0', color: '#666', fontSize: 14 }}>{i.description}</p>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => startEdit(i)} style={{ padding: '4px 10px', cursor: 'pointer', border: '1px solid #555', borderRadius: 4, background: 'none' }}>Modifier</button>
              <button onClick={() => remove(i.id)} style={{ padding: '4px 10px', cursor: 'pointer', color: '#c00', border: '1px solid #c00', borderRadius: 4, background: 'none' }}>Supprimer</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
