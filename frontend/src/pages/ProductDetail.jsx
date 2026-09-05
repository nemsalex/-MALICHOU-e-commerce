import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import api from '../api';
import {
  ShoppingBag, Star, Heart,
  Package, Shield, Truck, RotateCcw,
  Send, User
} from 'lucide-react';

const BACKEND_URL = 'http://127.0.0.1:8000';

const parseArray = (val) => {
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val || '[]'); } catch { return []; }
};

const CATEGORY_EMOJI = {
  'nuisettes': '🔥',
  'strings':   '🩲',
  'ensembles': '🩱',
};

export default function ProductDetail() {
  const { slug }                   = useParams();
  const [product,    setProduct]   = useState(null);
  const [loading,    setLoading]   = useState(true);
  const [error,      setError]     = useState(false);
  const [selSize,    setSelSize]   = useState('');
  const [selColor,   setSelColor]  = useState('');
  const [favorite,   setFavorite]  = useState(false);
  const [toast,      setToast]     = useState('');
  const [tab,        setTab]       = useState('description');
  const [review,     setReview]    = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting]= useState(false);
  const [reviewErr,  setReviewErr] = useState('');
  const { user }                   = useAuth();
  const { addToCart }              = useCart();
  const navigate                   = useNavigate();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(false);
    api.get(`/products/${slug}/`)
      .then(r => {
        setProduct(r.data);
        const sizes  = parseArray(r.data.sizes);
        const colors = parseArray(r.data.colors);
        if (sizes.length)  setSelSize(sizes[0]);
        if (colors.length) setSelColor(colors[0]);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAdd = async () => {
    if (!user)    { navigate('/login'); return; }
    if (!selSize) {
      setToast('Choisissez une taille !');
      setTimeout(() => setToast(''), 2000);
      return;
    }
    await addToCart(product.id, selSize);
    setToast('Ajouté au panier !');
    setTimeout(() => setToast(''), 2500);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setSubmitting(true);
    setReviewErr('');
    try {
      const res = await api.post(`/products/${slug}/reviews/`, review);
      setProduct(p => ({
        ...p,
        reviews:      [...(p.reviews || []), res.data],
        review_count: (p.review_count || 0) + 1,
        avg_rating:   (((p.avg_rating || 0) * (p.review_count || 0)) + review.rating) / ((p.review_count || 0) + 1),
      }));
      setReview({ rating: 5, comment: '' });
      setToast('Avis publié !');
      setTimeout(() => setToast(''), 2500);
    } catch (err) {
      setReviewErr(err.response?.data?.error || 'Erreur lors de la publication.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-base-100">
      <Navbar/>
      <div className="flex items-center justify-center py-32">
        <span className="loading loading-spinner loading-lg opacity-30"/>
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen bg-base-100">
      <Navbar/>
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="opacity-50 text-sm">Produit introuvable.</p>
        <Link to="/" className="btn btn-primary btn-sm uppercase tracking-widest">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );

  const sizes     = parseArray(product.sizes);
  const colors    = parseArray(product.colors);
  const materials = parseArray(product.materials);
  const reviews   = product.reviews || [];

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar/>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-xs opacity-40 uppercase tracking-widest mb-8">
          <Link to="/" className="hover:opacity-70">Accueil</Link>
          <span>/</span>
          <span>{product.category?.name}</span>
          <span>/</span>
          <span className="opacity-70">{product.name}</span>
        </div>

        {/* PRODUIT */}
        <div className="grid lg:grid-cols-2 gap-14 mb-16">

          {/* IMAGE */}
          <div className="relative">
            <div className="bg-base-200 h-[500px] flex items-center justify-center rounded overflow-hidden">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-9xl opacity-20">
                  {CATEGORY_EMOJI[product.category?.slug] || '👙'}
                </span>
              )}
            </div>
            {product.tag && (
              <div className="absolute top-4 left-4">
                <span className="badge badge-primary uppercase tracking-wider">{product.tag}</span>
              </div>
            )}
            <button
              onClick={() => setFavorite(f => !f)}
              className="absolute top-4 right-4 btn btn-circle btn-sm bg-base-100 border-base-200">
              <Heart size={16} fill={favorite ? 'currentColor' : 'none'}
                className={favorite ? 'text-error' : ''}/>
            </button>
          </div>

          {/* INFOS */}
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] opacity-40 mb-2">
                {product.category?.name}
              </p>
              <h1 className="font-display text-4xl font-light leading-tight mb-3">
                {product.name}
              </h1>

              {/* RATING */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={14}
                      fill={i <= Math.round(product.avg_rating || 0) ? 'currentColor' : 'none'}
                      className="text-warning"/>
                  ))}
                </div>
                <span className="text-sm opacity-50">
                  {product.avg_rating || 0} ({product.review_count || 0} avis)
                </span>
              </div>

              {/* PRIX */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-medium">{product.price} FCFA</span>
                {product.old_price && (
                  <>
                    <span className="text-lg opacity-40 line-through">{product.old_price} FCFA</span>
                    <span className="badge badge-error badge-sm">
                      -{Math.round((1 - product.price / product.old_price) * 100)}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* MATIÈRES */}
            {materials.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest opacity-40 mb-2">Matières</p>
                <div className="flex gap-2 flex-wrap">
                  {materials.map(m => (
                    <span key={m} className="badge badge-outline">{m}</span>
                  ))}
                </div>
              </div>
            )}

            {/* COULEURS */}
            {colors.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest opacity-40 mb-2">
                  Couleur — <span className="normal-case opacity-70">{selColor}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {colors.map(c => (
                    <button key={c} onClick={() => setSelColor(c)}
                      className={`btn btn-sm ${selColor === c ? 'btn-primary' : 'btn-ghost border border-base-300'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAILLES */}
            {sizes.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest opacity-40 mb-2">
                  Taille — <span className="normal-case opacity-70">{selSize || 'Choisir'}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {sizes.map(s => (
                    <button key={s} onClick={() => setSelSize(s)}
                      className={`btn btn-sm ${selSize === s ? 'btn-primary' : 'btn-ghost border border-base-300'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STOCK */}
            <div className="flex items-center gap-2">
              <Package size={14} className={product.stock > 0 ? 'text-success' : 'text-error'}/>
              <span className="text-sm opacity-60">
                {product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock'}
              </span>
            </div>

            {/* BOUTONS */}
            <div className="flex gap-3 mt-2">
              <button onClick={handleAdd} disabled={product.stock === 0}
                className="btn btn-primary flex-1 uppercase tracking-widest">
                <ShoppingBag size={16}/> Ajouter au panier
              </button>
              <button onClick={() => setFavorite(f => !f)}
                className="btn btn-ghost border border-base-300 btn-square">
                <Heart size={16} fill={favorite ? 'currentColor' : 'none'}
                  className={favorite ? 'text-error' : ''}/>
              </button>
            </div>

            {/* GARANTIES */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-base-200">
              {[
                { icon: Truck,     label: 'Livraison', sub: 'Discrète' },
                { icon: RotateCcw, label: 'Retours',   sub: '30 jours' },
                { icon: Shield,    label: 'Paiement',  sub: 'Sécurisé' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="text-center">
                  <Icon size={18} className="mx-auto opacity-40 mb-1"/>
                  <p className="text-xs font-medium">{label}</p>
                  <p className="text-xs opacity-40">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="border-t border-base-200 pt-10">
          <div className="flex gap-0 mb-8 border-b border-base-200">
            {[
              { key: 'description', label: 'Description' },
              { key: 'reviews',     label: `Avis (${reviews.length})` },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-6 py-3 text-sm uppercase tracking-widest border-b-2 transition-all ${
                  tab === t.key
                    ? 'border-primary opacity-100'
                    : 'border-transparent opacity-40 hover:opacity-60'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* DESCRIPTION */}
          {tab === 'description' && (
            <div className="max-w-2xl">
              <p className="text-sm leading-relaxed opacity-70">
                {product.description || 'Aucune description disponible pour ce produit.'}
              </p>
            </div>
          )}

          {/* AVIS */}
          {tab === 'reviews' && (
            <div className="max-w-2xl space-y-8">
              {reviews.length > 0 && (
                <div className="bg-base-200 p-6 flex items-center gap-8">
                  <div className="text-center">
                    <p className="font-display text-5xl font-light">{product.avg_rating}</p>
                    <div className="flex gap-1 justify-center mt-1">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={12}
                          fill={i <= Math.round(product.avg_rating) ? 'currentColor' : 'none'}
                          className="text-warning"/>
                      ))}
                    </div>
                    <p className="text-xs opacity-40 mt-1">{reviews.length} avis</p>
                  </div>
                </div>
              )}

              {reviews.length === 0 ? (
                <p className="opacity-40 text-sm">Aucun avis pour l'instant. Soyez le premier !</p>
              ) : (
                reviews.map(r => (
                  <div key={r.id} className="border-b border-base-200 pb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-base-200 rounded-full flex items-center justify-center">
                          <User size={14} className="opacity-40"/>
                        </div>
                        <span className="text-sm font-medium">{r.username}</span>
                      </div>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} size={11}
                            fill={i <= r.rating ? 'currentColor' : 'none'}
                            className="text-warning"/>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm opacity-60 leading-relaxed">{r.comment}</p>
                    <p className="text-xs opacity-30 mt-2">
                      {new Date(r.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                ))
              )}

              {user ? (
                <div className="bg-base-200 p-6">
                  <h3 className="font-display text-xl mb-4">Laisser un avis</h3>
                  {reviewErr && (
                    <div className="alert alert-error mb-4 text-sm"><span>{reviewErr}</span></div>
                  )}
                  <form onSubmit={handleReview} className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest opacity-40 mb-2">Note</p>
                      <div className="flex gap-2">
                        {[1,2,3,4,5].map(i => (
                          <button key={i} type="button"
                            onClick={() => setReview(r => ({...r, rating: i}))}>
                            <Star size={24}
                              fill={i <= review.rating ? 'currentColor' : 'none'}
                              className={i <= review.rating ? 'text-warning' : 'opacity-30'}/>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Votre avis</p>
                      <textarea
                        className="textarea textarea-bordered w-full h-24 text-sm"
                        placeholder="Partagez votre expérience..."
                        value={review.comment}
                        onChange={e => setReview(r => ({...r, comment: e.target.value}))}
                        required/>
                    </div>
                    <button type="submit"
                      className={`btn btn-primary btn-sm uppercase tracking-widest ${submitting ? 'loading' : ''}`}>
                      {!submitting && <><Send size={13}/> Publier</>}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-base-200 p-6 text-center">
                  <p className="text-sm opacity-50 mb-3">Connectez-vous pour laisser un avis.</p>
                  <Link to="/login" className="btn btn-primary btn-sm uppercase tracking-widest">
                    Se connecter
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="toast toast-bottom toast-end z-50">
          <div className="alert alert-success shadow-lg">
            <span className="text-sm">{toast}</span>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="footer footer-center bg-base-200 text-base-content p-8 mt-10 border-t border-base-300">
        <p className="font-display text-xl tracking-widest">MALICHOU</p>
        <p className="text-xs opacity-30">© 2026 MALICHOU — Tous droits réservés</p>
      </footer>
    </div>
  );
}