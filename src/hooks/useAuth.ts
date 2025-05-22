import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setAccessToken, setRefreshToken, isAuthenticated } from '@/utils/auth';

interface LoginFormData {
  username: string;
  password: string;
}

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
}

interface AuthError {
  message: string;
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://finance-advisory-project-production.up.railway.app';

  useEffect(() => {
    if (isAuthenticated()) {
      console.log('User already logged in, redirecting to home...');
      router.replace('/');
    }
  }, [router]);

  const login = async (formData: LoginFormData) => {
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Login form submitted');
    setError(null);
    setIsLoading(true);

    try {
      console.log('Attempting login with username:', formData.username);
      const response = await fetch(`${API_BASE_URL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: formData.username,
          password: formData.password,
        }),
        credentials: 'include',
      });

      console.log('Login response status:', response.status);
      const data = await response.json();
      console.log('Login response data:', { ...data, access_token: data.access_token ? 'exists' : 'not found' });

      if (!response.ok) {
        throw new Error(data.detail || 'ログインに失敗しました');
      }

      // Store the tokens
      console.log('Storing tokens');
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      // ユーザー名もcookieに保存
      document.cookie = `username=${encodeURIComponent(formData.username)}; path=/`;

      // Use replace instead of push for redirection
      console.log('Login successful, redirecting to home...');
      router.replace('/');
    } catch (err) {
      console.error('Login error:', err);
      setError({
        message: err instanceof Error ? err.message : 'ログインに失敗しました'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: RegisterFormData) => {
    console.log('Registration form submitted');
    setError(null);
    setIsLoading(true);

    try {
      console.log('Attempting registration with username:', formData.username);
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Registration response status:', response.status);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || '登録に失敗しました');
      }

      // Redirect to login page after successful registration
      console.log('Registration successful, redirecting to login...');
      router.push('/login');
    } catch (err) {
      console.error('Registration error:', err);
      setError({
        message: err instanceof Error ? err.message : '登録に失敗しました'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    login,
    register,
  };
}; 