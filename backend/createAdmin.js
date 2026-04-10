const sequelize = require('../services/database');
const bcrypt    = require('bcryptjs');
const User      = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    // Supprimer l'ancien admin s'il existe
    await User.destroy({ where: { role: 'admin' } });
    console.log('Admin supprimé.');

    // BUG CORRIGÉ : User.findOne({ email }) → findOne({ where: { email } }) Sequelize
    const existe = await User.findOne({ where: { email: process.env.EMAIL } });
    if (existe) {
      console.log('Admin déjà existant');
      console.log('Email    : ' + process.env.EMAIL);
      console.log('Password : ' + process.env.PASSWORD);
      process.exit(0);
    }

    const hash = await bcrypt.hash(process.env.PASSWORD, 10);

    await User.create({
      nom:                process.env.NOM,
      email:              process.env.EMAIL,
      password:           hash,
      telephone:          process.env.TELEPHONE,
      role:               'admin',
      isVerified:         true,
      isIdentityVerified: true,
      identityStatus:     'verifie'
    });

    console.log('Compte admin créé avec succès !');
    console.log('Email    : ' + process.env.EMAIL);
    console.log('Password : ' + process.env.PASSWORD);
    process.exit(0);

  } catch (error) {
    // BUG CORRIGÉ : aucune gestion d'erreur → crash silencieux possible
    console.error('Erreur lors de la création de l\'admin :', error.message);
    process.exit(1);
  }
};

createAdmin();