export interface User {
  id: string;
  nickname: string;
  avatar: string;
  phone: string;
  creditScore: number;
  location: string;
  bio: string;
  totalSales: number;
  totalPurchases: number;
  reviewCount: number;
  createdAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  revieweeId: string;
  productId: string;
  productTitle: string;
  rating: number;
  content: string;
  images: string[];
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productName: string;
  category: string;
  ageRange: string;
  budgetMax: number;
  notes: string;
  matchedProducts: string[];
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
}

export const creditLevelNames: Record<string, string> = {
  excellent: '信用极好',
  good: '信用良好',
  average: '信用一般',
  poor: '信用较差',
};

export function getCreditLevel(score: number): string {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'average';
  return 'poor';
}

export function getCreditColor(score: number): string {
  if (score >= 90) return 'text-green-600 bg-green-50';
  if (score >= 75) return 'text-blue-600 bg-blue-50';
  if (score >= 60) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
}
