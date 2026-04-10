import { useState, useEffect } from 'react';
import { getAllAnnonces } from '../api/annonceService';
import AnnoncesCard from '../components/AnnoncesCard';

function Annonces() {
  const [annonces, setAnnonces] = useState([]);     
  const [loading, setLoading]   = useState(false);  
  const [error, setError]       = useState('');

  // Filtres
  const [ville, setVille] = useState('');
  const [type, setType]   = useState('');

  // Fonction séparée pour charger les annonces
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

  // Bouton filtrer
  const handleFiltrer = () => {
    const params = {};
    if (ville) params.ville = ville;
    if (type)  params.type  = type;
    chargerAnnonces(params);
  };

  return (
    <div>

      {/* Barre de filtres */}
      <div>
        <input
          value={ville}
          onChange={(e) => setVille(e.target.value)}
          placeholder="Ville"
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Tous</option>
          <option value="vente">Vente</option>
          <option value="location">Location</option>
        </select>
        <button onClick={handleFiltrer}>Filtrer</button>
      </div>

      {loading && <p>Chargement...</p>}
      {error   && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && annonces.length === 0 && (
        <p>Aucune annonce trouvée.</p>
      )}

      <div>
        {annonces.map((annonce) => (
          <AnnoncesCard key={annonce.id} annonce={annonce} />
        ))}
      </div>

    </div>
  );
}

export default Annonces;
