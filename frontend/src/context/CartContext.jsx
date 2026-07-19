// ==========================================
// Cart Context & Shopping Cart Manager
// ==========================================
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('carmatrix_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('carmatrix_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (vehicle, qty = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.id === vehicle.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + qty;
        updated[existingIndex].quantity = Math.min(newQty, vehicle.quantity);
        return updated;
      }
      return [
        ...prev,
        {
          id: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          category: vehicle.category,
          price: vehicle.price,
          quantity: Math.min(qty, vehicle.quantity),
          maxQuantity: vehicle.quantity,
        }
      ];
    });
  };

  const removeFromCart = (vehicleId) => {
    setCart(prev => prev.filter(item => item.id !== vehicleId));
  };

  const updateQuantity = (vehicleId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(vehicleId);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.id === vehicleId) {
        return {
          ...item,
          quantity: Math.min(newQty, item.maxQuantity)
        };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
