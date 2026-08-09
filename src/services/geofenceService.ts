import { apiClient, ApiResponse } from './apiClient';
import { GeofenceConfig } from '../types';

export const geofenceService = {
  async getGeofenceConfig(): Promise<GeofenceConfig | null> {
    try {
      const response: ApiResponse<GeofenceConfig> = await apiClient.get('/geofence');
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (err) {
      console.warn('Could not fetch geofence config from NestJS API:', err);
      return null;
    }
  },

  async updateGeofenceConfig(payload: Partial<GeofenceConfig>): Promise<GeofenceConfig | null> {
    try {
      const response: ApiResponse<GeofenceConfig> = await apiClient.put('/geofence', payload);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (err) {
      console.warn('Could not update geofence config via NestJS API:', err);
      return null;
    }
  },
};
