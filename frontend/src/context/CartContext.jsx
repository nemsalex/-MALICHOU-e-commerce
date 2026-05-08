import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user }            = useAuth();
  const [cart, setCart]     = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get('/cart/');
      setCart(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, [user]);

  const addToCart = async (productId, size, quantity = 1) => {
    const res = await api.post('/cart/', { product_id: productId, size, quantity });
    setCart(res.data);
  };

  const removeItem = async (itemId) => {
    await api.delete(`/cart/${itemId}/`);
    fetchCart();
  };

  const updateQty = async (itemId, quantity) => {
    const res = await api.patch(`/cart/${itemId}/`, { quantity });
    setCart(res.data);
  };

  const clearCart = async () => {
    await api.delete('/cart/');
    setCart({ items: [], total: 0 });
  };

  const placeOrder = async (address) => {
    const res = await api.post('/orders/', { address });
    setCart({ items: [], total: 0 });
    return res.data;
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, removeItem, updateQty, clearCart, placeOrder, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);