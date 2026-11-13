import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  Info,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Smartphone,
  Truck,
  Wallet,
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useBazario } from '../../contexts/BazarioContext';
import { BD_DIVISIONS } from '../../data/bdLocations';
import { DeliveryMethod, PaymentMethod } from '../../types/bazario';
import { formatBDT, formatNum, getText } from '../../utils/formatters';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    language,
    cart,
    products,
    coupons,
    settings,
    appliedCouponCode,
    customers,
    currentCustomerId,
    placeOrder,
  } = useBazario();

  const currentCustomer = customers.find((c) => c.id === currentCustomerId);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [customerName, setCustomerName] = useState(currentCustomer?.name ?? '');
  const [phone, setPhone] = useState(currentCustomer?.phone ?? '');
  const [altPhone, setAltPhone] = useState('');
  const [email, setEmail] = useState(currentCustomer?.email ?? '');

  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka');
  const [upazila, setUpazila] = useState('Dhanmondi');
  const [area, setArea] = useState('Road 9/A');
  const [streetAddress, setStreetAddress] = useState('House 24, Flat 4B');
  const [addressType, setAddressType] = useState<'Home' | 'Office'>('Home');

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('Standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash on Delivery');
  const [walletRefInput, setWalletRefInput] = useState('01700-000000');
  const [formError, setFormError] = useState('');

  const activeDivision = BD_DIVISIONS.find((d) => d.name === division) ?? BD_DIVISIONS[0];
  const activeDistrict =
    activeDivision.districts.find((dist) => dist.name === district) ??
    activeDivision.districts[0];

  const itemsToCheckout = useMemo(() => {
    const selected = cart.filter((i) => i.selected);
    return selected.length > 0 ? selected : cart;
  }, [cart]);

  const subtotal = useMemo(
    () =>
      itemsToCheckout.reduce((sum, ci) => {
        const prod = products.find((p) => p.id === ci.productId);
        return sum + (prod ? prod.discountedPrice * ci.quantity : 0);
      }, 0),
    [itemsToCheckout, products]
  );

  const isDhaka = district === 'Dhaka';
  const baseDelivery = isDhaka
    ? settings.deliveryDhakaCharge
    : settings.deliveryOutsideCharge;
  const expressExtra =
    deliveryMethod === 'Express' ? settings.expressExtraCharge : 0;
  const deliveryCharge =
    subtotal >= settings.freeDeliveryThreshold && deliveryMethod === 'Standard'
      ? 0
      : baseDelivery + expressExtra;

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
  const total = Math.max(0, subtotal + deliveryCharge - discount);

  if (itemsToCheckout.length === 0) {
    return (
      <div className="max-w-[800px] mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-10">
          <PackageCheck className="w-10 h-10 text-[#9CA3AF] mx-auto mb-3" />
          <h1 className="text-lg font-bold text-[#172337] mb-2">
            {language === 'bn' ? 'চেকআউটের জন্য কার্ট খালি' : 'No items to checkout'}
          </h1>
          <Link
            to="/shop"
            className="inline-block mt-2 px-5 py-2.5 bg-[#F85606] text-white text-xs font-semibold rounded-lg"
          >
            {language === 'bn' ? 'শপিং করুন' : 'Browse Products'}
          </Link>
        </div>
      </div>
    );
  }

  const validateAndNext = () => {
    if (step === 1) {
      if (!customerName.trim() || phone.trim().length < 8) {
        setFormError(
          language === 'bn'
            ? 'অনুগ্রহ করে সঠিক নাম এবং মোবাইল নম্বর লিখুন।'
            : 'Please enter a valid full name and Bangladeshi mobile number.'
        );
        return;
      }
    }
    if (step === 2) {
      if (!area.trim() || !streetAddress.trim()) {
        setFormError(
          language === 'bn'
            ? 'অনুগ্রহ করে এলাকা ও বিস্তারিত ঠিকানা লিখুন।'
            : 'Please fill in your area and detailed street address.'
        );
        return;
      }
    }
    setFormError('');
    setStep((s) => Math.min(4, s + 1) as 1 | 2 | 3 | 4);
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || phone.trim().length < 8 || !streetAddress.trim()) {
      setFormError(
        language === 'bn'
          ? 'সব আবশ্যক তথ্য পূরণ করুন।'
          : 'Please complete all required checkout steps.'
      );
      return;
    }
    const created = placeOrder({
      customerName: customerName.trim(),
      phone: phone.trim(),
      altPhone: altPhone.trim() || undefined,
      email: email.trim() || undefined,
      address: {
        division,
        district,
        upazila,
        area: area.trim(),
        streetAddress: streetAddress.trim(),
        addressType,
      },
      deliveryMethod,
      paymentMethod,
    });
    navigate(`/order-success?orderId=${encodeURIComponent(created.id)}`);
  };

  const paymentOptions: {
    id: PaymentMethod;
    label: string;
    sub: string;
    badgeBg: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'Cash on Delivery',
      label: language === 'bn' ? 'ক্যাশ অন ডেলিভারি (COD)' : 'Cash on Delivery',
      sub: language === 'bn' ? 'পণ্য হাতে পেয়ে টাকা দিন' : 'Pay cash upon courier delivery',
      badgeBg: 'bg-[#172337]',
      icon: Wallet,
    },
    {
      id: 'bKash',
      label: 'bKash (Demo Simulation)',
      sub: language === 'bn' ? 'সিমুলেটেড বিকাশ পেমেন্ট' : 'Simulated bKash mobile wallet',
      badgeBg: 'bg-[#E2136E]',
      icon: Smartphone,
    },
    {
      id: 'Nagad',
      label: 'Nagad (Demo Simulation)',
      sub: language === 'bn' ? 'সিমুলেটেড নগদ পেমেন্ট' : 'Simulated Nagad wallet',
      badgeBg: 'bg-[#F85606]',
      icon: Smartphone,
    },
    {
      id: 'Rocket',
      label: 'Rocket (Demo Simulation)',
      sub: language === 'bn' ? 'সিমুলেটেড রকেট পেমেন্ট' : 'Simulated DBBL Rocket wallet',
      badgeBg: 'bg-[#8C3494]',
      icon: Smartphone,
    },
    {
      id: 'Card Payment',
      label: language === 'bn' ? 'কার্ড পেমেন্ট (Visa / Mastercard)' : 'Card Payment (Demo)',
      sub: language === 'bn' ? 'সিমুলেটেড কার্ড চেকআউট' : 'Simulated Visa / Mastercard checkout',
      badgeBg: 'bg-[#1D4ED8]',
      icon: CreditCard,
    },
  ];

  return (
    <div className="max-w-[1280px] mx-auto px-3 sm:px-6 lg:px-8 py-6">
      <h1 className="text-xl sm:text-2xl font-bold text-[#172337] mb-4">
        {language === 'bn' ? 'নিরাপদ চেকআউট' : 'Bangladesh Express Checkout'}
      </h1>

      {/* 4-Step Progress Indicator */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { num: 1, bn: '১. তথ্য', en: '1. Details' },
          { num: 2, bn: '২. ঠিকানা', en: '2. Address' },
          { num: 3, bn: '৩. ডেলিভারি', en: '3. Delivery' },
          { num: 4, bn: '৪. পেমেন্ট', en: '4. Payment' },
        ].map((item) => (
          <button
            key={item.num}
            type="button"
            onClick={() => setStep(item.num as 1 | 2 | 3 | 4)}
            className={`py-2.5 px-2 rounded-lg text-xs font-semibold border transition-colors ${
              step === item.num
                ? 'bg-[#F85606] text-white border-[#F85606]'
                : step > item.num
                ? 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
                : 'bg-white text-[#6B7280] border-[#E5E7EB]'
            }`}
          >
            {language === 'bn' ? item.bn : item.en}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleConfirmOrder}
          className="lg:col-span-8 bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-7 space-y-6"
        >
          {formError && (
            <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs font-medium text-[#DC2626]">
              {formError}
            </div>
          )}

          {/* STEP 1: Customer Details */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-[#172337]">
                {language === 'bn' ? 'ধাপ ১: ক্রেতার তথ্য' : 'Step 1: Customer Details'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#4B5563] mb-1">
                    {language === 'bn' ? 'পুরো নাম *' : 'Full Name *'}
                  </label>
                  <input
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full px-3.5 py-2.5 text-sm border border-[#E5E7EB] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4B5563] mb-1">
                    {language === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
                  </label>
                  <input
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01711-000000"
                    className="w-full px-3.5 py-2.5 text-sm font-mono border border-[#E5E7EB] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4B5563] mb-1">
                    {language === 'bn' ? 'বিকল্প নম্বর (ঐচ্ছিক)' : 'Alternative Phone (Optional)'}
                  </label>
                  <input
                    value={altPhone}
                    onChange={(e) => setAltPhone(e.target.value)}
                    placeholder="01800-000000"
                    className="w-full px-3.5 py-2.5 text-sm font-mono border border-[#E5E7EB] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4B5563] mb-1">
                    {language === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full px-3.5 py-2.5 text-sm border border-[#E5E7EB] rounded-lg"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={validateAndNext}
                  className="px-6 py-2.5 rounded-lg bg-[#F85606] hover:bg-[#E04A00] text-white text-xs font-semibold"
                >
                  {language === 'bn' ? 'পরবর্তী ধাপ: ঠিকানা →' : 'Next: Delivery Address →'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Bangladesh Location Address */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-[#172337] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F85606]" />
                <span>
                  {language === 'bn' ? 'ধাপ ২: ডেলিভারি ঠিকানা' : 'Step 2: Bangladesh Delivery Address'}
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#4B5563] mb-1">
                    {language === 'bn' ? 'বিভাগ (Division)' : 'Division'}
                  </label>
                  <select
                    value={division}
                    onChange={(e) => {
                      const nextDiv =
                        BD_DIVISIONS.find((d) => d.name === e.target.value) ?? BD_DIVISIONS[0];
                      setDivision(nextDiv.name);
                      setDistrict(nextDiv.districts[0].name);
                      setUpazila(nextDiv.districts[0].upazilas[0]);
                    }}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg bg-white"
                  >
                    {BD_DIVISIONS.map((d) => (
                      <option key={d.name} value={d.name}>
                        {language === 'bn' ? `${d.bnName} (${d.name})` : d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4B5563] mb-1">
                    {language === 'bn' ? 'জেলা (District)' : 'District'}
                  </label>
                  <select
                    value={district}
                    onChange={(e) => {
                      const nextDist =
                        activeDivision.districts.find((d) => d.name === e.target.value) ??
                        activeDivision.districts[0];
                      setDistrict(nextDist.name);
                      setUpazila(nextDist.upazilas[0]);
                    }}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg bg-white"
                  >
                    {activeDivision.districts.map((dist) => (
                      <option key={dist.name} value={dist.name}>
                        {dist.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4B5563] mb-1">
                    {language === 'bn' ? 'উপজেলা / থানা' : 'Upazila / Thana'}
                  </label>
                  <select
                    value={upazila}
                    onChange={(e) => setUpazila(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg bg-white"
                  >
                    {activeDistrict.upazilas.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#4B5563] mb-1">
                    {language === 'bn' ? 'এলাকা / মহল্লা *' : 'Area / Neighborhood *'}
                  </label>
                  <input
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Road 9/A, Sector 7"
                    className="w-full px-3.5 py-2.5 text-sm border border-[#E5E7EB] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4B5563] mb-1">
                    {language === 'bn' ? 'ঠিকানার ধরন' : 'Address Type'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Home', 'Office'] as const).map((tp) => (
                      <button
                        key={tp}
                        type="button"
                        onClick={() => setAddressType(tp)}
                        className={`py-2.5 rounded-lg text-xs font-semibold border ${
                          addressType === tp
                            ? 'bg-[#172337] text-white border-[#172337]'
                            : 'bg-white text-[#4B5563] border-[#E5E7EB]'
                        }`}
                      >
                        {tp === 'Home'
                          ? language === 'bn'
                            ? 'বাসা (Home)'
                            : 'Home'
                          : language === 'bn'
                          ? 'অফিস (Office)'
                          : 'Office'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4B5563] mb-1">
                  {language === 'bn' ? 'বাড়ি, রোড ও ফ্ল্যাট নং *' : 'Detailed Street Address *'}
                </label>
                <input
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="House 24, Flat 4B..."
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E5E7EB] rounded-lg"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-xs font-medium"
                >
                  ← {language === 'bn' ? 'পিছনে' : 'Back'}
                </button>
                <button
                  type="button"
                  onClick={validateAndNext}
                  className="px-6 py-2.5 rounded-lg bg-[#F85606] text-white text-xs font-semibold"
                >
                  {language === 'bn' ? 'পরবর্তী ধাপ: ডেলিভারি →' : 'Next: Delivery Method →'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Delivery Method */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-[#172337] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#F85606]" />
                <span>
                  {language === 'bn' ? 'ধাপ ৩: ডেলিভারি পদ্ধতি' : 'Step 3: Delivery Method'}
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('Standard')}
                  className={`p-4 rounded-xl border text-left transition-colors ${
                    deliveryMethod === 'Standard'
                      ? 'border-[#F85606] bg-[#FFF8F5]'
                      : 'border-[#E5E7EB]'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-sm text-[#172337]">
                    <span>
                      {language === 'bn' ? 'স্ট্যান্ডার্ড ডেলিভারি' : 'Standard Delivery'}
                    </span>
                    <span className="text-[#F85606] tabular-nums">
                      {subtotal >= settings.freeDeliveryThreshold
                        ? language === 'bn'
                          ? 'ফ্রি'
                          : 'Free'
                        : formatBDT(baseDelivery, language)}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-1">
                    {isDhaka
                      ? language === 'bn'
                        ? 'ঢাকা শহরে ১–২ কার্যদিবস'
                        : '1–2 Days inside Dhaka'
                      : language === 'bn'
                      ? 'ঢাকার বাইরে ৩–৫ কার্যদিবস'
                      : '3–5 Days nationwide'}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('Express')}
                  className={`p-4 rounded-xl border text-left transition-colors ${
                    deliveryMethod === 'Express'
                      ? 'border-[#F85606] bg-[#FFF8F5]'
                      : 'border-[#E5E7EB]'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-sm text-[#172337]">
                    <span>
                      {language === 'bn' ? 'এক্সপ্রেস প্রায়োরিটি' : 'Express Priority'}
                    </span>
                    <span className="text-[#F85606] tabular-nums">
                      {formatBDT(baseDelivery + settings.expressExtraCharge, language)}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-1">
                    {isDhaka
                      ? language === 'bn'
                        ? '২৪ ঘণ্টার মধ্যে ডেলিভারি'
                        : 'Same-day / 24h inside Dhaka'
                      : language === 'bn'
                      ? '১–২ দিনে ফাস্ট কুরিয়ার'
                      : '1–2 Days Express Air'}
                  </p>
                </button>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-xs font-medium"
                >
                  ← {language === 'bn' ? 'পিছনে' : 'Back'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 rounded-lg bg-[#F85606] text-white text-xs font-semibold"
                >
                  {language === 'bn' ? 'পরবর্তী ধাপ: পেমেন্ট →' : 'Next: Payment →'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Payment Methods (Simulated Demo) */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-[#172337]">
                {language === 'bn' ? 'ধাপ ৪: পেমেন্ট পদ্ধতি নির্বাচন' : 'Step 4: Select Payment Method'}
              </h2>

              <div className="p-3 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#1E3A8A] flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  {language === 'bn'
                    ? 'ডেমো নোটিশ: এটি একটি প্রদর্শনমূলক প্ল্যাটফর্ম। বিকাশ, নগদ, রকেট বা কার্ড পেমেন্ট সম্পূর্ণ সিমুলেটেড—কোনো আসল লেনদেন হবে না।'
                    : 'Demo Notice: All bKash, Nagad, Rocket, and Card selections are simulated for demonstration. No real money or credentials are processed.'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentOptions.map((opt) => {
                  const Icon = opt.icon;
                  const active = paymentMethod === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPaymentMethod(opt.id)}
                      className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-colors ${
                        active
                          ? 'border-[#F85606] bg-[#FFF8F5]'
                          : 'border-[#E5E7EB] hover:border-[#9CA3AF]'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg text-white flex items-center justify-center shrink-0 ${opt.badgeBg}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#172337]">{opt.label}</p>
                        <p className="text-[11px] text-[#6B7280]">{opt.sub}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {paymentMethod !== 'Cash on Delivery' && (
                <div className="p-4 rounded-lg bg-[#F5F6FA] border border-[#E5E7EB] space-y-2">
                  <label className="block text-xs font-semibold text-[#172337]">
                    {paymentMethod === 'Card Payment'
                      ? language === 'bn'
                        ? 'ডেমো কার্ড রেফারেন্স'
                        : 'Simulated Card Reference'
                      : `${paymentMethod} ${
                          language === 'bn' ? 'ওয়ালেট নম্বর (ডেমো)' : 'Wallet Number (Demo)'
                        }`}
                  </label>
                  <input
                    type="text"
                    value={walletRefInput}
                    onChange={(e) => setWalletRefInput(e.target.value)}
                    className="w-full sm:w-72 px-3 py-2 text-xs font-mono bg-white border border-[#E5E7EB] rounded-md"
                  />
                </div>
              )}

              <div className="pt-3 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-xs font-medium"
                >
                  ← {language === 'bn' ? 'পিছনে' : 'Back'}
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-8 py-3 min-h-[46px] rounded-lg bg-[#F85606] hover:bg-[#E04A00] text-white text-sm font-bold inline-flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {language === 'bn'
                      ? `অর্ডার নিশ্চিত করুন (${formatBDT(total, 'bn')})`
                      : `Confirm Demo Order (${formatBDT(total, 'en')})`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Order Summary Sidebar */}
        <aside className="lg:col-span-4 bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4 lg:sticky lg:top-28">
          <h2 className="text-base font-bold text-[#172337] pb-3 border-b border-[#E5E7EB]">
            {language === 'bn' ? 'চেকআউট সামারি' : 'Checkout Summary'}
          </h2>
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {itemsToCheckout.map((ci) => {
              const p = products.find((prod) => prod.id === ci.productId);
              if (!p) return null;
              return (
                <div key={ci.id} className="flex justify-between gap-2 text-xs">
                  <span className="text-[#374151] line-clamp-1">
                    {formatNum(ci.quantity, language)} × {getText(p.name, language)}
                  </span>
                  <span className="font-semibold tabular-nums shrink-0">
                    {formatBDT(p.discountedPrice * ci.quantity, language)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="pt-3 border-t border-[#E5E7EB] space-y-2 text-xs">
            <div className="flex justify-between text-[#4B5563]">
              <span>{language === 'bn' ? 'সাবটোটাল' : 'Subtotal'}</span>
              <span className="tabular-nums">{formatBDT(subtotal, language)}</span>
            </div>
            <div className="flex justify-between text-[#4B5563]">
              <span>
                {language === 'bn' ? 'ডেলিভারি' : 'Delivery'} ({district})
              </span>
              <span className="tabular-nums">
                {deliveryCharge === 0
                  ? language === 'bn'
                    ? 'ফ্রি'
                    : 'Free'
                  : formatBDT(deliveryCharge, language)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[#16A34A]">
                <span>
                  {language === 'bn' ? 'কুপন ছাড়' : 'Coupon'} ({appliedCouponCode})
                </span>
                <span className="tabular-nums">-{formatBDT(discount, language)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-[#172337] pt-2 border-t border-[#E5E7EB]">
              <span>{language === 'bn' ? 'সর্বমোট' : 'Payable Total'}</span>
              <span className="text-[#F85606] tabular-nums">{formatBDT(total, language)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export const OrderSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { language, orders } = useBazario();

  const order = orders.find((o) => o.id === orderId) ?? orders[0];

  if (!order) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center">
        <Link to="/" className="text-[#F85606] font-semibold">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 text-[#16A34A]">
          <CheckCircle2 className="w-8 h-8 shrink-0" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider">
              {language === 'bn' ? 'অর্ডার সফলভাবে সম্পন্ন হয়েছে' : 'Order Placed Successfully'}
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-[#172337]">
              {language === 'bn'
                ? `ধন্যবাদ, ${order.customerName}!`
                : `Thank you, ${order.customerName}!`}
            </h1>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#F5F6FA] border border-[#E5E7EB] grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <p className="text-[#6B7280]">{language === 'bn' ? 'অর্ডার আইডি' : 'Order ID'}</p>
            <p className="font-mono font-bold text-sm text-[#172337]">#{order.id}</p>
          </div>
          <div>
            <p className="text-[#6B7280]">{language === 'bn' ? 'পেমেন্ট' : 'Payment'}</p>
            <p className="font-semibold text-[#172337]">{order.paymentMethod}</p>
          </div>
          <div>
            <p className="text-[#6B7280]">{language === 'bn' ? 'সম্ভাব্য ডেলিভারি' : 'Est. Delivery'}</p>
            <p className="font-semibold text-[#16A34A]">{order.estimatedDelivery}</p>
          </div>
        </div>

        <div className="text-xs space-y-1">
          <p className="font-bold text-[#172337]">
            {language === 'bn' ? 'ডেলিভারি ঠিকানা:' : 'Delivery Address:'}
          </p>
          <p className="text-[#4B5563]">
            {order.address.streetAddress}, {order.address.area}, {order.address.upazila},{' '}
            {order.address.district}, {order.address.division} · {order.phone}
          </p>
        </div>

        <div className="border-t border-[#E5E7EB] pt-4 space-y-2 text-xs">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between">
              <span>
                {formatNum(item.quantity, language)} × {getText(item.productName, language)}
              </span>
              <span className="font-semibold tabular-nums">
                {formatBDT(item.unitPrice * item.quantity, language)}
              </span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-bold text-[#172337] pt-2 border-t border-[#E5E7EB]">
            <span>{language === 'bn' ? 'সর্বমোট' : 'Total'}</span>
            <span className="text-[#F85606] tabular-nums">{formatBDT(order.total, language)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            to={`/track-order?orderId=${order.id}&phone=${encodeURIComponent(order.phone)}`}
            className="px-5 py-2.5 rounded-lg bg-[#F85606] text-white text-xs font-semibold"
          >
            {language === 'bn' ? 'অর্ডার ট্র্যাক করুন' : 'Track This Order'}
          </Link>
          <Link
            to="/shop"
            className="px-5 py-2.5 rounded-lg border border-[#E5E7EB] text-xs font-semibold text-[#172337]"
          >
            {language === 'bn' ? 'শপিং চালিয়ে যান' : 'Continue Shopping'}
          </Link>
        </div>
      </div>
    </div>
  );
};
