import React, { useEffect } from 'react';
import { AttendanceMonitoring } from '../../components/hrd/AttendanceMonitoring';
import { EmployeeMasterData } from '../../components/hrd/EmployeeMasterData';
import { mfeEventBus } from '../eventBus';
import { Cpu, Wifi } from 'lucide-react';

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
      {/* MFE Watermark & Isolation Badge */}
      <div className="flex items-center justify-between bg-indigo-500/5 border border-indigo-500/20 px-4 py-2 rounded-2xl text-[11px] font-mono text-indigo-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="font-bold">MFE Remote: mfe-hrd-analytics (v3.1.2)</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-zinc-500">
          <span className="flex items-center gap-1">
            <Wifi className="w-3 h-3 text-indigo-500" /> Module Federation Active
          </span>
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-indigo-500" /> Isolated Sandbox
          </span>
        </div>
      </div>

      {activeSubTab === 'MONITORING_HRD' && <AttendanceMonitoring />}
      {activeSubTab === 'MASTER_KARYAWAN' && <EmployeeMasterData />}
    </div>
  );
};
