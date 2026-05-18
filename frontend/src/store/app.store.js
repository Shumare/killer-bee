import { createContext, useContext, useState } from 'react';
export const AppContext = createContext(null);
export function useAppStore() {
    const ctx = useContext(AppContext);
    if (!ctx)
        throw new Error('useAppStore must be used inside AppProvider');
    return ctx;
}
export function useAppState() {
    const [theme, setTheme] = useState('light');
    function toggleTheme() {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    }
    return { theme, toggleTheme };
}
