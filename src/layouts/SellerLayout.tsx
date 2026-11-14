import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Boxes,
  CheckCircle2,
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
    products,
    orders,
    setRole,
  } = useBazario();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeSeller = sellers.find((s) => s.id === activeSellerId) ?? sellers[0];

  const { pendingOrdersCount, lowStockCount } = useMemo(() => {
    const myProds = products.filter((p) => p.sellerId === activeSeller.id);
    const myOrds = orders.filter((o) =>
      o.items.some((i) => i.sellerId === activeSeller.id)
    );
    return {
      pendingOrdersCount: myOrds.filter(
        (o) => o.status !== 'Delivered' && o.status !== 'Cancelled'
      ).length,
      lowStockCount: myProds.filter((p) => p.stock <= 8).length,
    };
  }, [products, orders, activeSeller.id]);

  const primaryLinks = [
    { to: '/seller', end: true, labelBn: 'ওভারভিউ', labelEn: 'Overview', icon: LayoutDashboard },
    { to: '/seller/products', end: true, labelBn: 'আমার পণ্য', labelEn: 'My Products', icon: Package },
    { to: '/seller/products/new', end: false, labelBn: 'নতুন পণ্য যোগ', labelEn: 'Add Product', icon: PlusCircle },
    {
      to: '/seller/orders',
      end: false,
      labelBn: 'অর্ডারসমূহ',
      labelEn: 'Orders',
      icon: ShoppingBag,
      badge: pendingOrdersCount,
    },
    {
      to: '/seller/inventory',
      end: false,
      labelBn: 'ইনভেন্টরি',
      labelEn: 'Inventory',
      icon: Boxes,
      badge: lowStockCount,
      badgeWarn: true,
    },
  ];

  const secondaryLinks = [
    { to: '/seller/analytics', end: false, labelBn: 'অ্যানালিটিক্স', labelEn: 'Analytics', icon: BarChart3 },
    { to: '/seller/profile', end: false, labelBn: 'স্টোর প্রোফাইল', labelEn: 'Store Profile', icon: Store },
    { to: '/seller/register', end: false, labelBn: 'নতুন সেলার আবেদন', labelEn: 'Seller Onboarding', icon: UserPlus },
  ];

  const renderNavLink = (item: (typeof primaryLinks)[number]) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        onClick={() => setSidebarOpen(false)}
        className={({ isActive }) =>
          `group flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
            isActive
              ? 'bg-[#172337] text-white shadow-xs'
              : 'text-[#4B5563] hover:bg-[#F5F6FA] hover:text-[#172337]'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span className="flex items-center gap-2.5 min-w-0">
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-[#F85606]' : 'text-[#6B7280] group-hover:text-[#172337]'
                }`}
              />
              <span className="truncate">{language === 'bn' ? item.labelBn : item.labelEn}</span>
            </span>
            {item.badge !== undefined && item.badge > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums shrink-0 ${
                  isActive
                    ? 'bg-[#F85606] text-white'
                    : item.badgeWarn
                    ? 'bg-[#FEF3C7] text-[#B45309]'
                    : 'bg-[#FFF4EE] text-[#F85606]'
                }`}
              >
                {item.badge}
              </span>
            )}
          </>
        )}
      </NavLink>
    );
  };

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
            aria-label="Close seller menu"
            className="lg:hidden p-1.5 rounded-md text-[#6B7280] hover:bg-[#F5F6FA]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Demo Seller Switcher */}
        <div className="p-3 border-b border-[#E5E7EB] bg-[#F5F6FA] space-y-2">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs"
              style={{ backgroundColor: activeSeller.bannerColor }}
            >
              {activeSeller.logoInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#172337] truncate flex items-center gap-1">
                <span className="truncate">{activeSeller.storeName}</span>
                {activeSeller.verified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                )}
              </p>
              <p className="text-[10px] text-[#6B7280] truncate">{activeSeller.businessCategory}</p>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1">
              {language === 'bn' ? 'ডেমো সেলার পরিবর্তন' : 'Switch Demo Store'}
            </label>
            <select
              value={activeSellerId}
              onChange={(e) => setActiveSellerId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-medium bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#F85606]"
            >
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.storeName} ({s.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-3 space-y-4">
          <div>
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              {language === 'bn' ? 'স্টোর পরিচালনা' : 'Store Operations'}
            </p>
            <nav className="space-y-1">{primaryLinks.map(renderNavLink)}</nav>
          </div>

          <div className="pt-2 border-t border-[#F1F3F5]">
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              {language === 'bn' ? 'গ্রোথ ও সেটিংস' : 'Growth & Setup'}
            </p>
            <nav className="space-y-1">{secondaryLinks.map(renderNavLink)}</nav>
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-[#E5E7EB] space-y-2 text-xs bg-[#FAFAFC]">
        <Link
          to={`/store/${activeSeller.slug}`}
          onClick={() => setRole('customer')}
          className="w-full py-2 px-3 rounded-lg bg-white border border-[#E5E7EB] hover:border-[#F85606] text-[#172337] hover:text-[#F85606] font-semibold flex items-center justify-center gap-1.5 transition-colors"
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
            className="py-2 rounded-lg bg-[#F5F6FA] hover:bg-[#E5E7EB] font-semibold text-[#172337] transition-colors"
          >
            {language === 'bn' ? 'মার্কেটপ্লেস' : 'Storefront'}
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('admin');
              navigate('/admin');
            }}
            className="py-2 rounded-lg bg-[#FFF4EE] hover:bg-[#FFE6D6] font-semibold text-[#F85606] transition-colors"
          >
            {language === 'bn' ? 'অ্যাডমিন' : 'Admin'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex flex-col lg:flex-row overflow-x-clip">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-r border-[#E5E7EB] shrink-0 sticky top-0 h-screen overflow-y-auto">
        {SidebarBody}
      </aside>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-[1px]"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white h-full z-10 overflow-y-auto shadow-2xl">
            {SidebarBody}
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-[#E5E7EB] px-3 sm:px-6 py-3 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-30 shadow-[0_2px_10px_-6px_rgba(23,35,55,0.08)]">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open seller menu"
              className="lg:hidden p-2 -ml-1 rounded-md text-[#172337] hover:bg-[#F5F6FA]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div
              className="hidden sm:flex w-9 h-9 rounded-lg text-white font-bold text-xs items-center justify-center shrink-0"
              style={{ backgroundColor: activeSeller.bannerColor }}
            >
              {activeSeller.logoInitials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-bold text-[#172337] truncate">
                  {activeSeller.storeName}
                </p>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize shrink-0 ${
                    activeSeller.status === 'approved'
                      ? 'bg-[#DCFCE7] text-[#166534]'
                      : activeSeller.status === 'pending'
                      ? 'bg-[#FEF3C7] text-[#92400E]'
                      : 'bg-[#FEE2E2] text-[#991B1B]'
                  }`}
                >
                  {activeSeller.status}
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280] truncate hidden sm:block">
                {language === 'bn'
                  ? 'বাজারিও ভেরিফায়েড ভেন্ডর ড্যাশবোর্ড'
                  : 'BAZARIO Vendor Hub · Orders, Catalog & Analytics'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link
              to="/seller/products/new"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#F85606] hover:bg-[#E04A00] text-white text-xs font-semibold transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'নতুন পণ্য' : 'Add Product'}</span>
            </Link>
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md border border-[#E5E7EB] hover:border-[#F85606] text-xs font-semibold text-[#172337] bg-[#F5F6FA]"
            >
              <Globe className="w-3.5 h-3.5 text-[#F85606]" />
              <span className="sm:hidden">{language === 'bn' ? 'বাংলা' : 'EN'}</span>
              <span className="hidden sm:inline">
                {language === 'bn' ? 'বাংলা | EN' : 'EN | বাংলা'}
              </span>
            </button>
            <Link
              to="/seller/profile"
              className="p-2 rounded-md border border-[#E5E7EB] text-[#4B5563] hover:text-[#172337] hover:border-[#172337]"
              aria-label="Seller settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-6 max-w-[1280px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
