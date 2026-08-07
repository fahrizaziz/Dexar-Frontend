import React from 'react';
import { useAuth, Permission } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import {
  ShieldCheck,
  RotateCcw,
  CalendarCheck,
  UserCheck,
  Shield,
  Users,
  Download,
  Sliders,
  CheckCircle2,
  Lock,
  Unlock,
  Key,
  Info,
  Sparkles,
} from 'lucide-react';

interface PermissionMeta {
  code: Permission;
  label: string;
  category: 'Karyawan' | 'HRD Management' | 'Sistem Admin';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PERMISSION_METADATA: PermissionMeta[] = [
  {
    code: 'CLOCK_IN_WFH',
    label: 'Absen WFH (Clock In / Out)',
    category: 'Karyawan',
    description: 'Mengizinkan pengguna melakukan presensi WFH dengan foto & lokasi GPS real-time.',
    icon: CalendarCheck,
  },
  {
    code: 'VIEW_PERSONAL_HISTORY',
    label: 'History Absensi Saya',
    category: 'Karyawan',
    description: 'Mengizinkan pengguna melihat riwayat dan statistik presensi pribadi.',
    icon: UserCheck,
  },
  {
    code: 'VIEW_HRD_MONITORING',
    label: 'Monitoring Absensi HRD',
    category: 'HRD Management',
    description: 'Membuka dashboard pemantauan absensi seluruh karyawan perusahaan & verifikasi tim.',
    icon: Shield,
  },
  {
    code: 'MANAGE_EMPLOYEES',
    label: 'Data Master Karyawan',
    category: 'HRD Management',
    description: 'Mengelola biodata karyawan, struktur divisi, posisi jabatan, & import bulk Excel.',
    icon: Users,
  },
  {
    code: 'EXPORT_ATTENDANCE_REPORTS',
    label: 'Export Laporan (CSV / Excel)',
    category: 'HRD Management',
    description: 'Mengunduh laporan rekapitulasi kehadiran karyawan dalam format spreadsheet.',
    icon: Download,
  },
  {
    code: 'MANAGE_MENU_ACCESS',
    label: 'Konfigurasi Akses Menu',
    category: 'Sistem Admin',
    description: 'Mengubah matrik hak akses menu dan permission RBAC untuk seluruh role pengguna.',
    icon: Sliders,
  },
];

export const MenuAccessConfig: React.FC = () => {
  const { rolePermissions, updateRolePermission, resetRolePermissions, currentUser } = useAuth();
  const { showToast } = useApp();

  const handleToggle = (role: Role, permission: Permission, currentEnabled: boolean) => {
    // Prevent locking yourself out of MANAGE_MENU_ACCESS if HRD_ADMIN
    if (role === 'HRD_ADMIN' && permission === 'MANAGE_MENU_ACCESS' && currentEnabled) {
      if (currentUser.role === 'HRD_ADMIN') {
        showToast('Izin Konfigurasi Menu untuk HRD Admin tidak boleh dinonaktifkan agar akses tidak terkunci!', 'warning');
        return;
      }
    }

    updateRolePermission(role, permission, !currentEnabled);
    const roleLabel = role === 'HRD_ADMIN' ? 'HRD Admin' : 'Karyawan';
    const permMeta = PERMISSION_METADATA.find((p) => p.code === permission);
    
    showToast(
      `Hak Akses "${permMeta?.label || permission}" untuk ${roleLabel} berhasil ${
        !currentEnabled ? 'DIBUKA' : 'DITUTUP'
      }.`,
      !currentEnabled ? 'success' : 'info'
    );
  };

  const handleReset = () => {
    resetRolePermissions();
    showToast('Matrik hak akses menu berhasil dikembalikan ke standar Enterprise Default.', 'info');
  };

  const applyPreset = (presetType: 'DEFAULT' | 'OPEN_COLLAB' | 'STRICT') => {
    if (presetType === 'DEFAULT') {
      resetRolePermissions();
      showToast('Preset Standar Enterprise diterapkan.', 'success');
    } else if (presetType === 'OPEN_COLLAB') {
      PERMISSION_METADATA.forEach((meta) => {
        updateRolePermission('KARYAWAN', meta.code, true);
        updateRolePermission('HRD_ADMIN', meta.code, true);
      });
      showToast('Preset Transparan: Seluruh menu dibuka untuk Karyawan dan HRD Admin.', 'info');
    } else if (presetType === 'STRICT') {
      updateRolePermission('KARYAWAN', 'CLOCK_IN_WFH', true);
      updateRolePermission('KARYAWAN', 'VIEW_PERSONAL_HISTORY', true);
      updateRolePermission('KARYAWAN', 'VIEW_HRD_MONITORING', false);
      updateRolePermission('KARYAWAN', 'MANAGE_EMPLOYEES', false);
      updateRolePermission('KARYAWAN', 'EXPORT_ATTENDANCE_REPORTS', false);
      updateRolePermission('KARYAWAN', 'MANAGE_MENU_ACCESS', false);

      updateRolePermission('HRD_ADMIN', 'CLOCK_IN_WFH', true);
      updateRolePermission('HRD_ADMIN', 'VIEW_PERSONAL_HISTORY', true);
      updateRolePermission('HRD_ADMIN', 'VIEW_HRD_MONITORING', true);
      updateRolePermission('HRD_ADMIN', 'MANAGE_EMPLOYEES', true);
      updateRolePermission('HRD_ADMIN', 'EXPORT_ATTENDANCE_REPORTS', true);
      updateRolePermission('HRD_ADMIN', 'MANAGE_MENU_ACCESS', true);
      showToast('Preset Ketat Enterprise diterapkan.', 'success');
    }
  };

  const karyawanPerms = rolePermissions['KARYAWAN'] || [];
  const hrdPerms = rolePermissions['HRD_ADMIN'] || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#121215] border border-zinc-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-0.5 rounded uppercase flex items-center gap-1">
                <Key className="w-3 h-3" />
                Role-Based Access Control (RBAC)
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded">
                Dynamic Menu Navigation
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight flex items-center gap-3">
              <Sliders className="w-8 h-8 text-indigo-400 shrink-0" />
              <span>Konfigurasi Hak Akses Menu</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Atur dan kelola izin navigasi menu serta fitur operasional secara dinamis. Perubahan pada matrik ini akan langsung berpengaruh pada visibilitas menu navigasi seluruh pengguna secara real-time.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-3 shrink-0">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center gap-2 border border-zinc-700 transition-all cursor-pointer shadow-lg"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Reset Ke Standard Default</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-zinc-800/80">
          <div className="bg-[#09090b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Total Fitur & Menu</p>
              <p className="text-xl font-bold font-mono text-zinc-100 mt-0.5">
                {PERMISSION_METADATA.length} Item
              </p>
            </div>
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#09090b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Akses Role Karyawan</p>
              <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                {karyawanPerms.length} / {PERMISSION_METADATA.length} Fitur
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#09090b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Akses Role HRD Admin</p>
              <p className="text-xl font-bold font-mono text-indigo-400 mt-0.5">
                {hrdPerms.length} / {PERMISSION_METADATA.length} Fitur
              </p>
            </div>
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Preset Action Bar */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-200">Template / Preset Matrik Akses Cepat</h3>
            <p className="text-[11px] text-zinc-400">Pilih opsi konfigurasi instan sesuai kebutuhan organisasi</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applyPreset('DEFAULT')}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-all cursor-pointer"
          >
            Standar Default
          </button>
          <button
            onClick={() => applyPreset('STRICT')}
            className="px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 text-xs font-mono transition-all cursor-pointer"
          >
            Ketat (Strict HRD)
          </button>
          <button
            onClick={() => applyPreset('OPEN_COLLAB')}
            className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 text-xs font-mono transition-all cursor-pointer"
          >
            Open Access (Transparan)
          </button>
        </div>
      </div>

