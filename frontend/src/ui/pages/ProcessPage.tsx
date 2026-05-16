import { useState } from 'react'
import useProcesses from '../../hooks/useProcesses'
import useFreezebes from '../../hooks/useFreezebes'
import type { CreateProcessDTO } from '../../dto/process.dto'

const emptyForm: CreateProcessDTO = {
  nom: '',
  description: '',
  freezbeId: 0,
  etapes: [''],
  validationsDeTests: [''],
  descriptionsDeControle: [''],
}

export default function ProcessPage() {
  const { processes, isLoading, hasError, create, remove } = useProcesses()
  const { freezebes } = useFreezebes()
  const [form, setForm] = useState<CreateProcessDTO>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  function setField<K extends keyof CreateProcessDTO>(field: K, value: CreateProcessDTO[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function setListItem(field: 'etapes' | 'validationsDeTests' | 'descriptionsDeControle', index: number, value: string) {
    setForm((prev) => {
      const updated = [...prev[field]]
      updated[index] = value
      return { ...prev, [field]: updated }
    })
  }

  function addListItem(field: 'etapes' | 'validationsDeTests' | 'descriptionsDeControle') {
    setForm((prev) => ({ ...prev, [field]: [...prev[field], ''] }))
  }

  function removeListItem(field: 'etapes' | 'validationsDeTests' | 'descriptionsDeControle', index: number) {
    setForm((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nom.trim() || !form.freezbeId) return
    setSubmitting(true)
    try {
      await create({
        ...form,
        etapes: form.etapes.filter((s) => s.trim()),
        validationsDeTests: form.validationsDeTests.filter((s) => s.trim()),
        descriptionsDeControle: form.descriptionsDeControle.filter((s) => s.trim()),
      })
      setForm(emptyForm)
    } catch (err) {
      console.error('[ProcessPage] Erreur création', err)
    } finally {
      setSubmitting(false)
    }
  }

  const labelStyle = { fontSize: 13, color: '#555', marginBottom: 2 }
  const inputStyle = { padding: '6px 10px', border: '1px solid #ccc', borderRadius: 4, width: '100%', boxSizing: 'border-box' as const }

  function ListEditor({ field, label }: { field: 'etapes' | 'validationsDeTests' | 'descriptionsDeControle'; label: string }) {
    return (
      <div>
        <p style={labelStyle}>{label}</p>
        {form[field].map((val, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
            <input
              value={val}
              onChange={(e) => setListItem(field, idx, e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
            {form[field].length > 1 && (
              <button type="button" onClick={() => removeListItem(field, idx)} style={{ padding: '4px 8px', cursor: 'pointer', color: '#c00', border: '1px solid #c00', borderRadius: 4, background: 'none' }}>
                ×
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => addListItem(field)} style={{ fontSize: 13, padding: '2px 8px', cursor: 'pointer' }}>
          + Ajouter
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2>Procédés de fabrication</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 480, marginBottom: 32 }}>
        <input
          placeholder="Nom"
          value={form.nom}
          onChange={(e) => setField('nom', e.target.value)}
          style={inputStyle}
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          rows={2}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
        <div>
          <p style={labelStyle}>Modèle Freezbe associé</p>
          <select
            value={form.freezbeId}
            onChange={(e) => setField('freezbeId', parseInt(e.target.value) || 0)}
            style={inputStyle}
          >
            <option value={0}>— Choisir un modèle —</option>
            {freezebes.map((f) => (
              <option key={f.id} value={f.id}>{f.nom}</option>
            ))}
          </select>
        </div>
        <ListEditor field="etapes" label="Étapes" />
        <ListEditor field="validationsDeTests" label="Validations de tests" />
        <ListEditor field="descriptionsDeControle" label="Descriptions de contrôle" />
        <button type="submit" disabled={submitting} style={{ padding: '8px 16px', cursor: 'pointer', alignSelf: 'flex-start' }}>
          {submitting ? 'Ajout...' : '+ Ajouter'}
        </button>
      </form>

      {isLoading && <p style={{ color: '#666' }}>Chargement...</p>}
      {hasError && <p style={{ color: '#c00' }}>Erreur lors du chargement des procédés.</p>}

      {!isLoading && processes.length === 0 && (
        <p style={{ color: '#666' }}>Aucun procédé pour l'instant.</p>
      )}

      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {processes.map((p) => {
          const freezbe = freezebes.find((f) => f.id === p.freezbeId)
          return (
            <li key={p.id} style={{ border: '1px solid #eee', borderRadius: 6, padding: '10px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <strong>{p.nom}</strong>
                  {freezbe && <span style={{ marginLeft: 8, fontSize: 13, color: '#888' }}>({freezbe.nom})</span>}
                  {p.description && <p style={{ margin: '4px 0 0', color: '#666', fontSize: 14 }}>{p.description}</p>}
                  {p.etapes.length > 0 && (
                    <p style={{ margin: '6px 0 0', fontSize: 13, color: '#555' }}>
                      Étapes : {p.etapes.join(' → ')}
                    </p>
                  )}
                </div>
                <button onClick={() => remove(p.id)} style={{ padding: '4px 10px', cursor: 'pointer', color: '#c00', border: '1px solid #c00', borderRadius: 4, background: 'none' }}>
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
