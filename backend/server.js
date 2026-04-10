
const express  = require('express');
const cors = require('cors');
const sequelize = require('./services/database');
// BUG CORRIGÉ : mongoose importé et jamais utilisé (projet migré vers Sequelize/SQLite)
const dotenv   = require('dotenv');
dotenv.config();

const path     = require('path');



const app = express();



//COMMUNICATION AVEC LE FRONTEND

app.use(cors({
  origin: "http://localhost:5173"
}));
// ========================     MIDDLEWARES GLOBAUX     ========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// uploads/annonces accessible publiquement — uploads/identites reste privé
app.use('/uploads/annonces', express.static(path.join(__dirname, 'uploads/annonces')));
//app.use('/uploads', express.static('uploads'));


// ========================     ROUTES      ========================

const authRoutes       = require('./routes/auth.routes');
const userRoutes       = require('./routes/userRoutes');
const annonceRoutes    = require('./routes/annonces');
const avisRoutes       = require('./routes/avisRoutes');
const adminRoutes      = require('./routes/admin.routes');
const contactRoutes    = require('./routes/contact.routes');
const newsletterRoutes = require('./routes/newsletter.routes');

app.use('/api/contact',    contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/auth',       authRoutes);
app.use('/api/user',            userRoutes);
app.use('/api/annonces',            annonceRoutes);
app.use('/api/avis',            avisRoutes);
app.use('/api/admin',      adminRoutes);


// ========================     ROUTE DE TEST     ========================

app.get('/', (req, res) => {
  res.json({
    message:     '🏠 Bienvenue sur l\'API CAMLOG',
    version:     '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    status:      'En ligne'
  });
});


// ========================     ROUTE INTROUVABLE (404)     ========================

app.use((req, res) => {
  res.status(404).json({ message: `Route introuvable : ${req.method} ${req.originalUrl}` });
});


// ========================     GESTION GLOBALE DES ERREURS     ========================

app.use((err, req, res, next) => {
  console.error('Erreur globale :', err.message);
app.use((err,req,res,next)=>{
  console.error("Erreur server :",err.stack);
  res.status(500).json({message: "Erreur interne serveur"});
}) ; 

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Fichier trop lourd. Maximum 10MB par fichier.' });
  }

  if (err.message && err.message.includes('Seules les images')) {
    return res.status(400).json({ message: err.message });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Erreur serveur interne',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});


// ========================     DÉMARRAGE     ========================

const PORT = process.env.PORT || 5173


sequelize.sync()
  .then(() => {
    console.log('Base de données prête (SQLite).');
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
      console.log(`Environnement : ${process.env.NODE_ENV || 'development'}`);
      console.log(`URL : ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
      
    });
  })
  .catch((err) => {
    console.error('Impossible de connecter la base de données :', err.message);
    console.error(error);
    process.exit(1);
    
  });
  