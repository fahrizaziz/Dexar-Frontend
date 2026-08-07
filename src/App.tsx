import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Navbar, NavTabType } from './components/layout/Navbar';
import { ToastContainer } from './components/common/Toast';
import { LoginModal } from './components/auth/LoginModal';
import { Building2, Layers, FileText } from 'lucide-react';

import { ProtectedView } from './components/common/ProtectedView';
import { authService } from './services/authService';

// Micro-Frontend Infrastructure imports
import { MFE_REGISTRY } from './mfe/mfeRegistry';
import { MfeContainer } from './mfe/MfeContainer';
import { MfeEmployeePortal } from './mfe/remotes/MfeEmployeePortal';
import { MfeHrdAnalytics } from './mfe/remotes/MfeHrdAnalytics';
import { MfeAdminGovernance } from './mfe/remotes/MfeAdminGovernance';
import { MfeInspectorModal } from './components/mfe/MfeInspectorModal';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<NavTabType>('ABSENSI_WFH');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMfeInspectorOpen, setIsMfeInspectorOpen] = useState(false);
  const { isLoadingAuth } = useAuth();

  // Otomatis buka modal login jika user belum terautentikasi saat pertama kali web diakses
  useEffect(() => {
    if (!isLoadingAuth && !authService.isAuthenticated()) {
      setIsLoginModalOpen(true);
    }
  }, [isLoadingAuth]);

  // Micro-Frontend Route Grouping
  const isEmployeeMfeRoute =
    activeTab === 'ABSENSI_WFH' || activeTab === 'HISTORY_SAYA' || activeTab === 'PENGAJUAN_CUTI';

  const isHrdAnalyticsMfeRoute =
    activeTab === 'MONITORING_HRD' || activeTab === 'MASTER_KARYAWAN';

  const isGovernanceMfeRoute =
    activeTab === 'REKAP_PAYROLL' ||
    activeTab === 'GEOFENCE_SHIFT' ||
    activeTab === 'AUDIT_LOGS' ||
    activeTab === 'KONFIGURASI_AKSES';

  return (
    <div className="min-h-screen bg-[#09090b] bg-geometric-grid text-zinc-100 font-sans selection:bg-emerald-500 selection:text-zinc-950 flex flex-col justify-between relative overflow-x-hidden">
      {/* Subtle radial emerald background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-radial-emerald pointer-events-none z-0" />

      <div className="relative z-10">
        {/* Navbar Header */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onOpenMfeInspector={() => setIsMfeInspectorOpen(true)}
        />

        {/* Main Content Viewport hosted by Micro Frontend Orchestrator */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* MFE Remote 1: Employee Portal */}
          {isEmployeeMfeRoute && (
            <MfeContainer mfe={MFE_REGISTRY[0]}>
              <ProtectedView
                permission={
                  activeTab === 'ABSENSI_WFH'
                    ? 'CLOCK_IN_WFH'
                    : activeTab === 'HISTORY_SAYA'
                    ? 'VIEW_PERSONAL_HISTORY'
                    : 'MANAGE_LEAVE_REQUESTS'
                }
              >
                <MfeEmployeePortal activeSubTab={activeTab} />
              </ProtectedView>
            </MfeContainer>
          )}

          {/* MFE Remote 2: HRD Monitoring & Analytics */}
          {isHrdAnalyticsMfeRoute && (
            <MfeContainer mfe={MFE_REGISTRY[1]}>
              <ProtectedView
                permission={
                  activeTab === 'MONITORING_HRD' ? 'VIEW_HRD_MONITORING' : 'MANAGE_EMPLOYEES'
                }
              >
                <MfeHrdAnalytics activeSubTab={activeTab} />
              </ProtectedView>
            </MfeContainer>
          )}

          {/* MFE Remote 3: Enterprise Governance, Payroll & Geofence */}
          {isGovernanceMfeRoute && (
            <MfeContainer mfe={MFE_REGISTRY[2]}>
              <ProtectedView
                permission={
                  activeTab === 'REKAP_PAYROLL'
                    ? 'VIEW_PAYROLL_SUMMARY'
                    : activeTab === 'GEOFENCE_SHIFT'
                    ? 'MANAGE_GEOFENCE_OFFICE'
                    : activeTab === 'AUDIT_LOGS'
                    ? 'VIEW_AUDIT_TRAILS'
                    : 'MANAGE_MENU_ACCESS'
                }
              >
                <MfeAdminGovernance activeSubTab={activeTab} />
              </ProtectedView>
            </MfeContainer>
          )}
        </main>
      </div>

      {/* Footer with MFE Inspector Trigger */}
      <footer className="relative z-10 border-t border-zinc-800/80 bg-[#0c0c0e]/90 backdrop-blur-md py-6 mt-12 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-semibold text-zinc-300 tracking-wide">
              Sistem Absensi WFH & Monitoring HRD Karyawan
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
            <a
              href="/Dokumentasi_API_WFH_Portal.docx"
              download="Dokumentasi_API_WFH_Portal.docx"
              className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-lg"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download Spec API (.docx)</span>
            </a>
            <span className="text-zinc-600">•</span>
            <button
              onClick={() => setIsMfeInspectorOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Buka MFE DevTools Inspector</span>
            </button>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">Decoupled Micro-Frontend Architecture</span>
          </div>
        </div>
      </footer>

      {/* Floating Toast Manager */}
      <ToastContainer />

      {/* Login / Role Switching Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

      {/* Micro Frontend Inspector & DevTools Modal */}
      <MfeInspectorModal
        isOpen={isMfeInspectorOpen}
        onClose={() => setIsMfeInspectorOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </AuthProvider>
  );
}
