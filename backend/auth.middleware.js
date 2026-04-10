
const jwt = require('jsonwebtoken');

function auth(req, res, next) {

    // Récupérer le token dans le header de la requête
    // Le token est envoyé sous la forme : "Bearer montoken123"
    const header = req.headers['authorization'];
    const token  = header && header.startsWith('Bearer ') ? header.slice(7) : null;

    // Si pas de token, refuser l'accès
    if (!token) {
        return res.status(401).json({
            succes: false,
            message: 'Vous devez être connecté pour faire ça.'
        });
    }

    // Vérifier que le token est valide
    try {
        const userDecode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = userDecode; // on attache les infos à la requête
        next(); // tout est bon, on continue

    } catch (err) {
        return res.status(403).json({
            succes: false,
            message: 'Token invalide ou expiré. Reconnectez-vous.'
        });
    }
};

/*const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Accès refusé : token manquant' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token invalide ou expiré' });
    }
};*/

module.exports = auth;