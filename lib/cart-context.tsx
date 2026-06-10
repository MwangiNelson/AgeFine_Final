"use client";

import { createContext, useContext, useEffect, useReducer } from "react";
import {
  CartItem, addItem as add, removeItem as rm, setQty as sq, cartTotal, cartCount,
} from "./cart";

interface State { items: CartItem[]; }
type Action =
  | { type: "ADD"; item: CartItem }
  | { type: "REMOVE"; id: string }
  | { type: "SET_QTY"; id: string; qty: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD": return { items: add(state.items, action.item) };
    case "REMOVE": return { items: rm(state.items, action.id) };
    case "SET_QTY": return { items: sq(state.items, action.id, action.qty) };
    case "CLEAR": return { items: [] };
    case "HYDRATE": return { items: action.items };
    default: return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
}

const STORAGE_KEY = "agefine_cart_v1";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "HYDRATE", items: JSON.parse(raw) as CartItem[] });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items)); } catch { /* ignore */ }
  }, [state.items]);

  const value: CartContextValue = {
    items: state.items,
    addItem: (item) => dispatch({ type: "ADD", item }),
    removeItem: (id) => dispatch({ type: "REMOVE", id }),
    setQty: (id, qty) => dispatch({ type: "SET_QTY", id, qty }),
    clear: () => dispatch({ type: "CLEAR" }),
    total: cartTotal(state.items),
    count: cartCount(state.items),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
