import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../api';
import { Package, Clock, CheckCircle, Truck, ShoppingBag } from 'lucide-react';

const STATUS_CONFIG = {
  pending:   { label:'En attente',  icon: Clock,         color:'badge-warning' },
  confirmed: { label:'Confirmée',   icon: CheckCircle,   color:'badge-info' },
  shipped:   { label:'Expédiée',    icon: Truck,         color:'badge-primary' },
  delivered: { label:'Livrée',      icon: CheckCircle,   color:'badge-success' },
  cancelled: { label:'Annulée',     icon: Package,       color:'badge-error' },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const { user }            = useAuth();

  useEffect(() => {
    if (user) api.get('/orders/').then(r => setOrders(r.data));
  }, [user]);

  if (!user) return (
    <div className="min-h-screen bg-base-100">
      <Navbar/>
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Package size={48} className="opacity-20"/>
        <p className="opacity-50">Connectez-vous pour voir vos commandes.</p>
        <Link to="/login" className="btn btn-primary btn-sm uppercase tracking-widest">Se connecter</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar/>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] opacity-40 mb-2">Historique</p>
          <h1 className="font-display text-4xl font-light">Mes Commandes</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="mx-auto opacity-20 mb-4"/>
            <p className="opacity-40 mb-6">Vous n'avez pas encore de commandes.</p>
            <Link to="/" className="btn btn-primary btn-sm uppercase tracking-widest">Découvrir la collection</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const Icon = cfg.icon;
              return (
                <div key={order.id} className="card bg-base-100 border border-base-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-base-200 rounded-full flex items-center justify-center">
                        <Icon size={16} className="opacity-60"/>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Commande #{order.id}</p>
                        <p className="text-xs opacity-40">{new Date(order.created_at).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })}</p>
                      </div>
                    </div>
                    <span className={`badge ${cfg.color} badge-sm uppercase tracking-wider`}>{cfg.label}</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="opacity-60">{item.quantity}× {item.product.name} <span className="opacity-40">({item.size})</span></span>
                        <span>{item.subtotal} FCFA</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-base-200">
                    <span className="text-xs opacity-40 uppercase tracking-wider">Total</span>
                    <span className="font-semibold">{order.total} FCFA</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}