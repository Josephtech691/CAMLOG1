const { DataTypes } = require('sequelize');
const sequelize = require('../services/database');

const Subscriber = sequelize.define('Subscriber', {

  email: {
    type:      DataTypes.STRING,
    allowNull: false,
    unique:    true,
    // BUG CORRIGÉ : lowercase/trim ne sont pas des options Sequelize
    // → validation à faire dans le controller avant save
    validate:  { isEmail: true }
  }
  // BUG CORRIGÉ : createdAt est géré automatiquement par timestamps:true
  // Ne pas le redéfinir avec DataTypes.DATE.now (n'existe pas)

}, { timestamps: true });

module.exports = Subscriber;