import { useEffect, useState } from 'react';
import { getUser } from '../api/user.api';
import { mapUserResponseToUser } from '../mappers/user.mapper';
export default function useUser(userId) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    useEffect(() => {
        async function fetchUser() {
            setIsLoading(true);
            setHasError(false);
            try {
                const response = await getUser(userId);
                setUser(mapUserResponseToUser(response));
            }
            catch (err) {
                console.error(`[useUser] Erreur chargement utilisateur ${userId}`, err);
                setHasError(true);
            }
            finally {
                setIsLoading(false);
            }
        }
        fetchUser();
    }, [userId]);
    return { user, isLoading, hasError };
}
