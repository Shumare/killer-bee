import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function AuthLayout({ children }) {
    return (_jsx("div", { className: "app-shell", style: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }, children: _jsx("div", { className: "page-shell", style: { maxWidth: 460, width: '100%', padding: 0 }, children: _jsxs("div", { style: { padding: '36px 32px 28px' }, children: [_jsx("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 }, children: _jsxs("div", { children: [_jsx("p", { className: "badge", children: "Killer Bee" }), _jsx("h1", { style: { margin: '12px 0 0', fontSize: '2rem', color: '#222' }, children: "Connexion" })] }) }), children] }) }) }));
}
