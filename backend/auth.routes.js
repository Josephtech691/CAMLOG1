const express = require('express');
const router = express.Router();
const {register, verifyEmail, login, forgotPassword, resetPassword ,logout} = require('../controllers/auth.controller');
const auth = require('../middlewares/auth.middleware');
const {sendVerificationEmail} = require('../services/mail.services')


// Inscription
router.post('/register', register);
//reverifier son email
 router.get('/reverify-email/:token', sendVerificationEmail);
// Connexion
router.post('/login', login);
//Recevoir l'email et envoyer le lien
router.post('/forgot-password', forgotPassword)
//Recevoir le nouveau mot de passe
router.post('/reset-password/:token',  resetPassword)
//lien cliquer depuis l'email
router.get('/verify-email/:token', verifyEmail); 

//Deconnection

router.get('/deconnected',auth,logout);

// Profil protégé
router.get('/profil', auth, (req, res) => {
    res.json({
        message: 'Bienvenue',
        userId: req.user.id
    });
});

module.exports = router;
