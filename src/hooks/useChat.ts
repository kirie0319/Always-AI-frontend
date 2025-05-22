import { useState, useEffect, useRef } from 'react';
import { fetchWithAuth } from '@/utils/api';
import { Message, ChatResponse, ChatHistory } from '@/types/chat';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/utils/auth';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      setError('ログインが必要です');
      router.push('/login');
      return;
    }
    loadChatHistory();
  }, [router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const response = await fetchWithAuth('/conversation_history');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          setMessages(data?.messages || []);
        }
      } else {
        throw new Error('Failed to load chat history');
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setError('チャット履歴の読み込みに失敗しました');
      setMessages([]);
    }
  };

  const clearChat = async () => {
    try {
      const response = await fetchWithAuth('/clear', {
        method: 'POST',
      });

      if (response.ok) {
        setMessages([]);
        setError(null);
      } else {
        throw new Error('Failed to clear chat history');
      }
    } catch (error) {
      console.error('Failed to clear chat history:', error);
      setError('チャット履歴のクリアに失敗しました');
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    if (!isAuthenticated()) {
      setError('ログインが必要です');
      router.push('/login');
      return;
    }

    const userMessage: Message = { role: 'user', content: content.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);
    setError(null);

    try {
      const response = await fetchWithAuth('/message_chat', {
        method: 'POST',
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      let assistantMessage = '';
      const decoder = new TextDecoder();
      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                if (isFirstChunk) {
                  setIsTyping(false);
                  isFirstChunk = false;
                }
                assistantMessage += data.text;
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = assistantMessage;
                    return [...newMessages];
                  } else {
                    return [...newMessages, { role: 'assistant', content: assistantMessage }];
                  }
                });
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('メッセージの送信に失敗しました');
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '申し訳ありません。エラーが発生しました。もう一度お試しください。' },
      ]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    isTyping,
    error,
    messagesEndRef,
    sendMessage,
    scrollToBottom,
    clearChat,
  };
}; 