import { Link, Outlet, useNavigate } from 'react-router-dom'

export default function ProtectedLayout({ setAuth }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
    })
    setAuth(false)
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">PokeApp Segura</div>
        <nav className="page-nav">
          <Link to="/home">Home</Link>
          <Link to="/detalles">Detalles</Link>
          <Link to="/filtrar">Filtrar</Link>
        </nav>
        <button type="button" className="logout-button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
