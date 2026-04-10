import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-8xl font-extrabold text-blue-200">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mt-4">Page introuvable</h2>
      <p className="text-gray-500 mt-2">Cette page n'existe pas ou a été déplacée.</p>
      <Link to="/"
        className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
        ← Retour à l'accueil
      </Link>
    </div>
  );
}

export default NotFound;
