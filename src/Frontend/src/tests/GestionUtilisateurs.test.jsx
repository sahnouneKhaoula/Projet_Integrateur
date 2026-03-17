import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GestionUtilisateurs from '../components/GestionUtilisateurs.jsx';

Object.defineProperty(window, 'localStorage', {
  value: { getItem: () => 'fake-jwt-token' },
});

const mockUtilisateurs = [
  {
    id: 1, first_name: 'Marie', last_name: 'Tremblay',
    email: 'marie@lapromenade.ca', role_name: 'admin',
    phone: '514-555-0100', is_active: true, created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2, first_name: 'Jean', last_name: 'Dupont',
    email: 'jean@lapromenade.ca', role_name: 'organisateur',
    phone: null, is_active: false, created_at: '2024-03-01T08:30:00Z',
  },
];

const mockRolesStaff = [
  { id: 2, name: 'organisateur' },
  { id: 3, name: 'coordonnateur' },
];

beforeEach(() => {
  global.fetch = vi.fn(async (url, { method = 'GET' } = {}) => {
    if (method === 'GET' && url.includes('roles-staff'))
      return { ok: true, json: async () => mockRolesStaff };
    if (method === 'GET')
      return { ok: true, json: async () => mockUtilisateurs };
    if (method === 'POST')
      return { ok: true, json: async () => ({ message: 'Compte créé' }) };
  });
});
afterEach(() => vi.restoreAllMocks());

// ─── Helper : ouvre le formulaire et remplit les champs requis ────────────────
async function remplirEtSoumettre(overrides = {}) {
  const defaults = {
    prenom: 'Sophie', nom: 'Martin',
    email: 'sophie@lapromenade.ca', motDePasse: 'secret123',
  };
  const d = { ...defaults, ...overrides };

  await userEvent.click(screen.getByRole('button', { name: /nouveau compte staff/i }));
  await waitFor(() => screen.getByLabelText(/prénom/i));

  if (d.prenom)     await userEvent.type(screen.getByLabelText(/prénom/i), d.prenom);
  if (d.nom)        await userEvent.type(screen.getByLabelText(/^nom \*/i), d.nom);
  if (d.email)      await userEvent.type(screen.getByLabelText(/adresse email/i), d.email);
  if (d.motDePasse) await userEvent.type(screen.getByLabelText(/mot de passe/i), d.motDePasse);

  await userEvent.click(screen.getByRole('button', { name: /créer le compte/i }));
}

describe('GestionUtilisateurs', () => {
  it('affiche les utilisateurs dans le tableau', async () => {
    render(<GestionUtilisateurs />);
    await waitFor(() => {
      expect(screen.getByText('marie@lapromenade.ca')).toBeInTheDocument();
      expect(screen.getByText('jean@lapromenade.ca')).toBeInTheDocument();
    });
  });

  it('affiche les statuts Actif / Inactif correctement', async () => {
    render(<GestionUtilisateurs />);
    await waitFor(() => {
      expect(screen.getByText('Actif')).toBeInTheDocument();
      expect(screen.getByText('Inactif')).toBeInTheDocument();
    });
  });

  it('affiche le formulaire au clic sur "Nouveau compte Staff"', async () => {
    render(<GestionUtilisateurs />);
    await userEvent.click(screen.getByRole('button', { name: /nouveau compte staff/i }));
    expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
  });

  it('affiche une erreur si les champs obligatoires sont vides', async () => {
    render(<GestionUtilisateurs />);
    await userEvent.click(screen.getByRole('button', { name: /nouveau compte staff/i }));
    await waitFor(() => screen.getByRole('button', { name: /créer le compte/i }));
    await userEvent.click(screen.getByRole('button', { name: /créer le compte/i }));
    expect(
      screen.getByText(/veuillez remplir tous les champs obligatoires/i)
    ).toBeInTheDocument();
  });

  it('affiche une erreur si le mot de passe est trop court', async () => {
    render(<GestionUtilisateurs />);
    await remplirEtSoumettre({ motDePasse: '123' });
    expect(
      screen.getByText(/le mot de passe doit contenir au moins 5 caractères/i)
    ).toBeInTheDocument();
  });

  it('crée un compte et affiche le message de succès', async () => {
    render(<GestionUtilisateurs />);
    await remplirEtSoumettre();
    await waitFor(() =>
      expect(screen.getByText(/sophie martin créé avec succès/i)).toBeInTheDocument()
    );
  });

  it('ferme le formulaire après une création réussie', async () => {
    render(<GestionUtilisateurs />);
    await remplirEtSoumettre();
    await waitFor(() =>
      expect(screen.queryByLabelText(/prénom/i)).not.toBeInTheDocument()
    );
  });
});
