import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import useIngredients from '../../hooks/useIngredients';
import { requiredString, hasErrors } from '../../utils/validate';
import { useToast } from '../../store/toast.store';
import ConfirmDialog from '../components/ConfirmDialog';
const emptyForm = { nom: '', description: '' };
function validate(form) {
    return {
        nom: requiredString(form.nom, 'Le nom') ?? undefined,
    };
}
export default function IngredientPage() {
    const { ingredients, isLoading, hasError, create, update, remove } = useIngredients();
    const { notify } = useToast();
    const [form, setForm] = useState(emptyForm);
    const [editing, setEditing] = useState(null);
    const [errors, setErrors] = useState({});
    const [search, setSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(null);
    function set(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field])
            setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    function startEdit(item) {
        setEditing(item);
        setForm({ nom: item.nom, description: item.description });
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
        try {
            if (editing) {
                await update(editing.id, form);
                notify(`Ingrédient « ${editing.nom} » mis à jour.`);
                cancelEdit();
            }
            else {
                await create(form);
                notify(`Ingrédient « ${form.nom} » créé.`);
                setForm(emptyForm);
            }
        }
        catch (err) {
            console.error('[IngredientPage] Erreur soumission', err);
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
            notify(`Ingrédient « ${pendingDelete.nom} » supprimé.`, 'info');
        }
        catch (err) {
            console.error('[IngredientPage] Erreur suppression', err);
            notify('Erreur lors de la suppression.', 'error');
        }
        finally {
            setPendingDelete(null);
        }
    }
    const displayed = search.trim()
        ? ingredients.filter((i) => i.nom.toLowerCase().includes(search.toLowerCase()))
        : ingredients;
    return (_jsxs("div", { children: [_jsx("h2", { className: "page-title", children: "Ingr\u00E9dients" }), _jsx("p", { className: "page-description", children: "Ajoute et organise les ingr\u00E9dients de tes mod\u00E8les Freezbe." }), _jsxs("div", { className: "search-row", children: [_jsx("input", { className: "input", placeholder: "Rechercher par nom...", value: search, onChange: (e) => setSearch(e.target.value) }), search && (_jsx("button", { type: "button", className: "button-secondary button-small", onClick: () => setSearch(''), children: "\u2715" }))] }), _jsxs("form", { className: "form-panel", onSubmit: handleSubmit, children: [_jsx("div", { className: "form-heading", children: editing ? `Modifier : ${editing.nom}` : 'Nouvel ingrédient' }), _jsxs("div", { className: "form-grid", children: [_jsxs("div", { className: "form-field", children: [_jsx("label", { className: "label", children: "Nom *" }), _jsx("input", { className: "input", placeholder: "Nom", value: form.nom, onChange: (e) => set('nom', e.target.value) }), errors.nom && _jsx("p", { className: "field-error", children: errors.nom })] }), _jsxs("div", { className: "form-field", children: [_jsx("label", { className: "label", children: "Description" }), _jsx("textarea", { className: "textarea", placeholder: "Description", value: form.description, onChange: (e) => set('description', e.target.value), rows: 3 })] })] }), _jsxs("div", { className: "actions-row", children: [_jsx("button", { type: "submit", className: "button-primary", children: submitting ? '...' : editing ? 'Mettre à jour' : '+ Ajouter' }), editing && (_jsx("button", { type: "button", className: "button-secondary", onClick: cancelEdit, children: "Annuler" }))] })] }), isLoading && _jsx("p", { className: "section-note", children: "Chargement..." }), hasError && _jsx("p", { className: "field-error", children: "Erreur lors du chargement." }), !isLoading && displayed.length === 0 && _jsx("p", { className: "section-note", children: "Aucun r\u00E9sultat." }), _jsx("ul", { className: "card-list", children: displayed.map((i) => (_jsxs("li", { className: `card ${editing?.id === i.id ? 'active' : ''}`, children: [_jsxs("div", { children: [_jsx("div", { className: "card-title", children: _jsx("strong", { children: i.nom }) }), i.description && _jsx("p", { className: "card-meta", children: i.description })] }), _jsxs("div", { className: "card-actions", children: [_jsx("button", { type: "button", className: "button-secondary button-small", onClick: () => startEdit(i), children: "Modifier" }), _jsx("button", { type: "button", className: "button-danger button-small", onClick: () => setPendingDelete({ id: i.id, nom: i.nom }), children: "Supprimer" })] })] }, i.id))) }), pendingDelete && (_jsx(ConfirmDialog, { message: `Supprimer l'ingrédient « ${pendingDelete.nom} » ?`, onConfirm: handleRemove, onCancel: () => setPendingDelete(null) }))] }));
}
