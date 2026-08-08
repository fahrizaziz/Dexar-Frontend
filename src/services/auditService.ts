import { apiClient, ApiResponse } from './apiClient';

export interface AuditLogItem {
  id: string;
  actorNip: string;
  actorName: string;
  actorRole: string;
  action: string;
  category: 'KARYAWAN' | 'ATTENDANCE' | 'LEAVE' | 'SYSTEM' | 'ACCESS_RIGHTS';
  details: string;
  timestamp: string;
}

export const auditService = {
  /**
   * Mengambil riwayat Audit Trail Log (GET /api/v1/audit-logs)
   */
  async getAuditLogs(category?: string, search?: string): Promise<AuditLogItem[]> {
    const params: Record<string, string> = {};
    if (category && category !== 'ALL') params.category = category;
    if (search) params.search = search;

    const response: ApiResponse<AuditLogItem[]> = await apiClient.get('/audit-logs', params);
    if (response.success && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },

  /**
   * Mencatat aktivitas log baru (POST /api/v1/audit-logs)
   */
  async logAction(payload: {
    action: string;
    category?: string;
    details: string;
    actorNip?: string;
    actorName?: string;
    actorRole?: string;
  }): Promise<boolean> {
    const response: ApiResponse<AuditLogItem> = await apiClient.post('/audit-logs', payload);
    return response.success;
  },
};
