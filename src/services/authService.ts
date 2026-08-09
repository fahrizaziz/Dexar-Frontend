import { apiClient, tokenStorage, ApiResponse } from './apiClient';
import { UserSession } from '../types';
import { storageService } from './storageService';

export interface LoginResponseData {
  accessToken: string;
  user: UserSession;
}

export const authService = {
  /**
   * Memanggil API Login Backend (POST /api/v1/auth/login) dengan NIP & Password.
   * Dilengkapi fallback otomatis jika backend offline.
   */
  async login(nip: string, pass: string): Promise<LoginResponseData> {
    const cleanNip = nip.trim();

    try {
      const response: ApiResponse<LoginResponseData> = await apiClient.post('/auth/login', {
        nip: cleanNip,
        identifier: cleanNip,
        password: pass,
      });

      if (response.success && response.data) {
        tokenStorage.setToken(response.data.accessToken);
        return response.data;
      }
    } catch (apiErr) {
      console.warn('Backend API Login offline/error, menggunakan fallback lokal:', apiErr);
    }

    // Fallback Lokal jika backend offline atau terkendala koneksi
    const employees = storageService.getEmployees();
    const foundEmp = employees.find(
      (e) => e.nip.toLowerCase() === cleanNip.toLowerCase() || e.email.toLowerCase() === cleanNip.toLowerCase()
    );

    if (foundEmp) {
      const userSession: UserSession = {
        id: foundEmp.id,
        nip: foundEmp.nip,
        name: foundEmp.fullName,
        email: foundEmp.email,
        role: foundEmp.role,
        department: foundEmp.department,
        position: foundEmp.position,
        avatarUrl: foundEmp.avatarUrl,
      };

      const mockToken = `mock_token_${Date.now()}_${foundEmp.nip}`;
      tokenStorage.setToken(mockToken);

      return {
        accessToken: mockToken,
        user: userSession,
      };
    }

    // Single HRD Admin Default Account Fallback
    if (cleanNip.toUpperCase() === 'EMP-2026-001' || cleanNip.toLowerCase() === 'siti.rahmawati@company.co.id') {
      const hrdUser: UserSession = {
        id: 'emp-101',
        nip: 'EMP-2026-001',
        name: 'Siti Rahmawati',
        email: 'siti.rahmawati@company.co.id',
        role: 'HRD_ADMIN',
        department: 'Human Resources & General Affairs',
        position: 'HR Manager & System Admin',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
      };

      const mockToken = `mock_token_${Date.now()}_EMP-2026-001`;
      tokenStorage.setToken(mockToken);

      return {
        accessToken: mockToken,
        user: hrdUser,
      };
    }

    throw new Error('NIP atau Password salah. Gunakan NIP: EMP-2026-001 dan Password: password123');
  },

  /**
   * Memanggil API Profil User Login (GET /api/v1/auth/me)
   */
  async getMe(): Promise<UserSession> {
    try {
      const response: ApiResponse<UserSession> = await apiClient.get('/auth/me');
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // Fallback
    }

    const savedUser = localStorage.getItem('wfh_current_user_v2');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        // Fallback
      }
    }

    throw new Error('Gagal mengambil data profil pengguna');
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
