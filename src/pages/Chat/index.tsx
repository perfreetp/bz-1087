import { useState, useEffect, useRef } from 'react';
import {
  useParams,
  useNavigate,
  Link,
} from 'react-router-dom';
import {
  ChevronLeft,
  Send,
  Image as ImageIcon,
  MessageCircle,
  Tag,
  Check,
  ShoppingBag,
  Clock,
  Package,
} from 'lucide-react';
import { useChatStore } from '@/stores/useChatStore';
import { useProductStore } from '@/stores/useProductStore';
import { formatPrice, formatRelativeTime } from '@/utils/format';
import type { Message } from '@/types';

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getChats, getChatById, getMessages, sendMessage, sendOffer, respondToOffer, markAsRead } = useChatStore();
  const { getProductById } = useProductStore();

  const [inputText, setInputText] = useState('');
  const [showNegotiate, setShowNegotiate] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chats = getChats();
  const currentChat = id ? getChatById(id) : undefined;
  const messages = id ? getMessages(id) : [];

  const currentUserId = 'user-current';

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (id) {
      markAsRead(id);
    }
  }, [id, markAsRead]);

  const handleSend = () => {
    if (!inputText.trim() || !id) return;
    sendMessage(id, inputText.trim());
    setInputText('');
  };

  const handleSendOffer = () => {
    if (!offerPrice || Number(offerPrice) <= 0 || !id) return;
    sendOffer(id, Number(offerPrice));
    setShowNegotiate(false);
    setOfferPrice('');
  };

  const handleAcceptOffer = (messageId: string) => {
    respondToOffer(messageId, true);
    const message = messages.find((m) => m.id === messageId);
    if (message && currentChat && message.offerPrice !== undefined) {
      navigate(
        `/orders/confirm?productId=${currentChat.productId}&chatId=${currentChat.id}&price=${message.offerPrice}`
      );
    }
  };

  const handleRejectOffer = (messageId: string) => {
    respondToOffer(messageId, false);
  };

  const handleGoToProduct = () => {
    if (currentChat) {
      navigate(`/product/${currentChat.productId}`);
    }
  };

  const handleCreateOrder = () => {
    if (currentChat) {
      navigate(`/orders/confirm?productId=${currentChat.productId}&chatId=${currentChat.id}`);
    }
  };

  const handleBuyWithOffer = (price: number) => {
    if (currentChat) {
      navigate(
        `/orders/confirm?productId=${currentChat.productId}&chatId=${currentChat.id}&price=${price}`
      );
    }
  };

  // 聊天列表视图（移动端）
  if (!id) {
    return (
      <div className="min-h-screen bg-warm-50">
        {/* 顶部导航 */}
        <div className="sticky top-0 z-40 bg-white border-b md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="font-bold text-lg">消息</h1>
          </div>
        </div>

        {/* 聊天列表 */}
        <div className="container py-2">
          {chats.length === 0 ? (
            <div className="py-20 text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">暂无消息</p>
              <p className="text-gray-400 text-sm">去逛逛，和卖家聊聊吧</p>
              <button
                onClick={() => navigate('/')}
                className="mt-4 btn-primary"
              >
                去逛逛
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => {
                const otherUserId = chat.participantIds.find(
                  (id) => id !== currentUserId
                );
                const otherUserName = otherUserId
                  ? chat.participantNames[otherUserId]
                  : '';
                const otherUserAvatar = otherUserId
                  ? chat.participantAvatars[otherUserId]
                  : '';

                return (
                  <Link
                    key={chat.id}
                    to={`/chat/${chat.id}`}
                    className="flex items-center gap-3 p-4 bg-white rounded-2xl mb-2 hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={otherUserAvatar}
                        alt={otherUserName}
                        className="w-12 h-12 rounded-full bg-gray-100"
                      />
                      {chat.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-800 truncate">
                          {otherUserName}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {chat.lastMessage
                            ? formatRelativeTime(chat.lastMessage.createdAt)
                            : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 truncate flex-1">
                          {chat.lastMessage
                            ? chat.lastMessage.type === 'offer'
                              ? '📩 议价消息'
                              : chat.lastMessage.type === 'system'
                              ? '系统消息'
                              : chat.lastMessage.content
                            : '开始聊天吧'}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 聊天详情视图
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate('/chat')}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {currentChat && (
            <>
              <div className="flex-1">
                <p className="font-medium text-gray-800">
                  {currentChat.participantNames[
                    currentChat.participantIds.find(
                      (id) => id !== currentUserId
                    ) || ''
                  ] || '聊天'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* 商品卡片 */}
        {currentChat && (
          <button
            onClick={handleGoToProduct}
            className="flex items-center gap-3 px-4 py-2 bg-gray-50 border-t"
          >
            <img
              src={currentChat.productImage}
              alt={currentChat.productTitle}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm text-gray-700 line-clamp-1">
                {currentChat.productTitle}
              </p>
              <p className="text-primary-500 font-bold">
                {formatPrice(currentChat.productPrice)}
              </p>
            </div>
            <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
          </button>
        )}
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-10">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">开始聊天吧</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isMine={message.senderId === currentUserId}
              senderName={
                currentChat?.participantNames[message.senderId] || ''
              }
              senderAvatar={
                currentChat?.participantAvatars[message.senderId] || ''
              }
              onAccept={handleAcceptOffer}
              onReject={handleRejectOffer}
              onBuyWithOffer={handleBuyWithOffer}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 底部操作栏 */}
      <div className="sticky bottom-0 bg-white border-t">
        {/* 快捷操作 */}
        <div className="flex items-center gap-2 px-4 py-2 border-b">
          <button
            onClick={() => setShowNegotiate(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full text-sm"
          >
            <Tag className="w-4 h-4" />
            我要议价
          </button>
          <button
            onClick={handleCreateOrder}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            立即购买
          </button>
        </div>

        {/* 输入框 */}
        <div className="flex items-end gap-2 p-3 safe-bottom">
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <ImageIcon className="w-6 h-6" />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="说点什么..."
              rows={1}
              className="w-full px-4 py-2.5 bg-gray-100 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-200"
              style={{ maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={`p-3 rounded-full transition-colors ${
              inputText.trim()
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 议价弹窗 */}
      {showNegotiate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowNegotiate(false)}
          />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm animate-slide-up">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary-500" />
              发起议价
            </h3>

            {currentChat && (
              <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">商品原价</p>
                <p className="text-xl font-bold text-primary-500">
                  {formatPrice(currentChat.productPrice)}
                </p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-2">
                您的出价
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400">
                  ¥
                </span>
                <input
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder="请输入您的出价"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:border-primary-400 focus:outline-none"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                合理的出价更容易被卖家接受哦~
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowNegotiate(false)}
                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-full font-medium"
              >
                取消
              </button>
              <button
                onClick={handleSendOffer}
                disabled={!offerPrice || Number(offerPrice) <= 0}
                className="flex-1 py-3 bg-primary-500 text-white rounded-full font-medium disabled:opacity-50"
              >
                发送议价
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 消息项组件
function MessageItem({
  message,
  isMine,
  senderName,
  senderAvatar,
  onAccept,
  onReject,
  onBuyWithOffer,
}: {
  message: Message;
  isMine: boolean;
  senderName: string;
  senderAvatar: string;
  onAccept: (messageId: string) => void;
  onReject: (messageId: string) => void;
  onBuyWithOffer: (price: number) => void;
}) {
  if (message.type === 'system') {
    return (
      <div className="text-center">
        <span className="inline-block px-3 py-1 bg-gray-200 text-gray-500 text-xs rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  if (message.type === 'offer') {
    return (
      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
        {!isMine && (
          <img
            src={senderAvatar}
            alt={senderName}
            className="w-8 h-8 rounded-full mr-2 flex-shrink-0"
          />
        )}
        <div
          className={`max-w-[75%] rounded-2xl p-0 overflow-hidden ${
            isMine
              ? 'bg-gradient-to-br from-primary-400 to-primary-500 text-white'
              : 'bg-white'
          }`}
        >
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Tag
                className={`w-5 h-5 ${isMine ? 'text-white/80' : 'text-primary-500'}`}
              />
              <span
                className={`text-sm font-medium ${
                  isMine ? 'text-white/90' : 'text-gray-600'
                }`}
              >
                {message.offerStatus === 'pending'
                  ? '议价中'
                  : message.offerStatus === 'accepted'
                  ? '议价已接受'
                  : '议价已拒绝'}
              </span>
            </div>
            <p
              className={`text-2xl font-bold ${
                isMine ? 'text-white' : 'text-primary-500'
              }`}
            >
              {message.offerPrice !== undefined &&
                formatPrice(message.offerPrice)}
            </p>
          </div>

          {/* 待处理的议价显示操作按钮 */}
          {!isMine && message.offerStatus === 'pending' && (
            <div className="flex border-t">
              <button
                onClick={() => onReject(message.id)}
                className="flex-1 py-2.5 text-gray-500 text-sm font-medium hover:bg-gray-50"
              >
                拒绝
              </button>
              <button
                onClick={() => onAccept(message.id)}
                className="flex-1 py-2.5 text-primary-500 text-sm font-medium hover:bg-primary-50 border-l"
              >
                接受
              </button>
            </div>
          )}

          {/* 议价已接受，显示去下单按钮 */}
          {isMine && message.offerStatus === 'accepted' && message.offerPrice !== undefined && (
            <div className="border-t border-white/20">
              <button
                onClick={() => onBuyWithOffer(message.offerPrice!)}
                className="w-full py-2.5 text-white text-sm font-medium hover:bg-white/10 flex items-center justify-center gap-1"
              >
                <ShoppingBag className="w-4 h-4" />
                用此价下单
              </button>
            </div>
          )}

          {/* 议价已接受（卖家视角），显示去下单按钮 */}
          {!isMine && message.offerStatus === 'accepted' && message.offerPrice !== undefined && (
            <div className="border-t">
              <button
                onClick={() => onBuyWithOffer(message.offerPrice!)}
                className="w-full py-2.5 text-primary-500 text-sm font-medium hover:bg-primary-50 flex items-center justify-center gap-1"
              >
                <ShoppingBag className="w-4 h-4" />
                用此价下单
              </button>
            </div>
          )}
        </div>
        {isMine && (
          <img
            src={senderAvatar}
            alt={senderName}
            className="w-8 h-8 rounded-full ml-2 flex-shrink-0"
          />
        )}
      </div>
    );
  }

  // 普通文本消息
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      {!isMine && (
        <img
          src={senderAvatar}
          alt={senderName}
          className="w-8 h-8 rounded-full mr-2 flex-shrink-0"
        />
      )}
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
          isMine
            ? 'bg-gradient-to-br from-primary-400 to-primary-500 text-white rounded-br-md'
            : 'bg-white rounded-bl-md'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
      {isMine && (
        <img
          src={senderAvatar}
          alt={senderName}
          className="w-8 h-8 rounded-full ml-2 flex-shrink-0"
        />
      )}
    </div>
  );
}
