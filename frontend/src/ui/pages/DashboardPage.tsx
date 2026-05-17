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
    <div style={{ fontFamily: 'sans-serif', maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: 16, marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Killer Bee</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span>Bonjour, <strong>{user?.name}</strong></span>
          <button onClick={logout} disabled={loggingOut} style={{ padding: '6px 14px', cursor: 'pointer' }}>
            {loggingOut ? 'Déconnexion...' : 'Se déconnecter'}
          </button>
        </div>
      </header>

      <nav style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
        {visibleNav.map(({ label, page, allowedRoles }) => (
          <button
            key={page}
            onClick={() => guardedNavigate(page, allowedRoles)}
            style={{
              padding: '6px 16px',
              cursor: 'pointer',
              borderRadius: 4,
              border: '1px solid #ccc',
              background: currentPage === page ? '#333' : 'transparent',
              color: currentPage === page ? '#fff' : '#333',
              fontWeight: currentPage === page ? 600 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      <main>
        {currentPage === 'dashboard' && <DashboardOverview />}
        {currentPage === 'freezbe' && isAuthorized(user, ['user', 'admin']) && <FreezebePage />}
        {currentPage === 'ingredients' && isAuthorized(user, ['user', 'admin']) && <IngredientPage />}
        {currentPage === 'processes' && isAuthorized(user, ['user', 'admin']) && <ProcessPage />}
        {currentPage === 'profile' && isAuthorized(user, ['user', 'admin']) && <ProfilePage />}
      </main>
    </div>
  )
}

function DashboardOverview() {
  const { user } = useAuthStore()
  const { navigate } = useRouter()

  const cards = [
    { page: 'freezbe' as const, label: 'Modèles Freezbe', desc: 'Gérez vos modèles : nom, prix, gamme, ingrédients, grammage.', allowedRoles: ['user', 'admin'] as Role[] },
    { page: 'ingredients' as const, label: 'Ingrédients', desc: 'Gérez les ingrédients utilisés dans vos modèles.', allowedRoles: ['user', 'admin'] as Role[] },
    { page: 'processes' as const, label: 'Procédés', desc: 'Définissez les étapes et contrôles de chaque procédé.', allowedRoles: ['user', 'admin'] as Role[] },
  ].filter(({ allowedRoles }) => isAuthorized(user, allowedRoles))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2>Bienvenue</h2>
      <p style={{ color: '#666' }}>Sélectionnez une section pour commencer.</p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {cards.map(({ page, label, desc }) => (
          <div
            key={page}
            onClick={() => navigate(page)}
            style={{ border: '1px solid #ddd', borderRadius: 8, padding: '16px 20px', cursor: 'pointer', flex: '1 1 200px', minWidth: 180 }}
          >
            <strong>{label}</strong>
            <p style={{ margin: '6px 0 0', color: '#666', fontSize: 14 }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
