import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Threads from './components/Threads';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Categories from './pages/Categories';
import Login from './pages/Login';
import Register from './pages/Register';
import CartPage from './pages/Cart';
import CheckoutPage from './pages/Checkout';
import WishlistPage from './pages/Wishlist';
import OrdersPage from './pages/Orders';
import OrderDetailPage from './pages/OrderDetail';
import InstallationPage from './pages/Installation';
import SupportPage from './pages/Support';
import ContactPage from './pages/Contact';
import VerifyEmailPage from './pages/VerifyEmail';
import ForgotPasswordPage from './pages/ForgotPassword';
import ResetPasswordPage from './pages/ResetPassword';
import ModulesPage from './pages/Modules';
import ModuleLanding from './pages/ModuleLanding';
import PaymentPage from './pages/Payment';
import ProfilePage from './pages/Profile';
import CCTVModule from './pages/CCTVModule';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminModules from './pages/admin/AdminModules';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminInventory from './pages/admin/AdminInventory';
import AdminInstallations from './pages/admin/AdminInstallations';
import AdminSupport from './pages/admin/AdminSupport';
import AdminReports from './pages/admin/AdminReports';
import AdminReviews from './pages/admin/AdminReviews';
import AdminNotifications from './pages/admin/AdminNotifications';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Threads color={[0.05, 0.1, 0.3]} amplitude={0.4} distance={0.2} enableMouseInteraction />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/modules" element={<ModulesPage />} />
            <Route path="/modules/:moduleSlug" element={<ModuleLanding />} />
            <Route path="/modules/:moduleSlug/products" element={<ModuleLanding />} />
            <Route path="/cctv" element={<CCTVModule />} />
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
          </Route>
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
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}