import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GestionRoles from '../components/GestionRoles.jsx';

Object.defineProperty(window, 'localStorage', {
  value: { getItem: () => 'fake-jwt-token' },
});

const mockRoles = [
  { id: 1, name: 'admin',          nb_utilisateurs: 2 },
  { id: 2, name: 'client',         nb_utilisateurs: 5 },
  { id: 3, name: 'responsable_it', nb_utilisateurs: 0 },
];

beforeEach(() => {
  global.fetch = vi.fn(async (url, { method = 'GET' } = {}) => {
    if (method === 'GET')    return { ok: true, json: async () => mockRoles };
    if (method === 'POST')   return { ok: true, json: async () => ({ message: 'Rôle créé avec succès' }) };
    if (method === 'DELETE') return { ok: true, json: async () => ({ message: 'Rôle supprimé avec succès' }) };
  });
  vi.spyOn(window, 'confirm').mockReturnValue(true);
});
afterEach(() => vi.restoreAllMocks());

describe('GestionRoles', () => {
  it('affiche la liste des rôles après chargement', async () => {
    render(<GestionRoles />);
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('responsable_it')).toBeInTheDocument();
    });
  });

  it('protège les rôles système — badge visible, pas de bouton supprimer', async () => {
    render(<GestionRoles />);
    await waitFor(() => expect(screen.getAllByText('🔒 Système')).toHaveLength(2));
    // Le seul bouton supprimer doit être pour responsable_it, pas pour admin/client
    expect(screen.getAllByRole('button', { name: /🗑️/i })).toHaveLength(1);
  });

  it('affiche une erreur si on soumet le formulaire vide', async () => {
    render(<GestionRoles />);
    await userEvent.click(screen.getByRole('button', { name: /créer le rôle/i }));
    expect(screen.getByText(/veuillez saisir un nom de rôle/i)).toBeInTheDocument();
  });

  it('crée un rôle et affiche le message de succès', async () => {
    render(<GestionRoles />);
    await userEvent.type(screen.getByLabelText(/nom du rôle/i), 'Comptabilite');
    await userEvent.click(screen.getByRole('button', { name: /créer le rôle/i }));
    await waitFor(() =>
      expect(screen.getByText(/rôle créé avec succès/i)).toBeInTheDocument()
    );
  });

  it('supprime un rôle après confirmation', async () => {
    render(<GestionRoles />);
    await waitFor(() => screen.getByTitle('Supprimer'));
    await userEvent.click(screen.getByTitle('Supprimer'));
    await waitFor(() =>
      expect(screen.getByText(/rôle supprimé avec succès/i)).toBeInTheDocument()
    );
  });

  it("n'appelle pas DELETE si l'utilisateur annule la confirmation", async () => {
    window.confirm.mockReturnValue(false);
    render(<GestionRoles />);
    await waitFor(() => screen.getByTitle('Supprimer'));
    await userEvent.click(screen.getByTitle('Supprimer'));
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/roles\/\d+/),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});
