import { create } from 'zustand';
import type { Order, OrderStatus, Refund, RefundStatus, TradeType } from '@/types';
import { mockOrders, mockRefunds } from '@/data/orders';
import { getStorageItem, setStorageItem } from '@/utils/storage';
import { generateId } from '@/utils/format';

interface OrderState {
  orders: Order[];
  refunds: Refund[];
  getOrders: (status?: OrderStatus, role?: 'buyer' | 'seller') => Order[];
  getOrderById: (id: string) => Order | undefined;
  createOrder: (params: {
    productId: string;
    productSnapshot: any;
    sellerId: string;
    sellerName: string;
    sellerAvatar: string;
    price: number;
    originalPrice: number;
    tradeType: TradeType;
    address?: { name: string; phone: string; detail: string };
    pickupPoint?: { name: string; address: string; time?: string };
  }) => string;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  payOrder: (orderId: string) => void;
  shipOrder: (orderId: string, logisticsCompany: string, trackingNo: string) => void;
  confirmReceive: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;
  applyRefund: (orderId: string, reason: string, description: string) => void;
  getRefunds: () => Refund[];
  getRefundById: (id: string) => Refund | undefined;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: getStorageItem('orders', mockOrders),
  refunds: getStorageItem('refunds', mockRefunds),

  getOrders: (status, role) => {
    const currentUserId = 'user-current';
    let orders = [...get().orders];

    if (role === 'buyer') {
      orders = orders.filter((o) => o.buyerId === currentUserId);
    } else if (role === 'seller') {
      orders = orders.filter((o) => o.sellerId === currentUserId);
    }

    if (status) {
      orders = orders.filter((o) => o.status === status);
    }

    return orders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getOrderById: (id) => {
    return get().orders.find((o) => o.id === id);
  },

  createOrder: (params) => {
    const currentUserId = 'user-current';
    const orderId = 'order-' + Date.now();

    const newOrder: Order = {
      id: orderId,
      buyerId: currentUserId,
      buyerName: '我是宝妈',
      buyerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
      sellerId: params.sellerId,
      sellerName: params.sellerName,
      sellerAvatar: params.sellerAvatar,
      productId: params.productId,
      productSnapshot: params.productSnapshot,
      price: params.price,
      originalPrice: params.originalPrice,
      status: 'pending_payment',
      tradeType: params.tradeType,
      address: params.address,
      pickupPoint: params.pickupPoint,
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      const orders = [newOrder, ...state.orders];
      setStorageItem('orders', orders);
      return { orders };
    });

    return orderId;
  },

  updateOrderStatus: (orderId, status) => {
    set((state) => {
      const orders = state.orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      );
      setStorageItem('orders', orders);
      return { orders };
    });
  },

  payOrder: (orderId) => {
    set((state) => {
      const orders = state.orders.map((o) =>
        o.id === orderId
          ? { ...o, status: 'pending_shipment' as OrderStatus, paidAt: new Date().toISOString() }
          : o
      );
      setStorageItem('orders', orders);
      return { orders };
    });
  },

  shipOrder: (orderId, logisticsCompany, trackingNo) => {
    set((state) => {
      const orders = state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'shipped' as OrderStatus,
              shippedAt: new Date().toISOString(),
              logistics: {
                company: logisticsCompany,
                trackingNo,
                updates: [
                  { time: new Date().toLocaleString('zh-CN'), status: '快件已发出', location: '发货地' },
                ],
              },
            }
          : o
      );
      setStorageItem('orders', orders);
      return { orders };
    });
  },

  confirmReceive: (orderId) => {
    set((state) => {
      const orders = state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'completed' as OrderStatus,
              deliveredAt: new Date().toISOString(),
              completedAt: new Date().toISOString(),
            }
          : o
      );
      setStorageItem('orders', orders);
      return { orders };
    });
  },

  cancelOrder: (orderId) => {
    set((state) => {
      const orders = state.orders.map((o) =>
        o.id === orderId
          ? { ...o, status: 'cancelled' as OrderStatus, cancelledAt: new Date().toISOString() }
          : o
      );
      setStorageItem('orders', orders);
      return { orders };
    });
  },

  applyRefund: (orderId, reason, description) => {
    const currentUserId = 'user-current';
    const refundId = 'refund-' + Date.now();

    const newRefund: Refund = {
      id: refundId,
      orderId,
      userId: currentUserId,
      reason,
      description,
      evidence: [],
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      const refunds = [newRefund, ...state.refunds];
      const orders = state.orders.map((o) =>
        o.id === orderId ? { ...o, status: 'refunding' as OrderStatus } : o
      );
      setStorageItem('refunds', refunds);
      setStorageItem('orders', orders);
      return { refunds, orders };
    });
  },

  getRefunds: () => {
    return [...get().refunds].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getRefundById: (id) => {
    return get().refunds.find((r) => r.id === id);
  },
}));
