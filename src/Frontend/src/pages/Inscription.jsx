import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bouton } from '../components/Bouton'

// Inscription client public — appelle POST /api/users/register puis redirige vers la connexion ou l'accueil

export function PageInscription() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        prenom: '',
        nom: '',
        email: '',
        telephone: '',
        motDePasse: '',
        confirmation: ''
    });

    const [erreur, setErreur] = useState('');
    const [succes, setSucces] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const soumettre = async (e) => {
        e.preventDefault();
        setErreur('');
        setSucces('');

        // Validations de base
        if (!formData.prenom || !formData.nom || !formData.email || !formData.motDePasse) {
            setErreur("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        if (formData.motDePasse !== formData.confirmation) {
            setErreur("Les mots de passe ne correspondent pas.");
            return;
        }

        if (formData.motDePasse.length < 5) {
            setErreur("Le mot de passe doit contenir au moins 5 caractères.");
            return;
        }

        setLoading(true);

        try {
            const reponse = await fetch('http://localhost:3001/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: formData.prenom,
                    last_name: formData.nom,
                    email: formData.email,
                    phone: formData.telephone,
                    password: formData.motDePasse,
                }),
            });

            const data = await reponse.json();

            if (!reponse.ok) {
                throw new Error(data.message || "Erreur lors de l'inscription.");
            }

            setSucces("Inscription réussie ! Connexion en cours...");

            // Stocker le token et les infos (auto-login géré par le backend)
            localStorage.setItem('token', data.token);
            localStorage.setItem('utilisateur', JSON.stringify(data.user));

            // Redirection après un léger délai pour voir le message de succès
            setTimeout(() => {
                // C'est un client, on l'envoie toujours à l'accueil
                navigate('/');
                // On force le rafraîchissement pour que la Navbar "capte" l'état connecté
                window.location.reload();
            }, 1500);

        } catch (err) {
            setErreur(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="page-connexion">
            {/* Côté gauche : Image et Accroche (identique à la Connexion pour la cohérence) */}
            <div className="page-connexion-visuel">
                <img
                    src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1080&q=80"
                    alt="Hôtel de Luxe"
                    className="page-connexion-img"
                />
                <div className="page-connexion-overlay" />
                <div className="page-connexion-visuel-texte">
                    <h2>Rejoignez l'Expérience</h2>
                    <p>Devenez un client privilégié et accédez à nos offres exclusives, à la gestion de vos réservations et au sur-mesure de l'Hôtel La Promenade.</p>

                    <div className="page-connexion-securite">
                        <span>🔒 Protection de vos données</span>
                    </div>
                </div>
            </div>

            {/* Côté droit : Formulaire d'inscription */}
            <div className="page-connexion-formulaire-wrap">
                <div className="page-connexion-formulaire">
                    <Link to="/" className="page-connexion-retour">
                        ← Retour à l'accueil
                    </Link>

                    <div className="page-connexion-carte">
                        <div className="page-connexion-entete">
                            <span className="page-connexion-logo">Hôtel La Promenade</span>
                        </div>
                        <p className="page-connexion-sous-titre">Portail Client</p>
                        <h1 className="page-connexion-titre">Création de compte</h1>
                        <p className="page-connexion-description">Veuillez renseigner vos informations personnelles.</p>


                        {erreur && (
                            <div className="page-connexion-erreur">
                                <p>⚠️ {erreur}</p>
                            </div>
                        )}

                        {succes && (
                            <div className="page-connexion-erreur" style={{ background: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', borderLeftColor: '#4caf50' }}>
                                <p>✅ {succes}</p>
                            </div>
                        )}

                        <form onSubmit={soumettre} className="page-connexion-champs">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="champ">
                                    <label htmlFor="prenom">Prénom *</label>
                                    <div className="champ-input-wrap">
                                        <input
                                            type="text"
                                            id="prenom"
                                            name="prenom"
                                            placeholder="Ex: Jean"
                                            value={formData.prenom}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="champ">
                                    <label htmlFor="nom">Nom *</label>
                                    <div className="champ-input-wrap">
                                        <input
                                            type="text"
                                            id="nom"
                                            name="nom"
                                            placeholder="Ex: Dupont"
                                            value={formData.nom}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="champ">
                                <label htmlFor="email">Adresse email *</label>
                                <div className="champ-input-wrap">
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="jean.dupont@exemple.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                    <span className="champ-icone">✉️</span>
                                </div>
                            </div>

                            <div className="champ">
                                <label htmlFor="telephone">Numéro de téléphone</label>
                                <div className="champ-input-wrap">
                                    <input
                                        type="tel"
                                        id="telephone"
                                        name="telephone"
                                        placeholder="Ex: 514-555-0198"
                                        value={formData.telephone}
                                        onChange={handleChange}
                                    />
                                    <span className="champ-icone">📞</span>
                                </div>
                            </div>

                            <div className="champ">
                                <label htmlFor="motDePasse">Mot de passe *</label>
                                <div className="champ-input-wrap">
                                    <input
                                        type="password"
                                        id="motDePasse"
                                        name="motDePasse"
                                        placeholder="••••••••"
                                        value={formData.motDePasse}
                                        onChange={handleChange}
                                        required
                                    />
                                    <span className="champ-icone">🔒</span>
                                </div>
                            </div>

                            <div className="champ">
                                <label htmlFor="confirmation">Confirmer le mot de passe *</label>
                                <div className="champ-input-wrap">
                                    <input
                                        type="password"
                                        id="confirmation"
                                        name="confirmation"
                                        placeholder="••••••••"
                                        value={formData.confirmation}
                                        onChange={handleChange}
                                        required
                                    />
                                    <span className="champ-icone">🔒</span>
                                </div>
                            </div>

                            <Bouton
                                type="submit"
                                variant="primaire"
                                taille="grand"
                                className="bouton-connexion-plein"
                                disabled={loading}
                            >
                                {loading ? "Création en cours..." : "Créer mon compte"}
                            </Bouton>

                        </form>

                        <div className="page-connexion-footer">
                            <span className="page-connexion-footer-texte">Vous avez déjà un compte ?</span>
                            <Link to="/connexion" className="page-connexion-footer-lien">
                                Se connecter
                            </Link>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    )
}
