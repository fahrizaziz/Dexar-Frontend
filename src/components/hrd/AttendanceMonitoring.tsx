import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord, LeaveRequest } from '../../types';
import { AttendanceDetailModal } from './AttendanceDetailModal';
import { AttendanceAnalyticsModal } from './AttendanceAnalyticsModal';
import { formatIndonesianDate, getTodayDateString } from '../../utils/dateUtils';
import { exportAttendanceToCSV, exportLeaveRequestsToCSV } from '../../utils/exportUtils';
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
} from 'lucide-react';

export const AttendanceMonitoring: React.FC = () => {
  const { attendanceRecords, leaveRequests, updateLeaveStatus, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedDateRange, setSelectedDateRange] = useState<'TODAY' | 'ALL'>('TODAY');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDetailRecord, setSelectedDetailRecord] = useState<AttendanceRecord | null>(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'PRESENSI' | 'PERMOHONAN_CUTI'>('PRESENSI');

  const todayStr = getTodayDateString();

  // Filter Attendance Logs
  const filteredRecords = attendanceRecords.filter((record) => {
    const matchesSearch =
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employeeNip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.workPlan.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'ALL' || record.department === selectedDept;
    const matchesDate = selectedDateRange === 'ALL' || record.date === todayStr;
    const matchesStatus = selectedStatus === 'ALL' || record.status === selectedStatus;

    return matchesSearch && matchesDept && matchesDate && matchesStatus;
  });

  // Calculate Metrics
  const totalTodayRecords = attendanceRecords.filter((r) => r.date === todayStr).length;
  const totalOnTimeToday = attendanceRecords.filter((r) => r.date === todayStr && r.status === 'ON_TIME').length;
  const totalLateToday = attendanceRecords.filter((r) => r.date === todayStr && r.status === 'LATE').length;
  const totalCompletedToday = attendanceRecords.filter((r) => r.date === todayStr && r.clockOutTime).length;

  // Visual Chart Data Calculations
  const totalAllRecords = attendanceRecords.length;
  const onTimeCount = attendanceRecords.filter((r) => r.status === 'ON_TIME' || r.status === 'WORK_COMPLETED').length;
  const lateCount = attendanceRecords.filter((r) => r.status === 'LATE').length;
  const approvedLeaves = leaveRequests.filter((l) => l.status === 'APPROVED').length;
  const summaryCompletedCount = attendanceRecords.filter((r) => Boolean(r.workSummary)).length;

  const onTimePercentage = totalAllRecords > 0 ? Math.round((onTimeCount / totalAllRecords) * 100) : 100;
  const summaryPercentage = totalAllRecords > 0 ? Math.round((summaryCompletedCount / totalAllRecords) * 100) : 0;
  const latePercentage = totalAllRecords > 0 ? Math.round((lateCount / totalAllRecords) * 100) : 0;

  // Attendance Charts
  const statusPieData = [
    { name: 'Tepat Waktu', value: onTimeCount, color: '#10b981' },
    { name: 'Terlambat', value: lateCount, color: '#f43f5e' },
    { name: 'Cuti / Izin', value: approvedLeaves, color: '#f59e0b' },
  ];

  const deptStatsData = [
    'Engineering & Tech',
    'Product & Design',
    'Human Resources',
    'Marketing & Sales',
    'Finance & Accounting',
  ].map((dept) => {
    const count = attendanceRecords.filter((r) => r.department === dept).length;
    const shortName = dept.split('&')[0].trim();
    return { name: shortName, Presensi: count };
  });

  // Leave & Permit Requests Stats
  const totalLeaveRequests = leaveRequests.length;
  const pendingLeaveRequests = leaveRequests.filter((l) => l.status === 'PENDING').length;
  const approvedLeaveRequests = leaveRequests.filter((l) => l.status === 'APPROVED').length;
  const rejectedLeaveRequests = leaveRequests.filter((l) => l.status === 'REJECTED').length;

  const approvedRatio = totalLeaveRequests > 0 ? Math.round((approvedLeaveRequests / totalLeaveRequests) * 100) : 0;
  const pendingRatio = totalLeaveRequests > 0 ? Math.round((pendingLeaveRequests / totalLeaveRequests) * 100) : 0;
  const rejectedRatio = totalLeaveRequests > 0 ? Math.round((rejectedLeaveRequests / totalLeaveRequests) * 100) : 0;

  const leaveStatusPieData = [
    { name: 'Disetujui', value: approvedLeaveRequests, color: '#10b981' },
    { name: 'Menunggu', value: pendingLeaveRequests, color: '#f59e0b' },
    { name: 'Ditolak', value: rejectedLeaveRequests, color: '#f43f5e' },
  ];

  const leaveTypeBarData = [
    { name: 'Cuti Tahunan', Permohonan: leaveRequests.filter((l) => l.type === 'CUTI').length },
    { name: 'Izin Sakit', Permohonan: leaveRequests.filter((l) => l.type === 'SAKIT').length },
    { name: 'Tukar WFH', Permohonan: leaveRequests.filter((l) => l.type === 'TUKAR_WFH').length },
    { name: 'Lembur WFH', Permohonan: leaveRequests.filter((l) => l.type === 'LEMBUR').length },
  ];

  const exportToCSV = () => {
    const headers = ['ID Absen', 'NIP Karyawan', 'Nama Karyawan', 'Departemen', 'Tanggal', 'Jam Masuk', 'Jam Pulang', 'Status', 'Lokasi WFH', 'Rencana Kerja'];
    const rows = filteredRecords.map((r) => [
      r.id,
      r.employeeNip,
      `"${r.employeeName}"`,
      `"${r.department}"`,
      r.date,
      r.clockInTime,
      r.clockOutTime || '-',
      r.status,
      `"${r.location.address}"`,
      `"${r.workPlan.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Kontrol_Absensi_WFH_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan kontrol absensi WFH berhasil di-export ke CSV!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2 tracking-tight">
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
            className="px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-bold flex items-center gap-2 border border-indigo-500/30 transition-all shadow-md"
          >
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            <span>Dashboard Analitik</span>
          </button>

          <button
            onClick={() => {
              if (activeSubTab === 'PRESENSI') {
                exportAttendanceToCSV(filteredRecords);
              } else {
                exportLeaveRequestsToCSV(leaveRequests);
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-[#121215] hover:bg-zinc-800 text-zinc-200 text-xs font-mono font-semibold flex items-center gap-2 border border-zinc-800 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Subtabs Switcher */}
      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
        <button
          onClick={() => setActiveSubTab('PRESENSI')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'PRESENSI'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Monitor Presensi WFH</span>
        </button>

        <button
          onClick={() => setActiveSubTab('PERMOHONAN_CUTI')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'PERMOHONAN_CUTI'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-amber-400" />
          <span>Persetujuan Cuti & Permohonan WFH</span>
          {leaveRequests.filter((l) => l.status === 'PENDING').length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-zinc-950 font-mono text-[10px] font-extrabold">
              {leaveRequests.filter((l) => l.status === 'PENDING').length}
            </span>
          )}
        </button>
      </div>

      {/* Analytics KPI Stat Cards */}
      {activeSubTab === 'PRESENSI' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0c0c0e] border border-zinc-800 p-5 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-400">Total WFH Hari Ini</p>
              <p className="text-2xl font-mono font-extrabold text-zinc-100 mt-0.5">{totalTodayRecords} Orang</p>
            </div>
          </div>

          <div className="bg-[#0c0c0e] border border-zinc-800 p-5 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-400">Absen Tepat Waktu</p>
              <p className="text-2xl font-mono font-extrabold text-emerald-400 mt-0.5">{totalOnTimeToday} Orang</p>
            </div>
          </div>

          <div className="bg-[#0c0c0e] border border-zinc-800 p-5 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-400">Terlambat Absen</p>
              <p className="text-2xl font-mono font-extrabold text-amber-400 mt-0.5">{totalLateToday} Orang</p>
            </div>
          </div>

          <div className="bg-[#0c0c0e] border border-zinc-800 p-5 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-400">Sudah Absen Pulang</p>
              <p className="text-2xl font-mono font-extrabold text-sky-400 mt-0.5">{totalCompletedToday} Orang</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0c0c0e] border border-zinc-800 p-5 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-400">Total Permohonan</p>
              <p className="text-2xl font-mono font-extrabold text-zinc-100 mt-0.5">{totalLeaveRequests} Pengajuan</p>
            </div>
          </div>

          <div className="bg-[#0c0c0e] border border-zinc-800 p-5 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-400">Menunggu Approval</p>
              <p className="text-2xl font-mono font-extrabold text-amber-400 mt-0.5">{pendingLeaveRequests} Permohonan</p>
            </div>
          </div>

          <div className="bg-[#0c0c0e] border border-zinc-800 p-5 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-400">Disetujui HRD</p>
              <p className="text-2xl font-mono font-extrabold text-emerald-400 mt-0.5">{approvedLeaveRequests} Permohonan</p>
            </div>
          </div>

          <div className="bg-[#0c0c0e] border border-zinc-800 p-5 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <X className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-400">Ditolak HRD</p>
              <p className="text-2xl font-mono font-extrabold text-rose-400 mt-0.5">{rejectedLeaveRequests} Permohonan</p>
            </div>
          </div>
        </div>
      )}

      {/* Visual Analytics Section (Donut Chart, Bar Chart & Progress Indicators) */}
      {activeSubTab === 'PRESENSI' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Donut Chart: Status Distribution */}
          <div className="bg-[#0c0c0e] border border-zinc-800 p-5 rounded-2xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
              <h3 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-400" />
                <span>Distribusi Status Kehadiran</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                Interaktif
              </span>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', color: '#f4f4f5' }}
                  />
                  <Legend verticalAlign="bottom" height={32} wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Department Breakdown */}
          <div className="bg-[#0c0c0e] border border-zinc-800 p-5 rounded-2xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
              <h3 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>Volume Presensi per Departemen</span>
              </h3>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                Bar Chart
              </span>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptStatsData} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', color: '#f4f4f5' }}
                  />
                  <Bar dataKey="Presensi" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Progress Bars & Ratios */}
          <div className="bg-[#0c0c0e] border border-zinc-800 p-5 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
              <h3 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>Indikator Rasio & Progress</span>
              </h3>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                KPI Rates
              </span>
            </div>

            <div className="space-y-4 py-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300 font-medium">Clock-In On-Time Rate</span>
                  <span className="font-mono text-emerald-400 font-extrabold">{onTimePercentage}%</span>
                </div>
                <div className="w-full bg-zinc-800/90 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${onTimePercentage}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300 font-medium">Keterisian Work Summary</span>
                  <span className="font-mono text-indigo-400 font-extrabold">{summaryPercentage}%</span>
                </div>
                <div className="w-full bg-zinc-800/90 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${summaryPercentage}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300 font-medium">Tingkat Keterlambatan</span>
                  <span className="font-mono text-rose-400 font-extrabold">{latePercentage}%</span>
                </div>
                <div className="w-full bg-zinc-800/90 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${latePercentage}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Donut Chart: Status Permohonan Cuti */}
          <div className="bg-[#0c0c0e] border border-zinc-800 p-5 rounded-2xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
              <h3 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-amber-400" />
                <span>Distribusi Status Permohonan</span>
              </h3>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                Approval Status
              </span>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leaveStatusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {leaveStatusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', color: '#f4f4f5' }}
                  />
                  <Legend verticalAlign="bottom" height={32} wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Permohonan Berdasarkan Tipe */}
          <div className="bg-[#0c0c0e] border border-zinc-800 p-5 rounded-2xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
              <h3 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                <span>Permohonan per Tipe Kategori</span>
              </h3>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                Tipe Permohonan
              </span>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leaveTypeBarData} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', color: '#f4f4f5' }}
                  />
                  <Bar dataKey="Permohonan" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Progress Bars: Approval Ratios */}
          <div className="bg-[#0c0c0e] border border-zinc-800 p-5 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
              <h3 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Rasio Persetujuan HRD</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                Approval Rate
              </span>
            </div>

            <div className="space-y-4 py-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300 font-medium">Tingkat Persetujuan (Approved Rate)</span>
                  <span className="font-mono text-emerald-400 font-extrabold">{approvedRatio}%</span>
                </div>
                <div className="w-full bg-zinc-800/90 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${approvedRatio}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300 font-medium">Permohonan Pending (Antrean)</span>
                  <span className="font-mono text-amber-400 font-extrabold">{pendingRatio}%</span>
                </div>
                <div className="w-full bg-zinc-800/90 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${pendingRatio}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300 font-medium">Tingkat Penolakan (Rejected Rate)</span>
                  <span className="font-mono text-rose-400 font-extrabold">{rejectedRatio}%</span>
                </div>
                <div className="w-full bg-zinc-800/90 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${rejectedRatio}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-[#0c0c0e] border border-zinc-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Karyawan, NIP, atau Rencana Kerja..."
            className="w-full bg-[#09090b] border border-zinc-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-[#09090b] border border-zinc-800 px-3 py-1.5 rounded-xl text-xs font-mono">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value as 'TODAY' | 'ALL')}
              className="bg-transparent text-zinc-200 outline-none cursor-pointer text-xs"
            >
              <option value="TODAY">Hari Ini ({todayStr})</option>
              <option value="ALL">Semua Tanggal History</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2 bg-[#09090b] border border-zinc-800 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent text-zinc-200 outline-none cursor-pointer text-xs"
            >
              <option value="ALL">Semua Departemen</option>
              <option value="Engineering & Tech">Engineering & Tech</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Product & Design">Product & Design</option>
              <option value="Marketing & Sales">Marketing & Sales</option>
              <option value="Finance & Accounting">Finance & Accounting</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-[#09090b] border border-zinc-800 px-3 py-1.5 rounded-xl text-xs">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-zinc-200 outline-none cursor-pointer text-xs"
            >
              <option value="ALL">Semua Status</option>
              <option value="ON_TIME">Tepat Waktu</option>
              <option value="LATE">Terlambat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subtab Content Viewports */}
      {activeSubTab === 'PRESENSI' ? (
        <>
          {/* Attendance Audit Log Table */}
          <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-[#09090b] uppercase font-mono font-bold text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="py-4 px-6">Bukti Capture Foto</th>
                    <th className="py-4 px-6">Karyawan & NIP</th>
                    <th className="py-4 px-6">Tanggal & Jam Absen</th>
                    <th className="py-4 px-6">Lokasi GPS WFH</th>
                    <th className="py-4 px-6">Rencana Kerja (Work Plan)</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Kontrol HRD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-500">
                        Tidak ditemukan data absensi yang memenuhi kriteria filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3 px-6">
                          <div className="w-14 h-12 rounded-lg overflow-hidden bg-[#09090b] border border-zinc-800 shrink-0">
                            <img
                              src={record.photoProofUrl}
                              alt="Foto Absen"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <p className="font-bold text-zinc-100 text-sm">{record.employeeName}</p>
                          <p className="font-mono text-[11px] text-indigo-400 font-semibold">
                            {record.employeeNip}
                          </p>
                          <p className="text-[10px] text-zinc-400">{record.department}</p>
                        </td>

                        <td className="py-4 px-6 space-y-1 font-mono">
                          <p className="font-semibold text-zinc-200">{record.date}</p>
                          <p className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Masuk: {record.clockInTime} WIB
                          </p>
                          {record.clockOutTime && (
                            <p className="text-sky-300 font-bold text-[11px]">
                              Pulang: {record.clockOutTime} WIB
                            </p>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          <p className="text-zinc-300 flex items-center gap-1 line-clamp-1 max-w-xs">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            {record.location.address}
                          </p>
                        </td>

                        <td className="py-4 px-6">
                          <p className="text-zinc-300 line-clamp-2 max-w-xs text-[11px] bg-[#09090b] p-2 rounded-lg border border-zinc-800">
                            {record.workPlan}
                          </p>
                        </td>

                        <td className="py-4 px-6">
                          {record.status === 'LATE' ? (
                            <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-300 border border-amber-500/25 px-2.5 py-1 rounded text-[11px] font-mono font-bold">
                              Terlambat
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 px-2.5 py-1 rounded text-[11px] font-mono font-bold">
                              Tepat Waktu
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedDetailRecord(record)}
                            className="px-3 py-1.5 bg-[#121215] hover:bg-zinc-800 text-indigo-300 rounded-lg border border-zinc-800 transition-colors text-xs font-mono font-medium inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Kontrol</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Leave Requests Approval View */
        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 bg-[#09090b] border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-100 font-mono uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span>Daftar Permohonan Cuti, Sakit, Lembur & Tukar Hari WFH</span>
            </h3>
            <span className="text-xs text-zinc-400">Total: {leaveRequests.length} Permohonan</span>
          </div>

          <div className="divide-y divide-zinc-800/80">
            {leaveRequests.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 text-xs">
                Belum ada pengajuan izin / cuti yang tercatat.
              </div>
            ) : (
              leaveRequests.map((req) => (
                <div key={req.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-zinc-800/30 transition-colors">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-100 text-sm">{req.employeeName}</span>
                      <span className="text-xs font-mono text-indigo-400 font-semibold">({req.employeeNip})</span>
                      <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">{req.department}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          req.type === 'CUTI'
                            ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                            : req.type === 'SAKIT'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : req.type === 'LEMBUR'
                            ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {req.type}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300">
                      <strong className="text-zinc-400">Periode:</strong> {req.startDate} s/d {req.endDate}
                    </p>

                    <p className="text-xs text-zinc-400 bg-[#09090b] p-2.5 rounded-lg border border-zinc-800 max-w-2xl">
                      "{req.reason}"
                    </p>
                  </div>

                  {/* Actions / Status */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {req.status === 'PENDING' ? (
                      <>
                        <button
                          onClick={() => {
                            updateLeaveStatus(req.id, { status: 'APPROVED', hrdNotes: 'Disetujui oleh HRD.' });
                            showToast(`Pengajuan ${req.employeeName} disetujui!`, 'success');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Setujui</span>
                        </button>

                        <button
                          onClick={() => {
                            updateLeaveStatus(req.id, { status: 'REJECTED', hrdNotes: 'Ditolak HRD karena kuota WFH penuh.' });
                            showToast(`Pengajuan ${req.employeeName} ditolak.`, 'info');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          <X className="w-3.5 h-3.5 text-rose-400" />
                          <span>Tolak</span>
                        </button>
                      </>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded-lg font-mono text-xs font-bold border ${
                          req.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {req.status === 'APPROVED' ? '✓ Disetujui' : '✗ Ditolak'}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Control Detail Modal */}
      <AttendanceDetailModal
        isOpen={!!selectedDetailRecord}
        onClose={() => setSelectedDetailRecord(null)}
        record={selectedDetailRecord}
      />

      {/* Analytics Insights Dashboard Modal */}
      <AttendanceAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />
    </div>
  );
};
