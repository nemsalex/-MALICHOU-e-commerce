import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [form,    setForm]    = useState({ username:'', password:'' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.username, form.password);
      navigate('/');
    } catch {
      setError('Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="card bg-base-100 w-full max-w-md shadow-2xl border border-base-200">
        <div className="card-body p-8">
          <div className="text-center mb-8">
            <Link to="/" className="font-display text-3xl font-semibold tracking-widest">MALICHOU</Link>
            <p className="text-xs uppercase tracking-widest opacity-40 mt-2">Connexion à votre compte</p>
          </div>

          {error && (
            <div className="alert alert-error mb-4 text-sm">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset className="fieldset">
              <legend className="fieldset-legend text-xs uppercase tracking-widest opacity-60">Nom d'utilisateur</legend>
              <input
                type="text"
                className="input input-bordered w-full"
                value={form.username}
                onChange={e => setForm({...form, username: e.target.value})}
                required
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend text-xs uppercase tracking-widest opacity-60">Mot de passe</legend>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input input-bordered w-full pr-12"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  required
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70">
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </fieldset>

            <button type="submit" className={`btn btn-primary w-full uppercase tracking-widest mt-2 ${loading ? 'loading' : ''}`}>
              {!loading && <LogIn size={16}/>}
              Se connecter
            </button>
          </form>

          <div className="divider text-xs opacity-40">OU</div>
          <p className="text-center text-sm">
            Pas de compte ?{' '}
            <Link to="/register" className="link link-primary font-medium">S'inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  );
}