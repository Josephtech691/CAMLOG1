require('dotenv').config();
const User = require('../models/User');

const isVerified = async (req, res, next) => {
  try {
    // BUG CORRIGÉ : User.findById() → User.findByPk() Sequelize
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    

    if (process.env.NODE_ENV === 'development' && process.env.SKIP_AI === 'true') 
      return next();

    if (!user.isIdentityVerified) {
      return res.status(403).json({
        message: 'Veuillez vérifier votre identité avant de publier une annonce.',
        identityStatus: user.identityStatus
      });
    }

    next();

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = isVerified;