import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [apiStatus, setApiStatus] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/health")
      .then(res => res.json())
      .then(data => setApiStatus(data.message))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Projet Hôtel</h1>
      <p>API status : {apiStatus}</p>
    </div>
  )
}

export default App
