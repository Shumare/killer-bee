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
      <h2 className="page-title">Ingrédients</h2>
      <p className="page-description">Ajoute et organise les ingrédients de tes modèles Freezbe.</p>

      <div className="search-row">
        <input
          className="input"
          placeholder="Rechercher par nom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button type="button" className="button-secondary button-small" onClick={() => setSearch('')}>
            ✕
          </button>
        )}
      </div>

      <form className="form-panel" onSubmit={handleSubmit}>
        <div className="form-heading">{editing ? `Modifier : ${editing.nom}` : 'Nouvel ingrédient'}</div>

        <div className="form-grid">
          <div className="form-field">
            <label className="label">Nom *</label>
            <input className="input" placeholder="Nom" value={form.nom} onChange={(e) => set('nom', e.target.value)} />
            {errors.nom && <p className="field-error">{errors.nom}</p>}
          </div>

          <div className="form-field">
            <label className="label">Description</label>
            <textarea className="textarea" placeholder="Description" value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} />
          </div>
        </div>

        <div className="actions-row">
          <button type="submit" className="button-primary">
            {submitting ? '...' : editing ? 'Mettre à jour' : '+ Ajouter'}
          </button>
          {editing && (
            <button type="button" className="button-secondary" onClick={cancelEdit}>
              Annuler
            </button>
          )}
        </div>
      </form>

      {isLoading && <p className="section-note">Chargement...</p>}
      {hasError && <p className="field-error">Erreur lors du chargement.</p>}
      {!isLoading && displayed.length === 0 && <p className="section-note">Aucun résultat.</p>}

      <ul className="card-list">
        {displayed.map((i) => (
          <li key={i.id} className={`card ${editing?.id === i.id ? 'active' : ''}`}>
            <div>
              <div className="card-title">
                <strong>{i.nom}</strong>
              </div>
              {i.description && <p className="card-meta">{i.description}</p>}
            </div>

            <div className="card-actions">
              <button type="button" className="button-secondary button-small" onClick={() => startEdit(i)}>
                Modifier
              </button>
              <button type="button" className="button-danger button-small" onClick={() => remove(i.id)}>
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
