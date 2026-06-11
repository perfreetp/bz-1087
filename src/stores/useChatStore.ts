import { create } from 'zustand';
import type { Chat, Message, MessageType, OfferStatus } from '@/types';
import { mockChats, mockMessages } from '@/data/chats';
import { generateId } from '@/utils/format';
import { getStorageItem, setStorageItem } from '@/utils/storage';

interface ChatState {
  chats: Chat[];
  messages: Record<string, Message[]>;
  activeChatId: string | null;
  getChats: () => Chat[];
  getChatById: (id: string) => Chat | undefined;
  getMessages: (chatId: string) => Message[];
  setActiveChatId: (id: string | null) => void;
  sendMessage: (chatId: string, content: string, type?: MessageType) => void;
  sendOffer: (chatId: string, price: number) => void;
  respondToOffer: (messageId: string, accept: boolean) => void;
  markAsRead: (chatId: string) => void;
  createChat: (productId: string, participantId: string, productTitle: string, productImage: string, productPrice: number, participantName: string, participantAvatar: string) => string;
  getUnreadCount: () => number;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: getStorageItem('chats', mockChats),
  messages: getStorageItem('messages', mockMessages),
  activeChatId: null,

  getChats: () => {
    return [...get().chats].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  getChatById: (id) => {
    return get().chats.find((c) => c.id === id);
  },

  getMessages: (chatId) => {
    return get().messages[chatId] || [];
  },

  setActiveChatId: (id) => {
    set({ activeChatId: id });
    if (id) {
      get().markAsRead(id);
    }
  },

  sendMessage: (chatId, content, type = 'text') => {
    const currentUserId = 'user-current';
    const newMessage: Message = {
      id: generateId(),
      chatId,
      senderId: currentUserId,
      type,
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      const messages = {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), newMessage],
      };

      const chats = state.chats.map((c) =>
        c.id === chatId
          ? {
              ...c,
              lastMessage: newMessage,
              updatedAt: newMessage.createdAt,
            }
          : c
      );

      setStorageItem('messages', messages);
      setStorageItem('chats', chats);

      return { messages, chats };
    });

    setTimeout(() => {
      simulateReply(chatId);
    }, 1000 + Math.random() * 2000);
  },

  sendOffer: (chatId, price) => {
    const content = `发起议价：¥${price}`;
    const currentUserId = 'user-current';
    const newMessage: Message = {
      id: generateId(),
      chatId,
      senderId: currentUserId,
      type: 'offer',
      content,
      offerPrice: price,
      offerStatus: 'pending',
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      const messages = {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), newMessage],
      };

      const chats = state.chats.map((c) =>
        c.id === chatId
          ? {
              ...c,
              lastMessage: newMessage,
              updatedAt: newMessage.createdAt,
            }
          : c
      );

      setStorageItem('messages', messages);
      setStorageItem('chats', chats);

      return { messages, chats };
    });

    setTimeout(() => {
      simulateOfferResponse(chatId, newMessage.id, price);
    }, 2000 + Math.random() * 2000);
  },

  respondToOffer: (messageId, accept) => {
    set((state) => {
      const newMessages = { ...state.messages };
      
      for (const chatId of Object.keys(newMessages)) {
        const msgs = newMessages[chatId];
        const msgIndex = msgs.findIndex((m) => m.id === messageId);
        if (msgIndex !== -1) {
          newMessages[chatId] = msgs.map((m, i) =>
            i === msgIndex
              ? {
                  ...m,
                  offerStatus: accept ? 'accepted' : 'rejected' as OfferStatus,
                  content: accept ? '议价已接受' : '议价已拒绝',
                }
              : m
          );

          const replyMessage: Message = {
            id: generateId(),
            chatId,
            senderId: 'user-current',
            type: 'system' as MessageType,
            content: accept ? '您接受了议价' : '您拒绝了议价',
            isRead: false,
            createdAt: new Date().toISOString(),
          };

          newMessages[chatId] = [...newMessages[chatId], replyMessage];

          const chats = state.chats.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  lastMessage: replyMessage,
                  updatedAt: replyMessage.createdAt,
                }
              : c
          );

          setStorageItem('messages', newMessages);
          setStorageItem('chats', chats);

          return { messages: newMessages, chats };
        }
      }

      return state;
    });
  },

  markAsRead: (chatId) => {
    set((state) => {
      const messages = {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).map((m) => ({ ...m, isRead: true })),
      };

      const chats = state.chats.map((c) =>
        c.id === chatId ? { ...c, unreadCount: 0 } : c
      );

      setStorageItem('messages', messages);
      setStorageItem('chats', chats);

      return { messages, chats };
    });
  },

  createChat: (productId, participantId, productTitle, productImage, productPrice, participantName, participantAvatar) => {
    const currentUserId = 'user-current';
    const existingChat = get().chats.find(
      (c) =>
        c.productId === productId &&
        c.participantIds.includes(currentUserId) &&
        c.participantIds.includes(participantId)
    );

    if (existingChat) {
      return existingChat.id;
    }

    const chatId = 'chat-' + Date.now();
    const newChat: Chat = {
      id: chatId,
      participantIds: [currentUserId, participantId],
      participantNames: {
        [currentUserId]: '我是宝妈',
        [participantId]: participantName,
      },
      participantAvatars: {
        [currentUserId]: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
        [participantId]: participantAvatar,
      },
      productId,
      productTitle,
      productImage,
      productPrice,
      lastMessage: null,
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
    };

    set((state) => {
      const chats = [newChat, ...state.chats];
      const messages = { ...state.messages, [chatId]: [] };
      setStorageItem('chats', chats);
      setStorageItem('messages', messages);
      return { chats, messages };
    });

    return chatId;
  },

  getUnreadCount: () => {
    return get().chats.reduce((sum, chat) => sum + chat.unreadCount, 0);
  },
}));

