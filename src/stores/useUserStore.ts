import { create } from 'zustand';
import type { User, Review, WishlistItem } from '@/types';
import { mockUsers, currentUserId, mockReviews, mockWishlist } from '@/data/users';
import { getStorageItem, setStorageItem } from '@/utils/storage';

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
}

export const useUserStore = create<UserState>((set, get) => ({
  currentUser: getStorageItem<User | null>('currentUser', mockUsers.find((u) => u.id === currentUserId) || null),
  users: mockUsers,
  reviews: mockReviews,
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
}));
