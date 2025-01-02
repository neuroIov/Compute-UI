'use client';
import React, { createContext, useContext, useReducer } from 'react';

type CartItem = {
  id: string;
  name: string;
  price: number;
  type: 'gpu' | 'ai-model';
};

type CartState = {
  gpu: CartItem | null;
  aiModel: CartItem | null;
};

type CartAction = {
  type: 'ADD_ITEM' | 'REMOVE_ITEM' | 'CLEAR_CART';
  payload?: CartItem;
};

const initialState: CartState = {
  gpu: null,
  aiModel: null,
};

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM':
      if (!action.payload) return state;
      return {
        ...state,
        [action.payload.type === 'gpu' ? 'gpu' : 'aiModel']: action.payload,
      };
    case 'REMOVE_ITEM':
      if (!action.payload) return state;
      return {
        ...state,
        [action.payload.type === 'gpu' ? 'gpu' : 'aiModel']: null,
      };
    case 'CLEAR_CART':
      return initialState;
    default:
      return state;
  }
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
