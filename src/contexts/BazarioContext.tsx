import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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

export interface BazarioActionsValue {
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  setRole: (role: UserRole) => void;
  setActiveSellerId: (sellerId: string) => void;
  setCurrentCustomerId: (custId: string) => void;
  setIsLoggedIn: (val: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
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
  addReview: (
    productId: string,
    rating: number,
    comment: string,
    customerName: string,
    location: string
  ) => void;
  updateCustomerProfile: (data: {
    name: string;
    phone: string;
    email: string;
    city: string;
  }) => void;
  addCustomerAddress: (addr: Omit<SavedAddress, 'id'>) => void;
  deleteCustomerAddress: (addrId: string) => void;
  registerCustomer: (name: string, phone: string, email: string, city: string) => void;
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

interface BazarioContextValue extends BazarioActionsValue {
  language: Language;
  role: UserRole;
  activeSellerId: string;
  currentCustomerId: string;
  isLoggedIn: boolean;

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
  wishlistSet: Set<string>;
  recentlyViewed: string[];
  searchHistory: string[];
  appliedCouponCode: string;

  // O(1) Helpers
  getSellerById: (sellerId: string) => Seller | undefined;
  getCategoryBySlug: (slug: string) => Category | undefined;
  getProductById: (productId: string) => Product | undefined;
}

const BazarioContext = createContext<BazarioContextValue | null>(null);
const BazarioActionsContext = createContext<BazarioActionsValue | null>(null);
const BazarioToastContext = createContext<ToastItem[]>([]);

function usePersistedSync<T>(key: string, value: T, debounceMs = 0) {
  const isFirstRender = useRef(true);
  const latestRef = useRef(value);
  latestRef.current = value;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (debounceMs <= 0) {
      savePersistedState(key, value);
      return;
    }

    const timer = window.setTimeout(() => {
      savePersistedState(key, latestRef.current);
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [key, value, debounceMs]);
}

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

  // Only persist after state actually changes; debounce large datasets to avoid main-thread stalls
  usePersistedSync('lang', language);
  usePersistedSync('role', role);
  usePersistedSync('activeSeller', activeSellerId);
  usePersistedSync('activeCustomer', currentCustomerId);
  usePersistedSync('loggedIn', isLoggedIn);
  usePersistedSync('categories', categories, 150);
  usePersistedSync('sellers', sellers, 150);
  usePersistedSync('products', products, 200);
  usePersistedSync('reviews', reviews, 150);
  usePersistedSync('orders', orders, 150);
  usePersistedSync('customers', customers, 150);
  usePersistedSync('coupons', coupons, 150);
  usePersistedSync('heroSlides', heroSlides, 150);
  usePersistedSync('settings', settings, 150);
  usePersistedSync('cart', cart);
  usePersistedSync('wishlist', wishlist);
  usePersistedSync('recentlyViewed', recentlyViewed, 150);
  usePersistedSync('searchHistory', searchHistory, 150);
  usePersistedSync('appliedCoupon', appliedCouponCode);

  // Indexed Maps & Sets for O(1) lookups across grids, cart, checkout & admin
  const sellerByIdMap = useMemo(() => {
    const map = new Map<string, Seller>();
    for (const s of sellers) map.set(s.id, s);
    return map;
  }, [sellers]);

  const categoryBySlugMap = useMemo(() => {
    const map = new Map<string, Category>();
    for (const c of categories) map.set(c.slug, c);
    return map;
  }, [categories]);

  const productByIdMap = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of products) map.set(p.id, p);
    return map;
  }, [products]);

  const wishlistSet = useMemo(() => new Set(wishlist), [wishlist]);

  // Keep refs to mutable state needed inside stable callbacks
  const stateRef = useRef({
    language,
    cart,
    coupons,
    products,
    productByIdMap,
    appliedCouponCode,
    currentCustomerId,
    settings,
    reviews,
  });
  stateRef.current = {
    language,
    cart,
    coupons,
    products,
    productByIdMap,
    appliedCouponCode,
    currentCustomerId,
    settings,
    reviews,
  };

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 2600);
    },
    []
  );

  const setLanguage = useCallback((lang: Language) => setLanguageState(lang), []);
  const toggleLanguage = useCallback(
    () => setLanguageState((prev) => (prev === 'bn' ? 'en' : 'bn')),
    []
  );
  const setRole = useCallback((nextRole: UserRole) => setRoleState(nextRole), []);

  const getSellerById = useCallback(
    (sellerId: string) => sellerByIdMap.get(sellerId),
    [sellerByIdMap]
  );
  const getCategoryBySlug = useCallback(
    (slug: string) => categoryBySlugMap.get(slug),
    [categoryBySlugMap]
  );
  const getProductById = useCallback(
    (productId: string) => productByIdMap.get(productId),
    [productByIdMap]
  );

  const addToCart = useCallback(
    (product: Product, color: string, size: string, quantity = 1) => {
      const lang = stateRef.current.language;
      if (product.stock <= 0) {
        showToast(lang === 'bn' ? 'দুঃখিত, পণ্যটি স্টকে নেই' : 'Product is out of stock', 'error');
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
        lang === 'bn'
          ? `${product.name.bn} কার্টে যোগ করা হয়েছে`
          : `${product.name.en} added to cart`
      );
    },
    [showToast]
  );

  const updateCartQuantity = useCallback((cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== cartItemId) return item;
          const prod = stateRef.current.productByIdMap.get(item.productId);
          const maxStock = prod?.stock ?? 99;
          const next = Math.min(maxStock, item.quantity + delta);
          return { ...item, quantity: next };
        })
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const toggleCartItemSelected = useCallback((cartItemId: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === cartItemId ? { ...item, selected: !item.selected } : item
      )
    );
  }, []);

  const toggleSelectAllCart = useCallback((selected: boolean) => {
    setCart((prev) => prev.map((item) => ({ ...item, selected })));
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  }, []);

  const clearSelectedCartItems = useCallback(() => {
    setCart((prev) => prev.filter((item) => !item.selected));
  }, []);

  const toggleWishlist = useCallback(
    (productId: string) => {
      const lang = stateRef.current.language;
      setWishlist((prev) => {
        const exists = prev.includes(productId);
        showToast(
          exists
            ? lang === 'bn'
              ? 'উইশলিস্ট থেকে সরানো হয়েছে'
              : 'Removed from wishlist'
            : lang === 'bn'
            ? 'উইশলিস্টে সংরক্ষণ করা হয়েছে'
            : 'Saved to wishlist',
          'info'
        );
        return exists ? prev.filter((id) => id !== productId) : [productId, ...prev];
      });
    },
    [showToast]
  );

  const recordProductView = useCallback((productId: string) => {
    setRecentlyViewed((prev) => {
      if (prev[0] === productId) return prev;
      return [productId, ...prev.filter((id) => id !== productId)].slice(0, 10);
    });
  }, []);

  const addSearchHistory = useCallback((query: string) => {
    const clean = query.trim();
    if (!clean) return;
    setSearchHistory((prev) =>
      [clean, ...prev.filter((q) => q.toLowerCase() !== clean.toLowerCase())].slice(0, 6)
    );
  }, []);

  const applyCoupon = useCallback((rawCode: string): { ok: boolean; message: string } => {
    const { language: lang, coupons: currentCoupons, cart: currentCart, productByIdMap: pMap } =
      stateRef.current;
    const subtotal = currentCart
      .filter((i) => i.selected)
      .reduce((sum, item) => {
        const prod = pMap.get(item.productId);
        return sum + (prod ? prod.discountedPrice * item.quantity : 0);
      }, 0);

    const normalized = rawCode.trim().toUpperCase();
    const coupon = currentCoupons.find((c) => c.code.toUpperCase() === normalized && c.active);
    if (!coupon) {
      return {
        ok: false,
        message:
          lang === 'bn'
            ? 'কুপন কোডটি সঠিক নয় বা মেয়াদ শেষ হয়েছে।'
            : 'Invalid or inactive coupon code.',
      };
    }
    if (coupon.usedCount >= coupon.usageLimit) {
      return {
        ok: false,
        message: lang === 'bn' ? 'কুপন ব্যবহারের সীমা শেষ।' : 'Coupon usage limit reached.',
      };
    }
    if (subtotal < coupon.minOrderAmount) {
      return {
        ok: false,
        message:
          lang === 'bn'
            ? `এই কুপনটি ব্যবহার করতে ন্যূনতম ৳${coupon.minOrderAmount} অর্ডার প্রয়োজন।`
            : `Minimum order of ৳${coupon.minOrderAmount} required for ${coupon.code}.`,
      };
    }
    setAppliedCouponCode(coupon.code);
    return {
      ok: true,
      message:
        lang === 'bn'
          ? `${coupon.code} সফলভাবে প্রয়োগ করা হয়েছে!`
          : `Coupon ${coupon.code} applied!`,
    };
  }, []);

  const clearCoupon = useCallback(() => setAppliedCouponCode(''), []);

  const placeOrder = useCallback(
    (payload: {
      customerName: string;
      phone: string;
      altPhone?: string;
      email?: string;
      address: OrderAddress;
      deliveryMethod: DeliveryMethod;
      paymentMethod: PaymentMethod;
    }): Order => {
      const {
        cart: currentCart,
        productByIdMap: pMap,
        settings: currentSettings,
        coupons: currentCoupons,
        appliedCouponCode: currentCouponCode,
        currentCustomerId: custId,
      } = stateRef.current;

      const selectedItems = currentCart.filter((i) => i.selected);
      const itemsToOrder = selectedItems.length > 0 ? selectedItems : currentCart;

      const orderItems = itemsToOrder.map((ci) => {
        const prod = pMap.get(ci.productId)!;
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
        ? currentSettings.deliveryDhakaCharge
        : currentSettings.deliveryOutsideCharge;
      const expressExtra =
        payload.deliveryMethod === 'Express' ? currentSettings.expressExtraCharge : 0;
      const deliveryCharge =
        subtotal >= currentSettings.freeDeliveryThreshold &&
        payload.deliveryMethod === 'Standard'
          ? 0
          : baseDelivery + expressExtra;

      let discount = 0;
      const activeCoupon = currentCoupons.find(
        (c) => c.code === currentCouponCode && c.active && subtotal >= c.minOrderAmount
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
        customerId: custId,
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

      const boughtQtyMap = new Map<string, number>();
      for (const item of orderItems) {
        boughtQtyMap.set(
          item.productId,
          (boughtQtyMap.get(item.productId) ?? 0) + item.quantity
        );
      }

      setOrders((prev) => [newOrder, ...prev]);
      setProducts((prev) =>
        prev.map((prod) => {
          const bought = boughtQtyMap.get(prod.id) ?? 0;
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
          c.id === custId
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
    },
    [clearSelectedCartItems]
  );

  const addReview = useCallback(
    (
      productId: string,
      rating: number,
      comment: string,
      customerName: string,
      location: string
    ) => {
      const lang = stateRef.current.language;
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
      showToast(lang === 'bn' ? 'রিভিউ যুক্ত হয়েছে!' : 'Review published!');
    },
    [showToast]
  );

  const updateCustomerProfile = useCallback(
    (data: { name: string; phone: string; email: string; city: string }) => {
      const { currentCustomerId: custId, language: lang } = stateRef.current;
      setCustomers((prev) =>
        prev.map((c) => (c.id === custId ? { ...c, ...data } : c))
      );
      showToast(lang === 'bn' ? 'প্রোফাইল আপডেট হয়েছে' : 'Profile updated');
    },
    [showToast]
  );

  const addCustomerAddress = useCallback(
    (addr: Omit<SavedAddress, 'id'>) => {
      const { currentCustomerId: custId, language: lang } = stateRef.current;
      const newAddr: SavedAddress = { ...addr, id: `addr-${Date.now()}` };
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id !== custId) return c;
          const base = addr.isDefault
            ? c.addresses.map((a) => ({ ...a, isDefault: false }))
            : c.addresses;
          return { ...c, addresses: [newAddr, ...base] };
        })
      );
      showToast(lang === 'bn' ? 'নতুন ঠিকানা সংরক্ষিত' : 'Address saved');
    },
    [showToast]
  );

  const deleteCustomerAddress = useCallback((addrId: string) => {
    const custId = stateRef.current.currentCustomerId;
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === custId
          ? { ...c, addresses: c.addresses.filter((a) => a.id !== addrId) }
          : c
      )
    );
  }, []);

  const registerCustomer = useCallback(
    (name: string, phone: string, email: string, city: string) => {
      const lang = stateRef.current.language;
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
      showToast(lang === 'bn' ? 'অ্যাকাউন্ট তৈরি সফল হয়েছে!' : 'Welcome to BAZARIO!');
    },
    [showToast]
  );

  // Seller operations
  const saveSellerProduct = useCallback(
    (product: Product) => {
      const lang = stateRef.current.language;
      setProducts((prev) => {
        const exists = prev.some((p) => p.id === product.id);
        return exists
          ? prev.map((p) => (p.id === product.id ? product : p))
          : [product, ...prev];
      });
      showToast(
        lang === 'bn' ? `${product.name.bn} সংরক্ষণ করা হয়েছে` : `${product.name.en} saved`
      );
    },
    [showToast]
  );

  const deleteSellerProduct = useCallback(
    (productId: string) => {
      const lang = stateRef.current.language;
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showToast(lang === 'bn' ? 'পণ্য মুছে ফেলা হয়েছে' : 'Product deleted', 'info');
    },
    [showToast]
  );

  const updateSellerProfile = useCallback(
    (sellerId: string, updates: Partial<Seller>) => {
      const lang = stateRef.current.language;
      setSellers((prev) =>
        prev.map((s) => (s.id === sellerId ? { ...s, ...updates } : s))
      );
      showToast(lang === 'bn' ? 'স্টোর প্রোফাইল আপডেট হয়েছে' : 'Store profile updated');
    },
    [showToast]
  );

  const submitSellerApplication = useCallback(
    (app: {
      ownerName: string;
      phone: string;
      email: string;
      storeName: string;
      businessCategory: string;
      address: string;
      descriptionEn: string;
    }): Seller => {
      const lang = stateRef.current.language;
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
        lang === 'bn'
          ? 'সেলার আবেদন জমা হয়েছে! অ্যাডমিন অনুমোদনের অপেক্ষায়।'
          : 'Seller application submitted! Pending admin approval.'
      );
      return newSeller;
    },
    [showToast]
  );

  // Admin operations
  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      showToast(`Order #${orderId} → ${status}`);
    },
    [showToast]
  );

  const updateSellerStatus = useCallback(
    (sellerId: string, status: SellerStatus) => {
      setSellers((prev) =>
        prev.map((s) =>
          s.id === sellerId
            ? { ...s, status, verified: status === 'approved' }
            : s
        )
      );
      showToast(`Seller status updated to ${status}`);
    },
    [showToast]
  );

  const updateProductStatus = useCallback(
    (productId: string, status: ProductStatus) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, status } : p))
      );
      showToast(`Product moderation → ${status}`);
    },
    [showToast]
  );

  const saveCategory = useCallback(
    (cat: Category) => {
      setCategories((prev) => {
        const exists = prev.some((c) => c.id === cat.id);
        return exists ? prev.map((c) => (c.id === cat.id ? cat : c)) : [...prev, cat];
      });
      showToast('Category saved');
    },
    [showToast]
  );

  const saveCoupon = useCallback(
    (coupon: Coupon) => {
      setCoupons((prev) => {
        const exists = prev.some((c) => c.id === coupon.id);
        return exists
          ? prev.map((c) => (c.id === coupon.id ? coupon : c))
          : [coupon, ...prev];
      });
      showToast(`Coupon ${coupon.code} saved`);
    },
    [showToast]
  );

  const deleteCoupon = useCallback(
    (couponId: string) => {
      setCoupons((prev) => prev.filter((c) => c.id !== couponId));
      showToast('Coupon removed', 'info');
    },
    [showToast]
  );

  const updateSettings = useCallback(
    (updates: Partial<MarketplaceSettings>) => {
      const lang = stateRef.current.language;
      setSettings((prev) => ({ ...prev, ...updates }));
      showToast(lang === 'bn' ? 'সেটিংস সংরক্ষিত হয়েছে' : 'Settings updated');
    },
    [showToast]
  );

  const saveHeroSlides = useCallback(
    (slides: HeroSlide[]) => {
      setHeroSlides(slides);
      showToast('Promotional banners updated');
    },
    [showToast]
  );

  const deleteReview = useCallback(
    (reviewId: string) => {
      const { reviews: currentReviews, language: lang } = stateRef.current;
      const target = currentReviews.find((r) => r.id === reviewId);
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
      showToast(lang === 'bn' ? 'রিভিউ মুছে ফেলা হয়েছে' : 'Review removed', 'info');
    },
    [showToast]
  );

  const resetAllDemoData = useCallback(() => {
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
  }, [showToast]);

  const actionsValue = useMemo<BazarioActionsValue>(
    () => ({
      setLanguage,
      toggleLanguage,
      setRole,
      setActiveSellerId,
      setCurrentCustomerId,
      setIsLoggedIn,
      showToast,
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
    }),
    [
      setLanguage,
      toggleLanguage,
      setRole,
      showToast,
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
    ]
  );

  const contextValue = useMemo<BazarioContextValue>(
    () => ({
      language,
      role,
      activeSellerId,
      currentCustomerId,
      isLoggedIn,
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
      wishlistSet,
      recentlyViewed,
      searchHistory,
      appliedCouponCode,
      getSellerById,
      getCategoryBySlug,
      getProductById,
      ...actionsValue,
    }),
    [
      language,
      role,
      activeSellerId,
      currentCustomerId,
      isLoggedIn,
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
      wishlistSet,
      recentlyViewed,
      searchHistory,
      appliedCouponCode,
      getSellerById,
      getCategoryBySlug,
      getProductById,
      actionsValue,
    ]
  );

  return (
    <BazarioActionsContext.Provider value={actionsValue}>
      <BazarioContext.Provider value={contextValue}>
        <BazarioToastContext.Provider value={toasts}>
          {children}
        </BazarioToastContext.Provider>
      </BazarioContext.Provider>
    </BazarioActionsContext.Provider>
  );
};

export function useBazario(): BazarioContextValue {
  const ctx = useContext(BazarioContext);
  if (!ctx) {
    throw new Error('useBazario must be used inside BazarioProvider');
  }
  return ctx;
}

export function useBazarioActions(): BazarioActionsValue {
  const ctx = useContext(BazarioActionsContext);
  if (!ctx) {
    throw new Error('useBazarioActions must be used inside BazarioProvider');
  }
  return ctx;
}

export function useBazarioToasts(): ToastItem[] {
  return useContext(BazarioToastContext);
}
