export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller?: boolean;
  avgRating: number | null;
  reviewCount: number;
  images: ProductImage[];
  brand: Brand | null;
  categories: Category[];
  inventory: Inventory[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string | null;
}

export interface Inventory {
  id: string;
  quantity: number;
  lowStockThreshold: number;
  warehouse: Warehouse;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  quantity: number;
  subtotal: number;
  inStock: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
}

// Shape actually needed when rendering a cart-like row — satisfied by both the
// authenticated CartItem (from the server cart) and the guest GuestCartItem
// (from cartStore), which has no persisted `id` since it never reached the
// server.
export interface CartDisplayItem {
  id?: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  quantity: number;
}

export interface OrderItem {
  id?: string;
  productId: string;
  productName: string;
  slug: string;
  quantity: number;
  price: number;
  image: string | null;
}

export interface OrderPayment {
  method: string;
  status: string;
  amount?: number;
}

export interface OrderShipping {
  carrier?: string | null;
  trackingNumber?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
}

export interface OrderStatusHistoryEntry {
  status: string;
  changedAt: string;
}

export interface Order {
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  items: OrderItem[];
  payments?: OrderPayment[];
  shipping?: OrderShipping | null;
  shippingAddress?: Address | null;
  statusHistory?: OrderStatusHistoryEntry[];
  coupon?: { code: string } | null;
  createdAt: string;
}

export interface Address {
  id: string;
  type: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  addedAt: string;
}

export interface ReviewUser {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title: string | null;
  body: string | null;
  isApproved: boolean;
  createdAt: string;
  user: ReviewUser;
}