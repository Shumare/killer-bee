import { get, post, put, del } from './client';
export function getAllFreezebes() {
    return get('/api/freezbe');
}
export function getFreezebeById(id) {
    return get(`/api/freezbe/${id}`);
}
export function createFreezebe(body) {
    return post('/api/freezbe', body);
}
export function updateFreezebe(id, body) {
    return put(`/api/freezbe/${id}`, body);
}
export function searchFreezebes(nom) {
    return get(`/api/freezbe/search?nom=${encodeURIComponent(nom)}`);
}
export function deleteFreezebe(id) {
    return del(`/api/freezbe/${id}`);
}
