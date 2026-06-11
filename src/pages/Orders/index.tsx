import { useState } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  ChevronRight,
  AlertTriangle,
  Star,
  Shield,
} from 'lucide-react';
import { useOrderStore } from '@/stores/useOrderStore';
import { useProductStore } from '@/stores/useProductStore';
import { useUserStore } from '@/stores/useUserStore';
import {
  orderStatusLabels,
  orderStatusColors,
  tradeTypeLabels,
  type OrderStatus,
} from '@/types';
import { pickupPoints } from '@/data/reports';
import { formatPrice, formatDateTime, formatDate } from '@/utils/format';

export default function Orders() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { getOrders, getOrderById, payOrder, shipOrder, confirmReceive, cancelOrder, applyRefund } = useOrderStore();
  const { getProductById } = useProductStore();

  const statusParam = searchParams.get('status');
  const filterParam = searchParams.get('filter');
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all' | 'unreviewed'>(
    filterParam === 'unreviewed' ? 'unreviewed' : ((statusParam as OrderStatus | 'all') || 'all')
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'pay' | 'confirm' | 'cancel' | 'refund'>('pay');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');

  const productId = searchParams.get('productId');
  const isConfirmPage = searchParams.get('confirm') === '1' || !!productId;

  // 确认订单页（优先判断，避免与 id 参数冲突）
  if (isConfirmPage && productId) {
    const product = getProductById(productId);
    if (!product) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">商品不存在</p>
            <button onClick={() => navigate('/')} className="text-primary-500">
              返回首页
            </button>
          </div>
        </div>
      );
    }
    return (
      <ConfirmOrder
        product={product}
        onBack={() => navigate(-1)}
      />
    );
  }

  // 订单详情页
  if (id && id !== 'confirm') {
    const order = getOrderById(id);
    if (!order) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">订单不存在</p>
            <button onClick={() => navigate('/orders')} className="text-primary-500">
              返回订单列表
            </button>
          </div>
        </div>
      );
    }

    return <OrderDetail order={order} onBack={() => navigate('/orders')} />;
  }

  // 订单列表
  let orders = getOrders(activeTab === 'all' || activeTab === 'unreviewed' ? undefined : activeTab);
  if (activeTab === 'unreviewed') {
    orders = orders.filter((o: any) => o.status === 'completed' && !o.isReviewed);
  }

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'pending_payment', label: '待付款' },
    { key: 'pending_shipment', label: '待发货' },
    { key: 'shipped', label: '待收货' },
    { key: 'completed', label: '已完成' },
  ] as const;

  const handleTabChange = (tab: OrderStatus | 'all' | 'unreviewed') => {
    setActiveTab(tab);
    if (tab === 'all') {
      navigate('/orders', { replace: true });
    } else if (tab === 'unreviewed') {
      navigate('/orders?status=completed&filter=unreviewed', { replace: true });
    } else {
      navigate(`/orders?status=${tab}`, { replace: true });
    }
  };

  const handleAction = (orderId: string, type: 'pay' | 'confirm' | 'cancel' | 'refund') => {
    setSelectedOrderId(orderId);
    setActionType(type);
    setShowConfirmModal(true);
  };

  const handleReview = (orderId: string) => {
    setReviewOrderId(orderId);
    setReviewRating(5);
    setReviewContent('');
    setShowReviewModal(true);
  };

  const submitReview = () => {
    if (!reviewOrderId) return;
    if (!reviewContent.trim()) {
      alert('请填写评价内容');
      return;
    }
    
    const { addReview } = useUserStore.getState();
    const order = getOrderById(reviewOrderId);
    
    if (order) {
      addReview({
        targetUserId: order.sellerId,
        orderId: order.id,
        rating: reviewRating,
        content: reviewContent.trim(),
      });
    }
    
    setShowReviewModal(false);
    setReviewOrderId(null);
    alert('评价提交成功！');
  };

  const confirmAction = () => {
    if (!selectedOrderId) return;

    switch (actionType) {
      case 'pay':
        payOrder(selectedOrderId);
        break;
      case 'confirm':
        confirmReceive(selectedOrderId);
        break;
      case 'cancel':
        cancelOrder(selectedOrderId);
        break;
      case 'refund':
        applyRefund(selectedOrderId, '商品与描述不符', '申请退款');
        break;
    }

    setShowConfirmModal(false);
    setSelectedOrderId(null);
  };

  return (
    <div className="min-h-screen bg-warm-50 pb-20 md:pb-0">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg">
            {activeTab === 'unreviewed' ? '待评价订单' : '我的订单'}
          </h1>
          <div className="w-10" />
        </div>

        {/* Tab 切换 */}
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key as any)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium relative ${
                activeTab === tab.key
                  ? 'text-primary-500'
                  : 'text-gray-500'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 订单列表 */}
      <div className="container py-4">
        {orders.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">暂无订单</p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              去逛逛
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              >
                {/* 订单头部 */}
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <span className="text-sm text-gray-500">
                    订单号：{order.id}
                  </span>
                  <span className={`text-sm font-medium ${orderStatusColors[order.status]}`}>
                    {orderStatusLabels[order.status]}
                  </span>
                </div>

                {/* 商品信息 */}
                <div className="flex gap-3 p-4">
                  <img
                    src={order.productSnapshot.images[0]}
                    alt={order.productSnapshot.title}
                    className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm text-gray-800 line-clamp-2 mb-1">
                      {order.productSnapshot.title}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-primary-500 font-bold">
                        {formatPrice(order.price)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {tradeTypeLabels[order.tradeType]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 订单金额 */}
                <div className="px-4 py-2 text-right border-t">
                  <span className="text-sm text-gray-500">实付：</span>
                  <span className="text-lg font-bold text-primary-500">
                    {formatPrice(order.price)}
                  </span>
                </div>

                {/* 操作按钮 */}
                <div
                  className="flex items-center justify-end gap-2 px-4 py-3 border-t bg-gray-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  {order.status === 'pending_payment' && (
                    <>
                      <button
                        onClick={() => handleAction(order.id, 'cancel')}
                        className="px-4 py-1.5 border border-gray-300 text-gray-600 rounded-full text-sm"
                      >
                        取消订单
                      </button>
                      <button
                        onClick={() => handleAction(order.id, 'pay')}
                        className="px-4 py-1.5 bg-primary-500 text-white rounded-full text-sm"
                      >
                        立即付款
                      </button>
                    </>
                  )}

                  {order.status === 'pending_shipment' && (
                    <button className="px-4 py-1.5 border border-gray-300 text-gray-600 rounded-full text-sm">
                      提醒发货
                    </button>
                  )}

                  {order.status === 'shipped' && (
                    <>
                      <button
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="px-4 py-1.5 border border-gray-300 text-gray-600 rounded-full text-sm"
                      >
                        查看物流
                      </button>
                      <button
                        onClick={() => handleAction(order.id, 'confirm')}
                        className="px-4 py-1.5 bg-primary-500 text-white rounded-full text-sm"
                      >
                        确认收货
                      </button>
                    </>
                  )}

                  {order.status === 'completed' && (
                    <>
                      <button
                        onClick={() => handleAction(order.id, 'refund')}
                        className="px-4 py-1.5 border border-gray-300 text-gray-600 rounded-full text-sm"
                      >
                        申请退款
                      </button>
                      {order.isReviewed ? (
                        <span className="px-4 py-1.5 text-gray-400 text-sm">
                          已评价
                        </span>
                      ) : (
                        <button
                          onClick={() => handleReview(order.id)}
                          className="px-4 py-1.5 bg-secondary-500 text-white rounded-full text-sm"
                        >
                          去评价
                        </button>
                      )}
                    </>
                  )}

                  {(order.status === 'refunding' || order.status === 'refunded') && (
                    <button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="px-4 py-1.5 border border-gray-300 text-gray-600 rounded-full text-sm"
                    >
                      退款详情
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 确认弹窗 */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowConfirmModal(false)}
          />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm animate-slide-up">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {actionType === 'pay' && '确认付款'}
              {actionType === 'confirm' && '确认收货'}
              {actionType === 'cancel' && '取消订单'}
              {actionType === 'refund' && '申请退款'}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {actionType === 'pay' && '确认支付此订单吗？'}
              {actionType === 'confirm' && '确认已收到商品？'}
              {actionType === 'cancel' && '确定要取消此订单吗？'}
              {actionType === 'refund' && '确定要申请退款吗？'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-full font-medium"
              >
                再想想
              </button>
              <button
                onClick={confirmAction}
                className="flex-1 py-3 bg-primary-500 text-white rounded-full font-medium"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 评价弹窗 */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowReviewModal(false)}
          />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm animate-slide-up">
            <h3 className="text-lg font-bold text-gray-800 mb-4">发表评价</h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">评分</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= reviewRating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">评价内容</p>
              <textarea
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                placeholder="分享您的交易体验..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl resize-none focus:border-primary-400 focus:outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-full font-medium"
              >
                取消
              </button>
              <button
                onClick={submitReview}
                className="flex-1 py-3 bg-primary-500 text-white rounded-full font-medium"
              >
                提交评价
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 订单详情组件
function OrderDetail({ order, onBack }: { order: any; onBack: () => void }) {
  const navigate = useNavigate();

  const timeline = [
    { key: 'created', label: '下单成功', time: order.createdAt, icon: Clock, done: true },
    { key: 'paid', label: '付款成功', time: order.paidAt, icon: CheckCircle, done: !!order.paidAt, status: '待付款' },
    { key: 'shipped', label: '卖家发货', time: order.shippedAt, icon: Package, done: !!order.shippedAt, status: '待发货' },
    { key: 'delivered', label: '确认收货', time: order.deliveredAt || order.completedAt, icon: MapPin, done: order.status === 'completed' || order.status === 'delivered', status: '待收货' },
    { key: 'reviewed', label: '完成评价', time: order.reviewedAt, icon: Star, done: !!order.isReviewed, status: '待评价' },
  ];

  return (
    <div className="min-h-screen bg-warm-50 pb-20">
      {/* 顶部 */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg">订单详情</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* 订单状态 */}
      <div className="bg-gradient-to-r from-primary-500 to-orange-400 text-white">
        <div className="container py-6">
          <div className="flex items-center gap-3 mb-2">
            {order.status === 'completed' || order.status === 'delivered' ? (
              <CheckCircle className="w-8 h-8" />
            ) : order.status === 'cancelled' ? (
              <XCircle className="w-8 h-8" />
            ) : order.status === 'refunding' || order.status === 'refunded' ? (
              <AlertTriangle className="w-8 h-8" />
            ) : (
              <Clock className="w-8 h-8" />
            )}
            <div>
              <h2 className="text-xl font-bold">
                {orderStatusLabels[order.status]}
              </h2>
              <p className="text-sm text-white/80">
                {order.status === 'pending_payment' && '请尽快完成付款'}
                {order.status === 'pending_shipment' && '卖家正在准备发货'}
                {order.status === 'shipped' && '商品正在运输途中'}
                {order.status === 'delivered' && '请确认收货'}
                {order.status === 'completed' && '交易已完成'}
                {order.status === 'cancelled' && '订单已取消'}
                {order.status === 'refunding' && '退款处理中'}
                {order.status === 'refunded' && '退款已完成'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container -mt-2">
        {/* 交易时间线 */}
        <div className="bg-white rounded-2xl p-4 mb-4">
          <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-500" />
            交易进度
          </h3>
          <div className="relative pl-2 space-y-4">
            {timeline.map((item, index) => {
              const Icon = item.icon;
              const isLast = index === timeline.length - 1;
              const isCurrent = item.done && (index === timeline.length - 1 || !timeline[index + 1].done);
              return (
                <div key={item.key} className="relative flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCurrent
                          ? 'bg-primary-100'
                          : item.done
                          ? 'bg-gray-100'
                          : 'bg-gray-50'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          isCurrent
                            ? 'text-primary-500'
                            : item.done
                            ? 'text-gray-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </div>
                    {!isLast && (
                      <div
                        className={`w-0.5 flex-1 my-1 ${
                          item.done ? 'bg-primary-200' : 'bg-gray-100'
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <p
                      className={`font-medium ${
                        isCurrent
                          ? 'text-gray-800'
                          : item.done
                          ? 'text-gray-500'
                          : 'text-gray-300'
                      }`}
                    >
                      {item.done ? item.label : item.status || '待进行'}
                    </p>
                    {item.time && item.done ? (
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDateTime(item.time)}
                      </p>
                    ) : (
                      !item.done && (
                        <p className="text-xs text-gray-300 mt-1">待进行</p>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 物流信息 */}
        {order.logistics && (
          <div className="bg-white rounded-2xl p-4 mb-4">
            <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary-500" />
              物流信息
            </h3>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">
                {order.logistics.company}
              </span>
              <span className="text-sm text-gray-500">
                运单号：{order.logistics.trackingNo}
              </span>
            </div>

            {/* 物流时间轴 */}
            <div className="relative pl-4 space-y-4">
              {order.logistics.updates.map((update: any, index: number) => (
                <div key={index} className="relative">
                  <div
                    className={`absolute -left-4 top-1 w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-primary-500' : 'bg-gray-300'
                    }`}
                  />
                  <div className="ml-2">
                    <p className={`text-sm ${index === 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                      {update.status}
                    </p>
                    {update.location && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {update.location}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{update.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 自提信息 */}
        {order.pickupPoint && (
          <div className="bg-white rounded-2xl p-4 mb-4">
            <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-500" />
              自提信息
            </h3>
            <div className="bg-green-50 rounded-xl p-3">
              <p className="font-medium text-gray-800">{order.pickupPoint.name}</p>
              <p className="text-sm text-gray-600 mt-1">
                {order.pickupPoint.address}
              </p>
              {order.pickupPoint.time && (
                <p className="text-sm text-green-600 mt-2">
                  约定时间：{order.pickupPoint.time}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 商品信息 */}
        <div className="bg-white rounded-2xl p-4 mb-4">
          <h3 className="font-medium text-gray-800 mb-3">商品信息</h3>
          <Link
            to={`/product/${order.productId}`}
            className="flex gap-3"
          >
            <img
              src={order.productSnapshot.images[0]}
              alt={order.productSnapshot.title}
              className="w-20 h-20 rounded-lg object-cover bg-gray-100"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm text-gray-800 line-clamp-2">
                {order.productSnapshot.title}
              </h4>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {tradeTypeLabels[order.tradeType]}
                </span>
              </div>
              <p className="text-primary-500 font-bold mt-2">
                {formatPrice(order.price)}
              </p>
            </div>
          </Link>
        </div>

        {/* 收货地址 */}
        {order.address && (
          <div className="bg-white rounded-2xl p-4 mb-4">
            <h3 className="font-medium text-gray-800 mb-3">收货地址</h3>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-800">
                  {order.address.name} {order.address.phone}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {order.address.detail}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 订单信息 */}
        <div className="bg-white rounded-2xl p-4 mb-4">
          <h3 className="font-medium text-gray-800 mb-3">订单信息</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">订单编号</span>
              <span className="text-gray-700">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">创建时间</span>
              <span className="text-gray-700">
                {formatDateTime(order.createdAt)}
              </span>
            </div>
            {order.paidAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">付款时间</span>
                <span className="text-gray-700">
                  {formatDateTime(order.paidAt)}
                </span>
              </div>
            )}
            {order.completedAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">完成时间</span>
                <span className="text-gray-700">
                  {formatDateTime(order.completedAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 费用明细 */}
        <div className="bg-white rounded-2xl p-4 mb-4">
          <h3 className="font-medium text-gray-800 mb-3">费用明细</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">商品价格</span>
              <span className="text-gray-700">
                {formatPrice(order.productSnapshot.price)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">运费</span>
              <span className="text-gray-700">
                {order.tradeType === 'pickup' ? '免运费（自提）' : '¥0.00'}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-medium text-gray-800">实付款</span>
              <span className="text-lg font-bold text-primary-500">
                {formatPrice(order.price)}
              </span>
            </div>
          </div>
        </div>

        {/* 安全保障 */}
        <div className="bg-gradient-to-r from-secondary-50 to-accent-50 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-secondary-600" />
            <span className="font-medium text-secondary-700">交易保障</span>
          </div>
          <ul className="text-sm text-secondary-600 space-y-1">
            <li>· 平台担保交易，收货满意后打款</li>
            <li>· 卖家实名认证，交易更放心</li>
            <li>· 如有纠纷，平台介入仲裁</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// 确认订单组件
function ConfirmOrder({
  product,
  onBack,
}: {
  product: any;
  onBack: () => void;
}) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { createOrder } = useOrderStore();
  const { getUserById } = useUserStore();
  const [tradeType, setTradeType] = useState<'shipping' | 'pickup'>('shipping');
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<string | null>(null);
  const [address, setAddress] = useState({
    name: '张女士',
    phone: '135****7890',
    detail: '北京市朝阳区某某小区1号楼1单元101室',
  });
  const [note, setNote] = useState('');

  const seller = getUserById(product.sellerId);
  const negotiatedPrice = searchParams.get('price');
  const finalPrice = negotiatedPrice ? Number(negotiatedPrice) : product.price;

  const handleSubmit = () => {
    if (tradeType === 'pickup' && !selectedPickupPoint) {
      alert('请选择自提点');
      return;
    }

    const pickupPoint = selectedPickupPoint
      ? pickupPoints.find((p) => p.id === selectedPickupPoint)
      : undefined;

    const orderId = createOrder({
      productId: product.id,
      productSnapshot: product,
      sellerId: product.sellerId,
      sellerName: seller?.nickname || '卖家',
      sellerAvatar: seller?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=seller',
      price: finalPrice,
      originalPrice: product.originalPrice,
      tradeType,
      address: tradeType === 'shipping' ? address : undefined,
      pickupPoint: pickupPoint
        ? { name: pickupPoint.name, address: pickupPoint.address, time: pickupPoint.hours }
        : undefined,
      note,
    });

    navigate(`/orders/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-warm-50 pb-24">
      {/* 顶部 */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg">确认订单</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="container py-4 space-y-4">
        {/* 交易方式 */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-medium text-gray-800 mb-3">交易方式</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTradeType('shipping')}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                tradeType === 'shipping'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200'
              }`}
            >
              <Truck
                className={`w-8 h-8 mx-auto mb-2 ${
                  tradeType === 'shipping' ? 'text-primary-500' : 'text-gray-400'
                }`}
              />
              <p className="font-medium text-gray-800">邮寄</p>
              <p className="text-xs text-gray-500 mt-1">快递送货上门</p>
            </button>
            <button
              onClick={() => setTradeType('pickup')}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                tradeType === 'pickup'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200'
              }`}
            >
              <MapPin
                className={`w-8 h-8 mx-auto mb-2 ${
                  tradeType === 'pickup' ? 'text-primary-500' : 'text-gray-400'
                }`}
              />
              <p className="font-medium text-gray-800">自提</p>
              <p className="text-xs text-gray-500 mt-1">免运费，当面交易</p>
            </button>
          </div>
        </div>

        {/* 收货地址 */}
        {tradeType === 'shipping' && (
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-medium text-gray-800 mb-3">收货地址</h3>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-gray-800">
                  {address.name} {address.phone}
                </p>
                <p className="text-sm text-gray-600 mt-1">{address.detail}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        )}

        {/* 自提点 */}
        {tradeType === 'pickup' && (
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-medium text-gray-800 mb-3">选择自提点</h3>
            <div className="space-y-3">
              {pickupPoints.map((point) => (
                <button
                  key={point.id}
                  onClick={() => setSelectedPickupPoint(point.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                    selectedPickupPoint === point.id
                      ? 'bg-primary-50 border-2 border-primary-500'
                      : 'bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {selectedPickupPoint === point.id ? (
                      <CheckCircle className="w-5 h-5 text-primary-500" />
                    ) : (
                      <MapPin className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800">{point.name}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{point.address}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-green-600">距您 {point.distance}km</span>
                      <span className="text-xs text-gray-400">{point.hours}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 商品信息 */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-medium text-gray-800 mb-3">商品信息</h3>
          <div className="flex gap-3">
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-20 h-20 rounded-lg object-cover bg-gray-100"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm text-gray-800 line-clamp-2">
                {product.title}
              </h4>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-primary-500 font-bold">
                  {formatPrice(finalPrice)}
                </span>
                {negotiatedPrice && (
                  <span className="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded">
                    议价价
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 卖家信息 */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-medium text-gray-800 mb-3">卖家信息</h3>
          <div className="flex items-center gap-3">
            <img
              src={seller?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=seller'}
              alt="卖家头像"
              className="w-10 h-10 rounded-full bg-gray-200"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-800">{seller?.nickname || '卖家'}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs text-gray-500">
                  信用分 {seller?.creditScore || 0}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                const chatId = searchParams.get('chatId');
                if (chatId) {
                  navigate(`/chat/${chatId}`);
                }
              }}
              className="text-sm text-primary-500"
            >
              联系卖家
            </button>
          </div>
        </div>

        {/* 订单备注 */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-medium text-gray-800 mb-3">订单备注</h3>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="选填，有什么想跟卖家说的"
            className="input-field"
          />
        </div>

        {/* 费用明细 */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-medium text-gray-800 mb-3">费用明细</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">商品价格</span>
              <span className="text-gray-700">{formatPrice(finalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">运费</span>
              <span className="text-gray-700">
                {tradeType === 'pickup' ? '免运费' : '¥0.00'}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-medium text-gray-800">实付款</span>
              <span className="text-lg font-bold text-primary-500">
                {formatPrice(finalPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 底部提交 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 safe-bottom">
        <div className="container flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-500">合计：</span>
            <span className="text-xl font-bold text-primary-500">
              {formatPrice(finalPrice)}
            </span>
          </div>
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-gradient-to-r from-primary-500 to-orange-400 text-white rounded-full font-bold shadow-lg"
          >
            提交订单
          </button>
        </div>
      </div>
    </div>
  );
}
