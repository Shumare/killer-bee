import { useState } from 'react';
import { login as loginApi } from '../api/auth.api';
import { mapLoginResponseToSession, mapLoginResponseToUser } from '../mappers/auth.mapper';
import { useAuthStore } from '../store/auth.store';
export default function useLogin() {
    const { setUser, setSession } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    async function login(credentials) {
        setIsLoading(true);
        setHasError(false);
        try {
            const response = await loginApi(credentials);
            const user = mapLoginResponseToUser(response);
            const session = mapLoginResponseToSession(response);
            setUser(user);
            setSession(session);
        }
        catch (err) {
            console.error('[useLogin] Échec de la connexion', err);
            setHasError(true);
        }
        finally {
            setIsLoading(false);
        }
    }
    return { login, isLoading, hasError };
}
