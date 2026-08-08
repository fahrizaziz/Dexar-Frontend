import { apiClient, ApiResponse } from './apiClient';
import { Employee, DepartmentMaster, PositionMaster } from '../types';

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
  status?: 'ACTIVE' | 'INACTIVE' | 'AKTIF' | 'NON_AKTIF';
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

  // ----------------------------------------------------
  // MASTER DEPARTEMEN API ENDPOINTS
  // ----------------------------------------------------
  async getAllDepartments(): Promise<DepartmentMaster[]> {
    const response: ApiResponse<DepartmentMaster[]> = await apiClient.get('/departments');
    if (response.success && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },

  async createDepartment(payload: Omit<DepartmentMaster, 'id'>): Promise<DepartmentMaster> {
    const response: ApiResponse<DepartmentMaster> = await apiClient.post('/departments', payload);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Gagal membuat departemen baru');
  },

  async updateDepartment(id: string, payload: Partial<DepartmentMaster>): Promise<DepartmentMaster> {
    const response: ApiResponse<DepartmentMaster> = await apiClient.put(`/departments/${id}`, payload);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Gagal memperbarui departemen');
  },

  async deleteDepartment(id: string): Promise<boolean> {
    const response: ApiResponse<null> = await apiClient.delete(`/departments/${id}`);
    return response.success;
  },

  // ----------------------------------------------------
  // MASTER JABATAN / POSISI API ENDPOINTS
  // ----------------------------------------------------
  async getAllPositions(): Promise<PositionMaster[]> {
    const response: ApiResponse<PositionMaster[]> = await apiClient.get('/positions');
    if (response.success && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },

  async createPosition(payload: Omit<PositionMaster, 'id'>): Promise<PositionMaster> {
    const response: ApiResponse<PositionMaster> = await apiClient.post('/positions', payload);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Gagal membuat jabatan baru');
  },

  async updatePosition(id: string, payload: Partial<PositionMaster>): Promise<PositionMaster> {
    const response: ApiResponse<PositionMaster> = await apiClient.put(`/positions/${id}`, payload);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Gagal memperbarui jabatan');
  },

  async deletePosition(id: string): Promise<boolean> {
    const response: ApiResponse<null> = await apiClient.delete(`/positions/${id}`);
    return response.success;
  },
};
