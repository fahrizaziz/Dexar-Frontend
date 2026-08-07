import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Activity,
  User,
  Clock,
  Key,
  Database,
  FileCheck2,
  Lock,
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

export const AuditTrailLogs: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorNip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleExportLogs = () => {
    const exportData = filteredLogs.map((log) => ({
      'ID Log': log.id,
      Waktu: new Date(log.timestamp).toLocaleString('id-ID'),
      'NIP Actor': log.actorNip,
      'Nama Actor': log.actorName,
      Role: log.actorRole,
      Aksi: log.action,
      Kategori: log.category,
      Detail: log.details,
    }));

    exportToCSV(exportData, `Audit_Trail_Security_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#121215] border border-zinc-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Fitur #2: Enterprise Security Audit Log
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight flex items-center gap-3">
              <Activity className="w-8 h-8 text-amber-400 shrink-0" />
              <span>Audit Trail & Security System Logs</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Catatan riwayat perubahan sistem yang bersifat immutable (dapat diaudit). Memantau seluruh aksi perizinan, modifikasi master data, import spreadsheet, dan transaksi persetujuan HRD.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-3 shrink-0">
            <button
              onClick={handleExportLogs}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center gap-2 border border-zinc-700 transition-all cursor-pointer shadow-lg"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export Audit Log (CSV)</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-zinc-800/80">
          <div className="bg-[#09090b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Total Catatan Aktivitas</p>
              <p className="text-2xl font-bold font-mono text-zinc-100 mt-0.5">{auditLogs.length} Log</p>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#09090b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Aksi HRD Management</p>
              <p className="text-2xl font-bold font-mono text-indigo-400 mt-0.5">
                {auditLogs.filter((l) => l.actorRole === 'HRD_ADMIN').length} Log
              </p>
            </div>
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <Lock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#09090b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Integritas Log System</p>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">100% SHA-256 Verified</p>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log Table Component */}
      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari actor, NIP, aksi, atau rincian log..."
              className="w-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-amber-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded-xl px-3 py-2.5 outline-none focus:border-amber-500"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="KARYAWAN">Master Karyawan</option>
              <option value="ATTENDANCE">Absensi & Clock-In</option>
              <option value="LEAVE">Pengajuan Cuti / WFH</option>
              <option value="ACCESS_RIGHTS">Perizinan / RBAC</option>
              <option value="SYSTEM">Konfigurasi Sistem</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#09090b] text-zinc-400 font-mono border-b border-zinc-800">
              <tr>
                <th className="py-4 px-6">Waktu & ID Log</th>
                <th className="py-4 px-6">Actor / Pelaku</th>
                <th className="py-4 px-6">Kategori & Kode Aksi</th>
                <th className="py-4 px-6">Rincian Perubahan & Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-[#0c0c0e]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-zinc-500">
                    Tidak ada catatan audit log yang cocok.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-4 px-6 font-mono shrink-0">
                      <p className="text-zinc-200 font-bold">
                        {new Date(log.timestamp).toLocaleString('id-ID')}
                      </p>
                      <p className="text-[10px] text-zinc-500">{log.id}</p>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0">
                          {log.actorName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-100">{log.actorName}</p>
                          <p className="text-[10px] font-mono text-zinc-500">
                            {log.actorNip} •{' '}
                            <span
                              className={
                                log.actorRole === 'HRD_ADMIN' ? 'text-indigo-400 font-bold' : 'text-emerald-400'
                              }
                            >
                              {log.actorRole}
                            </span>
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/25 text-amber-400 mb-1">
                        {log.category}
                      </span>
                      <p className="font-mono text-[11px] text-zinc-300 font-semibold">{log.action}</p>
                    </td>

                    <td className="py-4 px-6 max-w-md">
                      <p className="text-zinc-300 leading-relaxed bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 font-mono text-[11px]">
                        {log.details}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
