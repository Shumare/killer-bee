import { useState } from 'react'
import useProcesses from '../../hooks/useProcesses'
import useFreezebes from '../../hooks/useFreezebes'
import type { ProcessDTO, CreateProcessDTO } from '../../dto/process.dto'

const emptyForm: CreateProcessDTO = { nom: '', description: '', freezbeId: 0, etapes: [''], validationsDeTests: [''], descriptionsDeControle: [''] }

export default function ProcessPage() {
  const { processes, isLoading, hasError, create, update, remove } = useProcesses()
  const { freezebes } = useFreezebes()
  const [form, setForm] = useState<CreateProcessDTO>(emptyForm)
  const [editing, setEditing] = useState<ProcessDTO | null>(null)
  const [search, setSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function setField<K extends keyof CreateProcessDTO>(field: K, value: CreateProcessDTO[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function setListItem(field: 'etapes' | 'validationsDeTests' | 'descriptionsDeControle', index: number, value: string) {
    setForm((prev) => { const updated = [...prev[field]]; updated[index] = value; return { ...prev, [field]: updated } })
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
  }

  function cancelEdit() {
    setEditing(null)
    setForm(emptyForm)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nom.trim() || !form.freezbeId) return
    setSubmitting(true)
    const payload = {
      ...form,
      etapes: form.etapes.filter((s) => s.trim()),
      validationsDeTests: form.validationsDeTests.filter((s) => s.trim()),
      descriptionsDeControle: form.descriptionsDeControle.filter((s) => s.trim()),
    }
    try {
      if (editing) {
        await update(editing.id, payload)
        cancelEdit()
      } else {
        await create(payload)
        setForm(emptyForm)
      }
    } catch (err) {
      console.error('[ProcessPage] Erreur soumission', err)
    } finally {
      setSubmitting(false)
    }
  }

  const displayed = search.trim()
    ? processes.filter((p) => p.nom.toLowerCase().includes(search.toLowerCase()))
    : processes

  const inputStyle = { padding: '6px 10px', border: '1px solid #ccc', borderRadius: 4, width: '100%', boxSizing: 'border-box' as const }
  const labelStyle = { fontSize: 13, color: '#555', marginBottom: 2, display: 'block' as const }

  function ListEditor({ field, label }: { field: 'etapes' | 'validationsDeTests' | 'descriptionsDeControle'; label: string }) {
    return (
      <div>
        <span style={labelStyle}>{label}</span>
        {form[field].map((val, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
            <input value={val} onChange={(e) => setListItem(field, idx, e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            {form[field].length > 1 && (
              <button type="button" onClick={() => removeListItem(field, idx)} style={{ padding: '4px 8px', cursor: 'pointer', color: '#c00', border: '1px solid #c00', borderRadius: 4, background: 'none' }}>×</button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => addListItem(field)} style={{ fontSize: 13, padding: '2px 8px', cursor: 'pointer' }}>+ Ajouter</button>
      </div>
    )
  }

  return (
    <div>
      <h2>Procédés de fabrication</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, maxWidth: 480 }}>
        <input
          placeholder="Rechercher par nom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ padding: '6px 12px', cursor: 'pointer' }}>✕</button>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 480, marginBottom: 32, padding: 16, border: '1px solid #e0e0e0', borderRadius: 6, background: editing ? '#fffbf0' : '#fafafa' }}>
        <strong style={{ fontSize: 14 }}>{editing ? `Modifier : ${editing.nom}` : 'Nouveau procédé'}</strong>
        <input placeholder="Nom" value={form.nom} onChange={(e) => setField('nom', e.target.value)} style={inputStyle} />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setField('description', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
        <div>
          <span style={labelStyle}>Modèle Freezbe associé</span>
          <select value={form.freezbeId} onChange={(e) => setField('freezbeId', parseInt(e.target.value) || 0)} style={inputStyle}>
            <option value={0}>— Choisir un modèle —</option>
            {freezebes.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
          </select>
        </div>
        <ListEditor field="etapes" label="Étapes" />
        <ListEditor field="validationsDeTests" label="Validations de tests" />
        <ListEditor field="descriptionsDeControle" label="Descriptions de contrôle" />
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
        {displayed.map((p) => {
          const freezbe = freezebes.find((f) => f.id === p.freezbeId)
          return (
            <li key={p.id} style={{ border: `1px solid ${editing?.id === p.id ? '#f0a500' : '#eee'}`, borderRadius: 6, padding: '10px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <strong>{p.nom}</strong>
                  {freezbe && <span style={{ marginLeft: 8, fontSize: 13, color: '#888' }}>({freezbe.nom})</span>}
                  {p.description && <p style={{ margin: '4px 0 0', color: '#666', fontSize: 14 }}>{p.description}</p>}
                  {p.etapes.length > 0 && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#555' }}>Étapes : {p.etapes.join(' → ')}</p>}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => startEdit(p)} style={{ padding: '4px 10px', cursor: 'pointer', border: '1px solid #555', borderRadius: 4, background: 'none' }}>
                    Modifier
                  </button>
                  <button onClick={() => remove(p.id)} style={{ padding: '4px 10px', cursor: 'pointer', color: '#c00', border: '1px solid #c00', borderRadius: 4, background: 'none' }}>
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
