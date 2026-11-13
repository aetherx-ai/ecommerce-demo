import React from 'react';
import { Eye, Heart, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBazario } from '../../contexts/BazarioContext';
import { Product } from '../../types/bazario';
import { formatBDT, formatNum, getText } from '../../utils/formatters';
import { ResilientImage } from './ResilientImage';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const {
    language,
    wishlist,
    toggleWishlist,
    addToCart,
    getSellerById,
  } = useBazario();

  const seller = getSellerById(product.sellerId);
  const isWishlisted = wishlist.includes(product.id);
  const isOutOfStock = product.stock <= 0;
  const title = getText(product.name, language);

  return (
    <article className="group bg-white border border-[#E5E7EB] rounded-lg overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-12px_rgba(23,35,55,0.16)]">
      {/* Product Image Area */}
      <div className="relative aspect-[4/3] w-full bg-[#F5F6FA] overflow-hidden">
        <Link
          to={`/product/${product.slug}`}
          className="block w-full h-full focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#F85606]"
        >
          <ResilientImage
            src={product.images[0]}
            alt={title}
            fallbackTitle={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        </Link>

        {/* Discount Badge */}
        {product.discountPercent > 0 && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-[#F85606] text-white text-[11px] font-semibold tabular-nums">
            -{formatNum(product.discountPercent, language)}%
          </span>
        )}

        {/* Top-Right Wishlist & Quick View */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5">
          <button
            type="button"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={() => toggleWishlist(product.id)}
            className={`w-9 h-9 rounded-full flex items-center justify-center border shadow-xs transition-colors ${
              isWishlisted
                ? 'bg-[#F85606] border-[#F85606] text-white'
                : 'bg-white/95 border-[#E5E7EB] text-[#4B5563] hover:text-[#F85606]'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
          </button>

          {onQuickView && (
            <button
              type="button"
              aria-label="Quick View"
              onClick={() => onQuickView(product)}
              className="w-9 h-9 rounded-full bg-white/95 border border-[#E5E7EB] text-[#4B5563] hover:text-[#172337] flex items-center justify-center shadow-xs lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
            <span className="px-3 py-1 bg-white text-[#202124] text-xs font-semibold rounded">
              {language === 'bn' ? 'স্টক শেষ' : 'Out of Stock'}
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-3.5 flex-1 flex flex-col justify-between gap-2.5">
        <div>
          <div className="flex items-center justify-between gap-2 text-[11px] text-[#6B7280] mb-1">
            {seller ? (
              <Link
                to={`/store/${seller.slug}`}
                className="truncate hover:text-[#F85606] transition-colors font-medium"
              >
                {seller.storeName}
              </Link>
            ) : (
              <span>{product.brand}</span>
            )}
            <span className="shrink-0 tabular-nums">
              {product.stock <= 6 && product.stock > 0
                ? language === 'bn'
                  ? `বাকি ${formatNum(product.stock, 'bn')}টি`
                  : `${product.stock} left`
                : product.brand}
            </span>
          </div>

          <Link
            to={`/product/${product.slug}`}
            className="block text-sm font-medium text-[#202124] hover:text-[#F85606] transition-colors line-clamp-2 leading-snug min-h-[2.45rem]"
          >
            {title}
          </Link>
        </div>

        <div>
          {/* Pricing Row */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-base font-bold text-[#F85606] tabular-nums">
              {formatBDT(product.discountedPrice, language)}
            </span>
            {product.regularPrice > product.discountedPrice && (
              <span className="text-xs text-[#9CA3AF] line-through tabular-nums">
                {formatBDT(product.regularPrice, language)}
              </span>
            )}
          </div>

          {/* Rating & Sold Row */}
          <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-[#6B7280]">
            <div className="flex items-center gap-1 tabular-nums">
              <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
              <span className="font-medium text-[#202124]">{product.rating}</span>
              <span>({formatNum(product.reviewCount, language)})</span>
            </div>
            <span className="tabular-nums">
              {formatNum(product.soldCount, language)}{' '}
              {language === 'bn' ? 'বিক্রিত' : 'sold'}
            </span>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() =>
              addToCart(
                product,
                product.colors[0] ?? 'Default',
                product.sizes[0] ?? 'Standard',
                1
              )
            }
            className="mt-3 w-full min-h-[40px] px-3 py-2 rounded-md bg-[#172337] hover:bg-[#F85606] disabled:bg-[#D1D5DB] text-white text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors duration-150"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>
              {isOutOfStock
                ? language === 'bn'
                  ? 'স্টক শেষ'
                  : 'Out of Stock'
                : language === 'bn'
                ? 'কার্টে যোগ করুন'
                : 'Add to Cart'}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
};
