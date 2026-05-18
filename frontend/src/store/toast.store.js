import { createContext, useContext, useState, useCallback } from 'react';
export const ToastContext = createContext({
    toasts: [],
    notify: () => { },
    dismiss: () => { },
});
let nextId = 0;
export function useToastState() {
    const [toasts, setToasts] = useState([]);
    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);
    const notify = useCallback((message, type = 'success') => {
        const id = ++nextId;
        setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
        setTimeout(() => dismiss(id), 3500);
    }, [dismiss]);
    return { toasts, notify, dismiss };
}
export function useToast() {
    return useContext(ToastContext);
}
