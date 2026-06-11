import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

export default function Layout() {
  const location = useLocation();
  
  const isPublishPage = location.pathname === '/publish' || location.pathname.startsWith('/publish/');

  return (
    <div className="min-h-screen bg-warm-50">
      {!isPublishPage && <Header />}
      <main className={`${!isPublishPage ? 'pb-20 md:pb-8' : ''} min-h-[calc(100vh-64px)]`}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
