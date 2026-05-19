export function formatDate(date, locale = 'fr-FR') {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(locale);
}
