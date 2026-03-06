import { Bouton } from '../components/Bouton'
import { CarteContenu } from '../components/Carte'

// Page Services : Spa, Restaurant, Conciergerie, Limousine, Événements, Décoration
export function PageServices() {
  const services = [
    { titre: 'Spa & Bien-être', description: 'Sanctuaire de 2000m² dédié à votre relaxation', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80', tarif: 'À partir de 180$/soin', points: ['Massages signature', 'Piscine 25m', 'Hammam & sauna', 'Cabines privées'] },
    { titre: 'Restaurant Gastronomique', description: 'Cuisine étoilée Michelin par le Chef Guillaume Marchand', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', tarif: 'Menu à partir de 280$', points: ['Menu 7 services', 'Cave 5000+ vins', 'Dîners en suite'] },
    { titre: 'Conciergerie Premium 24/7', description: 'Service personnalisé pour exaucer tous vos désirs', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', tarif: 'Inclus pour nos clients', points: ['Réservations spectacles', 'Excursions privées', 'Transferts VIP'] },
    { titre: 'Service Limousine', description: 'Flotte de véhicules de luxe à votre disposition', image: 'https://images.unsplash.com/photo-1583668925503-7fcc6606934c?w=800&q=80', tarif: 'À partir de 120$/trajet', points: ['Mercedes Classe S', 'Chauffeurs multilingues', 'Visites Paris'] },
    { titre: 'Événements Privés', description: 'Organisation sur mesure de vos célébrations', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80', tarif: 'Sur devis', points: ['Salles 10-500 pers.', 'Wedding planner', 'Traiteur sur mesure'] },
    { titre: 'Décoration Événementielle', description: "Créations florales et aménagements d'exception", image: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=800&q=80', tarif: 'À partir de 500$', points: ['Compositions signature', 'Décoration thématique', 'Partenariats designers'] }
  ]

  return (
    <div className="page-services">
      <section className="page-en-tete page-en-tete-services">
        <h1>Services sur Mesure</h1>
        <p>Une palette complète de services d'exception pour sublimer chaque instant de votre séjour.</p>
      </section>

      <section className="liste-services">
        {services.map((service, idx) => (
          <div key={idx} className={`bloc-service ${idx % 2 === 1 ? 'inverse' : ''}`}>
            <div className="bloc-service-image">
              <img src={service.image} alt={service.titre} />
            </div>
            <div className="bloc-service-contenu">
              <h2>{service.titre}</h2>
              <p className="description">{service.description}</p>
              <ul>
                {service.points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
                  <div className="bloc-service-footer">
                    <div>
                      <span className="label-tarif">Tarif</span>
                      <span className="tarif">{service.tarif}</span>
                    </div>
                  </div>
            </div>
          </div>
        ))}
      </section>

      <section className="section-cta section-cta-services">
        <h2>Packages & Offres Exclusives</h2>
        <p>Profitez de nos offres combinées : suite premium + spa + gastronomie à tarif privilégié.</p>
          <div className="boutons-cta">
            <Bouton variant="secondaire" taille="grand">Contactez-nous</Bouton>
          </div>
      </section>
    </div>
  )
}
