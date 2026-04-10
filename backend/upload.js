const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer le dossier s'il n'existe pas
const uploadDir = 'uploads/annonces';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
};

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Nom unique : timestamp + nom original
    const nomUnique = `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`;
    cb(null, nomUnique);
  }
});

// accepter uniquement les images
const fileFilter = (req, file, cb) => {
  const typesAutorises = /jpeg|jpg|png|webp/;
  const extValide = typesAutorises.test(path.extname(file.originalname).toLowerCase());
  const mimeValide = typesAutorises.test(file.mimetype);
  console.log(file.mimetype)

  if (extValide && mimeValide) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images (jpg, jpeg, png, webp) sont acceptées'));
  }
};



const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max par fichier

}
);


module.exports = {upload};