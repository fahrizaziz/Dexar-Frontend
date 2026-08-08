import React, { useEffect } from 'react';
import { AttendanceMonitoring } from '../../components/hrd/AttendanceMonitoring';
import { EmployeeMasterData } from '../../components/hrd/EmployeeMasterData';
import { mfeEventBus } from '../eventBus';

interface Props {
  activeSubTab: string;
}

export const MfeHrdAnalytics: React.FC<Props> = ({ activeSubTab }) => {
  useEffect(() => {
    // Notify Event Bus that HRD Analytics MFE loaded
    mfeEventBus.publish('mfe-hrd-analytics', 'MFE_LOADED', {
      timestamp: new Date().toISOString(),
      activeRoute: activeSubTab,
    });
  }, [activeSubTab]);

  return (
    <div className="relative space-y-4">
      {activeSubTab === 'MONITORING_HRD' && <AttendanceMonitoring />}
      {activeSubTab === 'MASTER_KARYAWAN' && <EmployeeMasterData />}
    </div>
  );
};
