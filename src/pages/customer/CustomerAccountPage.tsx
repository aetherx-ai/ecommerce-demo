import React, { useState } from 'react';
import {
  Clock,
  Heart,
  LayoutDashboard,
  MapPin,
  Package,
  Plus,
  Settings,
  Trash2,
  User,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ProductCard } from '../../components/common/ProductCard';
import { useBazario } from '../../contexts/BazarioContext';
import { BD_DIVISIONS } from '../../data/bdLocations';
import { formatBDT, formatNum } from '../../utils/formatters';

export const CustomerAccountPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    language,
    customers,
    currentCustomerId,
    orders,
    products,
    wishlist,
    recentlyViewed,
    isLoggedIn,
    setIsLoggedIn,
    updateCustomerProfile,
    addCustomerAddress,
    deleteCustomerAddress,
    registerCustomer,
    toggleLanguage,
  } = useBazario();

  const currentCustomer = customers.find((c) => c.id === currentCustomerId) ?? customers[0];
  const customerOrders = orders.filter((o) => o.customerId === currentCustomer.id);

  // Determine active tab from path
  const path = location.pathname;
  const initialTab = path.includes('/wishlist')
    ? 'wishlist'
    : path.includes('/orders')
    ? 'orders'
    : path.includes('/addresses')
    ? 'addresses'
    : path.includes('/login') || path.includes('/register')
    ? 'auth'
    : 'dashboard';

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'profile' | 'orders' | 'wishlist' | 'addresses' | 'recent' | 'settings' | 'auth'
  >(initialTab);

  React.useEffect(() => {
    if (path === '/wishlist') setActiveTab('wishlist');
    else if (path === '/account/orders') setActiveTab('orders');
    else if (path === '/account/addresses') setActiveTab('addresses');
    else if (path === '/login' || path === '/register') setActiveTab('auth');
    else if (path === '/account') setActiveTab('dashboard');
  }, [path]);

  // Editable Profile state
  const [profName, setProfName] = useState(currentCustomer.name);
  const [profPhone, setProfPhone] = useState(currentCustomer.phone);
  const [profEmail, setProfEmail] = useState(currentCustomer.email);
  const [profCity, setProfCity] = useState(currentCustomer.city);

  // New Address state
  const [addrLabel, setAddrLabel] = useState('Home');
  const [addrDivision, setAddrDivision] = useState('Dhaka');
  const [addrDistrict, setAddrDistrict] = useState('Dhaka');
  const [addrUpazila, setAddrUpazila] = useState('Dhanmondi');
  const [addrArea, setAddrArea] = useState('');
  const [addrStreet, setAddrStreet] = useState('');

  // Auth form
  const [authMode, setAuthMode] = useState<'login' | 'register'>(
    path.includes('/register') ? 'register' : 'login'
  );
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));
  const recentProducts = recentlyViewed
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const pendingOrdersCount = customerOrders.filter(
    (o) => o.status !== 'Delivered' && o.status !== 'Cancelled'
  ).length;
  const completedOrdersCount = customerOrders.filter(
    (o) => o.status === 'Delivered'
  ).length;

  if (activeTab === 'auth') {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-8 space-y-5">
          <div className="flex border-b border-[#E5E7EB] pb-3 gap-4">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`text-sm font-bold pb-1 border-b-2 ${
                authMode === 'login'
                  ? 'border-[#F85606] text-[#F85606]'
                  : 'border-transparent text-[#6B7280]'
              }`}
            >
              {language === 'bn' ? 'লগইন (Demo)' : 'Sign In (Demo)'}
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`text-sm font-bold pb-1 border-b-2 ${
                authMode === 'register'
                  ? 'border-[#F85606] text-[#F85606]'
                  : 'border-transparent text-[#6B7280]'
              }`}
            >
              {language === 'bn' ? 'নতুন অ্যাকাউন্ট' : 'Register'}
            </button>
          </div>

          {authMode === 'login' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsLoggedIn(true);
                navigate('/account');
              }}
              className="space-y-4"
            >
              <p className="text-xs text-[#6B7280]">
                {language === 'bn'
                  ? 'ডেমো ক্রেতা হিসেবে প্রবেশ করুন অথবা রেজিস্ট্রেশন করুন।'
                  : 'Sign in with demo account credentials (simulated local session).'}
              </p>
              <input
                required
                defaultValue={currentCustomer.phone}
                placeholder="01711-000101"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5E7EB] rounded-lg"
              />
              <input
                type="password"
                required
                defaultValue="demo1234"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5E7EB] rounded-lg"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-[#F85606] text-white text-sm font-semibold rounded-lg"
              >
                {language === 'bn' ? 'লগইন করুন' : 'Continue to Account'}
              </button>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!regName.trim() || !regPhone.trim()) return;
                registerCustomer(regName.trim(), regPhone.trim(), regEmail.trim(), 'Dhaka');
                navigate('/account');
              }}
              className="space-y-3"
            >
              <input
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder={language === 'bn' ? 'পুরো নাম' : 'Full Name'}
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5E7EB] rounded-lg"
              />
              <input
                required
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="017XX-XXXXXX"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5E7EB] rounded-lg"
              />
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5E7EB] rounded-lg"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-[#F85606] text-white text-sm font-semibold rounded-lg"
              >
                {language === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Demo Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const sidebarLinks = [
    { id: 'dashboard' as const, label: language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard', icon: LayoutDashboard },
    { id: 'profile' as const, label: language === 'bn' ? 'আমার প্রোফাইল' : 'My Profile', icon: User },
    { id: 'orders' as const, label: language === 'bn' ? 'আমার অর্ডার' : 'My Orders', icon: Package },
    { id: 'wishlist' as const, label: language === 'bn' ? 'উইশলিস্ট' : 'My Wishlist', icon: Heart },
    { id: 'addresses' as const, label: language === 'bn' ? 'আমার ঠিকানা' : 'My Addresses', icon: MapPin },
    { id: 'recent' as const, label: language === 'bn' ? 'সম্প্রতি দেখা' : 'Recently Viewed', icon: Clock },
    { id: 'settings' as const, label: language === 'bn' ? 'সেটিংস' : 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside className="lg:col-span-3 bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-2">
          <div className="pb-3 border-b border-[#E5E7EB] px-2">
            <p className="text-sm font-bold text-[#172337]">{currentCustomer.name}</p>
            <p className="text-xs text-[#6B7280] font-mono">{currentCustomer.phone}</p>
          </div>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar">
            {sidebarLinks.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2.5 whitespace-nowrap shrink-0 ${
                    activeTab === item.id
                      ? 'bg-[#FFF4EE] text-[#F85606] font-semibold'
                      : 'text-[#4B5563] hover:bg-[#F5F6FA]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="lg:col-span-9 space-y-6">
          {activeTab === 'dashboard' && (
            <>
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
                <h1 className="text-xl font-bold text-[#172337]">
                  {language === 'bn'
                    ? `স্বাগতম, ${currentCustomer.name}`
                    : `Welcome back, ${currentCustomer.name}`}
                </h1>
                <p className="text-xs text-[#6B7280] mt-1">
                  {isLoggedIn
                    ? language === 'bn'
                      ? 'আপনার অর্ডার, ঠিকানা এবং উইশলিস্ট এক জায়গায় পরিচালনা করুন।'
                      : 'Manage your orders, saved addresses, and wishlist.'
                    : 'Demo guest mode'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                  <div className="p-4 rounded-lg bg-[#F5F6FA] border border-[#E5E7EB]">
                    <p className="text-xs text-[#6B7280]">
                      {language === 'bn' ? 'মোট অর্ডার' : 'Total Orders'}
                    </p>
                    <p className="text-2xl font-bold text-[#172337] mt-1 tabular-nums">
                      {formatNum(customerOrders.length, language)}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#FFF8F5] border border-[#FED7AA]">
                    <p className="text-xs text-[#6B7280]">
                      {language === 'bn' ? 'চলমান অর্ডার' : 'Pending / Active'}
                    </p>
                    <p className="text-2xl font-bold text-[#F85606] mt-1 tabular-nums">
                      {formatNum(pendingOrdersCount, language)}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0]">
                    <p className="text-xs text-[#6B7280]">
                      {language === 'bn' ? 'সম্পন্ন অর্ডার' : 'Completed'}
                    </p>
                    <p className="text-2xl font-bold text-[#16A34A] mt-1 tabular-nums">
                      {formatNum(completedOrdersCount, language)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
                <h2 className="text-base font-bold text-[#172337] mb-4">
                  {language === 'bn' ? 'সাম্প্রতিক অর্ডার' : 'Recent Orders'}
                </h2>
                <div className="divide-y divide-[#E5E7EB] text-xs">
                  {customerOrders.slice(0, 4).map((o) => (
                    <div key={o.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-mono font-bold text-[#172337]">#{o.id}</span>
                        <span className="text-[#6B7280] ml-2">{o.createdAt}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded bg-[#F5F6FA] font-medium">
                          {o.status}
                        </span>
                        <span className="font-bold text-[#F85606] tabular-nums">
                          {formatBDT(o.total, language)}
                        </span>
                        <Link
                          to={`/track-order?orderId=${o.id}&phone=${encodeURIComponent(o.phone)}`}
                          className="text-[#172337] underline font-medium"
                        >
                          {language === 'bn' ? 'ট্র্যাক' : 'Track'}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'profile' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateCustomerProfile({
                  name: profName,
                  phone: profPhone,
                  email: profEmail,
                  city: profCity,
                });
              }}
              className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4 max-w-xl"
            >
              <h2 className="text-lg font-bold text-[#172337]">
                {language === 'bn' ? 'প্রোফাইল তথ্য' : 'Edit Profile'}
              </h2>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-[#4B5563] mb-1">Name</label>
                  <input
                    value={profName}
                    onChange={(e) => setProfName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#4B5563] mb-1">Phone</label>
                  <input
                    value={profPhone}
                    onChange={(e) => setProfPhone(e.target.value)}
                    className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#4B5563] mb-1">Email</label>
                  <input
                    value={profEmail}
                    onChange={(e) => setProfEmail(e.target.value)}
                    className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#4B5563] mb-1">City</label>
                  <input
                    value={profCity}
                    onChange={(e) => setProfCity(e.target.value)}
                    className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#F85606] text-white text-xs font-semibold"
              >
                {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Profile'}
              </button>
            </form>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-[#172337]">
                {language === 'bn' ? 'আমার সকল অর্ডার' : 'My Order History'}
              </h2>
              <div className="divide-y divide-[#E5E7EB] text-xs">
                {customerOrders.map((o) => (
                  <div key={o.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-mono font-bold text-[#172337]">
                        #{o.id} · {o.paymentMethod}
                      </p>
                      <p className="text-[#6B7280]">
                        {o.items.length} items · {o.address.district} · {o.createdAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded bg-[#F5F6FA] font-semibold">
                        {o.status}
                      </span>
                      <span className="font-bold text-[#F85606] tabular-nums">
                        {formatBDT(o.total, language)}
                      </span>
                      <Link
                        to={`/track-order?orderId=${o.id}&phone=${encodeURIComponent(o.phone)}`}
                        className="px-3 py-1.5 rounded border border-[#E5E7EB] hover:border-[#F85606] font-medium"
                      >
                        {language === 'bn' ? 'ট্র্যাক' : 'Track'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#172337]">
                {language === 'bn' ? 'আমার উইশলিস্ট' : 'My Wishlist'} ({wishlistedProducts.length})
              </h2>
              {wishlistedProducts.length === 0 ? (
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-10 text-center text-sm text-[#6B7280]">
                  {language === 'bn' ? 'উইশলিস্ট খালি' : 'Your wishlist is empty'}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {wishlistedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-bold text-[#172337]">
                  {language === 'bn' ? 'সংরক্ষিত ঠিকানাসমূহ' : 'Saved Bangladesh Addresses'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentCustomer.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-4 rounded-lg border border-[#E5E7EB] flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#172337]">{addr.label}</span>
                        <p className="text-[#4B5563] mt-1">
                          {addr.streetAddress}, {addr.area}, {addr.upazila}, {addr.district}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteCustomerAddress(addr.id)}
                        aria-label="Delete address"
                        className="text-[#9CA3AF] hover:text-[#DC2626]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!addrArea.trim() || !addrStreet.trim()) return;
                    addCustomerAddress({
                      label: addrLabel,
                      recipientName: currentCustomer.name,
                      phone: currentCustomer.phone,
                      division: addrDivision,
                      district: addrDistrict,
                      upazila: addrUpazila,
                      area: addrArea,
                      streetAddress: addrStreet,
                      addressType: addrLabel === 'Office' ? 'Office' : 'Home',
                      isDefault: false,
                    });
                    setAddrArea('');
                    setAddrStreet('');
                  }}
                  className="pt-4 border-t border-[#E5E7EB] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs"
                >
                  <select
                    value={addrLabel}
                    onChange={(e) => setAddrLabel(e.target.value)}
                    className="px-3 py-2 border border-[#E5E7EB] rounded-lg bg-white"
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                  </select>
                  <select
                    value={addrDivision}
                    onChange={(e) => {
                      const d = BD_DIVISIONS.find((x) => x.name === e.target.value) ?? BD_DIVISIONS[0];
                      setAddrDivision(d.name);
                      setAddrDistrict(d.districts[0].name);
                      setAddrUpazila(d.districts[0].upazilas[0]);
                    }}
                    className="px-3 py-2 border border-[#E5E7EB] rounded-lg bg-white"
                  >
                    {BD_DIVISIONS.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <input
                    required
                    value={addrArea}
                    onChange={(e) => setAddrArea(e.target.value)}
                    placeholder="Area / Road"
                    className="px-3 py-2 border border-[#E5E7EB] rounded-lg"
                  />
                  <input
                    required
                    value={addrStreet}
                    onChange={(e) => setAddrStreet(e.target.value)}
                    placeholder="House / Flat Address"
                    className="sm:col-span-2 px-3 py-2 border border-[#E5E7EB] rounded-lg"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#172337] text-white font-semibold inline-flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'ঠিকানা যোগ' : 'Add Address'}</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'recent' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#172337]">
                {language === 'bn' ? 'সম্প্রতি দেখা পণ্য' : 'Recently Viewed'}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {recentProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4 max-w-lg text-xs">
              <h2 className="text-lg font-bold text-[#172337]">
                {language === 'bn' ? 'অ্যাকাউন্ট সেটিংস' : 'Account Preferences'}
              </h2>
              <div className="flex items-center justify-between py-2 border-b border-[#E5E7EB]">
                <span>{language === 'bn' ? 'ভাষা (Language)' : 'Interface Language'}</span>
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="px-3 py-1.5 rounded bg-[#172337] text-white font-semibold"
                >
                  {language === 'bn' ? 'বাংলা → English' : 'English → বাংলা'}
                </button>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>{language === 'bn' ? 'ডেমো সেশন' : 'Demo Session'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsLoggedIn(false);
                    navigate('/login');
                  }}
                  className="px-3 py-1.5 rounded border border-[#E5E7EB] text-[#DC2626] font-semibold"
                >
                  {language === 'bn' ? 'সাইন আউট' : 'Sign Out'}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
