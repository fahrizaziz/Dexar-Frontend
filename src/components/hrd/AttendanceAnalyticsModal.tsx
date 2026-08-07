import React from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { BarChart3, CheckCircle2, TrendingUp, Users, Building2, Download, PieChart as PieIcon } from 'lucide-react';
import { exportAttendanceToCSV } from '../../utils/exportUtils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface AttendanceAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AttendanceAnalyticsModal: React.FC<AttendanceAnalyticsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { attendanceRecords, leaveRequests } = useApp();

  const totalRecords = attendanceRecords.length;
  const onTimeCount = attendanceRecords.filter((r) => r.status === 'ON_TIME' || r.status === 'WORK_COMPLETED').length;
  const lateCount = attendanceRecords.filter((r) => r.status === 'LATE').length;
  const verifiedCount = attendanceRecords.filter((r) => r.verificationStatus === 'TERVERIFIKASI').length;
  const summaryCompletedCount = attendanceRecords.filter((r) => Boolean(r.workSummary)).length;

  const onTimePercentage = totalRecords > 0 ? Math.round((onTimeCount / totalRecords) * 100) : 100;
  const summaryPercentage = totalRecords > 0 ? Math.round((summaryCompletedCount / totalRecords) * 100) : 0;
  const verificationRate = totalRecords > 0 ? Math.round((verifiedCount / totalRecords) * 100) : 0;

  // Pie Chart Data: Status Distribution
  const statusPieData = [
    { name: 'Tepat Waktu', value: onTimeCount, color: '#10b981' },
    { name: 'Terlambat', value: lateCount, color: '#f43f5e' },
    { name: 'Izin / Cuti', value: leaveRequests.filter((l) => l.status === 'APPROVED').length, color: '#f59e0b' },
  ];

  // Bar Chart Data: Department Attendance Breakdown
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dashboard Analitik & Insights HRD"
      subtitle="Visualisasi Performa Kehadiran WFH, Ketepatan Waktu, dan Grafik Departemen"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Metric Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-[#09090b] border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-mono font-bold uppercase">Total Presensi</span>
              <BarChart3 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-zinc-100">{totalRecords}</p>
            <p className="text-[10px] text-zinc-400">Total record tercatat</p>
          </div>

          <div className="p-4 rounded-xl bg-[#09090b] border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-mono font-bold uppercase">Tepat Waktu</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">{onTimePercentage}%</p>
            <p className="text-[10px] text-zinc-400">{onTimeCount} dari {totalRecords} on-time</p>
          </div>

          <div className="p-4 rounded-xl bg-[#09090b] border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-mono font-bold uppercase">Work Summary</span>
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-indigo-400">{summaryPercentage}%</p>
            <p className="text-[10px] text-zinc-400">Ringkasan dilaporkan</p>
          </div>

          <div className="p-4 rounded-xl bg-[#09090b] border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-mono font-bold uppercase">Verifikasi HRD</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400">{verificationRate}%</p>
            <p className="text-[10px] text-zinc-400">Data terverifikasi</p>
          </div>
        </div>

        {/* Visual Recharts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Donut Chart: Status Distribution */}
          <div className="p-4 rounded-xl bg-[#09090b] border border-zinc-800 space-y-2">
            <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              <span>Distribusi Status Kehadiran</span>
            </h4>
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', color: '#f4f4f5' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Department Breakdown */}
          <div className="p-4 rounded-xl bg-[#09090b] border border-zinc-800 space-y-2">
            <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>Volume Presensi per Departemen</span>
            </h4>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptStatsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', color: '#f4f4f5' }}
                  />
                  <Bar dataKey="Presensi" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Visual Progress Bars */}
        <div className="p-4 rounded-xl bg-[#09090b] border border-zinc-800 space-y-4">
          <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
            <span>Rasio Kepatuhan WFH</span>
            <span className="text-emerald-400 text-[11px]">Skor Produktivitas: Tinggi</span>
          </h4>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400">Rasio Ketepatan Waktu Clock-In</span>
                <span className="font-mono text-emerald-400 font-bold">{onTimePercentage}%</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${onTimePercentage}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400">Keterisian Ringkasan Hasil Kerja (Work Summary)</span>
                <span className="font-mono text-indigo-400 font-bold">{summaryPercentage}%</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${summaryPercentage}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400">Tingkat Keterlambatan WFH</span>
                <span className="font-mono text-rose-400 font-bold">{totalRecords > 0 ? Math.round((lateCount / totalRecords) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalRecords > 0 ? (lateCount / totalRecords) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
          <button
            onClick={() => exportAttendanceToCSV(attendanceRecords)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Laporan Analitik (CSV)</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
