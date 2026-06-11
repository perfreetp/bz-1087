import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Plus, MessageCircle, User } from 'lucide-react';
import { useChatStore } from '@/stores/useChatStore';

export default function BottomNav() {
  const location = useLocation();
  const unreadCount = useChatStore((state) => state.getUnreadCount());

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/search', icon: Search, label: '分类' },
    { path: '/publish', icon: Plus, label: '发布', isSpecial: true },
    { path: '/chat', icon: MessageCircle, label: '消息' },
    { path: '/profile', icon: User, label: '我的' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 md:hidden safe-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          if (item.isSpecial) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center"
              >
                <div className="absolute -top-4 w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-gray-500 mt-6">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 ${
                active ? 'text-primary-500' : 'text-gray-500'
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {item.path === '/chat' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
