export function validateLoginResponse(data) {
    if (typeof data !== 'object' || data === null)
        return false;
    const d = data;
    return (typeof d.access_token === 'string' &&
        typeof d.user_id === 'number' &&
        typeof d.full_name === 'string');
}
