import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, User, LogOut, Package, Menu, X, UserCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart }         = useCart();
  const navigate         = useNavigate();
  const [open,     setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cartCount = cart.items.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`navbar px-4 lg:px-10 sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'navbar-scrolled border-b border-base-200/30'
        : 'bg-base-100 border-b border-base-200'
    }`}>

      {/* LOGO */}
      <div className="navbar-start">
        <button className="btn btn-ghost lg:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={20}/> : <Menu size={20}/>}
        </button>
        <Link to="/" className="font-display text-2xl font-semibold tracking-widest hover:opacity-80 transition-opacity ml-2">
          MALICHOU
        </Link>
      </div>

      {/* LIENS CENTRE */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal gap-1">
          {[
            { to:'/',           label:'Accueil' },
            { to:'/collection', label:'Collection' },
            { to:'/contact',    label:'Contact' },
          ].map(({ to, label }) => (
            <li key={to}>
              <Link to={to} className="uppercase text-xs tracking-widest relative group">
                {label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-primary group-hover:w-full transition-all duration-300"/>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* DROITE */}
      <div className="navbar-end gap-2">
        {user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle hover:bg-primary/10 transition-colors">
              <User size={20}/>
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow-2xl border border-base-200 animate-fade-in">
              <li className="menu-title text-xs opacity-60 px-4 py-2">{user.username}</li>
              <li><Link to="/profile"><UserCircle size={15}/> Mon profil</Link></li>
              <li><Link to="/orders"><Package size={15}/> Mes commandes</Link></li>
              <li>
                <button onClick={() => { logout(); navigate('/'); }} className="text-error">
                  <LogOut size={15}/> Déconnexion
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <Link to="/login" className="btn btn-ghost btn-sm uppercase text-xs tracking-widest">
            Connexion
          </Link>
        )}

        <Link to="/cart" className="btn btn-ghost btn-circle indicator hover:bg-primary/10 transition-colors">
          <ShoppingBag size={20}/>
          {cartCount > 0 && (
            <span className="badge badge-sm badge-primary indicator-item animate-fade-in">
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      {/* MENU MOBILE */}
      {open && (
        <div className="absolute top-16 left-0 w-full bg-base-100 border-b border-base-200 lg:hidden z-40 animate-fade-in-up">
          <ul className="menu p-4 gap-1">
            {[
              { to:'/',           label:'Accueil' },
              { to:'/collection', label:'Collection' },
              { to:'/contact',    label:'Contact' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to} onClick={() => setOpen(false)} className="uppercase text-xs tracking-widest">
                  {label}
                </Link>
              </li>
            ))}
            {user
              ? <li><Link to="/profile" onClick={() => setOpen(false)}>Mon profil</Link></li>
              : <li><Link to="/login"   onClick={() => setOpen(false)}>Connexion</Link></li>
            }
          </ul>
        </div>
      )}
    </div>
  );
}