import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from './components/common/ToastContainer';
import { BazarioProvider } from './contexts/BazarioContext';
import { CustomerLayout } from './layouts/CustomerLayout';
import { HomePage } from './pages/customer/HomePage';

// Lazy-loaded secondary customer routes
const CatalogPage = lazy(() =>
  import('./pages/customer/CatalogPage').then((m) => ({ default: m.CatalogPage }))
);
const ProductDetailPage = lazy(() =>
  import('./pages/customer/ProductDetailPage').then((m) => ({
    default: m.ProductDetailPage,
  }))
);
const SellerStorefrontPage = lazy(() =>
  import('./pages/customer/SellerStorefrontPage').then((m) => ({
    default: m.SellerStorefrontPage,
  }))
);
const CartPage = lazy(() =>
  import('./pages/customer/CartPage').then((m) => ({ default: m.CartPage }))
);
const CheckoutPage = lazy(() =>
  import('./pages/customer/CheckoutPage').then((m) => ({ default: m.CheckoutPage }))
);
const OrderSuccessPage = lazy(() =>
  import('./pages/customer/CheckoutPage').then((m) => ({
    default: m.OrderSuccessPage,
  }))
);
const OrderTrackingPage = lazy(() =>
  import('./pages/customer/OrderTrackingPage').then((m) => ({
    default: m.OrderTrackingPage,
  }))
);
const CustomerAccountPage = lazy(() =>
  import('./pages/customer/CustomerAccountPage').then((m) => ({
    default: m.CustomerAccountPage,
  }))
);
const SupportPage = lazy(() =>
  import('./pages/customer/SupportPage').then((m) => ({ default: m.SupportPage }))
);

// Lazy-loaded Seller Center routes
const SellerLayout = lazy(() =>
  import('./layouts/SellerLayout').then((m) => ({ default: m.SellerLayout }))
);
const SellerOverviewPage = lazy(() =>
  import('./pages/seller/SellerPages').then((m) => ({
    default: m.SellerOverviewPage,
  }))
);
const SellerProductsPage = lazy(() =>
  import('./pages/seller/SellerPages').then((m) => ({
    default: m.SellerProductsPage,
  }))
);
const SellerProductFormPage = lazy(() =>
  import('./pages/seller/SellerPages').then((m) => ({
    default: m.SellerProductFormPage,
  }))
);
const SellerOrdersPage = lazy(() =>
  import('./pages/seller/SellerPages').then((m) => ({ default: m.SellerOrdersPage }))
);
const SellerInventoryPage = lazy(() =>
  import('./pages/seller/SellerPages').then((m) => ({
    default: m.SellerInventoryPage,
  }))
);
const SellerAnalyticsPage = lazy(() =>
  import('./pages/seller/SellerPages').then((m) => ({
    default: m.SellerAnalyticsPage,
  }))
);
const SellerProfilePage = lazy(() =>
  import('./pages/seller/SellerPages').then((m) => ({ default: m.SellerProfilePage }))
);
const SellerRegisterPage = lazy(() =>
  import('./pages/seller/SellerPages').then((m) => ({
    default: m.SellerRegisterPage,
  }))
);

