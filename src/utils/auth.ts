/**
 * アクセストークンの管理を行うユーティリティ
 */

// トークンの取得
export const getAccessToken = (): string | null => {
  const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
  return token || null;
};

// トークンの設定
export const setAccessToken = (token: string): void => {
  document.cookie = `access_token=${token}; path=/`;
};

// トークンの削除
export const removeAccessToken = (): void => {
  document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

// 認証状態のチェック（Cookie版）
export const isAuthenticatedByCookie = (): boolean => {
  return getAccessToken() !== null;
};

// リフレッシュトークンの取得
export const getRefreshToken = (): string | null => {
  const token = document.cookie.split('; ').find(row => row.startsWith('refresh_token='))?.split('=')[1];
  return token || null;
};

// リフレッシュトークンの設定
export const setRefreshToken = (token: string): void => {
  document.cookie = `refresh_token=${token}; path=/`;
};

// リフレッシュトークンの削除
export const removeRefreshToken = (): void => {
  document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

// すべてのトークンを削除（ログアウト時など）
export const clearTokens = (): void => {
  removeAccessToken();
  removeRefreshToken();
};

// ユーザー名の取得
export const getUserName = (): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )username=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
};

// ユーザー名の設定
export const setUserName = (username: string): void => {
  document.cookie = `username=${encodeURIComponent(username)}; path=/`;
};

// ユーザー名の削除
export const removeUserName = (): void => {
  document.cookie = 'username=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

// 認証トークンの管理
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
};

export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
};

// 認証状態の確認
export const isAuthenticated = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    const token = getAuthToken();
    return token !== null && token !== '';
  } catch (error) {
    console.error('認証状態の確認に失敗:', error);
    return false;
  }
};

// ログアウト処理
export const logout = (): void => {
  removeAuthToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

// ユーザー情報の管理
export const getUserInfo = () => {
  if (typeof window !== 'undefined') {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  }
  return null;
};

export const setUserInfo = (userInfo: { id: string; username: string; email?: string }) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  }
};

export const removeUserInfo = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userInfo');
  }
}; 