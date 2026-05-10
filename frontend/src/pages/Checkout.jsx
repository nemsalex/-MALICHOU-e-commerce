import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import PhoneInput   from '../components/PhoneInput';
import AddressInput from '../components/AddressInput';
import {
  CreditCard, Banknote, Smartphone,
  MapPin, CheckCircle, ArrowLeft, Phone
} from 'lucide-react';


function StripeForm({ clientSecret, onSuccess }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) }
    });

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    } else if (result.paymentIntent.status === 'succeeded') {
      onSuccess('card');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-base-300 rounded">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#ffffff',
              '::placeholder': { color: '#666' },
            }
          }
        }}/>
      </div>
      {error && <p className="text-error text-sm">{error}</p>}
      <button type="submit" disabled={!stripe || loading}
        className={`btn btn-primary w-full uppercase tracking-widest ${loading ? 'loading' : ''}`}>
        {!loading && <><CreditCard size={16}/> Payer maintenant</>}
      </button>
    </form>
  );
}

export default function Checkout() {
  const { cart, fetchCart }        = useCart();
  const { user }                   = useAuth();
  const navigate                   = useNavigate();
  const [address,       setAddress]      = useState('');
  const [phone,         setPhone]        = useState(user?.phone || '');
  const [method,        setMethod]       = useState('cash');
  const [step,          setStep]         = useState(1);
  const [loading,       setLoading]      = useState(false);
  const [error,         setError]        = useState('');
  const [stripePromise, setStripePromise]= useState(null);
  const [clientSecret,  setClientSecret] = useState('');
  const [order,         setOrder]        = useState(null);

  const PAYMENT_METHODS = [
    { key:'cash',   label:'Espèces à la livraison', icon:Banknote,    desc:'Payez en cash à la réception' },
    { key:'card',   label:'Carte bancaire',          icon:CreditCard,  desc:'Visa, Mastercard via Stripe' },
    { key:'mobile', label:'Mobile Money',            icon:Smartphone,  desc:'Orange Money, Moov, Wave — via CinetPay' },
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
          payment_method: 'cash',
        });
        setOrder(res.data);
        await fetchCart();
        setStep(3);
      } catch {
        setError('Erreur lors de la commande.');
      } finally {
        setLoading(false);
      }

    } else if (method === 'card') {
      setLoading(true);
      try {
        const res = await api.post('/payment/intent/', { address });
        setClientSecret(res.data.client_secret);
        const stripe = await loadStripe(res.data.publishable_key);
        setStripePromise(Promise.resolve(stripe));
        setStep(2);
      } catch {
        setError('Erreur lors de la création du paiement.');
      } finally {
        setLoading(false);
      }

    } else if (method === 'mobile') {
      setLoading(true);
      try {
        const res = await api.post('/payment/cinetpay/', { address, phone });
        window.location.href = res.data.payment_url;
      } catch {
        setError('Erreur lors de la connexion à CinetPay.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStripeSuccess = async (paymentMethod) => {
    try {
      const res = await api.post('/payment/cash/', {
        address,
        phone,
        payment_method: paymentMethod,
      });
      setOrder(res.data);
      await fetchCart();
      setStep(3);
    } catch {
      setError('Erreur lors de la finalisation.');
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

        {/* ÉTAPE 2 — STRIPE */}
        {step === 2 && stripePromise && (
          <div className="max-w-md mx-auto">
            <button onClick={() => setStep(1)} className="btn btn-ghost btn-sm mb-6 gap-2">
              <ArrowLeft size={14}/> Retour
            </button>
            <p className="text-xs uppercase tracking-[0.3em] opacity-40 mb-2">Étape 2</p>
            <h1 className="font-display text-3xl font-light mb-6">Paiement sécurisé</h1>
            <div className="bg-base-200 p-4 mb-6 flex justify-between text-sm">
              <span className="opacity-60">Total à payer</span>
              <span className="font-semibold">{cart.total} FCFA</span>
            </div>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripeForm clientSecret={clientSecret} onSuccess={handleStripeSuccess}/>
            </Elements>
            {error && <div className="alert alert-error text-sm mt-4"><span>{error}</span></div>}
          </div>
        )}

        {/* ÉTAPE 3 — SUCCÈS */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
            <CheckCircle size={72} className="text-success"/>
            <div>
              <h2 className="font-display text-4xl font-light mb-2">Commande confirmée !</h2>
              <p className="opacity-50 text-sm">
                Commande #{order?.id} —{' '}
                {order?.payment_method === 'cash'
                  ? 'Paiement en espèces à la livraison'
                  : 'Paiement par carte'}
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