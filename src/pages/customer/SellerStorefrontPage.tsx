import React, { useMemo, useState } from 'react';
import { CheckCircle2, MapPin, Search, Star, Store } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { ProductCard } from '../../components/common/ProductCard';
import { useBazario } from '../../contexts/BazarioContext';
import { formatNum, getText } from '../../utils/formatters';

export const SellerStorefrontPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language, sellers, products, categories } = useBazario();

  const seller = useMemo(
    () => sellers.find((s) => s.slug === slug) ?? sellers[0],
    [sellers, slug]
  );

  const [storeQuery, setStoreQuery] = useState('');
  const [storeCat, setStoreCat] = useState('all');

  const sellerProducts = useMemo(
    () =>
      products.filter(
        (p) => p.sellerId === seller.id && p.status === 'approved'
      ),
    [products, seller.id]
  );

  const bestSellers = useMemo(
    () => [...sellerProducts].sort((a, b) => b.soldCount - a.soldCount).slice(0, 4),
    [sellerProducts]
  );

  const filteredProducts = useMemo(() => {
    const q = storeQuery.trim().toLowerCase();
    return sellerProducts.filter((p) => {
      if (storeCat !== 'all' && p.categorySlug !== storeCat) return false;
      if (
        q &&
        !p.name.en.toLowerCase().includes(q) &&
        !p.name.bn.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [sellerProducts, storeQuery, storeCat]);

  const sellerCategorySlugs = Array.from(
    new Set(sellerProducts.map((p) => p.categorySlug))
  );

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Store Banner */}
      <div
        className="rounded-xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6"
        style={{ backgroundColor: seller.bannerColor }}
      >
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-white text-[#172337] font-bold text-xl flex items-center justify-center shrink-0">
            {seller.logoInitials}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold">{seller.storeName}</h1>
              {seller.verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#16A34A] text-white text-[11px] font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  {language === 'bn' ? 'ভেরিফায়েড' : 'Verified'}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl">
              {getText(seller.description, language)}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-white/85">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {seller.address}
              </span>
              <span className="inline-flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                {seller.rating} ({formatNum(seller.reviewCount, language)})
              </span>
              <span className="inline-flex items-center gap-1">
                <Store className="w-3.5 h-3.5" />
                {formatNum(seller.totalSalesCount, language)}{' '}
                {language === 'bn' ? 'সফল বিক্রয়' : 'completed orders'}
              </span>
            </div>
          </div>
        </div>

        {/* Store Search */}
        <div className="w-full md:w-72">
          <div className="relative">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={storeQuery}
              onChange={(e) => setStoreQuery(e.target.value)}
              placeholder={
                language === 'bn' ? 'এই স্টোরে খুঁজুন...' : 'Search in this store...'
              }
              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white text-[#202124] text-xs focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setStoreCat('all')}
          className={`px-3.5 py-2 rounded-lg text-xs font-medium border ${
            storeCat === 'all'
              ? 'bg-[#F85606] text-white border-[#F85606]'
              : 'bg-white text-[#202124] border-[#E5E7EB]'
          }`}
        >
          {language === 'bn' ? 'সব পণ্য' : 'All Products'} ({sellerProducts.length})
        </button>
        {sellerCategorySlugs.map((cSlug) => {
          const catObj = categories.find((c) => c.slug === cSlug);
          return (
            <button
              key={cSlug}
              type="button"
              onClick={() => setStoreCat(cSlug)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium border ${
                storeCat === cSlug
                  ? 'bg-[#F85606] text-white border-[#F85606]'
                  : 'bg-white text-[#202124] border-[#E5E7EB]'
              }`}
            >
              {catObj ? getText(catObj.name, language) : cSlug}
            </button>
          );
        })}
      </div>

      {/* Best Sellers in Store */}
      {bestSellers.length > 0 && storeCat === 'all' && !storeQuery && (
        <section>
          <h2 className="text-base sm:text-lg font-bold text-[#172337] mb-3">
            {language === 'bn' ? 'স্টোরের সেরা বিক্রিত পণ্য' : 'Store Best Sellers'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Full Store Catalog */}
      <section>
        <h2 className="text-base sm:text-lg font-bold text-[#172337] mb-3">
          {language === 'bn' ? 'স্টোর ক্যাটালগ' : 'Store Catalog'} (
          {formatNum(filteredProducts.length, language)})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
};
