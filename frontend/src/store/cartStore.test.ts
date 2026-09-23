import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCartStore } from './cartStore';
import api from '../lib/api';

vi.mock('../lib/api', () => ({
  default: { post: vi.fn() },
}));

const productA = { productId: 'a', name: 'Product A', slug: 'product-a', price: 100, image: null, quantity: 1 };
const productB = { productId: 'b', name: 'Product B', slug: 'product-b', price: 250, image: null, quantity: 2 };

describe('useCartStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.setState({ items: [], isSyncing: false });
    vi.mocked(api.post).mockReset();
  });

  it('starts empty', () => {
    expect(useCartStore.getState().items).toEqual([]);
    expect(useCartStore.getState().getTotal()).toBe(0);
    expect(useCartStore.getState().getCount()).toBe(0);
  });

  it('adds a new item', () => {
    useCartStore.getState().addItem(productA);
    expect(useCartStore.getState().items).toEqual([productA]);
  });

  it('merges quantity when adding the same product twice instead of duplicating the row', () => {
    useCartStore.getState().addItem(productA);
    useCartStore.getState().addItem({ ...productA, quantity: 2 });
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
  });

  it('removes an item by productId', () => {
    useCartStore.getState().addItem(productA);
    useCartStore.getState().addItem(productB);
    useCartStore.getState().removeItem('a');
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].productId).toBe('b');
  });

  it('updates quantity, flooring at 1 so an item can never reach 0 or negative via this path', () => {
    useCartStore.getState().addItem(productA);

    useCartStore.getState().updateQuantity('a', 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);

    useCartStore.getState().updateQuantity('a', 0);
    expect(useCartStore.getState().items[0].quantity).toBe(1);

    useCartStore.getState().updateQuantity('a', -3);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  it('computes total as the sum of price * quantity across all items', () => {
    useCartStore.getState().addItem(productA); // 100 * 1
    useCartStore.getState().addItem(productB); // 250 * 2 = 500
    expect(useCartStore.getState().getTotal()).toBe(600);
  });

  it('computes count as the sum of quantities, not the number of distinct items', () => {
    useCartStore.getState().addItem(productA); // qty 1
    useCartStore.getState().addItem(productB); // qty 2
    expect(useCartStore.getState().getCount()).toBe(3);
  });

  it('clearCart empties the cart and clears persisted storage', () => {
    useCartStore.getState().addItem(productA);
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toEqual([]);
    expect(localStorage.getItem('guestCart')).toBeNull();
  });

  it('persists items to localStorage on every mutation', () => {
    useCartStore.getState().addItem(productA);
    expect(JSON.parse(localStorage.getItem('guestCart') || '[]')).toEqual([productA]);
  });

  describe('syncCart', () => {
    it('clears localStorage and state once every item syncs successfully', async () => {
      useCartStore.getState().addItem(productA);
      useCartStore.getState().addItem(productB);
      vi.mocked(api.post).mockResolvedValue({ data: {} });

      // @ts-expect-error queryClient not needed for this assertion
      await useCartStore.getState().syncCart(undefined);

      expect(api.post).toHaveBeenCalledTimes(2);
      expect(useCartStore.getState().items).toEqual([]);
      expect(localStorage.getItem('guestCart')).toBeNull();
    });

    // Regression test for FIG-474: a mid-loop failure used to leave the WHOLE
    // batch in localStorage, so a retry (next login/remount) re-POSTed items
    // that had already synced, doubling their server-side quantity.
    it('on a partial failure, only removes the items that actually synced (does not re-POST them on retry)', async () => {
      useCartStore.getState().addItem(productA);
      useCartStore.getState().addItem(productB);
      vi.mocked(api.post).mockImplementation((_, body) => {
        const { productId } = body as { productId: string };
        return productId === 'b'
          ? Promise.reject(new Error('out of stock'))
          : Promise.resolve({ data: {} });
      });

      // @ts-expect-error queryClient not needed for this assertion
      await useCartStore.getState().syncCart(undefined);

      // Product A succeeded and must be gone so a retry can't double it.
      // Product B failed and stays so it isn't silently dropped from the cart.
      expect(useCartStore.getState().items).toEqual([productB]);
      expect(JSON.parse(localStorage.getItem('guestCart') || '[]')).toEqual([productB]);

      vi.mocked(api.post).mockClear();
      vi.mocked(api.post).mockResolvedValue({ data: {} });
      // @ts-expect-error queryClient not needed for this assertion
      await useCartStore.getState().syncCart(undefined);

      // Retry only re-POSTs the item that previously failed, not product A again.
      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post).toHaveBeenCalledWith('/cart/items', { productId: 'b', quantity: 2 });
    });
  });
});
