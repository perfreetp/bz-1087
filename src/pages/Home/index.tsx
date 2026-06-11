import { Link, useNavigate } from 'react-router-dom';
import {
  Blocks,
  Heart,
  Brain,
  Gamepad2,
  Baby,
  Trees,
  Music,
  BookOpen,
  Palette,
  Monitor,
  ChevronRight,
  Sparkles,
  MapPin,
  Shield,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { useProductStore } from '@/stores/useProductStore';
import ProductCard from '@/components/business/ProductCard';
import { categories } from '@/data/categories';
import { recallToys } from '@/types';

const iconMap: Record<string, any> = {
  Blocks,
  Heart,
  Brain,
  Gamepad2,
  Baby,
  Trees,
  Music,
  BookOpen,
  Palette,
  Monitor,
};

export default function Home() {
  const navigate = useNavigate();
  const { products } = useProductStore();
  
  const activeProducts = products.filter((p) => p.status === 'active');
  const newProducts = [...activeProducts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);
  const hotProducts = [...activeProducts]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 6);
  const nearProducts = [...activeProducts]
    .sort((a, b) => (a.distance || 999) - (b.distance || 999))
    .slice(0, 4);

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/search?category=${categoryId}`);
  };

  return (
    <div className="pb-4">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-primary-400 via-primary-500 to-orange-400 text-white">
        <div className="container py-6 md:py-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                让闲置玩具🎈
                <br />
                流动起来
              </h1>
              <p className="text-white/80 text-sm md:text-base mb-4">
                安全、放心、省钱的二手玩具交易平台
              </p>
              <button
                onClick={() => navigate('/search')}
                className="px-5 py-2.5 bg-white text-primary-600 rounded-full font-medium hover:bg-primary-50 transition-colors shadow-lg"
              >
                立即逛逛
              </button>
            </div>
            <div className="hidden md:block text-8xl animate-float">
              🧸
            </div>
          </div>
        </div>

        {/* 装饰波浪 */}
        <div className="h-8 bg-warm-50 rounded-t-[2rem] -mb-px" />
      </div>

      <div className="container">
        {/* 分类入口 */}
        <section className="py-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">🎯</span>
            热门分类
          </h2>
          <div className="grid grid-cols-5 gap-3">
            {categories.slice(0, 10).map((category) => {
              const Icon = iconMap[category.icon] || Blocks;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <span className="text-xs text-gray-600 truncate w-full text-center">
                    {category.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 安全专区 */}
        <section className="py-4">
          <div className="bg-gradient-to-r from-secondary-50 to-accent-50 rounded-2xl p-4 border border-secondary-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-secondary-600" />
                安全保障
              </h3>
              <Link to="/report" className="text-sm text-secondary-600 flex items-center gap-1">
                查看更多
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white rounded-xl p-3 shadow-sm">
                <div className="text-2xl mb-1">✨</div>
                <p className="text-xs text-gray-600">消毒认证</p>
              </div>
              <div className="bg-white rounded-xl p-3 shadow-sm">
                <div className="text-2xl mb-1">🔍</div>
                <p className="text-xs text-gray-600">安全检测</p>
              </div>
              <div className="bg-white rounded-xl p-3 shadow-sm">
                <div className="text-2xl mb-1">⭐</div>
                <p className="text-xs text-gray-600">信用评价</p>
              </div>
            </div>
          </div>
        </section>

        {/* 安全召回提示 */}
        {recallToys.length > 0 && (
          <section className="py-4">
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">⚠️</span>
                <h3 className="font-bold text-orange-700">安全召回提醒</h3>
              </div>
              <p className="text-sm text-orange-600 mb-2">
                近期发现 {recallToys[0].name} 存在安全隐患，请注意甄别！
              </p>
              <Link
                to="/report"
                className="text-sm text-orange-600 underline"
              >
                查看全部召回名单 →
              </Link>
            </div>
          </section>
        )}

        {/* 附近好物 */}
        <section className="py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-500" />
              附近好物
            </h2>
            <button
              onClick={() => navigate('/search?sort=distance')}
              className="text-sm text-gray-500 flex items-center gap-1"
            >
              查看更多
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {nearProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* 最新上架 */}
        <section className="py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent-500" />
              最新上架
            </h2>
            <button
              onClick={() => navigate('/search?sort=newest')}
              className="text-sm text-gray-500 flex items-center gap-1"
            >
              查看更多
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* 热门推荐 */}
        <section className="py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary-500" />
              热门推荐
            </h2>
            <button
              onClick={() => navigate('/search')}
              className="text-sm text-gray-500 flex items-center gap-1"
            >
              查看更多
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {hotProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* 面交点提示 */}
        <section className="py-4">
          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-4 border border-green-100">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 mb-1">附近面交点</h3>
                <p className="text-sm text-gray-600 mb-2">
                  已为您找到 4 个附近的安全面交点，交易更放心
                </p>
                <button className="text-sm text-green-600 font-medium">
                  查看面交点 →
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
