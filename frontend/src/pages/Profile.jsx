import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../api';
import {
  User, Mail, Phone, Lock,
  CheckCircle, Package, Edit3, Save, X
} from 'lucide-react';

const STATUS_CONFIG = {
  pending:   { label:'En attente',  color:'badge-warning' },
  confirmed: { label:'Confirmée',   color:'badge-info' },
  shipped:   { label:'Expédiée',    color:'badge-primary' },
  delivered: { label:'Livrée',      color:'badge-success' },
  cancelled: { label:'Annulée',     color:'badge-error' },
};

export default function Profile() {
  const { user, logout }             = useAuth();
  const [orders,      setOrders]     = useState([]);
  const [editMode,    setEditMode]   = useState(false);
  const [toast,       setToast]      = useState('');
  const [toastType,   setToastType]  = useState('success');
  const [loadingInfo, setLoadingInfo]= useState(false);
  const [loadingPwd,  setLoadingPwd] = useState(false);

  const [form, setForm] = useState({
    email: '',
    phone: '',
    current_password: '',
  });

  const [pwdForm, setPwdForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        email: user.email  || '',
        phone: user.phone  || '',
        current_password: '',
      });
      api.get('/orders/').then(r => setOrders(r.data));
    }
  }, [user]);

  const showToast = (msg, type = 'success') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), 3000);
  };

  const handleUpdateProfile = async () => {
    setLoadingInfo(true);
    try {
      await api.patch('/auth/profile/', form);
      showToast('Profil mis à jour avec succès !');
      setEditMode(false);
      setForm(f => ({ ...f, current_password: '' }));
    } catch (err) {
      showToast(err.response?.data?.error || 'Erreur lors de la mise à jour.', 'error');
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.new_password !== pwdForm.confirm_password) {
      showToast('Les mots de passe ne correspondent pas.', 'error');
      return;
    }
    setLoadingPwd(true);
    try {
      await api.post('/auth/password/', {
        old_password: pwdForm.old_password,
        new_password: pwdForm.new_password,
      });
      showToast('Mot de passe modifié avec succès !');
      setPwdForm({ old_password:'', new_password:'', confirm_password:'' });
    } catch (err) {
      showToast(err.response?.data?.error || 'Erreur lors du changement.', 'error');
    } finally {
      setLoadingPwd(false);
    }
  };

  if (!user) return (
    <div className="min-h-screen bg-base-100">
      <Navbar/>
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="opacity-50">Connectez-vous pour voir votre profil.</p>
        <Link to="/login" className="btn btn-primary btn-sm uppercase tracking-widest">
          Se connecter
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar/>

      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* HEADER */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] opacity-40 mb-2">Mon compte</p>
          <h1 className="font-display text-4xl font-light">Profil</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* COLONNE GAUCHE */}
          <div className="lg:col-span-1 space-y-4">

            {/* AVATAR */}
            <div className="card bg-base-200 p-6 text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={32} className="opacity-60" style={{color:'#c9956c'}}/>
              </div>
              <p className="font-display text-xl font-medium">{user.username}</p>
              <p className="text-xs opacity-40 mt-1 uppercase tracking-widest">Cliente MALICHOU</p>
              <div className="divider my-4"/>
              <div className="space-y-2 text-sm text-left">
                <div className="flex items-center gap-2 opacity-60">
                  <Mail size={13}/>
                  <span className="truncate">{user.email || 'Non renseigné'}</span>
                </div>
                <div className="flex items-center gap-2 opacity-60">
                  <Phone size={13}/>
                  <span>{user.phone || 'Non renseigné'}</span>
                </div>
                <div className="flex items-center gap-2 opacity-60">
                  <Package size={13}/>
                  <span>{orders.length} commande(s)</span>
                </div>
              </div>
            </div>

            {/* NAVIGATION */}
            <div className="card bg-base-200 p-4">
              <ul className="menu p-0 gap-1">
                <li><Link to="/orders"><Package size={15}/> Mes commandes</Link></li>
                <li>
                  <button onClick={logout} className="text-error">
                    <X size={15}/> Déconnexion
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* COLONNE DROITE */}
          <div className="lg:col-span-2 space-y-6">

            {/* INFOS PERSONNELLES */}
            <div className="card bg-base-100 border border-base-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-light">Informations personnelles</h2>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="btn btn-ghost btn-sm gap-2">
                  {editMode ? <X size={14}/> : <Edit3 size={14}/>}
                  {editMode ? 'Annuler' : 'Modifier'}
                </button>
              </div>

              <div className="space-y-4">
                {/* USERNAME (non modifiable) */}
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-40 mb-2 flex items-center gap-2">
                    <User size={11}/> Nom d'utilisateur
                  </p>
                  <p className="input input-bordered flex items-center opacity-50 cursor-not-allowed">
                    {user.username}
                  </p>
                </div>

                {/* EMAIL */}
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-40 mb-2 flex items-center gap-2">
                    <Mail size={11}/> Email
                  </p>
                  {editMode ? (
                    <input
                      type="email"
                      className="input input-bordered w-full"
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                    />
                  ) : (
                    <p className="input input-bordered flex items-center opacity-70">
                      {user.email || 'Non renseigné'}
                    </p>
                  )}
                </div>

                {/* TÉLÉPHONE */}
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-40 mb-2 flex items-center gap-2">
                    <Phone size={11}/> Téléphone
                  </p>
                  {editMode ? (
                    <input
                      type="tel"
                      className="input input-bordered w-full"
                      placeholder="+226 XX XX XX XX"
                      value={form.phone}
                      onChange={e => setForm({...form, phone: e.target.value})}
                    />
                  ) : (
                    <p className="input input-bordered flex items-center opacity-70">
                      {user.phone || 'Non renseigné'}
                    </p>
                  )}
                </div>

                {editMode && form.email !== (user.email || '') && (
                  <div>
                    <p className="text-xs uppercase tracking-widest opacity-40 mb-2 flex items-center gap-2">
                      <Lock size={11}/> Mot de passe actuel (requis pour changer d'email)
                    </p>
                    <input
                      type="password"
                      className="input input-bordered w-full"
                      value={form.current_password}
                      onChange={e => setForm({...form, current_password: e.target.value})}
                    />
                  </div>
                )}

                {editMode && (
                  <button
                    onClick={handleUpdateProfile}
                    disabled={loadingInfo}
                    className={`btn btn-primary w-full uppercase tracking-widest ${loadingInfo ? 'loading' : ''}`}>
                    {!loadingInfo && <><Save size={14}/> Enregistrer</>}
                  </button>
                )}
              </div>
            </div>

            {/* CHANGER MOT DE PASSE */}
            <div className="card bg-base-100 border border-base-200 p-6">
              <h2 className="font-display text-2xl font-light mb-6">Changer le mot de passe</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                {[
                  { key:'old_password',     label:'Ancien mot de passe' },
                  { key:'new_password',     label:'Nouveau mot de passe' },
                  { key:'confirm_password', label:'Confirmer le nouveau mot de passe' },
                ].map(f => (
                  <div key={f.key}>
                    <p className="text-xs uppercase tracking-widest opacity-40 mb-2 flex items-center gap-2">
                      <Lock size={11}/> {f.label}
                    </p>
                    <input
                      type="password"
                      className="input input-bordered w-full"
                      value={pwdForm[f.key]}
                      onChange={e => setPwdForm({...pwdForm, [f.key]: e.target.value})}
                      required
                    />
                  </div>
                ))}
                <button type="submit" disabled={loadingPwd}
                  className={`btn btn-primary w-full uppercase tracking-widest ${loadingPwd ? 'loading' : ''}`}>
                  {!loadingPwd && <><Lock size={14}/> Changer le mot de passe</>}
                </button>
              </form>
            </div>

            {/* DERNIÈRES COMMANDES */}
            <div className="card bg-base-100 border border-base-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-light">Dernières commandes</h2>
                <Link to="/orders" className="btn btn-ghost btn-xs uppercase tracking-widest">
                  Voir tout
                </Link>
              </div>

              {orders.length === 0 ? (
                <p className="opacity-40 text-sm">Aucune commande pour l'instant.</p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 3).map(order => {
                    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    return (
                      <div key={order.id}
                        className="flex items-center justify-between p-4 bg-base-200 rounded">
                        <div>
                          <p className="text-sm font-medium">Commande #{order.id}</p>
                          <p className="text-xs opacity-40 mt-1">
                            {new Date(order.created_at).toLocaleDateString('fr-FR', {
                              day:'numeric', month:'long', year:'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`badge ${cfg.color} badge-sm`}>{cfg.label}</span>
                          <p className="text-sm font-semibold mt-1">{order.total} FCFA</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="toast toast-bottom toast-end z-50">
          <div className={`alert ${toastType === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
            {toastType === 'success' ? <CheckCircle size={16}/> : <X size={16}/>}
            <span className="text-sm">{toast}</span>
          </div>
        </div>
      )}

      <footer className="footer footer-center bg-base-200 text-base-content p-8 mt-10 border-t border-base-300">
        <p className="font-display text-xl tracking-widest">MALICHOU</p>
        <p className="text-xs opacity-30">© 2026 MALICHOU — Tous droits réservés</p>
      </footer>
    </div>
  );
}