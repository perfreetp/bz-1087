import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Heart,
  Share2,
  Shield,
  Sparkles,
  MapPin,
  MessageCircle,
  ShoppingBag,
  AlertTriangle,
  ChevronRight,
  Star,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  Flag,
} from 'lucide-react';
import { useProductStore } from '@/stores/useProductStore';
import { useUserStore } from '@/stores/useUserStore';
import { useChatStore } from '@/stores/useChatStore';
import {
  conditionLabels,
  conditionColors,
  ageRanges,
} from '@/types';
import { formatDistance } from '@/utils/format';
import { formatPrice, formatRelativeTime } from '@/utils/format';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProductById, isFavorite, toggleFavorite, incrementViewCount, checkRecallRisk } = useProductStore();
  const { getUserById, getReviewsByUser } = useUserStore();
  const { createChat } = useChatStore();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showNegotiateModal, setShowNegotiateModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [activeTab, setActiveTab] = useState<'desc' | 'seller' | 'reviews'>('desc');

  const product = getProductById(id || '');
  const seller = product ? getUserById(product.sellerId) : undefined;
  const sellerReviews = product ? getReviewsByUser(product.sellerId) : [];
  const favorite = product ? isFavorite(product.id) : false;

  const hasRecallRisk = product ? checkRecallRisk(product.title, product.description) : false;

  useEffect(() => {
    if (product) {
      incrementViewCount(product.id);
    }
  }, [product?.id, incrementViewCount]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-gray-500 mb-4">商品不存在或已下架</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const ageRangeInfo = ageRanges.find((a) => a.id === product.ageRange);

  const handleChat = () => {
    if (!seller) return;
    const chatId = createChat(
      product.id,
      product.sellerId,
      product.title,
      product.images[0],
      product.price,
      seller.nickname,
      seller.avatar
    );
    navigate(`/chat/${chatId}`);
  };

  const handleBuyNow = () => {
    navigate(`/orders/confirm?productId=${product.id}`);
  };

  const handleNegotiate = () => {
    setShowNegotiateModal(true);
  };

  const submitOffer = () => {
    const price = Number(offerPrice);
    if (!offerPrice || price <= 0 || isNaN(price)) {
      return;
    }
    if (!seller) return;
    
    const chatId = createChat(
      product.id,
      product.sellerId,
      product.title,
      product.images[0],
      product.price,
      seller.nickname,
      seller.avatar
    );
    
    const { sendOffer } = useChatStore.getState();
    sendOffer(chatId, price);
    
    setShowNegotiateModal(false);
    setOfferPrice('');
    navigate(`/chat/${chatId}`);
  };

  return (
    <div className="min-h-screen bg-warm-50 pb-20 md:pb-0">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-medium">商品详情</h1>
          <button
            onClick={() => {}}
            className="p-2 -mr-2 rounded-full hover:bg-gray-100"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 图片轮播 */}
      <div className="relative bg-gray-100">
        <div className="aspect-square overflow-hidden">
          <img
            src={product.images[currentImageIndex]}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        {product.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {product.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* 缩略图 */}
        {product.images.length > 1 && (
          <div className="absolute bottom-4 right-4 flex gap-1">
            {product.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-10 h-10 rounded-lg overflow-hidden border-2 ${
                  index === currentImageIndex
                    ? 'border-primary-500'
                    : 'border-transparent'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* 消毒认证徽章 */}
        {product.sterilized && (
          <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1.5 bg-secondary-500 text-white text-sm rounded-full shadow-lg">
            <Sparkles className="w-4 h-4" />
            <span>已消毒</span>
          </div>
        )}

        {/* 收藏按钮 */}
        <button
          onClick={() => toggleFavorite(product.id)}
          className={`absolute top-4 right-4 p-2.5 rounded-full shadow-lg transition-all md:hidden ${
            favorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600'
          }`}
        >
          <Heart className={`w-5 h-5 ${favorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* 安全召回提示 */}
      {(product.hasRecallRisk || hasRecallRisk) && (
        <div className="bg-red-50 border-b border-red-100">
          <div className="container py-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700">安全召回风险提示</p>
                <p className="text-xs text-red-600 mt-0.5">
                  该商品可能存在安全隐患，请谨慎购买。
                  {product.recallInfo && <span>{product.recallInfo}</span>}
                </p>
              </div>
              <Link to={`/report/submit?type=product&id=${product.id}`} className="text-xs text-red-600 underline">
                举报
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 商品信息 */}
      <div className="bg-white">
        <div className="container py-4">
          {/* 价格 */}
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-bold text-primary-500">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice > 0 && (
              <span className="text-gray-400 line-through mb-1">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="ml-auto text-xs text-gray-400">
              {formatRelativeTime(product.createdAt)}
            </span>
          </div>

          {/* 标题 */}
          <h1 className="text-lg font-bold text-gray-800 mb-3">{product.title}</h1>

          {/* 标签 */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`tag ${conditionColors[product.condition]}`}>
              {conditionLabels[product.condition]}
            </span>
            {ageRangeInfo && (
              <span className={`tag ${ageRangeInfo.color}`}>
                {ageRangeInfo.label}
              </span>
            )}
            <span className="tag bg-gray-100 text-gray-600">
              {product.categoryName}
            </span>
          </div>

          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{product.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-gray-400">👁</span>
              <span>{product.viewCount} 次浏览</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="bg-white mt-2 border-t">
        <div className="container">
          <div className="flex border-b">
            {[
              { key: 'desc', label: '商品详情' },
              { key: 'seller', label: '卖家信息' },
              { key: 'reviews', label: '评价' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 py-3 text-sm font-medium relative ${
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
      </div>

      {/* Tab 内容 */}
      <div className="bg-white">
        <div className="container py-4">
          {activeTab === 'desc' && (
            <div className="space-y-4">
              {/* 商品描述 */}
              <div>
                <h3 className="font-medium text-gray-800 mb-2">商品描述</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* 配件清单 */}
              {product.accessories.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary-500" />
                    配件清单
                  </h3>
                  <ul className="space-y-1">
                    {product.accessories.map((acc, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {acc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 瑕疵标注 */}
              {product.defects.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    瑕疵说明
                  </h3>
                  <ul className="space-y-1">
                    {product.defects.map((def, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <XCircle className="w-4 h-4 text-orange-400" />
                        {def}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 消毒说明 */}
              {product.sterilized && (
                <div className="bg-secondary-50 rounded-xl p-4">
                  <h3 className="font-medium text-secondary-700 mb-1 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    消毒说明
                  </h3>
                  <p className="text-sm text-secondary-600">
                    {product.sterilizationMethod}
                  </p>
                </div>
              )}

              {/* 举报按钮 */}
              <button
                onClick={() => navigate(`/report/submit?type=product&id=${product.id}`)}
                className="w-full py-3 text-gray-500 text-sm flex items-center justify-center gap-1"
              >
                <Flag className="w-4 h-4" />
                举报该商品
              </button>
            </div>
          )}

          {activeTab === 'seller' && seller && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={seller.avatar}
                  alt={seller.nickname}
                  className="w-14 h-14 rounded-full bg-gray-100"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{seller.nickname}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-700">
                        {seller.creditScore}分
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      在售{product.viewCount > 0 ? seller.totalSales : 0}件
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleChat}
                  className="px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-medium"
                >
                  联系卖家
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center py-4 border-y">
                <div>
                  <p className="text-xl font-bold text-gray-800">{seller.totalSales}</p>
                  <p className="text-xs text-gray-500">成功交易</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-800">{seller.reviewCount}</p>
                  <p className="text-xs text-gray-500">好评数</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-800">{seller.totalPurchases}</p>
                  <p className="text-xs text-gray-500">购买数</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-4">{seller.bio}</p>

              <button className="w-full mt-4 py-3 text-gray-500 text-sm flex items-center justify-center gap-2">
                查看Ta的所有商品
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              {sellerReviews.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="text-4xl mb-2">💬</div>
                  <p className="text-gray-500 text-sm">暂无评价</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sellerReviews.map((review) => (
                    <div key={review.id} className="pb-4 border-b last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={review.reviewerAvatar}
                          alt={review.reviewerName}
                          className="w-8 h-8 rounded-full bg-gray-100"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {review.reviewerName}
                          </p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatRelativeTime(review.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 ml-11">
                        {review.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 底部操作栏 - 移动端 */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t md:bottom-0 md:top-16 md:h-auto md:bg-transparent md:border-0 md:pointer-events-none">
        <div className="container md:pointer-events-auto">
          <div className="flex items-center gap-3 p-3 md:p-0 md:justify-end">
            <button
              onClick={() => toggleFavorite(product.id)}
              className={`hidden md:flex flex-col items-center gap-1 p-2 ${
                favorite ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              <Heart className={`w-6 h-6 ${favorite ? 'fill-current' : ''}`} />
              <span className="text-xs">收藏</span>
            </button>

            <button
              onClick={handleChat}
              className="hidden md:flex flex-col items-center gap-1 p-2 text-gray-500"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs">客服</span>
            </button>

            <button
              onClick={handleNegotiate}
              className="flex-1 md:flex-none md:w-auto md:px-6 py-3 border-2 border-primary-500 text-primary-500 rounded-full font-medium"
            >
              我要议价
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 md:flex-none md:w-auto md:px-8 py-3 bg-gradient-to-r from-primary-500 to-orange-400 text-white rounded-full font-medium shadow-lg"
            >
              立即购买
            </button>
          </div>
        </div>
      </div>

      {/* 议价弹窗 */}
      {showNegotiateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowNegotiateModal(false)}
          />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm animate-slide-up">
            <button
              onClick={() => setShowNegotiateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>

            <h3 className="text-lg font-bold text-gray-800 mb-4">发起议价</h3>

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">商品原价</p>
              <p className="text-2xl font-bold text-primary-500">
                {formatPrice(product.price)}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-2">
                您的出价
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400">
                  ¥
                </span>
                <input
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder="请输入您的出价"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:border-primary-400 focus:outline-none"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                建议出价在合理范围内，更容易被卖家接受
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowNegotiateModal(false)}
                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-full font-medium"
              >
                取消
              </button>
              <button
                onClick={submitOffer}
                className="flex-1 py-3 bg-primary-500 text-white rounded-full font-medium"
              >
                发送议价
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
