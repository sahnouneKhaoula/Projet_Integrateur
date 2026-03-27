// Carte visuelle générique : enveloppe .carte + sous-composants titre / description / contenu
export function Carte({ children, className = '', hover = false, ...props }) {
  const classes = ['carte'].concat(hover ? ['carte--hover'] : []).filter(Boolean)
  if (className) classes.push(className)
  return <div className={classes.join(' ')} {...props}>{children}</div>
}

export function CarteTitre({ children }) {
  return <h3 className="carte-titre">{children}</h3>
}

export function CarteDescription({ children }) {
  return <p className="carte-description">{children}</p>
}

export function CarteContenu({ children, className = '' }) {
  const classes = ['carte-contenu'].concat(className ? [className] : []).filter(Boolean)
  return <div className={classes.join(' ')}>{children}</div>
}
