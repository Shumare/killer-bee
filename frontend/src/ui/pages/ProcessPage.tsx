import { useState } from 'react'
import useProcesses from '../../hooks/useProcesses'
import useFreezebes from '../../hooks/useFreezebes'
import type { ProcessDTO, CreateProcessDTO } from '../../dto/process.dto'
import { requiredString, selectedId, nonEmptyList, hasErrors, type FormErrors } from '../../utils/validate'

type Fields = 'nom' | 'description' | 'freezbeId' | 'etapes' | 'validationsDeTests' | 'descriptionsDeControle'

const emptyForm: CreateProcessDTO = { nom: '', description: '', freezbeId: 0, etapes: [''], validationsDeTests: [''], descriptionsDeControle: [''] }

function validate(form: CreateProcessDTO): FormErrors<Fields> {
  return {
    nom: requiredString(form.nom, 'Le nom') ?? undefined,
    freezbeId: selectedId(form.freezbeId, 'un modèle Freezbe') ?? undefined,
    etapes: nonEmptyList(form.etapes, 'Étapes') ?? undefined,
  }
}

export default function ProcessPage() {
  const { processes, isLoading, hasError, create, update, remove } = useProcesses()
  const { freezebes } = useFreezebes()
  const [form, setForm] = useState<CreateProcessDTO>(emptyForm)
  const [editing, setEditing] = useState<ProcessDTO | null>(null)
  const [errors, setErrors] = useState<FormErrors<Fields>>({})
  const [search, setSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function setField<K extends keyof CreateProcessDTO>(field: K, value: CreateProcessDTO[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field as Fields]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function setListItem(field: 'etapes' | 'validationsDeTests' | 'descriptionsDeControle', index: number, value: string) {
    setForm((prev) => { const updated = [...prev[field]]; updated[index] = value; return { ...prev, [field]: updated } })
    if (field === 'etapes' && errors.etapes) setErrors((prev) => ({ ...prev, etapes: undefined }))
  }

  function addListItem(field: 'etapes' | 'validationsDeTests' | 'descriptionsDeControle') {
    setForm((prev) => ({ ...prev, [field]: [...prev[field], ''] }))
  }

  function removeListItem(field: 'etapes' | 'validationsDeTests' | 'descriptionsDeControle', index: number) {
    setForm((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }))
  }

  function startEdit(item: ProcessDTO) {
    setEditing(item)
    setForm({
      nom: item.nom,
      description: item.description,
      freezbeId: item.freezbeId,
      etapes: item.etapes.length ? [...item.etapes] : [''],
      validationsDeTests: item.validationsDeTests.length ? [...item.validationsDeTests] : [''],
      descriptionsDeControle: item.descriptionsDeControle.length ? [...item.descriptionsDeControle] : [''],
    })
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
    const payload = {
      ...form,
      etapes: form.etapes.filter((s) => s.trim()),
      validationsDeTests: form.validationsDeTests.filter((s) => s.trim()),
      descriptionsDeControle: form.descriptionsDeControle.filter((s) => s.trim()),
    }
    try {
      if (editing) { await update(editing.id, payload); cancelEdit() }
      else { await create(payload); setForm(emptyForm) }
    } catch (err) {
      console.error('[ProcessPage] Erreur soumission', err)
    } finally {
      setSubmitting(false)
    }
  }

  const displayed = search.trim()
    ? processes.filter((p) => p.nom.toLowerCase().includes(search.toLowerCase()))
    : processes

  function ListEditor({ field, label }: { field: 'etapes' | 'validationsDeTests' | 'descriptionsDeControle'; label: string }) {
    const hasListError = field === 'etapes' && !!errors.etapes
    return (
      <div className="form-field">
        <label className="label">{label}{field === 'etapes' ? ' *' : ''}</label>
        {form[field].map((val, idx) => (
          <div key={idx} className="form-row">
            <input
              className="input"
              value={val}
              onChange={(e) => setListItem(field, idx, e.target.value)}
              placeholder={`${label} ${idx + 1}`}
            />
            {form[field].length > 1 && (
              <button type="button" className="button-danger button-small" onClick={() => removeListItem(field, idx)}>
                ×
              </button>
            )}
          </div>
        ))}
        {hasListError && <p className="field-error">{errors.etapes}</p>}
        <button type="button" className="button-secondary button-small" onClick={() => addListItem(field)}>
          + Ajouter
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="page-title">Procédés de fabrication</h2>
      <p className="page-description">Crée des procédures complètes avec étapes, validations et contrôles.</p>

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
        <div className="form-heading">{editing ? `Modifier : ${editing.nom}` : 'Nouveau procédé'}</div>

        <div className="form-grid">
          <div className="form-field">
            <label className="label">Nom *</label>
            <input className="input" placeholder="Nom" value={form.nom} onChange={(e) => setField('nom', e.target.value)} />
            {errors.nom && <p className="field-error">{errors.nom}</p>}
          </div>

          <div className="form-field">
            <label className="label">Description</label>
            <textarea className="textarea" placeholder="Description" value={form.description} onChange={(e) => setField('description', e.target.value)} rows={2} />
          </div>

          <div className="form-field">
            <label className="label">Modèle Freezbe *</label>
            <select className="select" value={form.freezbeId} onChange={(e) => setField('freezbeId', parseInt(e.target.value) || 0)}>
              <option value={0}>— Choisir un modèle —</option>
              {freezebes.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
            </select>
            {errors.freezbeId && <p className="field-error">{errors.freezbeId}</p>}
          </div>

          <ListEditor field="etapes" label="Étapes" />
          <ListEditor field="validationsDeTests" label="Validations de tests" />
          <ListEditor field="descriptionsDeControle" label="Descriptions de contrôle" />
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
        {displayed.map((p) => {
          const freezbe = freezebes.find((f) => f.id === p.freezbeId)
          return (
            <li key={p.id} className={`card ${editing?.id === p.id ? 'active' : ''}`}>
              <div>
                <div className="card-title">
                  <strong>{p.nom}</strong>
                  {freezbe && <span className="card-subtitle">({freezbe.nom})</span>}
                </div>
                {p.description && <p className="card-meta">{p.description}</p>}
                {p.etapes.length > 0 && <p className="card-meta">Étapes : {p.etapes.join(' → ')}</p>}
              </div>

              <div className="card-actions">
                <button type="button" className="button-secondary button-small" onClick={() => startEdit(p)}>
                  Modifier
                </button>
                <button type="button" className="button-danger button-small" onClick={() => remove(p.id)}>
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
