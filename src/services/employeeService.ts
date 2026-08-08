import { apiClient, ApiResponse } from './apiClient';
import { Employee } from '../types';

export interface CreateEmployeePayload {
  nip?: string;
  fullName: string;
  email: string;
  password?: string;
  role?: 'KARYAWAN' | 'HRD' | 'ADMIN';
  department?: string;
  position?: string;
  phone?: string;
  avatarUrl?: string;
  joinDate?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  wfhAllowanceDaysPerWeek?: number;
  salary?: number;
}

export const employeeService = {
  /**
   * Mengambil daftar karyawan (GET /api/v1/employees)
   */
  async getAllEmployees(search?: string, department?: string): Promise<Employee[]> {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (department && department !== 'ALL') params.department = department;

    const response: ApiResponse<Employee[]> = await apiClient.get('/employees', params);

    if (response.success && Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  },

  /**
   * Menambah karyawan baru (POST /api/v1/employees)
   */
  async createEmployee(payload: CreateEmployeePayload): Promise<Employee> {
    const response: ApiResponse<Employee> = await apiClient.post('/employees', payload);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Gagal menambahkan karyawan baru');
  },

  /**
   * Memperbarui data karyawan (PUT /api/v1/employees/:id)
   */
  async updateEmployee(id: string, payload: Partial<CreateEmployeePayload>): Promise<Employee> {
    const response: ApiResponse<Employee> = await apiClient.put(`/employees/${id}`, payload);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Gagal memperbarui data karyawan');
  },

  /**
   * Menghapus atau menonaktifkan karyawan (DELETE /api/v1/employees/:id)
   */
  async deleteEmployee(id: string): Promise<boolean> {
    const response: ApiResponse<null> = await apiClient.delete(`/employees/${id}`);
    return response.success;
  },
};
