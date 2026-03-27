import { useState } from 'react'

// Affiche une image ; en cas d'erreur réseau ou URL invalide, remplace par un SVG placeholder
const IMAGE_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23161A22" width="400" height="300"/%3E%3Ctext fill="%23C9CED8" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EPhoto%3C/text%3E%3C/svg%3E'

export function ImageAvecRepli({ src, alt, className }) {
  const [erreur, setErreur] = useState(false)
  const url = erreur || !src ? IMAGE_PLACEHOLDER : src
  return (
    <img
      src={url}
      alt={alt || 'Photo'}
      className={className}
      onError={() => setErreur(true)}
    />
  )
}
