import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import api from '../api';
import {
  ShoppingBag, Star, Heart, Search,
  SlidersHorizontal, ChevronDown, ChevronUp,
  X, ArrowUpDown
} from 'lucide-react';
import logo from '../assets/logo.png';

const parseArray = (val) => {
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val || '[]'); } catch { return []; }
};

const CATEGORY_EMOJI = {
  'strings-tangas':      '🩲',
  'soutiens-gorge':        '👙',
  'nuisettes-deshabilles': '🔥',
  'ensembles':             '🩱'
};

const COLORS = ['Noir', 'Blanc', 'Rouge', 'Rose', 'Beige', 'Bordeaux'];
const SIZES_BOTTOM = ['XS', 'S', 'M', 'L', 'XL'];
const SIZES_TOP    = ['85B', '85C', '90B', '90C', '95B', '95C'];

export default function Collection() {
  const [products,    setProducts]   = useState([]);
  const [categories,  setCategories] = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [favorites,   setFavorites]  = useState([]);
  const [toast,       setToast]      = useState('');
  const { user }                     = useAuth();
  const { addToCart }                = useCart();
  const navigate                     = useNavigate();

  // FILTRES
  const [selCategories, setSelCategories] = useState([]);
  const [selSizes,      setSelSizes]      = useState([]);
  const [selColors,     setSelColors]     = useState([]);
  const [priceRange,    setPriceRange]    = useState([0, 100000]);
  const [search,        setSearch]        = useState('');
  const [sortBy,        setSortBy]        = useState('default');
  const [showFilters,   setShowFilters]   = useState(true);

  // SECTIONS SIDEBAR OUVERTES
  const [openSections, setOpenSections] = useState({
    categories: true,
    sizes:      true,
    colors:     true,
    price:      true,
  });

  useEffect(() => {
    api.get('/categories/').then(r => setCategories(r.data));
    api.get('/products/')
      .then(r => setProducts(r.data))
      .finally(() => setLoading(false));
  }, []);

  const toggleSection = (key) =>
    setOpenSections(s => ({ ...s, [key]: !s[key] }));

  const toggleFilter = (arr, setArr, val) =>
    setArr(a => a.includes(val) ? a.filter(x => x !== val) : [...a, val]);

  const toggleFav = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);
  };

  const handleAdd = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    await addToCart(product.id, parseArray(product.sizes)[0]);
    setToast(`${product.name} ajouté !`);
    setTimeout(() => setToast(''), 2500);
  };

  // FILTRAGE + TRI
  const filtered = useMemo(() => {
    let result = [...products];

    if (search) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selCategories.length > 0) {
      result = result.filter(p =>
        selCategories.includes(p.category?.slug)
      );
    }

    if (selSizes.length > 0) {
      result = result.filter(p =>
        parseArray(p.sizes).some(s => selSizes.includes(s))
      );
    }

    if (selColors.length > 0) {
      result = result.filter(p =>
        parseArray(p.colors).some(c => selColors.includes(c))
      );
    }

    result = result.filter(p =>
      p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    switch (sortBy) {
      case 'price_asc':  result.sort((a, b) => a.price - b.price); break;
      case 'price_desc': result.sort((a, b) => b.price - a.price); break;
      case 'newest':     result.sort((a, b) => b.id - a.id); break;
      default: break;
    }

    return result;
  }, [products, search, selCategories, selSizes, selColors, priceRange, sortBy]);

  const activeFiltersCount =
    selCategories.length + selSizes.length + selColors.length +
    (priceRange[0] > 0 || priceRange[1] < 100000 ? 1 : 0);

  const resetFilters = () => {
    setSelCategories([]);
    setSelSizes([]);
    setSelColors([]);
    setPriceRange([0, 100000]);
    setSearch('');
    setSortBy('default');
  };

  const SidebarSection = ({ title, sectionKey, children }) => (
    <div className="border-b border-base-200 pb-4 mb-4">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full mb-3">
        <p className="text-xs uppercase tracking-widest opacity-60 font-medium">{title}</p>
        {openSections[sectionKey]
          ? <ChevronUp size={14} className="opacity-40"/>
          : <ChevronDown size={14} className="opacity-40"/>
        }
      </button>
      {openSections[sectionKey] && children}
    </div>
  );

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar/>

      {/* HEADER */}
      <section className="hero-gradient text-white py-12 px-6 text-center">
        <p className="text-xs tracking-[0.3em] uppercase opacity-60 mb-2">Toute la sélection</p>
        <h1 className="font-display text-4xl lg:text-5xl font-light">Collection</h1>
        <p className="opacity-50 text-sm mt-3">{filtered.length} produit(s)</p>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* BARRE RECHERCHE + TRI */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between">
          <label className="flex items-center gap-2 border border-base-300 px-4 py-2 w-full sm:w-80">
            <Search size={14} className="opacity-40"/>
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm grow"
            />
            {search && (
              <button onClick={() => setSearch('')}>
                <X size={14} className="opacity-40"/>
              </button>
            )}
          </label>

          <div className="flex items-center gap-3">
            {activeFiltersCount > 0 && (
              <button onClick={resetFilters}
                className="btn btn-ghost btn-xs gap-1 text-error">
                <X size={12}/> Réinitialiser ({activeFiltersCount})
              </button>
            )}
            <button
              onClick={() => setShowFilters(f => !f)}
              className="btn btn-ghost btn-sm gap-2 lg:hidden">
              <SlidersHorizontal size={14}/>
              Filtres {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
            <div className="flex items-center gap-2">
              <ArrowUpDown size={14} className="opacity-40"/>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="select select-bordered select-sm text-sm">
                <option value="default">Trier par</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="newest">Nouveautés</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-8">

          {/* SIDEBAR FILTRES */}
          <aside className={`w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs uppercase tracking-widest opacity-40 flex items-center gap-2">
                  <SlidersHorizontal size={12}/> Filtres
                </p>
                {activeFiltersCount > 0 && (
                  <button onClick={resetFilters} className="text-xs text-error opacity-70 hover:opacity-100">
                    Tout effacer
                  </button>
                )}
              </div>

              {/* CATÉGORIES */}
              <SidebarSection title="Catégorie" sectionKey="categories">
                <div className="space-y-2">
                  {categories.map(c => (
                    <label key={c.id} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs checkbox-primary"
                        checked={selCategories.includes(c.slug)}
                        onChange={() => toggleFilter(selCategories, setSelCategories, c.slug)}
                      />
                      <span className="text-sm opacity-70 group-hover:opacity-100">
                        {CATEGORY_EMOJI[c.slug]} {c.name}
                      </span>
                    </label>
                  ))}
                </div>
              </SidebarSection>

              {/* TAILLES */}
              <SidebarSection title="Taille" sectionKey="sizes">
                <div className="mb-2">
                  <p className="text-xs opacity-30 mb-2">Bas</p>
                  <div className="flex gap-1 flex-wrap">
                    {SIZES_BOTTOM.map(s => (
                      <button key={s} onClick={() => toggleFilter(selSizes, setSelSizes, s)}
                        className={`btn btn-xs ${selSizes.includes(s) ? 'btn-primary' : 'btn-ghost border border-base-300'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs opacity-30 mb-2">Haut</p>
                  <div className="flex gap-1 flex-wrap">
                    {SIZES_TOP.map(s => (
                      <button key={s} onClick={() => toggleFilter(selSizes, setSelSizes, s)}
                        className={`btn btn-xs ${selSizes.includes(s) ? 'btn-primary' : 'btn-ghost border border-base-300'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </SidebarSection>

              {/* COULEURS */}
              <SidebarSection title="Couleur" sectionKey="colors">
                <div className="space-y-2">
                  {COLORS.map(c => (
                    <label key={c} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs checkbox-primary"
                        checked={selColors.includes(c)}
                        onChange={() => toggleFilter(selColors, setSelColors, c)}
                      />
                      <span className="text-sm opacity-70 group-hover:opacity-100">{c}</span>
                    </label>
                  ))}
                </div>
              </SidebarSection>

              {/* PRIX */}
              <SidebarSection title="Prix (FCFA)" sectionKey="price">
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={priceRange[1]}
                    onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="range range-primary range-xs w-full"
                  />
                  <div className="flex justify-between text-xs opacity-50">
                    <span>{priceRange[0].toLocaleString()} FCFA</span>
                    <span>{priceRange[1].toLocaleString()} FCFA</span>
                  </div>
                </div>
              </SidebarSection>
            </div>
          </aside>

          {/* GRILLE PRODUITS */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <span className="loading loading-spinner loading-lg opacity-30"/>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-32 opacity-30">
                <ShoppingBag size={48} className="mx-auto mb-4"/>
                <p>Aucun produit trouvé.</p>
                <button onClick={resetFilters} className="btn btn-ghost btn-sm mt-4">
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map(p => {
                  const sizes     = parseArray(p.sizes);
                  const colors    = parseArray(p.colors);
                  const materials = parseArray(p.materials);

                  return (
                    <Link key={p.id} to={`/products/${p.slug}`}
                      className="card bg-base-100 border border-base-200 card-hover group block">
                      <figure className="relative bg-base-200 h-64 flex items-center justify-center overflow-hidden">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover"/>
                        ) : (
                          <span className="text-6xl opacity-20 group-hover:opacity-30 transition-opacity">
                            {CATEGORY_EMOJI[p.category?.slug] || '👙'}
                          </span>
                        )}
                        {p.tag && (
                          <div className="absolute top-3 left-3">
                            <span className="badge badge-primary badge-sm uppercase tracking-wider">{p.tag}</span>
                          </div>
                        )}
                        <button onClick={(e) => toggleFav(e, p.id)}
                          className="absolute top-3 right-3 btn btn-circle btn-xs btn-ghost bg-base-100">
                          <Heart size={12}
                            fill={favorites.includes(p.id) ? 'currentColor' : 'none'}
                            className={favorites.includes(p.id) ? 'text-error' : ''}/>
                        </button>
                        {colors.length > 0 && (
                          <div className="absolute bottom-3 left-3 flex gap-1 flex-wrap">
                            {colors.slice(0, 3).map(c => (
                              <span key={c} className="badge badge-xs bg-base-100 border-base-300 text-xs">{c}</span>
                            ))}
                          </div>
                        )}
                      </figure>
                      <div className="card-body p-4">
                        <p className="text-xs uppercase tracking-widest opacity-40">{p.category?.name}</p>
                        <h3 className="font-display text-base font-semibold leading-tight">{p.name}</h3>
                        {materials.length > 0 && (
                          <p className="text-xs opacity-30">{materials.join(' · ')}</p>
                        )}
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {sizes.slice(0, 4).map(s => (
                            <span key={s} className="badge badge-outline badge-xs">{s}</span>
                          ))}
                          {sizes.length > 4 && (
                            <span className="badge badge-outline badge-xs">+{sizes.length - 4}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div>
                            <span className="font-medium">{p.price} FCFA</span>
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
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="toast toast-bottom toast-end z-50">
          <div className="alert alert-success shadow-lg">
            <ShoppingBag size={16}/>
            <span className="text-sm">{toast}</span>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="footer footer-center bg-base-200 text-base-content p-8 mt-16 border-t border-base-300">
        <img src={logo} alt="MALICHOU" className="h-16 w-auto opacity-80"/>
        <p className="text-xs opacity-30">© 2026 MALICHOU — Tous droits réservés</p>
      </footer>
    </div>
  );
}