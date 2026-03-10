import { createBrowserRouter } from 'react-router-dom'
import { Layout } from './components/Layout'
import { PageAccueil } from './pages/Accueil'
import { PageChambres } from './pages/Chambres'
import { PageServices } from './pages/Services'
import { PageConnexion } from './pages/Connexion'
import { PageInscription } from './pages/Inscription'
import App from './App'

// Définition des routes de l'application
export const routeur = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <PageAccueil /> },
      { path: 'chambres', element: <PageChambres /> },
      { path: 'services', element: <PageServices /> },
      // { path: 'reservation', element: <PageReservation /> }
    ]
  },
  { path: '/connexion', element: <PageConnexion /> },
  { path: '/inscription', element: <PageInscription /> },
  { path: '/dashboard', element: <App /> },


])
