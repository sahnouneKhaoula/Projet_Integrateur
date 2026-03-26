import { useState, useRef } from 'react';
import '../Style/Rapports.css';

const BASE = 'http://localhost:3001';
const token = () => localStorage.getItem('token');

// ─── Téléchargement d'un export ─────────────────────────────────
const telechargerExport = async (endpoint, nomFichier) => {
    const res = await fetch(`${BASE}/api/export/${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token()}` }
    });
    if (!res.ok) throw new Error('Erreur lors de l\'export.');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = nomFichier; a.click();
    URL.revokeObjectURL(url);
};

// ─── Téléchargement d'un template ───────────────────────────────
const telechargerTemplate = async (type) => {
    const res = await fetch(`${BASE}/api/export/template/${type}`, {
        headers: { 'Authorization': `Bearer ${token()}` }
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `template_${type}.csv`; a.click();
    URL.revokeObjectURL(url);
};

// ─── Section Import ──────────────────────────────────────────────
function SectionImport({ type, titre, description, colonnes }) {
    const [fichier, setFichier] = useState(null);
    const [apercu, setApercu] = useState([]);
    const [enCours, setEnCours] = useState(false);
    const [resultat, setResultat] = useState(null);
    const [survol, setSurvol] = useState(false);
    const inputRef = useRef(null);

    const estExcel = (file) => file?.name?.endsWith('.xlsx') || file?.name?.endsWith('.xls');
    const estCSV   = (file) => file?.name?.endsWith('.csv');

    const lireFichier = (file) => {
        if (!file || (!estCSV(file) && !estExcel(file))) {
            alert('Veuillez sélectionner un fichier .csv ou .xlsx'); return;
        }
        setFichier(file); setResultat(null);
        const reader = new FileReader();
        if (estCSV(file)) {
            reader.onload = (e) => {
                const lignes = e.target.result.trim().split(/\r?\n/);
                setApercu(lignes.slice(0, 6));
            };
            reader.readAsText(file, 'UTF-8');
        } else {
            // Excel : aperçu limité
            setApercu([`📊 Fichier Excel : ${file.name}`, `Taille : ${(file.size / 1024).toFixed(1)} Ko`, 'Cliquez sur "Importer" pour traiter.']);
        }
    };

    const importer = async () => {
        if (!fichier) return;
        setEnCours(true); setResultat(null);
        const reader = new FileReader();

        const envoyerRequete = async (body) => {
            try {
                const res = await fetch(`${BASE}/api/import/${type}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token()}`
                    },
                    body: JSON.stringify(body)
                });
                const data = await res.json();
                setResultat(data);
            } catch (err) {
                setResultat({ message: err.message, erreurs: [] });
            } finally {
                setEnCours(false);
            }
        };

        if (estCSV(fichier)) {
            reader.onload = (e) => envoyerRequete({ csvContent: e.target.result });
            reader.readAsText(fichier, 'UTF-8');
        } else {
            // Excel : lire en base64 (extraire la partie après "base64,")
            reader.onload = (e) => {
                const base64 = e.target.result.split(',')[1];
                envoyerRequete({ fileContent: base64 });
            };
            reader.readAsDataURL(fichier);
        }
    };

    const reinitialiser = () => {
        setFichier(null); setApercu([]); setResultat(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className="rp-import-bloc">
            <div className="rp-import-bloc-header">
                <div>
                    <h3 className="rp-import-titre">{titre}</h3>
                    <p className="rp-import-desc">{description}</p>
                    <div className="rp-colonnes">
                        {colonnes.map(c => <span key={c} className="rp-colonne-badge">{c}</span>)}
                    </div>
                </div>
                <button className="rp-btn-template"
                    onClick={() => telechargerTemplate(type)}>
                    ⬇ Template CSV
                </button>
            </div>

            {/* Zone de dépôt */}
            <div
                className={`rp-dropzone ${survol ? 'rp-dropzone--survol' : ''} ${fichier ? 'rp-dropzone--ok' : ''}`}
                onClick={() => inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setSurvol(true); }}
                onDragLeave={() => setSurvol(false)}
                onDrop={e => { e.preventDefault(); setSurvol(false); lireFichier(e.dataTransfer.files[0]); }}
            >
                <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" hidden
                    onChange={e => lireFichier(e.target.files[0])} />
                {fichier ? (
                    <div className="rp-fichier-info">
                        <span className="rp-fichier-icone">{estExcel(fichier) ? '📊' : '📄'}</span>
                        <div>
                            <p className="rp-fichier-nom">{fichier.name}</p>
                            <p className="rp-fichier-taille">{(fichier.size / 1024).toFixed(1)} Ko · {estExcel(fichier) ? 'Excel' : 'CSV'}</p>
                        </div>
                        <button className="rp-btn-clear" onClick={e => { e.stopPropagation(); reinitialiser(); }}>✕</button>
                    </div>
                ) : (
                    <>
                        <span className="rp-dropzone-icone">📂</span>
                        <p className="rp-dropzone-texte">Glissez votre fichier ici ou cliquez pour sélectionner</p>
                        <p className="rp-dropzone-sous">Formats acceptés : <strong>.xlsx</strong> (Excel) · <strong>.csv</strong></p>
                    </>
                )}
            </div>

            {/* Aperçu du fichier */}
            {apercu.length > 0 && (
                <div className="rp-apercu">
                    <p className="rp-apercu-titre">Aperçu :</p>
                    <div className="rp-apercu-code">
                        {apercu.map((ligne, i) => (
                            <div key={i} className={`rp-apercu-ligne ${i === 0 && !fichier?.name?.endsWith('.xlsx') ? 'rp-apercu-entete' : ''}`}>
                                <span className="rp-apercu-num">{i === 0 && !fichier?.name?.endsWith?.('.xlsx') ? 'EN-TÊTE' : i === 0 ? '📊' : `L.${i + 1}`}</span>
                                <span>{ligne}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bouton Importer */}
            {fichier && !resultat && (
                <button className="rp-btn-importer" onClick={importer} disabled={enCours}>
                    {enCours ? '⏳ Import en cours…' : `🚀 Importer ${titre.toLowerCase()}`}
                </button>
            )}

            {/* Résultat */}
            {resultat && (
                <div className={`rp-resultat ${resultat.erreurs?.length === 0 ? 'rp-resultat--succes' : 'rp-resultat--partiel'}`}>
                    <p className="rp-resultat-message">{resultat.message}</p>
                    {resultat.inseres !== undefined && (
                        <div className="rp-resultat-stats">
                            <span className="rp-resultat-badge rp-badge--ok">✅ {resultat.inseres} importé(s)</span>
                            <span className="rp-resultat-badge rp-badge--total">📋 {resultat.total} total</span>
                            {resultat.erreurs?.length > 0 && (
                                <span className="rp-resultat-badge rp-badge--err">⚠️ {resultat.erreurs.length} erreur(s)</span>
                            )}
                        </div>
                    )}
                    {resultat.erreurs?.length > 0 && (
                        <div className="rp-erreurs-liste">
                            {resultat.erreurs.map((e, i) => <p key={i} className="rp-erreur-ligne">• {e}</p>)}
                        </div>
                    )}
                    <button className="rp-btn-reinit" onClick={reinitialiser}>↩ Nouveau fichier</button>
                </div>
            )}
        </div>
    );
}

// ─── Composant principal ─────────────────────────────────────────
export default function Rapports() {
    const [onglet, setOnglet] = useState('import');
    const [exportEnCours, setExportEnCours] = useState('');

    const exporter = async (endpoint, nomFichier, label) => {
        setExportEnCours(label);
        try {
            await telechargerExport(endpoint, nomFichier);
        } catch (err) {
            alert(err.message);
        } finally {
            setExportEnCours('');
        }
    };

    const exports = [
        { endpoint: 'events',  fichier: 'events.csv',  label: 'Événements',  desc: 'Tous les événements avec organisateur, salle et statut.', icone: '🎉' },
        { endpoint: 'users',   fichier: 'users.csv',   label: 'Utilisateurs', desc: 'Liste des comptes (clients et staff) avec leur rôle.',    icone: '👥' },
        { endpoint: 'salles',  fichier: 'salles.csv',  label: 'Salles',       desc: 'Toutes les salles avec capacité et emplacement.',         icone: '🏛️' },
        { endpoint: 'guests',  fichier: 'guests.csv',  label: 'Invités',      desc: 'Liste des invités par événement.',                         icone: '🎟️' },
    ];

    const imports = [
        {
            type: 'events', titre: 'Événements',
            description: 'Importer des événements depuis un fichier CSV ou Excel (.xlsx).',
            colonnes: ['titre', 'description', 'email_organisateur', 'date_debut', 'date_fin', 'nom_salle', 'statut']
        },
        {
            type: 'salles', titre: 'Salles',
            description: 'Importer des salles depuis un fichier CSV ou Excel (.xlsx).',
            colonnes: ['nom', 'capacite', 'emplacement']
        },
        {
            type: 'guests', titre: 'Invités',
            description: 'Importer des invités depuis un fichier CSV ou Excel (.xlsx).',
            colonnes: ['id_evenement', 'nom_complet', 'email', 'telephone']
        },
    ];

    return (
        <div className="rapports">
            <div className="rp-header">
                <div>
                    <h1 className="rp-titre">Rapports & Données</h1>
                    <p className="rp-sous-titre">Importez des données (CSV ou Excel) ou exportez des rapports</p>
                </div>
            </div>

            {/* Onglets */}
            <div className="rp-onglets">
                <button className={`rp-onglet ${onglet === 'import' ? 'rp-onglet--actif' : ''}`}
                    onClick={() => setOnglet('import')}>
                    📥 Import de données
                </button>
                <button className={`rp-onglet ${onglet === 'export' ? 'rp-onglet--actif' : ''}`}
                    onClick={() => setOnglet('export')}>
                    📤 Export de rapports
                </button>
            </div>

            {/* Contenu Import */}
            {onglet === 'import' && (
                <div className="rp-section">
                    <div className="rp-info-banner">
                        <span>ℹ️</span>
                        <span>Téléchargez d'abord le template pour chaque type de données, remplissez-le et importez-le ici. Les formats acceptés sont <strong>CSV</strong> et <strong>Excel (.xlsx)</strong>. Les données existantes ne seront pas écrasées.</span>
                    </div>
                    {imports.map(imp => (
                        <SectionImport key={imp.type} {...imp} />
                    ))}
                </div>
            )}

            {/* Contenu Export */}
            {onglet === 'export' && (
                <div className="rp-section">
                    <div className="rp-info-banner">
                        <span>ℹ️</span>
                        <span>Les fichiers CSV générés sont encodés en UTF-8 avec BOM pour une compatibilité parfaite avec Microsoft Excel.</span>
                    </div>
                    <div className="rp-export-grille">
                        {exports.map(ex => (
                            <div key={ex.endpoint} className="rp-export-carte">
                                <div className="rp-export-icone">{ex.icone}</div>
                                <div className="rp-export-info">
                                    <h3 className="rp-export-nom">{ex.label}</h3>
                                    <p className="rp-export-desc">{ex.desc}</p>
                                </div>
                                <button
                                    className="rp-btn-exporter"
                                    onClick={() => exporter(ex.endpoint, ex.fichier, ex.label)}
                                    disabled={exportEnCours === ex.label}
                                >
                                    {exportEnCours === ex.label ? '⏳ Génération…' : '⬇ Exporter CSV'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
