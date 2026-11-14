import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Edit3,
  Eye,
  Package,
  Plus,
  RotateCcw,
  Search,
  ShoppingBag,
  Star,
  Store,
  Tag,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResilientImage } from '../../components/common/ResilientImage';
import { useBazario } from '../../contexts/BazarioContext';
import { BAZARIO_IMAGES } from '../../data/bazarioData';
import {
  Category,
  Coupon,
  Customer,
  HeroSlide,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  ProductStatus,
  SellerStatus,
} from '../../types/bazario';
import { formatBDT, formatNum, getText, slugify } from '../../utils/formatters';

const ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const statusPillClass = (status: OrderStatus): string => {
  switch (status) {
    case 'Delivered':
      return 'bg-[#DCFCE7] text-[#166534]';
    case 'Cancelled':
      return 'bg-[#FEE2E2] text-[#991B1B]';
    case 'Pending':
      return 'bg-[#FEF3C7] text-[#92400E]';
    case 'Shipped':
    case 'Out for Delivery':
      return 'bg-[#DBEAFE] text-[#1E40AF]';
    default:
      return 'bg-[#F3F4F6] text-[#172337]';
  }
};

/* ============================================================================
   1. ADMIN DASHBOARD OVERVIEW
============================================================================ */
export const AdminDashboardPage: React.FC = () => {
  const { language, orders, products, sellers, customers, categories } = useBazario();

  const validOrders = useMemo(
    () => orders.filter((o) => o.status !== 'Cancelled'),
    [orders]
  );
  const totalRevenue = useMemo(
    () => validOrders.reduce((s, o) => s + o.total, 0),
    [validOrders]
  );
  const avgOrderValue = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;
  const pendingOrders = orders.filter(
    (o) => o.status !== 'Delivered' && o.status !== 'Cancelled'
  ).length;
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;
  const pendingSellers = sellers.filter((s) => s.status === 'pending').length;
  const approvedSellers = sellers.filter((s) => s.status === 'approved').length;
  const pendingProducts = products.filter((p) => p.status === 'pending').length;
  const totalItemsSold = useMemo(
    () => products.reduce((s, p) => s + p.soldCount, 0),
    [products]
  );

  const revenueSeries = [
    { label: 'Sat', rev: Math.round(totalRevenue * 0.11), orders: 18 },
    { label: 'Sun', rev: Math.round(totalRevenue * 0.13), orders: 22 },
    { label: 'Mon', rev: Math.round(totalRevenue * 0.12), orders: 19 },
    { label: 'Tue', rev: Math.round(totalRevenue * 0.16), orders: 27 },
    { label: 'Wed', rev: Math.round(totalRevenue * 0.14), orders: 24 },
    { label: 'Thu', rev: Math.round(totalRevenue * 0.17), orders: 31 },
    { label: 'Fri', rev: Math.round(totalRevenue * 0.21), orders: 38 },
  ];
  const maxRev = Math.max(...revenueSeries.map((r) => r.rev), 1);
  const weeklySeriesTotal = revenueSeries.reduce((s, r) => s + r.rev, 0);

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const order of orders) {
      if (order.status === 'Cancelled') continue;
      for (const item of order.items) {
        const prod = products.find((p) => p.id === item.productId);
        const catSlug = prod?.categorySlug ?? 'electronics';
        map.set(catSlug, (map.get(catSlug) ?? 0) + item.unitPrice * item.quantity);
      }
    }
    return categories
      .map((c) => ({
        slug: c.slug,
        name: getText(c.name, language),
        revenue: map.get(c.slug) ?? 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [orders, products, categories, language]);

  const maxCatRev = Math.max(...categoryBreakdown.map((c) => c.revenue), 1);
  const totalCatRev = Math.max(
    categoryBreakdown.reduce((s, c) => s + c.revenue, 0),
    1
  );

  const topProducts = useMemo(
    () => [...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, 5),
    [products]
  );

  const topSellers = useMemo(
    () =>
      [...sellers]
        .filter((s) => s.status === 'approved')
        .sort((a, b) => b.totalSalesCount - a.totalSalesCount)
        .slice(0, 5),
    [sellers]
  );

  const kpis = [
    {
      label: language === 'bn' ? 'মোট রাজস্ব (GMV)' : 'Total Revenue',
      value: formatBDT(totalRevenue, language),
      sub: `${language === 'bn' ? 'গড় অর্ডার' : 'AOV'}: ${formatBDT(avgOrderValue, language)}`,
      accent: 'text-[#F85606]',
      iconBg: 'bg-[#FFF4EE] text-[#F85606]',
      icon: Banknote,
    },
    {
      label: language === 'bn' ? 'মোট অর্ডার' : 'Total Orders',
      value: formatNum(orders.length, language),
      sub: `${formatNum(deliveredOrders, language)} ${language === 'bn' ? 'ডেলিভার্ড' : 'delivered'}`,
      accent: 'text-[#172337]',
      iconBg: 'bg-[#EFF6FF] text-[#2563EB]',
      icon: ShoppingBag,
    },
    {
      label: language === 'bn' ? 'মোট গ্রাহক' : 'Total Customers',
      value: formatNum(customers.length, language),
      sub: language === 'bn' ? 'নিবন্ধিত ক্রেতা' : 'Registered buyers',
      accent: 'text-[#172337]',
      iconBg: 'bg-[#F5F3FF] text-[#7C3AED]',
      icon: Users,
    },
    {
      label: language === 'bn' ? 'মোট সেলার' : 'Total Sellers',
      value: formatNum(sellers.length, language),
      sub: `${formatNum(approvedSellers, language)} ${language === 'bn' ? 'সক্রিয় স্টোর' : 'active stores'}`,
      accent: 'text-[#172337]',
      iconBg: 'bg-[#ECFDF5] text-[#059669]',
      icon: Store,
    },
    {
      label: language === 'bn' ? 'মোট পণ্য' : 'Total Products',
      value: formatNum(products.length, language),
      sub:
        pendingProducts > 0
          ? `${formatNum(pendingProducts, language)} ${language === 'bn' ? 'অপেক্ষমাণ' : 'pending review'}`
          : language === 'bn'
          ? 'সব অনুমোদিত'
          : 'Catalog healthy',
      accent: 'text-[#172337]',
      iconBg: 'bg-[#F5F6FA] text-[#172337]',
      icon: Package,
    },
    {
      label: language === 'bn' ? 'চলমান অর্ডার' : 'Pending Orders',
      value: formatNum(pendingOrders, language),
      sub: language === 'bn' ? 'প্রসেসিং চলমান' : 'In fulfillment queue',
      accent: 'text-[#D97706]',
      iconBg: 'bg-[#FEF3C7] text-[#D97706]',
      icon: Clock,
    },
    {
      label: language === 'bn' ? 'সেলার আবেদন' : 'Pending Applications',
      value: formatNum(pendingSellers, language),
      sub: pendingSellers > 0 ? (language === 'bn' ? 'পর্যালোচনা প্রয়োজন' : 'Needs review') : language === 'bn' ? 'সব সম্পন্ন' : 'All reviewed',
      accent: pendingSellers > 0 ? 'text-[#F85606]' : 'text-[#16A34A]',
      iconBg: pendingSellers > 0 ? 'bg-[#FFF4EE] text-[#F85606]' : 'bg-[#DCFCE7] text-[#16A34A]',
      icon: UserCheck,
    },
    {
      label: language === 'bn' ? 'বিক্রিত ইউনিট' : 'Total Items Sold',
      value: formatNum(totalItemsSold, language),
      sub: language === 'bn' ? 'সর্বমোট বিক্রি' : 'Cumulative units',
      accent: 'text-[#16A34A]',
      iconBg: 'bg-[#DCFCE7] text-[#16A34A]',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      {pendingSellers > 0 && (
        <div className="bg-[#FFF4EE] border border-[#FED7AA] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-[#9A3412]">
            <AlertTriangle className="w-4 h-4 text-[#F85606] shrink-0" />
            <span>
              {language === 'bn'
                ? `${formatNum(pendingSellers, language)}টি নতুন সেলার আবেদন অনুমোদনের অপেক্ষায় আছে।`
                : `${pendingSellers} seller onboarding application(s) awaiting admin review.`}
            </span>
          </div>
          <Link
            to="/admin/seller-applications"
            className="px-3.5 py-1.5 rounded-lg bg-[#F85606] text-white text-xs font-semibold hover:bg-[#D94802] transition-colors"
          >
            {language === 'bn' ? 'আবেদন দেখুন' : 'Review Applications'}
          </Link>
        </div>
      )}

      {/* 8 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] rounded-xl p-3.5 sm:p-4 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] sm:text-xs font-medium text-[#6B7280] leading-snug">
                  {kpi.label}
                </p>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${kpi.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <p className={`text-lg sm:text-xl font-bold mt-1.5 tabular-nums ${kpi.accent}`}>
                {kpi.value}
              </p>
              <p className="text-[10px] sm:text-[11px] text-[#6B7280] mt-1 truncate">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        <div className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#172337] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#F85606]" />
                <span>
                  {language === 'bn' ? 'সাপ্তাহিক মার্কেটপ্লেস বিক্রয়' : 'Weekly Marketplace Revenue'}
                </span>
              </h2>
              <p className="text-[11px] text-[#6B7280] mt-0.5">
                {language === 'bn' ? 'গত ৭ দিনের মোট লেনদেন প্রবণতা' : '7-day marketplace GMV & order velocity'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-[#FFF4EE] text-[#F85606] text-[11px] font-bold tabular-nums">
                {formatBDT(weeklySeriesTotal, language)}
              </span>
              <span className="text-[11px] font-medium text-[#6B7280]">BDT</span>
            </div>
          </div>

          <div className="relative h-52 flex items-end gap-2 sm:gap-3 pt-6">
            {/* Horizontal gridlines */}
            <div className="pointer-events-none absolute inset-x-0 top-6 bottom-6 flex flex-col justify-between">
              <div className="border-t border-dashed border-[#E5E7EB]" />
              <div className="border-t border-dashed border-[#E5E7EB]" />
              <div className="border-t border-dashed border-[#E5E7EB]" />
            </div>

            {revenueSeries.map((d) => {
              const pct = Math.max(12, Math.round((d.rev / maxRev) * 100));
              return (
                <div key={d.label} className="group relative flex-1 flex flex-col items-center gap-1.5 z-10">
                  <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-[#172337] text-white text-[10px] font-semibold shadow-sm tabular-nums z-20">
                    {formatBDT(d.rev, language)} · {d.orders} ord
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-[#4B5563] tabular-nums truncate max-w-full">
                    {formatBDT(d.rev, language)}
                  </span>
                  <div className="w-full h-36 bg-[#F5F6FA]/80 rounded-lg flex items-end overflow-hidden p-0.5">
                    <div
                      className="w-full bg-gradient-to-t from-[#172337] to-[#2B3E5E] group-hover:from-[#F85606] group-hover:to-[#FF8A4C] transition-all rounded-t-md"
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-[#6B7280] group-hover:text-[#172337]">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#172337]">
              {language === 'bn' ? 'ক্যাটাগরি অনুযায়ী বিক্রয়' : 'Sales by Category'}
            </h2>
            <span className="text-[11px] text-[#6B7280]">
              {language === 'bn' ? 'শীর্ষ ৬' : 'Top 6'}
            </span>
          </div>
          <div className="space-y-3.5">
            {categoryBreakdown.map((cat) => {
              const barPct = Math.max(8, Math.round((cat.revenue / maxCatRev) * 100));
              const sharePct = Math.round((cat.revenue / totalCatRev) * 100);
              return (
                <div key={cat.slug} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-[#172337] truncate">{cat.name}</span>
                    <span className="font-semibold text-[#F85606] tabular-nums shrink-0">
                      {formatBDT(cat.revenue, language)}{' '}
                      <span className="text-[10px] font-medium text-[#9CA3AF]">({sharePct}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#F5F6FA] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#F85606] to-[#FF8A4C] rounded-full transition-all"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Products & Top Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#172337]">
              {language === 'bn' ? 'সেরা বিক্রিত পণ্য' : 'Top-Selling Products'}
            </h2>
            <Link to="/admin/products" className="text-xs font-semibold text-[#F85606] hover:underline">
              {language === 'bn' ? 'সব দেখুন' : 'View All'}
            </Link>
          </div>
          <div className="divide-y divide-[#E5E7EB]">
            {topProducts.map((p, idx) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 text-[11px] font-bold text-[#9CA3AF] tabular-nums shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F5F6FA] border border-[#E5E7EB] shrink-0">
                    <ResilientImage src={p.images[0]} alt={p.name.en} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#172337] truncate">
                      {getText(p.name, language)}
                    </p>
                    <p className="text-[11px] text-[#6B7280] tabular-nums">
                      {formatNum(p.soldCount, language)} {language === 'bn' ? 'বিক্রিত' : 'sold'} ·{' '}
                      <span className={p.stock <= 5 ? 'text-[#DC2626] font-semibold' : ''}>
                        Stock: {p.stock}
                      </span>
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#F85606] tabular-nums shrink-0">
                  {formatBDT(p.discountedPrice, language)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#172337]">
              {language === 'bn' ? 'শীর্ষ সেলার স্টোর' : 'Top-Performing Sellers'}
            </h2>
            <Link to="/admin/sellers" className="text-xs font-semibold text-[#F85606] hover:underline">
              {language === 'bn' ? 'সব দেখুন' : 'Manage'}
            </Link>
          </div>
          <div className="divide-y divide-[#E5E7EB]">
            {topSellers.map((s) => (
              <div key={s.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: s.bannerColor }}
                  >
                    {s.logoInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#172337] truncate flex items-center gap-1">
                      <span className="truncate">{s.storeName}</span>
                      {s.verified && <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />}
                    </p>
                    <p className="text-[11px] text-[#6B7280] truncate">{s.businessCategory}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-[#172337] tabular-nums">
                    {formatNum(s.totalSalesCount, language)} {language === 'bn' ? 'অর্ডার' : 'sales'}
                  </p>
                  <p className="text-[11px] text-[#F59E0B] font-semibold">★ {s.rating}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-[#172337]">
            {language === 'bn' ? 'সাম্প্রতিক লেনদেন ও অর্ডার' : 'Recent Marketplace Orders'}
          </h2>
          <Link to="/admin/orders" className="text-xs font-semibold text-[#F85606] hover:underline shrink-0">
            {language === 'bn' ? 'অর্ডার ম্যানেজমেন্ট →' : 'Manage Orders →'}
          </Link>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-[#E5E7EB]">
          {orders.slice(0, 6).map((o) => (
            <div key={o.id} className="p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-[#172337]">#{o.id}</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusPillClass(o.status)}`}>
                  {o.status}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-[#172337] truncate">{o.customerName}</p>
                  <p className="text-[11px] text-[#6B7280]">
                    {o.address.district} · {o.paymentMethod}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-[#F85606] tabular-nums">{formatBDT(o.total, language)}</p>
                  <p className="text-[10px] text-[#9CA3AF] tabular-nums">{o.createdAt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F6FA] border-b border-[#E5E7EB] text-[#6B7280]">
              <tr>
                <th className="px-4 py-3 font-semibold">Order ID</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {orders.slice(0, 6).map((o) => (
                <tr key={o.id} className="hover:bg-[#F9FAFB]">
                  <td className="px-4 py-3 font-mono font-bold text-[#172337]">#{o.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#172337]">{o.customerName}</p>
                    <p className="text-[11px] text-[#6B7280]">{o.address.district}</p>
                  </td>
                  <td className="px-4 py-3">{o.paymentMethod}</td>
                  <td className="px-4 py-3 font-bold text-[#F85606] tabular-nums">
                    {formatBDT(o.total, language)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusPillClass(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280] tabular-nums">{o.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   2. ADMIN PRODUCTS MODERATION
============================================================================ */
export const AdminProductsPage: React.FC = () => {
  const {
    language,
    products,
    categories,
    getSellerById,
    updateProductStatus,
    saveSellerProduct,
    deleteSellerProduct,
  } = useBazario();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProductStatus>('all');
  const [catFilter, setCatFilter] = useState('all');
  const [editing, setEditing] = useState<Product | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (catFilter !== 'all' && p.categorySlug !== catFilter) return false;
      if (!q) return true;
      return (
        p.name.en.toLowerCase().includes(q) ||
        p.name.bn.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    });
  }, [products, query, statusFilter, catFilter]);

  const openEdit = (p: Product) => {
    setEditing(p);
    setEditPrice(String(p.discountedPrice));
    setEditStock(String(p.stock));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#172337]">
            {language === 'bn' ? 'পণ্য মডারেশন ও ক্যাটালগ' : 'Marketplace Product Moderation'}
          </h1>
          <p className="text-xs text-[#6B7280]">
            {filtered.length} {language === 'bn' ? 'টি পণ্য' : 'products listed'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={language === 'bn' ? 'পণ্য বা SKU খুঁজুন...' : 'Search product or SKU...'}
              className="pl-8 pr-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-lg w-full sm:w-52 focus:outline-none focus:border-[#F85606]"
            />
          </div>
          <div className="grid grid-cols-2 sm:flex gap-2">
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-lg min-w-0"
            >
              <option value="all">{language === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {getText(c.name, language)}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | ProductStatus)}
              className="px-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-lg min-w-0"
            >
              <option value="all">{language === 'bn' ? 'সকল স্ট্যাটাস' : 'All Statuses'}</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-2.5">
        {filtered.map((p) => {
          const seller = getSellerById(p.sellerId);
          return (
            <div key={p.id} className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#F5F6FA] border border-[#E5E7EB] shrink-0">
                  <ResilientImage src={p.images[0]} alt={p.name.en} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#172337] line-clamp-2">{getText(p.name, language)}</p>
                  <p className="text-[11px] text-[#6B7280] truncate mt-0.5">
                    {seller?.storeName ?? 'Unknown'} · <span className="font-mono">{p.sku}</span>
                  </p>
                  <div className="flex items-center gap-2.5 mt-1.5">
                    <span className="font-bold text-[#F85606] tabular-nums">
                      {formatBDT(p.discountedPrice, language)}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums ${
                        p.stock === 0
                          ? 'bg-[#FEE2E2] text-[#991B1B]'
                          : p.stock <= 5
                          ? 'bg-[#FEF3C7] text-[#92400E]'
                          : 'bg-[#F5F6FA] text-[#4B5563]'
                      }`}
                    >
                      Stock: {p.stock}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-[#E5E7EB] flex items-center justify-between gap-2">
                <select
                  value={p.status}
                  onChange={(e) => updateProductStatus(p.id, e.target.value as ProductStatus)}
                  className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold border border-[#E5E7EB] ${
                    p.status === 'approved'
                      ? 'bg-[#DCFCE7] text-[#166534]'
                      : p.status === 'pending'
                      ? 'bg-[#FEF3C7] text-[#92400E]'
                      : 'bg-[#FEE2E2] text-[#991B1B]'
                  }`}
                >
                  <option value="approved">approved</option>
                  <option value="pending">pending</option>
                  <option value="rejected">rejected</option>
                </select>
                <div className="flex items-center gap-1.5">
                  {p.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => updateProductStatus(p.id, 'approved')}
                      className="p-1.5 rounded-md bg-[#DCFCE7] text-[#166534]"
                      title="Approve product"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    className="p-1.5 rounded-md border border-[#E5E7EB] hover:border-[#172337]"
                    title="Edit price/stock"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSellerProduct(p.id)}
                    className="p-1.5 rounded-md border border-[#E5E7EB] text-[#DC2626] hover:bg-[#FEE2E2]"
                    title="Delete product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white border border-[#E5E7EB] rounded-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F5F6FA] border-b border-[#E5E7EB] text-[#6B7280]">
            <tr>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Seller</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {filtered.map((p) => {
              const seller = getSellerById(p.sellerId);
              return (
                <tr key={p.id} className="hover:bg-[#F9FAFB]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F5F6FA] border border-[#E5E7EB] shrink-0">
                        <ResilientImage src={p.images[0]} alt={p.name.en} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#172337] line-clamp-1 max-w-[230px]">
                          {getText(p.name, language)}
                        </p>
                        <p className="text-[11px] font-mono text-[#6B7280]">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#4B5563]">{seller?.storeName ?? 'Unknown'}</td>
                  <td className="px-4 py-3 font-bold text-[#F85606] tabular-nums">
                    {formatBDT(p.discountedPrice, language)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        p.stock === 0
                          ? 'text-[#DC2626]'
                          : p.stock <= 5
                          ? 'text-[#D97706]'
                          : 'text-[#172337]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          p.stock === 0 ? 'bg-[#DC2626]' : p.stock <= 5 ? 'bg-[#F59E0B]' : 'bg-[#16A34A]'
                        }`}
                      />
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={p.status}
                      onChange={(e) => updateProductStatus(p.id, e.target.value as ProductStatus)}
                      className={`px-2 py-1 rounded text-[11px] font-semibold border border-[#E5E7EB] ${
                        p.status === 'approved'
                          ? 'bg-[#DCFCE7] text-[#166534]'
                          : p.status === 'pending'
                          ? 'bg-[#FEF3C7] text-[#92400E]'
                          : 'bg-[#FEE2E2] text-[#991B1B]'
                      }`}
                    >
                      <option value="approved">approved</option>
                      <option value="pending">pending</option>
                      <option value="rejected">rejected</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {p.status !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => updateProductStatus(p.id, 'approved')}
                          className="p-1.5 rounded border border-[#BBF7D0] bg-[#DCFCE7] text-[#166534] hover:bg-[#BBF7D0]"
                          title="Quick Approve"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {p.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => updateProductStatus(p.id, 'rejected')}
                          className="p-1.5 rounded border border-[#FECACA] bg-[#FEE2E2] text-[#991B1B] hover:bg-[#FECACA]"
                          title="Quick Reject"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded border border-[#E5E7EB] hover:border-[#172337]"
                        title="Edit price/stock"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSellerProduct(p.id)}
                        className="p-1.5 rounded border border-[#E5E7EB] text-[#DC2626] hover:bg-[#FEE2E2]"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full max-h-[90vh] overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#172337]">Edit Product Price & Stock</h3>
              <button type="button" onClick={() => setEditing(null)}>
                <X className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>
            <p className="text-xs font-medium text-[#4B5563]">{getText(editing.name, language)}</p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Sale Price (৳)</label>
                <input
                  type="number"
                  min={1}
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Stock Quantity</label>
                <input
                  type="number"
                  min={0}
                  value={editStock}
                  onChange={(e) => setEditStock(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-3.5 py-2 rounded-lg border border-[#E5E7EB] text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextPrice = Math.max(1, Number(editPrice) || editing.discountedPrice);
                  const nextStock = Math.max(0, Number(editStock) || 0);
                  const reg = Math.max(editing.regularPrice, nextPrice);
                  const discPct = reg > nextPrice ? Math.round(((reg - nextPrice) / reg) * 100) : 0;
                  saveSellerProduct({
                    ...editing,
                    discountedPrice: nextPrice,
                    regularPrice: reg,
                    discountPercent: discPct,
                    stock: nextStock,
                  });
                  setEditing(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#F85606] text-white text-xs font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   3. ADMIN CATEGORIES MANAGEMENT
============================================================================ */
export const AdminCategoriesPage: React.FC = () => {
  const { language, categories, products, saveCategory } = useBazario();
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [subNameEn, setSubNameEn] = useState('');
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim()) return;
    if (editingCat) {
      saveCategory({
        ...editingCat,
        name: { bn: nameBn.trim() || nameEn.trim(), en: nameEn.trim() },
      });
      setEditingCat(null);
    } else {
      const slug = slugify(nameEn);
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        slug,
        name: { bn: nameBn.trim() || nameEn.trim(), en: nameEn.trim() },
        iconName: 'Package',
        image: BAZARIO_IMAGES.homeKitchen,
        subcategories: subNameEn.trim()
          ? [
              {
                id: `sub-${Date.now()}`,
                slug: slugify(subNameEn),
                name: { bn: subNameEn.trim(), en: subNameEn.trim() },
              },
            ]
          : [],
      };
      saveCategory(newCat);
    }
    setNameBn('');
    setNameEn('');
    setSubNameEn('');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold text-[#172337]">
        {language === 'bn' ? 'ক্যাটাগরি ম্যানেজমেন্ট' : 'Categories & Subcategories'}
      </h1>

      <form onSubmit={handleSave} className="bg-white border border-[#E5E7EB] rounded-xl p-5 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <input
          required
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          placeholder="Category Name (English)"
          className="px-3 py-2 border border-[#E5E7EB] rounded-lg"
        />
        <input
          value={nameBn}
          onChange={(e) => setNameBn(e.target.value)}
          placeholder="ক্যাটাগরি নাম (বাংলা)"
          className="px-3 py-2 border border-[#E5E7EB] rounded-lg"
        />
        {!editingCat && (
          <input
            value={subNameEn}
            onChange={(e) => setSubNameEn(e.target.value)}
            placeholder="Initial Subcategory (optional)"
            className="px-3 py-2 border border-[#E5E7EB] rounded-lg"
          />
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 rounded-lg bg-[#F85606] text-white font-semibold inline-flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{editingCat ? 'Update' : language === 'bn' ? 'ক্যাটাগরি যোগ' : 'Add Category'}</span>
          </button>
          {editingCat && (
            <button
              type="button"
              onClick={() => {
                setEditingCat(null);
                setNameBn('');
                setNameEn('');
              }}
              className="px-3 py-2 rounded-lg border border-[#E5E7EB]"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const count = products.filter((p) => p.categorySlug === cat.slug).length;
          return (
            <div key={cat.id} className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex gap-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#F5F6FA] shrink-0">
                <ResilientImage src={cat.image} alt={cat.name.en} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-[#172337]">{getText(cat.name, language)}</h3>
                    <p className="text-[11px] font-mono text-[#6B7280]">/{cat.slug} · {count} items</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCat(cat);
                      setNameBn(cat.name.bn);
                      setNameEn(cat.name.en);
                    }}
                    className="p-1.5 rounded border border-[#E5E7EB] text-[#4B5563] hover:text-[#172337]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {cat.subcategories.map((sub) => (
                    <span
                      key={sub.id}
                      className="px-2 py-0.5 rounded bg-[#F5F6FA] text-[10px] text-[#4B5563]"
                    >
                      {getText(sub.name, language)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
   4. ADMIN SELLERS DIRECTORY & SELLER APPLICATIONS
============================================================================ */
export const AdminSellersPage: React.FC = () => {
  const { language, sellers, products, updateSellerStatus, setActiveSellerId, setRole } = useBazario();
  const [filter, setFilter] = useState<'all' | SellerStatus>('all');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sellers.filter((s) => {
      if (filter !== 'all' && s.status !== filter) return false;
      if (!q) return true;
      return (
        s.storeName.toLowerCase().includes(q) ||
        s.ownerName.toLowerCase().includes(q) ||
        s.businessCategory.toLowerCase().includes(q)
      );
    });
  }, [sellers, filter, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#172337]">
            {language === 'bn' ? 'সকল সেলার ম্যানেজমেন্ট' : 'Marketplace Sellers'}
          </h1>
          <p className="text-xs text-[#6B7280]">{visible.length} stores</p>
        </div>
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={language === 'bn' ? 'স্টোর বা মালিক খুঁজুন...' : 'Search store or owner...'}
            className="pl-8 pr-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-lg w-full focus:outline-none focus:border-[#F85606]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs overflow-x-auto no-scrollbar pb-1">
        {(['all', 'approved', 'pending', 'suspended', 'rejected'] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilter(st)}
            className={`px-3 py-1.5 rounded-lg capitalize font-medium border whitespace-nowrap shrink-0 transition-colors ${
              filter === st
                ? 'bg-[#172337] text-white border-[#172337]'
                : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:border-[#172337]'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visible.map((s) => {
          const prodCount = products.filter((p) => p.sellerId === s.id).length;
          return (
            <div key={s.id} className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl text-white font-bold flex items-center justify-center shrink-0"
                    style={{ backgroundColor: s.bannerColor }}
                  >
                    {s.logoInitials}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#172337] flex items-center gap-1.5">
                      <span>{s.storeName}</span>
                      {s.verified && <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />}
                    </h3>
                    <p className="text-xs text-[#6B7280]">
                      {s.ownerName} · {s.businessCategory}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                    s.status === 'approved'
                      ? 'bg-[#DCFCE7] text-[#166534]'
                      : s.status === 'pending'
                      ? 'bg-[#FEF3C7] text-[#92400E]'
                      : 'bg-[#FEE2E2] text-[#991B1B]'
                  }`}
                >
                  {s.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs bg-[#F5F6FA] rounded-lg p-2.5 text-center">
                <div>
                  <p className="text-[10px] text-[#6B7280]">Products</p>
                  <p className="font-bold text-[#172337] tabular-nums">{prodCount}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#6B7280]">Total Sales</p>
                  <p className="font-bold text-[#172337] tabular-nums">{s.totalSalesCount}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#6B7280]">Rating</p>
                  <p className="font-bold text-[#F59E0B]">★ {s.rating}</p>
                </div>
              </div>

              <div className="text-[11px] text-[#6B7280] space-y-0.5">
                <p>{s.phone} · {s.email}</p>
                <p>{s.address}</p>
              </div>

              <div className="pt-2 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  {s.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => updateSellerStatus(s.id, 'approved')}
                      className="px-2.5 py-1.5 rounded-lg bg-[#16A34A] text-white font-semibold"
                    >
                      Approve
                    </button>
                  )}
                  {s.status === 'approved' && (
                    <button
                      type="button"
                      onClick={() => updateSellerStatus(s.id, 'suspended')}
                      className="px-2.5 py-1.5 rounded-lg bg-[#FEE2E2] text-[#991B1B] font-semibold"
                    >
                      Suspend
                    </button>
                  )}
                  {s.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => updateSellerStatus(s.id, 'rejected')}
                      className="px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] text-[#DC2626] font-semibold"
                    >
                      Reject
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <Link
                    to={`/store/${s.slug}`}
                    onClick={() => setRole('customer')}
                    className="px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] hover:border-[#172337] font-medium"
                  >
                    Storefront
                  </Link>
                  <Link
                    to="/seller"
                    onClick={() => {
                      setActiveSellerId(s.id);
                      setRole('seller');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#172337] text-white font-medium"
                  >
                    Open Seller Hub
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const AdminSellerApplicationsPage: React.FC = () => {
  const { language, sellers, updateSellerStatus } = useBazario();
  const pending = sellers.filter((s) => s.status === 'pending');
  const reviewed = sellers.filter((s) => s.status !== 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-[#172337]">
          {language === 'bn' ? 'সেলার অনবোর্ডিং আবেদনসমূহ' : 'Seller Onboarding Applications'}
        </h1>
        <p className="text-xs text-[#6B7280]">
          {language === 'bn'
            ? 'নতুন সেলার অনুমোদন করলে তারা সাথে সাথে বাজারিওতে পণ্য প্রকাশ করতে পারবেন।'
            : 'Approved sellers immediately gain permission to publish products on BAZARIO.'}
        </p>
      </div>

      {pending.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-10 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto" />
          <p className="text-sm font-semibold text-[#172337]">
            {language === 'bn' ? 'কোনো পেন্ডিং আবেদন নেই' : 'All seller applications reviewed!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((s) => (
            <div key={s.id} className="bg-white border-2 border-[#FDBA74] rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-[#F85606]" />
                  <h3 className="text-sm font-bold text-[#172337]">{s.storeName}</h3>
                  <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] text-[10px] font-bold">
                    Pending Review
                  </span>
                </div>
                <p className="text-xs text-[#4B5563]">
                  Owner: <strong>{s.ownerName}</strong> · Category: {s.businessCategory}
                </p>
                <p className="text-xs text-[#6B7280]">
                  {s.phone} · {s.email} · {s.address}
                </p>
                <p className="text-xs text-[#4B5563] italic">{getText(s.description, language)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateSellerStatus(s.id, 'approved')}
                  className="px-4 py-2 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'bn' ? 'অনুমোদন দিন' : 'Approve Seller'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateSellerStatus(s.id, 'rejected')}
                  className="px-4 py-2 rounded-lg border border-[#E5E7EB] hover:bg-[#FEE2E2] text-[#DC2626] text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>{language === 'bn' ? 'বাতিল' : 'Reject'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
        <h2 className="text-sm font-bold text-[#172337] mb-3">
          {language === 'bn' ? 'পূর্বের সিদ্ধান্তসমূহ' : 'Previously Reviewed Sellers'}
        </h2>
        <div className="divide-y divide-[#E5E7EB] text-xs">
          {reviewed.map((s) => (
            <div key={s.id} className="py-2.5 flex items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-[#172337]">{s.storeName}</span>
                <span className="text-[#6B7280]"> · {s.ownerName} · Joined {s.joinedAt}</span>
              </div>
              <span className="capitalize font-semibold">{s.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   5. ADMIN ORDERS MANAGEMENT
============================================================================ */
export const AdminOrdersPage: React.FC = () => {
  const { language, orders, updateOrderStatus } = useBazario();
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [query, setQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.includes(q)
      );
    });
  }, [orders, statusFilter, query]);

  const exportCsv = () => {
    const rows = [
      ['OrderID', 'Customer', 'Phone', 'District', 'Payment', 'Total', 'Status', 'CreatedAt'].join(','),
      ...filtered.map((o) =>
        [
          o.id,
          `"${o.customerName}"`,
          o.phone,
          o.address.district,
          o.paymentMethod,
          o.total,
          o.status,
          o.createdAt,
        ].join(',')
      ),
    ].join('\n');
    const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bazario-orders-demo.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#172337]">
            {language === 'bn' ? 'অর্ডার ম্যানেজমেন্ট' : 'Marketplace Orders'}
          </h1>
          <p className="text-xs text-[#6B7280]">{filtered.length} orders</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Order ID, name, phone..."
              className="pl-8 pr-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-lg w-full sm:w-52 focus:outline-none focus:border-[#F85606]"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | OrderStatus)}
              className="flex-1 sm:flex-initial px-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-lg"
            >
              <option value="all">All Statuses</option>
              {ORDER_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={exportCsv}
              className="px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-xs font-semibold text-[#172337] inline-flex items-center gap-1.5 hover:border-[#F85606] shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Status Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-lg border font-medium whitespace-nowrap shrink-0 ${
            statusFilter === 'all'
              ? 'bg-[#172337] text-white border-[#172337]'
              : 'bg-white text-[#4B5563] border-[#E5E7EB]'
          }`}
        >
          All ({orders.length})
        </button>
        {ORDER_STATUSES.map((st) => {
          const count = orders.filter((o) => o.status === st).length;
          return (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg border font-medium whitespace-nowrap shrink-0 ${
                statusFilter === st
                  ? 'bg-[#F85606] text-white border-[#F85606]'
                  : 'bg-white text-[#4B5563] border-[#E5E7EB]'
              }`}
            >
              {st} ({count})
            </button>
          );
        })}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-2.5">
        {filtered.map((o) => (
          <div key={o.id} className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="font-mono font-bold text-[#172337]">#{o.id}</span>
                <span className="text-[11px] text-[#9CA3AF] ml-2">{o.createdAt}</span>
              </div>
              <span className="font-bold text-[#F85606] tabular-nums">{formatBDT(o.total, language)}</span>
            </div>
            <div>
              <p className="font-semibold text-[#172337]">{o.customerName}</p>
              <p className="text-[11px] text-[#6B7280]">
                {o.phone} · {o.address.upazila}, {o.address.district} · {o.paymentMethod}
              </p>
            </div>
            <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between gap-2">
              <select
                value={o.status}
                onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold border border-[#E5E7EB] ${statusPillClass(o.status)}`}
              >
                {ORDER_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setSelectedOrder(o)}
                className="px-3 py-1.5 rounded-md border border-[#E5E7EB] font-semibold text-[#172337] inline-flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'বিস্তারিত' : 'Inspect'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white border border-[#E5E7EB] rounded-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F5F6FA] border-b border-[#E5E7EB] text-[#6B7280]">
            <tr>
              <th className="px-4 py-3 font-semibold">Order ID</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Location</th>
              <th className="px-4 py-3 font-semibold">Payment</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {filtered.map((o) => (
              <tr key={o.id} className="hover:bg-[#F9FAFB]">
                <td className="px-4 py-3 font-mono font-bold text-[#172337]">#{o.id}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-[#172337]">{o.customerName}</p>
                  <p className="text-[11px] font-mono text-[#6B7280]">{o.phone}</p>
                </td>
                <td className="px-4 py-3 text-[#4B5563]">
                  {o.address.upazila}, {o.address.district}
                </td>
                <td className="px-4 py-3">{o.paymentMethod}</td>
                <td className="px-4 py-3 font-bold text-[#F85606] tabular-nums">
                  {formatBDT(o.total, language)}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={o.status}
                    onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                    className={`px-2 py-1 rounded text-[11px] font-semibold border border-[#E5E7EB] ${statusPillClass(o.status)}`}
                  >
                    {ORDER_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(o)}
                    className="p-1.5 rounded border border-[#E5E7EB] hover:border-[#F85606]"
                    aria-label="Inspect order"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[88vh] overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#172337] font-mono">
                  Order #{selectedOrder.id}
                </h3>
                <p className="text-[#6B7280]">{selectedOrder.createdAt}</p>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)}>
                <X className="w-5 h-5 text-[#6B7280]" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F5F6FA] p-3.5 rounded-xl">
              <div>
                <p className="text-[#6B7280]">Customer</p>
                <p className="font-semibold text-[#172337]">{selectedOrder.customerName}</p>
                <p className="font-mono">{selectedOrder.phone}</p>
              </div>
              <div>
                <p className="text-[#6B7280]">Delivery Address</p>
                <p className="text-[#172337]">
                  {selectedOrder.address.streetAddress}, {selectedOrder.address.area},{' '}
                  {selectedOrder.address.upazila}, {selectedOrder.address.district}
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#E5E7EB]">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={item.image} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-[#172337] truncate">
                        {getText(item.productName, language)}
                      </p>
                      <p className="text-[#6B7280]">
                        {item.color} / {item.size} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold tabular-nums shrink-0">
                    {formatBDT(item.unitPrice * item.quantity, language)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E5E7EB] pt-3 space-y-1">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Subtotal</span>
                <span className="tabular-nums">{formatBDT(selectedOrder.subtotal, language)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Delivery ({selectedOrder.deliveryMethod})</span>
                <span className="tabular-nums">{formatBDT(selectedOrder.deliveryCharge, language)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-[#16A34A]">
                  <span>Discount ({selectedOrder.couponCode})</span>
                  <span className="tabular-nums">-{formatBDT(selectedOrder.discount, language)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-[#172337] pt-1">
                <span>Total ({selectedOrder.paymentMethod})</span>
                <span className="text-[#F85606] tabular-nums">{formatBDT(selectedOrder.total, language)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   6. ADMIN CUSTOMERS DIRECTORY
============================================================================ */
export const AdminCustomersPage: React.FC = () => {
  const { language, customers, orders } = useBazario();
  const [selected, setSelected] = useState<Customer | null>(null);
  const [query, setQuery] = useState('');

  const filteredCustomers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }, [customers, query]);

  const totalCustomerSpend = useMemo(
    () => customers.reduce((s, c) => s + c.totalSpent, 0),
    [customers]
  );
  const totalCustomerOrders = useMemo(
    () => customers.reduce((s, c) => s + c.totalOrders, 0),
    [customers]
  );

  const selectedOrders = useMemo(
    () => (selected ? orders.filter((o) => o.customerId === selected.id) : []),
    [selected, orders]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#172337]">
            {language === 'bn' ? 'গ্রাহক তালিকা' : 'Marketplace Customers'} ({filteredCustomers.length})
          </h1>
          <p className="text-xs text-[#6B7280]">
            {language === 'bn' ? 'ক্রেতা ডিরেক্টরি ও ক্রয় ইতিহাস' : 'Customer directory & lifetime purchase history'}
          </p>
        </div>
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={language === 'bn' ? 'নাম, ফোন বা শহর...' : 'Search name, phone, city...'}
            className="pl-8 pr-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-lg w-full focus:outline-none focus:border-[#F85606]"
          />
        </div>
      </div>

      {/* Customer Summary Strip */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 sm:p-4">
          <p className="text-[11px] text-[#6B7280]">{language === 'bn' ? 'মোট গ্রাহক' : 'Customers'}</p>
          <p className="text-base sm:text-xl font-bold text-[#172337] mt-0.5 tabular-nums">
            {formatNum(customers.length, language)}
          </p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 sm:p-4">
          <p className="text-[11px] text-[#6B7280]">{language === 'bn' ? 'মোট অর্ডার' : 'Total Orders'}</p>
          <p className="text-base sm:text-xl font-bold text-[#172337] mt-0.5 tabular-nums">
            {formatNum(totalCustomerOrders, language)}
          </p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 sm:p-4">
          <p className="text-[11px] text-[#6B7280]">{language === 'bn' ? 'মোট খরচ' : 'Lifetime Spend'}</p>
          <p className="text-base sm:text-xl font-bold text-[#F85606] mt-0.5 tabular-nums truncate">
            {formatBDT(totalCustomerSpend, language)}
          </p>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-2.5">
        {filteredCustomers.map((c) => (
          <div key={c.id} className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-[#172337] truncate">{c.name}</p>
                <p className="text-[11px] font-mono text-[#6B7280]">{c.phone} · {c.city}</p>
                <p className="text-[11px] text-[#6B7280] truncate">{c.email}</p>
              </div>
              <span className="font-bold text-[#F85606] tabular-nums shrink-0">
                {formatBDT(c.totalSpent, language)}
              </span>
            </div>
            <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
              <span className="text-[11px] text-[#6B7280] tabular-nums">
                {c.totalOrders} orders
              </span>
              <button
                type="button"
                onClick={() => setSelected(c)}
                className="px-3 py-1.5 rounded-md border border-[#E5E7EB] hover:border-[#F85606] font-semibold text-[#172337]"
              >
                History
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white border border-[#E5E7EB] rounded-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F5F6FA] border-b border-[#E5E7EB] text-[#6B7280]">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">City</th>
              <th className="px-4 py-3 font-semibold">Orders</th>
              <th className="px-4 py-3 font-semibold">Total Spent</th>
              <th className="px-4 py-3 font-semibold text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {filteredCustomers.map((c) => (
              <tr key={c.id} className="hover:bg-[#F9FAFB]">
                <td className="px-4 py-3 font-semibold text-[#172337]">{c.name}</td>
                <td className="px-4 py-3 font-mono">{c.phone}</td>
                <td className="px-4 py-3 text-[#4B5563]">{c.email}</td>
                <td className="px-4 py-3">{c.city}</td>
                <td className="px-4 py-3 tabular-nums">{c.totalOrders}</td>
                <td className="px-4 py-3 font-bold text-[#F85606] tabular-nums">
                  {formatBDT(c.totalSpent, language)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setSelected(c)}
                    className="px-2.5 py-1 rounded border border-[#E5E7EB] hover:border-[#F85606] font-medium"
                  >
                    History
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#172337]">{selected.name}</h3>
                <p className="text-[#6B7280]">{selected.phone} · {selected.city}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {selectedOrders.length === 0 ? (
                <p className="text-[#6B7280] py-4 text-center">No recent orders in current view</p>
              ) : (
                selectedOrders.map((o) => (
                  <div key={o.id} className="p-3 rounded-lg bg-[#F5F6FA] flex items-center justify-between">
                    <div>
                      <p className="font-mono font-bold text-[#172337]">#{o.id}</p>
                      <p className="text-[#6B7280]">{o.createdAt} · {o.paymentMethod}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#F85606] tabular-nums">{formatBDT(o.total, language)}</p>
                      <p className="text-[11px] font-semibold">{o.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   7. ADMIN PAYMENTS & TRANSACTIONS (DEMO SIMULATED)
============================================================================ */
export const AdminPaymentsPage: React.FC = () => {
  const { language, orders } = useBazario();
  const methods: PaymentMethod[] = [
    'Cash on Delivery',
    'bKash',
    'Nagad',
    'Rocket',
    'Card Payment',
  ];

  const summaries = methods.map((m) => {
    const list = orders.filter((o) => o.paymentMethod === m && o.status !== 'Cancelled');
    const total = list.reduce((s, o) => s + o.total, 0);
    return { method: m, count: list.length, total };
  });
  const grandTotal = Math.max(
    summaries.reduce((s, item) => s + item.total, 0),
    1
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-bold text-[#172337]">
          {language === 'bn' ? 'পেমেন্ট ও লেনদেন সারসংক্ষেপ' : 'Payments & Transaction Ledger'}
        </h1>
        <span className="px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-[11px] font-semibold">
          {language === 'bn'
            ? 'ডেমো সিমুলেটেড গেটওয়ে রেকর্ড'
            : 'Simulated Demo Payment Records'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {summaries.map((s) => {
          const sharePct = Math.round((s.total / grandTotal) * 100);
          return (
            <div key={s.method} className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 sm:p-4 space-y-2">
              <div className="flex items-center justify-between gap-1">
                <p className="text-[11px] sm:text-xs font-semibold text-[#6B7280] truncate">{s.method}</p>
                <CreditCard className="w-3.5 h-3.5 text-[#F85606] shrink-0" />
              </div>
              <p className="text-base sm:text-lg font-bold text-[#172337] tabular-nums">
                {formatBDT(s.total, language)}
              </p>
              <div className="w-full h-1.5 bg-[#F5F6FA] rounded-full overflow-hidden">
                <div className="h-full bg-[#F85606] rounded-full" style={{ width: `${sharePct}%` }} />
              </div>
              <p className="text-[11px] text-[#6B7280] tabular-nums">
                {s.count} orders ({sharePct}%)
              </p>
            </div>
          );
        })}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-2.5">
        {orders.map((o) => (
          <div key={o.id} className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-[#172337]">#{o.id}</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusPillClass(o.status)}`}>
                {o.status}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-[#172337]">{o.paymentMethod}</p>
                <p className="text-[11px] font-mono text-[#6B7280] truncate">
                  {o.paymentSimulatedRef ?? 'COD-PAY-ON-DELIVERY'}
                </p>
              </div>
              <span className="font-bold text-[#F85606] tabular-nums shrink-0">
                {formatBDT(o.total, language)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white border border-[#E5E7EB] rounded-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F5F6FA] border-b border-[#E5E7EB] text-[#6B7280]">
            <tr>
              <th className="px-4 py-3 font-semibold">Order ID</th>
              <th className="px-4 py-3 font-semibold">Method</th>
              <th className="px-4 py-3 font-semibold">Demo Reference</th>
              <th className="px-4 py-3 font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">Order Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-[#F9FAFB]">
                <td className="px-4 py-3 font-mono font-bold text-[#172337]">#{o.id}</td>
                <td className="px-4 py-3 font-medium">{o.paymentMethod}</td>
                <td className="px-4 py-3 font-mono text-[#6B7280]">
                  {o.paymentSimulatedRef ?? 'COD-PAY-ON-DELIVERY'}
                </td>
                <td className="px-4 py-3 font-bold text-[#F85606] tabular-nums">
                  {formatBDT(o.total, language)}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusPillClass(o.status)}`}>
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ============================================================================
   8. ADMIN COUPONS MANAGEMENT
============================================================================ */
export const AdminCouponsPage: React.FC = () => {
  const { language, coupons, saveCoupon, deleteCoupon } = useBazario();
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('15');
  const [minOrder, setMinOrder] = useState('1000');
  const [expiresAt, setExpiresAt] = useState('2026-12-31');
  const [usageLimit] = useState('500');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    const newCoupon: Coupon = {
      id: `cpn-${Date.now()}`,
      code: code.trim().toUpperCase(),
      type,
      value: Math.max(1, Number(value) || 10),
      minOrderAmount: Math.max(0, Number(minOrder) || 0),
      maxDiscount: type === 'percentage' ? 1500 : undefined,
      expiresAt,
      usageLimit: Math.max(1, Number(usageLimit) || 100),
      usedCount: 0,
      active: true,
      description: {
        bn: `${code.trim().toUpperCase()} প্রোমো কুপন`,
        en: `${code.trim().toUpperCase()} promotional discount`,
      },
    };
    saveCoupon(newCoupon);
    setCode('');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold text-[#172337]">
        {language === 'bn' ? 'কুপন ও প্রোমো কোড' : 'Coupons & Promo Codes'}
      </h1>

      <form onSubmit={handleCreate} className="bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs items-end">
        <div>
          <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">Coupon Code</label>
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. POHELA20"
            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg uppercase font-mono"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">Discount Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'percentage' | 'fixed')}
            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg bg-white"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed (৳)</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">Value</label>
          <input
            type="number"
            min={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Discount Value"
            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">Min Order (৳)</label>
          <input
            type="number"
            min={0}
            value={minOrder}
            onChange={(e) => setMinOrder(e.target.value)}
            placeholder="Min Order ৳"
            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">Expires</label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-[#F85606] hover:bg-[#D94802] text-white font-semibold inline-flex items-center justify-center gap-1 h-[34px]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'কুপন তৈরি' : 'Create'}</span>
        </button>
      </form>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-2.5">
        {coupons.map((c) => {
          const usagePct = Math.min(100, Math.round((c.usedCount / Math.max(1, c.usageLimit)) * 100));
          return (
            <div key={c.id} className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-[#F85606] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  {c.code}
                </span>
                <span className="font-bold text-[#172337]">
                  {c.type === 'percentage' ? `${c.value}%` : formatBDT(c.value, language)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                <span>Min: {formatBDT(c.minOrderAmount, language)}</span>
                <span>Exp: {c.expiresAt}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[#6B7280] tabular-nums">
                  <span>Usage</span>
                  <span>{c.usedCount} / {c.usageLimit}</span>
                </div>
                <div className="w-full h-1.5 bg-[#F5F6FA] rounded-full overflow-hidden">
                  <div className="h-full bg-[#172337] rounded-full" style={{ width: `${usagePct}%` }} />
                </div>
              </div>
              <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => saveCoupon({ ...c, active: !c.active })}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    c.active ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#F3F4F6] text-[#6B7280]'
                  }`}
                >
                  {c.active ? 'Active' : 'Inactive'}
                </button>
                <button
                  type="button"
                  onClick={() => deleteCoupon(c.id)}
                  className="p-1.5 rounded border border-[#E5E7EB] text-[#DC2626] hover:bg-[#FEE2E2]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white border border-[#E5E7EB] rounded-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F5F6FA] border-b border-[#E5E7EB] text-[#6B7280]">
            <tr>
              <th className="px-4 py-3 font-semibold">Code</th>
              <th className="px-4 py-3 font-semibold">Discount</th>
              <th className="px-4 py-3 font-semibold">Min Order</th>
              <th className="px-4 py-3 font-semibold">Usage</th>
              <th className="px-4 py-3 font-semibold">Expires</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {coupons.map((c) => {
              const usagePct = Math.min(100, Math.round((c.usedCount / Math.max(1, c.usageLimit)) * 100));
              return (
                <tr key={c.id} className="hover:bg-[#F9FAFB]">
                  <td className="px-4 py-3 font-mono font-bold text-[#F85606]">
                    <span className="inline-flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{c.code}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {c.type === 'percentage' ? `${c.value}%` : formatBDT(c.value, language)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{formatBDT(c.minOrderAmount, language)}</td>
                  <td className="px-4 py-3 tabular-nums min-w-[120px]">
                    <div className="space-y-1">
                      <span>{c.usedCount} / {c.usageLimit}</span>
                      <div className="w-24 h-1.5 bg-[#F5F6FA] rounded-full overflow-hidden">
                        <div className="h-full bg-[#172337] rounded-full" style={{ width: `${usagePct}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">{c.expiresAt}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => saveCoupon({ ...c, active: !c.active })}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        c.active ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#F3F4F6] text-[#6B7280]'
                      }`}
                    >
                      {c.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => deleteCoupon(c.id)}
                      className="p-1.5 rounded border border-[#E5E7EB] text-[#DC2626] hover:bg-[#FEE2E2]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ============================================================================
   9. ADMIN REVIEWS MODERATION
============================================================================ */
export const AdminReviewsPage: React.FC = () => {
  const { language, reviews, products, deleteReview } = useBazario();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-[#172337]">
        {language === 'bn' ? 'রিভিউ মডারেশন' : 'Customer Review Moderation'} ({reviews.length})
      </h1>

      <div className="space-y-3">
        {reviews.map((r) => {
          const prod = products.find((p) => p.id === r.productId);
          return (
            <div key={r.id} className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex items-start justify-between gap-4">
              <div className="space-y-1 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-[#172337]">{r.customerName}</span>
                  <span className="text-[#6B7280]">({r.location})</span>
                  <span className="inline-flex items-center gap-0.5 text-[#F59E0B] font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {r.rating}
                  </span>
                  <span className="text-[11px] text-[#9CA3AF]">{r.createdAt}</span>
                </div>
                {prod && (
                  <p className="text-[11px] font-medium text-[#F85606]">
                    Product: {getText(prod.name, language)}
                  </p>
                )}
                <p className="text-[#4B5563]">{r.comment}</p>
              </div>
              <button
                type="button"
                onClick={() => deleteReview(r.id)}
                className="p-2 rounded-lg border border-[#E5E7EB] text-[#DC2626] hover:bg-[#FEE2E2] shrink-0"
                aria-label="Remove review"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
   10. ADMIN PROMOTIONS / HERO BANNERS
============================================================================ */
export const AdminPromotionsPage: React.FC = () => {
  const { language, heroSlides, saveHeroSlides } = useBazario();
  const [slides, setSlides] = useState<HeroSlide[]>(heroSlides);

  const updateSlide = (idx: number, patch: Partial<HeroSlide>) => {
    setSlides((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#172337]">
            {language === 'bn' ? 'প্রোমোশন ও হিরো ব্যানার' : 'Homepage Promotional Campaigns'}
          </h1>
          <p className="text-xs text-[#6B7280]">
            {language === 'bn'
              ? 'পরিবর্তনগুলো সংরক্ষণ করলে সাথে সাথে হোমপেজ হিরো ক্যারোসেলে দেখা যাবে।'
              : 'Updates apply immediately to the homepage hero carousel.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => saveHeroSlides(slides)}
          className="px-4 py-2 rounded-lg bg-[#F85606] text-white text-xs font-semibold"
        >
          {language === 'bn' ? 'সব ব্যানার সংরক্ষণ করুন' : 'Save Campaign Banners'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {slides.map((slide, idx) => (
          <div key={slide.id} className="bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-5 space-y-3 text-xs">
            <div className="flex items-center gap-3">
              <img src={slide.image} alt="" className="w-20 h-14 rounded-lg object-cover shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-[#172337]">Slide #{idx + 1}</p>
                <p className="text-[#6B7280] truncate">{slide.ctaLink}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-medium mb-1">Badge (BN)</label>
                <input
                  value={slide.badge.bn}
                  onChange={(e) => updateSlide(idx, { badge: { ...slide.badge, bn: e.target.value } })}
                  className="w-full px-2.5 py-1.5 border border-[#E5E7EB] rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Badge (EN)</label>
                <input
                  value={slide.badge.en}
                  onChange={(e) => updateSlide(idx, { badge: { ...slide.badge, en: e.target.value } })}
                  className="w-full px-2.5 py-1.5 border border-[#E5E7EB] rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Headline (BN)</label>
                <input
                  value={slide.title.bn}
                  onChange={(e) => updateSlide(idx, { title: { ...slide.title, bn: e.target.value } })}
                  className="w-full px-2.5 py-1.5 border border-[#E5E7EB] rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Headline (EN)</label>
                <input
                  value={slide.title.en}
                  onChange={(e) => updateSlide(idx, { title: { ...slide.title, en: e.target.value } })}
                  className="w-full px-2.5 py-1.5 border border-[#E5E7EB] rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">CTA Label (EN)</label>
                <input
                  value={slide.ctaLabel.en}
                  onChange={(e) =>
                    updateSlide(idx, { ctaLabel: { ...slide.ctaLabel, en: e.target.value } })
                  }
                  className="w-full px-2.5 py-1.5 border border-[#E5E7EB] rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">CTA Route</label>
                <input
                  value={slide.ctaLink}
                  onChange={(e) => updateSlide(idx, { ctaLink: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-[#E5E7EB] rounded-lg font-mono"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
   11. ADMIN ANALYTICS
============================================================================ */
export const AdminAnalyticsPage: React.FC = () => {
  const { language, orders, products, sellers } = useBazario();
  const validOrders = orders.filter((o) => o.status !== 'Cancelled');
  const gmv = validOrders.reduce((s, o) => s + o.total, 0);
  const aov = validOrders.length > 0 ? Math.round(gmv / validOrders.length) : 0;
  const deliveredRate =
    orders.length > 0
      ? Math.round((orders.filter((o) => o.status === 'Delivered').length / orders.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold text-[#172337]">
        {language === 'bn' ? 'মার্কেটপ্লেস রিপোর্ট ও অ্যানালিটিক্স' : 'Marketplace Reports & Analytics'}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
          <p className="text-xs text-[#6B7280]">Gross Merchandise Value (GMV)</p>
          <p className="text-2xl font-bold text-[#F85606] mt-1 tabular-nums">{formatBDT(gmv, language)}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
          <p className="text-xs text-[#6B7280]">Average Order Value (AOV)</p>
          <p className="text-2xl font-bold text-[#172337] mt-1 tabular-nums">{formatBDT(aov, language)}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
          <p className="text-xs text-[#6B7280]">Delivery Completion Rate</p>
          <p className="text-2xl font-bold text-[#16A34A] mt-1 tabular-nums">{deliveredRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-bold text-[#172337] flex items-center gap-2">
            <Award className="w-4 h-4 text-[#F85606]" />
            <span>{language === 'bn' ? 'অর্ডার স্ট্যাটাস বিন্যাস' : 'Order Status Distribution'}</span>
          </h2>
          {ORDER_STATUSES.map((st) => {
            const count = orders.filter((o) => o.status === st).length;
            const pct = orders.length ? Math.round((count / orders.length) * 100) : 0;
            return (
              <div key={st} className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="font-medium text-[#172337]">{st}</span>
                  <span className="tabular-nums text-[#6B7280]">
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-[#F5F6FA] rounded-full overflow-hidden">
                  <div className="h-full bg-[#172337] rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-bold text-[#172337]">
            {language === 'bn' ? 'ভেন্ডর পারফরম্যান্স লিডারবোর্ড' : 'Vendor Sales Leaderboard'}
          </h2>
          <div className="divide-y divide-[#E5E7EB] text-xs">
            {[...sellers]
              .sort((a, b) => b.totalSalesCount - a.totalSalesCount)
              .map((s) => {
                const count = products.filter((p) => p.sellerId === s.id).length;
                return (
                  <div key={s.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#172337]">{s.storeName}</p>
                      <p className="text-[11px] text-[#6B7280]">
                        {count} products · ★ {s.rating}
                      </p>
                    </div>
                    <span className="font-bold text-[#F85606] tabular-nums">
                      {formatNum(s.totalSalesCount, language)} sales
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   12. ADMIN PLATFORM SETTINGS
============================================================================ */
export const AdminSettingsPage: React.FC = () => {
  const { language, settings, updateSettings, resetAllDemoData } = useBazario();
  const [form, setForm] = useState(settings);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-lg font-bold text-[#172337]">
        {language === 'bn' ? 'প্ল্যাটফর্ম ও ডেলিভারি সেটিংস' : 'Marketplace Settings'}
      </h1>

      <form onSubmit={handleSave} className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-[#4B5563] mb-1">Marketplace Name</label>
            <input
              value={form.marketplaceName}
              onChange={(e) => setForm({ ...form, marketplaceName: e.target.value })}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg"
            />
          </div>
          <div>
            <label className="block font-medium text-[#4B5563] mb-1">Support Phone</label>
            <input
              value={form.supportPhone}
              onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg font-mono"
            />
          </div>
          <div>
            <label className="block font-medium text-[#4B5563] mb-1">Dhaka Delivery Charge (৳)</label>
            <input
              type="number"
              value={form.deliveryDhakaCharge}
              onChange={(e) => setForm({ ...form, deliveryDhakaCharge: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg"
            />
          </div>
          <div>
            <label className="block font-medium text-[#4B5563] mb-1">Outside Dhaka Charge (৳)</label>
            <input
              type="number"
              value={form.deliveryOutsideCharge}
              onChange={(e) => setForm({ ...form, deliveryOutsideCharge: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg"
            />
          </div>
          <div>
            <label className="block font-medium text-[#4B5563] mb-1">Express Extra Charge (৳)</label>
            <input
              type="number"
              value={form.expressExtraCharge}
              onChange={(e) => setForm({ ...form, expressExtraCharge: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg"
            />
          </div>
          <div>
            <label className="block font-medium text-[#4B5563] mb-1">Free Delivery Threshold (৳)</label>
            <input
              type="number"
              value={form.freeDeliveryThreshold}
              onChange={(e) => setForm({ ...form, freeDeliveryThreshold: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg"
            />
          </div>
          <div>
            <label className="block font-medium text-[#4B5563] mb-1">Support Email</label>
            <input
              value={form.supportEmail}
              onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg"
            />
          </div>
          <div>
            <label className="block font-medium text-[#4B5563] mb-1">WhatsApp Handle</label>
            <input
              value={form.whatsappHandle}
              onChange={(e) => setForm({ ...form, whatsappHandle: e.target.value })}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg bg-[#F85606] hover:bg-[#D94802] text-white font-semibold"
        >
          {language === 'bn' ? 'সেটিংস সংরক্ষণ করুন' : 'Save Platform Settings'}
        </button>
      </form>

      <div className="bg-white border border-[#FECACA] rounded-xl p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#991B1B]">
            {language === 'bn' ? 'ডেমো ডেটা রিসেট করুন' : 'Reset Demo Marketplace Data'}
          </h3>
          <p className="text-xs text-[#6B7280]">
            {language === 'bn'
              ? 'সকল কার্ট, অর্ডার, সেলার ও সেটিংস প্রাথমিক ডেমো অবস্থায় ফিরিয়ে আনুন।'
              : 'Restore all orders, sellers, products, coupons, and cart to original demo state.'}
          </p>
        </div>
        {!confirmReset ? (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="px-4 py-2 rounded-lg border border-[#DC2626] text-[#DC2626] text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'রিসেট ডেমো' : 'Reset Demo Data'}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                resetAllDemoData();
                setConfirmReset(false);
              }}
              className="px-4 py-2 rounded-lg bg-[#DC2626] text-white text-xs font-semibold"
            >
              Confirm Reset
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="px-3 py-2 rounded-lg border border-[#E5E7EB] text-xs"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
