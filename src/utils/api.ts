import { FinancialData, CRMData, StrategyData, APIResponse } from '@/types/finance';

const API_BASE_URL = (typeof window !== 'undefined' ? 
  window.location.origin : 'http://localhost:5001').replace(':3000', ':5001');

import { getAuthToken as getToken } from './auth';

// トークンを取得する関数
const getAuthToken = () => {
  return getToken() || '';
};

// APIリクエストのヘルパー関数
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  console.log(`API Request: ${endpoint}`);
  console.log(`Token: ${token ? `${token.substring(0, 20)}...` : 'なし'}`);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    console.error(`API Error: ${response.status} for ${endpoint}`);
    
    if (response.status === 401) {
      // 認証エラーの場合、ログアウトしてログインページにリダイレクト
      console.log('認証エラー: ログアウトします');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
      }
      throw new Error('認証が必要です');
    }
    
    const errorData = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorData}`);
  }

  return response.json();
}

// CRMデータ取得
export async function getCRMData(cifId: string): Promise<APIResponse<CRMData>> {
  return apiRequest<APIResponse<CRMData>>(`/financial/crm-data/${cifId}`);
}

// 財務データ送信
export async function submitFinancialData(data: FinancialData): Promise<APIResponse<StrategyData>> {
  return apiRequest<APIResponse<StrategyData>>('/financial/submit', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 戦略データ取得
export async function getStrategyData(): Promise<APIResponse<StrategyData>> {
  return apiRequest<APIResponse<StrategyData>>('/financial/get-strategy');
}

// チャット履歴取得
export async function getChatHistory(): Promise<Array<{ role: string; content: string; timestamp?: string }>> {
  return apiRequest<Array<{ role: string; content: string; timestamp?: string }>>('/conversation_history');
}

// ログアウト処理
export async function logout(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    // ログインページにリダイレクト
    window.location.href = '/login';
  }
}

// チャットメッセージ送信
export async function sendChatMessage(message: string): Promise<Response> {
  const token = getAuthToken();
  
  console.log(`Chat Request: /message_chat`);
  console.log(`Token: ${token ? `${token.substring(0, 20)}...` : 'なし'}`);
  
  const response = await fetch(`${API_BASE_URL}/message_chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok && response.status === 401) {
    console.log('チャット認証エラー: ログアウトします');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
  }

  return response;
}

// チャット履歴クリア
export async function clearChatHistory(): Promise<APIResponse<{ message: string }>> {
  return apiRequest<APIResponse<{ message: string }>>('/clear', {
    method: 'POST',
  });
} 