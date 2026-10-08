import { create } from 'zustand';
let stored = [];
try {
  const saved = JSON.parse(localStorage.getItem('skardugift-cart') || '[]');
  stored = Array.isArray(saved) ? saved : [];
} catch {
  localStorage.removeItem('skardugift-cart');
}
export const useCart = create((set, get) => ({
  items: stored,
  add: (product, variant) => set((state) => { const key = `${product.id}:${variant?.id || ''}`; const exists = state.items.find((x) => x.key === key); const items = exists ? state.items.map(x => x.key === key ? {...x, quantity: x.quantity + 1} : x) : [...state.items, {key, product, variant, quantity: 1}]; localStorage.setItem('skardugift-cart', JSON.stringify(items)); return {items}; }),
  change: (key, quantity) => set((state) => { const items = quantity < 1 ? state.items.filter(x => x.key !== key) : state.items.map(x => x.key === key ? {...x, quantity} : x); localStorage.setItem('skardugift-cart', JSON.stringify(items)); return {items}; }),
  clear: () => { localStorage.removeItem('skardugift-cart'); set({items: []}); }
}));
