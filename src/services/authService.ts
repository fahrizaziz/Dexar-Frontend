import { apiClient, tokenStorage, ApiResponse } from './apiClient';
import { UserSession } from '../types';

export interface LoginResponseData {
  accessToken: string;
  user: UserSession;
}

export const authService = {
  /**
   * Memanggil API Login Backend (POST /api/v1/auth/login)
   */
  async login(email: string, pass: string): Promise<LoginResponseData> {
    const response: ApiResponse<LoginResponseData> = await apiClient.post('/auth/login', {
      email,
      password: pass,
    });

    if (response.success && response.data) {
      tokenStorage.setToken(response.data.accessToken);
      return response.data;
    }

    throw new Error(response.message || 'Login gagal');
  },

  /**
   * Memanggil API Profil User Login (GET /api/v1/auth/me)
   */
  async getMe(): Promise<UserSession> {
    const response: ApiResponse<UserSession> = await apiClient.get('/auth/me');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Gagal mengambil data pengguna');
  },

  /**
   * Logout (hapus token dari localStorage)
   */
  logout(): void {
    tokenStorage.removeToken();
  },

  /**
   * Cek apakah token tersimpan di localStorage
   */
  isAuthenticated(): boolean {
    return !!tokenStorage.getToken();
  },
};
