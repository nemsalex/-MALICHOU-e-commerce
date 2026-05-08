import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import { ProductCardSkeleton } from '../components/Skeleton';
import api from '../api';
import {
  ShoppingBag, Star, ArrowRight,
  SlidersHorizontal, Search, Heart, Sparkles
} from 'lucide-react';
import logo from '../assets/logo.png';

const CATEGORY_EMOJI = {
 'strings-tangas':         '🩲',
  'soutiens-gorge':        '👙',
  'nuisettes-deshabilles': '🔥',
  'ensemble':              '🩱',
};

const CATEGORY_DESC = {
  'strings-tangas':        'Légèreté & sensualité',
  'soutiens-gorge':        'Maintien & élégance',
  'ensemble':             'Coordonnés & raffinés',
  'nuisettes-deshabilles': 'Douceur & séduction',
};

const parseArray = (val) => {
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val || '[]'); } catch { return []; }
};

export default function Home() {
  const [products,   setProducts]   = useState([]);
  const [featured,   setFeatured]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter,     setFilter]     = useState('');
  const [search,     setSearch]     = useState('');
  const [favorites,  setFavorites]  = useState([]);
  const [toast,      setToast]      = useState('');
  const [loading,    setLoading]    = useState(true);
  const { user }                    = useAuth();
  const { addToCart }               = useCart();
  const navigate                    = useNavigate();

  useEffect(() => {
    api.get('/categories/').then(r => setCategories(r.data));
    api.get('/products/featured/').then(r => setFeatured(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filter) params.category = filter;
    if (search) params.search   = search;
    api.get('/products/', { params })
      .then(r => setProducts(r.data))
      .finally(() => setLoading(false));
  }, [filter, search]);

  const handleAdd = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    await addToCart(product.id, parseArray(product.sizes)[0]);
    setToast(`${product.name} ajouté !`);
    setTimeout(() => setToast(''), 2500);
  };

  const toggleFav = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);
  };

  const ProductCard = ({ p, index = 0 }) => {
    const sizes     = parseArray(p.sizes);
    const colors    = parseArray(p.colors);
    const materials = parseArray(p.materials);

    return (
      <Link
        to={`/products/${p.slug}`}
        className={`card bg-base-100 border border-base-200 card-hover group block animate-fade-in-up delay-${Math.min(index * 100, 500)}`}>
        <figure className="relative bg-base-200 h-72 flex items-center justify-center overflow-hidden">
          {p.image ? (
            <img src={p.image} alt={p.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
          ) : (
            <span className="text-7xl opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500">
              {CATEGORY_EMOJI[p.category?.slug] || '👙'}
            </span>
          )}
          {p.tag && (
            <div className="absolute top-3 left-3">
              <span className="badge badge-primary badge-sm uppercase tracking-wider">{p.tag}</span>
            </div>
          )}
          <button onClick={(e) => toggleFav(e, p.id)}
            className="absolute top-3 right-3 btn btn-circle btn-xs btn-ghost bg-base-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Heart size={12}
              fill={favorites.includes(p.id) ? 'currentColor' : 'none'}
              className={favorites.includes(p.id) ? 'text-error' : ''}/>
          </button>
          {colors.length > 0 && (
            <div className="absolute bottom-3 left-3 flex gap-1 flex-wrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {colors.slice(0, 4).map(c => (
                <span key={c} className="badge badge-xs bg-base-100 border-base-300 text-xs">{c}</span>
              ))}
            </div>
          )}
        </figure>
        <div className="card-body p-5">
          <p className="text-xs uppercase tracking-widest opacity-40">{p.category?.name}</p>
          <h3 className="font-display text-lg font-semibold leading-tight group-hover:text-primary transition-colors duration-300">
            {p.name}
          </h3>
          {materials.length > 0 && (
            <p className="text-xs opacity-40">{materials.join(' · ')}</p>
          )}
          <div className="flex items-center gap-1 my-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} fill="currentColor" className="text-warning"/>
            ))}
          </div>
          <div className="flex gap-1 flex-wrap mt-1">
            {sizes.slice(0, 4).map(s => (
              <span key={s} className="badge badge-outline badge-xs">{s}</span>
            ))}
            {sizes.length > 4 && (
              <span className="badge badge-outline badge-xs">+{sizes.length - 4}</span>
            )}
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="text-lg font-medium">{p.price} FCFA</span>
              {p.old_price && (
                <span className="text-xs opacity-40 line-through ml-2">{p.old_price} FCFA</span>
              )}
            </div>
            <button onClick={(e) => handleAdd(e, p)}
              className="btn btn-primary btn-sm btn-circle">
              <ShoppingBag size={14}/>
            </button>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar/>

      {/* HERO */}
      <section className="hero-gradient text-white py-28 px-6 lg:px-20 overflow-hidden">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase opacity-60 mb-4 animate-fade-in-up">
              Collection 2026
            </p>
            <h1 className="font-display text-5xl lg:text-7xl font-light leading-tight mb-6 animate-fade-in-up delay-100">
              Lingerie<br/><span className="italic" style={{color:'#c9956c'}}>d'Exception</span>
            </h1>
            <p className="opacity-70 text-sm leading-relaxed mb-8 max-w-md animate-fade-in-up delay-200">
              Des pièces sensuelles et raffinées, alliant confort et élégance.
              Découvrez la collection MALICHOU — lingerie haut de gamme.
            </p>
            <div className="flex gap-4 flex-wrap animate-fade-in-up delay-300">
              <button
                onClick={() => document.getElementById('catalogue')?.scrollIntoView({ behavior:'smooth' })}
                className="btn btn-primary btn-sm uppercase tracking-widest px-8">
                Découvrir <ArrowRight size={14}/>
              </button>
              <Link to="/contact"
                className="btn btn-ghost btn-sm uppercase tracking-widest text-white border-white/30 hover:bg-white/10">
                Nous contacter
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center animate-fade-in delay-400">
            <div className="w-80 h-96 rounded overflow-hidden animate-float shadow-2xl shadow-primary/20">
              <img src={logo} alt="MALICHOU" className="w-full h-full object-cover"/>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-base-200 py-10 border-y border-base-300">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center">
          {[
            ['100%',      'Qualité Premium'],
            ['Livraison', 'Discrète & Rapide'],
            ['30j',       'Retours Gratuits'],
          ].map(([v, l], i) => (
            <div key={l} className={`animate-fade-in-up delay-${i * 100}`}>
              <p className="font-display text-3xl font-semibold" style={{color:'#c9956c'}}>{v}</p>
              <p className="text-xs uppercase tracking-widest opacity-50 mt-1">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATÉGORIES */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <p className="text-xs uppercase tracking-[0.3em] opacity-40 mb-2 text-center animate-fade-in">
          Explorer par
        </p>
        <h2 className="font-display text-4xl font-light text-center mb-10 animate-fade-in-up">
          Catégories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((c, i) => (
            <button key={c.id}
              onClick={() => {
                setFilter(c.slug);
                document.getElementById('catalogue')?.scrollIntoView({ behavior:'smooth' });
              }}
              className={`group card bg-base-200 hover:bg-base-300 transition-all p-6 text-center cursor-pointer border border-base-300 hover:border-primary animate-fade-in-up delay-${i * 100}`}>
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {CATEGORY_EMOJI[c.slug] || '✨'}
              </div>
              <p className="text-sm font-medium leading-tight mb-1">{c.name}</p>
              <p className="text-xs opacity-40 group-hover:opacity-70 transition-opacity italic">
                {CATEGORY_DESC[c.slug] || ''}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* NOUVEAUTÉS */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-10 border-t border-base-200">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles size={18} style={{color:'#c9956c'}}/>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] opacity-40">Sélection MALICHOU</p>
              <h2 className="font-display text-3xl font-light">Nouveautés</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((p, i) => <ProductCard key={p.id} p={p} index={i}/>)}
          </div>
        </section>
      )}

      {/* CATALOGUE */}
      <section id="catalogue" className="max-w-6xl mx-auto px-6 py-14">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] opacity-40 mb-2">Notre Sélection</p>
            <h2 className="font-display text-4xl font-light">Catalogue</h2>
          </div>
          <label className="flex items-center gap-2 border border-base-300 px-4 py-2 w-full lg:w-72 focus-within:border-primary transition-colors">
            <Search size={14} className="opacity-40"/>
            <input type="text" placeholder="Rechercher..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm grow"/>
          </label>
        </div>

        {/* FILTRES */}
        <div className="flex gap-2 mb-10 flex-wrap items-center">
          <SlidersHorizontal size={14} className="opacity-40"/>
          <button onClick={() => setFilter('')}
            className={`btn btn-xs uppercase tracking-widest transition-all ${
              filter === '' ? 'btn-primary' : 'btn-ghost border border-base-300 hover:border-primary'
            }`}>
            Tout
          </button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setFilter(c.slug)}
              className={`btn btn-xs uppercase tracking-widest transition-all ${
                filter === c.slug ? 'btn-primary' : 'btn-ghost border border-base-300 hover:border-primary'
              }`}>
              {c.name}
            </button>
          ))}
        </div>

        {/* GRILLE */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <ProductCardSkeleton key={i}/>)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 opacity-30 animate-fade-in">
            <ShoppingBag size={48} className="mx-auto mb-4"/>
            <p>Aucun produit trouvé.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((p, i) => <ProductCard key={p.id} p={p} index={i}/>)}
          </div>
        )}
      </section>

      {/* BANNIÈRE PROMO */}
      <section className="hero-gradient text-white py-16 px-6 text-center my-10">
        <p className="text-xs tracking-[0.3em] uppercase opacity-60 mb-3">Offre exclusive</p>
        <h2 className="font-display text-4xl font-light mb-4">
          Livraison gratuite<br/>
          <span className="italic" style={{color:'#c9956c'}}>sur toutes vos commandes</span>
        </h2>
        <Link to="/collection" className="btn btn-primary btn-sm uppercase tracking-widest px-8 mt-2">
          En profiter <ArrowRight size={14}/>
        </Link>
      </section>

      {/* TOAST */}
      {toast && (
        <div className="toast toast-bottom toast-end z-50">
          <div className="alert alert-success shadow-lg animate-fade-in">
            <ShoppingBag size={16}/>
            <span className="text-sm">{toast}</span>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-base-200 text-base-content border-t border-base-300">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="font-display text-2xl tracking-widest mb-3">MALICHOU</p>
            <p className="text-xs opacity-40 leading-relaxed">
              Lingerie d'exception pour sublimer votre séduction.
              Qualité premium, livraison discrète.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest opacity-40 mb-4">Navigation</p>
            <ul className="space-y-2 text-sm opacity-60">
              <li><Link to="/"           className="hover:opacity-100 transition-opacity">Accueil</Link></li>
              <li><Link to="/collection" className="hover:opacity-100 transition-opacity">Collection</Link></li>
              <li><Link to="/contact"    className="hover:opacity-100 transition-opacity">Contact</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest opacity-40 mb-4">Informations</p>
            <ul className="space-y-2 text-sm opacity-60">
              <li>Livraison discrète & rapide</li>
              <li>Retours gratuits 30 jours</li>
              <li>Paiement 100% sécurisé</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-base-300 py-4 text-center">
          <p className="text-xs opacity-30">© 2026 MALICHOU — Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}