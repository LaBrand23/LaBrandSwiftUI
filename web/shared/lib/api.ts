import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { auth } from './firebase';

const API_BASE_URL = 'https://asia-south1-labrand-ef645.cloudfunctions.net/api';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const user = auth?.currentUser;
      console.log('[API] Request interceptor - current user:', user?.uid || 'null');
      if (user) {
        const token = await user.getIdToken();
        console.log('[API] Got ID token, length:', token?.length || 0);
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('[API] No current user - request will be sent without auth token');
      }
    } catch (error) {
      console.error('[API] Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Return the data directly for successful responses
    console.log('[API] Response success:', response.config.url, response.status);
    return response.data;
  },
  async (error: AxiosError<{ error?: string; code?: string; details?: unknown }>) => {
    console.error('[API] Response error:', error.config?.url, error.response?.status, error.message);
    const originalRequest = error.config;

    // Handle 401 Unauthorized - token might be expired
    if (error.response?.status === 401 && originalRequest) {
      try {
        const user = auth.currentUser;
        if (user) {
          // Force token refresh
          const newToken = await user.getIdToken(true);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Redirect to login if token refresh fails
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    // Format error for consistent handling
    const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
    const errorCode = error.response?.data?.code || 'UNKNOWN_ERROR';

    const formattedError = {
      success: false,
      error: errorMessage,
      code: errorCode,
      status: error.response?.status,
      details: error.response?.data?.details,
    };

    return Promise.reject(formattedError);
  }
);

// Helper function to build query string
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// Export types for API responses
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  status?: number;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
