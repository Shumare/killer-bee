import { createContext, useContext, useState } from 'react';
export const RouterContext = createContext(null);
export function useRouter() {
    const ctx = useContext(RouterContext);
    if (!ctx)
        throw new Error('useRouter must be used inside RouterProvider');
    return ctx;
}
export function useRouterState() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    return { currentPage, navigate: setCurrentPage };
}
