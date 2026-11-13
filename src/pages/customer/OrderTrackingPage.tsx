import React, { useMemo, useState } from 'react';
import { CheckCircle2, Package, Search, Truck, XCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ResilientImage } from '../../components/common/ResilientImage';
import { useBazario } from '../../contexts/BazarioContext';
import { t } from '../../data/i18n';
import { OrderStatus } from '../../types/bazario';
import { formatBDT, formatNum, getText } from '../../utils/formatters';

const TIMELINE_STEPS: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

export const OrderTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { language, orders, sellers } = useBazario();

  const [orderIdInput, setOrderIdInput] = useState(
    searchParams.get('orderId') ?? orders[0]?.id ?? 'BZ-8402'
  );
  const [phoneInput, setPhoneInput] = useState(
    searchParams.get('phone') ?? orders[0]?.phone ?? '01819-000202'
  );
  const [queriedId, setQueriedId] = useState(orderIdInput);
  const [queriedPhone, setQueriedPhone] = useState(phoneInput);

  const matchedOrder = useMemo(() => {
    const cleanId = queriedId.trim().replace(/^#/, '').toUpperCase();
    const cleanPhone = queriedPhone.trim().replace(/[^0-9]/g, '');
    return orders.find((o) => {
      const idMatch = o.id.toUpperCase() === cleanId;
      const phoneMatch =
        !cleanPhone || o.phone.replace(/[^0-9]/g, '').includes(cleanPhone);
      return idMatch && phoneMatch;
    });
  }, [orders, queriedId, queriedPhone]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQueriedId(orderIdInput);
    setQueriedPhone(phoneInput);
  };

  const currentStepIdx = matchedOrder
    ? TIMELINE_STEPS.indexOf(matchedOrder.status)
    : -1;

  return (
    <div className="max-w-[1000px] mx-auto px-3 sm:px-6 py-8 space-y-6">
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-7">
        <h1 className="text-xl sm:text-2xl font-bold text-[#172337] mb-1">
          {t('trackYourOrder', language)}
        </h1>
        <p className="text-xs text-[#6B7280] mb-5">
          {language === 'bn'
            ? 'আপনার অর্ডার আইডি ও মোবাইল নম্বর দিয়ে লাইভ অবস্থা দেখুন।'
            : 'Enter your Order ID and phone number to inspect live fulfillment status.'}
        </p>

        <form onSubmit={handleTrackSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#4B5563] mb-1">
              {t('orderIdLabel', language)}
            </label>
            <input
              required
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              placeholder="BZ-8402"
              className="w-full px-3 py-2.5 text-sm font-mono border border-[#E5E7EB] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4B5563] mb-1">
              {t('phoneLabel', language)}
            </label>
            <input
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="01819-000202"
              className="w-full px-3 py-2.5 text-sm font-mono border border-[#E5E7EB] rounded-lg"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full min-h-[42px] rounded-lg bg-[#F85606] hover:bg-[#E04A00] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>{t('trackNow', language)}</span>
            </button>
          </div>
        </form>

        {/* Quick Demo Order Chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#6B7280]">
            {language === 'bn' ? 'ডেমো অর্ডার:' : 'Sample Orders:'}
          </span>
          {orders.slice(0, 4).map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => {
                setOrderIdInput(o.id);
                setPhoneInput(o.phone);
                setQueriedId(o.id);
                setQueriedPhone(o.phone);
              }}
              className="px-2.5 py-1 rounded border border-[#E5E7EB] bg-[#F5F6FA] hover:border-[#F85606] font-mono text-[11px]"
            >
              #{o.id} ({o.status})
            </button>
          ))}
        </div>
      </div>

      {!matchedOrder ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-10 text-center text-sm text-[#6B7280]">
          {language === 'bn'
            ? 'দুঃখিত, এই অর্ডার আইডি ও নম্বরে কোনো তথ্য পাওয়া যায়নি।'
            : 'No order found matching that Order ID and mobile number.'}
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-7 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
            <div>
              <p className="font-mono text-xs text-[#6B7280]">
                {matchedOrder.createdAt}
              </p>
              <h2 className="text-lg font-bold text-[#172337]">
                Order #{matchedOrder.id} · {matchedOrder.customerName}
              </h2>
            </div>
            <span
              className={`px-3 py-1 rounded-md text-xs font-bold ${
                matchedOrder.status === 'Cancelled'
                  ? 'bg-[#FEF2F2] text-[#DC2626]'
                  : matchedOrder.status === 'Delivered'
                  ? 'bg-[#F0FDF4] text-[#16A34A]'
                  : 'bg-[#FFF4EE] text-[#F85606]'
              }`}
            >
              {matchedOrder.status}
            </span>
          </div>

          {/* Visual 7-Step Tracking Timeline */}
          {matchedOrder.status === 'Cancelled' ? (
            <div className="p-4 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center gap-3 text-xs text-[#DC2626] font-medium">
              <XCircle className="w-5 h-5 shrink-0" />
              <span>
                {language === 'bn'
                  ? 'এই অর্ডারটি বাতিল করা হয়েছে।'
                  : 'This order has been cancelled.'}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
              {TIMELINE_STEPS.map((st, idx) => {
                const completed = idx <= currentStepIdx;
                return (
                  <div
                    key={st}
                    className={`p-2.5 rounded-lg border text-center ${
                      completed
                        ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A]'
                        : 'bg-[#F5F6FA] border-[#E5E7EB] text-[#9CA3AF]'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 mx-auto mb-1 ${
                        completed ? 'text-[#16A34A]' : 'text-[#D1D5DB]'
                      }`}
                    />
                    <p className="text-[11px] font-semibold leading-tight">{st}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Delivery & Payment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#F5F6FA] p-4 rounded-lg">
            <div className="flex items-start gap-2.5">
              <Truck className="w-4 h-4 text-[#F85606] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#172337]">
                  {language === 'bn' ? 'ডেলিভারি তথ্য' : 'Delivery Destination'}
                </p>
                <p className="text-[#4B5563] mt-0.5">
                  {matchedOrder.address.streetAddress}, {matchedOrder.address.area},{' '}
                  {matchedOrder.address.upazila}, {matchedOrder.address.district}
                </p>
                <p className="text-[#16A34A] font-medium mt-1">
                  {matchedOrder.estimatedDelivery}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Package className="w-4 h-4 text-[#172337] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#172337]">
                  {language === 'bn' ? 'পেমেন্ট ও ডেলিভারি' : 'Payment & Courier'}
                </p>
                <p className="text-[#4B5563] mt-0.5">
                  {matchedOrder.paymentMethod} · {matchedOrder.deliveryMethod}
                </p>
                <p className="font-bold text-[#F85606] mt-1 tabular-nums">
                  {formatBDT(matchedOrder.total, language)}
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="divide-y divide-[#E5E7EB] border-t border-[#E5E7EB]">
            {matchedOrder.items.map((item, idx) => {
              const seller = sellers.find((s) => s.id === item.sellerId);
              return (
                <div key={idx} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-11 rounded bg-[#F5F6FA] overflow-hidden shrink-0">
                      <ResilientImage
                        src={item.image}
                        alt={getText(item.productName, language)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#202124] truncate">
                        {getText(item.productName, language)}
                      </p>
                      <p className="text-[11px] text-[#6B7280]">
                        {seller?.storeName ?? 'BAZARIO'} · {item.color} · {item.size} ×{' '}
                        {formatNum(item.quantity, language)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#172337] tabular-nums shrink-0">
                    {formatBDT(item.unitPrice * item.quantity, language)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
