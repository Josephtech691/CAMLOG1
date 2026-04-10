const { sendMail } = require('../services/mail.services');

const contact = async (req, res) => {
    try {
        const { nom, email, sujet, message } = req.body;

        if (!nom || !email || !sujet || !message) {
        
            return res.status(400).json({ error: 'Champs manquants' });
        }

        await sendMail({
            to:      process.env.CONTACT_MAIL || 'camlog237@camlog.com',
            subject: 'Nouveau message de ' + nom,
            text:    `${nom} (${email}) — ${sujet} : ${message}`
        });

        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
module.exports = contact;