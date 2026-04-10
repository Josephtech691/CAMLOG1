import api from './axiosConfig';

// GET /annonce — avec filtres optionnels (ville, type, prix...)
export async function getAllAnnonces(params) {
  const response = await api.get('/annonces',  params ); // ← { params } envoie les filtres en query string
  return response.data;
};

// GET /annonces/:id — l'id s'injecte dans l'URL avec un template string
export async function getAnnonceById(id) {
  const response = await api.get(`/annonces/see/${id}`);
  return response.data;
};

// POST /annonces
export async function createAnnonce(data) {
  const response = await api.post('/annonces', data);
  return response.data;
};

// DELETE /annonces/:id
export async function deleteAnnonce(id) {
  const response = await api.delete(`/annonces/${id}`);
  return response.data;
};