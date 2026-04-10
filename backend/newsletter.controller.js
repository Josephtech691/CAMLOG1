const Subscriber = require('../models/subscriber');

module.exports = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    // BUG CORRIGÉ : Subscriber.findOne({ email }) → findOne({ where: { email } }) Sequelize
    const exists = await Subscriber.findOne({ where: { email: email.toLowerCase().trim() } });
    if (exists) {
      return res.status(409).json({ error: 'Déjà inscrit' });
    }

    await Subscriber.create({ email: email.toLowerCase().trim() });
    res.status(201).json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};