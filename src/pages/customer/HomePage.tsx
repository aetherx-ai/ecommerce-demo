import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Flame,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Tag,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../../components/common/ProductCard';
import { QuickViewModal } from '../../components/common/QuickViewModal';
import { ResilientImage } from '../../components/common/ResilientImage';
import { useBazario } from '../../contexts/BazarioContext';
import { t } from '../../data/i18n';
import { Product } from '../../types/bazario';
import { formatNum, getText } from '../../utils/formatters';

export const HomePage: React.FC = () => {
  const {
    language,
    categories,
    products,
    sellers,
    heroSlides,
    recentlyViewed,
    reviews,
    coupons,
    showToast,
  } = useBazario();

  const [slideIdx, setSlideIdx] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [countdown, setCountdown] = useState(14 * 3600 + 28 * 60 + 42);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 24 * 3600));
    }, 1000);
    return () => window.clearInterval(tick);
  }, []);

  const hours = String(Math.floor(countdown / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((countdown % 3600) / 60)).padStart(2, '0');
  const seconds = String(countdown % 60).padStart(2, '0');

  const approvedProducts = useMemo(
    () => products.filter((p) => p.status === 'approved'),
    [products]
  );

  const flashSaleProducts = useMemo(
    () => approvedProducts.filter((p) => p.isFlashSale).slice(0, 5),
    [approvedProducts]
  );
  const trendingProducts = useMemo(
    () => approvedProducts.filter((p) => p.isTrending).slice(0, 5),
    [approvedProducts]
  );
  const bestSellingProducts = useMemo(
    () => [...approvedProducts].sort((a, b) => b.soldCount - a.soldCount).slice(0, 5),
    [approvedProducts]
  );
  const newArrivals = useMemo(
    () => approvedProducts.filter((p) => p.isNewArrival).slice(0, 5),
    [approvedProducts]
  );
  const topRatedProducts = useMemo(
    () => [...approvedProducts].sort((a, b) => b.rating - a.rating).slice(0, 5),
    [approvedProducts]
  );
  const recommendedProducts = useMemo(
    () => approvedProducts.slice(0, 10),
    [approvedProducts]
  );
  const electronicsProducts = useMemo(
    () =>
      approvedProducts
        .filter((p) => p.categorySlug === 'electronics' || p.categorySlug === 'mobile-gadgets')
        .slice(0, 5),
    [approvedProducts]
  );
  const fashionProducts = useMemo(
    () =>
      approvedProducts
        .filter((p) => p.categorySlug === 'fashion' || p.categorySlug === 'footwear')
        .slice(0, 5),
    [approvedProducts]
  );
  const beautyProducts = useMemo(
    () => approvedProducts.filter((p) => p.categorySlug === 'beauty').slice(0, 4),
    [approvedProducts]
  );
  const homeLivingProducts = useMemo(
    () => approvedProducts.filter((p) => p.categorySlug === 'home-living').slice(0, 4),
    [approvedProducts]
  );
  const recentProducts = useMemo(
    () =>
      recentlyViewed
        .map((id) => approvedProducts.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p))
        .slice(0, 5),
    [recentlyViewed, approvedProducts]
  );

  const approvedSellers = useMemo(
    () => sellers.filter((s) => s.status === 'approved'),
    [sellers]
  );

  const featuredBrands = useMemo(() => {
    const counts = new Map<string, number>();
    approvedProducts.forEach((p) => counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1));
    return Array.from(counts.entries()).slice(0, 8);
  }, [approvedProducts]);

  const activeSlide = heroSlides[slideIdx] ?? heroSlides[0];

  const renderSectionHeader = (
    titleKey: Parameters<typeof t>[0],
    linkTo: string,
    accentIcon?: React.ReactNode
  ) => (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-2">
        {accentIcon}
        <h2 className="text-lg sm:text-xl font-bold text-[#172337]">
          {t(titleKey, language)}
        </h2>
      </div>
      <Link
        to={linkTo}
        className="inline-flex items-center gap-1 text-xs font-semibold text-[#F85606] hover:underline whitespace-nowrap shrink-0"
      >
        <span>{t('viewAll', language)}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8 sm:space-y-10">
      {/* 0. HERO CAROUSEL + QUICK CAMPAIGN PANEL */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div
          className="lg:col-span-9 relative rounded-xl overflow-hidden min-h-[260px] sm:min-h-[360px] lg:min-h-[410px] shadow-sm"
          style={{ backgroundColor: activeSlide.bgColor }}
        >
          <ResilientImage
            src={activeSlide.image}
            alt={getText(activeSlide.title, language)}
            loading="eager"
            className="w-full h-full object-cover absolute inset-0 opacity-90 transition-opacity duration-500"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#172337]/90 via-[#172337]/60 to-transparent"
          />
          <div className="relative z-10 h-full p-6 sm:p-10 flex flex-col justify-between max-w-xl text-white">
            <div>
              <span className="inline-block px-3 py-1 rounded bg-[#F85606] text-white text-[11px] font-semibold uppercase tracking-wide mb-3">
                {getText(activeSlide.badge, language)}
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-balance mb-3">
                {getText(activeSlide.title, language)}
              </h1>
              <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-md">
                {getText(activeSlide.subtitle, language)}
              </p>
            </div>

            <div className="pt-5 flex items-center gap-3">
              <Link
                to={activeSlide.ctaLink}
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[42px] rounded-lg bg-[#F85606] hover:bg-[#E04A00] text-white text-xs sm:text-sm font-semibold transition-colors"
              >
                <span>{getText(activeSlide.ctaLabel, language)}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center px-4 py-2.5 min-h-[42px] rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-medium backdrop-blur-xs transition-colors"
              >
                {language === 'bn' ? 'সব ডিল দেখুন' : 'All Deals'}
              </Link>
            </div>
          </div>

          {/* Carousel Controls */}
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() =>
              setSlideIdx((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/35 hover:bg-black/60 text-white flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => setSlideIdx((prev) => (prev + 1) % heroSlides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/35 hover:bg-black/60 text-white flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3.5 right-5 z-20 flex items-center gap-1.5">
            {heroSlides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Slide ${idx + 1}`}
                onClick={() => setSlideIdx(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === slideIdx ? 'w-6 bg-[#F85606]' : 'w-2 bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Side: Voucher & Festival Highlights Card */}
        <div className="lg:col-span-3 bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#F85606] mb-1">
              <Tag className="w-4 h-4" />
              <span>{language === 'bn' ? 'উৎসব কুপন কোড' : 'Live Promo Vouchers'}</span>
            </div>
            <p className="text-xs text-[#6B7280] mb-3">
              {language === 'bn'
                ? 'চেকআউটে কোড ব্যবহার করে তাৎক্ষণিক ডিসকাউন্ট পান।'
                : 'Copy a code and apply in your cart or checkout.'}
            </p>
            <div className="space-y-2">
              {coupons.slice(0, 3).map((cpn) => (
                <button
                  key={cpn.id}
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(cpn.code).catch(() => {});
                    showToast(
                      language === 'bn'
                        ? `কুপন ${cpn.code} কপি করা হয়েছে`
                        : `Copied code ${cpn.code}`
                    );
                  }}
                  className="w-full p-2.5 rounded-lg border border-dashed border-[#F85606]/50 bg-[#FFF8F5] hover:bg-[#FFF0E8] text-left flex items-center justify-between gap-2 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-bold text-[#F85606]">
                      {cpn.code}
                    </p>
                    <p className="text-[11px] text-[#4B5563] truncate">
                      {getText(cpn.description, language)}
                    </p>
                  </div>
                  <Copy className="w-3.5 h-3.5 text-[#F85606] shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 text-[#16A34A] font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>{language === 'bn' ? '১০০% আসল পণ্য' : '100% Authentic'}</span>
            </span>
            <Link to="/track-order" className="text-[#172337] font-semibold hover:text-[#F85606]">
              {t('trackOrder', language)} →
            </Link>
          </div>
        </div>
      </section>

      {/* 1. SHOP BY CATEGORIES */}
      <section>
        {renderSectionHeader('shopByCategories', '/shop')}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2.5 sm:gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group bg-white border border-[#E5E7EB] hover:border-[#F85606] rounded-lg p-2.5 flex flex-col items-center text-center transition-all hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-[#F5F6FA] mb-2">
                <ResilientImage
                  src={cat.image}
                  alt={getText(cat.name, language)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-[11px] sm:text-xs font-medium text-[#202124] group-hover:text-[#F85606] line-clamp-2 leading-tight">
                {getText(cat.name, language)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. FLASH SALE WITH COUNTDOWN */}
      <section className="bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-5 border-b border-[#E5E7EB]">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#F85606]" />
              <h2 className="text-lg sm:text-xl font-bold text-[#F85606]">
                {t('flashSale', language)}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#6B7280] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {t('endsIn', language)}
              </span>
              <div className="flex items-center gap-1 font-mono font-bold tabular-nums">
                <span className="px-2 py-1 rounded bg-[#172337] text-white">{hours}</span>
                <span>:</span>
                <span className="px-2 py-1 rounded bg-[#172337] text-white">{minutes}</span>
                <span>:</span>
                <span className="px-2 py-1 rounded bg-[#F85606] text-white">{seconds}</span>
              </div>
            </div>
          </div>

          <Link
            to="/shop?discount=true"
            className="text-xs font-semibold text-[#F85606] hover:underline"
          >
            {t('viewAll', language)} →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {flashSaleProducts.map((p) => (
            <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />
          ))}
        </div>
      </section>

      {/* 3. TRENDING PRODUCTS */}
      <section>
        {renderSectionHeader('trendingProducts', '/shop?sort=best')}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {trendingProducts.map((p) => (
            <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />
          ))}
        </div>
      </section>

      {/* 4. BEST SELLING PRODUCTS */}
      <section>
        {renderSectionHeader('bestSelling', '/shop?sort=best')}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {bestSellingProducts.map((p) => (
            <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />
          ))}
        </div>
      </section>

      {/* 14. PROMOTIONAL CAMPAIGN BANNERS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/category/electronics"
          className="group relative rounded-xl overflow-hidden bg-[#172337] text-white p-6 sm:p-8 flex flex-col justify-between min-h-[180px]"
        >
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#F85606]">
              {language === 'bn' ? 'অফিসিয়াল ওয়ারেন্টি' : 'Official Warranty'}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold mt-1">
              {language === 'bn'
                ? 'স্মার্টফোন ও ল্যাপটপ ফেস্ট — কোড TECH15'
                : 'Tech & Gadget Fest — Extra 15% Off (TECH15)'}
            </h3>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 group-hover:text-[#F85606] mt-4">
            {language === 'bn' ? 'এখনই কিনুন' : 'Explore Tech Deals'}
            <ArrowRight className="w-4 h-4" />
          </span>
        </Link>

        <Link
          to="/category/fashion"
          className="group relative rounded-xl overflow-hidden bg-[#7C2D12] text-white p-6 sm:p-8 flex flex-col justify-between min-h-[180px]"
        >
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#FED7AA]">
              {language === 'bn' ? 'দেশীয় তাঁত ও ফ্যাশন' : 'Bangladeshi Artisans'}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold mt-1">
              {language === 'bn'
                ? 'ঢাকাই জামদানি ও হ্যান্ডলুম পাঞ্জাবিতে ২০% ছাড়'
                : 'Handwoven Jamdani & Panjabi — 20% Off (FASHION20)'}
            </h3>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 group-hover:text-[#FED7AA] mt-4">
            {language === 'bn' ? 'ফ্যাশন দেখুন' : 'Shop Heritage Fashion'}
            <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </section>

      {/* 5. RECOMMENDED FOR YOU */}
      <section>
        {renderSectionHeader('recommendedForYou', '/shop')}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {recommendedProducts.map((p) => (
            <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />
          ))}
        </div>
      </section>

      {/* 6. NEW ARRIVALS & 7. TOP RATED */}
      <section>
        {renderSectionHeader('newArrivals', '/shop?sort=newest', <Sparkles className="w-4 h-4 text-[#F85606]" />)}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />
          ))}
        </div>
      </section>

      <section>
        {renderSectionHeader('topRated', '/shop?sort=rating', <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />)}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {topRatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />
          ))}
        </div>
      </section>

      {/* 8. ELECTRONICS COLLECTION */}
      <section>
        {renderSectionHeader('electronicsCollection', '/category/electronics')}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {electronicsProducts.map((p) => (
            <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />
          ))}
        </div>
      </section>

      {/* 9. FASHION COLLECTION */}
      <section>
        {renderSectionHeader('fashionCollection', '/category/fashion')}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {fashionProducts.map((p) => (
            <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />
          ))}
        </div>
      </section>

      {/* 10 & 11. BEAUTY & HOME LIVING TWO-COLUMN SPOTLIGHT */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-5">
          {renderSectionHeader('beautyLifestyle', '/category/beauty')}
          <div className="grid grid-cols-2 gap-3">
            {beautyProducts.map((p) => (
              <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />
            ))}
          </div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-5">
          {renderSectionHeader('homeLiving', '/category/home-living')}
          <div className="grid grid-cols-2 gap-3">
            {homeLivingProducts.map((p) => (
              <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />
            ))}
          </div>
        </div>
      </section>

      {/* 12. FEATURED BRANDS */}
      <section>
        {renderSectionHeader('featuredBrands', '/shop')}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {featuredBrands.map(([brand, count]) => (
            <Link
              key={brand}
              to={`/search?q=${encodeURIComponent(brand)}`}
              className="bg-white border border-[#E5E7EB] hover:border-[#F85606] rounded-lg p-3.5 text-center transition-colors"
            >
              <p className="text-xs font-bold text-[#172337] truncate">{brand}</p>
              <p className="text-[11px] text-[#6B7280] mt-0.5 tabular-nums">
                {formatNum(count, language)} {language === 'bn' ? 'টি পণ্য' : 'items'}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 13. POPULAR VERIFIED SELLERS */}
      <section>
        {renderSectionHeader('popularSellers', '/shop', <Store className="w-4 h-4 text-[#F85606]" />)}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {approvedSellers.map((seller) => (
            <Link
              key={seller.id}
              to={`/store/${seller.slug}`}
              className="bg-white border border-[#E5E7EB] hover:border-[#F85606] rounded-xl p-4 flex items-center gap-3.5 transition-all hover:-translate-y-0.5"
            >
              <div
                className="w-12 h-12 rounded-lg text-white font-bold text-sm flex items-center justify-center shrink-0"
                style={{ backgroundColor: seller.bannerColor }}
              >
                {seller.logoInitials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-bold text-[#172337] truncate">
                    {seller.storeName}
                  </p>
                  {seller.verified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-[#6B7280] truncate">
                  {seller.businessCategory}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-[#4B5563] mt-1 tabular-nums">
                  <span className="inline-flex items-center gap-0.5 font-medium text-[#202124]">
                    <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                    {seller.rating}
                  </span>
                  <span>·</span>
                  <span>
                    {formatNum(seller.totalSalesCount, language)}{' '}
                    {language === 'bn' ? 'সেল' : 'sales'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 15. RECENTLY VIEWED PRODUCTS */}
      {recentProducts.length > 0 && (
        <section>
          {renderSectionHeader('recentlyViewed', '/shop')}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {recentProducts.map((p) => (
              <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />
            ))}
          </div>
        </section>
      )}

      {/* 16. CUSTOMER TESTIMONIALS */}
      <section className="bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4 mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-[#172337]">
            {t('customerReviews', language)}
          </h2>
          <span className="text-[11px] text-[#6B7280]">
            {language === 'bn' ? 'ডেমো ক্রেতা মতামত' : 'Sample Marketplace Reviews'}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reviews.slice(0, 4).map((rev) => (
            <div
              key={rev.id}
              className="p-4 rounded-lg bg-[#F5F6FA] border border-[#E5E7EB] flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-0.5 mb-2">
                  {Array.from({ length: rev.rating }).map((_, idx) => (
                    <Star
                      key={idx}
                      className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]"
                    />
                  ))}
                </div>
                <p className="text-xs text-[#202124] leading-relaxed">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>
              <div className="text-[11px] text-[#6B7280] pt-2 border-t border-[#E5E7EB]">
                <span className="font-semibold text-[#172337]">{rev.customerName}</span> ·{' '}
                <span>{rev.location}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 17. NEWSLETTER SUBSCRIPTION BAND */}
      <section className="bg-[#172337] text-white rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-lg">
          <h2 className="text-xl font-bold">{t('newsletterTitle', language)}</h2>
          <p className="text-xs sm:text-sm text-white/75 mt-1">
            {t('newsletterSub', language)}
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newsletterEmail.includes('@')) return;
            showToast(
              language === 'bn'
                ? 'বাজারিও অফার লিস্টে যুক্ত হয়েছেন!'
                : 'Subscribed to BAZARIO deals!'
            );
            setNewsletterEmail('');
          }}
          className="w-full md:w-auto flex gap-2"
        >
          <input
            type="email"
            required
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 md:w-64 min-h-[42px] px-3.5 rounded-lg bg-white text-[#202124] text-sm focus:outline-none"
          />
          <button
            type="submit"
            className="px-5 min-h-[42px] rounded-lg bg-[#F85606] hover:bg-[#E04A00] text-white text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0"
          >
            {language === 'bn' ? 'সাবস্ক্রাইব' : 'Subscribe'}
          </button>
        </form>
      </section>

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
