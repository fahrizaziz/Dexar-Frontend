import { apiClient, ApiResponse } from './apiClient';
import { LeaveRequest } from '../types';

export interface CreateLeaveRequestPayload {
  type: 'CUTI' | 'SAKIT' | 'TUKAR_HARI_WFH' | 'LEMBUR';
  startDate: string;
  endDate: string;
  reason: string;
}

export interface UpdateLeaveStatusPayload {
  status: 'APPROVED' | 'REJECTED';
  hrdNotes?: string;
}

export const leaveService = {
  /**
   * Kirim permohonan Cuti / Sakit / Tukar WFH oleh Karyawan (POST /api/v1/leave-requests)
   */
  async createLeaveRequest(payload: CreateLeaveRequestPayload): Promise<LeaveRequest> {
    const response: ApiResponse<LeaveRequest> = await apiClient.post(
      '/leave-requests',
      payload
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Gagal mengirimkan permohonan cuti');
  },

  /**
   * Mengambil daftar permohonan cuti milik karyawan yang sedang login (GET /api/v1/leave-requests/my-requests)
   */
  async getMyLeaveRequests(): Promise<LeaveRequest[]> {
    const response: ApiResponse<LeaveRequest[]> = await apiClient.get(
      '/leave-requests/my-requests'
    );

    if (response.success && Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  },

  /**
   * Mengambil seluruh permohonan cuti karyawan (Untuk Dashboard HRD Approval) (GET /api/v1/leave-requests)
   */
  async getAllLeaveRequests(): Promise<LeaveRequest[]> {
    const response: ApiResponse<LeaveRequest[]> = await apiClient.get('/leave-requests');

    if (response.success && Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  },

  /**
   * HRD Setujui / Tolak permohonan cuti karyawan (PATCH /api/v1/leave-requests/:id/status)
   */
  async updateStatus(
    id: string,
    payload: UpdateLeaveStatusPayload
  ): Promise<LeaveRequest> {
    const response: ApiResponse<LeaveRequest> = await apiClient.patch(
      `/leave-requests/${id}/status`,
      payload
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Gagal meng-update status permohonan cuti');
  },
};
