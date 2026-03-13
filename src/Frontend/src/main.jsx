import React from 'react'
import ReactDOM from 'react-dom/client'
import { routeur } from './routes.jsx'
import { RouterProvider } from 'react-router-dom'
import './Style/index.css' 



// Point d'entrée : on monte l'app React dans la div #racine
ReactDOM.createRoot(document.getElementById('racine')).render(
  <React.StrictMode>

    <RouterProvider router={routeur} />
    
  </React.StrictMode>
)
