import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!username || !password) {
        setError('ユーザー名とパスワードを入力してください。');
        return;
      }

      // バックエンドのログインAPIを呼び出し
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://finance-advisory-project-production.up.railway.app';
      const response = await fetch(`${API_BASE_URL}/token`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('ユーザー名またはパスワードが正しくありません。');
        } else {
          setError('ログインに失敗しました。サーバーエラーが発生しました。');
        }
        return;
      }

      const tokenData = await response.json();
      
      console.log('Login response:', tokenData);
      console.log('Access token:', tokenData.access_token);
      
      // ユーザー情報をトークンから取得するか、別途APIで取得
      const userInfo = {
        id: '1', // 実際にはトークンからユーザーIDを取得
        username: username,
        email: username.includes('@') ? username : `${username}@example.com`
      };
      
      login(tokenData.access_token, userInfo);
      
      // トークンが正しく保存されたかを確認
      setTimeout(() => {
        const savedToken = localStorage.getItem('authToken');
        console.log('Saved token:', savedToken);
      }, 100);
      
      router.push('/');
    } catch (err) {
      console.error('Login error:', err);
      setError('ログインに失敗しました。ネットワークエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            アカウントにログイン
          </h2>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>ログイン方法:</strong><br/>
              1. 既存のアカウントでログイン<br/>
              2. または下記の「アカウント作成」から新規登録
            </p>
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                ユーザー名またはメールアドレス
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="ユーザー名またはメールアドレス"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>
          </div>

          <div className="text-sm text-center">
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              アカウントをお持ちでない方はこちら
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}; 