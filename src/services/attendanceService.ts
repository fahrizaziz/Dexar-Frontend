import { apiClient, ApiResponse } from './apiClient';
import { AttendanceRecord, LocationData } from '../types';

export interface ClockInPayload {
  latitude: number;
  longitude: number;
  address: string;
  photoProofUrl: string;
  workPlan: string;
}

export interface ClockOutPayload {
  workSummary: string;
}

export interface VerifyAttendancePayload {
  verificationStatus: 'TERVERIFIKASI' | 'PERLU_REVISI';
  notes?: string;
}

export const attendanceService = {
  /**
   * Absen Masuk WFH (POST /api/v1/attendance/clock-in)
   */
  async clockIn(payload: ClockInPayload): Promise<AttendanceRecord> {
    const response: ApiResponse<AttendanceRecord> = await apiClient.post(
      '/attendance/clock-in',
      payload
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Gagal melakukan Absen Masuk WFH');
  },

  /**
   * Absen Pulang WFH (POST /api/v1/attendance/clock-out/:id)
   */
  async clockOut(recordId: string, payload: ClockOutPayload): Promise<AttendanceRecord> {
    const response: ApiResponse<AttendanceRecord> = await apiClient.post(
      `/attendance/clock-out/${recordId}`,
      payload
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Gagal melakukan Absen Pulang WFH');
  },

  /**
   * Ambil Riwayat Absensi Pribadi (GET /api/v1/attendance/my-history)
   */
  async getMyHistory(): Promise<AttendanceRecord[]> {
    const response: ApiResponse<AttendanceRecord[]> = await apiClient.get(
      '/attendance/my-history'
    );

    if (response.success && Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  },

  /**
   * Ambil Data Monitoring Absensi HRD (GET /api/v1/attendance/monitoring)
   */
  async getHrdMonitoring(search?: string, department?: string): Promise<AttendanceRecord[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (department && department !== 'ALL') params.append('department', department);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response: ApiResponse<AttendanceRecord[]> = await apiClient.get(
      `/attendance/monitoring${queryString}`
    );

    if (response.success && Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  },

  /**
   * Verifikasi Absensi oleh Admin HRD (PATCH /api/v1/attendance/:id/verify)
   */
  async verifyAttendance(
    recordId: string,
    payload: VerifyAttendancePayload
  ): Promise<AttendanceRecord> {
    const response: ApiResponse<AttendanceRecord> = await apiClient.patch(
      `/attendance/${recordId}/verify`,
      payload
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Gagal memverifikasi absensi');
  },
};
