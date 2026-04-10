const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/auth.middleware');
const { addAvis, getAvisByAnnonce, deleteAvis } = require('../controllers/avisControllers');

// Ajouter un avis sur une annonce (connecté)
router.post('/avis/:idAnnonce', auth, addAvis);

// Lire tous les avis d'une annonce (public)
router.get('/avis/:idAnnonce', getAvisByAnnonce);

// Supprimer son propre avis (connecté)
router.delete('/avis/:idAvis', auth, deleteAvis);

module.exports = router;