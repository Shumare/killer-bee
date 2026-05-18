import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useToast } from '../../store/toast.store';
export default function ToastContainer() {
    const { toasts, dismiss } = useToast();
    if (!toasts.length)
        return null;
    return (_jsx("div", { className: "toast-container", children: toasts.map((t) => (_jsxs("div", { className: `toast toast-${t.type}`, onClick: () => dismiss(t.id), role: "alert", children: [_jsx("span", { className: "toast-icon", children: t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ' }), t.message] }, t.id))) }));
}
