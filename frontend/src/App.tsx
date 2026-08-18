import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import RequireAdmin from './components/RequireAdmin';

import ScrollToTop from './components/ScrollToTop';
import BackToTop from './components/BackToTop';
import PageLoader from './components/PageLoader';
import AuthBootstrap from './components/AuthBootstrap';
import CookieConsentBanner from './components/CookieConsentBanner';

const Home = lazy(() => import('./pages/Home'));
const Landing = lazy(() => import('./pages/Landing'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Categories = lazy(() => import('./pages/Categories'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const CartPage = lazy(() => import('./pages/Cart'));
const CheckoutPage = lazy(() => import('./pages/Checkout'));
const WishlistPage = lazy(() => import('./pages/Wishlist'));
const OrdersPage = lazy(() => import('./pages/Orders'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetail'));
const InstallationPage = lazy(() => import('./pages/Installation'));
const SupportPage = lazy(() => import('./pages/Support'));
const ContactPage = lazy(() => import('./pages/Contact'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmail'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPassword'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPassword'));
const ModuleLanding = lazy(() => import('./pages/ModuleLanding'));
const PaymentPage = lazy(() => import('./pages/Payment'));
const ProfilePage = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminModules = lazy(() => import('./pages/admin/AdminModules'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory'));
const AdminInstallations = lazy(() => import('./pages/admin/AdminInstallations'));
const AdminSupport = lazy(() => import('./pages/admin/AdminSupport'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'));
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'MOVEC_QUERY_CACHE',
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 24 * 60 * 60 * 1000, // 24 hours
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            const key = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
            if (typeof key === 'string') {
              const sensitiveKeys = [
                'cart',
                'orders',
                'profile',
                'notifications',
                'auth',
                'user',
                'wishlist',
                'checkout',
                'admin',
              ];
              return !sensitiveKeys.includes(key);
            }
            return true;
          },
        },
      }}
    >
      <BrowserRouter>
        <AuthBootstrap />
        <ScrollToTop />
        <BackToTop />
        <CookieConsentBanner />

        <Toaster position="top-right" toastOptions={{ duration: 1800 }} />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/shop" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/solutions/:moduleSlug" element={<ModuleLanding />} />
              <Route path="/solutions/:moduleSlug/products" element={<Navigate to="/solutions/:moduleSlug" replace />} />
              {/* Legacy redirects */}
              <Route path="/modules" element={<Navigate to="/" replace />} />
              <Route path="/modules/:moduleSlug" element={<Navigate to="/solutions/:moduleSlug" replace />} />
              <Route path="/cctv" element={<Navigate to="/solutions/cctv" replace />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:orderNumber" element={<OrderDetailPage />} />
              <Route path="/payment/:orderNumber" element={<PaymentPage />} />
              <Route path="/installation" element={<InstallationPage />} />
              <Route path="/support/faqs" element={<SupportPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/refund" element={<RefundPolicy />} />
              <Route path="/cookies" element={<CookiePolicy />} />
            </Route>
            <Route element={<RequireAdmin />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/modules" element={<AdminModules />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/inventory" element={<AdminInventory />} />
                <Route path="/admin/installations" element={<AdminInstallations />} />
                <Route path="/admin/support" element={<AdminSupport />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/admin/reviews" element={<AdminReviews />} />
                <Route path="/admin/notifications" element={<AdminNotifications />} />
                <Route path="/admin/homepage" element={<AdminBanners />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </PersistQueryClientProvider>
  );
}
