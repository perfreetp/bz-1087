import { create } from 'zustand';
import type { Product, FilterOptions, ProductCategory } from '@/types';
import { mockProducts } from '@/data/products';
import { categories } from '@/data/categories';
import { getStorageItem, setStorageItem } from '@/utils/storage';

interface ProductState {
  products: Product[];
  categories: ProductCategory[];
  filterOptions: FilterOptions;
  favorites: string[];
  setFilterOptions: (options: Partial<FilterOptions>) => void;
  getFilteredProducts: () => Product[];
  getProductById: (id: string) => Product | undefined;
  getProductsBySeller: (sellerId: string) => Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'favoriteCount' | 'status'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  incrementViewCount: (productId: string) => void;
  checkRecallRisk: (title: string, description: string) => boolean;
}

const RECALL_KEYWORDS = ['磁力珠', '磁珠', '巴克球', '水晶泥', '史莱姆', '弹射枪', '玩具枪'];

export const useProductStore = create<ProductState>((set, get) => ({
  products: getStorageItem('products', mockProducts),
  categories,
  filterOptions: {
    keyword: '',
    sortBy: 'default',
  },
  favorites: getStorageItem('favorites', ['prod-1', 'prod-3', 'prod-5']),

  setFilterOptions: (options) => {
    set((state) => ({
      filterOptions: { ...state.filterOptions, ...options },
    }));
  },

  getFilteredProducts: () => {
    const { products, filterOptions } = get();
    let filtered = [...products].filter((p) => p.status === 'active');

    if (filterOptions.keyword) {
      const keyword = filterOptions.keyword.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(keyword) ||
          p.description.toLowerCase().includes(keyword)
      );
    }

    if (filterOptions.categoryId) {
      filtered = filtered.filter((p) => p.categoryId === filterOptions.categoryId);
    }

    if (filterOptions.ageRange) {
      filtered = filtered.filter((p) => p.ageRange === filterOptions.ageRange);
    }

    if (filterOptions.condition) {
      filtered = filtered.filter((p) => p.condition === filterOptions.condition);
    }

    if (filterOptions.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price >= filterOptions.minPrice!);
    }

    if (filterOptions.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price <= filterOptions.maxPrice!);
    }

    if (filterOptions.maxDistance !== undefined) {
      filtered = filtered.filter((p) => (p.distance || 999) <= filterOptions.maxDistance!);
    }

    switch (filterOptions.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'distance':
        filtered.sort((a, b) => (a.distance || 999) - (b.distance || 999));
        break;
      default:
        break;
    }

    return filtered;
  },

  getProductById: (id) => {
    return get().products.find((p) => p.id === id);
  },

  getProductsBySeller: (sellerId) => {
    return get().products.filter((p) => p.sellerId === sellerId);
  },

  addProduct: (product) => {
    const newProduct: Product = {
      ...product,
      id: 'prod-' + Date.now(),
      status: 'active',
      viewCount: 0,
      favoriteCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => {
      const products = [newProduct, ...state.products];
      setStorageItem('products', products);
      return { products };
    });
  },

  updateProduct: (id, updates) => {
    set((state) => {
      const products = state.products.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      );
      setStorageItem('products', products);
      return { products };
    });
  },

  deleteProduct: (id) => {
    set((state) => {
      const products = state.products.filter((p) => p.id !== id);
      setStorageItem('products', products);
      return { products };
    });
  },

  toggleFavorite: (productId) => {
    set((state) => {
      const favorites = state.favorites.includes(productId)
        ? state.favorites.filter((id) => id !== productId)
        : [...state.favorites, productId];
      setStorageItem('favorites', favorites);
      
      const products = state.products.map((p) =>
        p.id === productId
          ? { ...p, favoriteCount: p.favoriteCount + (state.favorites.includes(productId) ? -1 : 1) }
          : p
      );
      setStorageItem('products', products);
      
      return { favorites, products };
    });
  },

  isFavorite: (productId) => {
    return get().favorites.includes(productId);
  },

  incrementViewCount: (productId) => {
    set((state) => {
      const products = state.products.map((p) =>
        p.id === productId ? { ...p, viewCount: p.viewCount + 1 } : p
      );
      return { products };
    });
  },

  checkRecallRisk: (title, description) => {
    const text = (title + ' ' + description).toLowerCase();
    return RECALL_KEYWORDS.some((keyword) => text.includes(keyword));
  },
}));
