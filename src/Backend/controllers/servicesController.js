import { poolPromise } from '../db/db.js';



// Récupérer tous les services
export const getAllServices = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Services');
        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Ajouter un service
export const createService = async (req, res) => {
    const { event_id, name, price } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('event_id', event_id)
            .input('name', name)
            .input('price', price || 0)
            .query(`INSERT INTO Services (event_id, name, price) 
                    VALUES (@event_id, @name, @price)`);
        res.status(201).json({ message: "Service créé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création", error: error.message });
    }
};




// ─────────────────────────────────────────────────────────────────────────────
// Statuts possibles d'une demande de service :
//   DEMANDÉ                  → soumis par l'organisateur
//   EN ATTENTE               → infos manquantes, retour demandé à l'organisateur
//   VALIDÉ                   → accepté par le coordinateur
//   PROGRAMMÉ                → confirmé / planifié
// ─────────────────────────────────────────────────────────────────────────────


// Creer une demande de service | Organisateur

export const creerDemandesServices = async (req, res) => {
    const { event_id, name, price } = req.body;
    const services = req.body.services;
    if (!services.length) {
    return res.status(400).json({ message: 'Aucun service fourni.' });
}
    try {
        const pool = await poolPromise;
        await pool.request()
        .input('event_id', event_id)
        .query('SELECT * FROM Events WHERE id = @event_id');
        if (!result.recordset.length) {
            return res.status(400).json({ message: 'L\'événement n\'existe pas.' });
        }
        


 } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
 }
}



//Genere un statut qui est (DEMANDE, ATTENTE, VALIDE) | coordinator
export const genererStatut = async (req, res) => { 
    const { id } = req.body;
    const status = req.body.status;
    if (!id || !status) {
        return res.status(400).json({ message: 'Aucun id ou statut fourni.' });
    }
    try {
        const pool = await poolPromise;
        await pool.request()
        .input('id', id)
        .input('status', status)
        .query('UPDATE Services SET status = @status WHERE id = @id');
        res.status(200).json({ message: "Statut modifié avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }

 }

//charger les demandes de service et leur status | Coordinateur

export const chargerDemandesServices = async (req, res) => { 

    if (!services.length) {
    return res.status(400).json({ message: 'Aucun service fourni.' });
} try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Services');
    res.status(200).json(result.recordset);
} catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
}

//Taiter les demandes de service | Coordinateur

export const traiterDemandeService = async (req, res) => { 
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Aucun id fourni.' });
    }
    try {
        const pool = await poolPromise;
        await pool.request()
        .input('id', id)
        .query('UPDATE Services SET status = 2 WHERE id = @id');
        res.status(200).json({ message: "Demande traitée avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
 }