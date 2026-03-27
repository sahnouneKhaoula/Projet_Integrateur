/**
 * Page publique « Chambres & Suites » : hero, filtres, liste des hébergements (données statiques d'exemple).
 */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Carte, CarteTitre, CarteDescription } from '../components/Carte'
import { ImageAvecRepli } from '../components/ImageAvecRepli'

const HERO_IMG =
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1920&q=85'

const CHAMBRES = [
  { id: 1, nom: 'Chambre Deluxe', categorie: 'chambre', description: 'Élégance contemporaine avec tout le confort moderne', prix: 450, taille: 45, capacite: 2, vue: 'Jardin', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80', equipements: ['Wi-Fi', 'Minibar', 'Climatisation', 'TV 55"'] },
  { id: 2, nom: 'Suite Prestige', categorie: 'suite', description: 'Espace généreux avec salon séparé et vue imprenable', prix: 850, taille: 80, capacite: 3, vue: 'Ville', image: 'https://images.unsplash.com/photo-1759223198981-661cadbbff36?w=1200&q=80', equipements: ['Salon privé', 'Balcon', 'Nespresso', 'Baignoire spa'] },
  { id: 3, nom: 'Suite Royale', categorie: 'suite', description: 'Luxe absolu avec service de majordome personnalisé', prix: 1500, taille: 150, capacite: 4, vue: 'Panoramique', image: 'https://images.unsplash.com/photo-1694485190402-3ed8f6e85350?w=1200&q=80', equipements: ['2 chambres', 'Terrasse', 'Bar personnel', 'Majordome'] },
  { id: 4, nom: 'Chambre Supérieure', categorie: 'chambre', description: 'Confort raffiné dans un cadre intimiste', prix: 350, taille: 35, capacite: 2, vue: 'Cour', image: 'https://images.unsplash.com/photo-1723108263618-5364ae353220?w=1200&q=80', equipements: ['Literie premium', 'Douche pluie', 'Coffre-fort'] },
  { id: 5, nom: 'Penthouse', categorie: 'suite', description: "L'excellence à son paroxysme avec rooftop privé", prix: 3500, taille: 300, capacite: 6, vue: 'Panoramique', image: 'https://images.unsplash.com/photo-1723119832675-0031e0f0408c?w=1200&q=80', equipements: ['3 chambres', 'Rooftop 200m²', 'Jacuzzi', 'Chef à domicile'], featured: true },
  { id: 6, nom: 'Chambre Executive', categorie: 'chambre', description: "Parfait pour les voyageurs d'affaires exigeants", prix: 550, taille: 50, capacite: 2, vue: 'Ville', image: 'https://images.unsplash.com/photo-1663659504863-43dd69a5fda2?w=1200&q=80', equipements: ['Bureau', 'Lounge', 'Check-in privé'] }
]

// Page Chambres & Suites — présentation palace (zigzag + suite vedette)
export function PageChambres() {
  const [categorie, setCategorie] = useState('toutes')
  const [vue, setVue] = useState('toutes')
  const [budget, setBudget] = useState('tous')

  const chambresFiltrees = useMemo(() => {
    const f = CHAMBRES.filter((c) => {
      if (categorie !== 'toutes' && c.categorie !== categorie) return false
      if (vue !== 'toutes' && c.vue !== vue) return false
      if (budget === 'bas' && c.prix > 500) return false
      if (budget === 'moyen' && (c.prix < 500 || c.prix > 1500)) return false
      if (budget === 'haut' && c.prix < 1500) return false
      return true
    })
    return [...f].sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      return a.id - b.id
    })
  }, [categorie, vue, budget])

  return (
    <div className="page-chambres">
      <section className="chambres-hero" aria-label="Chambres et suites">
        <div className="chambres-hero-media">
          <ImageAvecRepli
            src={HERO_IMG}
            alt="Suite d'exception — Hôtel La Promenade"
            className="chambres-hero-img"
          />
          <div className="chambres-hero-overlay" aria-hidden />
          <div className="chambres-hero-grain" aria-hidden />
          <div className="chambres-hero-vignette" aria-hidden />
        </div>
        <div className="chambres-hero-inner">
          <div className="chambres-hero-contenu">
            <p className="chambres-hero-eyebrow">Hôtel La Promenade · Palace 5 étoiles</p>
            <h1 className="chambres-hero-titre">
              Chambres <span className="chambres-hero-titre-italic">&amp; Suites</span>
            </h1>
            <p className="chambres-hero-lead">
              Là où le silence, la lumière et le détail deviennent signature.
            </p>
            <p className="chambres-hero-texte">
              Chaque espace est pensé comme un refuge : bois précieux, textiles d’exception et une
              acoustique étudiée pour des nuits d’une douceur absolue.
            </p>
            <div className="chambres-hero-badges">
              <span className="chambres-hero-pill">Literie signature</span>
              <span className="chambres-hero-pill">Salle de bain spa</span>
              <span className="chambres-hero-pill">Conciergerie 24/7</span>
            </div>
          </div>
          <div className="chambres-hero-deco" aria-hidden>
            <span className="chambres-hero-ligne" />
            <span className="chambres-hero-annee">Est. 1924</span>
          </div>
        </div>
        <div className="chambres-hero-scroll" aria-hidden="true">
          <span>Découvrir</span>
          <span className="chambres-hero-scroll-line" />
        </div>
      </section>

      <div className="chambres-trust-wrap">
        <div className="chambres-trust" role="presentation">
          <div className="chambres-trust-inner">
            <div className="chambres-trust-item">
              <span className="chambres-trust-chiffre">6</span>
              <span className="chambres-trust-label">gammes</span>
            </div>
            <div className="chambres-trust-sep" aria-hidden />
            <div className="chambres-trust-item">
              <span className="chambres-trust-chiffre">35–300</span>
              <span className="chambres-trust-label">m²</span>
            </div>
            <div className="chambres-trust-sep" aria-hidden />
            <div className="chambres-trust-item">
              <span className="chambres-trust-chiffre">5★</span>
              <span className="chambres-trust-label">palace</span>
            </div>
            <div className="chambres-trust-sep" aria-hidden />
            <div className="chambres-trust-item">
              <span className="chambres-trust-chiffre">24/7</span>
              <span className="chambres-trust-label">conciergerie</span>
            </div>
          </div>
        </div>
      </div>

      <p className="chambres-editorial">
        <span className="chambres-editorial-line" aria-hidden />
        <span className="chambres-editorial-texte">
          Une collection d’adresses intérieures — du cocon intimiste au penthouse panoramique.
        </span>
        <span className="chambres-editorial-line" aria-hidden />
      </p>

      <section className="filtres filtres-chambres" aria-label="Filtrer les hébergements">
        <div className="filtres-chambres-panel">
          <div className="filtres-chambres-head">
            <h2 className="filtres-chambres-titre">Votre univers</h2>
            <p className="filtres-chambres-soustitre">Affinez par catégorie, vue et enveloppe budgétaire.</p>
          </div>
          <div className="filtres-grille filtres-grille--chambres">
            <div className="champ-select champ-select--chambres">
              <label htmlFor="filtre-categorie">Catégorie</label>
              <select
                id="filtre-categorie"
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
              >
                <option value="toutes">Toutes les catégories</option>
                <option value="chambre">Chambres</option>
                <option value="suite">Suites</option>
              </select>
            </div>
            <div className="champ-select champ-select--chambres">
              <label htmlFor="filtre-vue">Vue</label>
              <select id="filtre-vue" value={vue} onChange={(e) => setVue(e.target.value)}>
                <option value="toutes">Toutes les vues</option>
                <option value="Jardin">Vue jardin</option>
                <option value="Ville">Vue ville</option>
                <option value="Cour">Vue cour</option>
                <option value="Panoramique">Vue panoramique</option>
              </select>
            </div>
            <div className="champ-select champ-select--chambres">
              <label htmlFor="filtre-budget">Budget / nuit</label>
              <select id="filtre-budget" value={budget} onChange={(e) => setBudget(e.target.value)}>
                <option value="tous">Tous les budgets</option>
                <option value="bas">Jusqu’à 500&nbsp;$</option>
                <option value="moyen">500&nbsp;$ – 1&nbsp;500&nbsp;$</option>
                <option value="haut">Plus de 1&nbsp;500&nbsp;$</option>
              </select>
            </div>
          </div>
          <p className="resultats resultats-chambres">
            <strong>{chambresFiltrees.length}</strong>{' '}
            {chambresFiltrees.length > 1 ? 'propositions' : 'proposition'}
            <span className="resultats-chambres-dot">·</span>
            sélection sur mesure
          </p>
        </div>
      </section>

      <section className="liste-chambres" aria-label="Liste des hébergements">
        {chambresFiltrees.length === 0 ? (
          <div className="chambres-vide">
            <p className="chambres-vide-titre">Aucun résultat pour ces filtres</p>
            <p className="chambres-vide-texte">Élargissez la catégorie, la vue ou le budget pour voir plus d’offres.</p>
            <button
              type="button"
              className="bouton bouton--secondaire bouton--grand"
              onClick={() => {
                setCategorie('toutes')
                setVue('toutes')
                setBudget('tous')
              }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          chambresFiltrees.map((chambre, idx) => {
            const isFeatured = Boolean(chambre.featured)
            const zigReverse = !isFeatured && idx % 2 === 1
            return (
              <Carte
                key={chambre.id}
                hover={!isFeatured}
                className={[
                  'carte-chambre',
                  isFeatured ? 'carte-chambre--vedette carte-chambre--featured' : '',
                  !isFeatured && chambre.categorie === 'suite' ? 'carte-chambre--suite' : '',
                  zigReverse ? 'carte-chambre--reverse' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className={`carte-chambre-image ${isFeatured ? 'carte-chambre-image--featured' : ''}`}>
                  <span className="carte-chambre-num" aria-hidden>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <ImageAvecRepli
                    src={chambre.image}
                    alt={chambre.nom}
                    className="carte-chambre-img"
                  />
                  <div className="carte-chambre-image-shade" aria-hidden />
                  {chambre.featured && <span className="badge-vedette">Signature</span>}
                  <span className="badge-type">
                    {chambre.categorie === 'suite' ? 'Suite' : 'Chambre'}
                  </span>
                </div>
                <div className={`carte-chambre-body ${isFeatured ? 'carte-chambre-body--featured' : ''}`}>
                  {isFeatured && (
                    <p className="carte-chambre-kicker">L’expérience ultime</p>
                  )}
                  <CarteTitre>{chambre.nom}</CarteTitre>
                  <CarteDescription>{chambre.description}</CarteDescription>
                  <div className="infos-chambre">
                    <span title="Surface">{chambre.taille} m²</span>
                    <span title="Capacité">{chambre.capacite} pers. max</span>
                    <span title="Vue">{chambre.vue}</span>
                  </div>
                  <div className="equipements">
                    {chambre.equipements.slice(0, 4).map((eq, i) => (
                      <span key={i} className="equip">
                        {eq}
                      </span>
                    ))}
                  </div>
                  <div className="carte-chambre-footer">
                    <div className="carte-chambre-prix-bloc">
                      <span className="prix-depuis">À partir de</span>
                      <span className="prix-nuit">{chambre.prix.toLocaleString('fr-CA')}&nbsp;$</span>
                      <span className="par-nuit">par nuit · taxes en sus</span>
                    </div>
                    <Link to="/services" className="bouton bouton--primaire bouton--normal carte-chambre-cta">
                      {isFeatured ? 'Créer mon séjour' : 'Personnaliser'}
                    </Link>
                  </div>
                </div>
              </Carte>
            )
          })
        )}
      </section>

      <section className="section-cta section-cta-chambres">
        <div className="section-cta-chambres-inner">
          <p className="section-cta-chambres-eyebrow">Conciergerie</p>
          <h2>Une envie précise&nbsp;?</h2>
          <p>
            Étage élevé, vue prioritaire, accueil discret : nous orchestrons chaque détail avant votre
            arrivée.
          </p>
          <div className="boutons-cta">
            <Link to="/services" className="bouton bouton--primaire bouton--grand">
              Nos services
            </Link>
            <a href="mailto:concierge@lapromenade.example" className="bouton bouton--secondaire bouton--grand">
              Écrire à la conciergerie
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
