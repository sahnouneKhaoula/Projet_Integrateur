import { RouterProvider } from 'react-router-dom'
import { routeur } from './routes'

// Point d'entrée : on affiche le routeur avec toutes les pages
function App() {
  return <RouterProvider router={routeur} />
}

export default App
