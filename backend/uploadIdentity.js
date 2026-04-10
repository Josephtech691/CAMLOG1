const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = 'uploads/identites';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const nomUnique = `${Date.now()}-${file.fieldname}${path.extname(file.originalname)}`;
    cb(null, nomUnique);
  }
});

const fileFilter = (req, file, cb) => {
  const typesAutorises = /jpeg|jpg|png|webp/;
  const extValide  = typesAutorises.test(path.extname(file.originalname).toLowerCase());
  const mimeValide = typesAutorises.test(file.mimetype);

  if (extValide && mimeValide) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images (jpg, jpeg, png, webp) sont acceptées'));
  }
};

const uploadIdentity = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

module.exports = uploadIdentity;