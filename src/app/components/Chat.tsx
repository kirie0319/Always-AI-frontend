// src/app/componets/Chat.tsx
// Chat component
'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // API設定
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  // スクロール
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 初期化時にチャット履歴を読み込み
  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // チャット履歴の読み込み
  const loadChatHistory = async () => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('Loading chat history with token:', token ? `${token.substring(0, 20)}...` : 'なし');
      
      if (!token) {
        console.log('No auth token found');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/conversation_history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Chat history response status:', response.status);
      
      if (response.ok) {
        const history = await response.json();
        console.log('Chat history loaded:', history);
        setMessages(history);
      } else {
        console.error('Failed to load chat history:', response.status, response.statusText);
        if (response.status === 401) {
          setError('認証が必要です。再度ログインしてください。');
        }
      }
    } catch (error) {
      console.error('チャット履歴の読み込みに失敗:', error);
      setError('チャット履歴の読み込みに失敗しました');
    }
  };

  // メッセージ送信
  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      console.log('Sending message with token:', token ? `${token.substring(0, 20)}...` : 'なし');
      
      if (!token) {
        throw new Error('認証トークンがありません。再度ログインしてください。');
      }
      
      const response = await fetch(`${API_BASE_URL}/message_chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: messageContent }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let assistantContent = '';
      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                assistantContent += data.text;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    ...newMessages[newMessages.length - 1],
                    content: assistantContent
                  };
                  return newMessages;
                });
              } else if (data.error) {
                throw new Error(data.error);
              }
            } catch (parseError) {
              console.error('JSONパースエラー:', parseError);
            }
          }
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'エラーが発生しました');
      console.error('メッセージ送信エラー:', error);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // チャット履歴のクリア
  const clearChat = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('認証トークンがありません。再度ログインしてください。');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessages([]);
        setError(null);
      } else if (response.status === 401) {
        setError('認証が必要です。再度ログインしてください。');
      }
    } catch (error) {
      console.error('チャット履歴のクリアに失敗:', error);
      setError('履歴のクリアに失敗しました');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
  };

  // メッセージコンポーネント
  const MessageComponent = ({ message }: { message: Message }) => (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-2xl px-4 py-2 rounded-lg ${
          message.role === 'user'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-800 border border-gray-200'
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        {message.timestamp && (
          <div className={`text-xs mt-1 ${
            message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
          }`}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );

  // タイピングインジケータ
  const TypingIndicator = () => (
    <div className="flex justify-start">
      <div className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-lg">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full min-h-screen bg-[#f5faff] shadow-xl border border-[#b6d0f7] overflow-hidden">
      <div className="flex justify-between items-center p-4 relative shrink-0">
        <h1 className="text-xl font-semibold text-[#2563eb] tracking-wide">Always AI Chat</h1>
        <div className="flex space-x-3">
        </div>
        <button
          onClick={clearChat}
          className="absolute top-2 right-4 w-12 h-12 bg-[#2563eb] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#1d4ed8] transition-colors text-xl z-10"
          disabled={isLoading || messages.length === 0}
          title="履歴クリア"
        >
          🗑️
        </button>
      </div>
      <div className="flex-1 flex justify-center bg-[#f5faff] overflow-y-auto">
        <div className="w-full max-w-3xl p-6 space-y-4">
          {messages?.map((message, index) => (
            <MessageComponent key={index} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <form onSubmit={handleSubmit} className="p-4 min-h-32 flex items-center shrink-0">
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
    </div>
  );
} 