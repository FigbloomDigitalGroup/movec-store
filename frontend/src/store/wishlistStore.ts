import { create } from 'zustand';

interface GuestWishlistItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
}

interface WishlistState {
  items: GuestWishlistItem[];
  addItem: (item: GuestWishlistItem) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (item: GuestWishlistItem) => void;
}

const loadWishlist = (): GuestWishlistItem[] => {
  try {
    const saved = localStorage.getItem('guestWishlist');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveWishlist = (items: GuestWishlistItem[]) => {
  localStorage.setItem('guestWishlist', JSON.stringify(items));
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: loadWishlist(),

  addItem: (item) => {
    set((state) => {
      if (state.items.find((i) => i.productId === item.productId)) {
        return state;
      }
      const newItems = [...state.items, item];
      saveWishlist(newItems);
      return { items: newItems };
    });
  },

  removeItem: (productId) => {
    set((state) => {
      const newItems = state.items.filter((i) => i.productId !== productId);
      saveWishlist(newItems);
      return { items: newItems };
    });
  },

  isInWishlist: (productId) => {
    return get().items.some((i) => i.productId === productId);
  },

  toggleItem: (item) => {
    const { isInWishlist, addItem, removeItem } = get();
    if (isInWishlist(item.productId)) {
      removeItem(item.productId);
    } else {
      addItem(item);
    }
  },
}));