import React, { useState } from 'react';
import {
  BarChart3,
  Boxes,
  ExternalLink,
  Globe,
  LayoutDashboard,
  Menu,
  Package,
  PlusCircle,
  Settings,
  ShoppingBag,
  Store,
  UserPlus,
  X,
} from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BazarioLogo } from '../components/common/BazarioLogo';
import { useBazario } from '../contexts/BazarioContext';

export const SellerLayout: React.FC = () => {
  const {
    language,
    toggleLanguage,
    sellers,
    activeSellerId,
    setActiveSellerId,
    setRole,
  } = useBazario();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeSeller = sellers.find((s) => s.id === activeSellerId) ?? sellers[0];

  const navLinks = [
    { to: '/seller', end: true, labelBn: 'ওভারভিউ', labelEn: 'Overview', icon: LayoutDashboard },
    { to: '/seller/products', end: true, labelBn: 'আমার পণ্য', labelEn: 'My Products', icon: Package },
    { to: '/seller/products/new', end: false, labelBn: 'নতুন পণ্য যোগ', labelEn: 'Add Product', icon: PlusCircle },
    { to: '/seller/orders', end: false, labelBn: 'অর্ডারসমূহ', labelEn: 'Orders', icon: ShoppingBag },
    { to: '/seller/inventory', end: false, labelBn: 'ইনভেন্টরি', labelEn: 'Inventory', icon: Boxes },
    { to: '/seller/analytics', end: false, labelBn: 'অ্যানালিটিক্স', labelEn: 'Analytics', icon: BarChart3 },
    { to: '/seller/profile', end: false, labelBn: 'স্টোর প্রোফাইল', labelEn: 'Store Profile', icon: Store },
    { to: '/seller/register', end: false, labelBn: 'নতুন সেলার আবেদন', labelEn: 'Seller Onboarding', icon: UserPlus },
  ];

  const SidebarBody = (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="px-4 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <BazarioLogo lang={language} compact />
            <p className="text-[11px] font-semibold text-[#F85606] mt-1">
              {language === 'bn' ? 'সেলার সেন্টার' : 'Seller Center'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-[#6B7280]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Demo Seller Switcher */}
        <div className="p-3 border-b border-[#E5E7EB] bg-[#F5F6FA]">
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1">
            {language === 'bn' ? 'ডেমো সেলার পরিবর্তন' : 'Active Demo Seller'}
          </label>
          <select
            value={activeSellerId}
            onChange={(e) => setActiveSellerId(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs font-medium bg-white border border-[#E5E7EB] rounded-md"
          >
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.storeName} ({s.status})
              </option>
            ))}
          </select>
        </div>

        <nav className="p-3 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#172337] text-white'
                      : 'text-[#4B5563] hover:bg-[#F5F6FA] hover:text-[#172337]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{language === 'bn' ? item.labelBn : item.labelEn}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-[#E5E7EB] space-y-2 text-xs">
        <Link
          to={`/store/${activeSeller.slug}`}
          onClick={() => setRole('customer')}
          className="w-full py-2 px-3 rounded-lg border border-[#E5E7EB] hover:border-[#F85606] text-[#172337] font-medium flex items-center justify-center gap-1.5"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'পাবলিক স্টোর দেখুন' : 'View Public Store'}</span>
        </Link>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setRole('customer');
              navigate('/');
            }}
            className="py-2 rounded-lg bg-[#F5F6FA] hover:bg-[#E5E7EB] font-medium text-[#172337]"
          >
            {language === 'bn' ? 'মার্কেটপ্লেস' : 'Storefront'}
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('admin');
              navigate('/admin');
            }}
            className="py-2 rounded-lg bg-[#FFF4EE] hover:bg-[#FFE6D6] font-medium text-[#F85606]"
          >
            {language === 'bn' ? 'অ্যাডমিন' : 'Admin'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-r border-[#E5E7EB] shrink-0 sticky top-0 h-screen overflow-y-auto">
        {SidebarBody}
      </aside>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/45" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 bg-white h-full z-10 overflow-y-auto">
            {SidebarBody}
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-[#E5E7EB] px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open seller menu"
              className="lg:hidden p-2 -ml-2 text-[#172337]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#172337] truncate">
                {activeSeller.storeName}
              </p>
              <p className="text-[11px] text-[#6B7280]">
                Status:{' '}
                <span
                  className={`font-semibold capitalize ${
                    activeSeller.status === 'approved'
                      ? 'text-[#16A34A]'
                      : activeSeller.status === 'pending'
                      ? 'text-[#D97706]'
                      : 'text-[#DC2626]'
                  }`}
                >
                  {activeSeller.status}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#E5E7EB] text-xs font-semibold text-[#172337]"
            >
              <Globe className="w-3.5 h-3.5 text-[#F85606]" />
              <span>{language === 'bn' ? 'বাংলা | EN' : 'EN | বাংলা'}</span>
            </button>
            <Link
              to="/seller/profile"
              className="p-2 rounded-md border border-[#E5E7EB] text-[#4B5563] hover:text-[#172337]"
              aria-label="Seller settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-[1280px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
