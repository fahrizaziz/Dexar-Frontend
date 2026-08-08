import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Clock,
  Shield,
  Users,
  CalendarCheck,
  UserCheck,
  ChevronDown,
  Building2,
  LogOut,
  Sliders,
  CalendarDays,
  Activity,
  MapPin,
  FileSpreadsheet,
} from 'lucide-react';
import { formatTimeWIB, formatIndonesianDate } from '../../utils/dateUtils';

export type NavTabType =
  | 'ABSENSI_WFH'
  | 'HISTORY_SAYA'
  | 'PENGAJUAN_CUTI'
  | 'MONITORING_HRD'
  | 'MASTER_KARYAWAN'
  | 'REKAP_PAYROLL'
  | 'GEOFENCE_SHIFT'
  | 'AUDIT_LOGS'
  | 'KONFIGURASI_AKSES';

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  onOpenLoginModal: () => void;
  onOpenMfeInspector?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenLoginModal,
}) => {
  const { currentUser, logout, hasPermission } = useAuth();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isHRD = currentUser.role === 'HRD_ADMIN';

  const canClockIn = hasPermission('CLOCK_IN_WFH');
  const canViewHistory = hasPermission('VIEW_PERSONAL_HISTORY');
  const canManageLeave = hasPermission('MANAGE_LEAVE_REQUESTS');
  const canViewMonitoring = hasPermission('VIEW_HRD_MONITORING');
  const canManageEmployees = hasPermission('MANAGE_EMPLOYEES');
  const canViewPayroll = hasPermission('VIEW_PAYROLL_SUMMARY');
  const canManageGeofence = hasPermission('MANAGE_GEOFENCE_OFFICE');
  const canViewAuditLogs = hasPermission('VIEW_AUDIT_TRAILS');
  const canManageMenuAccess = hasPermission('MANAGE_MENU_ACCESS');

  const hasEmployeeTabs = canClockIn || canViewHistory || canManageLeave;
  const hasHrdTabs =
    canViewMonitoring ||
    canManageEmployees ||
    canViewPayroll ||
    canManageGeofence ||
    canViewAuditLogs ||
    canManageMenuAccess;

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    onOpenLoginModal();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0c0c0e]/95 backdrop-blur-md border-b border-zinc-800/90 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-11 h-11 rounded-xl bg-[#121215] flex items-center justify-center text-emerald-400 shadow-inner border border-zinc-800">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-zinc-100">
                  WFH Portal
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden xl:block">
                Sistem Absensi & Monitoring Karyawan
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop & Tablet) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#09090b] p-1 rounded-xl border border-zinc-800 max-w-full overflow-x-auto no-scrollbar shrink">
            {/* Employee Tabs */}
            {canClockIn && (
              <button
                onClick={() => setActiveTab('ABSENSI_WFH')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'ABSENSI_WFH'
                    ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/10 font-bold border border-emerald-400/40'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Absen WFH</span>
              </button>
            )}

            {canViewHistory && (
              <button
                onClick={() => setActiveTab('HISTORY_SAYA')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'HISTORY_SAYA'
                    ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/10 font-bold border border-emerald-400/40'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>History Saya</span>
              </button>
            )}

            {canManageLeave && (
              <button
                onClick={() => setActiveTab('PENGAJUAN_CUTI')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'PENGAJUAN_CUTI'
                    ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/10 font-bold border border-emerald-400/40'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cuti & WFH</span>
              </button>
            )}

            {/* Divider only if both employee and HRD tabs are present */}
            {hasEmployeeTabs && hasHrdTabs && <div className="h-4 w-px bg-zinc-800 mx-1 shrink-0" />}

            {/* HRD / Admin Tabs */}
            {canViewMonitoring && (
              <button
                onClick={() => setActiveTab('MONITORING_HRD')}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'MONITORING_HRD'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-bold border border-indigo-400/40'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Monitoring</span>
              </button>
            )}

            {canManageEmployees && (
              <button
                onClick={() => setActiveTab('MASTER_KARYAWAN')}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'MASTER_KARYAWAN'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-bold border border-indigo-400/40'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Master Data</span>
              </button>
            )}

            {canViewPayroll && (
              <button
                onClick={() => setActiveTab('REKAP_PAYROLL')}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'REKAP_PAYROLL'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20 font-bold border border-purple-400/40'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-purple-400" />
                <span>Payroll</span>
              </button>
            )}

            {canManageGeofence && (
              <button
                onClick={() => setActiveTab('GEOFENCE_SHIFT')}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'GEOFENCE_SHIFT'
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20 font-bold border border-cyan-400/40'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Geofence & Shift</span>
              </button>
            )}

            {canViewAuditLogs && (
              <button
                onClick={() => setActiveTab('AUDIT_LOGS')}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'AUDIT_LOGS'
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20 font-bold border border-amber-400/40'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>Audit Trail</span>
              </button>
            )}

            {canManageMenuAccess && (
              <button
                onClick={() => setActiveTab('KONFIGURASI_AKSES')}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'KONFIGURASI_AKSES'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-bold border border-indigo-400/40'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>Akses Menu</span>
              </button>
            )}
          </nav>

          {/* Right Controls: Real-time clock & User profile */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Live Clock */}
            <div className="hidden xl:flex flex-col items-end text-right px-3 py-1.5 rounded-xl bg-[#09090b] border border-zinc-800">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>{formatTimeWIB(currentTime)}</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">
                {formatIndonesianDate(currentTime)}
              </span>
            </div>

            {/* User Profile Pill & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-[#121215] hover:bg-zinc-800/80 border border-zinc-800 transition-all text-left cursor-pointer"
              >
                <img
                  src={
                    currentUser.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                  }
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-lg object-cover ring-1 ring-emerald-500/40"
                />
                <div className="hidden sm:block text-xs">
                  <p className="font-bold text-zinc-100 leading-none">{currentUser.name}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                    {isHRD ? 'Admin HRD' : currentUser.position || 'Karyawan WFH'}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              </button>

              {/* Profile Menu Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0c0c0e] border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 text-xs">
                  <div className="p-3 border-b border-zinc-800 bg-[#09090b] rounded-xl mb-1">
                    <p className="font-bold text-zinc-100 text-sm">{currentUser.name}</p>
                    <p className="text-zinc-400 text-xs mt-0.5">{currentUser.email}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-zinc-400">NIP: {currentUser.nip}</span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          isHRD
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {isHRD ? 'ADMIN HRD' : 'KARYAWAN'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-1 my-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-xl hover:bg-rose-950/40 text-rose-300 transition-colors text-xs font-medium cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center gap-2 py-2.5 border-t border-zinc-800 text-xs overflow-x-auto no-scrollbar">
          {canClockIn && (
            <button
              onClick={() => setActiveTab('ABSENSI_WFH')}
              className={`flex flex-col items-center gap-1 shrink-0 px-3 ${
                activeTab === 'ABSENSI_WFH' ? 'text-emerald-400 font-bold' : 'text-zinc-400'
              }`}
            >
              <CalendarCheck className="w-5 h-5" />
              <span>Absen WFH</span>
            </button>
          )}

          {canViewHistory && (
            <button
              onClick={() => setActiveTab('HISTORY_SAYA')}
              className={`flex flex-col items-center gap-1 shrink-0 px-3 ${
                activeTab === 'HISTORY_SAYA' ? 'text-emerald-400 font-bold' : 'text-zinc-400'
              }`}
            >
              <UserCheck className="w-5 h-5" />
              <span>History</span>
            </button>
          )}

          {canManageLeave && (
            <button
              onClick={() => setActiveTab('PENGAJUAN_CUTI')}
              className={`flex flex-col items-center gap-1 shrink-0 px-3 ${
                activeTab === 'PENGAJUAN_CUTI' ? 'text-emerald-400 font-bold' : 'text-zinc-400'
              }`}
            >
              <CalendarDays className="w-5 h-5" />
              <span>Cuti & WFH</span>
            </button>
          )}

          {canViewMonitoring && (
            <button
              onClick={() => setActiveTab('MONITORING_HRD')}
              className={`flex flex-col items-center gap-1 shrink-0 px-3 ${
                activeTab === 'MONITORING_HRD' ? 'text-indigo-400 font-bold' : 'text-zinc-400'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span>Monitoring</span>
            </button>
          )}

          {canManageEmployees && (
            <button
              onClick={() => setActiveTab('MASTER_KARYAWAN')}
              className={`flex flex-col items-center gap-1 shrink-0 px-3 ${
                activeTab === 'MASTER_KARYAWAN' ? 'text-indigo-400 font-bold' : 'text-zinc-400'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Master Data</span>
            </button>
          )}

          {canViewPayroll && (
            <button
              onClick={() => setActiveTab('REKAP_PAYROLL')}
              className={`flex flex-col items-center gap-1 shrink-0 px-3 ${
                activeTab === 'REKAP_PAYROLL' ? 'text-purple-400 font-bold' : 'text-zinc-400'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5 text-purple-400" />
              <span>Payroll</span>
            </button>
          )}

          {canManageGeofence && (
            <button
              onClick={() => setActiveTab('GEOFENCE_SHIFT')}
              className={`flex flex-col items-center gap-1 shrink-0 px-3 ${
                activeTab === 'GEOFENCE_SHIFT' ? 'text-cyan-400 font-bold' : 'text-zinc-400'
              }`}
            >
              <MapPin className="w-5 h-5 text-cyan-400" />
              <span>Shift</span>
            </button>
          )}

          {canViewAuditLogs && (
            <button
              onClick={() => setActiveTab('AUDIT_LOGS')}
              className={`flex flex-col items-center gap-1 shrink-0 px-3 ${
                activeTab === 'AUDIT_LOGS' ? 'text-amber-400 font-bold' : 'text-zinc-400'
              }`}
            >
              <Activity className="w-5 h-5 text-amber-400" />
              <span>Audit</span>
            </button>
          )}

          {canManageMenuAccess && (
            <button
              onClick={() => setActiveTab('KONFIGURASI_AKSES')}
              className={`flex flex-col items-center gap-1 shrink-0 px-3 ${
                activeTab === 'KONFIGURASI_AKSES' ? 'text-indigo-400 font-bold' : 'text-zinc-400'
              }`}
            >
              <Sliders className="w-5 h-5" />
              <span>Akses</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
