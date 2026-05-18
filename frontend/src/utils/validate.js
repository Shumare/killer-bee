export function requiredString(val, label) {
    if (!val.trim())
        return `${label} est requis`;
    if (val.trim().length < 2)
        return `${label} doit contenir au moins 2 caractères`;
    return null;
}
export function positiveFloat(val, label) {
    if (isNaN(val))
        return `${label} doit être un nombre décimal`;
    if (val <= 0)
        return `${label} doit être supérieur à 0`;
    return null;
}
export function positiveInt(val, label) {
    if (isNaN(val) || !Number.isInteger(val))
        return `${label} doit être un entier`;
    if (val <= 0)
        return `${label} doit être supérieur à 0`;
    return null;
}
export function selectedId(val, label) {
    if (!val || val <= 0)
        return `Veuillez sélectionner ${label}`;
    return null;
}
export function nonEmptyList(list, label) {
    if (list.filter((s) => s.trim()).length === 0)
        return `${label} : au moins une entrée est requise`;
    return null;
}
export function hasErrors(errors) {
    return Object.values(errors).some((v) => v !== undefined && v !== null && v !== '');
}
