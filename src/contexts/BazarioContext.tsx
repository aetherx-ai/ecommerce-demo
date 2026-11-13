import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  HERO_SLIDES,
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_SELLERS,
  INITIAL_SETTINGS,
} from '../data/bazarioData';
import {
  clearAllPersistedState,
  loadPersistedState,
  savePersistedState,
} from '../services/storageService';
import {
  CartItem,
  Category,
  Coupon,
  Customer,
  DeliveryMethod,
  HeroSlide,
  Language,
  MarketplaceSettings,
  Order,
  OrderAddress,
  OrderStatus,
  PaymentMethod,
  Product,
  ProductReview,
  ProductStatus,
  SavedAddress,
  Seller,
  SellerStatus,
  UserRole,
} from '../types/bazario';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface BazarioContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeSellerId: string;
  setActiveSellerId: (sellerId: string) => void;
  currentCustomerId: string;
  setCurrentCustomerId: (custId: string) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;

  categories: Category[];
  sellers: Seller[];
  products: Product[];
  reviews: ProductReview[];
  orders: Order[];
  customers: Customer[];
  coupons: Coupon[];
  heroSlides: HeroSlide[];
  settings: MarketplaceSettings;

  cart: CartItem[];
  wishlist: string[];
  recentlyViewed: string[];
  searchHistory: string[];
  appliedCouponCode: string;
  toasts: ToastItem[];

  // Helpers
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  getSellerById: (sellerId: string) => Seller | undefined;
  getCategoryBySlug: (slug: string) => Category | undefined;

  // Customer actions
  addToCart: (product: Product, color: string, size: string, quantity?: number) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  toggleCartItemSelected: (cartItemId: string) => void;
  toggleSelectAllCart: (selected: boolean) => void;
  removeFromCart: (cartItemId: string) => void;
  clearSelectedCartItems: () => void;
  toggleWishlist: (productId: string) => void;
  recordProductView: (productId: string) => void;
  addSearchHistory: (query: string) => void;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  clearCoupon: () => void;
  placeOrder: (payload: {
    customerName: string;
    phone: string;
    altPhone?: string;
    email?: string;
    address: OrderAddress;
    deliveryMethod: DeliveryMethod;
    paymentMethod: PaymentMethod;
  }) => Order;
  addReview: (productId: string, rating: number, comment: string, customerName: string, location: string) => void;
  updateCustomerProfile: (data: { name: string; phone: string; email: string; city: string }) => void;
  addCustomerAddress: (addr: Omit<SavedAddress, 'id'>) => void;
  deleteCustomerAddress: (addrId: string) => void;
  registerCustomer: (name: string, phone: string, email: string, city: string) => void;

  // Seller actions
  saveSellerProduct: (product: Product) => void;
  deleteSellerProduct: (productId: string) => void;
  updateSellerProfile: (sellerId: string, updates: Partial<Seller>) => void;
  submitSellerApplication: (app: {
    ownerName: string;
    phone: string;
    email: string;
    storeName: string;
    businessCategory: string;
    address: string;
    descriptionEn: string;
  }) => Seller;

  // Admin actions
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateSellerStatus: (sellerId: string, status: SellerStatus) => void;
  updateProductStatus: (productId: string, status: ProductStatus) => void;
  saveCategory: (cat: Category) => void;
  saveCoupon: (coupon: Coupon) => void;
  deleteCoupon: (couponId: string) => void;
  updateSettings: (updates: Partial<MarketplaceSettings>) => void;
  saveHeroSlides: (slides: HeroSlide[]) => void;
  deleteReview: (reviewId: string) => void;
  resetAllDemoData: () => void;
}

const BazarioContext = createContext<BazarioContextValue | null>(null);

