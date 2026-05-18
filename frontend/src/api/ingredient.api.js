import { get, post, put, del } from './client';
export function getAllIngredients() {
    return get('/api/ingredients');
}
export function getIngredientById(id) {
    return get(`/api/ingredients/${id}`);
}
export function createIngredient(body) {
    return post('/api/ingredients', body);
}
export function updateIngredient(id, body) {
    return put(`/api/ingredients/${id}`, body);
}
export function searchIngredients(nom) {
    return get(`/api/ingredients/search?nom=${encodeURIComponent(nom)}`);
}
export function deleteIngredient(id) {
    return del(`/api/ingredients/${id}`);
}
