import { post } from './client';
export function login(credentials) {
    return post('/api/auth/login', credentials);
}
export function logout() {
    return post('/api/auth/logout', {});
}
