import { useState, useEffect } from 'react';
import '../Style/GestionUtilisateurs.css';

export default function GestionUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [rolesStaff, setRolesStaff] = useState([]);
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [message, setMessage] = useState({ texte: '', type: '' });

  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    motDePasse: '',
    role_id: ''
  });

  const token = localStorage.getItem('token');

  // Charger la liste des utilisateurs
  const chargerUtilisateurs = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUtilisateurs(data);
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
    }
  };

  // Charger les rôles Staff disponibles
  const chargerRoles = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/users/roles-staff', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setRolesStaff(data);
        if (data.length > 0) setFormData(f => ({ ...f, role_id: data[0].id }));
      }
    } catch (err) {
      console.error('Erreur chargement rôles:', err);
    }
  };

  useEffect(() => {
    chargerUtilisateurs();
    chargerRoles();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const soumettre = async (e) => {
    e.preventDefault();
    setMessage({ texte: '', type: '' });

    if (!formData.prenom || !formData.nom || !formData.email || !formData.motDePasse || !formData.role_id) {
      setMessage({ texte: 'Veuillez remplir tous les champs obligatoires.', type: 'erreur' });
      return;
    }

    if (formData.motDePasse.length < 5) {
      setMessage({ texte: 'Le mot de passe doit contenir au moins 5 caractères.', type: 'erreur' });
      return;
    }

    setChargement(true);
    try {
      const username = `${formData.prenom.toLowerCase()}_${formData.nom.toLowerCase()}`.replace(/[^a-z0-9_]/g, '');
      const res = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username,
          email: formData.email,
          password: formData.motDePasse,
          first_name: formData.prenom,
          last_name: formData.nom,
          phone: formData.telephone || null,
          role_id: parseInt(formData.role_id)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors de la création.');

      setMessage({ texte: `✅ Compte de ${formData.prenom} ${formData.nom} créé avec succès !`, type: 'succes' });
      setFormData({ prenom: '', nom: '', email: '', telephone: '', motDePasse: '', role_id: rolesStaff[0]?.id || '' });
      setAfficherFormulaire(false);
      chargerUtilisateurs(); // Rafraîchir la liste

    } catch (err) {
      setMessage({ texte: `⚠️ ${err.message}`, type: 'erreur' });
    } finally {
      setChargement(false);
    }
  };

  const getBadgeRole = (role) => {
    const badges = {
      admin: 'badge--admin',
      organisateur: 'badge--organisateur',
      coordonnateur: 'badge--coordonnateur',
      comptabilite: 'badge--comptabilite',
      client: 'badge--client',
    };
    return badges[role] || 'badge--defaut';
  };

  return (
    <div className="gestion-utilisateurs">
      {/* En-tête */}
      <div className="gu-header">
        <div>
          <h1 className="gu-titre">Gestion des Utilisateurs</h1>
          <p className="gu-sous-titre">{utilisateurs.length} compte(s) enregistré(s)</p>
        </div>
        <button className="gu-btn-principal" onClick={() => { setAfficherFormulaire(!afficherFormulaire); setMessage({ texte: '', type: '' }); }}>
          {afficherFormulaire ? '✕ Annuler' : '＋ Nouveau compte Staff'}
        </button>
      </div>

      {/* Message de retour */}
      {message.texte && (
        <div className={`gu-message gu-message--${message.type}`}>
          {message.texte}
        </div>
      )}

      {/* Formulaire de création */}
      {afficherFormulaire && (
        <div className="gu-formulaire-carte">
          <h2 className="gu-formulaire-titre">Créer un compte Staff</h2>
          <form onSubmit={soumettre} className="gu-formulaire">
            <div className="gu-grille-2">
              <div className="gu-champ">
                <label>Prénom *</label>
                <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Ex: Marie" required />
              </div>
              <div className="gu-champ">
                <label>Nom *</label>
                <input type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder="Ex: Tremblay" required />
              </div>
            </div>

            <div className="gu-champ">
              <label>Adresse email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="marie.tremblay@lapromenade.ca" required />
            </div>

            <div className="gu-grille-2">
              <div className="gu-champ">
                <label>Téléphone</label>
                <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="514-555-0100" />
              </div>
              <div className="gu-champ">
                <label>Rôle *</label>
                <select name="role_id" value={formData.role_id} onChange={handleChange} required>
                  {rolesStaff.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="gu-champ">
              <label>Mot de passe provisoire *</label>
              <input type="password" name="motDePasse" value={formData.motDePasse} onChange={handleChange} placeholder="Min. 5 caractères" required />
            </div>

            <div className="gu-formulaire-actions">
              <button type="submit" className="gu-btn-principal" disabled={chargement}>
                {chargement ? 'Création...' : 'Créer le compte'}
              </button>
              <button type="button" className="gu-btn-secondaire" onClick={() => setAfficherFormulaire(false)}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tableau des utilisateurs */}
      <div className="gu-table-carte">
        <table className="gu-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Téléphone</th>
              <th>Statut</th>
              <th>Créé le</th>
            </tr>
          </thead>
          <tbody>
            {utilisateurs.length === 0 ? (
              <tr><td colSpan="6" className="gu-table-vide">Aucun utilisateur trouvé.</td></tr>
            ) : (
              utilisateurs.map(u => (
                <tr key={u.id}>
                  <td className="gu-td-nom">
                    <div className="gu-avatar">{(u.first_name?.[0] || u.email[0]).toUpperCase()}</div>
                    <span>{u.first_name} {u.last_name}</span>
                  </td>
                  <td>{u.email}</td>
                  <td><span className={`gu-badge ${getBadgeRole(u.role_name)}`}>{u.role_name}</span></td>
                  <td>{u.phone || '—'}</td>
                  <td>
                    <span className={`gu-statut ${u.is_active ? 'gu-statut--actif' : 'gu-statut--inactif'}`}>
                      {u.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString('fr-CA')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
