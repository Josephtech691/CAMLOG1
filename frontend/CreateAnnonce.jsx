import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAnnonce} from '../api/annonceService';
import ImageUploader from '../components/ImagesUploader';

const VILLES_CAMEROUN = [
  'Yaoundé', 'Douala', 'Bafoussam', 'Bamenda', 'Garoua',
  'Maroua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Kumba',
];

function CreateAnnonce() {
  const navigate = useNavigate();

  // ── State principal ──
  const [formData, setFormData] = useState({
    titre:      '',
    type:       '',
    prix:       '',
    description:'',
    region:    '',
    ville:      '',
    quartier:   '',
    adresse:    '',
  });
  const [images, setImages]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [erreurs, setErreurs] = useState({}); // erreurs par champ

  // ── Mise à jour des champs ──
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Efface l'erreur du champ modifié
    setErreurs({ ...erreurs, [e.target.name]: '' });
  };

  // ── Validation avant envoi ──
  const valider = () => {
    const nouvellesErreurs = {};

    if (!formData.titre.trim())
      nouvellesErreurs.titre = 'Le titre est obligatoire.';

    if (!formData.type)
      nouvellesErreurs.type = 'Le type est obligatoire.';

    if (!formData.prix || Number(formData.prix) <= 0)
      nouvellesErreurs.prix = 'Le prix doit être un nombre positif.';

    if (!formData.ville)
      nouvellesErreurs.ville = 'La ville est obligatoire.';

    if (images.length === 0)
      nouvellesErreurs.images = 'Au moins une photo est obligatoire.';

    setErreurs(nouvellesErreurs);
    return Object.keys(nouvellesErreurs).length === 0; // true si aucune erreur
  };

  // ── Soumission ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!valider()) return; // stop si validation échoue

    setLoading(true);
    try {
      // FormData pour envoyer texte + fichiers ensemble
      const payload = new FormData();
      Object.entries(formData).forEach(([cle, valeur]) => {
        payload.append(cle, valeur);
      });
      images.forEach((img) => payload.append('images', img));

      const nouvelleAnnonce = await createAnnonce(payload);
      navigate(`/annonces/${nouvelleAnnonce.id}`); // ← redirige vers le détail
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la publication.");
    } finally {
      setLoading(false);
    }
  };

  // ── Composant champ avec message d'erreur ──
  const Champ = ({ label, name, type = 'text', ...rest }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-lg px-3 py-2
          focus:outline-none focus:ring-2 focus:ring-blue-400"
        {...rest}
      />
      {erreurs[name] && <p className="text-red-500 text-sm mt-1">{erreurs[name]}</p>}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Publier une annonce</h1>

      {/* Erreur globale */}
      {error && (
        <p className="bg-red-50 border border-red-300 text-red-600 rounded-lg px-4 py-3 mb-6">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">

        {/* ── Section 1 : Informations générales ── */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Informations générales
          </h2>

          <Champ label="Titre de l'annonce" name="titre" placeholder="Ex: Villa 4 pièces à Bastos" />

          {/* Select type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2
                focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">-- Choisir --</option>
              <option value="vente">Vente</option>
              <option value="location">Location</option>
            </select>
            {erreurs.type && <p className="text-red-500 text-sm mt-1">{erreurs.type}</p>}
          </div>

          <Champ label="Prix (FCFA)" name="prix" type="number" placeholder="Ex: 15000000" />

          {/* Textarea description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Décrivez le bien en détail..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2
                focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>
        </section>

        {/* ── Section 2 : Localisation ── */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Localisation
          </h2>

          {/* Select ville */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
            <select
              name="ville"
              value={formData.ville}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2
                focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">-- Choisir une ville --</option>
              {VILLES_CAMEROUN.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            {erreurs.ville && <p className="text-red-500 text-sm mt-1">{erreurs.ville}</p>}
          </div>

          <Champ label="Quartier" name="quartier" placeholder="Ex: Bastos" />
          <Champ label="Adresse complète" name="adresse" placeholder="Ex: Rue 1234, Quartier Bastos" />
        </section>

        {/* ── Section 3 : Caractéristiques ── */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Caractéristiques
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <Champ label="Nombre de pièces"     name="pieces"       type="number" placeholder="Ex: 5" />
          </div>
        </section>

        {/* ── Section 4 : Photos ── */}
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Photos
          </h2>
          <ImageUploader images={images} setImages={setImages} />
          {erreurs.images && <p className="text-red-500 text-sm">{erreurs.images}</p>}
        </section>

        {/* ── Bouton soumettre ── */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold
            hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Publication en cours...' : 'Publier l\'annonce'}
        </button>

      </form>
    </div>
  );
}

export default CreateAnnonce;
