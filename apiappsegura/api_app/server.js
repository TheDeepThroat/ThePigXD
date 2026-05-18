import express from 'express'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'

const app = express()
const PORT = 4000
const SESSION_COOKIE = 'session_token'
const JWT_SECRET = 'mi_secreto_super_seguro_jwt_123'
const VALID_USERNAME = 'admin'
const VALID_PASSWORD = 'password'

app.use(express.json())
app.use(cookieParser())

app.post('/api/login', (req, res) => {
  const { username, password } = req.body

  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' })
    
    res.cookie(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60,
    })
    return res.json({ authenticated: true })
  }

  return res.status(401).json({ authenticated: false, message: 'Usuario o contraseña inválidos' })
})

app.post('/api/logout', (req, res) => {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  })
  res.json({ ok: true })
})

app.get('/api/session', (req, res) => {
  const token = req.cookies[SESSION_COOKIE]
  
  if (!token) {
    return res.json({ authenticated: false })
  }

  try {
    jwt.verify(token, JWT_SECRET)
    res.json({ authenticated: true })
  } catch (error) {
    res.json({ authenticated: false })
  }
})

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
