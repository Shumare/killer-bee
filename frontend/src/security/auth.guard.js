export function canAccess(user, requiredRole) {
    if (!user)
        return requiredRole === 'guest';
    return true;
}
export function isAuthorized(user, allowedRoles) {
    const role = user ? 'user' : 'guest';
    return allowedRoles.includes(role);
}
