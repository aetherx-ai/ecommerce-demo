import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  Globe,
  Headphones,
  Heart,
  Home,
  LayoutGrid,
  Menu,
  MessageCircle,
  Package,
  Search,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
  User,
  X,
} from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BazarioLogo } from '../components/common/BazarioLogo';
import { ResilientImage } from '../components/common/ResilientImage';
import { useBazario } from '../contexts/BazarioContext';
import { t } from '../data/i18n';
import { formatBDT, formatNum, getText } from '../utils/formatters';

export const CustomerLayout: React.FC = () => {
  const {
    language,
    toggleLanguage,
    categories,
    products,
    cart,
    wishlist,
    searchHistory,
    addSearchHistory,
    settings,
    setRole,
    showToast,
  } = useBazario();

  const navigate = useNavigate();
  const location = useLocation();
  const [searchInput, setSearchInput] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [hoveredCatSlug, setHoveredCatSlug] = useState<string>(categories[0]?.slug ?? 'electronics');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [footerEmail, setFooterEmail] = useState('');
  const searchBoxRef = useRef<HTMLDivElement>(null);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    setMegaOpen(false);
    setMobileDrawerOpen(false);
    setAccountMenuOpen(false);
  }, [location.pathname, location.search]);

  const approvedProducts = products.filter((p) => p.status === 'approved');
  const instantSuggestions = searchInput.trim()
    ? approvedProducts
        .filter((p) => {
          const q = searchInput.toLowerCase();
          return (
            p.name.en.toLowerCase().includes(q) ||
            p.name.bn.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.categorySlug.toLowerCase().includes(q)
          );
        })
        .slice(0, 6)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (!q) {
      navigate('/shop');
      return;
    }
    addSearchHistory(q);
    setSearchFocused(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const activeMegaCategory =
    categories.find((c) => c.slug === hoveredCatSlug) ?? categories[0];
  const megaFeaturedProducts = approvedProducts
    .filter((p) => p.categorySlug === activeMegaCategory?.slug)
    .slice(0, 2);

  const navItems = [
    { label: t('navHome', language), to: '/' },
    { label: t('navElectronics', language), to: '/category/electronics' },
    { label: t('navFashion', language), to: '/category/fashion' },
    { label: t('navMobile', language), to: '/category/mobile-gadgets' },
    { label: t('navCosmetics', language), to: '/category/beauty' },
    { label: t('navHomeLiving', language), to: '/category/home-living' },
    { label: t('navSports', language), to: '/category/sports-fitness' },
    { label: t('navOffers', language), to: '/shop?discount=true' },
  ];

  const handleRoleSwitch = (target: 'customer' | 'seller' | 'admin') => {
    setRole(target);
    if (target === 'seller') navigate('/seller');
    else if (target === 'admin') navigate('/admin');
    else navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F6FA] text-[#202124] pb-16 lg:pb-0">
      {/* Top Announcement & Role Switcher Bar */}
      <div className="bg-[#172337] text-white text-[11px] sm:text-xs border-b border-white/10">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#F85606]" />
              <span>{t('announcement1', language)}</span>
            </span>
            <span className="hidden sm:inline text-white/30">|</span>
            <span className="hidden sm:inline">{t('announcement2', language)}</span>
            <span className="hidden md:inline text-white/30">|</span>
            <span className="hidden md:inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4ADE80]" />
              <span>{t('announcement3', language)}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/track-order"
              className="hidden sm:inline hover:text-[#F85606] transition-colors whitespace-nowrap"
            >
              {t('trackOrder', language)}
            </Link>
            <Link
              to="/support/contact"
              className="hidden md:inline-flex items-center gap-1 hover:text-[#F85606] transition-colors whitespace-nowrap"
            >
              <Headphones className="w-3 h-3" />
              <span>{t('support', language)}</span>
            </Link>
            {/* Clear Demo Role Switcher */}
            <div className="inline-flex items-center bg-white/10 rounded p-0.5 gap-0.5">
              <button
                type="button"
                onClick={() => handleRoleSwitch('customer')}
                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F85606] text-white whitespace-nowrap"
              >
                {language === 'bn' ? 'ক্রেতা' : 'Customer'}
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch('seller')}
                className="px-2 py-0.5 rounded text-[10px] font-medium text-white/85 hover:bg-white/10 whitespace-nowrap"
              >
                {t('sellerCenter', language)}
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch('admin')}
                className="px-2 py-0.5 rounded text-[10px] font-medium text-white/85 hover:bg-white/10 whitespace-nowrap"
              >
                {t('adminPanel', language)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] shadow-[0_2px_10px_-4px_rgba(23,35,55,0.06)]">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-5">
          {/* Mobile Menu + Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open menu"
              className="lg:hidden w-10 h-10 -ml-1.5 flex items-center justify-center rounded-md text-[#172337] hover:bg-[#F5F6FA]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/" aria-label="BAZARIO Home">
              <BazarioLogo lang={language} />
            </Link>
          </div>

          {/* Search Bar (Desktop & Tablet) */}
          <div ref={searchBoxRef} className="relative flex-1 max-w-2xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="flex items-stretch">
              <input
                type="text"
                value={searchInput}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setSearchFocused(true);
                }}
                placeholder={t('searchPlaceholder', language)}
                className="w-full h-10 pl-4 pr-3 text-sm bg-[#F5F6FA] border border-[#E5E7EB] border-r-0 rounded-l-lg focus:outline-none focus:bg-white focus:border-[#F85606]"
              />
              <button
                type="submit"
                aria-label="Search"
                className="px-5 h-10 bg-[#F85606] hover:bg-[#E04A00] text-white rounded-r-lg inline-flex items-center justify-center transition-colors shrink-0"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Live Search Dropdown */}
            {searchFocused && (
              <div className="absolute left-0 right-0 top-11 bg-white border border-[#E5E7EB] rounded-lg shadow-xl z-50 p-4 space-y-3">
                {searchInput.trim() ? (
                  instantSuggestions.length > 0 ? (
                    <div className="divide-y divide-[#F5F6FA]">
                      {instantSuggestions.map((p) => (
                        <Link
                          key={p.id}
                          to={`/product/${p.slug}`}
                          onClick={() => {
                            addSearchHistory(getText(p.name, language));
                            setSearchFocused(false);
                          }}
                          className="py-2 flex items-center justify-between gap-3 hover:bg-[#F5F6FA] px-2 rounded"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-8 bg-[#F5F6FA] rounded overflow-hidden shrink-0">
                              <ResilientImage
                                src={p.images[0]}
                                alt={getText(p.name, language)}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-[#202124] truncate">
                                {getText(p.name, language)}
                              </p>
                              <p className="text-[11px] text-[#6B7280]">{p.brand}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#F85606] tabular-nums shrink-0">
                            {formatBDT(p.discountedPrice, language)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#6B7280] py-2">
                      {language === 'bn'
                        ? 'কোনো পণ্য পাওয়া যায়নি'
                        : 'No matching products found'}
                    </p>
                  )
                ) : (
                  <div className="space-y-3">
                    {searchHistory.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280] mb-1.5">
                          {language === 'bn' ? 'সাম্প্রতিক খোঁজ' : 'Recent Searches'}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {searchHistory.map((term) => (
                            <button
                              key={term}
                              type="button"
                              onClick={() => {
                                setSearchInput(term);
                                setSearchFocused(false);
                                navigate(`/search?q=${encodeURIComponent(term)}`);
                              }}
                              className="px-2.5 py-1 text-xs bg-[#F5F6FA] hover:bg-[#ECEEF4] rounded border border-[#E5E7EB]"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280] mb-1.5">
                        {language === 'bn' ? 'জনপ্রিয় ট্যাগ' : 'Popular in Bangladesh'}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {['Jamdani', 'Panjabi', '5G Phone', 'Laptop', 'Skincare', 'Sneakers'].map(
                          (tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                setSearchInput(tag);
                                setSearchFocused(false);
                                navigate(`/search?q=${encodeURIComponent(tag)}`);
                              }}
                              className="px-2.5 py-1 text-xs bg-[#FFF4EE] text-[#F85606] rounded border border-[#FED7AA]"
                            >
                              {tag}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label="Toggle language"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[38px] rounded-md border border-[#E5E7EB] hover:border-[#F85606] text-xs font-semibold text-[#172337] bg-[#F5F6FA] whitespace-nowrap"
            >
              <Globe className="w-3.5 h-3.5 text-[#F85606]" />
              <span>{language === 'bn' ? 'বাংলা | EN' : 'EN | বাংলা'}</span>
            </button>

            {/* Seller Center Shortcut (Desktop) */}
            <Link
              to="/seller/register"
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-md border border-[#E5E7EB] hover:border-[#172337] text-xs font-medium text-[#172337] whitespace-nowrap"
            >
              <Store className="w-3.5 h-3.5 text-[#F85606]" />
              <span>{language === 'bn' ? 'বিক্রেতা হোন' : 'Sell on Bazario'}</span>
            </Link>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative w-10 h-10 rounded-md hover:bg-[#F5F6FA] inline-flex items-center justify-center text-[#172337]"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#172337] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {formatNum(wishlist.length, language)}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              aria-label="Shopping Cart"
              className="relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[40px] rounded-md bg-[#FFF4EE] hover:bg-[#FFE6D6] text-[#F85606] font-semibold text-xs whitespace-nowrap"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">{t('cart', language)}</span>
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#F85606] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                {formatNum(cartCount, language)}
              </span>
            </Link>

            {/* Account Dropdown */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setAccountMenuOpen((o) => !o)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[40px] rounded-md hover:bg-[#F5F6FA] text-xs font-medium text-[#172337] whitespace-nowrap"
              >
                <User className="w-4 h-4" />
                <span>{t('account', language)}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {accountMenuOpen && (
                <div className="absolute right-0 top-11 w-52 bg-white border border-[#E5E7EB] rounded-lg shadow-xl py-1.5 z-50 text-xs">
                  <Link
                    to="/account"
                    className="block px-4 py-2 hover:bg-[#F5F6FA] font-medium text-[#202124]"
                  >
                    {language === 'bn' ? 'আমার ড্যাশবোর্ড' : 'My Dashboard'}
                  </Link>
                  <Link
                    to="/account/orders"
                    className="block px-4 py-2 hover:bg-[#F5F6FA] text-[#4B5563]"
                  >
                    {language === 'bn' ? 'আমার অর্ডারসমূহ' : 'My Orders'}
                  </Link>
                  <Link
                    to="/account/addresses"
                    className="block px-4 py-2 hover:bg-[#F5F6FA] text-[#4B5563]"
                  >
                    {language === 'bn' ? 'সংরক্ষিত ঠিকানা' : 'Saved Addresses'}
                  </Link>
                  <Link
                    to="/track-order"
                    className="block px-4 py-2 hover:bg-[#F5F6FA] text-[#4B5563]"
                  >
                    {t('trackOrder', language)}
                  </Link>
                  <div className="my-1 border-t border-[#E5E7EB]" />
                  <Link
                    to="/login"
                    className="block px-4 py-2 hover:bg-[#F5F6FA] text-[#F85606] font-medium"
                  >
                    {t('login', language)}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-3 pb-2.5">
          <form onSubmit={handleSearchSubmit} className="flex items-stretch">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('searchPlaceholder', language)}
              className="w-full h-9 pl-3 pr-2 text-xs bg-[#F5F6FA] border border-[#E5E7EB] border-r-0 rounded-l-md focus:outline-none focus:border-[#F85606]"
            />
            <button
              type="submit"
              aria-label="Search mobile"
              className="px-3.5 h-9 bg-[#F85606] text-white rounded-r-md inline-flex items-center justify-center"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Desktop Mega Menu Navigation Strip */}
        <div
          className="hidden lg:block border-t border-[#F1F3F5] bg-white relative"
          onMouseLeave={() => setMegaOpen(false)}
        >
          <div className="max-w-[1440px] mx-auto px-8 flex items-center gap-6 h-10 text-xs font-medium">
            <button
              type="button"
              onMouseEnter={() => setMegaOpen(true)}
              onClick={() => setMegaOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-[#172337] hover:text-[#F85606] font-semibold whitespace-nowrap shrink-0"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#F85606]" />
              <span>{t('navAllCats', language)}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            <span className="h-4 w-px bg-[#E5E7EB]" />

            <nav className="flex items-center gap-6 overflow-x-auto no-scrollbar">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-[#4B5563] hover:text-[#F85606] whitespace-nowrap shrink-0 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Interactive Mega Menu Flyout */}
          {megaOpen && activeMegaCategory && (
            <div className="absolute left-0 right-0 top-10 bg-white border-b border-[#E5E7EB] shadow-2xl z-50 animate-[fadeIn_140ms_ease-out]">
              <div className="max-w-[1440px] mx-auto px-8 py-6 grid grid-cols-12 gap-6">
                <div className="col-span-3 border-r border-[#F1F3F5] pr-4 space-y-1 max-h-72 overflow-y-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onMouseEnter={() => setHoveredCatSlug(cat.slug)}
                      onClick={() => {
                        setMegaOpen(false);
                        navigate(`/category/${cat.slug}`);
                      }}
                      className={`w-full px-3 py-2 rounded-md text-left text-xs font-medium flex items-center justify-between transition-colors ${
                        hoveredCatSlug === cat.slug
                          ? 'bg-[#FFF4EE] text-[#F85606]'
                          : 'text-[#202124] hover:bg-[#F5F6FA]'
                      }`}
                    >
                      <span>{getText(cat.name, language)}</span>
                      <span className="text-[10px] text-[#9CA3AF]">
                        ({cat.subcategories.length})
                      </span>
                    </button>
                  ))}
                </div>

                <div className="col-span-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                    {getText(activeMegaCategory.name, language)}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {activeMegaCategory.subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/category/${activeMegaCategory.slug}?sub=${sub.slug}`}
                        className="text-xs text-[#374151] hover:text-[#F85606] py-1"
                      >
                        {getText(sub.name, language)}
                      </Link>
                    ))}
                  </div>
                  <Link
                    to={`/category/${activeMegaCategory.slug}`}
                    className="inline-block pt-2 text-xs font-semibold text-[#F85606] hover:underline"
                  >
                    {language === 'bn' ? 'এই ক্যাটাগরির সব পণ্য দেখুন →' : 'View All in Category →'}
                  </Link>
                </div>

                <div className="col-span-5 grid grid-cols-2 gap-4">
                  {megaFeaturedProducts.map((prod) => (
                    <Link
                      key={prod.id}
                      to={`/product/${prod.slug}`}
                      className="border border-[#E5E7EB] rounded-lg overflow-hidden hover:border-[#F85606] transition-colors bg-[#F5F6FA]"
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                        <ResilientImage
                          src={prod.images[0]}
                          alt={getText(prod.name, language)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2.5 bg-white">
                        <p className="text-xs font-medium text-[#202124] truncate">
                          {getText(prod.name, language)}
                        </p>
                        <p className="text-xs font-bold text-[#F85606] mt-0.5 tabular-nums">
                          {formatBDT(prod.discountedPrice, language)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/45"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white h-full z-10 flex flex-col justify-between overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <BazarioLogo lang={language} compact />
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Close mobile menu"
                  className="w-10 h-10 flex items-center justify-center text-[#6B7280]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="py-3 space-y-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    className="flex items-center justify-between min-h-[42px] px-2 rounded text-sm font-medium text-[#202124] hover:bg-[#F5F6FA]"
                  >
                    <span>{getText(cat.name, language)}</span>
                  </Link>
                ))}
              </div>
              <div className="pt-3 border-t border-[#E5E7EB] space-y-1.5 text-sm">
                <Link
                  to="/track-order"
                  className="block py-2 px-2 rounded hover:bg-[#F5F6FA] font-medium"
                >
                  {t('trackOrder', language)}
                </Link>
                <Link
                  to="/seller/register"
                  className="block py-2 px-2 rounded hover:bg-[#F5F6FA] font-medium text-[#F85606]"
                >
                  {language === 'bn' ? 'সেলার হিসেবে যোগ দিন' : 'Become a Seller'}
                </Link>
                <Link
                  to="/support/faq"
                  className="block py-2 px-2 rounded hover:bg-[#F5F6FA]"
                >
                  {t('support', language)}
                </Link>
              </div>
            </div>
            <div className="p-4 border-t border-[#E5E7EB] bg-[#F5F6FA] space-y-2">
              <p className="text-[11px] font-semibold text-[#6B7280] uppercase">
                {t('demoRoleLabel', language)}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleSwitch('seller')}
                  className="min-h-[40px] px-3 rounded bg-[#172337] text-white text-xs font-medium"
                >
                  {t('sellerCenter', language)}
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSwitch('admin')}
                  className="min-h-[40px] px-3 rounded bg-white border border-[#E5E7EB] text-[#172337] text-xs font-medium"
                >
                  {t('adminPanel', language)}
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Routed Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#172337] text-white mt-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <BazarioLogo lang={language} darkText={false} />
            <p className="text-xs text-white/75 leading-relaxed">
              {language === 'bn' ? settings.taglineBn : settings.taglineEn}
            </p>
            <p className="text-xs text-white/60">{settings.demoNotice}</p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  showToast(
                    language === 'bn'
                      ? `হোয়াটসঅ্যাপ সাপোর্ট: ${settings.supportPhone}`
                      : `WhatsApp Demo Support: ${settings.supportPhone}`,
                    'info'
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-medium"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-medium"
              >
                <span>Facebook</span>
              </a>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <p className="font-semibold text-sm text-white">
              {language === 'bn' ? 'কাস্টমার কেয়ার' : 'Customer Care'}
            </p>
            <ul className="space-y-2 text-white/75">
              <li>
                <Link to="/support/contact" className="hover:text-[#F85606]">
                  {language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
                </Link>
              </li>
              <li>
                <Link to="/support/faq" className="hover:text-[#F85606]">
                  {language === 'bn' ? 'সচরাচর জিজ্ঞাসা (FAQ)' : 'FAQ & Help Center'}
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-[#F85606]">
                  {t('trackOrder', language)}
                </Link>
              </li>
              <li>
                <Link to="/support/shipping" className="hover:text-[#F85606]">
                  {language === 'bn' ? 'শিপিং পলিসি' : 'Shipping Policy'}
                </Link>
              </li>
              <li>
                <Link to="/support/returns" className="hover:text-[#F85606]">
                  {language === 'bn' ? 'রিটার্ন ও রিফান্ড পলিসি' : 'Return & Refund Policy'}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5 text-xs">
            <p className="font-semibold text-sm text-white">
              {language === 'bn' ? 'বাজারিও প্ল্যাটফর্ম' : 'BAZARIO Ecosystem'}
            </p>
            <ul className="space-y-2 text-white/75">
              <li>
                <Link to="/shop" className="hover:text-[#F85606]">
                  {language === 'bn' ? 'সকল পণ্য দেখুন' : 'Browse Marketplace'}
                </Link>
              </li>
              <li>
                <Link to="/seller/register" className="hover:text-[#F85606]">
                  {language === 'bn' ? 'সেলার রেজিস্ট্রেশন' : 'Become a Seller'}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleRoleSwitch('seller')}
                  className="hover:text-[#F85606]"
                >
                  {t('sellerCenter', language)}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleRoleSwitch('admin')}
                  className="hover:text-[#F85606]"
                >
                  {t('adminPanel', language)}
                </button>
              </li>
              <li>
                <Link to="/support/privacy" className="hover:text-[#F85606]">
                  {language === 'bn' ? 'প্রাইভেসি ও শর্তাবলী' : 'Privacy & Terms'}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3 text-xs">
            <p className="font-semibold text-sm text-white">
              {t('newsletterTitle', language)}
            </p>
            <p className="text-white/75">{t('newsletterSub', language)}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!footerEmail.includes('@')) return;
                showToast(
                  language === 'bn'
                    ? 'নিউজলেটার সাবস্ক্রিপশন সফল হয়েছে!'
                    : 'Subscribed to BAZARIO deals!'
                );
                setFooterEmail('');
              }}
              className="flex gap-1.5"
            >
              <input
                type="email"
                required
                value={footerEmail}
                onChange={(e) => setFooterEmail(e.target.value)}
                placeholder="email@example.com"
                className="flex-1 min-h-[38px] px-3 rounded bg-white/10 border border-white/15 text-white placeholder:text-white/50 focus:outline-none focus:border-[#F85606]"
              />
              <button
                type="submit"
                className="px-3.5 min-h-[38px] rounded bg-[#F85606] hover:bg-[#E04A00] text-white font-semibold shrink-0"
              >
                {language === 'bn' ? 'যুক্ত হোন' : 'Join'}
              </button>
            </form>
            <p className="text-[11px] text-white/60 pt-1">
              {settings.supportPhone} · {settings.supportEmail}
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 py-4 px-4 sm:px-6 lg:px-8 text-center text-[11px] text-white/60">
          © 2026 BAZARIO (বাজারিও) Bangladesh Demo Marketplace · Cash on Delivery · bKash · Nagad · Rocket · Cards
        </div>
      </footer>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav
        aria-label="Mobile quick navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] grid grid-cols-5 h-15"
      >
        <Link
          to="/"
          className={`flex flex-col items-center justify-center text-[10px] font-medium ${
            location.pathname === '/' ? 'text-[#F85606]' : 'text-[#4B5563]'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>{t('navHome', language)}</span>
        </Link>
        <Link
          to="/shop"
          className={`flex flex-col items-center justify-center text-[10px] font-medium ${
            location.pathname.startsWith('/shop') || location.pathname.startsWith('/category')
              ? 'text-[#F85606]'
              : 'text-[#4B5563]'
          }`}
        >
          <LayoutGrid className="w-5 h-5 mb-0.5" />
          <span>{language === 'bn' ? 'শপ' : 'Shop'}</span>
        </Link>
        <Link
          to="/cart"
          className={`relative flex flex-col items-center justify-center text-[10px] font-medium ${
            location.pathname === '/cart' ? 'text-[#F85606]' : 'text-[#4B5563]'
          }`}
        >
          <ShoppingCart className="w-5 h-5 mb-0.5" />
          <span>{t('cart', language)}</span>
          {cartCount > 0 && (
            <span className="absolute top-1.5 right-3.5 min-w-[16px] h-4 px-1 rounded-full bg-[#F85606] text-white text-[9px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
        <Link
          to="/track-order"
          className={`flex flex-col items-center justify-center text-[10px] font-medium ${
            location.pathname === '/track-order' ? 'text-[#F85606]' : 'text-[#4B5563]'
          }`}
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span>{language === 'bn' ? 'ট্র্যাক' : 'Track'}</span>
        </Link>
        <Link
          to="/account"
          className={`flex flex-col items-center justify-center text-[10px] font-medium ${
            location.pathname.startsWith('/account') ? 'text-[#F85606]' : 'text-[#4B5563]'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>{t('account', language)}</span>
        </Link>
      </nav>
    </div>
  );
};
