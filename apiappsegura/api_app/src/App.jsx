import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Detalles from './pages/Detalles.jsx'
import Filtrar from './pages/Filtrar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import ProtectedLayout from './components/ProtectedLayout.jsx'
import './App.css'

function App() {
  const [auth, setAuth] = useState(null)

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch('/api/session', {
          credentials: 'include',
        })
        const data = await response.json()
        setAuth(Boolean(data.authenticated))
      } catch (err) {
        setAuth(false)
      }
    }

    checkSession()
  }, [])

  if (auth === null) {
    return <div className="loading-screen">Cargando sesión...</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login auth={auth} setAuth={setAuth} />} />
        <Route
          element={
            <ProtectedRoute auth={auth}>
              <ProtectedLayout setAuth={setAuth} />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/detalles" element={<Detalles />} />
          <Route path="/filtrar" element={<Filtrar />} />
          <Route index element={<Navigate to="/home" replace />} />
        </Route>
        <Route path="*" element={<Navigate to={auth ? '/home' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
