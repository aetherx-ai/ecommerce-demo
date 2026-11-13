import React, { useMemo, useState } from 'react';
import { Filter, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../../components/common/ProductCard';
import { QuickViewModal } from '../../components/common/QuickViewModal';
import { useBazario } from '../../contexts/BazarioContext';
import { Product } from '../../types/bazario';
import { formatNum, getText } from '../../utils/formatters';

export const CatalogPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { language, categories, sellers, products } = useBazario();

  const initialQuery = searchParams.get('q') ?? '';
  const initialSub = searchParams.get('sub') ?? '';
  const initialSort = searchParams.get('sort') ?? 'recommended';
  const initialDiscount = searchParams.get('discount') === 'true';

  const [selectedCat, setSelectedCat] = useState<string>(slug ?? 'all');
  const [selectedSub, setSelectedSub] = useState<string>(initialSub);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedSeller, setSelectedSeller] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyDiscount, setOnlyDiscount] = useState<boolean>(initialDiscount);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  React.useEffect(() => {
    setSelectedCat(slug ?? 'all');
    setSelectedSub(searchParams.get('sub') ?? '');
    setOnlyDiscount(searchParams.get('discount') === 'true');
    const nextSort = searchParams.get('sort');
    if (nextSort) setSortBy(nextSort);
  }, [slug, searchParams]);

  const approvedProducts = useMemo(
    () => products.filter((p) => p.status === 'approved'),
    [products]
  );

  const uniqueBrands = useMemo(
    () => Array.from(new Set(approvedProducts.map((p) => p.brand))).sort(),
    [approvedProducts]
  );

  const activeCategoryObj = categories.find((c) => c.slug === selectedCat);

  const filteredProducts = useMemo(() => {
    const q = (searchParams.get('q') ?? '').trim().toLowerCase();
    const minP = minPrice ? Number(minPrice) : 0;
    const maxP = maxPrice ? Number(maxPrice) : Infinity;

    const result = approvedProducts.filter((p) => {
      if (selectedCat !== 'all' && p.categorySlug !== selectedCat) return false;
      if (selectedSub && p.subcategorySlug !== selectedSub) return false;
      if (selectedBrand !== 'all' && p.brand !== selectedBrand) return false;
      if (selectedSeller !== 'all' && p.sellerId !== selectedSeller) return false;
      if (p.discountedPrice < minP || p.discountedPrice > maxP) return false;
      if (p.rating < minRating) return false;
      if (onlyDiscount && p.discountPercent <= 0) return false;
      if (onlyInStock && p.stock <= 0) return false;

      if (q) {
        const sellerName = sellers.find((s) => s.id === p.sellerId)?.storeName ?? '';
        const match =
          p.name.en.toLowerCase().includes(q) ||
          p.name.bn.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.categorySlug.toLowerCase().includes(q) ||
          sellerName.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });

    switch (sortBy) {
      case 'best':
        return [...result].sort((a, b) => b.soldCount - a.soldCount);
      case 'newest':
        return [...result].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      case 'price-asc':
        return [...result].sort((a, b) => a.discountedPrice - b.discountedPrice);
      case 'price-desc':
        return [...result].sort((a, b) => b.discountedPrice - a.discountedPrice);
      case 'rating':
        return [...result].sort((a, b) => b.rating - a.rating);
      default:
        return result;
    }
  }, [
    approvedProducts,
    selectedCat,
    selectedSub,
    selectedBrand,
    selectedSeller,
    minPrice,
    maxPrice,
    minRating,
    onlyDiscount,
    onlyInStock,
    sortBy,
    searchParams,
    sellers,
  ]);

  const resetFilters = () => {
    setSelectedCat(slug ?? 'all');
    setSelectedSub('');
    setSelectedBrand('all');
    setSelectedSeller('all');
    setMinPrice('');
    setMaxPrice('');
    setMinRating(0);
    setOnlyDiscount(false);
    setOnlyInStock(false);
    setSortBy('recommended');
  };

  const FilterPanel = (
    <div className="space-y-5 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
        <span className="font-bold text-sm text-[#172337] flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-[#F85606]" />
          {language === 'bn' ? 'ফিল্টারসমূহ' : 'Filters'}
        </span>
        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex items-center gap-1 text-[#F85606] hover:underline font-medium"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{language === 'bn' ? 'রিসেট' : 'Reset'}</span>
        </button>
      </div>

      {/* Category */}
      <div>
        <p className="font-semibold text-[#172337] mb-2">
          {language === 'bn' ? 'ক্যাটাগরি' : 'Category'}
        </p>
        <select
          value={selectedCat}
          onChange={(e) => {
            setSelectedCat(e.target.value);
            setSelectedSub('');
          }}
          className="w-full px-3 py-2 rounded-md border border-[#E5E7EB] bg-white text-xs"
        >
          <option value="all">
            {language === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {getText(c.name, language)}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategory */}
      {activeCategoryObj && activeCategoryObj.subcategories.length > 0 && (
        <div>
          <p className="font-semibold text-[#172337] mb-2">
            {language === 'bn' ? 'সাব-ক্যাটাগরি' : 'Subcategory'}
          </p>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setSelectedSub('')}
              className={`block w-full text-left px-2 py-1 rounded ${
                !selectedSub ? 'bg-[#FFF4EE] text-[#F85606] font-semibold' : 'text-[#4B5563]'
              }`}
            >
              {language === 'bn' ? 'সবগুলো' : 'All'}
            </button>
            {activeCategoryObj.subcategories.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSub(sub.slug)}
                className={`block w-full text-left px-2 py-1 rounded ${
                  selectedSub === sub.slug
                    ? 'bg-[#FFF4EE] text-[#F85606] font-semibold'
                    : 'text-[#4B5563] hover:bg-[#F5F6FA]'
                }`}
              >
                {getText(sub.name, language)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <p className="font-semibold text-[#172337] mb-2">
          {language === 'bn' ? 'মূল্য সীমা (৳)' : 'Price Range (BDT)'}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min ৳"
            className="px-2.5 py-2 border border-[#E5E7EB] rounded-md bg-white font-mono"
          />
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max ৳"
            className="px-2.5 py-2 border border-[#E5E7EB] rounded-md bg-white font-mono"
          />
        </div>
      </div>

      {/* Brand */}
      <div>
        <p className="font-semibold text-[#172337] mb-2">
          {language === 'bn' ? 'ব্র্যান্ড' : 'Brand'}
        </p>
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-[#E5E7EB] bg-white"
        >
          <option value="all">{language === 'bn' ? 'সকল ব্র্যান্ড' : 'All Brands'}</option>
          {uniqueBrands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Seller */}
      <div>
        <p className="font-semibold text-[#172337] mb-2">
          {language === 'bn' ? 'সেলার স্টোর' : 'Seller'}
        </p>
        <select
          value={selectedSeller}
          onChange={(e) => setSelectedSeller(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-[#E5E7EB] bg-white"
        >
          <option value="all">{language === 'bn' ? 'সকল সেলার' : 'All Sellers'}</option>
          {sellers
            .filter((s) => s.status === 'approved')
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.storeName}
              </option>
            ))}
        </select>
      </div>

      {/* Rating */}
      <div>
        <p className="font-semibold text-[#172337] mb-2">
          {language === 'bn' ? 'ন্যূনতম রেটিং' : 'Minimum Rating'}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[0, 4.5, 4.8].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setMinRating(r)}
              className={`px-2.5 py-1.5 rounded border ${
                minRating === r
                  ? 'border-[#F85606] bg-[#FFF4EE] text-[#F85606] font-semibold'
                  : 'border-[#E5E7EB] bg-white text-[#4B5563]'
              }`}
            >
              {r === 0 ? (language === 'bn' ? 'সব' : 'All') : `${r}★+`}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-2.5 pt-2 border-t border-[#E5E7EB]">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyDiscount}
            onChange={(e) => setOnlyDiscount(e.target.checked)}
            className="accent-[#F85606] w-4 h-4"
          />
          <span>{language === 'bn' ? 'শুধুমাত্র ডিসকাউন্ট পণ্য' : 'Discounted Deals Only'}</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyInStock}
            onChange={(e) => setOnlyInStock(e.target.checked)}
            className="accent-[#F85606] w-4 h-4"
          />
          <span>{language === 'bn' ? 'শুধুমাত্র স্টকে আছে' : 'In Stock Only'}</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 bg-white border border-[#E5E7EB] rounded-xl p-5 sticky top-28">
          {FilterPanel}
        </aside>

        {/* Results Column */}
        <div className="lg:col-span-9 space-y-5">
          {/* Top Bar */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-[#172337]">
                {initialQuery
                  ? language === 'bn'
                    ? `"${initialQuery}" এর ফলাফল`
                    : `Search: "${initialQuery}"`
                  : activeCategoryObj
                  ? getText(activeCategoryObj.name, language)
                  : language === 'bn'
                  ? 'সকল পণ্য'
                  : 'All Marketplace Products'}
              </h1>
              <p className="text-xs text-[#6B7280] mt-0.5 tabular-nums">
                {formatNum(filteredProducts.length, language)}{' '}
                {language === 'bn' ? 'টি পণ্য পাওয়া গেছে' : 'products found'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-md border border-[#E5E7EB] bg-[#F5F6FA] text-xs font-medium"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#F85606]" />
                <span>{language === 'bn' ? 'ফিল্টার' : 'Filter'}</span>
              </button>

              <select
                aria-label="Sort products"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="min-h-[40px] px-3 py-2 rounded-md border border-[#E5E7EB] bg-white text-xs font-medium"
              >
                <option value="recommended">
                  {language === 'bn' ? 'বাছাইকৃত (Recommended)' : 'Recommended'}
                </option>
                <option value="best">
                  {language === 'bn' ? 'সর্বোচ্চ বিক্রিত' : 'Best Selling'}
                </option>
                <option value="newest">
                  {language === 'bn' ? 'নতুন পণ্য' : 'Newest Arrivals'}
                </option>
                <option value="price-asc">
                  {language === 'bn' ? 'দাম: কম থেকে বেশি' : 'Price: Low to High'}
                </option>
                <option value="price-desc">
                  {language === 'bn' ? 'দাম: বেশি থেকে কম' : 'Price: High to Low'}
                </option>
                <option value="rating">
                  {language === 'bn' ? 'সর্বোচ্চ রেটিং' : 'Highest Rated'}
                </option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-12 text-center">
              <p className="text-base font-semibold text-[#172337] mb-2">
                {language === 'bn'
                  ? 'এই ফিল্টারে কোনো পণ্য পাওয়া যায়নি'
                  : 'No products match your selected filters'}
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 px-5 py-2.5 rounded-lg bg-[#F85606] text-white text-xs font-semibold"
              >
                {language === 'bn' ? 'সব ফিল্টার রিসেট করুন' : 'Clear All Filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-black/45"
            onClick={() => setMobileFilterOpen(false)}
          />
          <aside className="relative w-80 max-w-[85vw] bg-white h-full z-10 p-5 overflow-y-auto">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close filters"
                className="p-1.5 text-[#6B7280]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {FilterPanel}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              className="mt-6 w-full min-h-[44px] bg-[#F85606] text-white text-xs font-semibold rounded-lg"
            >
              {language === 'bn'
                ? `${formatNum(filteredProducts.length, 'bn')}টি পণ্য দেখুন`
                : `Show ${filteredProducts.length} Results`}
            </button>
          </aside>
        </div>
      )}

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
