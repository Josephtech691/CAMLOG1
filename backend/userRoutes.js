const express = require('express');
const router = express.Router();
const {addFavoris,removeFavoris,getFavoris,verifierIdentite, getIdentityStatus} = require('../controllers/userControllers');
const auth = require('../middlewares/auth.middleware');
const User = require('../models/User');

const uploadIdentity = require('../middlewares/uploadIdentity');


router.post('/verify-identity',auth,
  uploadIdentity.fields([
    { name: 'cniRecto', maxCount: 1 },
    { name: 'cniVerso', maxCount: 1 },
    { name: 'selfie',   maxCount: 1 }
  ]),
  verifierIdentite
);

router.get('/identity-status', auth, getIdentityStatus);

//ajouter favoris
router.post('/favoris/:idAnnonce',auth,addFavoris);
//Retirer un favoris
router.delete('/favoris/:idAnnonce',auth,removeFavoris);
//voir tous ces favoris
router.get('/favoris',auth,getFavoris);

module.exports = router;
