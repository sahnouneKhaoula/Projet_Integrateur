import { useState, useEffect } from 'react'
import './App.css'
import Comptabilite from './components/Comptabilite'
import Dashboard from './components/Dashboard'
import Evenements from './components/Evenements'
import Espaces from './components/Espaces'
import Services from './components/Services'
import Parametres from './components/Parametres'

import { RouterProvider } from 'react-router-dom'
import { routeur } from './routes'

// Point d'entrée : on affiche le routeur avec toutes les pages
function App() {

  const [apiStatus, setApiStatus] = useState("");
 const [activeTab, setActiveTab] = useState("");
 


  const renderTab = (activeTab) => {
   switch (activeTab){
    case "Tableau de bord":
      return <Dashboard/>
    case "Events":
      return <Evenements />
    case "Espaces":
      return <Espaces />
      case "Services":
        return <Services />
      case "Comptabilité":
        return <Comptabilite />
      case "Parametres" :
        return <Parametres />
   }
  }
  
  

  useEffect(() => {
    fetch("http://localhost:3000/api/health")
      .then(res => res.json())
      .then(data => setApiStatus(data.message))
      .catch(err => console.error(err));
  }, []);


 

  return (
    <div className="App">

    <aside className="Sidebar">

      <div className="Branding" >
        <h1>Hôtel de la Promenade</h1>
        <p>Gestion d'evenements</p>
      </div>

      <div className="Tabs">
        <button className={activeTab === "Tableau de bord" ? "active" : ""}
            onClick={() => setActiveTab("Tableau de bord")}> Tableau de bord</button>
        <button className={activeTab === "Parametres" ? "active" : ""}
        onClick={() => setActiveTab("Parametres")}> Parametres</button>
        <button className={activeTab === "Espaces" ? "active" : ""}
        onClick={() => setActiveTab("Espaces")}> Espaces</button>
        <button  className={activeTab === "Services" ? "active" : ""}
        onClick={() => setActiveTab("Services")}> Services</button>
        <button className={activeTab === "Comptabilité" ? "active" : ""}
        onClick={() => setActiveTab("Comptabilité")}> Comptabilité</button>
        <button className={activeTab === "Events" ? "active" : ""}
        onClick={() => setActiveTab("Events")}> Events</button>
      </div>

      <div className="Profile">
        <div className="ProfilePicture"></div>
        <div className="ProfileName">Gabriel</div>
        <div className="ProfileDescription">Administrateur</div>
        <button className="ProfileButton">Déconnexion</button>
      </div>
    </aside>



        <main className="main-content">
        {renderTab(activeTab)}
        </main>
    </div>

  

    


     

  )

  return <RouterProvider router={routeur} />
}

export default App

