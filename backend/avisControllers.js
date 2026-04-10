const Avis    = require('../models/Avis');
const Annonce = require('../models/Annonce');
const User    = require('../models/User');


// ============================      AJOUTER UN AVIS      ================================

const addAvis = async (req, res) => {
  try {
    const { idAnnonce } = req.params;
    const idUser        = req.user.id;
    const { note, commentaire } = req.body;

    // BUG CORRIGÉ : l'annonce était créée AVANT la vérification d'existence et de doublon
    // → on vérifie d'abord, on crée ensuite

    // BUG CORRIGÉ : Annonce.findById() → Annonce.findByPk() Sequelize
    const annonce = await Annonce.findByPk(idAnnonce);
    if (!annonce) return res.status(404).json({ message: 'Annonce non trouvée' });

    // BUG CORRIGÉ : Avis.findOne({ idAnnonce, idUser }) → findOne({ where: {} }) Sequelize
    const dejaAvis = await Avis.findOne({ where: { idAnnonce, idUser } });
    if (dejaAvis) return res.status(409).json({ message: 'Vous avez déjà mis un avis sur cette annonce' });

    await Avis.create({ idAnnonce, idUser, note, commentaire });

    res.status(201).json({ message: 'Avis publié avec succès' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ============================      AVIS PAR ANNONCE      ================================

const getAvisByAnnonce = async (req, res) => {
  try {
    const { idAnnonce } = req.params;

    const tousAvis = await Avis.findAll({
       //where: { idAnnonce },
      
      order: [['createdAt', 'DESC']] });
    res.status(200).json(tousAvis);
      

    // BUG CORRIGÉ : Avis.find().populate() → Avis.findAll({ include }) Sequelize
    //const lesAvis = await Avis.findAll({
     // where: { idAnnonce },
     // include: [{ model: User, as: 'auteurAvis', attributes: ['id', 'nom'] }]
   // });

    //res.status(200).json(lesAvis);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ============================      SUPPRIMER UN AVIS      ================================

const deleteAvis = async (req, res) => {
  try {
    const { idAvis } = req.params;
    const idUser     = req.user.id;

    // BUG CORRIGÉ : Avis.findById() → Avis.findByPk() Sequelize
    const unAvis = await Avis.findByPk(idAvis);
    if (!unAvis) return res.status(404).json({ message: 'Avis non trouvé' });

    // BUG CORRIGÉ : unAvis.idUser.toString() → Number(unAvis.idUser)
    if (Number(unAvis.idUser) !== Number(idUser)) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // BUG CORRIGÉ : avis.where().findOneAndDelete() n'existe pas
    // → destroy() Sequelize
    await unAvis.destroy();

    res.status(200).json({ message: 'Avis supprimé avec succès' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addAvis, getAvisByAnnonce, deleteAvis };