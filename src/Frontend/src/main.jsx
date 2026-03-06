import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './Style/App.css'
import './Style/index.css'
import { routeur } from './routes.jsx'
import { RouterProvider } from 'react-router-dom'


// Point d'entrée : on monte l'app React dans la div #racine
ReactDOM.createRoot(document.getElementById('racine')).render(
  <React.StrictMode>
    
   <RouterProvider router={routeur} />

   <App />

   </React.StrictMode>
)
