require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

// BUG CORRIGÉ : new GoogleGenerativeAI({ apiKey }) → new GoogleGenerativeAI(apiKey)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Pièces requises par type de logement
const piecesRequises = {
  studio:      ['pièce principale / chambre salon', 'cuisine', 'salle de bain'],
  chambre:     ['chambre', 'salle de bain'],
  appartement: ['salon', 'chambre', 'cuisine', 'salle de bain'],
  maison:      ['salon', 'chambre', 'cuisine', 'salle de bain', 'extérieur / façade'],
  villa:       ['salon', 'chambre', 'cuisine', 'salle de bain', 'jardin ou piscine', 'extérieur / façade'],
  bureau:      ['espace de travail', 'salle de réunion', 'entrée / couloir']
};

// Nombre min/max de photos par type
const photosConfig = {
  studio:      { min: 3,  max: 8  },
  chambre:     { min: 2,  max: 6  },
  appartement: { min: 5,  max: 15 },
  maison:      { min: 8,  max: 20 },
  villa:       { min: 10, max: 25 },
  bureau:      { min: 4,  max: 12 }
};

// Helper pour nettoyer la réponse JSON de Gemini (enlève les ```json ... ```)
const parseJSON = (text) => {
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};


// ========================    ANALYSER LES PHOTOS    ========================

const analyserPhotos = async (fichiers, type) => {

  if (process.env.NODE_ENV === 'development' && process.env.SKIP_AI === 'true') {
    return { valide: true, piecesDetectees: piecesRequises[type] };
  };
  // BUG CORRIGÉ : client.messages.create() est la syntaxe Anthropic, pas Gemini
  // → utiliser genAI.getGenerativeModel().generateContent()
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const piecesDetectees = [];

  for (const fichier of fichiers) {
    const imageData = fs.readFileSync(fichier.path);
    const base64    = imageData.toString('base64');
    const mimeType  = fichier.mimetype;

    const result   = await model.generateContent([
      {
        inlineData: { data: base64, mimeType }
      },
      `Tu es un expert en immobilier. Analyse cette photo d'une annonce immobilière de type "${type}".
      Réponds UNIQUEMENT en JSON avec ce format (sans backticks) :
      {
        "estLogement": true/false,
        "pieceDetectee": "nom de la pièce visible ou null",
        "coherentAvecType": true/false,
        "raison": "explication courte"
      }`
    ]);

    const text = result.response.text();

    try {
      const resultat = parseJSON(text);
      if (resultat.estLogement && resultat.pieceDetectee) {
        piecesDetectees.push(resultat.pieceDetectee.toLowerCase());
      }
      if (!resultat.estLogement || !resultat.coherentAvecType) {
        return { valide: false, raison: resultat.raison, piecesDetectees: [] };
      }
    } catch {
      return { valide: false, raison: "Impossible d'analyser une des photos", piecesDetectees: [] };
    }
  }

  return { valide: true, piecesDetectees };
};


// ========================    ANALYSER LA DESCRIPTION    ========================

const analyserDescription = async (description, type) => {

  if (process.env.NODE_ENV === 'development' && process.env.SKIP_AI === 'true') {
    return { coherente: true };
  };
  const model  = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(
    `Tu es un expert en immobilier. Analyse cette description d'annonce immobilière de type "${type}" :
    "${description}"
    Réponds UNIQUEMENT en JSON (sans backticks) :
    {
      "coherente": true/false,
      "raison": "explication courte"
    }`
  );

  try {
    return parseJSON(result.response.text());
  } catch {
    return { coherente: false, raison: 'Description illisible' };
  }
};


// ========================    VÉRIFIER LES PIÈCES MANQUANTES    ========================

const verifierPieces = (piecesDetectees, type) => {
  const requises   = piecesRequises[type] || [];
  const manquantes = [];

  for (const piece of requises) {
    const trouvee = piecesDetectees.some(detectee =>
      detectee.includes(piece.split('/')[0].trim()) ||
      piece.includes(detectee.split(' ')[0])
    );
    if (!trouvee) manquantes.push(piece);
  }

  return manquantes;
};


// ========================    EXTRAIRE INFOS CNI    ========================

