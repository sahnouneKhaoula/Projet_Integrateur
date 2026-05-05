/**
 * Base URL API : vide en dev → requêtes relatives (proxy Vite /api → backend).
 * Production : définir VITE_API_BASE_URL si le front est sur un autre domaine.
 */
const RAW = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '')

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  return RAW ? `${RAW}${p}` : p
}
