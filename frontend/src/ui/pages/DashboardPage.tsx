import { useAuthStore } from '../../store/auth.store'
import { useRouter } from '../../store/router.store'
import type { Page } from '../../store/router.store'
import useLogout from '../../hooks/useLogout'
import { isAuthorized, type Role } from '../../security/auth.guard'
import FreezebePage from './FreezebePage'
import IngredientPage from './IngredientPage'
import ProcessPage from './ProcessPage'
import ProfilePage from './ProfilePage'

const navItems: { label: string; page: Page; allowedRoles: Role[] }[] = [
  { label: 'Accueil', page: 'dashboard', allowedRoles: ['guest', 'user', 'admin'] },
  { label: 'Modèles Freezbe', page: 'freezbe', allowedRoles: ['user', 'admin'] },
  { label: 'Ingrédients', page: 'ingredients', allowedRoles: ['user', 'admin'] },
  { label: 'Procédés', page: 'processes', allowedRoles: ['user', 'admin'] },
  { label: 'Profil', page: 'profile', allowedRoles: ['user', 'admin'] },
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { logout, isLoading: loggingOut } = useLogout()
  const { currentPage, navigate } = useRouter()

  const visibleNav = navItems.filter(({ allowedRoles }) => isAuthorized(user, allowedRoles))

  function guardedNavigate(page: Page, allowedRoles: Role[]) {
    if (!isAuthorized(user, allowedRoles)) return
    navigate(page)
  }

  return (
    <div className="app-shell">
      <div className="page-shell">
        <header className="page-header">
          <div>
            <p className="badge">Killer Bee</p>
            <h1>Killer Bee</h1>
            <p className="page-description">Tableau de bord : clair, rapide et puissant.</p>
          </div>
          <div className="header-actions">
            <span className="badge">Bonjour, {user?.name}</span>
            <button className="button-secondary" onClick={logout} disabled={loggingOut}>
              {loggingOut ? 'Déconnexion...' : 'Se déconnecter'}
            </button>
          </div>
        </header>

        <nav className="nav-bar">
          {navItems.map(({ label, page }) => (
            <button key={page} type="button" onClick={() => navigate(page)} className={`nav-button ${currentPage === page ? 'active' : ''}`}>
              {label}
            </button>
          ))}
        </nav>

        <main className="main-content">
          {currentPage === 'dashboard' && <DashboardOverview navigate={navigate} />}
          {currentPage === 'freezbe' && <FreezebePage />}
          {currentPage === 'ingredients' && <IngredientPage />}
          {currentPage === 'processes' && <ProcessPage />}
          {currentPage === 'profile' && <ProfilePage />}
        </main>
      </div>
    </div>
  )
}

function DashboardOverview({ navigate }: { navigate: (page: Page) => void }) {
  return (
    <section>
      <h2 className="page-title">Bienvenue</h2>
      <p className="page-description">Prêt à gérer les modèles, ingrédients et procédés.</p>

      <div className="section-grid">
        {[
          { page: 'freezbe' as const, label: 'Modèles Freezbe', desc: 'Gère les recettes, prix, gammes et rattachements.' },
          { page: 'ingredients' as const, label: 'Ingrédients', desc: 'Ajoute, modifie et consulte la liste des ingrédients.' },
          { page: 'processes' as const, label: 'Procédés', desc: 'Crée des flux de fabrication complets et structurés.' },
        ].map(({ page, label, desc }) => (
          <div key={page} className="section-card" onClick={() => navigate(page)}>
            <strong>{label}</strong>
            <p>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
