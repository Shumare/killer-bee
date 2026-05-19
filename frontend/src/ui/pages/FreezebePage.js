import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import useFreezebes from '../../hooks/useFreezebes';
import useIngredients from '../../hooks/useIngredients';
import { requiredString, positiveFloat, positiveInt, hasErrors } from '../../utils/validate';
import { useToast } from '../../store/toast.store';
import ConfirmDialog from '../components/ConfirmDialog';
const emptyForm = { nom: '', description: '', pUHT: 0, gamme: '', ingredientIds: [], grammage: 0 };
function validate(form) {
    return {
        nom: requiredString(form.nom, 'Le nom') ?? undefined,
        gamme: requiredString(form.gamme, 'La gamme') ?? undefined,
        pUHT: positiveFloat(form.pUHT, 'Le prix UHT') ?? undefined,
        grammage: positiveInt(form.grammage, 'Le grammage') ?? undefined,
    };
}
export default function FreezebePage() {
    const { freezebes, isLoading, hasError, create, update, remove } = useFreezebes();
    const { ingredients } = useIngredients();
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
    function toggleIngredient(id) {
        setForm((prev) => ({
            ...prev,
            ingredientIds: prev.ingredientIds.includes(id)
                ? prev.ingredientIds.filter((x) => x !== id)
                : [...prev.ingredientIds, id],
        }));
    }
    function startEdit(item) {
        setEditing(item);
        setForm({ nom: item.nom, description: item.description, pUHT: item.pUHT, gamme: item.gamme, ingredientIds: [...item.ingredientIds], grammage: item.grammage });
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
                notify(`Modèle « ${editing.nom} » mis à jour.`);
                cancelEdit();
            }
            else {
                await create(form);
                notify(`Modèle « ${form.nom} » créé.`);
                setForm(emptyForm);
            }
        }
        catch (err) {
            console.error('[FreezebePage] Erreur soumission', err);
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
            notify(`Modèle « ${pendingDelete.nom} » supprimé.`, 'info');
        }
        catch (err) {
            console.error('[FreezebePage] Erreur suppression', err);
            notify('Erreur lors de la suppression.', 'error');
        }
        finally {
            setPendingDelete(null);
        }
    }
    const displayed = search.trim()
        ? freezebes.filter((f) => f.nom.toLowerCase().includes(search.toLowerCase()) || f.gamme.toLowerCase().includes(search.toLowerCase()))
        : freezebes;
    return (_jsxs("div", { children: [_jsx("h2", { className: "page-title", children: "Mod\u00E8les Freezbe" }), _jsx("p", { className: "page-description", children: "G\u00E8re tes recettes et attribue les ingr\u00E9dients n\u00E9cessaires \u00E0 chaque mod\u00E8le." }), _jsxs("div", { className: "search-row", children: [_jsx("input", { className: "input", placeholder: "Rechercher par nom ou gamme...", value: search, onChange: (e) => setSearch(e.target.value) }), search && (_jsx("button", { type: "button", className: "button-secondary button-small", onClick: () => setSearch(''), children: "\u2715" }))] }), _jsxs("form", { className: "form-panel", onSubmit: handleSubmit, children: [_jsx("div", { className: "form-heading", children: editing ? `Modifier : ${editing.nom}` : 'Nouveau modèle' }), _jsxs("div", { className: "form-grid", children: [_jsxs("div", { className: "form-field", children: [_jsx("label", { className: "label", children: "Nom *" }), _jsx("input", { className: "input", placeholder: "Nom", value: form.nom, onChange: (e) => set('nom', e.target.value) }), errors.nom && _jsx("p", { className: "field-error", children: errors.nom })] }), _jsxs("div", { className: "form-field", children: [_jsx("label", { className: "label", children: "Description" }), _jsx("textarea", { className: "textarea", placeholder: "Description", value: form.description, onChange: (e) => set('description', e.target.value), rows: 2 })] }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "flex-half form-field", children: [_jsx("label", { className: "label", children: "Prix UHT (\u20AC) *" }), _jsx("input", { className: "input", placeholder: "Prix UHT", type: "number", min: 0, step: 0.01, value: form.pUHT || '', onChange: (e) => set('pUHT', parseFloat(e.target.value) || 0) }), errors.pUHT && _jsx("p", { className: "field-error", children: errors.pUHT })] }), _jsxs("div", { className: "flex-half form-field", children: [_jsx("label", { className: "label", children: "Grammage (g) *" }), _jsx("input", { className: "input", placeholder: "Grammage", type: "number", min: 1, step: 1, value: form.grammage || '', onChange: (e) => set('grammage', Math.round(parseFloat(e.target.value)) || 0) }), errors.grammage && _jsx("p", { className: "field-error", children: errors.grammage })] })] }), _jsxs("div", { className: "form-field", children: [_jsx("label", { className: "label", children: "Gamme *" }), _jsx("input", { className: "input", placeholder: "Gamme", value: form.gamme, onChange: (e) => set('gamme', e.target.value) }), errors.gamme && _jsx("p", { className: "field-error", children: errors.gamme })] }), ingredients.length > 0 && (_jsxs("fieldset", { className: "fieldset", children: [_jsx("legend", { className: "legend", children: "Ingr\u00E9dients" }), _jsx("div", { className: "ingredient-list", children: ingredients.map((i) => (_jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", checked: form.ingredientIds.includes(i.id), onChange: () => toggleIngredient(i.id) }), i.nom] }, i.id))) })] }))] }), _jsxs("div", { className: "actions-row", children: [_jsx("button", { type: "submit", className: "button-primary", children: submitting ? '...' : editing ? 'Mettre à jour' : '+ Ajouter' }), editing && (_jsx("button", { type: "button", className: "button-secondary", onClick: cancelEdit, children: "Annuler" }))] })] }), isLoading && _jsx("p", { className: "section-note", children: "Chargement..." }), hasError && _jsx("p", { className: "field-error", children: "Erreur lors du chargement." }), !isLoading && displayed.length === 0 && _jsx("p", { className: "section-note", children: "Aucun r\u00E9sultat." }), _jsx("ul", { className: "card-list", children: displayed.map((f) => {
                    const linked = ingredients.filter((i) => f.ingredientIds.includes(i.id));
                    return (_jsxs("li", { className: `card ${editing?.id === f.id ? 'active' : ''}`, children: [_jsxs("div", { children: [_jsxs("div", { className: "card-title", children: [_jsx("strong", { children: f.nom }), _jsx("span", { className: "card-subtitle", children: f.gamme })] }), f.description && _jsx("p", { className: "card-meta", children: f.description }), _jsxs("p", { className: "card-meta", children: [f.pUHT.toFixed(2), " \u20AC \u2014 ", f.grammage, " g"] }), linked.length > 0 && _jsxs("p", { className: "card-meta", children: ["Ingr\u00E9dients : ", linked.map((i) => i.nom).join(', ')] })] }), _jsxs("div", { className: "card-actions", children: [_jsx("button", { type: "button", className: "button-secondary button-small", onClick: () => startEdit(f), children: "Modifier" }), _jsx("button", { type: "button", className: "button-danger button-small", onClick: () => setPendingDelete({ id: f.id, nom: f.nom }), children: "Supprimer" })] })] }, f.id));
                }) }), pendingDelete && (_jsx(ConfirmDialog, { message: `Supprimer le modèle « ${pendingDelete.nom} » ?`, onConfirm: handleRemove, onCancel: () => setPendingDelete(null) }))] }));
}
