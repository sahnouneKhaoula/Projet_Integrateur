import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { PiedDePage } from './PiedDePage'

// Layout du site public : Navbar + zone où s'affichent les pages enfants (<Outlet />) + footer
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
