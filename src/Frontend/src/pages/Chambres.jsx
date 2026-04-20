import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bouton } from '../components/Bouton'
import { Carte, CarteTitre, CarteDescription, CarteContenu } from '../components/Carte'

// Page Chambres & Suites avec filtres (catégorie, vue, budget)
export function PageChambres() {
  const [categorie, setCategorie] = useState('toutes')
  const [vue, setVue] = useState('toutes')
  const [budget, setBudget] = useState('tous')

  const chambres = [
    { id: 1, nom: 'Chambre Deluxe', categorie: 'chambre', description: 'Élégance contemporaine avec tout le confort moderne', prix: 450, taille: 45, capacite: 2, vue: 'Jardin', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80', equipements: ['Wi-Fi', 'Minibar', 'Climatisation', 'TV 55"'] },
    { id: 2, nom: 'Suite Prestige', categorie: 'suite', description: 'Espace généreux avec salon séparé et vue imprenable', prix: 850, taille: 80, capacite: 3, vue: 'Ville', image: 'https://images.unsplash.com/photo-1759223198981-661cadbbff36?w=800&q=80', equipements: ['Salon privé', 'Balcon', 'Nespresso', 'Baignoire spa'] },
    { id: 3, nom: 'Suite Royale', categorie: 'suite', description: 'Luxe absolu avec service de majordome personnalisé', prix: 1500, taille: 150, capacite: 4, vue: 'Panoramique', image: 'https://images.unsplash.com/photo-1694485190402-3ed8f6e85350?w=800&q=80', equipements: ['2 chambres', 'Terrasse', 'Bar personnel', 'Majordome'] },
    { id: 4, nom: 'Chambre Supérieure', categorie: 'chambre', description: 'Confort raffiné dans un cadre intimiste', prix: 350, taille: 35, capacite: 2, vue: 'Cour', image: 'https://images.unsplash.com/photo-1723108263618-5364ae353220?w=800&q=80', equipements: ['Literie premium', 'Douche pluie', 'Coffre-fort'] },
    { id: 5, nom: 'Penthouse', categorie: 'suite', description: "L'excellence à son paroxysme avec rooftop privé", prix: 3500, taille: 300, capacite: 6, vue: 'Panoramique', image: 'https://images.unsplash.com/photo-1723119832675-0031e0f0408c?w=800&q=80', equipements: ['3 chambres', 'Rooftop 200m²', 'Jacuzzi', 'Chef à domicile'] },
    { id: 6, nom: 'Chambre Executive', categorie: 'chambre', description: "Parfait pour les voyageurs d'affaires exigeants", prix: 550, taille: 50, capacite: 2, vue: 'Ville', image: 'https://images.unsplash.com/photo-1663659504863-43dd69a5fda2?w=800&q=80', equipements: ['Bureau', 'Lounge', 'Check-in privé'] }
  ]

  const chambresFiltrees = chambres.filter((c) => {
    if (categorie !== 'toutes' && c.categorie !== categorie) return false
    if (vue !== 'toutes' && c.vue !== vue) return false
    if (budget === 'bas' && c.prix > 500) return false
    if (budget === 'moyen' && (c.prix < 500 || c.prix > 1500)) return false
    if (budget === 'haut' && c.prix < 1500) return false
    return true
  })

  return (
    <div className="page-chambres">
      <section className="page-en-tete">
        <h1>Chambres & Suites</h1>
        <p>Découvrez nos chambres et suites d'exception, conçues pour offrir un confort absolu et une élégance raffinée.</p>
      </section>

      <section className="filtres">
        <div className="filtres-grille">
          <div className="champ-select">
            <label>Catégorie</label>
            <select value={categorie} onChange={(e) => setCategorie(e.target.value)}>
              <option value="toutes">Toutes les catégories</option>
              <option value="chambre">Chambres</option>
              <option value="suite">Suites</option>
            </select>
          </div>
          <div className="champ-select">
            <label>Vue</label>
            <select value={vue} onChange={(e) => setVue(e.target.value)}>
              <option value="toutes">Toutes les vues</option>
              <option value="Jardin">Vue Jardin</option>
              <option value="Ville">Vue Ville</option>
              <option value="Cour">Vue Cour</option>
              <option value="Panoramique">Vue Panoramique</option>
            </select>
          </div>
          <div className="champ-select">
            <label>Budget</label>
            <select value={budget} onChange={(e) => setBudget(e.target.value)}>
              <option value="tous">Tous les budgets</option>
              <option value="bas">Jusqu'à 500$</option>
              <option value="moyen">500$ - 1 500$</option>
              <option value="haut">Plus de 1 500$</option>
            </select>
          </div>
        </div>
        <p className="resultats">{chambresFiltrees.length} {chambresFiltrees.length > 1 ? 'résultats trouvés' : 'résultat trouvé'}</p>
      </section>

      <section className="liste-chambres">
        {chambresFiltrees.map((chambre) => (
          <Carte key={chambre.id} hover className="carte-chambre">
            <div className="carte-chambre-image">
              <img src={chambre.image} alt={chambre.nom} />
              <span className="badge-type">{chambre.categorie === 'suite' ? 'Suite' : 'Chambre'}</span>
            </div>
            <div className="carte-chambre-body">
              <CarteTitre>{chambre.nom}</CarteTitre>
              <CarteDescription>{chambre.description}</CarteDescription>
              <div className="infos-chambre">
                <span>📐 {chambre.taille}m²</span>
                <span>👥 {chambre.capacite} pers.</span>
                <span>👁 {chambre.vue}</span>
              </div>
              <div className="equipements">
                {chambre.equipements.slice(0, 4).map((eq, i) => (
                  <span key={i} className="equip">✓ {eq}</span>
                ))}
              </div>
              <div className="carte-chambre-footer">
                <div>
                  <span className="prix-nuit">{chambre.prix}$</span>
                  <span className="par-nuit">par nuit</span>
                </div>
              </div>
            </div>
          </Carte>
        ))}
      </section>

      <section className="section-cta section-cta-chambres">
        <h2>Besoin d'aide pour choisir ?</h2>
        <p>Notre équipe de conciergerie est à votre disposition pour vous conseiller.</p>
        <Bouton variant="secondaire">Contacter la Conciergerie</Bouton>
      </section>
    </div>
  )
}
