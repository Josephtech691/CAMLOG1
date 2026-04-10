const { Op } = require('sequelize');
const User   = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail, passwordForget } = require('../services/mail.services');


//=================================      INSCRIPTION      ===============================

const register = async (req, res) => {
  try {
    const { nom, email, password, telephone } = req.body;

    // BUG CORRIGÉ : User.findOne() Mongoose → findOne({ where: {} }) Sequelize
    const existe = await User.findOne({ where: { email } });
    if (existe) return res.status(400).json({ message: 'Email déjà utilisé' });

    const hash   = await bcrypt.hash(password, 10);
    const token  = crypto.randomBytes(32).toString('hex');
    const expire = new Date(Date.now() + 24 * 60 * 60 * 1000);
    

    const user = await User.create({
      nom, email, telephone,
      password: hash,
      verificationToken:  token,
      verificationExpire: expire,
    });

    if (process.env.NODE_ENV === 'development') {
      // BUG CORRIGÉ : en Sequelize il faut appeler user.save() après modification
      user.isVerified = true;
      await user.save();
    } else{
    await sendVerificationEmail(email, token);}
    res.status(201).json({ message: 'Inscription réussie ! Vérifiez votre email.' });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


//===========================    VÉRIFICATION EMAIL     ==============================

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    if (process.env.NODE_ENV === 'development') {
      // BUG CORRIGÉ : en Sequelize il faut appeler user.save() après modification
      user.isVerified = true;
      await user.save();
    }

    // BUG CORRIGÉ : { $gt: Date.now() } → Sequelize Op.gt
    const user = await User.findOne({
      where: {
        verificationToken:  token,
        verificationExpire: { [Op.gt]: new Date() }
      }
    });

    if (!user) return res.status(400).json({ message: 'Lien invalide ou expiré.' });

    user.isVerified         = true;
    user.verificationToken  = null;   // BUG CORRIGÉ : undefined → null (Sequelize)
    user.verificationExpire = null;
    await user.save();

    res.status(200).json({ message: 'Email vérifié ! Vous pouvez vous connecter.' });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


//============================    CONNEXION     ================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // BUG CORRIGÉ : User.findOne({ email }) → findOne({ where: { email } })
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    if (process.env.NODE_ENV === 'development') {
      user.isVerified = true;
      await user.save();
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Veuillez vérifier votre email avant de vous connecter.' });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: `Votre compte a été bloqué. Raison : ${user.blockedReason || 'Non précisée'}`
      });
    }

    const valide = await bcrypt.compare(password, user.password);
    if (!valide) return res.status(401).json({ message: 'Mot de passe incorrect' });

    // BUG CORRIGÉ : "if admin return next()" → next n'est pas défini ici
    // Un admin se connecte normalement et reçoit un token avec role:'admin'
    // La protection des routes admin est gérée par le middleware

    // BUG CORRIGÉ : user._id → user.id (Sequelize)
    const tokenJwt = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token: tokenJwt,
      user: { nom: user.nom, email: user.email, role: user.role }
    });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


//============================= FORGOT PASSWORD      =================================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(200).json({ message: 'Si cet email existe, un lien a été envoyé.' });
    }

    const token      = crypto.randomBytes(32).toString('hex');
    user.resetToken  = token;
    user.resetExpire = new Date(Date.now() + 1 * 60 * 60 * 1000);
    await user.save();

    await passwordForget(user.email, token);
    res.status(200).json({ message: 'Si cet email existe, un lien a été envoyé.' });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


//===========================    RESET PASSWORD    ================================

const resetPassword = async (req, res) => {
  try {
    const { token }       = req.params;
    const { newPassword } = req.body;

    // BUG CORRIGÉ : { $gt: Date.now() } → Sequelize Op.gt
    const user = await User.findOne({
      where: {
        resetToken:  token,
        resetExpire: { [Op.gt]: new Date() }
      }
    });

    if (!user) return res.status(400).json({ message: 'Lien invalide ou expiré.' });

    user.password    = await bcrypt.hash(newPassword, 10);
    user.resetToken  = null;  // BUG CORRIGÉ : undefined → null
    user.resetExpire = null;
    await user.save();

    res.status(200).json({ message: 'Mot de passe changé avec succès !' });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

const logout = async (req,res)=>{
  try {  
    
    return res.status(200).json({ message: 'deconnecté avec succès !' });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


module.exports = { register, verifyEmail, login, forgotPassword, resetPassword , logout};