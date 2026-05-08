import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({
    username:'', email:'', password:'', password2:'', phone:''
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { register }          = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password2) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form.username, form.email, form.password, form.password2, form.phone);
      navigate('/');
    } catch {
      setError("Erreur lors de l'inscription. Vérifiez les champs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-10">
      <div className="card bg-base-100 w-full max-w-md shadow-2xl border border-base-200">
        <div className="card-body p-8">
          <div className="text-center mb-8">
            <Link to="/" className="font-display text-3xl font-semibold tracking-widest">MALICHOU</Link>
            <p className="text-xs uppercase tracking-widest opacity-40 mt-2">Créer un compte</p>
          </div>

          {error && <div className="alert alert-error mb-4 text-sm"><span>{error}</span></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key:'username', label:"Nom d'utilisateur", type:'text' },
              { key:'email',    label:'Email',              type:'email' },
              { key:'phone',    label:'Téléphone',          type:'tel' },
            ].map(f => (
              <fieldset key={f.key} className="fieldset">
                <legend className="fieldset-legend text-xs uppercase tracking-widest opacity-60">{f.label}</legend>
                <input type={f.type} className="input input-bordered w-full"
                  placeholder={f.key === 'phone' ? '+226 XX XX XX XX' : ''}
                  value={form[f.key]}
                  onChange={e => setForm({...form, [f.key]: e.target.value})}
                  required={f.key !== 'phone'}/>
              </fieldset>
            ))}

            {['password','password2'].map((k, i) => (
              <fieldset key={k} className="fieldset">
                <legend className="fieldset-legend text-xs uppercase tracking-widest opacity-60">
                  {i === 0 ? 'Mot de passe' : 'Confirmer le mot de passe'}
                </legend>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'}
                    className="input input-bordered w-full pr-12"
                    value={form[k]}
                    onChange={e => setForm({...form, [k]: e.target.value})}
                    required/>
                  {i === 0 && (
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70">
                      {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  )}
                </div>
              </fieldset>
            ))}

            <button type="submit"
              className={`btn btn-primary w-full uppercase tracking-widest mt-2 ${loading ? 'loading' : ''}`}>
              {!loading && <><UserPlus size={16}/> Créer mon compte</>}
            </button>
          </form>

          <div className="divider text-xs opacity-40">OU</div>
          <p className="text-center text-sm">
            Déjà un compte ?{' '}
            <Link to="/login" className="link link-primary font-medium">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}