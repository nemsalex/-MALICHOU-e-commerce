import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';

export default function Cart() {
  const { cart, removeItem, updateQty } = useCart();
  const { user }   = useAuth();
  const navigate   = useNavigate();

  if (!user) return (
    <div className="min-h-screen bg-base-100">
      <Navbar/>
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <ShoppingBag size={48} className="opacity-20"/>
        <p className="opacity-50">Connectez-vous pour voir votre panier.</p>
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
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] opacity-40 mb-2">Mon</p>
          <h1 className="font-display text-4xl font-light">Panier</h1>
          <p className="opacity-40 text-sm mt-1">{cart.items.length} article(s)</p>
        </div>

        {cart.items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="mx-auto opacity-20 mb-4"/>
            <p className="opacity-40 mb-6">Votre panier est vide.</p>
            <Link to="/" className="btn btn-primary btn-sm uppercase tracking-widest">
              Découvrir la collection
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* ARTICLES */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map(item => (
                <div key={item.id} className="card bg-base-100 border border-base-200 p-5">
                  <div className="flex gap-4 items-center">
                    {/* IMAGE */}
                    <div className="w-20 h-20 bg-base-200 rounded flex-shrink-0 overflow-hidden">
                      {item.product.image ? (
                        <img
                          src={
                            item.product.image.startsWith('http')
                              ? item.product.image
                              : `http://127.0.0.1:8000${item.product.image}`
                          }
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">
                          👙
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <Link to={`/products/${item.product.slug}`}
                        className="font-display text-lg font-medium hover:opacity-70 transition-opacity">
                        {item.product.name}
                      </Link>
                      <p className="text-xs opacity-40 uppercase tracking-wider mt-1">
                        Taille: {item.size}
                      </p>
                      <p className="text-sm font-medium mt-1">{item.product.price} FCFA</p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <button onClick={() => removeItem(item.id)}
                        className="btn btn-ghost btn-xs text-error">
                        <Trash2 size={14}/>
                      </button>
                      <div className="join">
                        <button onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="btn btn-xs join-item">
                          <Minus size={10}/>
                        </button>
                        <span className="btn btn-xs join-item no-animation font-normal">
                          {item.quantity}
                        </span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="btn btn-xs join-item">
                          <Plus size={10}/>
                        </button>
                      </div>
                      <p className="text-sm font-semibold">{item.subtotal} FCFA</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RÉSUMÉ */}
            <div className="lg:col-span-1">
              <div className="card bg-base-200 p-6 sticky top-24">
                <h3 className="font-display text-xl mb-4">Récapitulatif</h3>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="opacity-60">Sous-total</span>
                    <span>{cart.total} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Livraison</span>
                    <span className="text-success">Gratuite</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Retours</span>
                    <span>30 jours</span>
                  </div>
                </div>
                <div className="divider my-2"/>
                <div className="flex justify-between font-semibold text-lg mb-6">
                  <span>Total</span>
                  <span>{cart.total} FCFA</span>
                </div>
                <Link to="/checkout"
                  className="btn btn-primary w-full uppercase tracking-widest">
                  Passer la commande →
                </Link>
              </div>
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