// Lazy-loaded Admin Control Panel routes
const AdminLayout = lazy(() =>
  import('./layouts/AdminLayout').then((m) => ({ default: m.AdminLayout }))
);
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminPages').then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminProductsPage = lazy(() =>
  import('./pages/admin/AdminPages').then((m) => ({ default: m.AdminProductsPage }))
);
const AdminCategoriesPage = lazy(() =>
  import('./pages/admin/AdminPages').then((m) => ({ default: m.AdminCategoriesPage }))
);
const AdminSellersPage = lazy(() =>
  import('./pages/admin/AdminPages').then((m) => ({ default: m.AdminSellersPage }))
);
const AdminSellerApplicationsPage = lazy(() =>
  import('./pages/admin/AdminPages').then((m) => ({
    default: m.AdminSellerApplicationsPage,
  }))
);
const AdminOrdersPage = lazy(() =>
  import('./pages/admin/AdminPages').then((m) => ({ default: m.AdminOrdersPage }))
);
const AdminCustomersPage = lazy(() =>
  import('./pages/admin/AdminPages').then((m) => ({ default: m.AdminCustomersPage }))
);
const AdminPaymentsPage = lazy(() =>
  import('./pages/admin/AdminPages').then((m) => ({ default: m.AdminPaymentsPage }))
);
const AdminCouponsPage = lazy(() =>
  import('./pages/admin/AdminPages').then((m) => ({ default: m.AdminCouponsPage }))
);
const AdminReviewsPage = lazy(() =>
  import('./pages/admin/AdminPages').then((m) => ({ default: m.AdminReviewsPage }))
);
const AdminPromotionsPage = lazy(() =>
  import('./pages/admin/AdminPages').then((m) => ({ default: m.AdminPromotionsPage }))
);
const AdminAnalyticsPage = lazy(() =>
  import('./pages/admin/AdminPages').then((m) => ({ default: m.AdminAnalyticsPage }))
);
const AdminSettingsPage = lazy(() =>
  import('./pages/admin/AdminPages').then((m) => ({ default: m.AdminSettingsPage }))
);

const RouteFallback: React.FC = () => (
  <div className="min-h-[60vh] bg-[#F5F6FA] flex flex-col items-center justify-center gap-3 p-6">
    <div
      aria-label="Loading"
      className="w-9 h-9 rounded-full border-[3px] border-[#E5E7EB] border-t-[#F85606] animate-spin"
    />
    <span className="text-xs font-medium text-[#6B7280] tracking-wide">
      BAZARIO
    </span>
  </div>
);

const ScrollToTop: React.FC = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, search]);
  return null;
};

export default function App() {
  return (
    <BazarioProvider>
      <BrowserRouter>
        <ScrollToTop />
        <ToastContainer />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* CUSTOMER MARKETPLACE */}
            <Route element={<CustomerLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<CatalogPage />} />
              <Route path="/search" element={<CatalogPage />} />
              <Route path="/category/:slug" element={<CatalogPage />} />
              <Route path="/product/:slug" element={<ProductDetailPage />} />
              <Route path="/store/:slug" element={<SellerStorefrontPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-success" element={<OrderSuccessPage />} />
              <Route path="/track-order" element={<OrderTrackingPage />} />
              <Route path="/wishlist" element={<CustomerAccountPage />} />
              <Route path="/login" element={<CustomerAccountPage />} />
              <Route path="/register" element={<CustomerAccountPage />} />
              <Route path="/account" element={<CustomerAccountPage />} />
              <Route path="/account/orders" element={<CustomerAccountPage />} />
              <Route path="/account/addresses" element={<CustomerAccountPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/support/:topic" element={<SupportPage />} />
            </Route>

            {/* SELLER CENTER */}
            <Route path="/seller" element={<SellerLayout />}>
              <Route index element={<SellerOverviewPage />} />
              <Route path="products" element={<SellerProductsPage />} />
              <Route path="products/new" element={<SellerProductFormPage />} />
              <Route path="products/edit/:id" element={<SellerProductFormPage />} />
              <Route path="orders" element={<SellerOrdersPage />} />
              <Route path="inventory" element={<SellerInventoryPage />} />
              <Route path="analytics" element={<SellerAnalyticsPage />} />
              <Route path="profile" element={<SellerProfilePage />} />
              <Route path="register" element={<SellerRegisterPage />} />
            </Route>

            {/* ADMIN CONTROL PANEL */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="sellers" element={<AdminSellersPage />} />
              <Route path="seller-applications" element={<AdminSellerApplicationsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="payments" element={<AdminPaymentsPage />} />
              <Route path="coupons" element={<AdminCouponsPage />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
              <Route path="promotions" element={<AdminPromotionsPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </BazarioProvider>
  );
}
