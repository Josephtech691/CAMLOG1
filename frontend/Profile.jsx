import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { updateProfile, submitIdentityVerification } from '../api/authService';
import { getAllAnnonces, deleteAnnonce } from '../api/annonceService';
import AnnoncesCard from '../components/AnnoncesCard'; // ← import correct

function Profile() {
  const navigate = useNavigate();
  const { user, login: majStore } = useAuthStore((state) => state);

  const [onglet, setOnglet] = useState('annonces');

  const [annonces, setAnnonces]           = useState([]);
  const [loadAnnonces, setLoadAnnonces]   = useState(false);
  const [errAnnonces, setErrAnnonces]     = useState('');

  const [profil, setProfil] = useState({
    name:  user?.name  || '',
    phone: user?.phone || '',
    ville: user?.ville || '',
  });
  const [photoFichier, setPhotoFichier] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.photo || null);
  const [loadProfil, setLoadProfil]     = useState(false);
  const [errProfil, setErrProfil]       = useState('');
  const [okProfil, setOkProfil]         = useState('');

  const [typeDoc, setTypeDoc]           = useState('CNI');
  const [recto, setRecto]               = useState(null);
  const [verso, setVerso]               = useState(null);
  const [loadIdentite, setLoadIdentite] = useState(false);
  const [errIdentite, setErrIdentite]   = useState('');
  const [okIdentite, setOkIdentite]     = useState('');

  useEffect(() => {
    const charger = async () => {
      setLoadAnnonces(true);
      setErrAnnonces('');
      try {
        const data = await getAllAnnonces({ userId: user?.id });
        setAnnonces(data);
      } catch {
        setErrAnnonces('Erreur lors du chargement des annonces.');
      } finally {
        setLoadAnnonces(false);
      }
    };
    charger();
  }, []);

  const handleSupprimer = async (id) => {
    try {
      await deleteAnnonce(id);
      setAnnonces(annonces.filter((a) => a.id !== id));
    } catch {
      setErrAnnonces('Erreur lors de la suppression.');
    }
  };

  const handleChangeProfil = (e) => {
    setProfil({ ...profil, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const fichier = e.target.files[0];
    if (!fichier) return;
    setPhotoFichier(fichier);
    setPhotoPreview(URL.createObjectURL(fichier));
  };

  const handleSauvegarderProfil = async (e) => {
    e.preventDefault();
    setLoadProfil(true);
    setErrProfil('');
    setOkProfil('');
    try {
      const payload = new FormData();
      Object.entries(profil).forEach(([k, v]) => payload.append(k, v));
      if (photoFichier) payload.append('photo', photoFichier);
      const userMaj = await updateProfile(payload);
      majStore(userMaj, localStorage.getItem('token'));
      setOkProfil('Profil mis à jour avec succès.');
    } catch (err) {
      setErrProfil(err.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setLoadProfil(false);
    }
  };

  const handleSoumettreIdentite = async (e) => {
    e.preventDefault();
    if (!recto) { setErrIdentite('Le recto du document est obligatoire.'); return; }
    if (typeDoc === 'CNI' && !verso) { setErrIdentite('Le verso est obligatoire pour la CNI.'); return; }
    setLoadIdentite(true);
    setErrIdentite('');
    setOkIdentite('');
    try {
      const payload = new FormData();
      payload.append('typeDoc', typeDoc);
      payload.append('recto', recto);
      if (verso) payload.append('verso', verso);
      await submitIdentityVerification(payload);
      setOkIdentite('Documents soumis. Vérification en cours.');
    } catch (err) {
      setErrIdentite(err.response?.data?.message || 'Erreur lors de la soumission.');
    } finally {
      setLoadIdentite(false);
    }
  };

  const dateInscription = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—';

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col lg:flex-row gap-8">

      {/* Sidebar */}
      <aside className="lg:w-1/4 flex flex-col items-center text-center gap-3">
        {photoPreview ? (
          <img src={photoPreview} alt="avatar"
            className="w-24 h-24 rounded-full object-cover border-2 border-blue-300" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-blue-200 flex items-center justify-center
            text-3xl font-bold text-blue-800">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
        <p className="text-sm text-gray-500">{user?.email}</p>
        <p className="text-xs text-gray-400">Inscrit le {dateInscription}</p>
        {user?.isVerified ? (
          <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
            ✅ Identité vérifiée
          </span>
        ) : (
          <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
            ⚠️ Non vérifié
          </span>
        )}
      </aside>

      {/* Contenu onglets */}
      <div className="flex-1">
        <div className="flex border-b mb-6">
          {[
            { id: 'annonces', label: 'Mes annonces' },
            { id: 'profil',   label: 'Modifier mon profil' },
            { id: 'identite', label: "Vérification d'identité" },
          ].map((o) => (
            <button key={o.id} onClick={() => setOnglet(o.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition
                ${onglet === o.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {o.label}
            </button>
          ))}
        </div>

        {/* Onglet Mes annonces */}
        {onglet === 'annonces' && (
          <div>
            {loadAnnonces && <p className="text-gray-500">Chargement...</p>}
            {errAnnonces  && <p className="text-red-500">{errAnnonces}</p>}
            {!loadAnnonces && annonces.length === 0 && (
              <p className="text-gray-500">Vous n'avez pas encore d'annonces.</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {annonces.map((annonce) => (
                <div key={annonce.id} className="relative">
                  <span className={`absolute top-2 left-2 z-10 text-xs font-semibold px-2 py-1 rounded-full
                    ${annonce.statut === 'active'     ? 'bg-green-100 text-green-700'   : ''}
                    ${annonce.statut === 'en_attente'  ? 'bg-yellow-100 text-yellow-700' : ''}
                    ${annonce.statut === 'desactivee'  ? 'bg-gray-100 text-gray-500'    : ''}`}>
                    {annonce.statut === 'active'     && 'Active'}
                    {annonce.statut === 'en_attente'  && 'En attente'}
                    {annonce.statut === 'desactivee'  && 'Désactivée'}
                  </span>

                  <AnnoncesCard annonce={annonce} /> {/* ← AnnoncesCard pas AnnoncesCardCard */}

                  <div className="flex gap-2 mt-2">
                    <button onClick={() => navigate(`/annonces/${annonce.id}/modifier`)}
                      className="flex-1 py-1 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                      Modifier
                    </button>
                    <button onClick={() => handleSupprimer(annonce.id)}
                      className="flex-1 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Onglet Modifier profil */}
        {onglet === 'profil' && (
          <form onSubmit={handleSauvegarderProfil} className="flex flex-col gap-4 max-w-md">
            {errProfil && <p className="text-red-500 text-sm">{errProfil}</p>}
            {okProfil  && <p className="text-green-600 text-sm">{okProfil}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo de profil</label>
              {photoPreview && (
                <img src={photoPreview} alt="preview"
                  className="w-16 h-16 rounded-full object-cover mb-2 border" />
              )}
              <input type="file" accept="image/*" onChange={handlePhotoChange}
                className="text-sm text-gray-500" />
            </div>
            {[
              { label: 'Nom complet',        name: 'name',  placeholder: 'Votre nom' },
              { label: 'Téléphone',          name: 'phone', placeholder: 'Ex: 699000000' },
              { label: 'Ville de résidence', name: 'ville', placeholder: 'Ex: Yaoundé' },
            ].map(({ label, name, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input name={name} value={profil[name]} onChange={handleChangeProfil}
                  placeholder={placeholder}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2
                    focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            ))}
            <button type="submit" disabled={loadProfil}
              className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
              {loadProfil ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </form>
        )}

        {/* Onglet Vérification identité */}
        {onglet === 'identite' && (
          <div className="max-w-md">
            {user?.isVerified ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-green-700 font-semibold">✅ Identité vérifiée</p>
                <p className="text-sm text-green-600 mt-1">
                  Vérifié le {new Date(user.verifiedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSoumettreIdentite} className="flex flex-col gap-4">
                {errIdentite && <p className="text-red-500 text-sm">{errIdentite}</p>}
                {okIdentite  && <p className="text-green-600 text-sm">{okIdentite}</p>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de document</label>
                  <select value={typeDoc} onChange={(e) => setTypeDoc(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2
                      focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="CNI">CNI</option>
                    <option value="Passeport">Passeport</option>
                    <option value="Permis">Permis de conduire</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recto du document</label>
                  <input type="file" accept="image/*"
                    onChange={(e) => setRecto(e.target.files[0])}
                    className="text-sm text-gray-500" />
                </div>
                {typeDoc === 'CNI' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Verso du document</label>
                    <input type="file" accept="image/*"
                      onChange={(e) => setVerso(e.target.files[0])}
                      className="text-sm text-gray-500" />
                  </div>
                )}
                <button type="submit" disabled={loadIdentite}
                  className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                  {loadIdentite ? 'Envoi en cours...' : 'Soumettre pour vérification'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
