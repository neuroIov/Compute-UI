'use client';
import React from 'react';
import { useCart } from '@/app/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';

export const Cart = () => {
  const { state, dispatch } = useCart();
  const total = (state.gpu?.price || 0) + (state.aiModel?.price || 0);

  const CartSection = ({ title, item, type }: { title: string; item: any; type: 'gpu' | 'ai-model' }) => (
    <div className="mb-4">
      <h3 className="font-semibold text-sm text-gray-500 mb-2">{title}</h3>
      <AnimatePresence>
        {item ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">${item.price}/{type === 'gpu' ? 'hr' : 'token'}</p>
              </div>
              <button
                onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: type })}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-500 italic"
          >
            No {title.toLowerCase()} selected
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="fixed right-4 top-20 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Your Selection</h2>
      
      <CartSection title="Selected GPU" item={state.gpu} type="gpu" />
      <CartSection title="Selected AI Model" item={state.aiModel} type="ai-model" />

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium">Total Cost:</span>
          <span className="font-bold">
            ${total.toFixed(2)}{' '}
            <span className="text-sm text-gray-500">
              {state.gpu && state.aiModel ? '(GPU/hr + AI/token)' : 
               state.gpu ? '(per hour)' : 
               state.aiModel ? '(per token)' : ''}
            </span>
          </span>
        </div>
        
        {(state.gpu || state.aiModel) && (
          <button 
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => {/* Add checkout logic */}}
          >
            Proceed to Checkout
          </button>
        )}
      </div>
    </div>
  );
};
