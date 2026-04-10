import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllAnnonces } from '../api/annonceService';
import AnnoncesCard from '../components/AnnoncesCard';

const VILLES = ['Yaoundé','Douala','Bafoussam','Bamenda','Garoua','Maroua','Ngaoundéré','Bertoua'];

function Home() {
  const navigate = useNavigate();

  const [ville, setVille]         = useState('');
  const [type, setType]           = useState('');
  const [annonces, setAnnonces]   = useState([]);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    const charger = async () => {
      setLoading(true);
      try {
        const data = await getAllAnnonces({ limit: 6 });
        setAnnonces(data);
      } catch {
        // silencieux sur la page d'accueil
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, []);

  const handleRechercher = () => {
    const params = new URLSearchParams();
    if (ville) params.append('ville', ville);
    if (type)  params.append('type', type);
    navigate(`/annonces?${params.toString()}`); // ← '/annonces' pas '/annoces'
  };

  return (
    <div className="flex flex-col min-h-screen">

      {/* Hero */}
      <section className="relative bg-blue-700 text-white py-24 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-500 opacity-90" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Trouvez votre bien immobilier au Cameroun
          </h1>
        
          <p className="text-lg text-blue-100 mb-8">
            Des milliers d'annonces à Yaoundé, Douala et partout au pays.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl p-3 shadow-lg">
            <select
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              className="flex-1 text-gray-700 px-3 py-2 rounded-lg border border-gray-200
                focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Toutes les villes</option>
              {VILLES.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="flex-1 text-gray-700 px-3 py-2 rounded-lg border border-gray-200
                focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Vente & Location</option>
              <option value="vente">Vente</option>
              <option value="location">Location</option>
            </select>
            <button
              onClick={handleRechercher}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold
                hover:bg-blue-700 transition"
            >
              Rechercher
            </button>
          </div>
        </div>
      </section>

      {/* Annonces récentes */}
      <section className="max-w-6xl mx-auto px-4 py-16 w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Annonces récentes</h2>
          <Link to="/annonces" className="text-blue-600 hover:underline text-sm font-medium">
            Voir toutes les annonces →
          </Link>
        </div>
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-xl" />
            ))}
          </div>
        )}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {annonces.map((annonce) => (
              <AnnoncesCard key={annonce.id} annonce={annonce} />
            ))}
          </div>
        )}
      </section>

     
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-10 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-xl font-bold text-white">CAMLOG</span>
          <div className="flex gap-6 text-sm">
            <Link to="/annonces" className="hover:text-white transition">Annonces</Link>
            <Link to="/login"    className="hover:text-white transition">Se connecter</Link>
            <Link to="/a-propos" className="hover:text-white transition">A-propos</Link>
            <Link to="/services" className="hover:text-white transition">Services</Link>
          </div>
          <p className="text-xs text-gray-500">© 2026 CAMLOG — Plateforme immobilière camerounaise</p>
        </div>
      </footer>

    </div>
  );
}

export default Home;
