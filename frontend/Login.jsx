import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginService } from '../api/authService';
import useAuthStore from '../stores/authStore';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();         // action du store Zustand
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,           // ← c'est "register" pas "login"
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (donnees) => {
    setLoading(true);
    setError('');
    try {
      const response = await loginService({
        email: donnees.email,
        password: donnees.password,   // ← "password" pas "mdp"
      });
      login(response.user, response.token);  // ← hydrate le store Zustand
      navigate('/annonces');                   // ← redirige après connexion
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <input
          {...register('email', {
            required: "L'email est requis",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Email invalide',
            },
          })}
          placeholder="Email"
        />
        {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
      </div>

      <div>
        <input
          type="password"
          {...register('password', {           // ← "password" pas "mdp"
            required: 'Le mot de passe est requis',
            minLength: { value: 6, message: '6 caractères minimum' },
          })}
          placeholder="Mot de passe"
        />
        {errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}
      </div>

      <div>
        <p>Pas encore de compte ? <Link to="/register">S'inscrire</Link></p>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>

    </form>
  );
}

export default Login;
