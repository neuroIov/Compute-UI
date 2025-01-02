'use client';
import React from 'react';
import { useCart } from '@/app/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Check } from 'lucide-react';

type CartItem = {
  id: string;
  name: string;
  price: number;
  type: 'gpu' | 'ai-model';
};

export function AddToCartButton({ item }: { item: CartItem }) {
  const { state, dispatch } = useCart();
  const isInCart = (item.type === 'gpu' && state.gpu?.id === item.id) || 
                  (item.type === 'ai-model' && state.aiModel?.id === item.id);

  const handleClick = () => {
    if (isInCart) {
      dispatch({ type: 'REMOVE_ITEM', payload: item });
    } else {
      dispatch({ type: 'ADD_ITEM', payload: item });
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
        isInCart ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <AnimatePresence mode="wait">
        {isInCart ? (
          <motion.div
            key="check"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center gap-2"
          >
            <Check size={20} className="text-white" />
            <span className="text-white font-medium">Added to Cart</span>
          </motion.div>
        ) : (
          <motion.div
            key="cart"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center gap-2"
          >
            <ShoppingCart size={20} className="text-white" />
            <span className="text-white font-medium">Rent Now</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
