import React, { useEffect, useState, useMemo } from 'react';
import '../Style/Espaces.css';

const BASE = 'http://localhost:3002';
const token = () => localStorage.getItem('token');

const typeFromName = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('conf') || n.includes('conference')) return 'Conférence';
  if (n.includes('réunion') || n.includes('reunion') || n.includes('meeting')) return 'Réunion';
  if (n.includes('mariage') || n.includes('banquet') || n.includes('gala')) return 'Mariage / Banquet';
  if (n.includes('atelier') || n.includes('workshop')) return 'Atelier';
  return 'Polyvalente';
};

export default function Espaces() {
  const [salles, setSalles] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  const [recherche, setRecherche] = useState('');
  const [filtreType, setFiltreType] = useState('tous');
  const [filtreCapacite, setFiltreCapacite] = useState('toutes');

  const [modalOuvert, setModalOuvert] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', type: 'Conférence', capacity: '', location: '' });
  const [formErreur, setFormErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const utilisateur = (() => {
    try { return JSON.parse(localStorage.getItem('utilisateur') || '{}'); }
    catch { return {}; }
  })();
  const role = utilisateur?.role;
  const canCreate = ['admin', 'coordonnateur'].includes(role);
  const [sallesStats, setSallesStats] = useState(null);

  useEffect(() => {
    const charger = async () => {
      setChargement(true);
      setErreur('');
      try {
        const res = await fetch(`${BASE}/api/salles`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Impossible de charger les salles.');
        setSalles(data);
      } catch (err) {
        setErreur(err.message);
      } finally {
        setChargement(false);
      }
    };

    const chargerStats = async () => {
      try {
        const res = await fetch(`${BASE}/api/salles/stats`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        const data = await res.json();
        if (res.ok) setSallesStats(data);
      } catch {}
    };

    charger();
    chargerStats();
  }, []);

  const sallesEnrichies = useMemo(
    () => salles.map(s => ({ ...s, type: typeFromName(s.name) })),
    [salles]
  );

  const sallesFiltrees = useMemo(
    () =>
      sallesEnrichies
        .filter(s =>
          !recherche
            ? true
            : (s.name || '').toLowerCase().includes(recherche.toLowerCase()) ||
              (s.location || '').toLowerCase().includes(recherche.toLowerCase())
        )
        .filter(s => (filtreType === 'tous' ? true : s.type === filtreType))
        .filter(s => {
          if (filtreCapacite === 'toutes') return true;
          if (filtreCapacite === 'petite') return s.capacity < 50;
          if (filtreCapacite === 'moyenne') return s.capacity >= 50 && s.capacity <= 150;
          if (filtreCapacite === 'grande') return s.capacity > 150;
          return true;
        }),
    [sallesEnrichies, recherche, filtreType, filtreCapacite]
  );

  const stats = useMemo(() => {
    if (!sallesEnrichies.length) return null;
    const total = sallesEnrichies.length;
    const nbConf = sallesEnrichies.filter(s => s.type === 'Conférence').length;
    const nbMariage = sallesEnrichies.filter(s => s.type === 'Mariage / Banquet').length;
    return { total, nbConf, nbMariage };
  }, [sallesEnrichies]);

  const ouvrirModal = () => {
    setForm({ code: '', name: '', type: 'Conférence', capacity: '', location: '' });
    setFormErreur('');
    setModalOuvert(true);
  };

  const handleChange = e =>
    setForm(f => ({
      ...f,
      [e.target.name]: e.target.value,
    }));

  const soumettre = async e => {
    e.preventDefault();
    setFormErreur('');
    if (!form.name || !form.capacity) {
      setFormErreur('Identifiant, nom et capacité sont obligatoires.');
      return;
    }
    const cap = parseInt(form.capacity, 10);
    if (Number.isNaN(cap) || cap <= 0) {
      setFormErreur('La capacité doit être un nombre positif.');
      return;
    }
    setEnvoi(true);
    try {
      const nomBase = form.name.trim();
      const code = form.code.trim();
      const typeLibelle = form.type;
      const nomComplet = `${code ? `#${code} – ` : ''}${nomBase} (${typeLibelle})`;

      const res = await fetch(`${BASE}/api/salles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ name: nomComplet, capacity: cap, location: form.location || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors de la création de la salle.');
      setSalles(prev => [
        ...prev,
        { id: Date.now(), name: nomComplet, capacity: cap, location: form.location },
      ]);
      setModalOuvert(false);
    } catch (err) {
      setFormErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="espaces-page">
      <div className="espaces-header">
        <div>
          <h1 className="espaces-titre">Salles & Espaces</h1>
          <p className="espaces-sous-titre">
            Gérez les salles de conférence, réunions, mariages et espaces polyvalents de l&apos;hôtel.
          </p>
        </div>
        {canCreate && (
          <button className="espaces-btn-primaire" onClick={ouvrirModal}>
            <span>+ Ajouter une salle</span>
          </button>
        )}
      </div>

      {stats && (
        <div className="espaces-stats">
          <button
            type="button"
            className="espaces-stat-carte espaces-stat-carte--button"
            onClick={() => {
              setFiltreType('tous');
              setFiltreCapacite('toutes');
            }}
          >
            <span className="espaces-stat-label">Salles actives</span>
            <span className="espaces-stat-valeur">{stats.total}</span>
          </button>
          <button
            type="button"
            className="espaces-stat-carte espaces-stat-carte--button"
            onClick={() => setFiltreType('Conférence')}
          >
            <span className="espaces-stat-label">Salles de conférence</span>
            <span className="espaces-stat-valeur">{stats.nbConf}</span>
          </button>
          <button
            type="button"
            className="espaces-stat-carte espaces-stat-carte--button"
            onClick={() => setFiltreType('Mariage / Banquet')}
          >
            <span className="espaces-stat-label">Mariage / banquet</span>
            <span className="espaces-stat-valeur">{stats.nbMariage}</span>
          </button>
          
        </div>
      )}

      {/* Barre de recherche + filtres */}
      <div className="espaces-filtres-barre">
        <div className="espaces-recherche-wrap">
          <input
            className="espaces-recherche"
            placeholder="Rechercher une salle ou un emplacement…"
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
          />
        </div>
        <div className="espaces-filtres">
          <select value={filtreType} onChange={e => setFiltreType(e.target.value)}>
            <option value="tous">Tous les types</option>
            <option value="Conférence">Conférence</option>
            <option value="Réunion">Réunion</option>
            <option value="Mariage / Banquet">Mariage / Banquet</option>
            <option value="Atelier">Atelier</option>
            <option value="Polyvalente">Polyvalente</option>
          </select>
          <select value={filtreCapacite} onChange={e => setFiltreCapacite(e.target.value)}>
            <option value="toutes">Toutes capacités</option>
            <option value="petite">&lt; 50 pers.</option>
            <option value="moyenne">50–150 pers.</option>
            <option value="grande">&gt; 150 pers.</option>
          </select>
        </div>
      </div>

      {/* Grille des salles */}
      {chargement ? (
        <div className="espaces-loading">Chargement des salles…</div>
      ) : sallesFiltrees.length === 0 ? (
        <div className="espaces-vide">
          <span>🛎️</span>
          <p>Aucune salle trouvée avec ces critères.</p>
          {canCreate && (
            <button className="espaces-btn-primaire" onClick={ouvrirModal}>
              Ajouter une première salle
            </button>
          )}
        </div>
      ) : (
        <div className="espaces-grille">
          {sallesFiltrees.map(salle => (
            <div key={salle.id} className="espaces-carte">
              <div className="espaces-carte-entete">
                <span className="espaces-badge-type">{salle.type}</span>
                <span className="espaces-badge-capacite">{salle.capacity} pers.</span>
              </div>
              <h3 className="espaces-carte-titre">
                {salle.name}
                <span className="espaces-carte-id">#{salle.id}</span>
              </h3>
              <p className="espaces-carte-location">{salle.location || 'Emplacement non précisé'}</p>
              <p className="espaces-carte-meta">
                Idéal pour les {salle.type.toLowerCase()} au sein de l&apos;Hôtel La Promenade.
              </p>
            </div>
          ))}
        </div>
      )}

      {modalOuvert && (
        <div className="espaces-overlay" onClick={() => setModalOuvert(false)}>
          <div className="espaces-modal" onClick={e => e.stopPropagation()}>
            <button className="espaces-modal-fermer" onClick={() => setModalOuvert(false)}>
              ✕
            </button>
            <h2 className="espaces-modal-titre">Ajouter une salle</h2>
            {formErreur && <div className="espaces-message espaces-message--erreur">⚠️ {formErreur}</div>}
            <form onSubmit={soumettre} className="espaces-form">
              <div className="espaces-form-champ">
                <label>Identifiant de la salle</label>
                <input
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="Ex: C101"
                />
              </div>
              <div className="espaces-form-champ">
                <label>Nom de la salle *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ex: Salle Conférence Montréal"
                  required
                />
              </div>
              <div className="espaces-form-champ">
                <label>Type de salle</label>
                <select name="type" value={form.type} onChange={handleChange}>
                  <option value="Conférence">Conférence</option>
                  <option value="Réunion">Réunion</option>
                  <option value="Mariage / Banquet">Mariage / Banquet</option>
                  <option value="Atelier">Atelier</option>
                  <option value="Polyvalente">Polyvalente</option>
                </select>
              </div>
              <div className="espaces-form-champ">
                <label>Capacité (nombre de personnes) *</label>
                <input
                  type="number"
                  min="1"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  placeholder="Ex: 120"
                  required
                />
              </div>
              <div className="espaces-form-champ">
                <label>Emplacement</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Ex: 2e étage, aile conférence"
                />
              </div>
              <div className="espaces-form-actions">
                <button type="button" className="espaces-btn-secondaire" onClick={() => setModalOuvert(false)}>
                  Annuler
                </button>
                <button type="submit" className="espaces-btn-primaire" disabled={envoi}>
                  {envoi ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
