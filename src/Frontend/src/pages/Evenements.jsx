/**
 * Catalogue « Événements & salles » — même logique que le flux luxury (onglets, filtres, cartes),
 * données : API /api/salles + enrichissement local (JS pur, pas TypeScript).
 */
import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bouton } from '../components/Bouton'
import { ImageAvecRepli } from '../components/ImageAvecRepli'
import { enrichirSallesPourEvenements, ONGLETS_TYPES_EVENEMENT } from '../data/sallesEvenements'
import { apiUrl } from '../config/apiBase'

export function PageEvenements() {
  const [sallesBrutes, setSallesBrutes] = useState([])
  const [chargement, setChargement] = useState(true)
  const [typeSelectionne, setTypeSelectionne] = useState('all')
  const [filtres, setFiltres] = useState({ capaciteMin: 0, categorie: 'all' })

  useEffect(() => {
    let annule = false
    fetch(apiUrl('/api/salles'))
      .then(async (r) => {
        if (!r.ok) throw new Error('api')
        return r.json()
      })
      .then((data) => {
        if (annule) return
        setSallesBrutes(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (annule) return
        setSallesBrutes([])
      })
      .finally(() => {
        if (!annule) setChargement(false)
      })
    return () => {
      annule = true
    }
  }, [])

  const salles = useMemo(() => enrichirSallesPourEvenements(sallesBrutes), [sallesBrutes])

  const categories = useMemo(() => {
    const uniques = [...new Set(salles.map((s) => s.category))]
    return ['all', ...uniques.sort()]
  }, [salles])

  const sallesFiltrees = useMemo(() => {
    return salles.filter((s) => {
      const okType =
        typeSelectionne === 'all' || (Array.isArray(s.types) && s.types.includes(typeSelectionne))
      const okCap = s.capacitySeated >= filtres.capaciteMin
      const okCat = filtres.categorie === 'all' || s.category === filtres.categorie
      return okType && okCap && okCat
    })
  }, [salles, typeSelectionne, filtres])

  const reinitialiserFiltres = () => {
    setFiltres({ capaciteMin: 0, categorie: 'all' })
    setTypeSelectionne('all')
  }

  return (
    <div className="page-evenements-catalogue">
      <header className="evenements-catalogue-entete">
        <span className="evenements-catalogue-eyebrow">Salles &amp; réceptions</span>
        <h1>Événements &amp; salles</h1>
        <p className="evenements-catalogue-soustitre">
          Des espaces prestigieux pour vos réceptions, mariages et séminaires — le même niveau d’exigence que le
          palace La Promenade.
        </p>
      </header>

      <div className="evenements-onglets-wrap">
        <div className="evenements-onglets-inner">
          <div className="evenements-onglets" role="tablist" aria-label="Type d’événement">
          {ONGLETS_TYPES_EVENEMENT.map((onglet) => (
            <button
              key={onglet.id}
              type="button"
              role="tab"
              aria-selected={typeSelectionne === onglet.id}
              className={`evenements-onglet ${typeSelectionne === onglet.id ? 'evenements-onglet--actif' : ''}`}
              onClick={() => setTypeSelectionne(onglet.id)}
            >
              <span className="lp-emoji lp-emoji--tab" aria-hidden>
                {onglet.emoji}
              </span>
              {onglet.label}
            </button>
          ))}
          </div>
        </div>
      </div>

      <div className="evenements-catalogue-corps">
        <aside className="evenements-filtres">
          <div className="evenements-filtres-carte">
            <h3>Filtres</h3>

            <div className="evenements-filtre-bloc">
              <label htmlFor="filtre-categorie">Type de salle</label>
              <div className="evenements-filtre-categories">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`evenements-filtre-cat ${filtres.categorie === cat ? 'evenements-filtre-cat--actif' : ''}`}
                    onClick={() => setFiltres((f) => ({ ...f, categorie: cat }))}
                  >
                    {cat === 'all' ? 'Toutes' : cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="evenements-filtre-bloc">
              <label htmlFor="filtre-cap">Capacité minimum (assise)</label>
              <select
                id="filtre-cap"
                value={filtres.capaciteMin}
                onChange={(e) =>
                  setFiltres((f) => ({ ...f, capaciteMin: parseInt(e.target.value, 10) || 0 }))
                }
              >
                <option value={0}>Toutes capacités</option>
                <option value={30}>30+ personnes</option>
                <option value={50}>50+ personnes</option>
                <option value={100}>100+ personnes</option>
                <option value={200}>200+ personnes</option>
              </select>
            </div>

            <Bouton type="button" variant="secondaire" onClick={reinitialiserFiltres}>
              Réinitialiser
            </Bouton>
          </div>
        </aside>

        <div className="evenements-resultats">
          {chargement ? (
            <div className="evenements-chargement" role="status" aria-live="polite">
              <span className="evenements-chargement-label">Chargement du catalogue</span>
              <div className="evenements-chargement-bar" aria-hidden />
            </div>
          ) : (
            <>
              <p className="evenements-resultats-compte">
                <span className="evenements-resultats-nombre">{sallesFiltrees.length}</span>
                <span className="evenements-resultats-libelle">
                  {sallesFiltrees.length === 0
                    ? 'aucune salle ne correspond à ces critères'
                    : sallesFiltrees.length === 1
                      ? 'salle correspond à votre recherche'
                      : 'salles correspondent à votre recherche'}
                </span>
              </p>

              <div className="evenements-grille-cartes">
                {salles.length === 0 ? (
                  <div className="evenements-vide">
                    Aucune salle n&apos;est encore enregistrée. Connectez l&apos;API et ajoutez des salles (table
                    Salles) pour afficher le catalogue.
                  </div>
                ) : sallesFiltrees.length === 0 ? (
                  <div className="evenements-vide">Aucune salle ne correspond à ces filtres.</div>
                ) : (
                  sallesFiltrees.map((salle) => (
                    <article key={salle.id} className="evenements-carte-luxe">
                      <div className="evenements-carte-media">
                        <ImageAvecRepli
                          src={salle.image}
                          alt={salle.nom}
                          className="evenements-carte-img"
                        />
                        <span className="evenements-carte-badge">{salle.category}</span>
                        <div className="evenements-carte-media-shade" aria-hidden />
                      </div>
                      <div className="evenements-carte-corps">
                        <h2 className="evenements-carte-titre">{salle.nom}</h2>
                        {salle.location ? (
                          <p className="evenements-carte-lieu">{salle.location}</p>
                        ) : null}
                        <p className="evenements-carte-desc">{salle.description}</p>

                        <div className="evenements-carte-stats">
                          <div className="evenements-carte-stat evenements-carte-stat--assise">
                            <span className="lp-emoji lp-emoji--stat lp-emoji--seul" aria-hidden>🪑</span>
                            <span>
                              <span className="petit">Assise</span>
                              <span className="gras">{salle.capacitySeated} pers.</span>
                            </span>
                          </div>
                          <div className="evenements-carte-stat evenements-carte-stat--debout">
                            <span className="lp-emoji lp-emoji--stat lp-emoji--seul" aria-hidden>👥</span>
                            <span>
                              <span className="petit">Debout</span>
                              <span className="gras">{salle.capacityStanding} pers.</span>
                            </span>
                          </div>
                          <div className="evenements-carte-stat evenements-carte-stat--surface">
                            <span className="lp-emoji lp-emoji--stat lp-emoji--seul" aria-hidden>⬡</span>
                            <span>
                              <span className="petit">Surface</span>
                              <span className="gras">{salle.size} m²</span>
                            </span>
                          </div>
                          <div className="evenements-carte-stat evenements-carte-stat--tarif">
                            <span className="lp-emoji lp-emoji--stat lp-emoji--seul" aria-hidden>💎</span>
                            <span>
                              <span className="petit">À partir de</span>
                              <span className="gras">{salle.price} $</span>
                            </span>
                          </div>
                        </div>

                        <div className="evenements-carte-tags">
                          <span>Événements</span>
                          <div className="evenements-carte-tags-liste">
                            {salle.types.slice(0, 4).map((tag) => (
                              <span key={tag} className="evenements-carte-tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="evenements-carte-actions">
                          <Link
                            to={`/evenements/${salle.id}`}
                            className="bouton bouton--secondaire bouton--normal bouton-plein"
                          >
                            Voir détails
                          </Link>
                          <Link
                            to={`/demande-evenement?salle=${salle.id}`}
                            className="bouton bouton--primaire bouton--normal bouton-plein"
                          >
                            Demander un devis
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
