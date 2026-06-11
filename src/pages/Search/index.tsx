import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  MapPin,
  Filter,
  Grid,
  List,
} from 'lucide-react';
import { useProductStore } from '@/stores/useProductStore';
import ProductCard from '@/components/business/ProductCard';
import {
  conditionLabels,
  ageRanges,
  type ProductCondition,
} from '@/types';
import { categories } from '@/data/categories';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getFilteredProducts, setFilterOptions, filterOptions } = useProductStore();

  const [showFilter, setShowFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [maxDistance, setMaxDistance] = useState<number | undefined>();

  const keyword = searchParams.get('keyword') || '';
  const categoryParam = searchParams.get('category') || '';
  const sortParam = searchParams.get('sort') || 'default';

  useEffect(() => {
    setFilterOptions({
      keyword: keyword || undefined,
      categoryId: categoryParam || undefined,
      sortBy: sortParam as any,
    });
  }, [keyword, categoryParam, sortParam, setFilterOptions]);

  const filteredProducts = useMemo(() => {
    let products = getFilteredProducts();
    
    if (filterOptions.minPrice !== undefined) {
      products = products.filter(p => p.price >= filterOptions.minPrice!);
    }
    if (filterOptions.maxPrice !== undefined) {
      products = products.filter(p => p.price <= filterOptions.maxPrice!);
    }
    if (maxDistance !== undefined) {
      products = products.filter(p => (p.distance || 999) <= maxDistance);
    }
    
    return products;
  }, [getFilteredProducts, filterOptions.minPrice, filterOptions.maxPrice, maxDistance]);

  const handleCategoryClick = (categoryId: string) => {
    const params = new URLSearchParams(searchParams);
    if (params.get('category') === categoryId) {
      params.delete('category');
    } else {
      params.set('category', categoryId);
    }
    setSearchParams(params);
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', sort);
    setSearchParams(params);
  };

  const handleAgeRangeChange = (ageRange: string) => {
    setFilterOptions({ ageRange: filterOptions.ageRange === ageRange ? undefined : ageRange });
  };

  const handleConditionChange = (condition: ProductCondition) => {
    setFilterOptions({ condition: filterOptions.condition === condition ? undefined : condition });
  };

  const handleApplyPrice = () => {
    setFilterOptions({
      minPrice: priceRange.min ? Number(priceRange.min) : undefined,
      maxPrice: priceRange.max ? Number(priceRange.max) : undefined,
    });
  };

  const handleResetFilters = () => {
    setPriceRange({ min: '', max: '' });
    setMaxDistance(undefined);
    setFilterOptions({
      keyword: keyword || undefined,
      categoryId: categoryParam || undefined,
      ageRange: undefined,
      condition: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: sortParam as any,
    });
  };

  const sortOptions = [
    { value: 'default', label: '综合' },
    { value: 'newest', label: '最新' },
    { value: 'price_asc', label: '价格↑' },
    { value: 'price_desc', label: '价格↓' },
    { value: 'distance', label: '距离' },
  ];

  const distanceOptions = [1, 3, 5, 10, 20];

  return (
    <div className="min-h-screen bg-warm-50">
      {/* 顶部筛选栏 */}
      <div className="sticky top-16 z-40 bg-white border-b md:top-0 md:z-30">
        <div className="container py-3">
          {/* 分类标签 - 横向滚动 */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-3">
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.delete('category');
                setSearchParams(params);
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !categoryParam
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  categoryParam === cat.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* 筛选和排序栏 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm ${
                  showFilter ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Filter className="w-4 h-4" />
                筛选
              </button>
              
              <div className="relative">
                <select
                  value={sortParam}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none bg-gray-100 text-gray-600 text-sm pl-3 pr-8 py-2 rounded-lg focus:outline-none"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span>{filteredProducts.length}件商品</span>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选面板 */}
      {showFilter && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowFilter(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-4/5 max-w-sm bg-white overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white z-10 p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg">筛选</h3>
              <button onClick={() => setShowFilter(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* 年龄段 */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">年龄段</h4>
                <div className="flex flex-wrap gap-2">
                  {ageRanges.map((age) => (
                    <button
                      key={age.id}
                      onClick={() => handleAgeRangeChange(age.id)}
                      className={`px-3 py-1.5 rounded-full text-sm ${
                        filterOptions.ageRange === age.id
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {age.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 成色 */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">成色</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(conditionLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => handleConditionChange(key as ProductCondition)}
                      className={`px-3 py-1.5 rounded-full text-sm ${
                        filterOptions.condition === key
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 价格区间 */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">价格区间</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="最低"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="最高"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <button
                  onClick={handleApplyPrice}
                  className="mt-2 w-full py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium"
                >
                  应用价格筛选
                </button>
              </div>

              {/* 距离 */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  距离范围
                </h4>
                <div className="flex flex-wrap gap-2">
                  {distanceOptions.map((dist) => (
                    <button
                      key={dist}
                      onClick={() => setMaxDistance(maxDistance === dist ? undefined : dist)}
                      className={`px-3 py-1.5 rounded-full text-sm ${
                        maxDistance === dist
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {dist}km以内
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white p-4 border-t">
              <div className="flex gap-3">
                <button
                  onClick={handleResetFilters}
                  className="flex-1 py-3 border border-gray-200 rounded-full text-gray-600 font-medium"
                >
                  重置
                </button>
                <button
                  onClick={() => setShowFilter(false)}
                  className="flex-1 py-3 bg-primary-500 text-white rounded-full font-medium"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 商品列表 */}
      <div className="container py-4">
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 mb-4">没有找到相关商品</p>
            <button
              onClick={handleResetFilters}
              className="text-primary-500 font-medium"
            >
              清除筛选条件
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
