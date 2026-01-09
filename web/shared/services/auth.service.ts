import { apiClient } from '../lib/api';
import { signIn, signOut, getCurrentUser } from '../lib/firebase';
import { AuthUser } from '../types';
import type { User as FirebaseUser } from 'firebase/auth';

export interface LoginResponse {
  success: true;
  data: AuthUser;
}

export interface LoginResult {
  user: AuthUser;
  firebaseUser: FirebaseUser;
}

export const authService = {
  // Login with email and password
  async login(email: string, password: string): Promise<LoginResult> {
    // Sign in with Firebase
    const firebaseUser = await signIn(email, password);

    // Get user profile from API
    const response = await apiClient.get<unknown, LoginResponse>('/users/me');
    const user = response.data;

    return { user, firebaseUser };
  },

  // Logout
  async logout(): Promise<void> {
    await signOut();
  },

  // Get current Firebase user
  getFirebaseUser(): FirebaseUser | null {
    return getCurrentUser();
  },

  // Get current user profile from API
  async getMe(): Promise<AuthUser> {
    const response = await apiClient.get<unknown, LoginResponse>('/users/me');
    return response.data;
  },

  // Update profile
  async updateProfile(data: {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
  }): Promise<AuthUser> {
    const response = await apiClient.put<unknown, LoginResponse>('/users/me', data);
    return response.data;
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/users/me/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },
};
