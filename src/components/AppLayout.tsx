"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FiMessageCircle, FiFolder, FiUser, FiBarChart } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, isLoggedIn, logout, loading, authState, checkTokenValidity } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState('chats');
  const [showAuthDetails, setShowAuthDetails] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // ログインページやレジスタページでは認証を不要にする
  const publicPaths = ['/login', '/register'];
  const isPublicPath = publicPaths.includes(pathname);

  useEffect(() => {
    // パスに基づいてアクティブメニューを設定
    if (pathname === '/finance') {
      setSelectedMenu('finance');
    } else if (pathname === '/' && selectedMenu !== 'chats' && selectedMenu !== 'projects') {
      setSelectedMenu('chats');
    }
  }, [pathname, selectedMenu]);

  useEffect(() => {
    // 認証が必要なページで未認証の場合はログインページにリダイレクト
    if (!loading && !isLoggedIn && !isPublicPath && typeof window !== 'undefined') {
      router.push('/login');
    }
  }, [isLoggedIn, loading, isPublicPath, router]);

  // 定期的な認証チェック
  useEffect(() => {
    if (isLoggedIn && !isPublicPath) {
      // 初回チェック
      checkTokenValidity();
      
      // 5分ごとに認証状態をチェック
      const interval = setInterval(() => {
        checkTokenValidity();
      }, 5 * 60 * 1000); // 5分
      
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, isPublicPath, checkTokenValidity]);

  // ローディング中
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5faff] flex items-center justify-center">
        <div className="text-[#2563eb] text-xl">読み込み中...</div>
      </div>
    );
  }

  // パブリックページの場合は認証チェックなしで表示
  if (isPublicPath) {
    return <>{children}</>;
  }

  // 未認証の場合は何も表示しない（リダイレクト待ち）
  if (!isLoggedIn) {
    return null;
  }

  const handleMenuClick = (menu: string) => {
    setSelectedMenu(menu);
    
    // メニューに応じてページ遷移
    switch (menu) {
      case 'chats':
        router.push('/');
        break;
      case 'projects':
        router.push('/?tab=projects');
        break;
      case 'finance':
        router.push('/finance');
        break;
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="h-screen flex bg-[#181818]">
      {/* サイドバー */}
      <aside
        className={`h-full bg-[#eaf1fb] text-[#22304a] flex flex-col justify-between border-r border-[#b6d0f7] transition-all duration-300 relative ${
          sidebarOpen ? 'w-64' : 'w-12'
        }`}
        style={{ minWidth: sidebarOpen ? '16rem' : '3rem', transition: 'all 0.3s' }}
      >
        {sidebarOpen ? (
          <>
            <div>
              <div className="flex items-center h-16 px-6 text-2xl font-bold tracking-wide text-[#2563eb] relative">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="bg-[#2563eb] text-white rounded-full p-2 shadow-md hover:bg-[#1d4ed8] transition-all mr-3 text-xl"
                  aria-label="サイドバーを閉じる"
                >
                  <FaChevronLeft />
                </button>
                Always AI
              </div>
              <button className="w-[90%] mx-auto mt-4 mb-2 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg block text-left px-4 font-semibold shadow-md">
                + New chat
              </button>
              <nav className="px-4">
                <ul className="space-y-2">
                  <li
                    className={`cursor-pointer font-semibold flex items-center px-2 py-2 rounded ${
                      selectedMenu === 'chats' ? 'bg-[#2563eb] text-white' : 'text-[#2563eb] hover:text-[#1d4ed8]'
                    }`}
                    onClick={() => handleMenuClick('chats')}
                  >
                    <FiMessageCircle className="mr-2" />Chats
                  </li>
                  <li
                    className={`cursor-pointer font-semibold flex items-center px-2 py-2 rounded ${
                      selectedMenu === 'projects' ? 'bg-[#2563eb] text-white' : 'text-[#2563eb] hover:text-[#1d4ed8]'
                    }`}
                    onClick={() => handleMenuClick('projects')}
                  >
                    <FiFolder className="mr-2" />Projects
                  </li>
                  <li
                    className={`cursor-pointer font-semibold flex items-center px-2 py-2 rounded ${
                      selectedMenu === 'finance' ? 'bg-[#2563eb] text-white' : 'text-[#2563eb] hover:text-[#1d4ed8]'
                    }`}
                    onClick={() => handleMenuClick('finance')}
                  >
                    <FiBarChart className="mr-2" />Financial Support
                  </li>
                </ul>
                <div className="mt-6 mb-2 text-xs text-[#7ca0e4]">Recents</div>
                <ul className="space-y-1 text-sm max-h-40 overflow-y-auto">
                  {/* 最近のチャット履歴などをここに表示 */}
                </ul>
              </nav>
            </div>
            <div className="p-4 border-t border-[#b6d0f7] bg-[#f5faff] relative group">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setShowAuthDetails(!showAuthDetails)}>
                <div className="w-10 h-10 rounded-full bg-[#dbeafe] flex items-center justify-center text-lg font-bold text-[#2563eb]">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-[#22304a]">{user?.username || 'ユーザー'}</div>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${authState?.isValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs text-gray-600">
                      {authState?.isValid ? '認証済み' : '認証エラー'}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {showAuthDetails ? '▲' : '▼'}
                </div>
              </div>
              
              {/* 認証詳細情報 */}
              {showAuthDetails && authState && (
                <div className="mt-3 p-3 bg-white border border-[#b6d0f7] rounded-lg text-xs">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">状態:</span>
                      <span className={authState.isValid ? 'text-green-600' : 'text-red-600'}>
                        {authState.isValid ? '✓ 有効' : '✗ 無効'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">トークン長:</span>
                      <span className="text-gray-800">{authState.tokenLength} 文字</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">最終チェック:</span>
                      <span className="text-gray-800">
                        {authState.lastChecked.toLocaleTimeString()}
                      </span>
                    </div>
                    {authState.expiresAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">有効期限:</span>
                        <span className="text-gray-800">
                          {authState.expiresAt.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {authState.error && (
                      <div className="pt-2 border-t border-gray-200">
                        <span className="text-red-600 text-xs">{authState.error}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-200 flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          checkTokenValidity();
                        }}
                        className="flex-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                      >
                        再チェック
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLogout();
                        }}
                        className="flex-1 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                      >
                        ログアウト
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-50 w-full min-w-64">
                <div className="bg-white border border-[#b6d0f7] rounded-lg shadow-lg px-4 py-2 w-full min-w-64">
                  <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-white hover:bg-red-600 px-4 py-2 rounded transition-colors font-semibold w-full"
                  >
                    ログアウト
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col justify-between h-full items-center py-4">
            <div className="flex flex-col gap-6 items-center mt-2 w-full relative">
              <button
                onClick={() => setSidebarOpen(true)}
                className="bg-[#2563eb] text-white rounded-full p-2 shadow-md hover:bg-[#1d4ed8] transition-all mb-4 mx-auto text-xl"
                aria-label="サイドバーを開く"
              >
                <FaChevronRight />
              </button>
              <button onClick={() => handleMenuClick('chats')}>
                <FiMessageCircle className="text-2xl text-[#2563eb]" title="Chats" />
              </button>
              <button onClick={() => handleMenuClick('projects')}>
                <FiFolder className="text-2xl text-[#2563eb]" title="Projects" />
              </button>
              <button onClick={() => handleMenuClick('finance')}>
                <FiBarChart className="text-2xl text-[#2563eb]" title="Financial Support" />
              </button>
            </div>
            <div className="flex flex-col items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-[#dbeafe] flex items-center justify-center text-lg font-bold text-[#2563eb]">
                <FiUser />
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 h-full overflow-hidden">
        {children}
      </main>
    </div>
  );
} 