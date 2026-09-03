import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../api';
import PhoneInput   from '../components/PhoneInput';
import AddressInput from '../components/AddressInput';
import {
  Banknote, Smartphone,
  MapPin, CheckCircle, Phone
} from 'lucide-react';

export default function Checkout() {
  const { cart, fetchCart }  = useCart();
  const { user }              = useAuth();
  const [address, setAddress] = useState('');
  const [phone,   setPhone]   = useState(user?.phone || '');
  const [method,  setMethod]  = useState('cash');
  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [order,   setOrder]   = useState(null);

  const PAYMENT_METHODS = [
    { key:'cash',   label:'Espèces à la livraison', icon:Banknote,   desc:'Payez en cash à la réception' },
    { key:'online', label:'Paiement en ligne',       icon:Smartphone, desc:'Orange Money, Moov Money, Coris Money, carte bancaire — via PayDunya' },
  ];

  const handleContinue = async () => {
    if (!address.trim()) { setError("Veuillez entrer une adresse de livraison."); return; }
    if (!phone.trim())   { setError("Veuillez entrer un numéro de téléphone."); return; }
    setError('');

    if (method === 'cash') {
      setLoading(true);
      try {
        const res = await api.post('/payment/cash/', {
          address,
          phone,
        });
        setOrder(res.data);
        await fetchCart();
        setStep(3);
      } catch {
        setError('Erreur lors de la commande.');
      } finally {
        setLoading(false);
      }

    } else if (method === 'online') {
      setLoading(true);
      try {
        const res = await api.post('/payment/paydunya/init/', { address, phone });
        window.location.href = res.data.payment_url;
      } catch {
        setError('Erreur lors de la connexion au paiement en ligne.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (!user) return (
    <div className="min-h-screen bg-base-100">
      <Navbar/>
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="opacity-50">Connectez-vous pour continuer.</p>
        <Link to="/login" className="btn btn-primary btn-sm uppercase tracking-widest">Se connecter</Link>
      </div>
    </div>
  );

  if (cart.items.length === 0 && step !== 3) return (
    <div className="min-h-screen bg-base-100">
      <Navbar/>
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="opacity-50">Votre panier est vide.</p>
        <Link to="/" className="btn btn-primary btn-sm uppercase tracking-widest">Découvrir la collection</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar/>
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* ÉTAPES */}
        <ul className="steps w-full mb-12">
          {[
            { n:1, label:'Livraison' },
            { n:2, label:'Paiement' },
            { n:3, label:'Confirmation' },
          ].map(({ n, label }) => (
            <li key={n} className={`step ${step >= n ? 'step-primary' : ''}`}>
              <span className="text-xs uppercase tracking-widest">{label}</span>
            </li>
          ))}
        </ul>

        {/* ÉTAPE 1 */}
        {step === 1 && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] opacity-40 mb-2">Étape 1</p>
                <h1 className="font-display text-3xl font-light mb-6">Livraison & Paiement</h1>
              </div>

              {/* ADRESSE */}
              <div>
                <p className="text-xs uppercase tracking-widest opacity-40 mb-3 flex items-center gap-2">
                  <MapPin size={12}/> Adresse de livraison
                </p>
                <AddressInput value={address} onChange={setAddress}/>
              </div>

              {/* TÉLÉPHONE */}
              <div>
                <p className="text-xs uppercase tracking-widest opacity-40 mb-3 flex items-center gap-2">
                  <Phone size={12}/> Numéro de téléphone
                </p>
                <PhoneInput value={phone} onChange={setPhone}/>
              </div>

              {/* MÉTHODE DE PAIEMENT */}
              <div>
                <p className="text-xs uppercase tracking-widest opacity-40 mb-3">Mode de paiement</p>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map(({ key, label, icon: Icon, desc }) => (
                    <div key={key} onClick={() => setMethod(key)}
                      className={`flex items-center gap-4 p-4 border rounded cursor-pointer transition-all ${
                        method === key
                          ? 'border-primary bg-primary/10'
                          : 'border-base-300 hover:border-base-content/30'
                      }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        method === key ? 'bg-primary text-primary-content' : 'bg-base-200'
                      }`}>
                        <Icon size={18}/>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs opacity-40">{desc}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        method === key ? 'border-primary bg-primary' : 'border-base-300'
                      }`}/>
                    </div>
                  ))}
                </div>
              </div>

              {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

              <button onClick={handleContinue} disabled={loading}
                className={`btn btn-primary w-full uppercase tracking-widest ${loading ? 'loading' : ''}`}>
                {!loading && 'Continuer →'}
              </button>
            </div>

            {/* RÉSUMÉ */}
            <div className="lg:col-span-1">
              <div className="card bg-base-200 p-5 sticky top-24">
                <h3 className="font-display text-lg mb-4">Résumé</h3>
                <div className="space-y-2 mb-4">
                  {cart.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="opacity-60">{item.quantity}× {item.product.name}</span>
                      <span>{item.subtotal} FCFA</span>
                    </div>
                  ))}
                </div>
                <div className="divider my-2"/>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{cart.total} FCFA</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 — SUCCÈS (paiement cash uniquement — le paiement en ligne
            redirige vers PayDunya puis /checkout/confirmation/:orderId) */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
            <CheckCircle size={72} className="text-success"/>
            <div>
              <h2 className="font-display text-4xl font-light mb-2">Commande confirmée !</h2>
              <p className="opacity-50 text-sm">
                Commande #{order?.id} — Paiement en espèces à la livraison
              </p>
            </div>
            <p className="opacity-40 text-sm max-w-sm">
              Nous avons envoyé une confirmation à votre email.
              Vous serez contacté au {phone} pour la livraison.
            </p>
            <div className="flex gap-3">
              <Link to="/orders" className="btn btn-primary btn-sm uppercase tracking-widest">
                Mes commandes
              </Link>
              <Link to="/" className="btn btn-ghost btn-sm uppercase tracking-widest">
                Continuer mes achats
              </Link>
            </div>
          </div>
        )}
      </div>

      <footer className="footer footer-center bg-base-200 text-base-content p-8 mt-10 border-t border-base-300">
        <p className="font-display text-xl tracking-widest">MALICHOU</p>
        <p className="text-xs opacity-30">© 2026 MALICHOU — Tous droits réservés</p>
      </footer>
    </div>
  );
}