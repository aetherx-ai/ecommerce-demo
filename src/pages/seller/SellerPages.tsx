import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Minus,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ResilientImage } from '../../components/common/ResilientImage';
import { useBazario } from '../../contexts/BazarioContext';
import { BAZARIO_IMAGES } from '../../data/bazarioData';
import { OrderStatus, Product } from '../../types/bazario';
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
    { day: 'Sat', amt: Math.round(totalSalesBdt * 0.11) + 4200 },
    { day: 'Sun', amt: Math.round(totalSalesBdt * 0.14) + 5800 },
    { day: 'Mon', amt: Math.round(totalSalesBdt * 0.12) + 4900 },
    { day: 'Tue', amt: Math.round(totalSalesBdt * 0.16) + 7400 },
    { day: 'Wed', amt: Math.round(totalSalesBdt * 0.15) + 6500 },
    { day: 'Thu', amt: Math.round(totalSalesBdt * 0.18) + 8900 },
    { day: 'Fri', amt: Math.round(totalSalesBdt * 0.22) + 11200 },
  ];
  const maxBar = Math.max(...weeklyRevenue.map((d) => d.amt), 1);

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

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <p className="text-xs text-[#6B7280]">
            {language === 'bn' ? 'মোট বিক্রয়' : 'Total Sales'}
          </p>
          <p className="text-xl font-bold text-[#F85606] mt-1 tabular-nums">
            {formatBDT(totalSalesBdt, language)}
          </p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <p className="text-xs text-[#6B7280]">
            {language === 'bn' ? 'মোট অর্ডার' : 'Assigned Orders'}
          </p>
          <p className="text-xl font-bold text-[#172337] mt-1 tabular-nums">
            {formatNum(myOrders.length, language)}
          </p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <p className="text-xs text-[#6B7280]">
            {language === 'bn' ? 'আমার পণ্য' : 'My Products'}
          </p>
          <p className="text-xl font-bold text-[#172337] mt-1 tabular-nums">
            {formatNum(myProducts.length, language)}
          </p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <p className="text-xs text-[#6B7280]">
            {language === 'bn' ? 'চলমান / পেন্ডিং' : 'Pending Orders'}
          </p>
          <p className="text-xl font-bold text-[#D97706] mt-1 tabular-nums">
            {formatNum(pendingCount, language)}
          </p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <p className="text-xs text-[#6B7280]">
            {language === 'bn' ? 'সম্পন্ন অর্ডার' : 'Completed'}
          </p>
          <p className="text-xl font-bold text-[#16A34A] mt-1 tabular-nums">
            {formatNum(completedCount, language)}
          </p>
        </div>
      </div>

      {/* Revenue Chart + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-[#E5E7EB] rounded-xl p-5">
          <h2 className="text-base font-bold text-[#172337] mb-4">
            {language === 'bn' ? 'সাপ্তাহিক বিক্রয় গ্রাফ' : 'Weekly Store Revenue (BDT)'}
          </h2>
          <div className="grid grid-cols-7 gap-3 items-end h-48 pt-4 border-b border-[#E5E7EB]">
            {weeklyRevenue.map((d) => (
              <div key={d.day} className="flex flex-col items-center justify-end h-full gap-1.5">
                <span className="text-[10px] font-mono text-[#6B7280] tabular-nums hidden sm:inline">
                  {formatBDT(d.amt, language)}
                </span>
                <div className="w-full max-w-[38px] flex-1 flex items-end">
                  <div
                    className="w-full bg-[#F85606] rounded-t"
                    style={{ height: `${Math.max(15, Math.round((d.amt / maxBar) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-3 pt-2 text-center text-[11px] font-mono text-[#6B7280]">
            {weeklyRevenue.map((d) => (
              <span key={d.day}>{d.day}</span>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-3">
          <h2 className="text-base font-bold text-[#172337]">
            {language === 'bn' ? 'লো-স্টক সতর্কতা' : 'Low Stock Alerts'} ({lowStockProducts.length})
          </h2>
          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-[#16A34A]">
              {language === 'bn' ? 'সব পণ্যের পর্যাপ্ত স্টক রয়েছে।' : 'All SKUs have healthy stock.'}
            </p>
          ) : (
            <div className="space-y-2.5">
              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-between gap-2 text-xs"
                >
                  <span className="font-medium text-[#202124] truncate">
                    {getText(p.name, language)}
                  </span>
                  <span className="font-mono font-bold text-[#D97706] shrink-0">
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Selling & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[#172337]">
              {language === 'bn' ? 'সেরা বিক্রিত পণ্য' : 'Top-Selling Store Products'}
            </h2>
            <Link to="/seller/products" className="text-xs font-semibold text-[#F85606]">
              {language === 'bn' ? 'সব দেখুন' : 'Manage'}
            </Link>
          </div>
          <div className="divide-y divide-[#F1F3F5] text-xs">
            {topSelling.map((p) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                <span className="font-medium text-[#202124] truncate">
                  {getText(p.name, language)}
                </span>
                <span className="font-mono text-[#6B7280] shrink-0">
                  {p.soldCount} sold · {formatBDT(p.discountedPrice, language)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[#172337]">
              {language === 'bn' ? 'সাম্প্রতিক অর্ডার' : 'Recent Store Orders'}
            </h2>
            <Link to="/seller/orders" className="text-xs font-semibold text-[#F85606]">
              {language === 'bn' ? 'সব অর্ডার' : 'View All'}
            </Link>
          </div>
          <div className="divide-y divide-[#F1F3F5] text-xs">
            {myOrders.slice(0, 4).map((o) => (
              <div key={o.id} className="py-2.5 flex items-center justify-between gap-2">
                <div>
                  <span className="font-mono font-bold text-[#172337]">#{o.id}</span>
                  <span className="text-[#6B7280] ml-2">{o.customerName}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#F5F6FA] font-semibold">
                  {o.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SellerProductsPage: React.FC = () => {
  const { language, activeSellerId, products, deleteSellerProduct } = useBazario();
  const navigate = useNavigate();

  const myProducts = products.filter((p) => p.sellerId === activeSellerId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-[#172337]">
          {language === 'bn' ? 'আমার পণ্যসমূহ' : 'My Store Products'} ({myProducts.length})
        </h1>
        <Link
          to="/seller/products/new"
          className="px-4 py-2 rounded-lg bg-[#F85606] text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? 'নতুন পণ্য যোগ' : 'Add New Product'}</span>
        </Link>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F5F6FA] border-b border-[#E5E7EB] text-[#6B7280] uppercase">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Moderation</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3F5]">
              {myProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#F5F6FA]">
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-8 rounded bg-[#F5F6FA] overflow-hidden shrink-0">
                        <ResilientImage
                          src={p.images[0]}
                          alt={getText(p.name, language)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-semibold text-[#202124] truncate max-w-[220px]">
                        {getText(p.name, language)}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[#6B7280]">{p.sku}</td>
                  <td className="py-2.5 px-4 font-bold text-[#F85606] tabular-nums">
                    {formatBDT(p.discountedPrice, language)}
                  </td>
                  <td className="py-2.5 px-4 font-mono tabular-nums">{p.stock}</td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded capitalize font-semibold ${
                        p.status === 'approved'
                          ? 'bg-[#F0FDF4] text-[#16A34A]'
                          : p.status === 'pending'
                          ? 'bg-[#FFFBEB] text-[#D97706]'
                          : 'bg-[#FEF2F2] text-[#DC2626]'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/seller/products/edit/${p.id}`)}
                        aria-label="Edit product"
                        className="p-1.5 text-[#4B5563] hover:text-[#172337]"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSellerProduct(p.id)}
                        aria-label="Delete product"
                        className="p-1.5 text-[#4B5563] hover:text-[#DC2626]"
                      >
                        <Trash2 className="w-4 h-4" />
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

  const myOrders = orders.filter((o) =>
    o.items.some((i) => i.sellerId === activeSellerId)
  );

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-[#172337]">
        {language === 'bn' ? 'স্টোর অর্ডারসমূহ' : 'Assigned Store Orders'} ({myOrders.length})
      </h1>
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F5F6FA] border-b border-[#E5E7EB] text-[#6B7280] uppercase">
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Customer &amp; Delivery</th>
                <th className="py-3 px-4">Seller Items</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3F5]">
              {myOrders.map((o) => {
                const sellerItems = o.items.filter((i) => i.sellerId === activeSellerId);
                const sellerSubtotal = sellerItems.reduce(
                  (s, i) => s + i.unitPrice * i.quantity,
                  0
                );
                return (
                  <tr key={o.id} className="hover:bg-[#F5F6FA]">
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
                          {it.quantity} × {getText(it.productName, language)}
                        </p>
                      ))}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={o.status}
                        onChange={(e) =>
                          updateOrderStatus(o.id, e.target.value as OrderStatus)
                        }
                        className="px-2.5 py-1.5 rounded border border-[#E5E7EB] bg-white font-semibold"
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
  const myProducts = products.filter((p) => p.sellerId === activeSellerId);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-[#172337]">
        {language === 'bn' ? 'স্টক ও ইনভেন্টরি' : 'Store Inventory Management'}
      </h1>
      <div className="bg-white border border-[#E5E7EB] rounded-xl divide-y divide-[#F1F3F5]">
        {myProducts.map((p) => (
          <div
            key={p.id}
            className="p-4 flex flex-wrap items-center justify-between gap-4 text-xs"
          >
            <div>
              <p className="font-semibold text-[#202124]">{getText(p.name, language)}</p>
              <p className="font-mono text-[#6B7280]">{p.sku}</p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`font-semibold ${
                  p.stock <= 0
                    ? 'text-[#DC2626]'
                    : p.stock <= 8
                    ? 'text-[#D97706]'
                    : 'text-[#16A34A]'
                }`}
              >
                {p.stock <= 0 ? 'Out of Stock' : p.stock <= 8 ? 'Low Stock' : 'In Stock'}
              </span>
              <div className="inline-flex items-center border border-[#E5E7EB] rounded-md">
                <button
                  type="button"
                  onClick={() =>
                    saveSellerProduct({ ...p, stock: Math.max(0, p.stock - 1) })
                  }
                  className="w-8 h-8 flex items-center justify-center"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-mono font-bold tabular-nums">
                  {p.stock}
                </span>
                <button
                  type="button"
                  onClick={() => saveSellerProduct({ ...p, stock: p.stock + 1 })}
                  className="w-8 h-8 flex items-center justify-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SellerAnalyticsPage: React.FC = () => {
  const { language, activeSellerId, products, orders } = useBazario();
  const myProducts = products.filter((p) => p.sellerId === activeSellerId);
  const myOrders = orders.filter((o) => o.items.some((i) => i.sellerId === activeSellerId));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-3">
        <h2 className="text-base font-bold text-[#172337]">
          {language === 'bn' ? 'পণ্য পারফরম্যান্স' : 'Product Sales Performance'}
        </h2>
        <div className="space-y-3 text-xs">
          {myProducts.slice(0, 6).map((p) => (
            <div key={p.id} className="space-y-1">
              <div className="flex justify-between">
                <span className="font-medium truncate pr-4">
                  {getText(p.name, language)}
                </span>
                <span className="font-mono font-bold tabular-nums">
                  {p.soldCount} sold
                </span>
              </div>
              <div className="h-2 bg-[#F5F6FA] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#172337]"
                  style={{ width: `${Math.min(100, Math.round((p.soldCount / 450) * 100))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-3">
        <h2 className="text-base font-bold text-[#172337]">
          {language === 'bn' ? 'পেমেন্ট মেথড বিভাজন' : 'Store Order Payment Mix'}
        </h2>
        <div className="divide-y divide-[#F1F3F5] text-xs">
          {['Cash on Delivery', 'bKash', 'Nagad', 'Card Payment'].map((pm) => {
            const count = myOrders.filter((o) => o.paymentMethod === pm).length;
            return (
              <div key={pm} className="py-2.5 flex justify-between">
                <span>{pm}</span>
                <span className="font-mono font-bold">{count} orders</span>
              </div>
            );
          })}
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
