import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import useProcesses from '../../hooks/useProcesses';
import useFreezebes from '../../hooks/useFreezebes';
import { requiredString, selectedId, nonEmptyList, hasErrors } from '../../utils/validate';
import { useToast } from '../../store/toast.store';
import ConfirmDialog from '../components/ConfirmDialog';
const emptyForm = { nom: '', description: '', freezbeId: 0, etapes: [''], validationsDeTests: [''], descriptionsDeControle: [''] };
function validate(form) {
    return {
        nom: requiredString(form.nom, 'Le nom') ?? undefined,
        freezbeId: selectedId(form.freezbeId, 'un modèle Freezbe') ?? undefined,
        etapes: nonEmptyList(form.etapes, 'Étapes') ?? undefined,
    };
}
export default function ProcessPage() {
    const { processes, isLoading, hasError, create, update, remove } = useProcesses();
    const { freezebes } = useFreezebes();
    const { notify } = useToast();
    const [form, setForm] = useState(emptyForm);
    const [editing, setEditing] = useState(null);
    const [errors, setErrors] = useState({});
    const [search, setSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(null);
    function setField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field])
            setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    function setListItem(field, index, value) {
        setForm((prev) => { const updated = [...prev[field]]; updated[index] = value; return { ...prev, [field]: updated }; });
        if (field === 'etapes' && errors.etapes)
            setErrors((prev) => ({ ...prev, etapes: undefined }));
    }
    function addListItem(field) {
        setForm((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
    }
    function removeListItem(field, index) {
        setForm((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
    }
    function startEdit(item) {
        setEditing(item);
        setForm({
            nom: item.nom,
            description: item.description,
            freezbeId: item.freezbeId,
            etapes: item.etapes.length ? [...item.etapes] : [''],
            validationsDeTests: item.validationsDeTests.length ? [...item.validationsDeTests] : [''],
            descriptionsDeControle: item.descriptionsDeControle.length ? [...item.descriptionsDeControle] : [''],
        });
        setErrors({});
    }
    function cancelEdit() {
        setEditing(null);
        setForm(emptyForm);
        setErrors({});
    }
    async function handleSubmit(e) {
        e.preventDefault();
        const errs = validate(form);
        if (hasErrors(errs)) {
            setErrors(errs);
            return;
        }
        setSubmitting(true);
        const payload = {
            ...form,
            etapes: form.etapes.filter((s) => s.trim()),
            validationsDeTests: form.validationsDeTests.filter((s) => s.trim()),
            descriptionsDeControle: form.descriptionsDeControle.filter((s) => s.trim()),
        };
        try {
            if (editing) {
                await update(editing.id, payload);
                notify(`Procédé « ${editing.nom} » mis à jour.`);
                cancelEdit();
            }
            else {
                await create(payload);
                notify(`Procédé « ${form.nom} » créé.`);
                setForm(emptyForm);
            }
        }
        catch (err) {
            console.error('[ProcessPage] Erreur soumission', err);
            notify('Une erreur est survenue.', 'error');
        }
        finally {
            setSubmitting(false);
        }
    }
    async function handleRemove() {
        if (!pendingDelete)
            return;
        try {
            await remove(pendingDelete.id);
            notify(`Procédé « ${pendingDelete.nom} » supprimé.`, 'info');
        }
        catch (err) {
            console.error('[ProcessPage] Erreur suppression', err);
            notify('Erreur lors de la suppression.', 'error');
        }
        finally {
            setPendingDelete(null);
        }
    }
    const displayed = search.trim()
        ? processes.filter((p) => p.nom.toLowerCase().includes(search.toLowerCase()))
        : processes;
    function ListEditor({ field, label }) {
        const hasListError = field === 'etapes' && !!errors.etapes;
        return (_jsxs("div", { className: "form-field", children: [_jsxs("label", { className: "label", children: [label, field === 'etapes' ? ' *' : ''] }), form[field].map((val, idx) => (_jsxs("div", { className: "form-row", children: [_jsx("input", { className: "input", value: val, onChange: (e) => setListItem(field, idx, e.target.value), placeholder: `${label} ${idx + 1}` }), form[field].length > 1 && (_jsx("button", { type: "button", className: "button-danger button-small", onClick: () => removeListItem(field, idx), children: "\u00D7" }))] }, idx))), hasListError && _jsx("p", { className: "field-error", children: errors.etapes }), _jsx("button", { type: "button", className: "button-secondary button-small", onClick: () => addListItem(field), children: "+ Ajouter" })] }));
    }
    return (_jsxs("div", { children: [_jsx("h2", { className: "page-title", children: "Proc\u00E9d\u00E9s de fabrication" }), _jsx("p", { className: "page-description", children: "Cr\u00E9e des proc\u00E9dures compl\u00E8tes avec \u00E9tapes, validations et contr\u00F4les." }), _jsxs("div", { className: "search-row", children: [_jsx("input", { className: "input", placeholder: "Rechercher par nom...", value: search, onChange: (e) => setSearch(e.target.value) }), search && (_jsx("button", { type: "button", className: "button-secondary button-small", onClick: () => setSearch(''), children: "\u2715" }))] }), _jsxs("form", { className: "form-panel", onSubmit: handleSubmit, children: [_jsx("div", { className: "form-heading", children: editing ? `Modifier : ${editing.nom}` : 'Nouveau procédé' }), _jsxs("div", { className: "form-grid", children: [_jsxs("div", { className: "form-field", children: [_jsx("label", { className: "label", children: "Nom *" }), _jsx("input", { className: "input", placeholder: "Nom", value: form.nom, onChange: (e) => setField('nom', e.target.value) }), errors.nom && _jsx("p", { className: "field-error", children: errors.nom })] }), _jsxs("div", { className: "form-field", children: [_jsx("label", { className: "label", children: "Description" }), _jsx("textarea", { className: "textarea", placeholder: "Description", value: form.description, onChange: (e) => setField('description', e.target.value), rows: 2 })] }), _jsxs("div", { className: "form-field", children: [_jsx("label", { className: "label", children: "Mod\u00E8le Freezbe *" }), _jsxs("select", { className: "select", value: form.freezbeId, onChange: (e) => setField('freezbeId', parseInt(e.target.value) || 0), children: [_jsx("option", { value: 0, children: "\u2014 Choisir un mod\u00E8le \u2014" }), freezebes.map((f) => _jsx("option", { value: f.id, children: f.nom }, f.id))] }), errors.freezbeId && _jsx("p", { className: "field-error", children: errors.freezbeId })] }), _jsx(ListEditor, { field: "etapes", label: "\u00C9tapes" }), _jsx(ListEditor, { field: "validationsDeTests", label: "Validations de tests" }), _jsx(ListEditor, { field: "descriptionsDeControle", label: "Descriptions de contr\u00F4le" })] }), _jsxs("div", { className: "actions-row", children: [_jsx("button", { type: "submit", className: "button-primary", children: submitting ? '...' : editing ? 'Mettre à jour' : '+ Ajouter' }), editing && (_jsx("button", { type: "button", className: "button-secondary", onClick: cancelEdit, children: "Annuler" }))] })] }), isLoading && _jsx("p", { className: "section-note", children: "Chargement..." }), hasError && _jsx("p", { className: "field-error", children: "Erreur lors du chargement." }), !isLoading && displayed.length === 0 && _jsx("p", { className: "section-note", children: "Aucun r\u00E9sultat." }), _jsx("ul", { className: "card-list", children: displayed.map((p) => {
                    const freezbe = freezebes.find((f) => f.id === p.freezbeId);
                    return (_jsxs("li", { className: `card ${editing?.id === p.id ? 'active' : ''}`, children: [_jsxs("div", { children: [_jsxs("div", { className: "card-title", children: [_jsx("strong", { children: p.nom }), freezbe && _jsxs("span", { className: "card-subtitle", children: ["(", freezbe.nom, ")"] })] }), p.description && _jsx("p", { className: "card-meta", children: p.description }), p.etapes.length > 0 && _jsxs("p", { className: "card-meta", children: ["\u00C9tapes : ", p.etapes.join(' → ')] })] }), _jsxs("div", { className: "card-actions", children: [_jsx("button", { type: "button", className: "button-secondary button-small", onClick: () => startEdit(p), children: "Modifier" }), _jsx("button", { type: "button", className: "button-danger button-small", onClick: () => setPendingDelete({ id: p.id, nom: p.nom }), children: "Supprimer" })] })] }, p.id));
                }) }), pendingDelete && (_jsx(ConfirmDialog, { message: `Supprimer le procédé « ${pendingDelete.nom} » ?`, onConfirm: handleRemove, onCancel: () => setPendingDelete(null) }))] }));
}
