import { jsx as _jsx } from "react/jsx-runtime";
export default function Input({ id, name, value, onChange, placeholder, type = 'text', disabled = false, className = '' }) {
    return (_jsx("input", { id: id, name: name, type: type, value: value, placeholder: placeholder, disabled: disabled, className: className, onChange: (e) => onChange(e.target.value) }));
}
