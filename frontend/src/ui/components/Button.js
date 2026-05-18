import { jsx as _jsx } from "react/jsx-runtime";
export default function Button({ label, onClick, disabled = false, type = 'button', className = '' }) {
    return (_jsx("button", { type: type, onClick: onClick, disabled: disabled, className: className, children: label }));
}
