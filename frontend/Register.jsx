import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerService } from '../api/authService';

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (donnees) => {
    setLoading(true);
    setError('');
    try {
      await registerService({
        name: donnees.name,
        phone: donnees.phone,
        email: donnees.email,
        password: donnees.password,   // ← "password" pas "mdp"
      });
      navigate('/login');              // ← redirige vers login après inscription
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <input
          {...register('name', { required: 'Le nom est requis' })}
          placeholder="Nom complet"
        />
        {errors.name && <p style={{ color: 'red' }}>{errors.name.message}</p>}
        {/*  ← "errors.name" pas "errors.nom" */}
      </div>

      <div>
        <input
          {...register('phone', { required: 'Le numéro de téléphone est requis' })}
          placeholder="Téléphone"
        />
        {errors.phone && <p style={{ color: 'red' }}>{errors.phone.message}</p>}
      </div>

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
          {...register('password', {          // ← "password" pas "mdp"
            required: 'Le mot de passe est requis',
            minLength: { value: 6, message: '6 caractères minimum' },
          })}
          placeholder="Mot de passe"
        />
        {errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}
      </div>

      <div>
        <p>Déjà un compte ? <Link to="/login">Se connecter</Link></p>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Inscription...' : "S'inscrire"}
      </button>

    </form>
  );
}

export default Register;
