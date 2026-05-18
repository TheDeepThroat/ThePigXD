import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login({ auth, setAuth }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (auth) {
      navigate('/home')
    }
  }, [auth, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        setAuth(true)
        navigate('/home')
      } else {
        const data = await response.json()
        setError(data.message || 'Credenciales incorrectas')
      }
    } catch (err) {
      setError('Error de conexión al servidor')
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Iniciar sesión</h1>
        <p>Usuario: <strong>admin</strong> / Contraseña: <strong>password</strong></p>
        <form onSubmit={handleSubmit}>
          <label>
            Usuario
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              autoComplete="username"
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          {error && <p className="error-message">{error}</p>}
          <button type="submit">Entrar</button>
        </form>
      </div>
    </div>
  )
}