const extraireInfosCNI = async (fichiers) => {
  // BUG CORRIGÉ : signature (req, fichiers, type) n'avait aucun sens
  // BUG CORRIGÉ : const {cniRecto,cniVerso} = null → crash garanti
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const results = [];

  for (const fichier of fichiers) {
    const imageData = fs.readFileSync(fichier.path);
    const base64    = imageData.toString('base64');
    const mimeType  = fichier.mimetype;

    const result = await model.generateContent([
      { inlineData: { data: base64, mimeType } },
      `Tu es un expert en vérification de documents d'identité camerounais.
      Analyse cette CNI et réponds UNIQUEMENT en JSON (sans backticks) :
      {
        "estUneCNI": true/false,
        "pays": "pays émetteur",
        "nom": "nom sur la CNI",
        "prenom": "prénom sur la CNI",
        "numeroCNI": "numéro de la CNI",
        "dateNaissance": "JJ/MM/AAAA",
        "dateExpiration": "JJ/MM/AAAA",
        "estExpiree": true/false,
        "estValide": true/false,
        "raison": "explication si non valide"
      }`
    ]);

    try {
      results.push(parseJSON(result.response.text()));
    } catch {
      return { estValide: false, raison: 'Impossible de lire les informations de la CNI' };
    }
  }

  return results[0] || { estValide: false, raison: 'Aucun fichier fourni' };
};


// ========================    VÉRIFIER VALIDITÉ CNI RECTO/VERSO    ========================

const verifierValiditeCNI = async (fichiers) => {
  // BUG CORRIGÉ : const {cniRecto,cniVerso} = null → crash garanti
  if (!fichiers || fichiers.length < 2) {
    return { coherente: false, raison: 'Les deux faces de la CNI sont requises' };
  }

  const model    = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const [recto, verso] = fichiers;

  const b64Recto = fs.readFileSync(recto.path).toString('base64');
  const b64Verso = fs.readFileSync(verso.path).toString('base64');

  const result = await model.generateContent([
    { inlineData: { data: b64Recto, mimeType: recto.mimetype } },
    { inlineData: { data: b64Verso, mimeType: verso.mimetype } },
    `Tu es un expert en vérification de documents d'identité.
    Analyse le recto et le verso de cette CNI camerounaise.
    Réponds UNIQUEMENT en JSON (sans backticks) :
    {
      "coherente": true/false,
      "signeFalsification": true/false,
      "raison": "explication courte"
    }`
  ]);

  try {
    return parseJSON(result.response.text());
  } catch {
    return { coherente: false, raison: "Impossible d'analyser les deux faces de la CNI" };
  }
};


// ========================    COMPARER VISAGE CNI ET SELFIE    ========================

const comparerVisages = async (fichiers) => {
  // BUG CORRIGÉ : const {cniRecto,cniVerso} = null → crash garanti
  if (!fichiers || fichiers.length < 2) {
    return { memPersonne: false, raison: 'CNI et selfie requis' };
  }

  const model  = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const [cni, selfie] = fichiers;

  const b64CNI    = fs.readFileSync(cni.path).toString('base64');
  const b64Selfie = fs.readFileSync(selfie.path).toString('base64');

  const result = await model.generateContent([
    { inlineData: { data: b64CNI,    mimeType: cni.mimetype    } },
    { inlineData: { data: b64Selfie, mimeType: selfie.mimetype } },
    `Tu es un expert en reconnaissance faciale et vérification d'identité.
    La première image est une CNI camerounaise, la deuxième est un selfie en direct.
    Réponds UNIQUEMENT en JSON (sans backticks) :
    {
      "memPersonne": true/false,
      "niveauConfiance": 0-100,
      "selfieEnDirect": true/false,
      "raison": "explication courte"
    }`
  ]);

  try {
    return parseJSON(result.response.text());
  } catch {
    return { memPersonne: false, raison: 'Impossible de comparer les visages' };
  }
};

module.exports = {
  analyserPhotos,
  analyserDescription,
  verifierPieces,
  photosConfig,
  extraireInfosCNI,
  verifierValiditeCNI,
  comparerVisages
};