function simulateReply(chatId: string) {
  const replies = [
    '好的呢~',
    '没问题的',
    '可以的',
    '感谢您的关注！',
    '请问还有其他问题吗？',
    '可以的，随时可以看货~',
  ];

  const randomReply = replies[Math.floor(Math.random() * replies.length)];
  const currentUserId = 'user-current';

  const state = useChatStore.getState();
  const chat = state.chats.find((c) => c.id === chatId);
  if (!chat) return;

  const otherUserId = chat.participantIds.find((id) => id !== currentUserId);
  if (!otherUserId) return;

  const newMessage: Message = {
    id: generateId(),
    chatId,
    senderId: otherUserId,
    type: 'text',
    content: randomReply,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  useChatStore.setState((state) => {
    const messages = {
      ...state.messages,
      [chatId]: [...(state.messages[chatId] || []), newMessage],
    };

    const chats = state.chats.map((c) =>
      c.id === chatId
        ? {
            ...c,
            lastMessage: newMessage,
            unreadCount: c.unreadCount + 1,
            updatedAt: newMessage.createdAt,
          }
        : c
    );

    setStorageItem('messages', messages);
    setStorageItem('chats', chats);

    return { messages, chats };
  });
}

function simulateOfferResponse(chatId: string, offerMessageId: string, price: number) {
  const accept = Math.random() > 0.3;
  
  const state = useChatStore.getState();
  const chat = state.chats.find((c) => c.id === chatId);
  if (!chat) return;

  const currentUserId = 'user-current';
  const otherUserId = chat.participantIds.find((id) => id !== currentUserId);
  if (!otherUserId) return;

  useChatStore.setState((state) => {
    const newMessages = { ...state.messages };
    const msgs = newMessages[chatId] || [];
    
    newMessages[chatId] = msgs.map((m) =>
      m.id === offerMessageId
        ? {
            ...m,
            offerStatus: accept ? 'accepted' : 'rejected' as OfferStatus,
            content: accept ? `对方接受了议价 ¥${price}` : `对方拒绝了议价`,
          }
        : m
    );

    const systemMessage: Message = {
      id: generateId(),
      chatId,
      senderId: otherUserId,
      type: 'system',
      content: accept ? '卖家接受了您的议价' : '卖家拒绝了您的议价',
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    newMessages[chatId] = [...newMessages[chatId], systemMessage];

    const chats = state.chats.map((c) =>
      c.id === chatId
        ? {
            ...c,
            lastMessage: systemMessage,
            unreadCount: c.unreadCount + 1,
            updatedAt: systemMessage.createdAt,
          }
        : c
    );

    setStorageItem('messages', newMessages);
    setStorageItem('chats', chats);

    return { messages: newMessages, chats };
  });
}
