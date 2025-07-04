"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Chat from './components/Chat';
import Link from 'next/link';

function Projects() {
  return (
    <div className="flex flex-col items-center w-full h-full bg-[#f5faff] text-[#2563eb] py-12">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#2563eb]">Projects</h1>
          <button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-5 py-2 rounded-lg shadow transition-colors">+ New project</button>
        </div>
        <input
          type="text"
          placeholder="Search projects..."
          className="w-full mb-6 px-4 py-3 rounded-lg border border-[#2563eb] bg-transparent text-[#2563eb] placeholder:text-[#7ca0e4] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
        />
        <div className="flex justify-end mb-6">
          <button className="flex items-center bg-[#eaf1fb] text-[#2563eb] px-4 py-2 rounded-lg border border-[#2563eb] hover:bg-[#2563eb] hover:text-white transition-colors">
            Sort by <span className="ml-2 font-semibold">Activity</span>
          </button>
        </div>
        <div className="flex gap-6 mb-6">
          <Link href="/finance" className="flex-1 border border-[#2563eb] rounded-xl p-5 bg-white hover:bg-[#2563eb] hover:text-white transition-colors cursor-pointer block">
            <div className="font-bold text-lg mb-2 text-[#2563eb] hover:text-white transition-colors">Financial Suppoter AI</div>
            <div className="text-sm mb-4 text-[#7ca0e4] hover:text-white transition-colors">金融向けのファイプロ</div>
            <div className="text-xs text-[#7ca0e4] hover:text-white transition-colors">Updated 6 months ago</div>
          </Link>
          <div className="flex-1 border border-[#2563eb] rounded-xl p-5 bg-white hover:bg-[#2563eb] hover:text-white transition-colors">
            <div className="font-bold text-lg mb-2 text-[#2563eb] hover:text-white transition-colors">Mobility Support AI</div>
            <div className="text-sm mb-4 text-[#7ca0e4] hover:text-white transition-colors">An example project that also doubles as a how-to guide for using Claude. Chat with it to learn more about how to get the most out of chatting with Claude!</div>
            <div className="text-xs text-[#7ca0e4] hover:text-white transition-colors">Updated 10 months ago</div>
          </div>
        </div>
        <button className="w-full py-3 rounded-lg border border-[#2563eb] text-[#2563eb] font-semibold hover:bg-[#2563eb] hover:text-white transition-colors">View all</button>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('chats');
  const searchParams = useSearchParams();

  useEffect(() => {
    // URLパラメータからタブを設定
    const tab = searchParams.get('tab');
    if (tab === 'projects') {
      setActiveTab('projects');
    } else {
      setActiveTab('chats');
    }
  }, [searchParams]);

  return (
    <div className="w-full h-full flex flex-col">
      {activeTab === 'chats' ? <Chat /> : <Projects />}
    </div>
  );
}
