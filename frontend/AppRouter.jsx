import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ScrollToTop    from '../components/ScrollToTop';
import Navbar         from '../components/Navbar';
import ProtectedRoute from './ProtectedRoute';

import Home           from '../pages/Home';
import Login          from '../pages/Login';
import Register       from '../pages/Register';
import Annonces       from '../pages/Annonces';
import AnnonceDetails from '../pages/AnnonceDetails';
import CreateAnnonce  from '../pages/CreateAnnonce';
import Profile        from '../pages/Profile';
import NotFound       from '../pages/NotFound';


function AppRouter() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <ScrollToTop />
      <Navbar />

      <Routes>
        {/* Routes publiques */}
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/annonces" element={<Annonces />} />

        {/* Routes protégées — utilise le pattern Outlet, pas wrapper */}
        <Route element={<ProtectedRoute />}>
          <Route path="/annonces/create" element={<CreateAnnonce />} />
          <Route path="/annonces/:id"    element={<AnnonceDetails />} />
          <Route path="/profile"         element={<Profile />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