      {/* Permission Matrix Table */}
      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Matrik Hak Akses Menu & Navigasi
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Centang / aktifkan kotak untuk memberikan akses menu pada role tertentu.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Info className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Perubahan tersimpan secara otomatis</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#09090b] text-zinc-400 font-mono border-b border-zinc-800">
              <tr>
                <th className="py-4 px-6 min-w-[280px]">Menu / Fitur System</th>
                <th className="py-4 px-6 min-w-[240px]">Kategori & Deskripsi</th>
                <th className="py-4 px-6 text-center w-40">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-emerald-400">KARYAWAN</span>
                    <span className="text-[10px] text-zinc-500 font-normal">Role Standard</span>
                  </div>
                </th>
                <th className="py-4 px-6 text-center w-40">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-indigo-400">HRD ADMIN</span>
                    <span className="text-[10px] text-zinc-500 font-normal">Super User / Admin</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-[#0c0c0e]">
              {PERMISSION_METADATA.map((meta) => {
                const IconComponent = meta.icon;
                const isKaryawanEnabled = karyawanPerms.includes(meta.code);
                const isHrdEnabled = hrdPerms.includes(meta.code);

                return (
                  <tr key={meta.code} className="hover:bg-zinc-900/50 transition-colors">
                    {/* Feature Title & Code */}
                    <td className="py-4 px-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-indigo-400 shrink-0 mt-0.5">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-100 text-sm">{meta.label}</p>
                          <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                            ID Permission: <code className="text-indigo-400">{meta.code}</code>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category & Description */}
                    <td className="py-4 px-6">
                      <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-800 text-zinc-300 mb-1 border border-zinc-700">
                        {meta.category}
                      </span>
                      <p className="text-zinc-400 text-xs leading-relaxed">{meta.description}</p>
                    </td>

                    {/* Karyawan Role Checkbox */}
                    <td className="py-4 px-6 text-center align-middle">
                      <label className="inline-flex flex-col items-center justify-center cursor-pointer p-2 rounded-xl hover:bg-zinc-800/50 transition-all">
                        <input
                          type="checkbox"
                          checked={isKaryawanEnabled}
                          onChange={() => handleToggle('KARYAWAN', meta.code, isKaryawanEnabled)}
                          className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                        />
                        <span
                          className={`text-[10px] font-mono font-bold mt-1.5 ${
                            isKaryawanEnabled ? 'text-emerald-400' : 'text-zinc-600'
                          }`}
                        >
                          {isKaryawanEnabled ? 'IZIN AKTIF' : 'TERKUNCI'}
                        </span>
                      </label>
                    </td>

                    {/* HRD Admin Role Checkbox */}
                    <td className="py-4 px-6 text-center align-middle">
                      <label className="inline-flex flex-col items-center justify-center cursor-pointer p-2 rounded-xl hover:bg-zinc-800/50 transition-all">
                        <input
                          type="checkbox"
                          checked={isHrdEnabled}
                          onChange={() => handleToggle('HRD_ADMIN', meta.code, isHrdEnabled)}
                          className="w-5 h-5 accent-indigo-500 rounded cursor-pointer"
                        />
                        <span
                          className={`text-[10px] font-mono font-bold mt-1.5 ${
                            isHrdEnabled ? 'text-indigo-400' : 'text-zinc-600'
                          }`}
                        >
                          {isHrdEnabled ? 'IZIN AKTIF' : 'TERKUNCI'}
                        </span>
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info notice */}
        <div className="p-4 bg-[#09090b] border-t border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>
              Setiap menu yang dinonaktifkan untuk suatu role akan secara otomatis disembunyikan dari bar navigasi Navbar.
            </span>
          </div>
          <span className="font-mono text-[11px] text-zinc-500">Persisted in LocalStorage</span>
        </div>
      </div>
    </div>
  );
};
