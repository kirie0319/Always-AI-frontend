import { getAccessToken, clearTokens } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

export const fetchWithAuth = async (endpoint: string, options: FetchOptions = {}) => {
  const { requiresAuth = true, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);

  if (requiresAuth) {
    const token = getAccessToken();
    if (!token) {
      clearTokens();
      window.location.href = '/login';
      throw new Error('No access token found');
    }
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    clearTokens();
    window.location.href = '/login';
    throw new Error('Authentication failed');
  }

  return response;
};

export async function logout() {
  try {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    clearTokens();
    window.location.href = '/login';
  }
} 