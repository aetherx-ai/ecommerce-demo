import React, { useState } from 'react';
import {
  BarChart3,
  CreditCard,
  FolderTree,
  Globe,
  LayoutDashboard,
  Megaphone,
  Menu,
  MessageSquare,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tag,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BazarioLogo } from '../components/common/BazarioLogo';
import { useBazario } from '../contexts/BazarioContext';

interface AdminNavItem {
  to: string;
  end: boolean;
  labelBn: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const AdminLayout: React.FC = () => {
  const { language, toggleLanguage, sellers, orders, products, setRole } = useBazario();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pendingSellersCount = sellers.filter((s) => s.status === 'pending').length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;
  const pendingProductsCount = products.filter((p) => p.status === 'pending').length;

  const navGroups: { titleBn: string; titleEn: string; items: AdminNavItem[] }[] = [
    {
      titleBn: 'সংক্ষিপ্তসার',
      titleEn: 'Overview',
      items: [
        { to: '/admin', end: true, labelBn: 'ড্যাশবোর্ড', labelEn: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      titleBn: 'ক্যাটালগ ও ভেন্ডর',
      titleEn: 'Catalog & Vendors',
      items: [
        {
          to: '/admin/products',
          end: false,
          labelBn: 'পণ্য মডারেশন',
          labelEn: 'Products',
          icon: Package,
          badge: pendingProductsCount,
        },
        { to: '/admin/categories', end: false, labelBn: 'ক্যাটাগরি', labelEn: 'Categories', icon: FolderTree },
        { to: '/admin/sellers', end: false, labelBn: 'সেলার ডিরেক্টরি', labelEn: 'Sellers', icon: Store },
        {
          to: '/admin/seller-applications',
          end: false,
          labelBn: 'সেলার আবেদন',
          labelEn: 'Applications',
          icon: UserCheck,
          badge: pendingSellersCount,
        },
      ],
    },
    {
      titleBn: 'অপারেশন ও ফাইন্যান্স',
      titleEn: 'Operations & Finance',
      items: [
        {
          to: '/admin/orders',
          end: false,
          labelBn: 'সকল অর্ডার',
          labelEn: 'Orders',
          icon: ShoppingBag,
          badge: pendingOrdersCount,
        },
        { to: '/admin/customers', end: false, labelBn: 'গ্রাহকবৃন্দ', labelEn: 'Customers', icon: Users },
        { to: '/admin/payments', end: false, labelBn: 'পেমেন্ট লেনদেন', labelEn: 'Payments', icon: CreditCard },
      ],
    },
    {
      titleBn: 'গ্রোথ ও সেটিংস',
      titleEn: 'Growth & Settings',
      items: [
        { to: '/admin/coupons', end: false, labelBn: 'কুপন ও অফার', labelEn: 'Coupons', icon: Tag },
        { to: '/admin/reviews', end: false, labelBn: 'রিভিউ মডারেশন', labelEn: 'Reviews', icon: MessageSquare },
        { to: '/admin/promotions', end: false, labelBn: 'ক্যাম্পেইন ব্যানার', labelEn: 'Promotions', icon: Megaphone },
        { to: '/admin/analytics', end: false, labelBn: 'রিপোর্ট ও অ্যানালিটিক্স', labelEn: 'Analytics', icon: BarChart3 },
        { to: '/admin/settings', end: false, labelBn: 'প্ল্যাটফর্ম সেটিংস', labelEn: 'Settings', icon: Settings },
      ],
    },
  ];

  const SidebarBody = (
    <div className="flex flex-col justify-between h-full bg-[#172337] text-white">
      <div>
        <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <BazarioLogo lang={language} darkText={false} compact />
            <p className="text-[11px] font-semibold text-[#FF8A4C] mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>{language === 'bn' ? 'অ্যাডমিন কন্ট্রোল প্যানেল' : 'Admin Control Panel'}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 space-y-4">
          {navGroups.map((group) => (
            <div key={group.titleEn}>
              <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-white/40">
                {language === 'bn' ? group.titleBn : group.titleEn}
              </p>
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-[#F85606] text-white shadow-sm'
                            : 'text-white/75 hover:bg-white/10 hover:text-white'
                        }`
                      }
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{language === 'bn' ? item.labelBn : item.labelEn}</span>
                      </span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-white text-[#172337] text-[10px] font-bold tabular-nums shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-white/10 space-y-2 text-xs">
        <div className="px-2.5 py-2 rounded-lg bg-white/5 text-[11px] text-white/70 flex items-center justify-between gap-2">
          <span>
            {language === 'bn'
              ? 'ডেমো অ্যাডমিন মোড সক্রিয়'
              : 'Demo Admin Control active'}
          </span>
          <span className="w-2 h-2 rounded-full bg-[#22C55E] shrink-0" />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setRole('customer');
              navigate('/');
            }}
            className="py-2 rounded-lg bg-white/10 hover:bg-white/20 font-medium text-white transition-colors"
          >
            {language === 'bn' ? 'মার্কেটপ্লেস' : 'Storefront'}
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('seller');
              navigate('/seller');
            }}
            className="py-2 rounded-lg bg-[#F85606]/90 hover:bg-[#F85606] font-medium text-white transition-colors"
          >
            {language === 'bn' ? 'সেলার প্যানেল' : 'Seller Hub'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex flex-col lg:flex-row overflow-x-clip">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-[#172337] shrink-0 sticky top-0 h-screen overflow-y-auto">
        {SidebarBody}
      </aside>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-[1px]"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-[#172337] h-full z-10 overflow-y-auto shadow-2xl">
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
              aria-label="Open admin menu"
              className="lg:hidden p-2 -ml-1 rounded-md text-[#172337] hover:bg-[#F5F6FA]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-[#172337] truncate">
                {language === 'bn'
                  ? 'বাজারিও — অ্যাডমিন কমান্ড সেন্টার'
                  : 'BAZARIO — Marketplace Control Center'}
              </p>
              <p className="text-[11px] text-[#6B7280] truncate hidden sm:block">
                {language === 'bn'
                  ? 'বাংলাদেশ ই-কমার্স অপারেশন ও অ্যাডমিন প্যানেল'
                  : 'Bangladesh multi-vendor operations, moderation & analytics'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {pendingOrdersCount > 0 && (
              <Link
                to="/admin/orders"
                className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#FFF4EE] border border-[#FED7AA] text-[#9A3412] text-xs font-semibold hover:border-[#F85606] transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#F85606]" />
                <span className="tabular-nums">
                  {pendingOrdersCount} {language === 'bn' ? 'পেন্ডিং অর্ডার' : 'Pending Orders'}
                </span>
              </Link>
            )}
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md border border-[#E5E7EB] text-xs font-semibold text-[#172337] hover:border-[#F85606] bg-[#F5F6FA]"
            >
              <Globe className="w-3.5 h-3.5 text-[#F85606]" />
              <span className="sm:hidden">{language === 'bn' ? 'বাংলা' : 'EN'}</span>
              <span className="hidden sm:inline">
                {language === 'bn' ? 'বাংলা | EN' : 'EN | বাংলা'}
              </span>
            </button>
            <NavLink
              to="/admin/settings"
              className="p-2 rounded-md border border-[#E5E7EB] text-[#4B5563] hover:text-[#172337] hover:border-[#172337]"
              aria-label="Platform settings"
            >
              <Settings className="w-4 h-4" />
            </NavLink>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-6 max-w-[1360px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
