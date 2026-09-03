import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import api from '../api';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function CheckoutConfirmation() {
  const { orderId }   = useParams();
  const { fetchCart } = useCart();
  const [order,  setOrder]  = useState(null);
  const [status, setStatus] = useState('checking'); // checking | paid | pending | failed | error

  useEffect(() => {
    let cancelled = false;

    api.post('/payment/paydunya/confirm/', { order_id: orderId })
      .then(res => {
        if (cancelled) return;
        setOrder(res.data);
        fetchCart();
        if (res.data.payment_status === 'paid') setStatus('paid');
        else if (res.data.status === 'cancelled') setStatus('failed');
        else setStatus('pending');
      })
      .catch(() => { if (!cancelled) setStatus('error'); });

    return () => { cancelled = true; };
  }, [orderId, fetchCart]);

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar/>
      <div className="flex flex-col items-center justify-center py-32 gap-6 text-center px-6">
        {status === 'checking' && (
          <>
            <Loader size={56} className="animate-spin opacity-60"/>
            <p className="opacity-60">Vérification de votre paiement…</p>
          </>
        )}

        {status === 'paid' && (
          <>
            <CheckCircle size={72} className="text-success"/>
            <div>
              <h2 className="font-display text-4xl font-light mb-2">Paiement confirmé !</h2>
              <p className="opacity-50 text-sm">Commande #{order?.id} — {order?.total} FCFA</p>
            </div>
            <p className="opacity-40 text-sm max-w-sm">
              Nous avons envoyé une confirmation à votre email.
            </p>
          </>
        )}

        {status === 'pending' && (
          <>
            <Loader size={56} className="opacity-60"/>
            <div>
              <h2 className="font-display text-3xl font-light mb-2">Paiement en attente</h2>
              <p className="opacity-50 text-sm max-w-sm">
                Votre paiement Mobile Money n'est pas encore confirmé (le réseau peut prendre
                quelques minutes). Vous pouvez suivre son statut depuis « Mes commandes ».
              </p>
            </div>
          </>
        )}

        {(status === 'failed' || status === 'error') && (
          <>
            <XCircle size={72} className="text-error"/>
            <div>
              <h2 className="font-display text-3xl font-light mb-2">
                {status === 'failed' ? 'Paiement annulé' : 'Impossible de vérifier le paiement'}
              </h2>
              <p className="opacity-50 text-sm max-w-sm">
                {status === 'failed'
                  ? "Votre paiement n'a pas abouti. Aucun montant n'a été débité."
                  : "Une erreur est survenue pendant la vérification. Contactez-nous si un montant a été débité."}
              </p>
            </div>
          </>
        )}

        <div className="flex gap-3">
          <Link to="/orders" className="btn btn-primary btn-sm uppercase tracking-widest">
            Mes commandes
          </Link>
          <Link to="/" className="btn btn-ghost btn-sm uppercase tracking-widest">
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}
