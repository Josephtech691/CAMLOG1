const { DataTypes } = require('sequelize');
const sequelize = require('../services/database');

const UserAdmin = sequelize.define('UserAdmin', {   // BUG CORRIGÉ : 'User.admin' est un nom de table invalide

  username: { type: DataTypes.STRING, allowNull: false },
  email:    { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false },

  role: {
    type: DataTypes.STRING,
    defaultValue: 'user',                               // BUG CORRIGÉ : default → defaultValue
    validate: { isIn: [['user', 'admin']] }             // BUG CORRIGÉ : enum → validate.isIn
  },

  isBlocked: { type: DataTypes.BOOLEAN, defaultValue: false }  // BUG CORRIGÉ : default → defaultValue

}, { timestamps: true });

module.exports = UserAdmin;