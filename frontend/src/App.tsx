import { AuthContext, useAuthState } from './store/auth.store'
import { AppContext, useAppState } from './store/app.store'
import { RouterContext, useRouterState } from './store/router.store'
import { ToastContext, useToastState } from './store/toast.store'
import LoginPage from './ui/pages/LoginPage'
import DashboardPage from './ui/pages/DashboardPage'
import ToastContainer from './ui/components/ToastContainer'

export default function App() {
  const authState = useAuthState()
  const appState = useAppState()
  const routerState = useRouterState()
  const toastState = useToastState()

  return (
    <ToastContext.Provider value={toastState}>
      <AppContext.Provider value={appState}>
        <AuthContext.Provider value={authState}>
          <RouterContext.Provider value={routerState}>
            {authState.isAuthenticated ? <DashboardPage /> : <LoginPage />}
          </RouterContext.Provider>
        </AuthContext.Provider>
      </AppContext.Provider>
      <ToastContainer />
    </ToastContext.Provider>
  )
}
