import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';


function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore((state) => state);
  const [isOpen, setIsOpen] = useState(false); // menu hamburger

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <nav className="bg-white border-b shadow-sm px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-blue-600 tracking-tight">
          CAMLOG
        </Link>

        {/* Liens desktop */}
        <div className="hidden md:flex items-center gap-5">
          <Link to="/annonces" className="text-sm text-gray-600 hover:text-blue-600 transition">
            Annonces
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/annonces/create" className="text-sm text-gray-600 hover:text-blue-600 transition">
                Publier
              </Link>
              <button
                onClick={() => navigate('/profile')}
                className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center
                  font-bold text-blue-800 text-sm hover:bg-blue-300 transition"
              >
                {user?.name?.[0]?.toUpperCase() || '?'}
              </button>
              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-700 transition"
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 transition">
                Se connecter
              </Link>
              <Link to="/register"
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg
                  hover:bg-blue-700 transition">
                S'inscrire
              </Link>
            </>
          )}
        </div>

        {/* Bouton hamburger — mobile uniquement */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex flex-col gap-1 p-2"
          aria-label="Menu"
        >
          <span className={`block w-6 h-0.5 bg-gray-700 transition-transform ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
          <span className={`block w-6 h-0.5 bg-gray-700 transition-opacity ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-gray-700 transition-transform ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </button>
      </div>

      {/* Menu mobile déroulant */}
      {isOpen && (
        <div className="md:hidden flex flex-col gap-3 px-4 pt-3 pb-4 border-t mt-2">
          <Link to="/annonces" onClick={() => setIsOpen(false)}
            className="text-sm text-gray-700 hover:text-blue-600">Annonces</Link>

          {isAuthenticated ? (
            <>
              <Link to="/annonces/create" onClick={() => setIsOpen(false)}
                className="text-sm text-gray-700 hover:text-blue-600">Publier</Link>
              <Link to="/profile" onClick={() => setIsOpen(false)}
                className="text-sm text-gray-700 hover:text-blue-600">Mon profil</Link>
              <button onClick={handleLogout}
                className="text-sm text-red-500 text-left hover:text-red-700">
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsOpen(false)}
                className="text-sm text-gray-700 hover:text-blue-600">Se connecter</Link>
              <Link to="/register" onClick={() => setIsOpen(false)}
                className="text-sm text-gray-700 hover:text-blue-600">S'inscrire</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
