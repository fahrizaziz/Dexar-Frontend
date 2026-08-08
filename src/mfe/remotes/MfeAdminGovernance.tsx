import React, { useEffect } from 'react';
import { PayrollSummaryReport } from '../../components/hrd/PayrollSummaryReport';
import { GeofenceAndShiftConfig } from '../../components/hrd/GeofenceAndShiftConfig';
import { AuditTrailLogs } from '../../components/hrd/AuditTrailLogs';
import { MenuAccessConfig } from '../../components/hrd/MenuAccessConfig';
import { mfeEventBus } from '../eventBus';

interface Props {
  activeSubTab: string;
}

export const MfeAdminGovernance: React.FC<Props> = ({ activeSubTab }) => {
  useEffect(() => {
    // Notify Event Bus that Governance MFE loaded
    mfeEventBus.publish('mfe-admin-governance', 'MFE_LOADED', {
      timestamp: new Date().toISOString(),
      activeRoute: activeSubTab,
    });
  }, [activeSubTab]);

  return (
    <div className="relative space-y-4">
      {activeSubTab === 'REKAP_PAYROLL' && <PayrollSummaryReport />}
      {activeSubTab === 'GEOFENCE_SHIFT' && <GeofenceAndShiftConfig />}
      {activeSubTab === 'AUDIT_LOGS' && <AuditTrailLogs />}
      {activeSubTab === 'KONFIGURASI_AKSES' && <MenuAccessConfig />}
    </div>
  );
};
