import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { AttendanceRecord, LeaveRequest } from '../../types';
import { AttendanceDetailModal } from './AttendanceDetailModal';
import { AttendanceAnalyticsModal } from './AttendanceAnalyticsModal';
import { formatIndonesianDate, getTodayDateString } from '../../utils/dateUtils';
import { exportAttendanceToCSV, exportLeaveRequestsToCSV } from '../../utils/exportUtils';
import { attendanceService } from '../../services/attendanceService';
import { leaveService } from '../../services/leaveService';
import { Pagination } from '../common/Pagination';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Eye,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Users,
  TrendingUp,
  BarChart2,
  FileSpreadsheet,
  Check,
  X,
  FileText,
  PieChart as PieIcon,
  Building2,
  BarChart3,
  Loader2,
} from 'lucide-react';

export const AttendanceMonitoring: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    attendanceRecords,
    leaveRequests,
    updateLeaveStatus,
    showToast,
    addAuditLog,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedDateRange, setSelectedDateRange] = useState<'TODAY' | 'ALL'>('TODAY');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDetailRecord, setSelectedDetailRecord] = useState<AttendanceRecord | null>(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'PRESENSI' | 'PERMOHONAN_CUTI'>('PRESENSI');

  // Backend fetched records
  const [fetchedMonitoring, setFetchedMonitoring] = useState<AttendanceRecord[]>([]);
  const [fetchedLeaveRequests, setFetchedLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoadingMonitoring, setIsLoadingMonitoring] = useState(false);
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(false);

  // Pagination states for Presensi & Cuti
  const [currentPagePresensi, setCurrentPagePresensi] = useState(1);
  const [itemsPerPagePresensi, setItemsPerPagePresensi] = useState(5);

  const [currentPageCuti, setCurrentPageCuti] = useState(1);
  const [itemsPerPageCuti, setItemsPerPageCuti] = useState(5);

  const todayStr = getTodayDateString();

  // Fetch monitoring records from API Gateway
  const fetchMonitoringData = async () => {
    setIsLoadingMonitoring(true);
    try {
      const records = await attendanceService.getHrdMonitoring(searchQuery, selectedDept);
      if (records.length > 0) {
        setFetchedMonitoring(records);
      }
    } catch (err) {
      console.warn('API getHrdMonitoring fallback to local context state');
    } finally {
      setIsLoadingMonitoring(false);
    }
  };

  // Fetch leave requests from API Gateway for HRD Approval
  const fetchLeaveData = async () => {
    setIsLoadingLeaves(true);
    try {
      const leaves = await leaveService.getAllLeaveRequests();
      if (leaves.length > 0) {
        setFetchedLeaveRequests(leaves);
      }
    } catch (err) {
      console.warn('API getAllLeaveRequests fallback to local context state');
    } finally {
      setIsLoadingLeaves(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
    fetchLeaveData();
  }, [selectedDept]);

  useEffect(() => {
    setCurrentPagePresensi(1);
    setCurrentPageCuti(1);
  }, [searchQuery, selectedDept, selectedDateRange, selectedStatus]);

  // Combined source (prefer fetched API, fallback to context state)
  const activeRecordsSource = fetchedMonitoring.length > 0 ? fetchedMonitoring : attendanceRecords;
  const activeLeavesSource = fetchedLeaveRequests.length > 0 ? fetchedLeaveRequests : leaveRequests;

  // Filter Attendance Logs
  const filteredRecords = activeRecordsSource.filter((record) => {
    const matchesSearch =
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employeeNip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.workPlan.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'ALL' || record.department === selectedDept;
    const matchesDate = selectedDateRange === 'ALL' || record.date === todayStr;
    const matchesStatus = selectedStatus === 'ALL' || record.status === selectedStatus;

    return matchesSearch && matchesDept && matchesDate && matchesStatus;
  });

  // Calculate Paginated Presensi
  const totalPagesPresensi = Math.ceil(filteredRecords.length / itemsPerPagePresensi);
  const paginatedRecords = filteredRecords.slice(
    (currentPagePresensi - 1) * itemsPerPagePresensi,
    currentPagePresensi * itemsPerPagePresensi
  );

  // Calculate Paginated Leave Requests
  const totalPagesCuti = Math.ceil(activeLeavesSource.length / itemsPerPageCuti);
  const paginatedLeaveRequests = activeLeavesSource.slice(
    (currentPageCuti - 1) * itemsPerPageCuti,
    currentPageCuti * itemsPerPageCuti
  );

  // Handle HRD Approval (Setujui / Tolak) with Backend API integration
  const handleApproval = async (req: LeaveRequest, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      const updated = await leaveService.updateStatus(req.id, { status: newStatus });
      setFetchedLeaveRequests((prev) =>
        prev.map((item) => (item.id === req.id ? { ...item, status: newStatus } : item))
      );
      updateLeaveStatus(req.id, newStatus);
      showToast(
        `Permohonan ${req.employeeName} (${req.type.replace(/_/g, ' ')}) berhasil ${
          newStatus === 'APPROVED' ? 'DISETUJUI' : 'DITOLAK'
        }!`,
        newStatus === 'APPROVED' ? 'success' : 'info'
      );
      
      addAuditLog({
        actor: currentUser?.name || 'HRD Admin',
        action: 'UPDATE',
        target: `Permohonan Cuti/Izin: ${req.employeeName}`,
        details: `Telah ${newStatus === 'APPROVED' ? 'MENYETUJUI' : 'MENOLAK'} permohonan izin/cuti`,
        category: 'ATTENDANCE',
      });
    } catch (err: any) {
      updateLeaveStatus(req.id, newStatus);
      showToast(
        `Permohonan ${req.employeeName} (${req.type.replace(/_/g, ' ')}) ${
          newStatus === 'APPROVED' ? 'DISETUJUI' : 'DITOLAK'
        }`,
        newStatus === 'APPROVED' ? 'success' : 'info'
      );
    }
  };

  // Calculate Metrics
  const totalTodayRecords = activeRecordsSource.filter((r) => r.date === todayStr).length;
  const totalOnTimeToday = activeRecordsSource.filter((r) => r.date === todayStr && r.status === 'ON_TIME').length;
  const totalLateToday = activeRecordsSource.filter((r) => r.date === todayStr && r.status === 'LATE').length;
  const totalCompletedToday = activeRecordsSource.filter((r) => r.date === todayStr && r.clockOutTime).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-0.5 rounded uppercase">
              Dashboard Operasional HRD
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-zinc-100 mt-1 flex items-center gap-2.5 tracking-tight">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Monitoring & Kontrol Absensi WFH
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Admin HRD dapat mengontrol bukti foto, lokasi, jam masuk, serta persetujuan izin/cuti
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAnalyticsOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-bold flex items-center gap-2 border border-indigo-500/30 transition-all shadow-md cursor-pointer"
          >
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            <span>Dashboard Analitik</span>
          </button>

          <button
            onClick={() => {
              if (activeSubTab === 'PRESENSI') {
                exportAttendanceToCSV(filteredRecords);
              } else {
                exportLeaveRequestsToCSV(activeLeavesSource);
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-[#121215] hover:bg-zinc-800 text-zinc-200 text-xs font-mono font-semibold flex items-center gap-2 border border-zinc-800 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Subtabs Switcher */}
      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3 max-w-full overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('PRESENSI')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'PRESENSI'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Monitoring Presensi Masuk & Pulang ({activeRecordsSource.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('PERMOHONAN_CUTI')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'PERMOHONAN_CUTI'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Approval Cuti & Tukar WFH ({activeLeavesSource.length})</span>
        </button>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0c0c0e] border border-zinc-800 p-4 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Absen Hari Ini</p>
            <p className="text-2xl font-extrabold text-zinc-100 mt-1 font-mono">{totalTodayRecords} Karyawan</p>
          </div>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0c0c0e] border border-zinc-800 p-4 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Hadir Tepat Waktu</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">{totalOnTimeToday} Orang</p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0c0c0e] border border-zinc-800 p-4 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Terlambat Masuk</p>
            <p className="text-2xl font-extrabold text-rose-400 mt-1 font-mono">{totalLateToday} Orang</p>
          </div>
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0c0c0e] border border-zinc-800 p-4 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Sudah Absen Pulang</p>
            <p className="text-2xl font-extrabold text-sky-400 mt-1 font-mono">{totalCompletedToday} Orang</p>
          </div>
          <div className="p-3 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Subtab Content Viewports */}
      {activeSubTab === 'PRESENSI' ? (
        <>
          {/* Attendance Audit Log Table */}
          <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto no-scrollbar">
              <table className="min-w-[950px] w-full text-left text-xs text-zinc-300">
                <thead className="bg-[#09090b] uppercase font-mono font-bold text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="py-4 px-6 whitespace-nowrap">Bukti Capture Foto</th>
                    <th className="py-4 px-6 whitespace-nowrap">Karyawan & NIP</th>
                    <th className="py-4 px-6 whitespace-nowrap">Tanggal & Jam Absen</th>
                    <th className="py-4 px-6 whitespace-nowrap">Lokasi GPS WFH</th>
                    <th className="py-4 px-6 whitespace-nowrap">Rencana Kerja (Work Plan)</th>
                    <th className="py-4 px-6 whitespace-nowrap">Status</th>
                    <th className="py-4 px-6 text-right whitespace-nowrap">Kontrol HRD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {isLoadingMonitoring ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-500 font-mono">
                        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto mb-2" />
                        <span>Memuat data absensi karyawan...</span>
                      </td>
                    </tr>
                  ) : paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-500 font-mono">
                        Tidak ditemukan data absensi yang memenuhi kriteria filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3 px-6 whitespace-nowrap">
                          <div className="w-14 h-12 rounded-lg overflow-hidden bg-[#09090b] border border-zinc-800 shrink-0">
                            <img
                              src={record.photoProofUrl}
                              alt="Foto Absen"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap">
                          <p className="font-bold text-zinc-100 text-sm whitespace-nowrap">{record.employeeName}</p>
                          <p className="font-mono text-[11px] text-indigo-400 font-semibold whitespace-nowrap">
                            {record.employeeNip}
                          </p>
                          <p className="text-[10px] text-zinc-400 whitespace-nowrap">{record.department}</p>
                        </td>

                        <td className="py-4 px-6 space-y-1 font-mono whitespace-nowrap">
                          <p className="font-semibold text-zinc-200 whitespace-nowrap">{record.date}</p>
                          <p className="text-emerald-400 font-bold text-[11px] flex items-center gap-1 whitespace-nowrap">
                            <Clock className="w-3 h-3 shrink-0" /> Masuk: {record.clockInTime} WIB
                          </p>
                          {record.clockOutTime && (
                            <p className="text-sky-300 font-bold text-[11px] whitespace-nowrap">
                              Pulang: {record.clockOutTime} WIB
                            </p>
                          )}
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap">
                          <p className="text-zinc-300 flex items-center gap-1 max-w-xs whitespace-nowrap">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{record.location.address}</span>
                          </p>
                        </td>

                        <td className="py-4 px-6">
                          <p className="text-zinc-300 text-[11px] bg-[#09090b] p-2 rounded-lg border border-zinc-800 max-w-xs line-clamp-2">
                            {record.workPlan}
                          </p>
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold inline-flex items-center gap-1 whitespace-nowrap ${
                              record.status === 'ON_TIME' || record.status === 'WORK_COMPLETED'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                record.status === 'ON_TIME' || record.status === 'WORK_COMPLETED'
                                  ? 'bg-emerald-400'
                                  : 'bg-rose-400'
                              }`}
                            />
                            {record.status === 'ON_TIME'
                              ? 'TEPAT WAKTU'
                              : record.status === 'WORK_COMPLETED'
                              ? 'KERJA SELESAI'
                              : 'TERLAMBAT'}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedDetailRecord(record)}
                            className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ml-auto cursor-pointer whitespace-nowrap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detail Foto & GPS</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Component */}
            <Pagination
              currentPage={currentPagePresensi}
              totalPages={totalPagesPresensi}
              totalItems={filteredRecords.length}
              itemsPerPage={itemsPerPagePresensi}
              onPageChange={setCurrentPagePresensi}
              onItemsPerPageChange={setItemsPerPagePresensi}
            />
          </div>
        </>
      ) : (
        /* Leave Requests Approval View */
        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto no-scrollbar">
            <table className="min-w-[900px] w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#09090b] uppercase font-mono font-bold text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-4 px-6 whitespace-nowrap">Karyawan</th>
                  <th className="py-4 px-6 whitespace-nowrap">Tipe Permohonan</th>
                  <th className="py-4 px-6 whitespace-nowrap">Tanggal Periode</th>
                  <th className="py-4 px-6 whitespace-nowrap">Alasan / Catatan</th>
                  <th className="py-4 px-6 whitespace-nowrap">Status Approval</th>
                  <th className="py-4 px-6 text-right whitespace-nowrap">Aksi HRD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {isLoadingLeaves ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500 font-mono">
                      <Loader2 className="w-6 h-6 text-amber-400 animate-spin mx-auto mb-2" />
                      <span>Memuat data pengajuan cuti...</span>
                    </td>
                  </tr>
                ) : paginatedLeaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500 font-mono">
                      Belum ada permohonan cuti / izin dari karyawan.
                    </td>
                  </tr>
                ) : (
                  paginatedLeaveRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <p className="font-bold text-zinc-100 text-sm whitespace-nowrap">{req.employeeName}</p>
                        <p className="font-mono text-[11px] text-indigo-400 font-semibold whitespace-nowrap">{req.employeeNip}</p>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 inline-block whitespace-nowrap">
                          {req.type === 'CUTI' ? 'CUTI TAHUNAN' : req.type === 'SAKIT' ? 'SURAT SAKIT' : req.type === 'LEMBUR' ? 'LEMBUR WFH' : 'TUKAR HARI WFH'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-zinc-200 whitespace-nowrap">
                        {req.startDate} s/d {req.endDate}
                      </td>
                      <td className="py-4 px-6 max-w-xs">
                        <p className="text-zinc-300 line-clamp-2">{req.reason}</p>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold inline-flex items-center gap-1 whitespace-nowrap ${
                            req.status === 'APPROVED'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : req.status === 'REJECTED'
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {req.status === 'APPROVED' ? 'DISETUJUI' : req.status === 'REJECTED' ? 'DITOLAK' : 'MENUNGGU APPROVAL'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        {req.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                            <button
                              onClick={() => handleApproval(req, 'APPROVED')}
                              className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
                            >
                              <Check className="w-3.5 h-3.5" /> Setujui
                            </button>
                            <button
                              onClick={() => handleApproval(req, 'REJECTED')}
                              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
                            >
                              <X className="w-3.5 h-3.5" /> Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] font-mono text-zinc-500 whitespace-nowrap">Selesai Ditinjau</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Component for Leave Requests */}
          <Pagination
            currentPage={currentPageCuti}
            totalPages={totalPagesCuti}
            totalItems={activeLeavesSource.length}
            itemsPerPage={itemsPerPageCuti}
            onPageChange={setCurrentPageCuti}
            onItemsPerPageChange={setItemsPerPageCuti}
          />
        </div>
      )}

      {/* Modal Detail Rekaman Presensi */}
      <AttendanceDetailModal
        isOpen={!!selectedDetailRecord}
        onClose={() => setSelectedDetailRecord(null)}
        record={selectedDetailRecord}
      />

      {/* Modal Analytics Chart Dashboard */}
      <AttendanceAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />
    </div>
  );
};
