const { DataTypes } = require('sequelize');
const sequelize = require('../services/database');

// BUG CORRIGÉ : ne pas importer Annonce/User ici (dépendance circulaire)
// Les associations sont définies dans un fichier d'initialisation séparé

const Avis = sequelize.define('Avis', {

  // Clés étrangères classiques Sequelize (INTEGER, pas JSON)
  idAnnonce: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  idUser: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  note: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }   // BUG CORRIGÉ : min/max dans v
  },

  commentaire: { type: DataTypes.TEXT, allowNull: true }

}, { timestamps: true });

module.exports = Avis;