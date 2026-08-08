import React, { useEffect } from 'react';
import { WFHClockInCard } from '../../components/employee/WFHClockInCard';
import { PersonalAttendanceHistory } from '../../components/employee/PersonalAttendanceHistory';
import { LeaveManagement } from '../../components/employee/LeaveManagement';
import { mfeEventBus } from '../eventBus';

interface Props {
  activeSubTab: string;
}

export const MfeEmployeePortal: React.FC<Props> = ({ activeSubTab }) => {
  useEffect(() => {
    // Notify Event Bus that Employee MFE loaded
    mfeEventBus.publish('mfe-employee-portal', 'MFE_LOADED', {
      timestamp: new Date().toISOString(),
      activeRoute: activeSubTab,
    });
  }, [activeSubTab]);

  return (
    <div className="relative space-y-4">
      {/* Render Subview based on active route */}
      {activeSubTab === 'ABSENSI_WFH' && <WFHClockInCard />}
      {activeSubTab === 'HISTORY_SAYA' && <PersonalAttendanceHistory />}
      {activeSubTab === 'PENGAJUAN_CUTI' && <LeaveManagement />}
    </div>
  );
};
