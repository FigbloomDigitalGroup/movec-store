import { create } from 'zustand';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface GuestCartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  quantity: number;
}

interface CartState {
  items: GuestCartItem[];
  isSyncing: boolean;
  addItem: (item: GuestCartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  getTotal: () => number;
  getCount: () => number;
  clearCart: () => void;
  syncCart: (queryClient: any) => Promise<void>;
}

const loadCart = (): GuestCartItem[] => {
  try {
    const saved = localStorage.getItem('guestCart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveCart = (items: GuestCartItem[]) => {
  localStorage.setItem('guestCart', JSON.stringify(items));
};

export const useCartStore = create<CartState>((set, get) => ({
  items: loadCart(),
  isSyncing: false,

  addItem: (item) => {
    set((state) => {
      const existing = state.items.find((i) => i.productId === item.productId);
      let newItems;
      if (existing) {
        newItems = state.items.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
        toast.success(`Updated ${item.name} quantity in cart`);
      } else {
        newItems = [...state.items, item];
        toast.success(`Added ${item.name} to cart`);
      }
      saveCart(newItems);
      return { items: newItems };
    });
  },

  removeItem: (productId) => {
    set((state) => {
      const item = state.items.find((i) => i.productId === productId);
      const newItems = state.items.filter((i) => i.productId !== productId);
      saveCart(newItems);
      if (item) toast.success(`Removed ${item.name} from cart`);
      return { items: newItems };
    });
  },

  updateQuantity: (productId, quantity) => {
    set((state) => {
      const newItems = state.items.map((i) =>
        i.productId === productId ? { ...i, quantity: Math.max(1, quantity) } : i
      );
      saveCart(newItems);
      return { items: newItems };
    });
  },

  getTotal: () => {
    return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  },

  getCount: () => {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },

  clearCart: () => {
    localStorage.removeItem('guestCart');
    set({ items: [] });
  },

  syncCart: async (queryClient: any) => {
    const items = get().items;
    if (items.length === 0 || get().isSyncing) return;
    set({ isSyncing: true });
    try {
      for (const item of items) {
        await api.post('/cart/items', { productId: item.productId, quantity: item.quantity });
      }
      localStorage.removeItem('guestCart');
      set({ items: [], isSyncing: false });
      if (queryClient) {
        await queryClient.invalidateQueries({ queryKey: ['cart'] });
      }
    } catch (err) {
      console.error('Failed to sync cart:', err);
      set({ isSyncing: false });
    }
  },
}));