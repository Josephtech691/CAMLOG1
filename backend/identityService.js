require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

// BUG CORRIGÉ : new GoogleGenerativeAI({ apiKey }) → new GoogleGenerativeAI(apiKey)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Convertir une image en base64
const toBase64 = (filePath) => fs.readFileSync(filePath).toString('base64');

// Helper pour nettoyer la réponse JSON de Gemini
const parseJSON = (text) => {
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};


//==========================     EXTRAIRE LES INFOS DE LA CNI    ==========================

const extraireInfosCNI = async (cniRectoPath) => {

  if (process.env.NODE_ENV === 'development' && process.env.SKIP_AI === 'true') {
      return { estValide: true, nom: 'TEST', }};
  // BUG CORRIGÉ : client.messages.create() est la syntaxe Anthropic SDK
  // → Gemini utilise model.generateContent()
  const model  = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const base64 = toBase64(cniRectoPath);

  const result = await model.generateContent([
    {
      inlineData: { data: base64, mimeType: 'image/jpeg' }
    },
    `Tu es un expert en vérification de documents d'identité.
    Analyse cette image et réponds UNIQUEMENT en JSON (sans backticks) :
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
    return parseJSON(result.response.text());
  } catch {
    return { estValide: false, raison: 'Impossible de lire les informations de la CNI' };
  }
};


//=========================    VÉRIFIER LA VALIDITÉ RECTO/VERSO    =============================

const verifierValiditeCNI = async (cniRectoPath, cniVersoPath) => {
  const model      = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const base64Recto = toBase64(cniRectoPath);
  const base64Verso = toBase64(cniVersoPath);

  const result = await model.generateContent([
    { inlineData: { data: base64Recto, mimeType: 'image/jpeg' } },
    { inlineData: { data: base64Verso, mimeType: 'image/jpeg' } },
    `Tu es un expert en vérification de documents d'identité.
    Analyse le recto et le verso de cette CNI.
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


//=============================    COMPARER VISAGE CNI ET SELFIE    =======================

const comparerVisages = async (cniRectoPath, selfiePath) => {
  const model      = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const base64CNI    = toBase64(cniRectoPath);
  const base64Selfie = toBase64(selfiePath);

  const result = await model.generateContent([
    { inlineData: { data: base64CNI,    mimeType: 'image/jpeg' } },
    { inlineData: { data: base64Selfie, mimeType: 'image/jpeg' } },
    `Tu es un expert en reconnaissance faciale et vérification d'identité.
    La première image est une CNI, la deuxième est un selfie en direct.
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

module.exports = { extraireInfosCNI, verifierValiditeCNI, comparerVisages };