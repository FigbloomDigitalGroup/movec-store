import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWishlistStore } from './wishlistStore';
import api from '../lib/api';

vi.mock('../lib/api', () => ({
  default: { post: vi.fn() },
}));

const productA = { productId: 'a', name: 'Product A', slug: 'product-a', price: 100, image: null };
const productB = { productId: 'b', name: 'Product B', slug: 'product-b', price: 250, image: null };

describe('useWishlistStore syncWishlist', () => {
  beforeEach(() => {
    localStorage.clear();
    useWishlistStore.setState({ items: [], isSyncing: false });
    vi.mocked(api.post).mockReset();
  });

  it('clears localStorage and state once every item syncs successfully', async () => {
    useWishlistStore.getState().addItem(productA);
    useWishlistStore.getState().addItem(productB);
    vi.mocked(api.post).mockResolvedValue({ data: {} });

    // @ts-expect-error queryClient not needed for this assertion
    await useWishlistStore.getState().syncWishlist(undefined);

    expect(api.post).toHaveBeenCalledTimes(2);
    expect(useWishlistStore.getState().items).toEqual([]);
    expect(localStorage.getItem('guestWishlist')).toBeNull();
  });

  // Regression test for FIG-474: a mid-loop failure used to leave the WHOLE
  // batch in localStorage, so a retry (next login/remount) re-POSTed items
  // that had already synced.
  it('on a partial failure, only removes the items that actually synced (does not re-POST them on retry)', async () => {
    useWishlistStore.getState().addItem(productA);
    useWishlistStore.getState().addItem(productB);
    vi.mocked(api.post).mockImplementation((_, body) => {
      const { productId } = body as { productId: string };
      return productId === 'b'
        ? Promise.reject(new Error('product not found'))
        : Promise.resolve({ data: {} });
    });

    // @ts-expect-error queryClient not needed for this assertion
    await useWishlistStore.getState().syncWishlist(undefined);

    expect(useWishlistStore.getState().items).toEqual([productB]);
    expect(JSON.parse(localStorage.getItem('guestWishlist') || '[]')).toEqual([productB]);

    vi.mocked(api.post).mockClear();
    vi.mocked(api.post).mockResolvedValue({ data: {} });
    // @ts-expect-error queryClient not needed for this assertion
    await useWishlistStore.getState().syncWishlist(undefined);

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith('/wishlist', { productId: 'b' });
  });
});
