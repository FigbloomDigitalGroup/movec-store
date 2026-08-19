import { beforeEach, describe, expect, it } from 'vitest';
import { useCartStore } from './cartStore';

const productA = { productId: 'a', name: 'Product A', slug: 'product-a', price: 100, image: null, quantity: 1 };
const productB = { productId: 'b', name: 'Product B', slug: 'product-b', price: 250, image: null, quantity: 2 };

describe('useCartStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.setState({ items: [], isSyncing: false });
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
});
