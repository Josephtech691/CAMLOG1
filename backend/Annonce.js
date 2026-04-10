const { DataTypes } = require('sequelize');
const sequelize = require('../services/database');

const Annonce = sequelize.define('Annonce', {

  titre:       { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT,   allowNull: true },
  prix:        { type: DataTypes.INTEGER, allowNull: true },

  type: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: { isIn: [['studio', 'chambre', 'appartement', 'maison', 'villa', 'bureau']] }
  },

  region:   { type: DataTypes.STRING, allowNull: true },
  ville:    { type: DataTypes.STRING, allowNull: true },
  quartier: { type: DataTypes.STRING, allowNull: true },

  // Tableau de chemins d'images stocké en JSON
  images: { type: DataTypes.JSON, defaultValue: [] },

  whatsappLink: { type: DataTypes.STRING, allowNull: true },

  validationStatus: {
    type: DataTypes.STRING,
    defaultValue: 'en_attente',
    validate: { isIn: [['en_attente', 'validee', 'rejetee']] }
  },

  validationMessage:  { type: DataTypes.STRING,  allowNull: true },
  piecesManquantes:   { type: DataTypes.JSON,     defaultValue: [] },

  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  blockedReason: { type: DataTypes.STRING, allowNull: true },

  // Référence à l'auteur (userId)
  auteur: { type: DataTypes.INTEGER, allowNull: true },

  // Coordonnées géographiques
  latitude:  { type: DataTypes.FLOAT, allowNull: true },
  longitude: { type: DataTypes.FLOAT, allowNull: true },

}, { timestamps: true });

module.exports = Annonce;