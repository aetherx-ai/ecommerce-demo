import React, { useCallback, useEffect, useState } from 'react';
import { Check, Eye, Flame, Heart, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBazario } from '../../contexts/BazarioContext';
import { Language, Product, Seller } from '../../types/bazario';
import { formatBDT, formatNum, getText } from '../../utils/formatters';
import { ResilientImage } from './ResilientImage';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  flashSaleMode?: boolean;
}

interface ProductCardViewProps {
  product: Product;
  language: Language;
  seller?: Seller;
  isWishlisted: boolean;
  flashSaleMode: boolean;
  onQuickView?: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, color: string, size: string, quantity?: number) => void;
}

const ProductCardView = React.memo<ProductCardViewProps>(
  ({
    product,
    language,
    seller,
    isWishlisted,
    flashSaleMode,
    onQuickView,
    onToggleWishlist,
    onAddToCart,
  }) => {
    const [addedFeedback, setAddedFeedback] = useState(false);

    useEffect(() => {
      if (!addedFeedback) return;
      const timer = window.setTimeout(() => setAddedFeedback(false), 1200);
      return () => window.clearTimeout(timer);
    }, [addedFeedback]);

    const isOutOfStock = product.stock <= 0;
    const title = getText(product.name, language);
    const savings = Math.max(0, product.regularPrice - product.discountedPrice);

    const claimedPct = isOutOfStock
      ? 100
      : Math.min(
          95,
          Math.max(
            54,
            Math.round((product.soldCount / (product.soldCount + product.stock * 2.5)) * 100)
          )
        );

    const handleAdd = useCallback(() => {
      if (isOutOfStock) return;
      onAddToCart(
        product,
        product.colors[0] ?? 'Default',
        product.sizes[0] ?? 'Standard',
        1
      );
      setAddedFeedback(true);
    }, [isOutOfStock, onAddToCart, product]);

    return (
      <article className="group bg-white border border-[#E5E7EB] hover:border-[#F85606]/45 rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-12px_rgba(23,35,55,0.18)]">
        {/* Product Image Area */}
        <div className="relative aspect-[4/3] w-full bg-[#F5F6FA] overflow-hidden border-b border-[#F1F3F5]">
          <Link
            to={`/product/${product.slug}`}
            className="block w-full h-full focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#F85606]"
          >
            <ResilientImage
              src={product.images[0]}
              alt={title}
              fallbackTitle={title}
              sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 260px"
              className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.05]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#172337]/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            />
          </Link>

          {/* Top-Left Badges */}
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex flex-col items-start gap-1 pointer-events-none">
            {product.discountPercent > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F85606] text-white text-[10px] sm:text-[11px] font-bold tracking-tight shadow-xs tabular-nums">
                {flashSaleMode && <Flame className="w-3 h-3 fill-white/90" />}
                <span>-{formatNum(product.discountPercent, language)}%</span>
              </span>
            )}
            {!isOutOfStock && product.stock <= 5 && (
              <span className="px-1.5 py-0.5 rounded bg-[#172337]/90 text-white text-[10px] font-semibold backdrop-blur-xs tabular-nums">
                {language === 'bn'
                  ? `মাত্র ${formatNum(product.stock, 'bn')}টি বাকি`
                  : `Only ${product.stock} left`}
              </span>
            )}
          </div>

          {/* Top-Right Wishlist & Quick View */}
          <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 flex flex-col gap-1.5 z-10">
            <button
              type="button"
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-pressed={isWishlisted}
              onClick={() => onToggleWishlist(product.id)}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border shadow-xs transition-all duration-150 active:scale-90 ${
                isWishlisted
                  ? 'bg-[#F85606] border-[#F85606] text-white shadow-sm'
                  : 'bg-white/95 backdrop-blur-xs border-[#E5E7EB] text-[#4B5563] hover:text-[#F85606] hover:border-[#F85606]/50'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-150 ${
                  isWishlisted ? 'fill-white scale-110' : ''
                }`}
              />
            </button>

            {onQuickView && (
              <button
                type="button"
                aria-label="Quick View"
                onClick={() => onQuickView(product)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 backdrop-blur-xs border border-[#E5E7EB] text-[#4B5563] hover:text-[#172337] hover:border-[#172337]/40 flex items-center justify-center shadow-xs opacity-95 lg:opacity-0 lg:translate-y-1 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 transition-all duration-200 active:scale-90"
              >
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-[#172337]/55 backdrop-blur-[1px] flex items-center justify-center">
              <span className="px-3 py-1 bg-white text-[#172337] text-xs font-bold rounded-md shadow-sm">
                {language === 'bn' ? 'স্টক শেষ' : 'Out of Stock'}
              </span>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between gap-2 sm:gap-2.5">
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-1.5 text-[10px] sm:text-[11px] text-[#6B7280] mb-1">
              {seller ? (
                <Link
                  to={`/store/${seller.slug}`}
                  className="truncate hover:text-[#F85606] transition-colors font-medium"
                >
                  {seller.storeName}
                </Link>
              ) : (
                <span className="truncate font-medium">{product.brand}</span>
              )}
              <span className="shrink-0 text-[10px] font-medium text-[#9CA3AF] truncate max-w-[75px] hidden sm:inline">
                {product.brand}
              </span>
            </div>

            <Link
              to={`/product/${product.slug}`}
              className="block text-[13px] sm:text-sm font-semibold text-[#202124] group-hover:text-[#172337] hover:!text-[#F85606] transition-colors line-clamp-2 leading-snug min-h-[2.3rem] sm:min-h-[2.45rem]"
            >
              {title}
            </Link>
          </div>

          <div className="space-y-2">
            {/* Pricing Hierarchy */}
            <div>
              <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[15px] sm:text-base font-bold text-[#F85606] tabular-nums tracking-tight">
                  {formatBDT(product.discountedPrice, language)}
                </span>
                {product.regularPrice > product.discountedPrice && (
                  <span className="text-[11px] sm:text-xs text-[#9CA3AF] line-through tabular-nums">
                    {formatBDT(product.regularPrice, language)}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <p className="text-[10px] font-medium text-[#16A34A] tabular-nums mt-0.5 hidden sm:block">
                  {language === 'bn'
                    ? `সাশ্রয় ${formatBDT(savings, 'bn')}`
                    : `Save ${formatBDT(savings, 'en')}`}
                </p>
              )}
            </div>

            {/* Rating & Sold Row */}
            <div className="flex items-center justify-between gap-1.5 text-[11px] sm:text-xs text-[#6B7280] pt-1 border-t border-[#F5F6FA]">
              <div className="inline-flex items-center gap-1 tabular-nums min-w-0">
                <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B] shrink-0" />
                <span className="font-semibold text-[#172337]">{product.rating}</span>
                <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] truncate">
                  ({formatNum(product.reviewCount, language)})
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-[#4B5563] tabular-nums shrink-0">
                {formatNum(product.soldCount, language)}{' '}
                {language === 'bn' ? 'বিক্রিত' : 'sold'}
              </span>
            </div>

            {/* Flash Sale Limited Stock Progress Indicator */}
            {flashSaleMode && (
              <div className="space-y-1 pt-0.5">
                <div className="flex items-center justify-between text-[10px] font-semibold tabular-nums">
                  <span className="text-[#F85606]">
                    {language === 'bn'
                      ? `${formatNum(claimedPct, 'bn')}% বিক্রি`
                      : `${claimedPct}% claimed`}
                  </span>
                  <span className="text-[#6B7280]">
                    {isOutOfStock
                      ? language === 'bn'
                        ? 'শেষ'
                        : 'Sold out'
                      : language === 'bn'
                      ? `স্টক ${formatNum(product.stock, 'bn')}`
                      : `${product.stock} left`}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#FFF0E8] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#F85606] to-[#FF8A4C] transition-all duration-500"
                    style={{ width: `${claimedPct}%` }}
                  />
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAdd}
              className={`w-full min-h-[38px] sm:min-h-[40px] px-2.5 sm:px-3 py-2 rounded-lg text-[11px] sm:text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-[0.98] ${
                isOutOfStock
                  ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                  : addedFeedback
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'bg-[#172337] hover:bg-[#F85606] text-white shadow-xs'
              }`}
            >
              {addedFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>{language === 'bn' ? 'কার্টে যুক্ত হয়েছে' : 'Added to Cart'}</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {isOutOfStock
                      ? language === 'bn'
                        ? 'স্টক শেষ'
                        : 'Out of Stock'
                      : language === 'bn'
                      ? 'কার্টে যোগ করুন'
                      : 'Add to Cart'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </article>
    );
  }
);

ProductCardView.displayName = 'ProductCardView';

export const ProductCard: React.FC<ProductCardProps> = React.memo(
  ({ product, onQuickView, flashSaleMode = false }) => {
    const {
      language,
      wishlistSet,
      toggleWishlist,
      addToCart,
      getSellerById,
    } = useBazario();

    return (
      <ProductCardView
        product={product}
        language={language}
        seller={getSellerById(product.sellerId)}
        isWishlisted={wishlistSet.has(product.id)}
        flashSaleMode={flashSaleMode}
        onQuickView={onQuickView}
        onToggleWishlist={toggleWishlist}
        onAddToCart={addToCart}
      />
    );
  }
);

ProductCard.displayName = 'ProductCard';
