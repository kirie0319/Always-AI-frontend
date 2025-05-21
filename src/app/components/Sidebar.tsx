'use client';

import { useEffect, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FiMessageCircle, FiFolder, FiUser } from 'react-icons/fi';

function getUserNameFromCookie() {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|; )username=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : '';
}

type SidebarProps = {
  selectedMenu: string;
  setSelectedMenu: (menu: string) => void;
};

export default function Sidebar({ selectedMenu, setSelectedMenu }: SidebarProps) {
  const [userName, setUserName] = useState('');
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setUserName(getUserNameFromCookie());
  }, []);

  return (
    <>
      <aside
        className={`h-full bg-[#eaf1fb] text-[#22304a] flex flex-col justify-between border-r border-[#b6d0f7] transition-all duration-300 relative ${open ? 'w-64' : 'w-12'}`}
        style={{ minWidth: open ? '16rem' : '3rem', transition: 'all 0.3s' }}
      >
        {open ? (
          <>
            <div>
              <div className="flex items-center h-16 px-6 text-2xl font-bold tracking-wide text-[#2563eb] relative">
                <button
                  onClick={() => setOpen(false)}
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
                    className={`cursor-pointer font-semibold flex items-center px-2 py-2 rounded ${selectedMenu === 'chats' ? 'bg-[#2563eb] text-white' : 'text-[#2563eb] hover:text-[#1d4ed8]'}`}
                    onClick={() => setSelectedMenu('chats')}
                  >
                    <FiMessageCircle className="mr-2" />Chats
                  </li>
                  <li
                    className={`cursor-pointer font-semibold flex items-center px-2 py-2 rounded ${selectedMenu === 'projects' ? 'bg-[#2563eb] text-white' : 'text-[#2563eb] hover:text-[#1d4ed8]'}`}
                    onClick={() => setSelectedMenu('projects')}
                  >
                    <FiFolder className="mr-2" />Projects
                  </li>
                </ul>
                <div className="mt-6 mb-2 text-xs text-[#7ca0e4]">Recents</div>
                <ul className="space-y-1 text-sm max-h-40 overflow-y-auto">
                </ul>
              </nav>
            </div>
            <div className="p-4 border-t border-[#b6d0f7] flex items-center space-x-3 bg-[#f5faff] relative group">
              <div className="w-10 h-10 rounded-full bg-[#dbeafe] flex items-center justify-center text-lg font-bold text-[#2563eb]">YM</div>
              <div>
                <div className="font-semibold text-sm text-[#22304a]">{userName || 'ユーザー'}</div>
              </div>
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-50 w-full min-w-64">
                <div className="bg-white border border-[#b6d0f7] rounded-lg shadow-lg px-4 py-2 w-full min-w-64">
                  <button
                    onClick={async () => { await import('@/utils/api').then(m => m.logout()); }}
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
                onClick={() => setOpen(true)}
                className="bg-[#2563eb] text-white rounded-full p-2 shadow-md hover:bg-[#1d4ed8] transition-all mb-4 mx-auto text-xl"
                aria-label="サイドバーを開く"
              >
                <FaChevronRight />
              </button>
              <FiMessageCircle className="text-2xl text-[#2563eb]" title="Chats" />
              <FiFolder className="text-2xl text-[#2563eb]" title="Projects" />
            </div>
            <div className="flex flex-col items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-[#dbeafe] flex items-center justify-center text-lg font-bold text-[#2563eb]">
                <FiUser />
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
} 