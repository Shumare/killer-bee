import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function ConfirmDialog({ message, onConfirm, onCancel }) {
    return (_jsx("div", { className: "dialog-overlay", onClick: onCancel, children: _jsxs("div", { className: "dialog", onClick: (e) => e.stopPropagation(), children: [_jsx("p", { className: "dialog-message", children: message }), _jsxs("div", { className: "dialog-actions", children: [_jsx("button", { type: "button", className: "button-danger", onClick: onConfirm, children: "Supprimer" }), _jsx("button", { type: "button", className: "button-secondary", onClick: onCancel, children: "Annuler" })] })] }) }));
}
