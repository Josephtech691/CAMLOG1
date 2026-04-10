const Annonce = require('../models/Annonce');
const User    = require('../models/User');    
const fs      = require('fs');

const { analyserPhotos, analyserDescription, verifierPieces, photosConfig } = require('../services/validationServices');

// Supprimer les fichiers en cas d'erreur
const supprimerFichiers = (fichiers) => {
  fichiers.forEach(f => {
    if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
  });
};

// Générer le lien WhatsApp automatiquement
const genererLienWhatsApp = (telephone, titre) => {
  const numero  = telephone.replace(/[\s\+\-]/g, '');
  const message = encodeURIComponent(`Bonjour, je suis intéressé(e) par votre annonce : "${titre}"`);
  return `https://wa.me/${numero}?text=${message}`;
};


// ============================      CRÉER UNE ANNONCE      ================================

const createAnnonce = async (req, res) => {

  const fichiers = req.files || [];

  try {
    
    const { titre, description, prix, type, region, ville, quartier, latitude, longitude } = req.body;
    const idUser = req.user.id;

    const typesValides = ['studio', 'chambre', 'appartement', 'maison', 'villa', 'bureau'];
    if (!typesValides.includes(type)) {
      supprimerFichiers(fichiers);
      return res.status(400).json({ message: `Type invalide. Types acceptés : ${typesValides.join(', ')}` });
    }

    const config = photosConfig[type];
    if (fichiers.length < config.min || fichiers.length > config.max) {
      supprimerFichiers(fichiers);
      return res.status(400).json({
        message: `Pour un(e) ${type}, vous devez uploader entre ${config.min} et ${config.max} photos. Vous en avez envoyé ${fichiers.length}.`
      });
    }

    const resultatsPhotos = await analyserPhotos(fichiers, type);
    if (!resultatsPhotos.valide) {
      supprimerFichiers(fichiers);
      return res.status(400).json({ message: `Photos non conformes : ${resultatsPhotos.raison}`, validationStatus: 'rejetee' });
    }

    const piecesManquantes = verifierPieces(resultatsPhotos.piecesDetectees, type);
    if (piecesManquantes.length > 0) {
      supprimerFichiers(fichiers);
      return res.status(400).json({
        message: `Photos manquantes pour votre ${type}`,
        piecesManquantes: piecesManquantes.map(p => `Veuillez ajouter une photo de : ${p}`),
        validationStatus: 'rejetee'
      });
    }

    const resultatsDescription = await analyserDescription(description, type);
    if (!resultatsDescription.coherente) {
      supprimerFichiers(fichiers);
      return res.status(400).json({ message: `Description non conforme : ${resultatsDescription.raison}`, validationStatus: 'rejetee' });
    }

    
    const user = await User.findByPk(idUser);
    if (!user || !user.telephone) {
      supprimerFichiers(fichiers);
      return res.status(400).json({ message: 'Numéro de téléphone manquant dans votre profil.' });
    }
    const whatsappLink = genererLienWhatsApp(user.telephone, titre);

    
    const annonce = await Annonce.create({
      titre,
      description,
      prix,
      type,
      region,
      ville,
      quartier,
      images:           fichiers.map(f => f.path),
      whatsappLink,
      validationStatus: 'validee',
      auteur:           idUser,
      latitude:         parseFloat(latitude),
      longitude:        parseFloat(longitude)
    });

    res.status(201).json({ message: 'Annonce publiée et validée avec succès !', annonce });

  } catch (error) {
    supprimerFichiers(fichiers);
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


// ============================      LISTE DES ANNONCES      ================================

const getAnnonces = async (req, res) => {
  try {
    
    const annonces = await Annonce.findAll({ order: [['createdAt', 'DESC']] });
    res.json(annonces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createAnnonce, getAnnonces };