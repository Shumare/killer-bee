import { createContext, useContext, useState } from 'react';
import { setToken } from '../security/token.registry';
export const AuthContext = createContext(null);
export function useAuthStore() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuthStore must be used inside AuthProvider');
    return ctx;
}
export function useAuthState() {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const isAuthenticated = session !== null;
    function handleSetSession(s) {
        setToken(s?.token ?? null);
        setSession(s);
    }
    return { user, session, isAuthenticated, setUser, setSession: handleSetSession };
}
