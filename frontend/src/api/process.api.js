import { get, post, put, del } from './client';
export function getAllProcesses() {
    return get('/api/processes');
}
export function getProcessById(id) {
    return get(`/api/processes/${id}`);
}
export function createProcess(body) {
    return post('/api/processes', body);
}
export function updateProcess(id, body) {
    return put(`/api/processes/${id}`, body);
}
export function searchProcesses(nom) {
    return get(`/api/processes/search?nom=${encodeURIComponent(nom)}`);
}
export function deleteProcess(id) {
    return del(`/api/processes/${id}`);
}
