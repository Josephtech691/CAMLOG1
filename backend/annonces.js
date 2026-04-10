const express  = require('express');
const router   = express.Router();
const Annonce  = require('../models/Annonce');

const { createAnnonce, getAnnonces } = require('../controllers/annonce.controle');
const auth = require('../middlewares/auth.middleware');

const isVerified     = require('../middlewares/isVerify');
const {upload} = require('../middlewares/upload');


// Upload max 25 photos (taille max villa)
router.post('/create', auth,isVerified, upload.array('images', 25), createAnnonce);
router.get('/', getAnnonces);


// GET /api/annonces — toutes les annonces
router.get('/', async (req, res) => {
    try {
        const annonces = await Annonce.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(annonces);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/annonces/:id — une annonce
router.get('/see/:id', async (req, res,) => {
    try {
        const annonce = await Annonce.findByPk(req.params.id);
        if (!annonce) return res.status(404).json({ message: 'Annonce non trouvée' });
        res.json(annonce);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/annonces — créer une annonce
//router.post('/', async (req, res) => {
 //   try {
 //       const annonce = await Annonce.create(req.body);
 //       res.status(201).json(annonce);
 //   } catch (err) {
      //  res.status(400).json({ message: err.message });
 //   }
//});

// PUT /api/annonces/:id — modifier une annonce
router.put('/change/${id}',auth, async (req, res) => {
    try {
        const annonce = await Annonce.findByPkAndUpdate(req.params.id, req.body, { new: true });
        if (!annonce) return res.status(404).json({ message: 'Annonce non trouvée' });
        res.json(annonce);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /api/annonces/:id — supprimer une annonce
router.delete('/delete/${id}',auth, async (req, res) => {
    try {
        const annonce = await Annonce.findByIdPkDelete(req.params.id);
        if (!annonce) return res.status(404).json({ message: 'Annonce non trouvée' });
        res.json({ message: 'Annonce supprimée' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//router.get('/annonces',getAnnonces);


// 3 middlewares : auth → identité vérifiée → upload
//router.post('/create', auth,isVerified, upload.array('images', 25), createAnnonce);
//router.get('/', getAnnonces);


module.exports = router;