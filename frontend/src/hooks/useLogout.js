import { useState } from 'react';
import { logout as logoutApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
export default function useLogout() {
    const { setUser, setSession } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    async function logout() {
        setIsLoading(true);
        try {
            await logoutApi();
        }
        catch (err) {
            console.error('[useLogout] Erreur lors de la déconnexion', err);
        }
        finally {
            setUser(null);
            setSession(null);
            setIsLoading(false);
        }
    }
    return { logout, isLoading };
}
