import { create } from 'zustand';
import type { User, Review, WishlistItem } from '@/types';
import { mockUsers, currentUserId, mockReviews, mockWishlist } from '@/data/users';
import { getStorageItem, setStorageItem } from '@/utils/storage';
import { useOrderStore } from './useOrderStore';

interface UserState {
  currentUser: User | null;
  users: User[];
  reviews: Review[];
  wishlist: WishlistItem[];
  setCurrentUser: (user: User | null) => void;
  getUserById: (id: string) => User | undefined;
  getReviewsByUser: (userId: string) => Review[];
  getWishlist: () => WishlistItem[];
  addWishlistItem: (item: Omit<WishlistItem, 'id' | 'userId' | 'createdAt' | 'matchedProducts'>) => void;
  removeWishlistItem: (id: string) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  addReview: (params: {
    targetUserId: string;
    orderId: string;
    rating: number;
    content: string;
  }) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  currentUser: getStorageItem<User | null>('currentUser', mockUsers.find((u) => u.id === currentUserId) || null),
  users: getStorageItem('users', mockUsers),
  reviews: getStorageItem('reviews', mockReviews),
  wishlist: getStorageItem('wishlist', mockWishlist),

  setCurrentUser: (user) => {
    setStorageItem('currentUser', user);
    set({ currentUser: user });
  },

  getUserById: (id) => {
    return get().users.find((u) => u.id === id);
  },

  getReviewsByUser: (userId) => {
    return get().reviews.filter((r) => r.revieweeId === userId);
  },

  getWishlist: () => {
    return get().wishlist.filter((w) => w.userId === get().currentUser?.id);
  },

  addWishlistItem: (item) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    const newItem: WishlistItem = {
      ...item,
      id: 'wish-' + Date.now(),
      userId: currentUser.id,
      matchedProducts: [],
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      const wishlist = [newItem, ...state.wishlist];
      setStorageItem('wishlist', wishlist);
      return { wishlist };
    });
  },

  removeWishlistItem: (id) => {
    set((state) => {
      const wishlist = state.wishlist.filter((w) => w.id !== id);
      setStorageItem('wishlist', wishlist);
      return { wishlist };
    });
  },

  updateUserProfile: (updates) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...updates };
    set((state) => {
      const users = state.users.map((u) =>
        u.id === currentUser.id ? updatedUser : u
      );
      setStorageItem('currentUser', updatedUser);
      return { currentUser: updatedUser, users };
    });
  },

  addReview: (params) => {
    const currentUser = get().currentUser;
    const { getOrderById, reviewOrder } = useOrderStore.getState();
    const order = getOrderById(params.orderId);

    if (!currentUser || !order) return;

    const newReview: Review = {
      id: 'review-' + Date.now(),
      orderId: params.orderId,
      reviewerId: currentUser.id,
      reviewerName: currentUser.nickname,
      reviewerAvatar: currentUser.avatar,
      revieweeId: params.targetUserId,
      productId: order.productId,
      productTitle: order.productSnapshot.title,
      rating: params.rating,
      content: params.content,
      images: [],
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      const reviews = [newReview, ...state.reviews];
      
      const users = state.users.map((u) => {
        if (u.id === params.targetUserId) {
          const userReviews = reviews.filter((r) => r.revieweeId === u.id);
          return {
            ...u,
            reviewCount: u.reviewCount + 1,
            creditScore: Math.min(100, Math.round(u.creditScore + (params.rating >= 4 ? 1 : -1))),
          };
        }
        return u;
      });

      setStorageItem('reviews', reviews);
      setStorageItem('users', users);
      return { reviews, users };
    });

    reviewOrder(params.orderId);
  },
}));
