export function validateUserResponse(data) {
    if (typeof data !== 'object' || data === null)
        return false;
    const d = data;
    return (typeof d.user_id === 'number' &&
        typeof d.full_name === 'string' &&
        typeof d.email === 'string');
}
