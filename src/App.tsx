import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from './components/common/ToastContainer';
import { BazarioProvider } from './contexts/BazarioContext';
import { AdminLayout } from './layouts/AdminLayout';
import { CustomerLayout } from './layouts/CustomerLayout';
import { SellerLayout } from './layouts/SellerLayout';
import {
  AdminAnalyticsPage,
  AdminCategoriesPage,
  AdminCouponsPage,
  AdminCustomersPage,
  AdminDashboardPage,
  AdminOrdersPage,
  AdminPaymentsPage,
  AdminProductsPage,
  AdminPromotionsPage,
  AdminReviewsPage,
  AdminSellerApplicationsPage,
  AdminSellersPage,
  AdminSettingsPage,
} from './pages/admin/AdminPages';
import { CartPage } from './pages/customer/CartPage';
import { CatalogPage } from './pages/customer/CatalogPage';
import { CheckoutPage, OrderSuccessPage } from './pages/customer/CheckoutPage';
import { CustomerAccountPage } from './pages/customer/CustomerAccountPage';
import { HomePage } from './pages/customer/HomePage';
import { OrderTrackingPage } from './pages/customer/OrderTrackingPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { SellerStorefrontPage } from './pages/customer/SellerStorefrontPage';
import { SupportPage } from './pages/customer/SupportPage';
import {
  SellerAnalyticsPage,
  SellerInventoryPage,
  SellerOrdersPage,
  SellerOverviewPage,
  SellerProductFormPage,
  SellerProductsPage,
  SellerProfilePage,
  SellerRegisterPage,
} from './pages/seller/SellerPages';

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
      </BrowserRouter>
    </BazarioProvider>
  );
}
