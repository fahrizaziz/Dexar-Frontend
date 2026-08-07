import React from 'react';

export type MfeScope = 'EMPLOYEE' | 'HRD' | 'GOVERNANCE' | 'SYSTEM';

export interface MfeManifest {
  id: string;
  name: string;
  version: string;
  remoteEntryUrl: string; // Simulated / real module federation endpoint
  scope: MfeScope;
  title: string;
  description: string;
  iconName: string;
  requiredPermission?: string;
  routeKey: string;
  subRoutes: {
    key: string;
    label: string;
    icon: string;
    permission?: string;
  }[];
  status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  bundleSizeKb: number;
  latencyMs: number;
}

export interface MfeEvent<T = any> {
  id: string;
  timestamp: string;
  sourceMfeId: string;
  eventName: string;
  payload: T;
}

export type MfeEventListener<T = any> = (event: MfeEvent<T>) => void;
