import { useState } from 'react'
import useFreezebes from '../../hooks/useFreezebes'
import useIngredients from '../../hooks/useIngredients'
import type { FreezebeDTO, CreateFreezebeDTO } from '../../dto/freezbe.dto'
import { requiredString, positiveFloat, positiveInt, hasErrors, type FormErrors } from '../../utils/validate'

type Fields = 'nom' | 'description' | 'pUHT' | 'grammage' | 'gamme' | 'ingredientIds'

const emptyForm: CreateFreezebeDTO = { nom: '', description: '', pUHT: 0, gamme: '', ingredientIds: [], grammage: 0 }

function validate(form: CreateFreezebeDTO): FormErrors<Fields> {
  return {
    nom: requiredString(form.nom, 'Le nom') ?? undefined,
    gamme: requiredString(form.gamme, 'La gamme') ?? undefined,
    pUHT: positiveFloat(form.pUHT, 'Le prix UHT') ?? undefined,
    grammage: positiveInt(form.grammage, 'Le grammage') ?? undefined,
  }
}

export default function FreezebePage() {
  const { freezebes, isLoading, hasError, create, update, remove } = useFreezebes()
  const { ingredients } = useIngredients()
  const [form, setForm] = useState<CreateFreezebeDTO>(emptyForm)
  const [editing, setEditing] = useState<FreezebeDTO | null>(null)
  const [errors, setErrors] = useState<FormErrors<Fields>>({})
  const [search, setSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function set<K extends keyof CreateFreezebeDTO>(field: K, value: CreateFreezebeDTO[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field as Fields]) setErrors((prev) => ({ ...prev, [field]: undefined }))
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
      console.error('[FreezebePage] Erreur soumission', err)
    } finally {
      setSubmitting(false)
    }
  }

  const displayed = search.trim()
    ? freezebes.filter((f) => f.nom.toLowerCase().includes(search.toLowerCase()) || f.gamme.toLowerCase().includes(search.toLowerCase()))
    : freezebes

  return (
    <div>
      <h2 className="page-title">Modèles Freezbe</h2>
      <p className="page-description">Gère tes recettes et attribue les ingrédients nécessaires à chaque modèle.</p>

      <div className="search-row">
        <input
          className="input"
          placeholder="Rechercher par nom ou gamme..."
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
        <div className="form-heading">{editing ? `Modifier : ${editing.nom}` : 'Nouveau modèle'}</div>

        <div className="form-grid">
          <div className="form-field">
            <label className="label">Nom *</label>
            <input className="input" placeholder="Nom" value={form.nom} onChange={(e) => set('nom', e.target.value)} />
            {errors.nom && <p className="field-error">{errors.nom}</p>}
          </div>

          <div className="form-field">
            <label className="label">Description</label>
            <textarea className="textarea" placeholder="Description" value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} />
          </div>

          <div className="form-row">
            <div className="flex-half form-field">
              <label className="label">Prix UHT (€) *</label>
              <input
                className="input"
                placeholder="Prix UHT"
                type="number"
                min={0}
                step={0.01}
                value={form.pUHT || ''}
                onChange={(e) => set('pUHT', parseFloat(e.target.value) || 0)}
              />
              {errors.pUHT && <p className="field-error">{errors.pUHT}</p>}
            </div>
            <div className="flex-half form-field">
              <label className="label">Grammage (g) *</label>
              <input
                className="input"
                placeholder="Grammage"
                type="number"
                min={1}
                step={1}
                value={form.grammage || ''}
                onChange={(e) => set('grammage', Math.round(parseFloat(e.target.value)) || 0)}
              />
              {errors.grammage && <p className="field-error">{errors.grammage}</p>}
            </div>
          </div>

          <div className="form-field">
            <label className="label">Gamme *</label>
            <input className="input" placeholder="Gamme" value={form.gamme} onChange={(e) => set('gamme', e.target.value)} />
            {errors.gamme && <p className="field-error">{errors.gamme}</p>}
          </div>

          {ingredients.length > 0 && (
            <fieldset className="fieldset">
              <legend className="legend">Ingrédients</legend>
              <div className="ingredient-list">
                {ingredients.map((i) => (
                  <label key={i.id} className="checkbox-label">
                    <input type="checkbox" checked={form.ingredientIds.includes(i.id)} onChange={() => toggleIngredient(i.id)} />
                    {i.nom}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
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
        {displayed.map((f) => {
          const linked = ingredients.filter((i) => f.ingredientIds.includes(i.id))
          return (
            <li key={f.id} className={`card ${editing?.id === f.id ? 'active' : ''}`}>
              <div>
                <div className="card-title">
                  <strong>{f.nom}</strong>
                  <span className="card-subtitle">{f.gamme}</span>
                </div>
                {f.description && <p className="card-meta">{f.description}</p>}
                <p className="card-meta">{f.pUHT.toFixed(2)} € — {f.grammage} g</p>
                {linked.length > 0 && <p className="card-meta">Ingrédients : {linked.map((i) => i.nom).join(', ')}</p>}
              </div>

              <div className="card-actions">
                <button type="button" className="button-secondary button-small" onClick={() => startEdit(f)}>
                  Modifier
                </button>
                <button type="button" className="button-danger button-small" onClick={() => remove(f.id)}>
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
