"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isAuthenticated, getUserInfo, setAuthToken, setUserInfo, logout as authLogout } from '@/utils/auth';

interface User {
  id: string;
  username: string;
  email?: string;
}

interface AuthState {
  isValid: boolean;
  tokenLength: number;
  lastChecked: Date;
  expiresAt?: Date;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  authState: AuthState | null;
  login: (token: string, userInfo: User) => void;
  logout: () => void;
  loading: boolean;
  checkTokenValidity: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<AuthState | null>(null);

  useEffect(() => {
    // 初期化時に認証状態をチェック（クライアントサイドのみ）
    const checkAuthStatus = () => {
      try {
        // クライアントサイドでのみ認証チェックを実行
        if (typeof window !== 'undefined') {
          if (isAuthenticated()) {
            const userInfo = getUserInfo();
            if (userInfo) {
              setUser(userInfo);
              setIsLoggedIn(true);
            } else {
              // トークンはあるがユーザー情報がない場合はログアウト
              authLogout();
            }
          }
        }
      } catch (error) {
        console.error('認証状態の確認に失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    // マウント後に認証状態をチェック
    checkAuthStatus();
  }, []);

  // トークンの有効性をチェックする関数
  const checkTokenValidity = async (): Promise<boolean> => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setAuthState({
        isValid: false,
        tokenLength: 0,
        lastChecked: new Date(),
        error: 'トークンがありません'
      });
      return false;
    }

    try {
      // APIエンドポイントにトークンをテスト送信
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/conversation_history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const isValid = response.ok;
      
      // JWTの有効期限を取得（簡易版）
      let expiresAt: Date | undefined;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp) {
          expiresAt = new Date(payload.exp * 1000);
        }
      } catch (e) {
        console.warn('JWTのデコードに失敗:', e);
      }

      setAuthState({
        isValid,
        tokenLength: token.length,
        lastChecked: new Date(),
        expiresAt,
        error: isValid ? undefined : `認証エラー (${response.status})`
      });

      if (!isValid && response.status === 401) {
        // 401エラーの場合は自動ログアウト
        logout();
        return false;
      }

      return isValid;
    } catch (error) {
      console.error('トークン有効性チェックエラー:', error);
      setAuthState({
        isValid: false,
        tokenLength: token.length,
        lastChecked: new Date(),
        error: `ネットワークエラー: ${error instanceof Error ? error.message : '不明なエラー'}`
      });
      return false;
    }
  };

  const login = (token: string, userInfo: User) => {
    setAuthToken(token);
    setUserInfo(userInfo);
    setUser(userInfo);
    setIsLoggedIn(true);
    
    // ログイン時に認証状態を更新
    setAuthState({
      isValid: true,
      tokenLength: token.length,
      lastChecked: new Date(),
    });
  };

  const logout = () => {
    authLogout();
    setUser(null);
    setIsLoggedIn(false);
    setAuthState(null);
  };

  // デバッグ用: 開発環境でのみ有効
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as typeof window & { clearAuth?: () => void }).clearAuth = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        setUser(null);
        setIsLoggedIn(false);
        console.log('認証情報をクリアしました');
      };
    }
  }, []);

  const value = {
    user,
    isLoggedIn,
    authState,
    login,
    logout,
    loading,
    checkTokenValidity,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 