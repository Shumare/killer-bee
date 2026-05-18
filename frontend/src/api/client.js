import { encrypt, decrypt } from '../security/cipher';
import { getToken } from '../security/token.registry';
const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';
async function request(path, options = {}) {
    const { headers: extraHeaders, body, ...restOptions } = options;
    const encryptedBody = body && typeof body === 'string' ? encrypt(body) : body;
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            'Content-Type': 'text/plain',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...extraHeaders,
        },
        body: encryptedBody,
        ...restOptions,
    });
    if (!response.ok) {
        console.error(`[API] ${options.method ?? 'GET'} ${path} — HTTP ${response.status}`);
        try {
            const ciphertext = await response.text();
            const plaintext = decrypt(ciphertext);
            const errorData = JSON.parse(plaintext);
            throw new Error(errorData.message ?? `HTTP ${response.status}`);
        }
        catch {
            throw new Error(`HTTP ${response.status}`);
        }
    }
    if (response.status === 204)
        return undefined;
    const ciphertext = await response.text();
    const plaintext = decrypt(ciphertext);
    return JSON.parse(plaintext);
}
export function get(path, headers) {
    return request(path, { method: 'GET', headers });
}
export function post(path, body, headers) {
    return request(path, { method: 'POST', body: JSON.stringify(body), headers });
}
export function put(path, body, headers) {
    return request(path, { method: 'PUT', body: JSON.stringify(body), headers });
}
export function del(path, headers) {
    return request(path, { method: 'DELETE', headers });
}
