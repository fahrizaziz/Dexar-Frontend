import React, { useEffect } from 'react';
import { WFHClockInCard } from '../../components/employee/WFHClockInCard';
import { PersonalAttendanceHistory } from '../../components/employee/PersonalAttendanceHistory';
import { LeaveManagement } from '../../components/employee/LeaveManagement';
import { mfeEventBus } from '../eventBus';
import { Cpu, Wifi } from 'lucide-react';

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
      {/* MFE Watermark & Isolation Badge */}
      <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 px-4 py-2 rounded-2xl text-[11px] font-mono text-emerald-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">MFE Remote: mfe-employee-portal (v2.4.0)</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-zinc-500">
          <span className="flex items-center gap-1">
            <Wifi className="w-3 h-3 text-emerald-500" /> Module Federation Active
          </span>
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-emerald-500" /> Isolated Lifecycle Boundary
          </span>
        </div>
      </div>

      {/* Render Subview based on active route */}
      {activeSubTab === 'ABSENSI_WFH' && <WFHClockInCard />}
      {activeSubTab === 'HISTORY_SAYA' && <PersonalAttendanceHistory />}
      {activeSubTab === 'PENGAJUAN_CUTI' && <LeaveManagement />}
    </div>
  );
};
