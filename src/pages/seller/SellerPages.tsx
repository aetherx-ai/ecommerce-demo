import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit3,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingBag,
  TrendingUp,
  Trash2,
  Upload,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ResilientImage } from '../../components/common/ResilientImage';
import { useBazario } from '../../contexts/BazarioContext';
import { BAZARIO_IMAGES } from '../../data/bazarioData';
import { OrderStatus, Product, ProductStatus } from '../../types/bazario';
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

const orderStatusBadge = (status: OrderStatus): string => {
  switch (status) {
    case 'Delivered':
      return 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]';
    case 'Cancelled':
      return 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]';
    case 'Pending':
      return 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]';
    case 'Shipped':
    case 'Out for Delivery':
      return 'bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]';
    default:
      return 'bg-[#F3F4F6] text-[#172337] border-[#E5E7EB]';
  }
};

export const SellerOverviewPage: React.FC = () => {
  const { language, sellers, activeSellerId, products, orders } = useBazario();
  const activeSeller = sellers.find((s) => s.id === activeSellerId) ?? sellers[0];

  const myProducts = useMemo(
    () => products.filter((p) => p.sellerId === activeSeller.id),
    [products, activeSeller.id]
  );

  const myOrders = useMemo(
    () => orders.filter((o) => o.items.some((i) => i.sellerId === activeSeller.id)),
    [orders, activeSeller.id]
  );

  const totalSalesBdt = useMemo(
    () =>
      myOrders.reduce(
        (sum, o) =>
          sum +
          o.items
            .filter((i) => i.sellerId === activeSeller.id)
            .reduce((s, i) => s + i.unitPrice * i.quantity, 0),
        0
      ),
    [myOrders, activeSeller.id]
  );

  const pendingCount = myOrders.filter(
    (o) => o.status !== 'Delivered' && o.status !== 'Cancelled'
  ).length;
  const completedCount = myOrders.filter((o) => o.status === 'Delivered').length;
  const lowStockProducts = myProducts.filter((p) => p.stock <= 8);
  const topSelling = [...myProducts].sort((a, b) => b.soldCount - a.soldCount).slice(0, 4);

  const weeklyRevenue = [
    { day: 'Sat', amt: Math.round(totalSalesBdt * 0.11) + 4200, orders: 6 },
    { day: 'Sun', amt: Math.round(totalSalesBdt * 0.14) + 5800, orders: 9 },
    { day: 'Mon', amt: Math.round(totalSalesBdt * 0.12) + 4900, orders: 7 },
    { day: 'Tue', amt: Math.round(totalSalesBdt * 0.16) + 7400, orders: 11 },
    { day: 'Wed', amt: Math.round(totalSalesBdt * 0.15) + 6500, orders: 10 },
    { day: 'Thu', amt: Math.round(totalSalesBdt * 0.18) + 8900, orders: 14 },
    { day: 'Fri', amt: Math.round(totalSalesBdt * 0.22) + 11200, orders: 18 },
  ];
  const maxBar = Math.max(...weeklyRevenue.map((d) => d.amt), 1);
  const weeklyTotal = weeklyRevenue.reduce((s, d) => s + d.amt, 0);

  const kpiCards = [
    {
      label: language === 'bn' ? 'মোট বিক্রয়' : 'Total Sales',
      value: formatBDT(totalSalesBdt, language),
      sub: language === 'bn' ? 'স্টোর আয় (BDT)' : 'Gross store revenue',
      icon: DollarSign,
      iconBg: 'bg-[#FFF4EE] text-[#F85606]',
      valueClass: 'text-[#F85606]',
    },
    {
      label: language === 'bn' ? 'মোট অর্ডার' : 'Assigned Orders',
      value: formatNum(myOrders.length, language),
      sub: language === 'bn' ? 'সর্বমোট অর্ডার' : 'Across all statuses',
      icon: ShoppingBag,
      iconBg: 'bg-[#F5F6FA] text-[#172337]',
      valueClass: 'text-[#172337]',
    },
    {
      label: language === 'bn' ? 'আমার পণ্য' : 'My Products',
      value: formatNum(myProducts.length, language),
      sub: `${myProducts.filter((p) => p.status === 'approved').length} ${
        language === 'bn' ? 'অনুমোদিত' : 'approved'
      }`,
      icon: Package,
      iconBg: 'bg-[#EFF6FF] text-[#1D4ED8]',
      valueClass: 'text-[#172337]',
    },
    {
      label: language === 'bn' ? 'চলমান / পেন্ডিং' : 'Pending Orders',
      value: formatNum(pendingCount, language),
      sub: language === 'bn' ? 'ডেলিভারি অপেক্ষমাণ' : 'Requires fulfillment',
      icon: Clock,
      iconBg: 'bg-[#FFFBEB] text-[#D97706]',
      valueClass: 'text-[#D97706]',
    },
    {
      label: language === 'bn' ? 'সম্পন্ন অর্ডার' : 'Completed',
      value: formatNum(completedCount, language),
      sub: `${
        myOrders.length > 0 ? Math.round((completedCount / myOrders.length) * 100) : 0
      }% ${language === 'bn' ? 'সফলতা' : 'completion'}`,
      icon: CheckCircle2,
      iconBg: 'bg-[#F0FDF4] text-[#16A34A]',
      valueClass: 'text-[#16A34A]',
    },
  ];

  return (
    <div className="space-y-6">
      {activeSeller.status !== 'approved' && (
        <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>
            {language === 'bn'
              ? `আপনার স্টোর স্ট্যাটাস বর্তমানে "${activeSeller.status}"। শুধুমাত্র অ্যাডমিন অনুমোদিত সেলাররা পণ্য প্রকাশ করতে পারবেন।`
              : `Your store status is "${activeSeller.status}". Only admin-approved sellers can publish new products.`}
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white border border-[#E5E7EB] hover:border-[#F85606]/40 rounded-xl p-4 transition-colors flex flex-col justify-between gap-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] sm:text-xs font-medium text-[#6B7280] truncate">
                  {kpi.label}
                </span>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${kpi.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div>
                <p className={`text-lg sm:text-xl font-bold tabular-nums tracking-tight ${kpi.valueClass}`}>
                  {kpi.value}
                </p>
                <p className="text-[11px] text-[#9CA3AF] mt-0.5 truncate">{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Chart + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#172337] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#F85606]" />
                <span>
                  {language === 'bn' ? 'সাপ্তাহিক বিক্রয় গ্রাফ' : 'Weekly Store Revenue (BDT)'}
                </span>
              </h2>
              <p className="text-[11px] text-[#6B7280] mt-0.5">
                {language === 'bn'
                  ? 'গত ৭ দিনের দৈনিক বিক্রয় বিশ্লেষণ'
                  : '7-day daily revenue & order cadence'}
              </p>
            </div>
            <div className="flex items-center gap-3 bg-[#F5F6FA] border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-xs">
              <div>
                <span className="text-[10px] text-[#6B7280] block">
                  {language === 'bn' ? 'সাপ্তাহিক মোট' : '7-Day Total'}
                </span>
                <span className="font-bold text-[#172337] tabular-nums">
                  {formatBDT(weeklyTotal, language)}
                </span>
              </div>
              <span className="w-px h-6 bg-[#E5E7EB]" />
              <div>
                <span className="text-[10px] text-[#6B7280] block">
                  {language === 'bn' ? 'দৈনিক গড়' : 'Daily Avg'}
                </span>
                <span className="font-bold text-[#F85606] tabular-nums">
                  {formatBDT(Math.round(weeklyTotal / 7), language)}
                </span>
              </div>
            </div>
          </div>

          <div className="relative pt-4">
            <div className="pointer-events-none absolute inset-x-0 top-4 bottom-8 flex flex-col justify-between">
              {[0, 1, 2, 3].map((line) => (
                <div key={line} className="border-b border-dashed border-[#F1F3F5] w-full" />
              ))}
            </div>
            <div className="relative z-10 grid grid-cols-7 gap-2 sm:gap-3 items-end h-48 border-b border-[#E5E7EB] pb-1">
              {weeklyRevenue.map((d) => {
                const heightPct = Math.max(16, Math.round((d.amt / maxBar) * 100));
                return (
                  <div
                    key={d.day}
                    className="group relative flex flex-col items-center justify-end h-full gap-1.5"
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute -top-2 z-20 px-2 py-1 rounded bg-[#172337] text-white text-[10px] font-mono whitespace-nowrap shadow-md">
                      {formatBDT(d.amt, language)} · {d.orders} ord
                    </div>
                    <span className="text-[10px] font-mono text-[#6B7280] tabular-nums hidden md:inline">
                      {formatBDT(d.amt, language)}
                    </span>
                    <div className="w-full max-w-[40px] flex-1 flex items-end bg-[#F5F6FA]/70 rounded-t-md overflow-hidden">
                      <div
                        className="w-full bg-gradient-to-t from-[#F85606] to-[#FF8A4C] group-hover:from-[#172337] group-hover:to-[#334155] rounded-t-md transition-all duration-300"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-7 gap-2 sm:gap-3 pt-2 text-center text-[11px] font-semibold font-mono text-[#6B7280]">
              {weeklyRevenue.map((d) => (
                <span key={d.day}>{d.day}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#172337] flex items-center gap-2">
                <Boxes className="w-4 h-4 text-[#D97706]" />
                <span>
                  {language === 'bn' ? 'লো-স্টক সতর্কতা' : 'Inventory Alerts'} ({lowStockProducts.length})
                </span>
              </h2>
              <Link
                to="/seller/inventory"
                className="text-xs font-semibold text-[#F85606] hover:underline inline-flex items-center gap-0.5"
              >
                <span>{language === 'bn' ? 'ইনভেন্টরি' : 'Restock'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {lowStockProducts.length === 0 ? (
              <div className="p-4 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#166534] font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  {language === 'bn' ? 'সব পণ্যের পর্যাপ্ত স্টক রয়েছে।' : 'All SKUs have healthy stock.'}
                </span>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-0.5">
                {lowStockProducts.map((p) => {
                  const isOut = p.stock <= 0;
                  const pct = Math.min(100, Math.max(8, Math.round((p.stock / 15) * 100)));
                  return (
                    <div
                      key={p.id}
                      className={`p-2.5 rounded-lg border text-xs space-y-1.5 ${
                        isOut
                          ? 'bg-[#FEF2F2] border-[#FECACA]'
                          : 'bg-[#FFFBEB] border-[#FDE68A]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[#202124] truncate">
                          {getText(p.name, language)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 tabular-nums ${
                            isOut
                              ? 'bg-[#DC2626] text-white'
                              : 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'
                          }`}
                        >
                          {isOut ? 'Out' : `${p.stock} left`}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/80 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isOut ? 'bg-[#DC2626]' : 'bg-[#D97706]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <Link
            to="/seller/inventory"
            className="w-full py-2 rounded-lg bg-[#F5F6FA] hover:bg-[#E5E7EB] text-center text-xs font-semibold text-[#172337] transition-colors"
          >
            {language === 'bn' ? 'সকল স্টক আপডেট করুন' : 'Manage All Inventory'}
          </Link>
        </div>
      </div>

      {/* Top Selling & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#F1F3F5]">
            <h2 className="text-sm sm:text-base font-bold text-[#172337]">
              {language === 'bn' ? 'সেরা বিক্রিত পণ্য' : 'Top-Selling Store Products'}
            </h2>
            <Link to="/seller/products" className="text-xs font-semibold text-[#F85606] hover:underline">
              {language === 'bn' ? 'সব দেখুন' : 'Manage'} →
            </Link>
          </div>
          <div className="divide-y divide-[#F1F3F5] text-xs">
            {topSelling.map((p) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-8 rounded bg-[#F5F6FA] overflow-hidden shrink-0">
                    <ResilientImage
                      src={p.images[0]}
                      alt={getText(p.name, language)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#202124] truncate">
                      {getText(p.name, language)}
                    </p>
                    <p className="text-[11px] text-[#6B7280] tabular-nums">
                      {formatNum(p.soldCount, language)} {language === 'bn' ? 'বিক্রিত' : 'sold'} ·{' '}
                      <span className={p.stock <= 5 ? 'text-[#D97706] font-semibold' : ''}>
                        {p.stock} in stock
                      </span>
                    </p>
                  </div>
                </div>
                <span className="font-bold text-[#F85606] tabular-nums shrink-0">
                  {formatBDT(p.discountedPrice, language)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#F1F3F5]">
            <h2 className="text-sm sm:text-base font-bold text-[#172337]">
              {language === 'bn' ? 'সাম্প্রতিক অর্ডার' : 'Recent Store Orders'}
            </h2>
            <Link to="/seller/orders" className="text-xs font-semibold text-[#F85606] hover:underline">
              {language === 'bn' ? 'সব অর্ডার' : 'View All'} →
            </Link>
          </div>
          <div className="divide-y divide-[#F1F3F5] text-xs">
            {myOrders.slice(0, 4).map((o) => {
              const sellerTotal = o.items
                .filter((i) => i.sellerId === activeSeller.id)
                .reduce((s, i) => s + i.unitPrice * i.quantity, 0);
              return (
                <div key={o.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#172337]">#{o.id}</span>
                      <span className="text-[#4B5563] truncate">{o.customerName}</span>
                    </div>
                    <p className="text-[11px] text-[#9CA3AF]">
                      {o.createdAt} · {o.address.district}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="font-bold text-[#172337] tabular-nums">
                      {formatBDT(sellerTotal, language)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${orderStatusBadge(
                        o.status
                      )}`}
                    >
                      {o.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SellerProductsPage: React.FC = () => {
  const { language, activeSellerId, products, deleteSellerProduct } = useBazario();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProductStatus>('all');

  const myProducts = useMemo(
    () => products.filter((p) => p.sellerId === activeSellerId),
    [products, activeSellerId]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return myProducts.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        p.name.en.toLowerCase().includes(q) ||
        p.name.bn.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    });
  }, [myProducts, query, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#172337]">
            {language === 'bn' ? 'আমার পণ্যসমূহ' : 'My Store Products'} ({filtered.length})
          </h1>
          <p className="text-xs text-[#6B7280]">
            {language === 'bn'
              ? 'পণ্য, মূল্য এবং স্টক পরিচালনা করুন'
              : 'Manage catalog pricing, stock availability, and approval status'}
          </p>
        </div>
        <Link
          to="/seller/products/new"
          className="px-4 py-2.5 rounded-lg bg-[#F85606] hover:bg-[#E04A00] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? 'নতুন পণ্য যোগ' : 'Add New Product'}</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={language === 'bn' ? 'নাম বা SKU খুঁজুন...' : 'Search product or SKU...'}
            className="w-full pl-8 pr-3 py-2 text-xs bg-[#F5F6FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:bg-white focus:border-[#F85606]"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {(['all', 'approved', 'pending', 'rejected'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium border whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#172337] text-white border-[#172337]'
                  : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:border-[#172337]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Cards (< md) */}
      <div className="md:hidden space-y-3">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 space-y-3 text-xs"
          >
            <div className="flex items-start gap-3">
              <div className="w-16 h-12 rounded-lg bg-[#F5F6FA] overflow-hidden shrink-0 border border-[#E5E7EB]">
                <ResilientImage
                  src={p.images[0]}
                  alt={getText(p.name, language)}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#172337] line-clamp-2">
                  {getText(p.name, language)}
                </p>
                <p className="font-mono text-[11px] text-[#6B7280] mt-0.5">{p.sku}</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F1F3F5]">
              <div>
                <span className="font-bold text-sm text-[#F85606] tabular-nums">
                  {formatBDT(p.discountedPrice, language)}
                </span>
                <span className="ml-2 text-[11px] text-[#6B7280] tabular-nums">
                  Stock: <strong>{p.stock}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`px-2 py-0.5 rounded-full capitalize text-[10px] font-semibold ${
                    p.status === 'approved'
                      ? 'bg-[#DCFCE7] text-[#166534]'
                      : p.status === 'pending'
                      ? 'bg-[#FEF3C7] text-[#92400E]'
                      : 'bg-[#FEE2E2] text-[#991B1B]'
                  }`}
                >
                  {p.status}
                </span>
                <button
                  type="button"
                  onClick={() => navigate(`/seller/products/edit/${p.id}`)}
                  aria-label="Edit product"
                  className="p-1.5 rounded-md border border-[#E5E7EB] text-[#4B5563]"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteSellerProduct(p.id)}
                  aria-label="Delete product"
                  className="p-1.5 rounded-md border border-[#E5E7EB] text-[#DC2626]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table (md+) */}
      <div className="hidden md:block bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F5F6FA] border-b border-[#E5E7EB] text-[#6B7280] uppercase text-[11px]">
                <th className="py-3 px-4 font-semibold">Product</th>
                <th className="py-3 px-4 font-semibold">SKU</th>
                <th className="py-3 px-4 font-semibold">Price</th>
                <th className="py-3 px-4 font-semibold">Inventory</th>
                <th className="py-3 px-4 font-semibold">Sold</th>
                <th className="py-3 px-4 font-semibold">Moderation</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3F5]">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAFAFC] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-9 rounded-md bg-[#F5F6FA] overflow-hidden shrink-0 border border-[#E5E7EB]">
                        <ResilientImage
                          src={p.images[0]}
                          alt={getText(p.name, language)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#172337] truncate max-w-[230px]">
                          {getText(p.name, language)}
                        </p>
                        <p className="text-[11px] text-[#6B7280]">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#6B7280]">{p.sku}</td>
                  <td className="py-3 px-4 tabular-nums">
                    <span className="font-bold text-[#F85606]">
                      {formatBDT(p.discountedPrice, language)}
                    </span>
                    {p.regularPrice > p.discountedPrice && (
                      <span className="block text-[10px] text-[#9CA3AF] line-through">
                        {formatBDT(p.regularPrice, language)}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 tabular-nums">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          p.stock <= 0
                            ? 'bg-[#DC2626]'
                            : p.stock <= 8
                            ? 'bg-[#D97706]'
                            : 'bg-[#16A34A]'
                        }`}
                      />
                      <span className="font-mono font-semibold text-[#172337]">{p.stock}</span>
                      <span className="text-[10px] text-[#6B7280]">
                        {p.stock <= 0 ? 'Out' : p.stock <= 8 ? 'Low' : 'OK'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-[#4B5563]">
                    {p.soldCount}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full capitalize text-[11px] font-semibold ${
                        p.status === 'approved'
                          ? 'bg-[#DCFCE7] text-[#166534]'
                          : p.status === 'pending'
                          ? 'bg-[#FEF3C7] text-[#92400E]'
                          : 'bg-[#FEE2E2] text-[#991B1B]'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => navigate(`/seller/products/edit/${p.id}`)}
                        aria-label="Edit product"
                        className="p-1.5 rounded-md border border-[#E5E7EB] text-[#4B5563] hover:text-[#172337] hover:border-[#172337]"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSellerProduct(p.id)}
                        aria-label="Delete product"
                        className="p-1.5 rounded-md border border-[#E5E7EB] text-[#DC2626] hover:bg-[#FEE2E2]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const SellerProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    language,
    sellers,
    activeSellerId,
    categories,
    products,
    saveSellerProduct,
    showToast,
  } = useBazario();

  const activeSeller = sellers.find((s) => s.id === activeSellerId) ?? sellers[0];
  const existing = id ? products.find((p) => p.id === id && p.sellerId === activeSellerId) : undefined;

  const [nameEn, setNameEn] = useState(existing?.name.en ?? '');
  const [nameBn, setNameBn] = useState(existing?.name.bn ?? '');
  const [categorySlug, setCategorySlug] = useState(
    existing?.categorySlug ?? categories[0].slug
  );
  const [brand, setBrand] = useState(existing?.brand ?? activeSeller.storeName);
  const [sku, setSku] = useState(
    existing?.sku ?? `BZ-SEL-${Math.floor(100 + Math.random() * 899)}`
  );
  const [regularPrice, setRegularPrice] = useState(String(existing?.regularPrice ?? 2500));
  const [discountedPrice, setDiscountedPrice] = useState(
    String(existing?.discountedPrice ?? 1990)
  );
  const [stock, setStock] = useState(String(existing?.stock ?? 20));
  const [colorsInput, setColorsInput] = useState(
    existing?.colors.join(', ') ?? 'Black, Gray'
  );
  const [sizesInput, setSizesInput] = useState(
    existing?.sizes.join(', ') ?? 'S, M, L, XL'
  );
  const [descEn, setDescEn] = useState(existing?.description.en ?? '');
  const [descBn, setDescBn] = useState(existing?.description.bn ?? '');
  const [imageUrl, setImageUrl] = useState(
    existing?.images[0] ?? BAZARIO_IMAGES.smartphone
  );

  const isApproved = activeSeller.status === 'approved';

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApproved) {
      showToast(
        language === 'bn'
          ? 'অ্যাডমিন অনুমোদিত সেলার না হলে পণ্য প্রকাশ করা যাবে না।'
          : 'Only approved sellers can publish products.',
        'error'
      );
      return;
    }
    const reg = Math.max(1, Number(regularPrice) || 100);
    const disc = Math.max(1, Math.min(reg, Number(discountedPrice) || reg));
    const discountPercent = Math.round(((reg - disc) / reg) * 100);
    const activeCat = categories.find((c) => c.slug === categorySlug) ?? categories[0];

    const product: Product = {
      id: existing?.id ?? `prod-${Date.now()}`,
      slug: existing?.slug ?? `${slugify(nameEn)}-${Date.now().toString().slice(-4)}`,
      sku: sku.trim().toUpperCase(),
      name: {
        bn: nameBn.trim() || nameEn.trim(),
        en: nameEn.trim(),
      },
      categorySlug,
      subcategorySlug: activeCat.subcategories[0]?.slug ?? 'general',
      brand: brand.trim() || activeSeller.storeName,
      sellerId: activeSeller.id,
      images: [imageUrl],
      regularPrice: reg,
      discountedPrice: disc,
      discountPercent,
      rating: existing?.rating ?? 5.0,
      reviewCount: existing?.reviewCount ?? 0,
      soldCount: existing?.soldCount ?? 0,
      stock: Math.max(0, Number(stock) || 0),
      description: {
        bn: descBn.trim() || descEn.trim() || nameBn.trim(),
        en: descEn.trim() || nameEn.trim(),
      },
      specifications: existing?.specifications ?? {
        Brand: brand.trim(),
        Seller: activeSeller.storeName,
      },
      colors: colorsInput
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      sizes: sizesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      deliveryDhakaDays: '1–2 Days',
      deliveryOutsideDays: '3–5 Days',
      status: 'approved',
      createdAt: existing?.createdAt ?? new Date().toISOString().slice(0, 10),
    };

    saveSellerProduct(product);
    navigate('/seller/products');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-5 max-w-3xl"
    >
      <h1 className="text-xl font-bold text-[#172337]">
        {existing
          ? language === 'bn'
            ? 'পণ্য সম্পাদনা করুন'
            : 'Edit Product'
          : language === 'bn'
          ? 'নতুন পণ্য যোগ করুন'
          : 'Add New Product'}
      </h1>

      {!isApproved && (
        <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626] font-medium">
          {language === 'bn'
            ? 'এই সেলার অ্যাকাউন্টটি এখনো অনুমোদিত নয়। অ্যাডমিন প্যানেল থেকে অনুমোদন করুন।'
            : 'This seller account is not approved yet. Approve it in the Admin Panel first.'}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block font-semibold mb-1">Product Title (English) *</label>
          <input
            required
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Product Title (বাংলা)</label>
          <input
            value={nameBn}
            onChange={(e) => setNameBn(e.target.value)}
            className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Category</label>
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg bg-white"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {getText(c.name, language)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">SKU</label>
          <input
            required
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="w-full px-3 py-2.5 font-mono border border-[#E5E7EB] rounded-lg"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Regular Price (৳) *</label>
          <input
            type="number"
            min={1}
            required
            value={regularPrice}
            onChange={(e) => setRegularPrice(e.target.value)}
            className="w-full px-3 py-2.5 font-mono border border-[#E5E7EB] rounded-lg"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Discounted Price (৳) *</label>
          <input
            type="number"
            min={1}
            required
            value={discountedPrice}
            onChange={(e) => setDiscountedPrice(e.target.value)}
            className="w-full px-3 py-2.5 font-mono border border-[#E5E7EB] rounded-lg"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Stock Quantity *</label>
          <input
            type="number"
            min={0}
            required
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full px-3 py-2.5 font-mono border border-[#E5E7EB] rounded-lg"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Brand</label>
          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Colors (comma separated)</label>
          <input
            value={colorsInput}
            onChange={(e) => setColorsInput(e.target.value)}
            className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Sizes / Options (comma separated)</label>
          <input
            value={sizesInput}
            onChange={(e) => setSizesInput(e.target.value)}
            className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg"
          />
        </div>
      </div>

      {/* Product Image Upload / Studio Preset */}
      <div className="space-y-2 text-xs">
        <label className="block font-semibold">Product Image Upload / Studio Preset</label>
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-24 h-20 rounded-lg bg-[#F5F6FA] border border-[#E5E7EB] overflow-hidden shrink-0">
            <ResilientImage src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-2">
            <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#E5E7EB] hover:border-[#F85606] cursor-pointer font-medium">
              <Upload className="w-4 h-4 text-[#F85606]" />
              <span>Upload Local Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Phone', img: BAZARIO_IMAGES.smartphone },
                { label: 'Laptop', img: BAZARIO_IMAGES.laptop },
                { label: 'Panjabi', img: BAZARIO_IMAGES.panjabi },
                { label: 'Jamdani', img: BAZARIO_IMAGES.sareeKurti },
                { label: 'Beauty', img: BAZARIO_IMAGES.beauty },
                { label: 'Sneaker', img: BAZARIO_IMAGES.sneaker },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setImageUrl(preset.img)}
                  className="px-2 py-1 rounded bg-[#F5F6FA] hover:bg-[#E5E7EB] text-[11px]"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block font-semibold mb-1">Description (English)</label>
          <textarea
            rows={3}
            value={descEn}
            onChange={(e) => setDescEn(e.target.value)}
            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Description (বাংলা)</label>
          <textarea
            rows={3}
            value={descBn}
            onChange={(e) => setDescBn(e.target.value)}
            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => navigate('/seller/products')}
          className="px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-xs font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg bg-[#F85606] text-white text-xs font-semibold"
        >
          {existing ? 'Update Product' : 'Publish Product'}
        </button>
      </div>
    </form>
  );
};

export const SellerOrdersPage: React.FC = () => {
  const { language, activeSellerId, orders, updateOrderStatus } = useBazario();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');

  const myOrders = useMemo(
    () => orders.filter((o) => o.items.some((i) => i.sellerId === activeSellerId)),
    [orders, activeSellerId]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return myOrders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.includes(q)
      );
    });
  }, [myOrders, query, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#172337]">
            {language === 'bn' ? 'স্টোর অর্ডারসমূহ' : 'Assigned Store Orders'} ({filtered.length})
          </h1>
          <p className="text-xs text-[#6B7280]">
            {language === 'bn'
              ? 'অর্ডার স্ট্যাটাস আপডেট করুন এবং ডেলিভারি ট্র্যাক করুন'
              : 'Update fulfillment statuses for items sold by your store'}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Order ID, customer, phone..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-[#F5F6FA] border border-[#E5E7EB] rounded-lg focus:outline-none focus:bg-white focus:border-[#F85606]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | OrderStatus)}
          className="px-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-lg font-medium"
        >
          <option value="all">
            {language === 'bn' ? 'সকল স্ট্যাটাস' : 'All Statuses'} ({myOrders.length})
          </option>
          {ORDER_STATUSES.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile Cards (< md) */}
      <div className="md:hidden space-y-3">
        {filtered.map((o) => {
          const sellerItems = o.items.filter((i) => i.sellerId === activeSellerId);
          const sellerSubtotal = sellerItems.reduce(
            (s, i) => s + i.unitPrice * i.quantity,
            0
          );
          return (
            <div
              key={o.id}
              className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-2.5 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="font-mono font-bold text-[#172337]">#{o.id}</span>
                  <span className="text-[#6B7280] ml-2">{o.createdAt}</span>
                </div>
                <span className="font-bold text-[#F85606] tabular-nums">
                  {formatBDT(sellerSubtotal, language)}
                </span>
              </div>
              <div>
                <p className="font-semibold text-[#202124]">{o.customerName}</p>
                <p className="text-[#6B7280]">
                  {o.phone} · {o.address.upazila}, {o.address.district}
                </p>
              </div>
              <div className="bg-[#F5F6FA] rounded-lg p-2.5 space-y-1">
                {sellerItems.map((it, idx) => (
                  <p key={idx} className="text-[#374151]">
                    <span className="font-semibold">{it.quantity}×</span>{' '}
                    {getText(it.productName, language)}
                  </p>
                ))}
              </div>
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[#6B7280]">{o.paymentMethod}</span>
                <select
                  value={o.status}
                  onChange={(e) =>
                    updateOrderStatus(o.id, e.target.value as OrderStatus)
                  }
                  className={`px-2.5 py-1.5 rounded-lg border font-semibold ${orderStatusBadge(
                    o.status
                  )}`}
                >
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table (md+) */}
      <div className="hidden md:block bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F5F6FA] border-b border-[#E5E7EB] text-[#6B7280] uppercase text-[11px]">
                <th className="py-3 px-4 font-semibold">Order</th>
                <th className="py-3 px-4 font-semibold">Customer &amp; Delivery</th>
                <th className="py-3 px-4 font-semibold">Seller Items</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3F5]">
              {filtered.map((o) => {
                const sellerItems = o.items.filter((i) => i.sellerId === activeSellerId);
                const sellerSubtotal = sellerItems.reduce(
                  (s, i) => s + i.unitPrice * i.quantity,
                  0
                );
                return (
                  <tr key={o.id} className="hover:bg-[#FAFAFC] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#172337]">
                      #{o.id}
                      <div className="text-[11px] font-normal text-[#6B7280]">
                        {o.createdAt}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-[#202124]">{o.customerName}</p>
                      <p className="text-[#6B7280]">
                        {o.phone} · {o.address.upazila}, {o.address.district}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      {sellerItems.map((it, idx) => (
                        <p key={idx} className="text-[#374151]">
                          <span className="font-semibold">{it.quantity}×</span>{' '}
                          {getText(it.productName, language)}
                        </p>
                      ))}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={o.status}
                        onChange={(e) =>
                          updateOrderStatus(o.id, e.target.value as OrderStatus)
                        }
                        className={`px-2.5 py-1.5 rounded-lg border font-semibold ${orderStatusBadge(
                          o.status
                        )}`}
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#F85606] tabular-nums">
                      {formatBDT(sellerSubtotal, language)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const SellerInventoryPage: React.FC = () => {
  const { language, activeSellerId, products, saveSellerProduct } = useBazario();
  const [query, setQuery] = useState('');
  const myProducts = products.filter((p) => p.sellerId === activeSellerId);

  const inStockCount = myProducts.filter((p) => p.stock > 8).length;
  const lowStockCount = myProducts.filter((p) => p.stock > 0 && p.stock <= 8).length;
  const outStockCount = myProducts.filter((p) => p.stock <= 0).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return myProducts;
    return myProducts.filter(
      (p) =>
        p.name.en.toLowerCase().includes(q) ||
        p.name.bn.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
  }, [myProducts, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#172337]">
            {language === 'bn' ? 'স্টক ও ইনভেন্টরি' : 'Store Inventory Management'}
          </h1>
          <p className="text-xs text-[#6B7280]">
            {language === 'bn'
              ? 'দ্রুত স্টক সংখ্যা বাড়ান বা কমান'
              : 'Monitor stock health and adjust SKU quantities in real time'}
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter SKU or title..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#F85606]"
          />
        </div>
      </div>

      {/* Inventory Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5">
          <span className="text-[#6B7280]">{language === 'bn' ? 'মোট SKU' : 'Total SKUs'}</span>
          <p className="text-lg font-bold text-[#172337] mt-0.5 tabular-nums">{myProducts.length}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5">
          <span className="text-[#6B7280]">{language === 'bn' ? 'পর্যাপ্ত স্টক' : 'Healthy Stock'}</span>
          <p className="text-lg font-bold text-[#16A34A] mt-0.5 tabular-nums">{inStockCount}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5">
          <span className="text-[#6B7280]">{language === 'bn' ? 'কম স্টক' : 'Low Stock'}</span>
          <p className="text-lg font-bold text-[#D97706] mt-0.5 tabular-nums">{lowStockCount}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5">
          <span className="text-[#6B7280]">{language === 'bn' ? 'স্টক শেষ' : 'Out of Stock'}</span>
          <p className="text-lg font-bold text-[#DC2626] mt-0.5 tabular-nums">{outStockCount}</p>
        </div>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-xl divide-y divide-[#F1F3F5]">
        {filtered.map((p) => {
          const pct = Math.min(100, Math.round((p.stock / 30) * 100));
          return (
            <div
              key={p.id}
              className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-9 rounded-md bg-[#F5F6FA] overflow-hidden shrink-0 border border-[#E5E7EB]">
                  <ResilientImage
                    src={p.images[0]}
                    alt={getText(p.name, language)}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#172337] truncate">
                    {getText(p.name, language)}
                  </p>
                  <p className="font-mono text-[11px] text-[#6B7280]">{p.sku}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                <div className="w-24 hidden sm:block">
                  <div className="h-1.5 bg-[#F5F6FA] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        p.stock <= 0
                          ? 'bg-[#DC2626]'
                          : p.stock <= 8
                          ? 'bg-[#D97706]'
                          : 'bg-[#16A34A]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                    p.stock <= 0
                      ? 'bg-[#FEE2E2] text-[#991B1B]'
                      : p.stock <= 8
                      ? 'bg-[#FEF3C7] text-[#92400E]'
                      : 'bg-[#DCFCE7] text-[#166534]'
                  }`}
                >
                  {p.stock <= 0 ? 'Out of Stock' : p.stock <= 8 ? 'Low Stock' : 'In Stock'}
                </span>
                <div className="inline-flex items-center border border-[#E5E7EB] rounded-lg bg-[#FAFAFC]">
                  <button
                    type="button"
                    aria-label="Decrease stock"
                    onClick={() =>
                      saveSellerProduct({ ...p, stock: Math.max(0, p.stock - 1) })
                    }
                    className="w-9 h-9 flex items-center justify-center hover:bg-[#F5F6FA] rounded-l-lg"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-mono font-bold tabular-nums">
                    {p.stock}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase stock"
                    onClick={() => saveSellerProduct({ ...p, stock: p.stock + 1 })}
                    className="w-9 h-9 flex items-center justify-center hover:bg-[#F5F6FA] rounded-r-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const SellerAnalyticsPage: React.FC = () => {
  const { language, activeSellerId, products, orders } = useBazario();
  const myProducts = products.filter((p) => p.sellerId === activeSellerId);
  const myOrders = orders.filter((o) => o.items.some((i) => i.sellerId === activeSellerId));

  const maxSold = Math.max(...myProducts.map((p) => p.soldCount), 1);
  const totalRevenue = myOrders.reduce(
    (s, o) =>
      s +
      o.items
        .filter((i) => i.sellerId === activeSellerId)
        .reduce((acc, i) => acc + i.unitPrice * i.quantity, 0),
    0
  );
  const totalUnitsSold = myProducts.reduce((s, p) => s + p.soldCount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-5">
          <p className="text-xs text-[#6B7280] flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-[#F85606]" />
            <span>{language === 'bn' ? 'মোট স্টোর আয়' : 'Attributed Store Revenue'}</span>
          </p>
          <p className="text-2xl font-bold text-[#F85606] mt-1 tabular-nums">
            {formatBDT(totalRevenue, language)}
          </p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-5">
          <p className="text-xs text-[#6B7280]">
            {language === 'bn' ? 'সর্বমোট ইউনিট বিক্রিত' : 'Lifetime Units Sold'}
          </p>
          <p className="text-2xl font-bold text-[#172337] mt-1 tabular-nums">
            {formatNum(totalUnitsSold, language)}
          </p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-5">
          <p className="text-xs text-[#6B7280]">
            {language === 'bn' ? 'গড় অর্ডার মূল্য' : 'Average Store Order'}
          </p>
          <p className="text-2xl font-bold text-[#16A34A] mt-1 tabular-nums">
            {formatBDT(myOrders.length ? Math.round(totalRevenue / myOrders.length) : 0, language)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4">
          <h2 className="text-base font-bold text-[#172337]">
            {language === 'bn' ? 'পণ্য পারফরম্যান্স' : 'Product Sales Performance'}
          </h2>
          <div className="space-y-3.5 text-xs">
            {[...myProducts]
              .sort((a, b) => b.soldCount - a.soldCount)
              .slice(0, 6)
              .map((p) => {
                const pct = Math.max(8, Math.round((p.soldCount / maxSold) * 100));
                return (
                  <div key={p.id} className="space-y-1.5">
                    <div className="flex justify-between gap-3">
                      <span className="font-semibold text-[#172337] truncate">
                        {getText(p.name, language)}
                      </span>
                      <span className="font-mono font-bold text-[#F85606] tabular-nums shrink-0">
                        {p.soldCount} sold
                      </span>
                    </div>
                    <div className="h-2 bg-[#F5F6FA] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#172337] to-[#F85606] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4">
          <h2 className="text-base font-bold text-[#172337]">
            {language === 'bn' ? 'পেমেন্ট মেথড বিভাজন' : 'Store Order Payment Mix'}
          </h2>
          <div className="space-y-3.5 text-xs">
            {['Cash on Delivery', 'bKash', 'Nagad', 'Rocket', 'Card Payment'].map((pm) => {
              const count = myOrders.filter((o) => o.paymentMethod === pm).length;
              const pct = myOrders.length ? Math.round((count / myOrders.length) * 100) : 0;
              return (
                <div key={pm} className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="font-medium text-[#172337]">{pm}</span>
                    <span className="font-mono font-bold tabular-nums text-[#4B5563]">
                      {count} orders ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-[#F5F6FA] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#172337] rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SellerProfilePage: React.FC = () => {
  const { language, sellers, activeSellerId, updateSellerProfile } = useBazario();
  const seller = sellers.find((s) => s.id === activeSellerId) ?? sellers[0];

  const [storeName, setStoreName] = useState(seller.storeName);
  const [phone, setPhone] = useState(seller.phone);
  const [address, setAddress] = useState(seller.address);
  const [descEn, setDescEn] = useState(seller.description.en);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        updateSellerProfile(seller.id, {
          storeName,
          phone,
          address,
          description: { bn: descEn, en: descEn },
        });
      }}
      className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4 max-w-xl text-xs"
    >
      <h1 className="text-lg font-bold text-[#172337]">
        {language === 'bn' ? 'স্টোর প্রোফাইল সেটিংস' : 'Store Profile Settings'}
      </h1>
      <div>
        <label className="block font-semibold mb-1">Store Name</label>
        <input
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg"
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Business Phone</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-3 py-2.5 font-mono border border-[#E5E7EB] rounded-lg"
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Warehouse / Showroom Address</label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg"
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Store Description</label>
        <textarea
          rows={3}
          value={descEn}
          onChange={(e) => setDescEn(e.target.value)}
          className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg"
        />
      </div>
      <button
        type="submit"
        className="px-5 py-2.5 rounded-lg bg-[#F85606] text-white font-semibold"
      >
        {language === 'bn' ? 'আপডেট সংরক্ষণ' : 'Save Store Profile'}
      </button>
    </form>
  );
};

export const SellerRegisterPage: React.FC = () => {
  const { language, submitSellerApplication } = useBazario();
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [storeName, setStoreName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('Fashion');
  const [address, setAddress] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [submittedSeller, setSubmittedSeller] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = submitSellerApplication({
      ownerName,
      phone,
      email,
      storeName,
      businessCategory,
      address,
      descriptionEn,
    });
    setSubmittedSeller(created.storeName);
  };

  if (submittedSeller) {
    return (
      <div className="max-w-lg mx-auto bg-white border border-[#E5E7EB] rounded-xl p-8 text-center space-y-4">
        <CheckCircle2 className="w-10 h-10 text-[#16A34A] mx-auto" />
        <h1 className="text-xl font-bold text-[#172337]">
          {language === 'bn'
            ? `আবেদন গৃহীত হয়েছে: ${submittedSeller}`
            : `Application Submitted: ${submittedSeller}`}
        </h1>
        <p className="text-xs text-[#6B7280]">
          {language === 'bn'
            ? 'স্ট্যাটাস বর্তমানে "Pending"। অ্যাডমিন প্যানেলের "Seller Applications" থেকে এটি অনুমোদন করা যাবে।'
            : 'Status is currently "Pending". Switch to the Admin Panel → Seller Applications to approve this store.'}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/admin/sellers"
            className="px-4 py-2.5 rounded-lg bg-[#172337] text-white text-xs font-semibold"
          >
            Go to Admin Approval
          </Link>
          <Link
            to="/seller"
            className="px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-xs font-semibold"
          >
            Seller Overview
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-8 space-y-4 text-xs"
    >
      <div>
        <h1 className="text-xl font-bold text-[#172337]">
          {language === 'bn' ? 'বাজারিও সেলার রেজিস্ট্রেশন' : 'Become a BAZARIO Seller'}
        </h1>
        <p className="text-[#6B7280] mt-1">
          {language === 'bn'
            ? 'বাংলাদেশের লক্ষ লক্ষ ক্রেতার কাছে আপনার পণ্য পৌঁছে দিন।'
            : 'Apply to open a verified multi-vendor storefront on BAZARIO.'}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          required
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          placeholder="Owner Full Name *"
          className="px-3.5 py-2.5 border border-[#E5E7EB] rounded-lg"
        />
        <input
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone Number (017XX-XXXXXX) *"
          className="px-3.5 py-2.5 border border-[#E5E7EB] rounded-lg font-mono"
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Business Email *"
          className="px-3.5 py-2.5 border border-[#E5E7EB] rounded-lg"
        />
        <input
          required
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          placeholder="Store Name *"
          className="px-3.5 py-2.5 border border-[#E5E7EB] rounded-lg"
        />
        <select
          value={businessCategory}
          onChange={(e) => setBusinessCategory(e.target.value)}
          className="px-3.5 py-2.5 border border-[#E5E7EB] rounded-lg bg-white"
        >
          <option>Fashion</option>
          <option>Electronics &amp; Gadgets</option>
          <option>Beauty &amp; Skincare</option>
          <option>Home &amp; Living</option>
          <option>Sports &amp; Books</option>
        </select>
        <input
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Business Address (Dhaka/Chattogram/...) *"
          className="px-3.5 py-2.5 border border-[#E5E7EB] rounded-lg"
        />
      </div>
      <textarea
        required
        rows={3}
        value={descriptionEn}
        onChange={(e) => setDescriptionEn(e.target.value)}
        placeholder="Describe your store and products..."
        className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-lg"
      />
      <button
        type="submit"
        className="px-6 py-3 rounded-lg bg-[#F85606] text-white font-semibold"
      >
        {language === 'bn' ? 'সেলার আবেদন জমা দিন' : 'Submit Seller Application'}
      </button>
    </form>
  );
};
