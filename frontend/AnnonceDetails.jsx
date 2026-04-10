import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAnnonceById, deleteAnnonce } from '../api/annonceService';
import useAuthStore from '../stores/authStore';

function AnnonceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore((state) => state);

  const [annonce, setAnnonce]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getAnnonceById(id);
        setAnnonce(data);
      } catch (err) {
        setError("Impossible de charger l'annonce.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSupprimer = async () => {
    try {
      await deleteAnnonce(id);
      navigate('/annonces');
    } catch (err) {
      setError('Erreur lors de la suppression.');
    }
  };

  const dateFormatee = annonce
    ? new Date(annonce.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (error)   return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!annonce) return <p className="text-center mt-10">Annonce introuvable.</p>;

 const BASE_URL = import.meta.env.VITE_API_BASE_URLS.replace('/api', '');

const photos = annonce.images?.length > 0
  ? annonce.images.map((img) => `${BASE_URL}/uploads/${img}`)
  : ['https://placehold.co/600x400?text=Pas+de+photo'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      <Link to="/annonces" className="inline-flex items-center gap-1 text-blue-600 hover:underline mb-6">
        ← Retour aux annonces
      </Link>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Galerie */}
        <div className="lg:w-1/2">
          <img
            src={photos[photoIndex]}
            alt={annonce.titre}
            className="w-full h-80 object-cover rounded-xl"
          />
          <div className="flex gap-2 mt-2 overflow-x-auto">
            {photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`photo-${index}`}
                onClick={() => setPhotoIndex(index)}
                className={`w-20 h-16 object-cover rounded-lg cursor-pointer border-2 transition
                  ${photoIndex === index ? 'border-blue-500' : 'border-transparent hover:border-blue-300'}`}
              />
            ))}
          </div>
        </div>

        {/* Infos */}
        <div className="lg:w-1/2 flex flex-col">
          <span className={`self-start px-3 py-1 rounded-full text-sm font-semibold
            ${annonce.type === 'vente' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
            {annonce.type === 'vente' ? 'Vente' : 'Location'}
          </span>

          <h1 className="text-2xl font-bold text-gray-900 mt-2">{annonce.titre}</h1>

          <p className="text-3xl font-bold text-blue-700 mt-2">
            {Number(annonce.prix).toLocaleString('fr-FR')} FCFA
          </p>

          <div className="flex flex-wrap gap-4 text-gray-600 mt-4">
            <span>📍 {annonce.ville}</span>
            <span>🏘️ {annonce.quartier}</span>
          </div>

          <p className="text-gray-700 mt-4 leading-relaxed">{annonce.description}</p>

          <button className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
            Contacter le vendeur
          </button>

          {user?.id === annonce.userId && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => navigate(`/annonces/${id}/modifier`)}
                className="flex-1 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
              >
                Modifier
              </button>
              <button
                onClick={handleSupprimer}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Section propriétaire */}
      <div className="mt-10 p-4 border rounded-xl flex items-center gap-4 bg-gray-50">
        <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-800 text-xl flex-shrink-0">
          {annonce.owner?.name?.[0]?.toUpperCase() || '?'} {/* ← annonce.owner, pas listing.owner */}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{annonce.owner?.name || 'Propriétaire inconnu'}</p>
          <p className="text-sm text-gray-500">Publié le {dateFormatee}</p>
          <p className="text-sm mt-1">
            {annonce.owner?.isVerified ? '✅ Identité vérifiée' : '⚠️ Identité non vérifiée'}
          </p>
        </div>
      </div>

    </div>
  );
}

export default AnnonceDetail;
