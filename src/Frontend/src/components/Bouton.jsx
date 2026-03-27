// Bouton réutilisable — variantes CSS : primaire / secondaire / fantôme ; tailles via classes .bouton--*
export function Bouton({ children, variant = 'primaire', taille = 'normal', type = 'button', className = '', ...props }) {
  const classes = ['bouton', `bouton--${variant}`, `bouton--${taille}`]
  if (className) classes.push(className)
  return (
    <button type={type} className={classes.join(' ')} {...props}>
      {children}
    </button>
  )
}
