type Props = {
  children: React.ReactNode
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className="app-shell" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="page-shell" style={{ maxWidth: 460, width: '100%', padding: 0 }}>
        <div style={{ padding: '36px 32px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 }}>
            <div>
              <p className="badge">Killer Bee</p>
              <h1 style={{ margin: '12px 0 0', fontSize: '2rem', color: '#222' }}>Connexion</h1>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
