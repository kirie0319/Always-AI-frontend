// src/app/componets/Chat.tsx
// Chat component
'use client';

import { useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { Message } from '@/components/Message';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { logout } from '@/utils/api';

export default function Chat() {
  const {
    messages = [],
    input,
    setInput,
    isLoading,
    error,
    messagesEndRef,
    sendMessage,
    scrollToBottom,
    clearChat,
  } = useChat();

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f5faff] shadow-xl border border-[#b6d0f7] overflow-hidden">
      <div className="flex justify-between items-center p-4">
        <h1 className="text-xl font-semibold text-[#2563eb] tracking-wide">Always AI Chat</h1>
        <div className="flex space-x-3">
        </div>
      </div>
      <div className="flex-1 flex justify-center bg-[#f5faff] overflow-y-auto">
        <div className="w-3/5 p-6 space-y-4">
          {messages?.map((message, index) => (
            <Message key={index} message={message} />
          ))}
          {isLoading && <LoadingIndicator />}
          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <form onSubmit={handleSubmit} className="p-4 min-h-32 flex items-center">
        <div className="flex justify-center w-full">
          <div className="w-3/5 relative min-h-24 flex items-center border border-[#b6d0f7] rounded-2xl bg-white shadow-md">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="メッセージを入力..."
              className="w-full min-h-[48px] max-h-40 py-4 pr-16 pl-4 focus:outline-none text-[#22304a] placeholder:text-[#7ca0e4] resize-none overflow-y-auto transition-all bg-transparent border-none shadow-none rounded-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute bottom-2 right-2 w-10 h-10 bg-[#2563eb] text-white rounded-full flex items-center justify-center hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-[#2563eb] shadow-md transition-colors"
              style={{ fontSize: '1.25rem' }}
            >
              ↑
            </button>
          </div>
        </div>
      </form>
      {/* 履歴クリアボタンを右下に固定 */}
      <button
        onClick={clearChat}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#2563eb] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#1d4ed8] transition-colors text-2xl"
        disabled={isLoading || messages.length === 0}
        title="履歴クリア"
      >
        🗑️
      </button>
    </div>
  );
} 