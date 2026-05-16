import { useAuthStore } from '../../store/auth.store'
import { useRouter } from '../../store/router.store'
import type { Page } from '../../store/router.store'
import useLogout from '../../hooks/useLogout'
import FreezebePage from './FreezebePage'
import IngredientPage from './IngredientPage'
import ProcessPage from './ProcessPage'
import ProfilePage from './ProfilePage'

const navItems: { label: string; page: Page }[] = [
  { label: 'Accueil', page: 'dashboard' },
  { label: 'Modèles Freezbe', page: 'freezbe' },
  { label: 'Ingrédients', page: 'ingredients' },
  { label: 'Procédés', page: 'processes' },
  { label: 'Profil', page: 'profile' },
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { logout, isLoading: loggingOut } = useLogout()
  const { currentPage, navigate } = useRouter()

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
        {navItems.map(({ label, page }) => (
          <button
            key={page}
            onClick={() => navigate(page)}
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
        {currentPage === 'freezbe' && <FreezebePage />}
        {currentPage === 'ingredients' && <IngredientPage />}
        {currentPage === 'processes' && <ProcessPage />}
        {currentPage === 'profile' && <ProfilePage />}
      </main>
    </div>
  )
}

function DashboardOverview() {
  const { navigate } = useRouter()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2>Bienvenue</h2>
      <p style={{ color: '#666' }}>Sélectionnez une section pour commencer.</p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[
          { page: 'freezbe' as const, label: 'Modèles Freezbe', desc: 'Gérez vos modèles : nom, prix, gamme, ingrédients, grammage.' },
          { page: 'ingredients' as const, label: 'Ingrédients', desc: 'Gérez les ingrédients utilisés dans vos modèles.' },
          { page: 'processes' as const, label: 'Procédés', desc: 'Définissez les étapes et contrôles de chaque procédé.' },
        ].map(({ page, label, desc }) => (
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
