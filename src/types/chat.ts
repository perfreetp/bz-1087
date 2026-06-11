export type MessageType = 'text' | 'image' | 'offer' | 'system';

export type OfferStatus = 'pending' | 'accepted' | 'rejected';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  type: MessageType;
  content: string;
  offerPrice?: number;
  offerStatus?: OfferStatus;
  isRead: boolean;
  createdAt: string;
}

export interface Chat {
  id: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  participantAvatars: Record<string, string>;
  productId: string;
  productTitle: string;
  productImage: string;
  productPrice: number;
  orderId?: string;
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: string;
}
