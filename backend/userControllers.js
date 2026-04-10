const User    = require('../models/User');
const Annonce = require('../models/Annonce');
const {
  extraireInfosCNI,
  verifierValiditeCNI,
  comparerVisages
} = require('../services/identityService');


//==============================    VÉRIFICATION D'IDENTITÉ CNI  ================================

const verifierIdentite = async (req, res) => {
  try {
    const idUser = req.user.id;

    // BUG CORRIGÉ : fonction était vide, et les fichiers venaient du body (pas de req.files)
    const fichiers = req.files || {};
    const cniRectoFile = fichiers.cniRecto?.[0];
    const cniVersoFile = fichiers.cniVerso?.[0];
    const selfieFile   = fichiers.selfie?.[0];

    if (!cniRectoFile || !cniVersoFile || !selfieFile) {
      return res.status(400).json({ message: 'Veuillez fournir : cniRecto, cniVerso et selfie.' });
    }

    const user = await User.findByPk(idUser);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    // Mise en attente le temps de l'analyse
    user.identityStatus = 'en_cours';
    await user.save();

    // 1. Extraire les infos de la CNI recto
    const infos = await extraireInfosCNI(cniRectoFile.path);
    if (!infos.estValide) {
      user.identityStatus   = 'rejete';
      user.identityMessage  = infos.raison;
      await user.save();
      return res.status(400).json({ message: `CNI invalide : ${infos.raison}` });
    }

    // 2. Vérifier recto/verso
    const validite = await verifierValiditeCNI(cniRectoFile.path, cniVersoFile.path);
    if (!validite.coherente) {
      user.identityStatus  = 'rejete';
      user.identityMessage = validite.raison;
      await user.save();
      return res.status(400).json({ message: `CNI incohérente : ${validite.raison}` });
    }

    // 3. Comparer visage CNI et selfie
    const visages = await comparerVisages(cniRectoFile.path, selfieFile.path);
    if (!visages.memPersonne) {
      user.identityStatus  = 'rejete';
      user.identityMessage = visages.raison;
      await user.save();
      return res.status(400).json({ message: `Visages non correspondants : ${visages.raison}` });
    }

    // Tout est valide → mise à jour du profil
    user.isIdentityVerified = true;
    user.identityStatus     = 'verifie';
    user.identityMessage    = 'Identité vérifiée avec succès';
    user.cniRecto           = cniRectoFile.path;
    user.cniVerso           = cniVersoFile.path;
    user.selfie             = selfieFile.path;
    user.nomCNI             = infos.nom;
    user.prenomCNI          = infos.prenom;
    user.numeroCNI          = infos.numeroCNI;
    user.dateNaissanceCNI   = infos.dateNaissance ? new Date(infos.dateNaissance) : null;
    await user.save();

    res.status(200).json({ message: 'Identité vérifiée avec succès !' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//============================     STATUT DE VÉRIFICATION D'IDENTITÉ    ===========

const getIdentityStatus = async (req, res) => {
  try {
    const idUser = req.user.id;
    // BUG CORRIGÉ : fonction était vide
    const user = await User.findByPk(idUser, {
      attributes: ['id', 'identityStatus', 'identityMessage', 'isIdentityVerified']
    });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    res.status(200).json({
      identityStatus:     user.identityStatus,
      isIdentityVerified: user.isIdentityVerified,
      identityMessage:    user.identityMessage
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//===========================    GESTION DES FAVORIS      ====================================

const addFavoris = async (req, res) => {
  try {
    const { idAnnonce } = req.params;
    const idUser        = req.user.id;

    const annonce = await Annonce.findByPk(idAnnonce);
    if (!annonce) return res.status(404).json({ message: 'Annonce non trouvée' });

    // BUG CORRIGÉ : User.findByIdAndUpdate + $addToSet n'existe pas en Sequelize
    // → on lit les favoris (JSON), on ajoute si absent, on sauvegarde
    const user = await User.findByPk(idUser);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const favoris = user.favoris || [];
    if (!favoris.includes(Number(idAnnonce))) {
      user.favoris = [...favoris, Number(idAnnonce)];
      await user.save();
    }

    res.status(200).json({ message: "L'annonce a été ajoutée aux favoris avec succès" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const removeFavoris = async (req, res) => {
  try {
    const { idAnnonce } = req.params;
    const idUser        = req.user.id;

    // BUG CORRIGÉ : User.findByIdAndUpdate + $pull → lecture/filtre/save
    const user = await User.findByPk(idUser);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    user.favoris = (user.favoris || []).filter(id => Number(id) !== Number(idAnnonce));
    await user.save();

    res.status(200).json({ message: 'Annonce supprimée des favoris' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getFavoris = async (req, res) => {
  try {
    const idUser = req.user.id;
    const user   = await User.findByPk(idUser);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const favorisIds = user.favoris || [];

    // BUG CORRIGÉ : .populate('favoris') → Annonce.findAll({ where: { id: [ids] } })
    const annonces = favorisIds.length > 0
      ? await Annonce.findAll({ where: { id: favorisIds } })
      : [];

    res.status(200).json(annonces);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addFavoris, removeFavoris, getFavoris, verifierIdentite, getIdentityStatus };