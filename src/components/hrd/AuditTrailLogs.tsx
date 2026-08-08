import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { auditService, AuditLogItem } from '../../services/auditService';
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
  Loader2,
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

export const AuditTrailLogs: React.FC = () => {
  const { auditLogs: localLogs } = useApp();
  const [apiLogs, setApiLogs] = useState<AuditLogItem[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Fetch Audit Logs from NestJS API
  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoadingApi(true);
      try {
        const data = await auditService.getAuditLogs(categoryFilter, searchQuery);
        if (data && data.length > 0) {
          setApiLogs(data);
        }
      } catch (err) {
        console.warn('Fallback to local audit logs');
      } finally {
        setIsLoadingApi(false);
      }
    };
    fetchLogs();
  }, [categoryFilter, searchQuery]);

  const activeLogs = apiLogs.length > 0 ? apiLogs : localLogs;

  const filteredLogs = activeLogs.filter((log) => {
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
                Fitur #5: Enterprise Security Audit Log (NestJS RBAC)
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
              <p className="text-2xl font-bold font-mono text-zinc-100 mt-0.5">{activeLogs.length} Log</p>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#09090b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Aksi HRD Management</p>
              <p className="text-2xl font-bold font-mono text-indigo-400 mt-0.5">
                {activeLogs.filter((l) => l.actorRole === 'HRD_ADMIN' || l.actorRole === 'HRD').length} Log
              </p>
            </div>
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <Key className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#09090b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Status Keamanan Audit</p>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">ACTIVE & PROTECTED</p>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <Lock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar Filter & Search */}
      <div className="bg-[#0c0c0e] border border-zinc-800/90 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Cari actor, NIP, aksi, atau detail audit log..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#09090b] border border-zinc-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#09090b] border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3.5 py-2.5 outline-none cursor-pointer"
          >
            <option value="ALL">Semua Kategori Log</option>
            <option value="KARYAWAN">Master Data Karyawan</option>
            <option value="ATTENDANCE">Presensi & Absensi WFH</option>
            <option value="LEAVE">Pengajuan Cuti & Izin</option>
            <option value="SYSTEM">Sistem & Konfigurasi</option>
            <option value="ACCESS_RIGHTS">Hak Akses & Role RBAC</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#0c0c0e] border border-zinc-800/90 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="min-w-[900px] w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#09090b] uppercase font-mono font-bold text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="py-4 px-6">Timestamp & Waktu</th>
                <th className="py-4 px-6">Pelaku Aksi (Actor)</th>
                <th className="py-4 px-6">Aksi Operasional</th>
                <th className="py-4 px-6">Kategori</th>
                <th className="py-4 px-6">Rincian Audit Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {isLoadingApi ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500 font-mono">
                    <Loader2 className="w-6 h-6 text-amber-400 animate-spin mx-auto mb-2" />
                    <span>Memuat riwayat audit trail log dari server NestJS API...</span>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500 font-mono">
                    Tidak ada catatan audit log yang cocok.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap font-mono text-[11px] text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{new Date(log.timestamp).toLocaleString('id-ID')}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <div>
                        <p className="font-bold text-zinc-200">{log.actorName}</p>
                        <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 inline-block mt-0.5">
                          {log.actorNip} ({log.actorRole})
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-mono text-xs font-bold text-indigo-400 whitespace-nowrap">
                      {log.action}
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 font-mono text-[10px] font-bold border border-zinc-700">
                        {log.category}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-zinc-300">
                      <p className="line-clamp-2">{log.details}</p>
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
