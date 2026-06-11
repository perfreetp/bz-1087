import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Plus, MessageCircle, User, Bell, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useChatStore } from '@/stores/useChatStore';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadCount = useChatStore((state) => state.getUnreadCount());

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchQuery)}`);
    }
  };

  const isSearchPage = location.pathname === '/search';

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-primary-500 to-primary-400 shadow-md">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-white">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl">🧸</span>
            </div>
            <span className="text-xl font-bold hidden sm:block">童乐汇</span>
          </Link>

          {!isSearchPage && (
            <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索玩具..."
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-white/90 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </form>
          )}

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => navigate('/publish')}
              className="flex items-center gap-1 px-3 py-2 bg-white text-primary-600 rounded-full font-medium hover:bg-primary-50 transition-colors text-sm sm:text-base"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">发布</span>
            </button>

            <button
              onClick={() => navigate('/chat')}
              className="relative p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            >
              <User className="w-6 h-6" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors md:hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isSearchPage && (
          <form onSubmit={handleSearch} className="pb-3 md:hidden">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索玩具..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/90 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </form>
        )}
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container py-2">
            <Link to="/" className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg">
              首页
            </Link>
            <Link to="/search" className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg">
              分类搜索
            </Link>
            <Link to="/orders" className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg">
              我的订单
            </Link>
            <Link to="/report" className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg">
              举报仲裁
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
