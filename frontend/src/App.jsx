import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Home           from './pages/Home';
import Login          from './pages/Login';
import Register       from './pages/Register';
import Cart           from './pages/Cart';
import Orders         from './pages/Orders';
import Contact        from './pages/Contact';
import ProductDetail  from './pages/ProductDetail';
import Checkout       from './pages/Checkout';
import Collection     from './pages/Collection';
import Profile        from './pages/Profile';
import ErrorBoundary  from './components/ErrorBoundary';
import ScrollToTop    from './components/ScrollToTop';
import WhatsAppButton from './components/WhatsAppButton';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/register"  element={<Register />} />
            <Route path="/cart"      element={<Cart />} />
            <Route path="/orders"    element={<Orders />} />
            <Route path="/contact"   element={<Contact />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/profile"   element={<Profile />} />
            <Route path="/checkout"  element={<Checkout />} />
            <Route path="/products/:slug" element={
              <ErrorBoundary>
                <ProductDetail />
              </ErrorBoundary>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <ScrollToTop />
          <WhatsAppButton number="22664735227" />  
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;