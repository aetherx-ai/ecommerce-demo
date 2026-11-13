export type Language = 'bn' | 'en';

export type UserRole = 'customer' | 'seller' | 'admin';

export interface BilingualText {
  bn: string;
  en: string;
}

export interface SubCategory {
  id: string;
  slug: string;
  name: BilingualText;
}

export interface Category {
  id: string;
  slug: string;
  name: BilingualText;
  iconName: string;
  image: string;
  subcategories: SubCategory[];
}

export type SellerStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface Seller {
  id: string;
  slug: string;
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessCategory: string;
  address: string;
  description: BilingualText;
  rating: number;
  reviewCount: number;
  totalSalesCount: number;
  status: SellerStatus;
  verified: boolean;
  joinedAt: string;
  bannerColor: string;
  logoInitials: string;
}

export type ProductStatus = 'pending' | 'approved' | 'rejected';

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  location: string;
  rating: number;
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: BilingualText;
  categorySlug: string;
  subcategorySlug: string;
  brand: string;
  sellerId: string;
  images: string[];
  regularPrice: number;
  discountedPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  soldCount: number;
  stock: number;
  description: BilingualText;
  specifications: Record<string, string>;
  colors: string[];
  sizes: string[];
  deliveryDhakaDays: string;
  deliveryOutsideDays: string;
  isFlashSale?: boolean;
  isTrending?: boolean;
  isNewArrival?: boolean;
  status: ProductStatus;
  createdAt: string;
}

export interface CartItem {
  id: string; // productId + color + size
  productId: string;
  sellerId: string;
  quantity: number;
  color: string;
  size: string;
  selected: boolean;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod =
  | 'Cash on Delivery'
  | 'bKash'
  | 'Nagad'
  | 'Rocket'
  | 'Card Payment';

export type DeliveryMethod = 'Standard' | 'Express';

export interface OrderItem {
  productId: string;
  sellerId: string;
  productName: BilingualText;
  sku: string;
  image: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderAddress {
  division: string;
  district: string;
  upazila: string;
  area: string;
  streetAddress: string;
  addressType: 'Home' | 'Office';
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  altPhone?: string;
  email?: string;
  address: OrderAddress;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  paymentSimulatedRef?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  couponCode?: string;
  total: number;
  createdAt: string;
  estimatedDelivery: string;
}

export interface SavedAddress extends OrderAddress {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  isDefault: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  joinedAt: string;
  totalOrders: number;
  totalSpent: number;
  addresses: SavedAddress[];
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  active: boolean;
  description: BilingualText;
}

export interface HeroSlide {
  id: string;
  badge: BilingualText;
  title: BilingualText;
  subtitle: BilingualText;
  ctaLabel: BilingualText;
  ctaLink: string;
  image: string;
  bgColor: string;
}

export interface MarketplaceSettings {
  marketplaceName: string;
  taglineBn: string;
  taglineEn: string;
  deliveryDhakaCharge: number;
  deliveryOutsideCharge: number;
  expressExtraCharge: number;
  freeDeliveryThreshold: number;
  supportPhone: string;
  supportEmail: string;
  whatsappHandle: string;
  facebookUrl: string;
  demoNotice: string;
}
