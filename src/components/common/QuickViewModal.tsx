import React, { useEffect, useState } from 'react';
import { ExternalLink, Heart, Minus, Plus, ShoppingCart, Star, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBazario } from '../../contexts/BazarioContext';
import { Product } from '../../types/bazario';
import { formatBDT, formatNum, getText } from '../../utils/formatters';
import { ResilientImage } from './ResilientImage';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { language, addToCart, toggleWishlist, wishlist, getSellerById } = useBazario();
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] ?? 'Default');
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] ?? 'Standard');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0] ?? 'Default');
      setSelectedSize(product.sizes[0] ?? 'Standard');
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const seller = getSellerById(product.sellerId);
  const isWishlisted = wishlist.includes(product.id);
  const title = getText(product.name, language);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div
        role="dialog"
        aria-label={title}
        className="bg-white rounded-xl border border-[#E5E7EB] w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl grid grid-cols-1 md:grid-cols-2"
      >
        <div className="relative bg-[#F5F6FA] aspect-[4/3] md:aspect-auto">
          <ResilientImage
            src={product.images[0]}
            alt={title}
            fallbackTitle={title}
            className="w-full h-full object-cover"
          />
          {product.discountPercent > 0 && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-[#F85606] text-white text-xs font-semibold tabular-nums">
              -{formatNum(product.discountPercent, language)}%
            </span>
          )}
        </div>

        <div className="p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="text-xs text-[#6B7280]">
                {product.brand}
                {seller ? ` · ${seller.storeName}` : ''}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close quick view"
                className="p-1 text-[#6B7280] hover:text-[#202124]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-lg font-bold text-[#202124] mt-1 leading-snug">
              {title}
            </h3>

            <div className="mt-2 flex items-center gap-3 text-xs text-[#6B7280]">
              <span className="inline-flex items-center gap-1 text-[#202124] font-medium">
                <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                {product.rating}
              </span>
              <span>
                {formatNum(product.soldCount, language)}{' '}
                {language === 'bn' ? 'বিক্রিত' : 'sold'}
              </span>
              <span className="text-[#16A34A] font-medium">
                {product.stock > 0
                  ? language === 'bn'
                    ? `স্টকে আছে (${formatNum(product.stock, 'bn')})`
                    : `In Stock (${product.stock})`
                  : language === 'bn'
                  ? 'স্টক শেষ'
                  : 'Out of Stock'}
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2.5">
              <span className="text-2xl font-bold text-[#F85606] tabular-nums">
                {formatBDT(product.discountedPrice, language)}
              </span>
              {product.regularPrice > product.discountedPrice && (
                <span className="text-sm text-[#9CA3AF] line-through tabular-nums">
                  {formatBDT(product.regularPrice, language)}
                </span>
              )}
            </div>

            {/* Variants */}
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs font-medium text-[#4B5563] mb-1.5">
                  {language === 'bn' ? 'কালার:' : 'Color:'} {selectedColor}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`px-2.5 py-1 text-xs rounded border ${
                        selectedColor === c
                          ? 'border-[#F85606] bg-[#FFF4EE] text-[#F85606] font-medium'
                          : 'border-[#E5E7EB] text-[#374151]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-[#4B5563] mb-1.5">
                  {language === 'bn' ? 'সাইজ / ভ্যারিয়েন্ট:' : 'Size / Variant:'}{' '}
                  {selectedSize}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`px-2.5 py-1 text-xs rounded border ${
                        selectedSize === s
                          ? 'border-[#172337] bg-[#172337] text-white font-medium'
                          : 'border-[#E5E7EB] text-[#374151]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center border border-[#E5E7EB] rounded-md">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-10 flex items-center justify-center text-[#4B5563]"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-medium tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(Math.max(1, product.stock), q + 1))
                  }
                  className="w-9 h-10 flex items-center justify-center text-[#4B5563]"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                disabled={product.stock <= 0}
                onClick={() => {
                  addToCart(product, selectedColor, selectedSize, quantity);
                  onClose();
                }}
                className="flex-1 h-10 bg-[#F85606] hover:bg-[#E04A00] disabled:bg-[#D1D5DB] text-white text-xs font-semibold rounded-md inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>
                  {language === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}
                </span>
              </button>

              <button
                type="button"
                aria-label="Toggle wishlist"
                onClick={() => toggleWishlist(product.id)}
                className={`w-10 h-10 rounded-md border flex items-center justify-center ${
                  isWishlisted
                    ? 'border-[#F85606] bg-[#FFF4EE] text-[#F85606]'
                    : 'border-[#E5E7EB] text-[#4B5563]'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#F85606]' : ''}`} />
              </button>
            </div>

            <Link
              to={`/product/${product.slug}`}
              onClick={onClose}
              className="w-full py-2 text-xs font-medium text-[#172337] hover:text-[#F85606] inline-flex items-center justify-center gap-1"
            >
              <span>
                {language === 'bn' ? 'বিস্তারিত পেজ দেখুন' : 'View Full Product Details'}
              </span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
