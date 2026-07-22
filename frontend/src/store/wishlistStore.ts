import { create } from 'zustand';
import toast from 'react-hot-toast';

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
      toast.success(`Added ${item.name} to wishlist`);
      return { items: newItems };
    });
  },

  removeItem: (productId) => {
    set((state) => {
      const item = state.items.find((i) => i.productId === productId);
      const newItems = state.items.filter((i) => i.productId !== productId);
      saveWishlist(newItems);
      if (item) toast.success(`Removed ${item.name} from wishlist`);
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