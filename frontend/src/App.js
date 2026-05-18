import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AuthContext, useAuthState } from './store/auth.store';
import { AppContext, useAppState } from './store/app.store';
import { RouterContext, useRouterState } from './store/router.store';
import { ToastContext, useToastState } from './store/toast.store';
import LoginPage from './ui/pages/LoginPage';
import DashboardPage from './ui/pages/DashboardPage';
import ToastContainer from './ui/components/ToastContainer';
export default function App() {
    const authState = useAuthState();
    const appState = useAppState();
    const routerState = useRouterState();
    const toastState = useToastState();
    return (_jsxs(ToastContext.Provider, { value: toastState, children: [_jsx(AppContext.Provider, { value: appState, children: _jsx(AuthContext.Provider, { value: authState, children: _jsx(RouterContext.Provider, { value: routerState, children: authState.isAuthenticated ? _jsx(DashboardPage, {}) : _jsx(LoginPage, {}) }) }) }), _jsx(ToastContainer, {})] }));
}
