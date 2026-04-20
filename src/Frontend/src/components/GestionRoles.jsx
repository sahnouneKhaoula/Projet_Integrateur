import { useState, useEffect } from 'react';


export default function GestionRoles() {
  const [roles, setRoles] = useState([]);
  const [nouveauRole, setNouveauRole] = useState('');
  const [chargement, setChargement] = useState(false);
  const [message, setMessage] = useState({ texte: '', type: '' });

  const token = localStorage.getItem('token');

  const chargerRoles = async () => {
    try {
      const res = await fetch('http://localhost:3002/api/roles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setRoles(data);
    } catch (err) {
      console.error('Erreur chargement rôles:', err);
    }
  };

  useEffect(() => { chargerRoles(); }, []);

  const creerRole = async (e) => {
    e.preventDefault();
    setMessage({ texte: '', type: '' });
    if (!nouveauRole.trim()) {
      setMessage({ texte: 'Veuillez saisir un nom de rôle.', type: 'erreur' });
      return;
    }
    setChargement(true);
    try {
      const res = await fetch('http://localhost:3002/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: nouveauRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage({ texte: `✅ ${data.message}`, type: 'succes' });
      setNouveauRole('');
      chargerRoles();
    } catch (err) {
      setMessage({ texte: `⚠️ ${err.message}`, type: 'erreur' });
    } finally {
      setChargement(false);
    }
  };

  const supprimerRole = async (id, nom) => {
    if (!window.confirm(`Supprimer le rôle "${nom}" ?`)) return;
    setMessage({ texte: '', type: '' });
    try {
      const res = await fetch(`http://localhost:3002/api/roles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage({ texte: `✅ ${data.message}`, type: 'succes' });
      chargerRoles();
    } catch (err) {
      setMessage({ texte: `⚠️ ${err.message}`, type: 'erreur' });
    }
  };

  const rolesSysteme = ['admin', 'client']; // Rôles protégés

  return (
    <div className="gestion-roles">
      {/* En-tête */}
      <div className="gr-header">
        <div>
          <h1 className="gr-titre">Gestion des Rôles</h1>
          <p className="gr-sous-titre">{roles.length} rôle(s) configuré(s)</p>
        </div>
      </div>

      {/* Message de retour */}
      {message.texte && (
        <div className={`gr-message gr-message--${message.type}`}>
          {message.texte}
        </div>
      )}

      <div className="gr-layout">
        {/* Colonne gauche: Formulaire d'ajout */}
        <div className="gr-formulaire-carte">
          <h2 className="gr-formulaire-titre">➕ Ajouter un rôle</h2>
          <p className="gr-formulaire-desc">
            Le nom sera automatiquement mis en minuscules et les espaces remplacés par des underscores.
            <br />Ex : <em>Responsable Technique</em> → <em>responsable_technique</em>
          </p>
          <form onSubmit={creerRole} className="gr-formulaire">
            <div className="gr-champ">
              <label htmlFor="nouveauRole">Nom du rôle *</label>
              <input
                type="text"
                id="nouveauRole"
                value={nouveauRole}
                onChange={(e) => setNouveauRole(e.target.value)}
                placeholder="Ex: Responsable IT"
              />
            </div>
            <button type="submit" className="gr-btn-principal" disabled={chargement}>
              {chargement ? 'Création...' : 'Créer le rôle'}
            </button>
          </form>
        </div>

        {/* Colonne droite: Liste des rôles */}
        <div className="gr-liste-carte">
          <h2 className="gr-liste-titre">Rôles existants</h2>
          <div className="gr-liste">
            {roles.map(role => (
              <div key={role.id} className="gr-role-item">
                <div className="gr-role-info">
                  <span className="gr-role-nom">{role.name}</span>
                  <span className="gr-role-count">
                    {role.nb_utilisateurs} utilisateur{role.nb_utilisateurs !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="gr-role-actions">
                  {rolesSysteme.includes(role.name) ? (
                    <span className="gr-badge-systeme">🔒 Système</span>
                  ) : (
                    <button
                      className="gr-btn-supprimer"
                      onClick={() => supprimerRole(role.id, role.name)}
                      title={role.nb_utilisateurs > 0 ? 'Ce rôle a des utilisateurs' : 'Supprimer'}
                      disabled={role.nb_utilisateurs > 0}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
