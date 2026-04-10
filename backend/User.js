const { DataTypes } = require('sequelize');
const sequelize = require('../services/database');

const User = sequelize.define('User', {

  nom:       { type: DataTypes.STRING, allowNull: true },
  email:     { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  
  password:  { type: DataTypes.STRING, allowNull: false },
  telephone: { type: DataTypes.STRING, allowNull: true },

  role: {
    type: DataTypes.STRING,
    defaultValue: 'chercheur',                                      // BUG CORRIGÉ : default → defaultValue
    validate: { isIn: [['chercheur', 'annonceur', 'admin']] }       // BUG CORRIGÉ : enum → validate.isIn
  },

  

  // Blocage
  isBlocked:     { type: DataTypes.BOOLEAN, defaultValue: false },  // BUG CORRIGÉ : default → defaultValue
  blockedReason: { type: DataTypes.STRING,  allowNull: true },

  // Vérification email
  isVerified:         { type: DataTypes.BOOLEAN, defaultValue: false },
  verificationToken:  { type: DataTypes.STRING,  allowNull: true },
  verificationExpire: { type: DataTypes.DATE,    allowNull: true },

  // Réinitialisation mot de passe
  resetToken:  { type: DataTypes.STRING, allowNull: true },
  resetExpire: { type: DataTypes.DATE,   allowNull: true },

  
  
  favoris: { type: DataTypes.JSON, defaultValue: [] },

  // Vérification identité
  isIdentityVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  identityStatus: {
    type: DataTypes.STRING,
    defaultValue: 'non_soumis',
    validate: { isIn: [['non_soumis', 'en_cours', 'verifie', 'rejete']] }
  },
  identityMessage:  { type: DataTypes.STRING, allowNull: true },
  cniRecto:         { type: DataTypes.STRING, allowNull: true },
  cniVerso:         { type: DataTypes.STRING, allowNull: true },
  selfie:           { type: DataTypes.STRING, allowNull: true },
  nomCNI:           { type: DataTypes.STRING, allowNull: true },
  prenomCNI:        { type: DataTypes.STRING, allowNull: true },
  numeroCNI:        { type: DataTypes.STRING, allowNull: true, unique: true },
  
  dateNaissanceCNI: { type: DataTypes.DATE,   allowNull: true },

}, { timestamps: true });


module.exports = User;