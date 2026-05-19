import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import useLogin from '../../hooks/useLogin';
import Button from './Button';
import Input from './Input';
export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, hasError } = useLogin();
    function handleSubmit() {
        login({ email, password });
    }
    return (_jsxs("form", { className: "form-panel", onSubmit: (e) => { e.preventDefault(); handleSubmit(); }, children: [_jsx("div", { className: "form-heading", children: "Rentre dans le village" }), _jsxs("div", { className: "form-grid", children: [_jsxs("div", { className: "form-field", children: [_jsx("label", { className: "label", htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", name: "email", type: "email", value: email, onChange: setEmail, placeholder: "Email" })] }), _jsxs("div", { className: "form-field", children: [_jsx("label", { className: "label", htmlFor: "password", children: "Mot de passe" }), _jsx(Input, { id: "password", name: "password", type: "password", value: password, onChange: setPassword, placeholder: "Mot de passe" })] })] }), hasError && _jsx("p", { className: "field-error", children: "Identifiants invalides" }), _jsx("div", { className: "actions-row", children: _jsx(Button, { type: "submit", label: isLoading ? 'Connexion...' : 'Se connecter', disabled: isLoading, className: "button-primary" }) })] }));
}
