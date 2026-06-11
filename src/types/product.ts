export type ProductCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';

export type ProductStatus = 'active' | 'sold' | 'offline' | 'reported';

export interface Product {
  id: string;
  sellerId: string;
  categoryId: string;
  categoryName: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  condition: ProductCondition;
  ageRange: string;
  images: string[];
  accessories: string[];
  defects: string[];
  sterilized: boolean;
  sterilizationMethod: string;
  hasRecallRisk: boolean;
  recallInfo?: string;
  status: ProductStatus;
  location: string;
  distance?: number;
  viewCount: number;
  favoriteCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  icon: string;
  parentId?: string;
  sort: number;
  color: string;
}

export interface FilterOptions {
  keyword?: string;
  categoryId?: string;
  ageRange?: string;
  condition?: ProductCondition;
  minPrice?: number;
  maxPrice?: number;
  maxDistance?: number;
  sortBy?: 'default' | 'newest' | 'price_asc' | 'price_desc' | 'distance';
}

export const conditionLabels: Record<ProductCondition, string> = {
  new: '全新',
  like_new: '几乎全新',
  good: '成色良好',
  fair: '有使用痕迹',
  poor: '成色较差',
};

export const conditionColors: Record<ProductCondition, string> = {
  new: 'bg-green-100 text-green-700',
  like_new: 'bg-blue-100 text-blue-700',
  good: 'bg-yellow-100 text-yellow-700',
  fair: 'bg-orange-100 text-orange-700',
  poor: 'bg-gray-100 text-gray-700',
};

export const ageRanges = [
  { id: '0-1', label: '0-1岁', color: 'bg-pink-100 text-pink-700' },
  { id: '1-3', label: '1-3岁', color: 'bg-orange-100 text-orange-700' },
  { id: '3-6', label: '3-6岁', color: 'bg-yellow-100 text-yellow-700' },
  { id: '6-9', label: '6-9岁', color: 'bg-green-100 text-green-700' },
  { id: '9-12', label: '9-12岁', color: 'bg-blue-100 text-blue-700' },
  { id: '12+', label: '12岁以上', color: 'bg-purple-100 text-purple-700' },
];
