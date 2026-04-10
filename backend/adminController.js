const { Op } = require('sequelize');
const User    = require('../models/User');
const Annonce = require('../models/Annonce');
const Avis    = require('../models/Avis');


//===================      TOUS LES UTILISATEURS + STATS      ===================================

const getAllUsers = async (req, res) => {
  try {
    
    const users = await User.findAll({
      attributes: { exclude: ['password', 'cniRecto', 'cniVerso', 'selfie'] }
    });

    const total      = users.length;
    const actifs     = users.filter(u => u.isVerified).length;
    const chercheurs = users.filter(u => u.role === 'chercheur').length;
    const annonceurs = users.filter(u => u.role === 'annonceur').length;
    const bloques    = users.filter(u => u.isBlocked).length;

    
    const usersAvecStats = await Promise.all(users.map(async (user) => {
      if (user.role !== 'annonceur') return user.toJSON();

      const totalAnnonces    = await Annonce.count({ where: { auteur: user.id } });
      const annoncesEnLigne  = await Annonce.count({ where: { auteur: user.id, isActive: true,  validationStatus: 'validee' } });
      const annoncesBloquees = await Annonce.count({ where: { auteur: user.id, isActive: false } });

      return { ...user.toJSON(), stats: { totalAnnonces, annoncesEnLigne, annoncesBloquees } };
    }));

    res.status(200).json({
      stats: { total, actifs, chercheurs, annonceurs, bloques },
      users: usersAvecStats
    });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


//===================       DASHBOARD D'UN UTILISATEUR       ===========================

const getUserDashboard = async (req, res) => {
  try {
    const { userId } = req.params;

    // BUG CORRIGÉ : User.findById() → User.findByPk() Sequelize
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'cniRecto', 'cniVerso', 'selfie'] }
    });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    // BUG CORRIGÉ : Annonce.find({ auteur: userId }) → Annonce.findAll({ where: { auteur: userId } })
    const annonces = await Annonce.findAll({ where: { auteur: userId } });
    const avis     = await Avis.findAll({ where: { idUser: userId } });

    const totalAnnonces    = annonces.length;
    const annoncesEnLigne  = annonces.filter(a => a.isActive && a.validationStatus === 'validee').length;
    const annoncesBloquees = annonces.filter(a => !a.isActive).length;
    const annoncesRejetees = annonces.filter(a => a.validationStatus === 'rejetee').length;

    res.status(200).json({
      user,
      stats: { totalAnnonces, annoncesEnLigne, annoncesBloquees, annoncesRejetees },
      annonces,
      avis
    });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


//========================        BLOQUER UN UTILISATEUR       =================================

const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Impossible de bloquer un administrateur.' });
    }

    user.isBlocked     = true;
    user.blockedReason = reason || 'Non précisée';
    await user.save();

    res.status(200).json({ message: `Utilisateur ${user.nom} bloqué avec succès.` });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


//======================       DÉBLOQUER UN UTILISATEUR        ===============================

const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    user.isBlocked     = false;
    user.blockedReason = null;  
    await user.save();

    res.status(200).json({ message: `Utilisateur ${user.nom} débloqué avec succès.` });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


//===========================       BLOQUER UNE ANNONCE      ================================

const blockAnnonce = async (req, res) => {
  try {
    const { annonceId } = req.params;
    const { reason }    = req.body;

    
    const annonce = await Annonce.findByPk(annonceId);
    if (!annonce) return res.status(404).json({ message: 'Annonce non trouvée' });

    annonce.isActive      = false;
    annonce.blockedReason = reason || 'Non précisée';
    await annonce.save();

    res.status(200).json({ message: 'Annonce bloquée avec succès.' });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


//=============================      DÉBLOQUER UNE ANNONCE    ===============================

const unblockAnnonce = async (req, res) => {
  try {
    const { annonceId } = req.params;

    const annonce = await Annonce.findByPk(annonceId);
    if (!annonce) return res.status(404).json({ message: 'Annonce non trouvée' });

    annonce.isActive      = true;
    annonce.blockedReason = null;  // BUG CORRIGÉ : undefined → null
    await annonce.save();

    res.status(200).json({ message: 'Annonce débloquée avec succès.' });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


//============================================
// STATS GLOBALES DASHBOARD ADMIN
//============================================

const getDashboardStats = async (req, res) => {
  try {
    // BUG CORRIGÉ : User.countDocuments() → User.count({ where: {} })
    const totalUsers      = await User.count();
    const usersActifs     = await User.count({ where: { isVerified: true } });
    const usersBloques    = await User.count({ where: { isBlocked:  true } });
    const totalAnnonceurs = await User.count({ where: { role: 'annonceur' } });
    const totalChercheurs = await User.count({ where: { role: 'chercheur' } });

    const cniVerifiees = await User.count({ where: { identityStatus: 'verifie'  } });
    const cniEnCours   = await User.count({ where: { identityStatus: 'en_cours' } });
    const cniRejetees  = await User.count({ where: { identityStatus: 'rejete'   } });

    const totalAnnonces    = await Annonce.count();
    const annoncesValidees = await Annonce.count({ where: { validationStatus: 'validee', isActive: true  } });
    const annoncesBloquees = await Annonce.count({ where: { isActive: false } });
    const annoncesRejetees = await Annonce.count({ where: { validationStatus: 'rejetee' } });

    // BUG CORRIGÉ : .sort().limit().select() → order/limit/attributes Sequelize
    const derniersInscrits = await User.findAll({
      attributes: ['id', 'nom', 'email', 'role', 'createdAt', 'isVerified', 'isBlocked'],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    const dernieresAnnonces = await Annonce.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.status(200).json({
      utilisateurs: { total: totalUsers, actifs: usersActifs, bloques: usersBloques, annonceurs: totalAnnonceurs, chercheurs: totalChercheurs },
      identites:    { verifiees: cniVerifiees, enCours: cniEnCours, rejetees: cniRejetees },
      annonces:     { total: totalAnnonces, validees: annoncesValidees, bloquees: annoncesBloquees, rejetees: annoncesRejetees },
      derniersInscrits,
      dernieresAnnonces
    });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = { getAllUsers, getUserDashboard, blockUser, unblockUser, blockAnnonce, unblockAnnonce, getDashboardStats };