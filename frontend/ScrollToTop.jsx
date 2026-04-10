import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Ce composant ne retourne rien visuellement
// Il remonte la page en haut à chaque changement de route
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]); // se déclenche à chaque changement d'URL

  return null;
}

export default ScrollToTop;
