import type { Product } from './product';

export type OrderStatus = 
  | 'pending_payment'
  | 'pending_shipment'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunding'
  | 'refunded';

export type TradeType = 'pickup' | 'shipping';

export type RefundStatus = 'pending' | 'processing' | 'approved' | 'rejected';

export interface LogisticsUpdate {
  time: string;
  status: string;
  location?: string;
}

export interface OrderAddress {
  name: string;
  phone: string;
  detail: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  productId: string;
  productSnapshot: Product;
  price: number;
  originalPrice: number;
  status: OrderStatus;
  tradeType: TradeType;
  address?: OrderAddress;
  logistics?: {
    company: string;
    trackingNo: string;
    updates: LogisticsUpdate[];
  };
  pickupPoint?: {
    name: string;
    address: string;
    time?: string;
  };
  negotiatedPrice?: number;
  note?: string;
  createdAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  isReviewed?: boolean;
  reviewedAt?: string;
}

export interface Refund {
  id: string;
  orderId: string;
  userId: string;
  reason: string;
  description: string;
  evidence: string[];
  status: RefundStatus;
  sellerReply?: string;
  platformReply?: string;
  createdAt: string;
  handledAt?: string;
}

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending_payment: '待付款',
  pending_shipment: '待发货',
  shipped: '已发货',
  delivered: '待收货',
  completed: '已完成',
  cancelled: '已取消',
  refunding: '退款中',
  refunded: '已退款',
};

export const orderStatusColors: Record<OrderStatus, string> = {
  pending_payment: 'text-orange-600 bg-orange-50',
  pending_shipment: 'text-blue-600 bg-blue-50',
  shipped: 'text-purple-600 bg-purple-50',
  delivered: 'text-green-600 bg-green-50',
  completed: 'text-gray-600 bg-gray-50',
  cancelled: 'text-gray-400 bg-gray-50',
  refunding: 'text-red-600 bg-red-50',
  refunded: 'text-gray-600 bg-gray-50',
};

export const tradeTypeLabels: Record<TradeType, string> = {
  pickup: '自提',
  shipping: '邮寄',
};
