import { useState } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Heart,
  Package,
  Star,
  Clock,
  Shield,
  MapPin,
  ListChecks,
  Gift,
  MessageSquare,
  HelpCircle,
  Plus,
  X,
  Trash2,
  Edit2,
  TrendingUp,
  User as UserIcon,
  Bell,
} from 'lucide-react';
import { useUserStore } from '@/stores/useUserStore';
import { useProductStore } from '@/stores/useProductStore';
import { useOrderStore } from '@/stores/useOrderStore';
import ProductCard from '@/components/business/ProductCard';
import { getCreditColor, ageRanges, type WishlistItem } from '@/types';
import { formatPrice } from '@/utils/format';

export default function Profile() {
  const navigate = useNavigate();
  const { section } = useParams<{ section?: string }>();
  const [searchParams] = useSearchParams();

  const { currentUser, getWishlist, addWishlistItem, removeWishlistItem } = useUserStore();
  const { favorites, getProductById, getProductsBySeller } = useProductStore();
  const { getOrders } = useOrderStore();

  const favoriteProducts = favorites
    .map((id) => getProductById(id))
    .filter(Boolean) as any[];

  const myProducts = currentUser ? getProductsBySeller(currentUser.id) : [];
  const myOrders = currentUser ? getOrders(undefined, 'buyer') : [];
  const wishlist = getWishlist();

  // 子页面：我的收藏
  if (section === 'favorites') {
    return (
      <SubPageLayout title="我的收藏" onBack={() => navigate('/profile')}>
        {favoriteProducts.length === 0 ? (
          <EmptyState
            icon={<Heart className="w-16 h-16 text-gray-300" />}
            title="暂无收藏"
            description="快去收藏喜欢的玩具吧"
            actionText="去逛逛"
            onAction={() => navigate('/')}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {favoriteProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </SubPageLayout>
    );
  }

  // 子页面：我的发布
  if (section === 'listings') {
    return (
      <SubPageLayout
        title="我的发布"
        onBack={() => navigate('/profile')}
        rightAction={
          <button
            onClick={() => navigate('/publish')}
            className="text-primary-500 flex items-center gap-1 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            发布
          </button>
        }
      >
        {myProducts.length === 0 ? (
          <EmptyState
            icon={<Package className="w-16 h-16 text-gray-300" />}
            title="暂无发布"
            description="发布闲置玩具，让它们流动起来"
            actionText="立即发布"
            onAction={() => navigate('/publish')}
          />
        ) : (
          <div className="space-y-3">
            {myProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl p-3 flex gap-3"
              >
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm text-gray-800 line-clamp-2">
                    {product.title}
                  </h4>
                  <p className="text-primary-500 font-bold mt-1">
                    {formatPrice(product.price)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-400">
                      {product.viewCount} 浏览
                    </span>
                    <span className="text-xs text-gray-400">
                      {product.favoriteCount} 收藏
                    </span>
                  </div>
                </div>
                <div className="flex flex-col justify-between">
                  <span className="text-xs text-gray-500">
                    {product.status === 'active' ? '在售' : '已售'}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => navigate(`/publish/${product.id}`)}
                      className="p-1.5 text-gray-400 hover:text-primary-500"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SubPageLayout>
    );
  }

  // 子页面：玩具愿望单
  if (section === 'wishlist') {
    return <WishlistPage />;
  }

  // 主页面
  return (
    <div className="min-h-screen bg-warm-50 pb-20 md:pb-0">
      {/* 头部渐变背景 */}
      <div className="bg-gradient-to-br from-primary-400 via-primary-500 to-orange-400 text-white">
        <div className="container py-6">
          {/* 设置按钮 */}
          <div className="flex justify-end mb-2">
            <button className="p-2 text-white/80 hover:text-white">
              <Settings className="w-6 h-6" />
            </button>
          </div>

          {/* 用户信息 */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                alt="头像"
                className="w-20 h-20 rounded-full border-4 border-white/30 bg-white"
              />
              <button className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow">
                <Edit2 className="w-3.5 h-3.5 text-primary-500" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{currentUser?.nickname || '未登录'}</h2>
              <p className="text-white/80 text-sm mt-1">
                {currentUser?.location || '请设置所在地'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className={`px-2 py-0.5 rounded-full text-xs font-medium bg-white/20`}>
                  信用分 {currentUser?.creditScore || 0}
                </div>
                <div className="flex items-center gap-0.5 text-white/80 text-sm">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{currentUser?.reviewCount || 0} 评价</span>
                </div>
              </div>
            </div>
          </div>

          {/* 数据统计 */}
          <div className="grid grid-cols-4 gap-2 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{myProducts.length}</p>
              <p className="text-xs text-white/80">发布</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{favoriteProducts.length}</p>
              <p className="text-xs text-white/80">收藏</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{myOrders.length}</p>
              <p className="text-xs text-white/80">订单</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{wishlist.length}</p>
              <p className="text-xs text-white/80">愿望</p>
            </div>
          </div>
        </div>

        {/* 底部波浪装饰 */}
        <div className="h-6 bg-warm-50 rounded-t-[2rem] -mb-px" />
      </div>

      <div className="container -mt-2 space-y-4">
        {/* 我的订单 */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-500" />
              我的订单
            </h3>
            <button
              onClick={() => navigate('/orders')}
              className="text-sm text-gray-500 flex items-center gap-1"
            >
              全部订单
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <OrderIcon
              icon={<Clock className="w-6 h-6" />}
              label="待付款"
              count={myOrders.filter((o) => o.status === 'pending_payment').length}
              onClick={() => navigate('/orders?status=pending_payment')}
            />
            <OrderIcon
              icon={<Package className="w-6 h-6" />}
              label="待发货"
              count={myOrders.filter((o) => o.status === 'pending_shipment').length}
              onClick={() => navigate('/orders?status=pending_shipment')}
            />
            <OrderIcon
              icon={<MapPin className="w-6 h-6" />}
              label="待收货"
              count={myOrders.filter((o) => o.status === 'shipped').length}
              onClick={() => navigate('/orders?status=shipped')}
            />
            <OrderIcon
              icon={<Star className="w-6 h-6" />}
              label="待评价"
              count={myOrders.filter((o) => o.status === 'completed' && !o.isReviewed).length}
              onClick={() => navigate('/orders?status=completed')}
            />
          </div>
        </div>

        {/* 功能入口 */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-gray-800 mb-4">常用功能</h3>
          <div className="grid grid-cols-4 gap-4">
            <FeatureItem
              icon={<Heart className="w-6 h-6 text-red-400" />}
              label="我的收藏"
              onClick={() => navigate('/profile/favorites')}
            />
            <FeatureItem
              icon={<ListChecks className="w-6 h-6 text-blue-400" />}
              label="我的发布"
              onClick={() => navigate('/profile/listings')}
            />
            <FeatureItem
              icon={<Gift className="w-6 h-6 text-yellow-400" />}
              label="玩具愿望单"
              onClick={() => navigate('/profile/wishlist')}
              badge={wishlist.length > 0 ? wishlist.length.toString() : undefined}
            />
            <FeatureItem
              icon={<MessageSquare className="w-6 h-6 text-green-400" />}
              label="消息中心"
              onClick={() => navigate('/chat')}
            />
            <FeatureItem
              icon={<Shield className="w-6 h-6 text-purple-400" />}
              label="举报仲裁"
              onClick={() => navigate('/report')}
            />
            <FeatureItem
              icon={<MapPin className="w-6 h-6 text-teal-400" />}
              label="面交点"
              onClick={() => {}}
            />
            <FeatureItem
              icon={<TrendingUp className="w-6 h-6 text-orange-400" />}
              label="信用评价"
              onClick={() => {}}
            />
            <FeatureItem
              icon={<HelpCircle className="w-6 h-6 text-gray-400" />}
              label="帮助中心"
              onClick={() => {}}
            />
          </div>
        </div>

        {/* 安全信用 */}
        <div className="bg-gradient-to-r from-secondary-50 to-accent-50 rounded-2xl p-4 border border-secondary-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Shield className="w-5 h-5 text-secondary-600" />
              我的信用
            </h3>
            <span className={`text-sm font-medium ${getCreditColor(currentUser?.creditScore || 0)} px-2 py-0.5 rounded-full`}>
              {currentUser?.creditScore || 0} 分
            </span>
          </div>
          <div className="bg-white rounded-xl p-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-500">信用等级</span>
              <span className="text-gray-700 font-medium">良好</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-secondary-400 to-accent-400 rounded-full transition-all"
                style={{ width: `${currentUser?.creditScore || 0}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              继续保持良好交易记录，提升信用分
            </p>
          </div>
        </div>

        {/* 安全提示 */}
        <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 mb-8">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-orange-500 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-orange-700 mb-1">交易安全提醒</h4>
              <p className="text-sm text-orange-600">
                建议选择平台担保交易，避免私下转账。收到商品请仔细检查后再确认收货。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 子页面布局组件
function SubPageLayout({
  title,
  children,
  onBack,
  rightAction,
}: {
  title: string;
  children: React.ReactNode;
  onBack: () => void;
  rightAction?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-warm-50 pb-20">
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg">{title}</h1>
          <div className="w-16">{rightAction}</div>
        </div>
      </div>
      <div className="container py-4">{children}</div>
    </div>
  );
}

// 空状态组件
function EmptyState({
  icon,
  title,
  description,
  actionText,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}) {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-4">{icon}</div>
      <p className="text-gray-700 font-medium mb-1">{title}</p>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 bg-primary-500 text-white rounded-full text-sm font-medium"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

// 订单图标组件
function OrderIcon({
  icon,
  label,
  count,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 py-2">
      <div className="relative text-gray-500">
        {icon}
        {count > 0 && (
          <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </div>
      <span className="text-xs text-gray-600">{label}</span>
    </button>
  );
}

// 功能入口组件
function FeatureItem({
  icon,
  label,
  onClick,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 py-2 relative"
    >
      <div className="relative">
        {icon}
        {badge && (
          <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
      <span className="text-xs text-gray-600">{label}</span>
    </button>
  );
}

// 愿望单页面
function WishlistPage() {
  const navigate = useNavigate();
  const { getWishlist, addWishlistItem, removeWishlistItem } = useUserStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    ageRange: '',
    budgetMax: '',
    notes: '',
  });

  const wishlist = getWishlist();

  const handleAdd = () => {
    if (!formData.productName.trim()) {
      alert('请输入玩具名称');
      return;
    }
    addWishlistItem({
      productName: formData.productName,
      category: formData.category,
      ageRange: formData.ageRange,
      budgetMax: Number(formData.budgetMax) || 0,
      notes: formData.notes,
    });
    setShowAddModal(false);
    setFormData({
      productName: '',
      category: '',
      ageRange: '',
      budgetMax: '',
      notes: '',
    });
  };

  return (
    <SubPageLayout
      title="玩具愿望单"
      onBack={() => navigate('/profile')}
      rightAction={
        <button
          onClick={() => setShowAddModal(true)}
          className="text-primary-500 flex items-center gap-1 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          添加
        </button>
      }
    >
      {wishlist.length === 0 ? (
        <EmptyState
          icon={<Gift className="w-16 h-16 text-gray-300" />}
          title="愿望单是空的"
          description="添加想要的玩具，有好货会提醒你"
          actionText="添加愿望"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="space-y-3">
          {wishlist.map((item) => (
            <WishlistCard
              key={item.id}
              item={item}
              onRemove={() => removeWishlistItem(item.id)}
            />
          ))}
        </div>
      )}

      {/* 添加弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">添加愿望</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">
                  玩具名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) =>
                    setFormData({ ...formData, productName: e.target.value })
                  }
                  placeholder="想要什么玩具？"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  适用年龄
                </label>
                <div className="flex flex-wrap gap-2">
                  {ageRanges.map((age) => (
                    <button
                      key={age.id}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          ageRange: formData.ageRange === age.id ? '' : age.id,
                        })
                      }
                      className={`px-3 py-1.5 rounded-full text-sm ${
                        formData.ageRange === age.id
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {age.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1.5">
                  预算上限
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    ¥
                  </span>
                  <input
                    type="number"
                    value={formData.budgetMax}
                    onChange={(e) =>
                      setFormData({ ...formData, budgetMax: e.target.value })
                    }
                    placeholder="选填"
                    className="input-field pl-8"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1.5">
                  备注
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="其他要求或说明"
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleAdd}
              className="w-full mt-6 py-3 bg-primary-500 text-white rounded-full font-medium"
            >
              添加到愿望单
            </button>
          </div>
        </div>
      )}
    </SubPageLayout>
  );
}

// 愿望单卡片
function WishlistCard({
  item,
  onRemove,
}: {
  item: WishlistItem;
  onRemove: () => void;
}) {
  const ageInfo = ageRanges.find((a) => a.id === item.ageRange);

  return (
    <div className="bg-white rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-800">{item.productName}</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {ageInfo && (
              <span className={`tag text-xs ${ageInfo.color}`}>
                {ageInfo.label}
              </span>
            )}
            {item.budgetMax > 0 && (
              <span className="tag bg-orange-50 text-orange-600 text-xs">
                预算 ¥{item.budgetMax}
              </span>
            )}
            {item.matchedProducts.length > 0 && (
              <span className="tag bg-green-50 text-green-600 text-xs">
                {item.matchedProducts.length} 件匹配
              </span>
            )}
          </div>
          {item.notes && (
            <p className="text-sm text-gray-500 mt-2">{item.notes}</p>
          )}
        </div>
        <button
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-500"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
