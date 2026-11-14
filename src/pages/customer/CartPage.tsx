import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Store,
  Tag,
  Trash2,
  Truck,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ResilientImage } from '../../components/common/ResilientImage';
import { useBazario } from '../../contexts/BazarioContext';
import { t } from '../../data/i18n';
import { CartItem } from '../../types/bazario';
import { formatBDT, formatNum, getText } from '../../utils/formatters';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    language,
    cart,
    coupons,
    settings,
    appliedCouponCode,
    getProductById,
    getSellerById,
    updateCartQuantity,
    toggleCartItemSelected,
    toggleSelectAllCart,
    removeFromCart,
    applyCoupon,
    clearCoupon,
  } = useBazario();

  const [couponInput, setCouponInput] = useState(appliedCouponCode);
  const [couponFeedback, setCouponFeedback] = useState<{ ok: boolean; msg: string } | null>(
    null
  );

  const groupedBySeller = useMemo(() => {
    const groups = new Map<string, CartItem[]>();
    cart.forEach((item) => {
      const list = groups.get(item.sellerId) ?? [];
      list.push(item);
      groups.set(item.sellerId, list);
    });
    return Array.from(groups.entries());
  }, [cart]);

  const allSelected = cart.length > 0 && cart.every((i) => i.selected);
  const selectedItems = useMemo(() => cart.filter((i) => i.selected), [cart]);

  const subtotal = useMemo(
    () =>
      selectedItems.reduce((sum, item) => {
        const prod = getProductById(item.productId);
        return sum + (prod ? prod.discountedPrice * item.quantity : 0);
      }, 0),
    [selectedItems, getProductById]
  );

  const activeCoupon = coupons.find(
    (c) => c.code === appliedCouponCode && c.active && subtotal >= c.minOrderAmount
  );
  const discount = activeCoupon
    ? activeCoupon.type === 'percentage'
      ? Math.min(
          activeCoupon.maxDiscount ?? 999999,
          Math.round((subtotal * activeCoupon.value) / 100)
        )
      : activeCoupon.value
    : 0;

  const freeThreshold = settings.freeDeliveryThreshold;
  const remainingForFree = Math.max(0, freeThreshold - subtotal);
  const progressPct = Math.min(100, Math.round((subtotal / freeThreshold) * 100));
  const estDelivery =
    subtotal === 0 ? 0 : subtotal >= freeThreshold ? 0 : settings.deliveryDhakaCharge;
  const grandTotal = Math.max(0, subtotal + estDelivery - discount);

  const handleCouponApply = (e: React.FormEvent) => {
    e.preventDefault();
    const res = applyCoupon(couponInput);
    setCouponFeedback({ ok: res.ok, msg: res.message });
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-[900px] mx-auto px-4 py-16">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-10 text-center">
          <ShoppingBag className="w-12 h-12 text-[#9CA3AF] mx-auto mb-3 stroke-[1.5]" />
          <h1 className="text-xl font-bold text-[#172337] mb-1">
            {t('emptyCartTitle', language)}
          </h1>
          <p className="text-sm text-[#6B7280] mb-6">{t('emptyCartSub', language)}</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#F85606] hover:bg-[#E04A00] text-white text-sm font-semibold"
          >
            <span>{t('continueShopping', language)}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-6">
      <h1 className="text-xl sm:text-2xl font-bold text-[#172337] mb-5">
        {t('yourCart', language)} ({formatNum(cart.reduce((s, i) => s + i.quantity, 0), language)})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Seller-Grouped Cart Items */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free Delivery Progress */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-[#202124] mb-2">
              <Truck className="w-4 h-4 text-[#F85606]" />
              {remainingForFree === 0 ? (
                <span className="text-[#16A34A] font-semibold">
                  {t('freeDeliveryUnlocked', language)}
                </span>
              ) : (
                <span>
                  {t('freeDeliveryProgress', language)}{' '}
                  <strong className="text-[#F85606] tabular-nums">
                    {formatBDT(remainingForFree, language)}
                  </strong>
                </span>
              )}
            </div>
            <div className="h-2 bg-[#F5F6FA] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F85606] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Select All Header */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 flex items-center justify-between text-xs">
            <label className="inline-flex items-center gap-2.5 font-semibold text-[#172337] cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => toggleSelectAllCart(e.target.checked)}
                className="w-4 h-4 accent-[#F85606]"
              />
              <span>
                {language === 'bn' ? 'সবগুলো নির্বাচন করুন' : 'Select All Items'}
              </span>
            </label>
            <Link to="/shop" className="text-[#F85606] font-medium hover:underline">
              {t('continueShopping', language)}
            </Link>
          </div>

          {/* Seller Groups */}
          {groupedBySeller.map(([sellerId, items]) => {
            const seller = getSellerById(sellerId);
            return (
              <div
                key={sellerId}
                className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden"
              >
                <div className="px-4 py-2.5 bg-[#F5F6FA] border-b border-[#E5E7EB] flex items-center gap-2 text-xs font-semibold text-[#172337]">
                  <Store className="w-3.5 h-3.5 text-[#F85606]" />
                  {seller ? (
                    <Link to={`/store/${seller.slug}`} className="hover:text-[#F85606]">
                      {seller.storeName}
                    </Link>
                  ) : (
                    <span>BAZARIO Seller</span>
                  )}
                </div>

                <div className="divide-y divide-[#F1F3F5]">
                  {items.map((item) => {
                    const prod = getProductById(item.productId);
                    if (!prod) return null;
                    const title = getText(prod.name, language);
                    return (
                      <div
                        key={item.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => toggleCartItemSelected(item.id)}
                            aria-label={`Select ${title}`}
                            className="w-4 h-4 accent-[#F85606] shrink-0"
                          />
                          <Link
                            to={`/product/${prod.slug}`}
                            className="w-20 h-16 rounded-lg bg-[#F5F6FA] overflow-hidden border border-[#E5E7EB] shrink-0"
                          >
                            <ResilientImage
                              src={prod.images[0]}
                              alt={title}
                              sizes="80px"
                              className="w-full h-full object-cover"
                            />
                          </Link>
                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/product/${prod.slug}`}
                              className="text-sm font-semibold text-[#202124] hover:text-[#F85606] line-clamp-1"
                            >
                              {title}
                            </Link>
                            <p className="text-xs text-[#6B7280] mt-0.5">
                              {item.color} · {item.size}
                            </p>
                            <p className="text-xs font-bold text-[#F85606] mt-1 tabular-nums">
                              {formatBDT(prod.discountedPrice, language)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-4 pl-7 sm:pl-0">
                          <div className="inline-flex items-center border border-[#E5E7EB] rounded-md">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() => updateCartQuantity(item.id, -1)}
                              className="w-8 h-8 flex items-center justify-center text-[#4B5563]"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-semibold tabular-nums">
                              {formatNum(item.quantity, language)}
                            </span>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() => updateCartQuantity(item.id, 1)}
                              className="w-8 h-8 flex items-center justify-center text-[#4B5563]"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2 ml-auto sm:ml-0">
                            <span className="text-sm font-bold text-[#172337] tabular-nums text-right">
                              {formatBDT(prod.discountedPrice * item.quantity, language)}
                            </span>

                            <button
                              type="button"
                              aria-label="Remove item"
                              onClick={() => removeFromCart(item.id)}
                              className="p-1.5 text-[#9CA3AF] hover:text-[#DC2626]"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Order Summary & Coupon */}
        <aside className="lg:col-span-4 bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-6 space-y-4 lg:sticky lg:top-28">
          <h2 className="text-base font-bold text-[#172337] pb-3 border-b border-[#E5E7EB]">
            {language === 'bn' ? 'অর্ডার সামারি' : 'Order Summary'}
          </h2>

          {/* Coupon Form */}
          <form onSubmit={handleCouponApply} className="space-y-2">
            <label className="text-xs font-medium text-[#4B5563] flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-[#F85606]" />
              <span>{t('applyCoupon', language)}</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="BAZARIO10 / EID500"
                className="min-w-0 flex-1 px-3 py-2 text-xs font-mono uppercase border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#F85606]"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-md bg-[#172337] text-white text-xs font-semibold shrink-0"
              >
                {t('apply', language)}
              </button>
            </div>
            {couponFeedback && (
              <p
                className={`text-xs ${
                  couponFeedback.ok ? 'text-[#16A34A]' : 'text-[#DC2626]'
                }`}
              >
                {couponFeedback.msg}
              </p>
            )}
            {appliedCouponCode && (
              <div className="flex items-center justify-between text-xs bg-[#F0FDF4] border border-[#BBF7D0] px-2.5 py-1.5 rounded">
                <span className="font-mono font-semibold text-[#16A34A]">
                  {appliedCouponCode}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    clearCoupon();
                    setCouponInput('');
                    setCouponFeedback(null);
                  }}
                  className="text-[#DC2626] underline"
                >
                  {language === 'bn' ? 'বাদ দিন' : 'Remove'}
                </button>
              </div>
            )}
          </form>

          <div className="space-y-2 text-sm pt-2 border-t border-[#E5E7EB]">
            <div className="flex justify-between text-[#4B5563]">
              <span>
                {t('subtotal', language)} ({formatNum(selectedItems.length, language)})
              </span>
              <span className="tabular-nums font-medium">
                {formatBDT(subtotal, language)}
              </span>
            </div>
            <div className="flex justify-between text-[#4B5563]">
              <span>{t('deliveryCharge', language)}</span>
              <span className="tabular-nums font-medium">
                {estDelivery === 0
                  ? language === 'bn'
                    ? 'ফ্রি'
                    : 'Free'
                  : formatBDT(estDelivery, language)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[#16A34A]">
                <span>{t('discount', language)}</span>
                <span className="tabular-nums font-semibold">
                  -{formatBDT(discount, language)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-[#172337] pt-3 border-t border-[#E5E7EB]">
              <span>{t('total', language)}</span>
              <span className="text-[#F85606] tabular-nums">
                {formatBDT(grandTotal, language)}
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={selectedItems.length === 0}
            onClick={() => navigate('/checkout')}
            className="w-full min-h-[46px] rounded-lg bg-[#F85606] hover:bg-[#E04A00] disabled:bg-[#D1D5DB] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
          >
            <span>{t('proceedCheckout', language)}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </aside>
      </div>
    </div>
  );
};
