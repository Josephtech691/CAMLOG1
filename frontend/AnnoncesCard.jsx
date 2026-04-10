import { useNavigate } from 'react-router-dom';


function AnnoncesCard({ annonce }) {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_BASE_URLS.replace('/api', '');

  return (
    <div>
      {/* Photo principale ou placeholder */}
      

    <img
    src={
    annonce.images?.[0]
      ? `${BASE_URL}/uploads/${annonce.images[0]}`
      : 'https://placehold.co/300x200?text=Pas+de+photo'
    }
     alt={annonce.titre}
    className="w-full h-48 object-cover rounded-t-xl"
    />

      <h2>{annonce.titre}</h2>

      {/* Badge type */}
      <span>{annonce.type}</span>

      <p>{annonce.ville} — {annonce.quartier}</p>

      {/* Prix formaté en FCFA */}
      <p>
        {Number(annonce.prix).toLocaleString('fr-FR')} FCFA
      </p>

      <button onClick={() => navigate(`/annonces/${annonce.id}`)}>
        Voir détails
      </button>
    </div>
  );
}

export default AnnoncesCard;
