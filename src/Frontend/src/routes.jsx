import { createBrowserRouter } from 'react-router-dom'
import { Layout } from './composants/Layout'
import { PageAccueil } from './pages/Accueil'
import { PageChambres } from './pages/Chambres'
import { PageServices } from './pages/Services'
import { PageReservation } from './pages/Reservation'
import { PageConnexion } from './pages/Connexion'

// Définition des routes de l'application
export const routeur = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <PageAccueil /> },
      { path: 'chambres', element: <PageChambres /> },
      { path: 'services', element: <PageServices /> },
      { path: 'reservation', element: <PageReservation /> }
    ]
  },
  { path: '/connexion', element: <PageConnexion /> }
])
