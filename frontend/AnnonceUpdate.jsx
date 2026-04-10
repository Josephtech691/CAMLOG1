import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllAnnonces } from '../api/annonceServiceService';
import AnnoncesCard from './AnnoncesCard';

function Annonce() {
  const navigate = useNavigate();

  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [ville, setVille]       = useState('');
  const [type, setType]         = useState('');

  const chargerAnnonces = async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllAnnonces(params);
      setAnnonces(data);
    } catch (err) {
      setError('Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerAnnonces();
  }, []);

  const handleFiltrer = () => {
    const params = {};
    if (ville) params.ville = ville;
    if (type)  params.type  = type;
    chargerAnnonces(params);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* En-tête avec bouton Publier */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Annonces</h1>
        <button
          onClick={() => navigate('/annonce/creer')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold
            hover:bg-blue-700 transition"
        >
          + Publier une annonce
        </button>
      </div>

      {/* Barre de filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={ville}
          onChange={(e) => setVille(e.target.value)}
          placeholder="Ville"
          className="border border-gray-300 rounded-lg px-3 py-2 flex-1
            focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2
            focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Tous</option>
          <option value="vente">Vente</option>
          <option value="location">Location</option>
        </select>
        <button
          onClick={handleFiltrer}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition"
        >
          Filtrer
        </button>
      </div>

      {loading && <p className="text-center text-gray-500">Chargement...</p>}
      {error   && <p className="text-center text-red-500">{error}</p>}

      {!loading && annonces.length === 0 && (
        <p className="text-center text-gray-500 mt-10">Aucune annonce trouvée.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {annonces.map((annonce) => (
          <AnnoncesCard key={annonce.id} annonce={annonce} />
        ))}
      </div>

    </div>
  );
}

export default Annonce;
