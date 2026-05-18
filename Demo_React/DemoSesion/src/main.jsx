import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
//import App from './App.jsx'
//import AppLocalStorage from './sesionLocalStorage/AppLocalStorage'
//import AppCookie from './cookies/AppCookie'
import AppCookieHttpOnly from './cookieHttpOnly/AppCookieHttpOnly'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppCookieHttpOnly />
  </StrictMode>,
)
