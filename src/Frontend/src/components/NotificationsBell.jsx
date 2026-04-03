import { useState, useEffect, useRef } from 'react';

const BASE = 'http://localhost:3002';
const token = () => localStorage.getItem('token');

const TYPE_CONFIG = {
    event_pending:   { icone: '🕐', couleur: 'var(--primaire)' },
    event_confirmed: { icone: '✅', couleur: '#4caf50' },
    event_cancelled: { icone: '❌', couleur: '#ef5350' },
    default:         { icone: '🔔', couleur: 'var(--mute-texte)' },
};

function fmt(d) {
    if (!d) return '';
    const date = new Date(d);
    const diff  = Date.now() - date.getTime();
    if (diff < 60_000)  return 'à l\'instant';
    if (diff < 3_600_000) return `il y a ${Math.floor(diff / 60_000)} min`;
    if (diff < 86_400_000) return `il y a ${Math.floor(diff / 3_600_000)}h`;
    return date.toLocaleDateString('fr-CA', { day: '2-digit', month: 'short' });
}

export default function NotificationsBell() {
    const [notifs, setNotifs]   = useState([]);
    const [nb, setNb]           = useState(0);
    const [ouvert, setOuvert]   = useState(false);
    const [chargement, setChargement] = useState(false);
    const ref = useRef(null);

    // Fermer si clic à l'extérieur
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOuvert(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Polling du compteur toutes les 30s
    const chargerNb = async () => {
        try {
            const res = await fetch(`${BASE}/api/notifications/non-lues`, { headers: { Authorization: `Bearer ${token()}` } });
            if (res.ok) { const d = await res.json(); setNb(d.nb); }
        } catch {}
    };

    useEffect(() => {
        chargerNb();
        const intervalle = setInterval(chargerNb, 30_000);
        return () => clearInterval(intervalle);
    }, []);

    const ouvrir = async () => {
        setOuvert(prev => !prev);
        if (!ouvert) {
            setChargement(true);
            try {
                const res = await fetch(`${BASE}/api/notifications`, { headers: { Authorization: `Bearer ${token()}` } });
                if (res.ok) setNotifs(await res.json());
            } catch {}
            finally { setChargement(false); }
        }
    };

    const toutLire = async () => {
        await fetch(`${BASE}/api/notifications/lire-tout`, { method: 'PATCH', headers: { Authorization: `Bearer ${token()}` } });
        setNb(0);
        setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    };

    return (
        <div className="nb-wrap" ref={ref}>
            <button className="nb-cloche" onClick={ouvrir} title="Notifications">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {nb > 0 && <span className="nb-badge">{nb > 99 ? '99+' : nb}</span>}
            </button>

            {ouvert && (
                <div className="nb-panel">
                    <div className="nb-panel-header">
                        <span className="nb-panel-titre">Notifications</span>
                        {nb > 0 && (
                            <button className="nb-btn-lire-tout" onClick={toutLire}>Tout lire</button>
                        )}
                    </div>

                    <div className="nb-liste">
                        {chargement ? (
                            <div className="nb-vide">Chargement…</div>
                        ) : notifs.length === 0 ? (
                            <div className="nb-vide">
                                <span>🎉</span>
                                <p>Aucune notification</p>
                            </div>
                        ) : notifs.map(n => {
                            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.default;
                            return (
                                <div key={n.id} className={`nb-item ${!n.is_read ? 'nb-item--nl' : ''}`}>
                                    <div className="nb-item-icone" style={{ color: cfg.couleur }}>{cfg.icone}</div>
                                    <div className="nb-item-corps">
                                        <p className="nb-item-titre">{n.title}</p>
                                        <p className="nb-item-msg">{n.message}</p>
                                        <span className="nb-item-date">{fmt(n.created_at)}</span>
                                    </div>
                                    {!n.is_read && <div className="nb-item-point" />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