export const BazarioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() =>
    loadPersistedState<Language>('lang', 'bn')
  );
  const [role, setRoleState] = useState<UserRole>(() =>
    loadPersistedState<UserRole>('role', 'customer')
  );
  const [activeSellerId, setActiveSellerId] = useState<string>(() =>
    loadPersistedState<string>('activeSeller', 'sel-techworld')
  );
  const [currentCustomerId, setCurrentCustomerId] = useState<string>(() =>
    loadPersistedState<string>('activeCustomer', 'cust-1')
  );
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() =>
    loadPersistedState<boolean>('loggedIn', true)
  );

  const [categories, setCategories] = useState<Category[]>(() =>
    loadPersistedState('categories', INITIAL_CATEGORIES)
  );
  const [sellers, setSellers] = useState<Seller[]>(() =>
    loadPersistedState('sellers', INITIAL_SELLERS)
  );
  const [products, setProducts] = useState<Product[]>(() =>
    loadPersistedState('products', INITIAL_PRODUCTS)
  );
  const [reviews, setReviews] = useState<ProductReview[]>(() =>
    loadPersistedState('reviews', INITIAL_REVIEWS)
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    loadPersistedState('orders', INITIAL_ORDERS)
  );
  const [customers, setCustomers] = useState<Customer[]>(() =>
    loadPersistedState('customers', INITIAL_CUSTOMERS)
  );
  const [coupons, setCoupons] = useState<Coupon[]>(() =>
    loadPersistedState('coupons', INITIAL_COUPONS)
  );
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() =>
    loadPersistedState('heroSlides', HERO_SLIDES)
  );
  const [settings, setSettings] = useState<MarketplaceSettings>(() =>
    loadPersistedState('settings', INITIAL_SETTINGS)
  );

  const [cart, setCart] = useState<CartItem[]>(() =>
    loadPersistedState('cart', [])
  );
  const [wishlist, setWishlist] = useState<string[]>(() =>
    loadPersistedState('wishlist', ['prod-1', 'prod-17', 'prod-20'])
  );
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() =>
    loadPersistedState('recentlyViewed', ['prod-1', 'prod-5', 'prod-17', 'prod-20'])
  );
  const [searchHistory, setSearchHistory] = useState<string[]>(() =>
    loadPersistedState('searchHistory', ['Jamdani Saree', 'Panjabi', 'Smartphone', 'Headphones'])
  );
  const [appliedCouponCode, setAppliedCouponCode] = useState<string>(() =>
    loadPersistedState('appliedCoupon', '')
  );
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => savePersistedState('lang', language), [language]);
  useEffect(() => savePersistedState('role', role), [role]);
  useEffect(() => savePersistedState('activeSeller', activeSellerId), [activeSellerId]);
  useEffect(() => savePersistedState('activeCustomer', currentCustomerId), [currentCustomerId]);
  useEffect(() => savePersistedState('loggedIn', isLoggedIn), [isLoggedIn]);
  useEffect(() => savePersistedState('categories', categories), [categories]);
  useEffect(() => savePersistedState('sellers', sellers), [sellers]);
  useEffect(() => savePersistedState('products', products), [products]);
  useEffect(() => savePersistedState('reviews', reviews), [reviews]);
  useEffect(() => savePersistedState('orders', orders), [orders]);
  useEffect(() => savePersistedState('customers', customers), [customers]);
  useEffect(() => savePersistedState('coupons', coupons), [coupons]);
  useEffect(() => savePersistedState('heroSlides', heroSlides), [heroSlides]);
  useEffect(() => savePersistedState('settings', settings), [settings]);
  useEffect(() => savePersistedState('cart', cart), [cart]);
  useEffect(() => savePersistedState('wishlist', wishlist), [wishlist]);
  useEffect(() => savePersistedState('recentlyViewed', recentlyViewed), [recentlyViewed]);
  useEffect(() => savePersistedState('searchHistory', searchHistory), [searchHistory]);
  useEffect(() => savePersistedState('appliedCoupon', appliedCouponCode), [appliedCouponCode]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 2600);
  };

  const setLanguage = (lang: Language) => setLanguageState(lang);
  const toggleLanguage = () => setLanguageState((prev) => (prev === 'bn' ? 'en' : 'bn'));
  const setRole = (nextRole: UserRole) => setRoleState(nextRole);

  const getSellerById = (sellerId: string) => sellers.find((s) => s.id === sellerId);
  const getCategoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);

  const addToCart = (product: Product, color: string, size: string, quantity = 1) => {
    if (product.stock <= 0) {
      showToast(language === 'bn' ? 'দুঃখিত, পণ্যটি স্টকে নেই' : 'Product is out of stock', 'error');
      return;
    }
    const cartItemId = `${product.id}__${color}__${size}`;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === cartItemId);
      if (existing) {
        const nextQty = Math.min(product.stock, existing.quantity + quantity);
        return prev.map((i) =>
          i.id === cartItemId ? { ...i, quantity: nextQty, selected: true } : i
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          productId: product.id,
          sellerId: product.sellerId,
          quantity: Math.min(product.stock, quantity),
          color,
          size,
          selected: true,
        },
      ];
    });
    showToast(
      language === 'bn'
        ? `${product.name.bn} কার্টে যোগ করা হয়েছে`
        : `${product.name.en} added to cart`
    );
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== cartItemId) return item;
          const prod = products.find((p) => p.id === item.productId);
          const maxStock = prod?.stock ?? 99;
          const next = Math.min(maxStock, item.quantity + delta);
          return { ...item, quantity: next };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const toggleCartItemSelected = (cartItemId: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === cartItemId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const toggleSelectAllCart = (selected: boolean) => {
    setCart((prev) => prev.map((item) => ({ ...item, selected })));
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const clearSelectedCartItems = () => {
    setCart((prev) => prev.filter((item) => !item.selected));
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      showToast(
        exists
          ? language === 'bn'
            ? 'উইশলিস্ট থেকে সরানো হয়েছে'
            : 'Removed from wishlist'
          : language === 'bn'
          ? 'উইশলিস্টে সংরক্ষণ করা হয়েছে'
          : 'Saved to wishlist',
        'info'
      );
      return exists ? prev.filter((id) => id !== productId) : [productId, ...prev];
    });
  };

  const recordProductView = (productId: string) => {
    setRecentlyViewed((prev) => [productId, ...prev.filter((id) => id !== productId)].slice(0, 10));
  };

  const addSearchHistory = (query: string) => {
    const clean = query.trim();
    if (!clean) return;
    setSearchHistory((prev) =>
      [clean, ...prev.filter((q) => q.toLowerCase() !== clean.toLowerCase())].slice(0, 6)
    );
  };

  const selectedCartSubtotal = useMemo(() => {
    return cart
      .filter((i) => i.selected)
      .reduce((sum, item) => {
        const prod = products.find((p) => p.id === item.productId);
        return sum + (prod ? prod.discountedPrice * item.quantity : 0);
      }, 0);
  }, [cart, products]);

  const applyCoupon = (rawCode: string): { ok: boolean; message: string } => {
    const normalized = rawCode.trim().toUpperCase();
    const coupon = coupons.find((c) => c.code.toUpperCase() === normalized && c.active);
    if (!coupon) {
      return {
        ok: false,
        message:
          language === 'bn'
            ? 'কুপন কোডটি সঠিক নয় বা মেয়াদ শেষ হয়েছে।'
            : 'Invalid or inactive coupon code.',
      };
    }
    if (coupon.usedCount >= coupon.usageLimit) {
      return {
        ok: false,
        message:
          language === 'bn' ? 'কুপন ব্যবহারের সীমা শেষ।' : 'Coupon usage limit reached.',
      };
    }
    if (selectedCartSubtotal < coupon.minOrderAmount) {
      return {
        ok: false,
        message:
          language === 'bn'
            ? `এই কুপনটি ব্যবহার করতে ন্যূনতম ৳${coupon.minOrderAmount} অর্ডার প্রয়োজন।`
            : `Minimum order of ৳${coupon.minOrderAmount} required for ${coupon.code}.`,
      };
    }
    setAppliedCouponCode(coupon.code);
    return {
      ok: true,
      message:
        language === 'bn'
          ? `${coupon.code} সফলভাবে প্রয়োগ করা হয়েছে!`
          : `Coupon ${coupon.code} applied!`,
    };
  };

  const clearCoupon = () => setAppliedCouponCode('');

  const placeOrder = (payload: {
    customerName: string;
    phone: string;
    altPhone?: string;
    email?: string;
    address: OrderAddress;
    deliveryMethod: DeliveryMethod;
    paymentMethod: PaymentMethod;
  }): Order => {
    const selectedItems = cart.filter((i) => i.selected);
    const itemsToOrder = selectedItems.length > 0 ? selectedItems : cart;

    const orderItems = itemsToOrder.map((ci) => {
      const prod = products.find((p) => p.id === ci.productId)!;
      return {
        productId: prod.id,
        sellerId: prod.sellerId,
        productName: prod.name,
        sku: prod.sku,
        image: prod.images[0],
        color: ci.color,
        size: ci.size,
        quantity: ci.quantity,
        unitPrice: prod.discountedPrice,
      };
    });

    const subtotal = orderItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const isDhaka = payload.address.district === 'Dhaka';
    const baseDelivery = isDhaka
      ? settings.deliveryDhakaCharge
      : settings.deliveryOutsideCharge;
    const expressExtra =
      payload.deliveryMethod === 'Express' ? settings.expressExtraCharge : 0;
    const deliveryCharge =
      subtotal >= settings.freeDeliveryThreshold && payload.deliveryMethod === 'Standard'
        ? 0
        : baseDelivery + expressExtra;

    let discount = 0;
    const activeCoupon = coupons.find(
      (c) => c.code === appliedCouponCode && c.active && subtotal >= c.minOrderAmount
    );
    if (activeCoupon) {
      discount =
        activeCoupon.type === 'percentage'
          ? Math.min(
              activeCoupon.maxDiscount ?? 999999,
              Math.round((subtotal * activeCoupon.value) / 100)
            )
          : activeCoupon.value;
    }

    const total = Math.max(0, subtotal + deliveryCharge - discount);
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(now.getDate()).padStart(2, '0')} ${String(
      now.getHours()
    ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newOrder: Order = {
      id: `BZ-${Math.floor(8500 + Math.random() * 1400)}`,
      customerId: currentCustomerId,
      customerName: payload.customerName,
      phone: payload.phone,
      altPhone: payload.altPhone,
      email: payload.email,
      address: payload.address,
      deliveryMethod: payload.deliveryMethod,
      paymentMethod: payload.paymentMethod,
      paymentSimulatedRef:
        payload.paymentMethod === 'Cash on Delivery'
          ? undefined
          : `DEMO-${payload.paymentMethod.slice(0, 3).toUpperCase()}-${Math.floor(
              1000 + Math.random() * 8999
            )}`,
      status: 'Pending',
      items: orderItems,
      subtotal,
      deliveryCharge,
      discount,
      couponCode: activeCoupon?.code,
      total,
      createdAt: timestamp,
      estimatedDelivery:
        payload.deliveryMethod === 'Express'
          ? isDhaka
            ? 'Within 24 Hours (Dhaka Express)'
            : '1–2 Days (Nationwide Express)'
          : isDhaka
          ? '1–2 Days (Dhaka Standard)'
          : '3–5 Days (Outside Dhaka)',
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Update product stock & sold count
    setProducts((prev) =>
      prev.map((prod) => {
        const bought = orderItems
          .filter((i) => i.productId === prod.id)
          .reduce((s, i) => s + i.quantity, 0);
        if (bought === 0) return prod;
        return {
          ...prod,
          stock: Math.max(0, prod.stock - bought),
          soldCount: prod.soldCount + bought,
        };
      })
    );

    if (activeCoupon) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === activeCoupon.id ? { ...c, usedCount: c.usedCount + 1 } : c
        )
      );
    }

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === currentCustomerId
          ? {
              ...c,
              totalOrders: c.totalOrders + 1,
              totalSpent: c.totalSpent + total,
            }
          : c
      )
    );

    clearSelectedCartItems();
    setAppliedCouponCode('');
    return newOrder;
  };

  const addReview = (
    productId: string,
    rating: number,
    comment: string,
    customerName: string,
    location: string
  ) => {
    const newRev: ProductReview = {
      id: `rev-${Date.now()}`,
      productId,
      customerName,
      location,
      rating,
      comment,
      createdAt: new Date().toISOString().slice(0, 10),
      verifiedPurchase: true,
    };
    setReviews((prev) => [newRev, ...prev]);
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const nextCount = p.reviewCount + 1;
        const nextRating = Number(
          ((p.rating * p.reviewCount + rating) / nextCount).toFixed(1)
        );
        return { ...p, reviewCount: nextCount, rating: nextRating };
      })
    );
    showToast(language === 'bn' ? 'রিভিউ যুক্ত হয়েছে!' : 'Review published!');
  };

  const updateCustomerProfile = (data: {
    name: string;
    phone: string;
    email: string;
    city: string;
  }) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === currentCustomerId ? { ...c, ...data } : c))
    );
    showToast(language === 'bn' ? 'প্রোফাইল আপডেট হয়েছে' : 'Profile updated');
  };

  const addCustomerAddress = (addr: Omit<SavedAddress, 'id'>) => {
    const newAddr: SavedAddress = { ...addr, id: `addr-${Date.now()}` };
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== currentCustomerId) return c;
        const base = addr.isDefault
          ? c.addresses.map((a) => ({ ...a, isDefault: false }))
          : c.addresses;
        return { ...c, addresses: [newAddr, ...base] };
      })
    );
    showToast(language === 'bn' ? 'নতুন ঠিকানা সংরক্ষিত' : 'Address saved');
  };

  const deleteCustomerAddress = (addrId: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === currentCustomerId
          ? { ...c, addresses: c.addresses.filter((a) => a.id !== addrId) }
          : c
      )
    );
  };

  const registerCustomer = (
    name: string,
    phone: string,
    email: string,
    city: string
  ) => {
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name,
      phone,
      email,
      city,
      joinedAt: new Date().toISOString().slice(0, 10),
      totalOrders: 0,
      totalSpent: 0,
      addresses: [],
    };
    setCustomers((prev) => [newCust, ...prev]);
    setCurrentCustomerId(newCust.id);
    setIsLoggedIn(true);
    showToast(
      language === 'bn' ? 'অ্যাকাউন্ট তৈরি সফল হয়েছে!' : 'Welcome to BAZARIO!'
    );
  };

  // Seller operations
  const saveSellerProduct = (product: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      return exists
        ? prev.map((p) => (p.id === product.id ? product : p))
        : [product, ...prev];
    });
    showToast(
      language === 'bn'
        ? `${product.name.bn} সংরক্ষণ করা হয়েছে`
        : `${product.name.en} saved`
    );
  };

  const deleteSellerProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast(language === 'bn' ? 'পণ্য মুছে ফেলা হয়েছে' : 'Product deleted', 'info');
  };

  const updateSellerProfile = (sellerId: string, updates: Partial<Seller>) => {
    setSellers((prev) =>
      prev.map((s) => (s.id === sellerId ? { ...s, ...updates } : s))
    );
    showToast(language === 'bn' ? 'স্টোর প্রোফাইল আপডেট হয়েছে' : 'Store profile updated');
  };

  const submitSellerApplication = (app: {
    ownerName: string;
    phone: string;
    email: string;
    storeName: string;
    businessCategory: string;
    address: string;
    descriptionEn: string;
  }): Seller => {
    const slug = app.storeName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    const initials = app.storeName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    const newSeller: Seller = {
      id: `sel-${Date.now()}`,
      slug: `${slug}-${Math.floor(10 + Math.random() * 89)}`,
      storeName: app.storeName,
      ownerName: app.ownerName,
      email: app.email,
      phone: app.phone,
      businessCategory: app.businessCategory,
      address: app.address,
      description: {
        bn: app.descriptionEn,
        en: app.descriptionEn,
      },
      rating: 5.0,
      reviewCount: 0,
      totalSalesCount: 0,
      status: 'pending',
      verified: false,
      joinedAt: new Date().toISOString().slice(0, 10),
      bannerColor: '#172337',
      logoInitials: initials || 'BZ',
    };
    setSellers((prev) => [newSeller, ...prev]);
    setActiveSellerId(newSeller.id);
    showToast(
      language === 'bn'
        ? 'সেলার আবেদন জমা হয়েছে! অ্যাডমিন অনুমোদনের অপেক্ষায়।'
        : 'Seller application submitted! Pending admin approval.'
    );
    return newSeller;
  };

  // Admin operations
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    showToast(`Order #${orderId} → ${status}`);
  };

  const updateSellerStatus = (sellerId: string, status: SellerStatus) => {
    setSellers((prev) =>
      prev.map((s) =>
        s.id === sellerId
          ? { ...s, status, verified: status === 'approved' }
          : s
      )
    );
    showToast(`Seller status updated to ${status}`);
  };

  const updateProductStatus = (productId: string, status: ProductStatus) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status } : p))
    );
    showToast(`Product moderation → ${status}`);
  };

  const saveCategory = (cat: Category) => {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === cat.id);
      return exists ? prev.map((c) => (c.id === cat.id ? cat : c)) : [...prev, cat];
    });
    showToast('Category saved');
  };

  const saveCoupon = (coupon: Coupon) => {
    setCoupons((prev) => {
      const exists = prev.some((c) => c.id === coupon.id);
      return exists ? prev.map((c) => (c.id === coupon.id ? coupon : c)) : [coupon, ...prev];
    });
    showToast(`Coupon ${coupon.code} saved`);
  };

  const deleteCoupon = (couponId: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== couponId));
    showToast('Coupon removed', 'info');
  };

  const updateSettings = (updates: Partial<MarketplaceSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    showToast(language === 'bn' ? 'সেটিংস সংরক্ষিত হয়েছে' : 'Settings updated');
  };

  const saveHeroSlides = (slides: HeroSlide[]) => {
    setHeroSlides(slides);
    showToast('Promotional banners updated');
  };

  const deleteReview = (reviewId: string) => {
    const target = reviews.find((r) => r.id === reviewId);
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    if (target) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === target.productId
            ? { ...p, reviewCount: Math.max(0, p.reviewCount - 1) }
            : p
        )
      );
    }
    showToast(language === 'bn' ? 'রিভিউ মুছে ফেলা হয়েছে' : 'Review removed', 'info');
  };

  const resetAllDemoData = () => {
    clearAllPersistedState();
    setCategories(INITIAL_CATEGORIES);
    setSellers(INITIAL_SELLERS);
    setProducts(INITIAL_PRODUCTS);
    setReviews(INITIAL_REVIEWS);
    setOrders(INITIAL_ORDERS);
    setCustomers(INITIAL_CUSTOMERS);
    setCoupons(INITIAL_COUPONS);
    setHeroSlides(HERO_SLIDES);
    setSettings(INITIAL_SETTINGS);
    setCart([]);
    setAppliedCouponCode('');
    showToast('Demo marketplace reset to initial state', 'info');
  };

  return (
    <BazarioContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        role,
        setRole,
        activeSellerId,
        setActiveSellerId,
        currentCustomerId,
        setCurrentCustomerId,
        isLoggedIn,
        setIsLoggedIn,
        categories,
        sellers,
        products,
        reviews,
        orders,
        customers,
        coupons,
        heroSlides,
        settings,
        cart,
        wishlist,
        recentlyViewed,
        searchHistory,
        appliedCouponCode,
        toasts,
        showToast,
        getSellerById,
        getCategoryBySlug,
        addToCart,
        updateCartQuantity,
        toggleCartItemSelected,
        toggleSelectAllCart,
        removeFromCart,
        clearSelectedCartItems,
        toggleWishlist,
        recordProductView,
        addSearchHistory,
        applyCoupon,
        clearCoupon,
        placeOrder,
        addReview,
        updateCustomerProfile,
        addCustomerAddress,
        deleteCustomerAddress,
        registerCustomer,
        saveSellerProduct,
        deleteSellerProduct,
        updateSellerProfile,
        submitSellerApplication,
        updateOrderStatus,
        updateSellerStatus,
        updateProductStatus,
        saveCategory,
        saveCoupon,
        deleteCoupon,
        updateSettings,
        saveHeroSlides,
        deleteReview,
        resetAllDemoData,
      }}
    >
      {children}
    </BazarioContext.Provider>
  );
};

export function useBazario(): BazarioContextValue {
  const ctx = useContext(BazarioContext);
  if (!ctx) {
    throw new Error('useBazario must be used inside BazarioProvider');
  }
  return ctx;
}
