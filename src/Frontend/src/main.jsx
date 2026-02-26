import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Point d'entrée : on monte l'app React dans la div #racine
ReactDOM.createRoot(document.getElementById('racine')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
