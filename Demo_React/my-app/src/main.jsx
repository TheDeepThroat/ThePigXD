import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import MiComponente from './componentes/MiComponente.jsx'
import Tarjeta from './componentes/Tarjeta.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Tarjeta
      imagen="mango"
      nombre="MANGO"
      region="Sur de México"
      texto="Es un fruto tropical que se da en climas calurosos, generalmente propio del sur de México"
    />
    <Tarjeta
      imagen="nopal"
      nombre="NOPAL"
      region="Todo México"
      texto="Es un fruto que se da en un cactus propio de climas áridos, se da en todo México"
    />
    <Tarjeta
      imagen="coco"
      nombre="COCO"
      region="Sur de México"
      texto="Es una fruta tropical que se da en palmeras, se da en el sur de México"
    />

  </StrictMode>,
)
