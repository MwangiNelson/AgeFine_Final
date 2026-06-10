export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price_kes: number;
  qty: number;
  image?: string;
}

export function addItem(items: CartItem[], item: CartItem): CartItem[] {
  const qty = item.qty && item.qty > 0 ? item.qty : 1;
  const existing = items.find((i) => i.id === item.id);
  if (existing) {
    return items.map((i) => (i.id === item.id ? { ...i, qty: i.qty + qty } : i));
  }
  return [...items, { ...item, qty }];
}

export function removeItem(items: CartItem[], id: string): CartItem[] {
  return items.filter((i) => i.id !== id);
}

export function setQty(items: CartItem[], id: string, qty: number): CartItem[] {
  if (qty <= 0) return removeItem(items, id);
  return items.map((i) => (i.id === id ? { ...i, qty } : i));
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price_kes * i.qty, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.qty, 0);
}
