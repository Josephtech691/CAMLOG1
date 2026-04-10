import api from './axiosConfig';

export async function register(data) {
  const response = await api.post('/auth/register', data);
  return response.data;
}

export async function login(data) {
  const response = await api.post('/auth/login', data);
  return response.data;
}

// PUT /auth/profile — met à jour le profil (nom, téléphone, ville, photo)
export async function updateProfile(data) {
  const response = await api.put('/auth/profile', data);
  return response.data;
}

// POST /auth/verify-identity — soumet les documents d'identité
export async function submitIdentityVerification(data) {
  const response = await api.post('/auth/verify-identity', data);
  return response.data;
}