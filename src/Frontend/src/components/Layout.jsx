import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { PiedDePage } from './PiedDePage'

// Layout principal : barre de navigation + contenu + pied de page
export function Layout() {
  return (
    <div className="layout">
      <Navbar />
      <main className="contenu-principal">
        <Outlet />
      </main>
      <PiedDePage />
    </div>
  )
}
