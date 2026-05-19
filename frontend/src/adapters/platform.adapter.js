export function adaptSuccess(data) {
    return { status: 'success', data, error: null };
}
export function adaptFailure(message) {
    return { status: 'failure', data: null, error: message };
}
export function adaptPending() {
    return { status: 'pending', data: null, error: null };
}
