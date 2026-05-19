import { get, put } from './client';
export function getUser(id) {
    return get(`/api/users/${id}`);
}
export function updateProfile(id, data) {
    return put(`/api/users/${id}`, data);
}
