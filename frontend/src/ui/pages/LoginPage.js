import { jsx as _jsx } from "react/jsx-runtime";
import LoginForm from '../components/LoginForm';
import AuthLayout from '../widgets/AuthLayout';
export default function LoginPage() {
    return (_jsx(AuthLayout, { children: _jsx(LoginForm, {}) }));
}
