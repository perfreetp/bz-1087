import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import Search from '@/pages/Search';
import ProductDetail from '@/pages/ProductDetail';
import Publish from '@/pages/Publish';
import Chat from '@/pages/Chat';
import Orders from '@/pages/Orders';
import Profile from '@/pages/Profile';
import Report from '@/pages/Report';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:section" element={<Profile />} />
          <Route path="/report" element={<Report />} />
          <Route path="/report/:section" element={<Report />} />
        </Route>
        <Route path="/publish" element={<Publish />} />
        <Route path="/publish/:id" element={<Publish />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50">
      <div className="text-center">
        <div className="text-6xl mb-4">🧸</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">页面走丢了</h1>
        <p className="text-gray-500 mb-6">找不到您要访问的页面</p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-3 bg-primary-500 text-white rounded-full font-medium"
        >
          返回首页
        </button>
      </div>
    </div>
  );
}
