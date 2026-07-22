import { create } from 'zustand';
import toast from 'react-hot-toast';

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
  addItem: (item: GuestCartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  getTotal: () => number;
  getCount: () => number;
  clearCart: () => void;
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
}));