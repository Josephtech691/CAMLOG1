//Newsletter,verification email
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        // Mot de passe d'application Google
        pass: process.env.MAIL_PASS,
    },
});

const sendMail = (options) => {
    return transporter.sendMail({
        from:    process.env.MAIL_USER,
                                    
        to:      options.to,
        subject: options.subject,
        text:    options.text,
    });
};

// Fonction d'envoi de l'email de vérification
const sendVerificationEmail = async (email, token) => {
  const lien = `${process.env.BASE_URL}/api/auth/verify-email/${token}`;

  const options = {
    from: `"CAMLOG" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'Vérifiez votre adresse email - CAMLOG',
    html: `
      <div style="font-family: Arial; max-width: 500px; margin: auto;">
        <h2 style="color: #2c7be5;">Bienvenue sur CAMLOG 🏠</h2>
        <p>Cliquez sur le bouton ci-dessous pour activer votre compte :</p>
        <a href="${lien}" 
           style="background:#2c7be5; color:white; padding:12px 24px; 
                  border-radius:6px; text-decoration:none; display:inline-block;">
          Vérifier mon email
        </a>
        <p style="color:gray; font-size:12px; margin-top:20px;">
          Ce lien expire dans <strong>24 heures</strong>.<br/>
          Si vous n'avez pas créé de compte, ignorez cet email.
        </p>
      </div>
    `
  };

  await transporter.sendMail(options);
};

const passwordForget = async (email, token) => {
    const link = `${process.env.BASE_URL}/api/auth/reset-password/${token}`;
    const options = {
      from: `"CAMLOG" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Réinitialisation de votre mot de passe - CAMLOG',
      html: `
      <div style="font-family: Arial; max-width: 500px; margin: auto;">
        <h2 style="color: #2c7be5;">Bienvenue sur CAMLOG 🏠</h2>
        <p>Cliquez sur le bouton ci-dessous pour réinitialiser le mot de passe de votre compte :</p>
        <a href="${link}" 
           style="background:#2c7be5; color:white; padding:12px 24px; 
                  border-radius:6px; text-decoration:none; display:inline-block;">
          changer mon de passe
        </a>
        <p style="color:gray; font-size:12px; margin-top:20px;">
          Ce lien expire dans <strong>1 heure</strong>.<br/>
          Si vous n'avez pas demandé de réinitialisation, ignorez cet email.
        </p>
      </div>
      `
    };
    await transporter.sendMail(options);
};

module.exports = {sendMail, sendVerificationEmail, passwordForget };