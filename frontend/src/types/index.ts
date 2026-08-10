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

export interface Inventory {
  id: string;
  quantity: number;
  lowStockThreshold: number;
  warehouse: { name: string };
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

export interface Order {
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  items: any[];
  payment: any;
  shipping: any;
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