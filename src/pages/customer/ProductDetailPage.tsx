import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Star,
  Store,
  Truck,
  Zap,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ProductCard } from '../../components/common/ProductCard';
import { ResilientImage } from '../../components/common/ResilientImage';
import { useBazario } from '../../contexts/BazarioContext';
import { formatBDT, formatNum, getText } from '../../utils/formatters';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const {
    language,
    products,
    reviews,
    sellers,
    settings,
    wishlist,
    toggleWishlist,
    addToCart,
    recordProductView,
    addReview,
  } = useBazario();

  const product = useMemo(
    () => products.find((p) => p.slug === slug) ?? products[0],
    [products, slug]
  );

  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? 'Default');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? 'Standard');
  const [quantity, setQuantity] = useState(1);

  const [revName, setRevName] = useState('');
  const [revLocation, setRevLocation] = useState('Dhaka');
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');

  useEffect(() => {
    setSelectedImage(0);
    setSelectedColor(product.colors[0] ?? 'Default');
    setSelectedSize(product.sizes[0] ?? 'Standard');
    setQuantity(1);
    recordProductView(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);

  const seller = sellers.find((s) => s.id === product.sellerId);
  const isWishlisted = wishlist.includes(product.id);
  const productReviews = reviews.filter((r) => r.productId === product.id);
  const relatedProducts = products
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id && p.status === 'approved')
    .slice(0, 4);
  const frequentlyBought = products
    .filter((p) => p.id !== product.id && p.status === 'approved')
    .slice(0, 2);

  const title = getText(product.name, language);
  const isOutOfStock = product.stock <= 0;

  const handleBuyNow = () => {
    addToCart(product, selectedColor, selectedSize, quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revName.trim() || !revComment.trim()) return;
    addReview(product.id, revRating, revComment.trim(), revName.trim(), revLocation.trim());
    setRevName('');
    setRevComment('');
  };

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-[#6B7280] flex flex-wrap items-center gap-1.5">
        <Link to="/" className="hover:text-[#F85606]">
          {language === 'bn' ? 'হোম' : 'Home'}
        </Link>
        <span>/</span>
        <Link to={`/category/${product.categorySlug}`} className="hover:text-[#F85606] capitalize">
          {product.categorySlug}
        </Link>
        <span>/</span>
        <span className="text-[#202124] font-medium truncate max-w-xs">{title}</span>
      </nav>

      {/* Main Product Grid */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Gallery + Zoom */}
        <div className="lg:col-span-5 space-y-3">
          <div
            onClick={() => setZoomed((z) => !z)}
            title={language === 'bn' ? 'জুম করতে ক্লিক করুন' : 'Click to toggle zoom'}
            className="relative aspect-[4/3] bg-[#F5F6FA] rounded-xl overflow-hidden border border-[#E5E7EB] cursor-zoom-in"
          >
            <ResilientImage
              src={product.images[selectedImage] ?? product.images[0]}
              alt={title}
              loading="eager"
              className={`w-full h-full object-cover transition-transform duration-300 ${
                zoomed ? 'scale-125' : 'scale-100'
              }`}
            />
            {product.discountPercent > 0 && (
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-[#F85606] text-white text-xs font-bold tabular-nums">
                -{formatNum(product.discountPercent, language)}%
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {product.images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedImage(i)}
                className={`w-16 h-14 rounded-lg overflow-hidden border ${
                  selectedImage === i ? 'border-[#F85606] ring-2 ring-[#F85606]/30' : 'border-[#E5E7EB]'
                }`}
              >
                <ResilientImage src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Middle: Purchase Details */}
        <div className="lg:col-span-4 space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-1">
              <span className="font-semibold text-[#172337]">{product.brand}</span>
              <span>·</span>
              <span className="font-mono">SKU: {product.sku}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#202124] leading-snug">
              {title}
            </h1>

            <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 font-semibold text-[#202124]">
                <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                {product.rating}
              </span>
              <span className="text-[#6B7280]">
                {formatNum(product.reviewCount, language)}{' '}
                {language === 'bn' ? 'রিভিউ' : 'Reviews'}
              </span>
              <span className="text-[#6B7280]">|</span>
              <span className="text-[#16A34A] font-medium">
                {formatNum(product.soldCount, language)}{' '}
                {language === 'bn' ? 'বিক্রিত' : 'Sold'}
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-lg bg-[#F5F6FA] border border-[#E5E7EB]">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-bold text-[#F85606] tabular-nums">
                {formatBDT(product.discountedPrice, language)}
              </span>
              {product.regularPrice > product.discountedPrice && (
                <>
                  <span className="text-sm text-[#9CA3AF] line-through tabular-nums">
                    {formatBDT(product.regularPrice, language)}
                  </span>
                  <span className="text-xs font-semibold text-[#F85606]">
                    -{formatNum(product.discountPercent, language)}%
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Color & Size */}
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-[#4B5563] mb-1.5">
                {language === 'bn' ? 'কালার:' : 'Color:'} {selectedColor}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`px-3 py-1.5 text-xs rounded-md border ${
                      selectedColor === c
                        ? 'border-[#F85606] bg-[#FFF4EE] text-[#F85606] font-semibold'
                        : 'border-[#E5E7EB] text-[#202124]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#4B5563] mb-1.5">
                {language === 'bn' ? 'সাইজ / ভ্যারিয়েন্ট:' : 'Size / Option:'} {selectedSize}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`px-3 py-1.5 text-xs rounded-md border ${
                      selectedSize === sz
                        ? 'border-[#172337] bg-[#172337] text-white font-semibold'
                        : 'border-[#E5E7EB] text-[#202124]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quantity & Stock */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="inline-flex items-center border border-[#E5E7EB] rounded-lg">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center text-[#4B5563]"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center text-sm font-semibold tabular-nums">
                {formatNum(quantity, language)}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((q) => Math.min(Math.max(1, product.stock), q + 1))
                }
                className="w-10 h-10 flex items-center justify-center text-[#4B5563]"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <span
              className={`text-xs font-semibold ${
                isOutOfStock ? 'text-[#DC2626]' : 'text-[#16A34A]'
              }`}
            >
              {isOutOfStock
                ? language === 'bn'
                  ? 'স্টক শেষ'
                  : 'Out of Stock'
                : language === 'bn'
                ? `স্টকে আছে (${formatNum(product.stock, 'bn')}টি)`
                : `In Stock (${product.stock} available)`}
            </span>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => addToCart(product, selectedColor, selectedSize, quantity)}
              className="flex-1 min-w-[140px] min-h-[46px] px-4 rounded-lg bg-[#F85606] hover:bg-[#E04A00] disabled:bg-[#D1D5DB] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{language === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}</span>
            </button>
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              className="flex-1 min-w-[140px] min-h-[46px] px-4 rounded-lg bg-[#172337] hover:bg-[#0F172A] disabled:bg-[#D1D5DB] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Zap className="w-4 h-4" />
              <span>{language === 'bn' ? 'এখনই কিনুন' : 'Buy Now'}</span>
            </button>
            <button
              type="button"
              aria-label="Wishlist"
              onClick={() => toggleWishlist(product.id)}
              className={`w-12 h-[46px] rounded-lg border flex items-center justify-center ${
                isWishlisted
                  ? 'border-[#F85606] bg-[#FFF4EE] text-[#F85606]'
                  : 'border-[#E5E7EB] text-[#4B5563]'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#F85606]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right: Delivery & Seller Card */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-xl bg-[#F5F6FA] border border-[#E5E7EB] space-y-3 text-xs">
            <p className="font-bold text-[#172337] uppercase tracking-wide text-[11px]">
              {language === 'bn' ? 'ডেলিভারি তথ্য' : 'Delivery & Protection'}
            </p>
            <div className="flex items-start gap-2.5">
              <Truck className="w-4 h-4 text-[#F85606] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#202124]">
                  {language === 'bn' ? 'ঢাকা শহরে ডেলিভারি' : 'Inside Dhaka Delivery'}
                </p>
                <p className="text-[#6B7280]">
                  {product.deliveryDhakaDays} · {formatBDT(settings.deliveryDhakaCharge, language)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Truck className="w-4 h-4 text-[#172337] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#202124]">
                  {language === 'bn' ? 'ঢাকার বাইরে ডেলিভারি' : 'Outside Dhaka Delivery'}
                </p>
                <p className="text-[#6B7280]">
                  {product.deliveryOutsideDays} · {formatBDT(settings.deliveryOutsideCharge, language)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 pt-2 border-t border-[#E5E7EB]">
              <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <p className="text-[#4B5563]">
                {language === 'bn'
                  ? '৭ দিনের সহজ রিটার্ন এবং ক্যাশ অন ডেলিভারি সুবিধা।'
                  : '7-Day Easy Return · Cash on Delivery Available.'}
              </p>
            </div>
          </div>

          {seller && (
            <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wide font-semibold text-[#6B7280]">
                  {language === 'bn' ? 'বিক্রেতা' : 'Sold By'}
                </span>
                {seller.verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16A34A]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {language === 'bn' ? 'ভেরিফায়েড' : 'Verified'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg text-white text-xs font-bold flex items-center justify-center shrink-0"
                  style={{ backgroundColor: seller.bannerColor }}
                >
                  {seller.logoInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#172337] truncate">
                    {seller.storeName}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    ★ {seller.rating} ({formatNum(seller.reviewCount, language)})
                  </p>
                </div>
              </div>
              <Link
                to={`/store/${seller.slug}`}
                className="w-full min-h-[38px] rounded-md border border-[#E5E7EB] hover:border-[#F85606] text-xs font-semibold text-[#172337] hover:text-[#F85606] inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                <Store className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'স্টোর ভিজিট করুন' : 'Visit Seller Store'}</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Description + Specs + Frequently Bought Together */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#172337] mb-2">
              {language === 'bn' ? 'পণ্যের বিবরণ' : 'Product Description'}
            </h2>
            <p className="text-sm text-[#4B5563] leading-relaxed">
              {getText(product.description, language)}
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[#172337] mb-3">
              {language === 'bn' ? 'টেকনিক্যাল স্পেসিফিকেশন' : 'Technical Specifications'}
            </h2>
            <div className="border border-[#E5E7EB] rounded-lg divide-y divide-[#E5E7EB] text-xs">
              {Object.entries(product.specifications).map(([key, val]) => (
                <div key={key} className="grid grid-cols-3 p-3">
                  <span className="font-medium text-[#6B7280]">{key}</span>
                  <span className="col-span-2 text-[#202124] font-medium">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reviews */}
          <div className="pt-4 border-t border-[#E5E7EB] space-y-4">
            <h2 className="text-base font-bold text-[#172337]">
              {language === 'bn' ? 'ক্রেতাদের রিভিউ' : 'Customer Reviews'} (
              {productReviews.length})
            </h2>

            {productReviews.length === 0 ? (
              <p className="text-xs text-[#6B7280]">
                {language === 'bn'
                  ? 'এই পণ্যের প্রথম রিভিউটি আপনিই দিন।'
                  : 'Be the first verified shopper to review this product.'}
              </p>
            ) : (
              <div className="space-y-3">
                {productReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-lg bg-[#F5F6FA] border border-[#E5E7EB]"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-[#172337]">
                        {rev.customerName} · {rev.location}
                      </span>
                      <span className="text-[#F59E0B] font-bold">★ {rev.rating}.0</span>
                    </div>
                    <p className="text-xs text-[#374151]">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}

            <form
              onSubmit={handleReviewSubmit}
              className="p-4 rounded-lg border border-[#E5E7EB] space-y-3"
            >
              <p className="text-xs font-bold text-[#172337]">
                {language === 'bn' ? 'আপনার মতামত লিখুন' : 'Write a Review'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  required
                  value={revName}
                  onChange={(e) => setRevName(e.target.value)}
                  placeholder={language === 'bn' ? 'আপনার নাম' : 'Your Name'}
                  className="px-3 py-2 text-xs border border-[#E5E7EB] rounded-md"
                />
                <input
                  value={revLocation}
                  onChange={(e) => setRevLocation(e.target.value)}
                  placeholder="City (e.g. Dhaka)"
                  className="px-3 py-2 text-xs border border-[#E5E7EB] rounded-md"
                />
                <select
                  value={revRating}
                  onChange={(e) => setRevRating(Number(e.target.value))}
                  className="px-3 py-2 text-xs border border-[#E5E7EB] rounded-md bg-white"
                >
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                </select>
              </div>
              <textarea
                required
                rows={2}
                value={revComment}
                onChange={(e) => setRevComment(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'পণ্যের মান ও ডেলিভারি সম্পর্কে লিখুন...'
                    : 'Share your feedback...'
                }
                className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-md"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-[#172337] text-white text-xs font-semibold"
              >
                {language === 'bn' ? 'রিভিউ জমা দিন' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>

        {/* Frequently Bought Together */}
        <aside className="lg:col-span-4 bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4 h-fit">
          <h2 className="text-base font-bold text-[#172337]">
            {language === 'bn' ? 'একসাথে বেশি কেনা হয়' : 'Frequently Bought Together'}
          </h2>
          <div className="space-y-3">
            {frequentlyBought.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-[#E5E7EB]"
              >
                <div className="w-16 h-12 rounded bg-[#F5F6FA] overflow-hidden shrink-0">
                  <ResilientImage
                    src={item.images[0]}
                    alt={getText(item.name, language)}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${item.slug}`}
                    className="text-xs font-medium text-[#202124] hover:text-[#F85606] line-clamp-1"
                  >
                    {getText(item.name, language)}
                  </Link>
                  <p className="text-xs font-bold text-[#F85606] tabular-nums">
                    {formatBDT(item.discountedPrice, language)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    addToCart(
                      item,
                      item.colors[0] ?? 'Default',
                      item.sizes[0] ?? 'Standard',
                      1
                    )
                  }
                  className="px-2.5 py-1.5 rounded bg-[#172337] text-white text-[11px] font-medium shrink-0"
                >
                  + {language === 'bn' ? 'যোগ' : 'Add'}
                </button>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-[#172337] mb-4">
            {language === 'bn' ? 'সম্পর্কিত পণ্যসমূহ' : 'Related Products'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
