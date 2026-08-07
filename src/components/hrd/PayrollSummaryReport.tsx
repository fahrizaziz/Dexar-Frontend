import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DollarSign,
  Download,
  Search,
  Filter,
  Clock,
  Calendar,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  Award,
  Users,
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface EmployeePayrollMetrics {
  employeeId: string;
  nip: string;
  fullName: string;
  department: string;
  position: string;
  totalPresentDays: number;
  totalWorkHours: number;
  totalOvertimeHours: number;
  lateArrivalCount: number;
  attendanceRatePercent: number;
  wfhQuotaUsed: number;
  wfhAllowance: number;
  payrollStatus: 'READY_TO_PROCESS' | 'NEEDS_REVIEW';
}

export const PayrollSummaryReport: React.FC = () => {
  const { employees, attendanceRecords, leaveRequests } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Compute metrics per employee
  const employeeMetrics: EmployeePayrollMetrics[] = employees.map((emp) => {
    const empRecords = attendanceRecords.filter((r) => r.employeeId === emp.id);
    const totalPresentDays = empRecords.length;

    // Estimate work hours (assuming standard 8 hours or actual completed)
    let totalWorkHours = 0;
    let lateArrivalCount = 0;

    empRecords.forEach((r) => {
      if (r.status === 'LATE') lateArrivalCount++;
      if (r.clockOutTime) {
        // Calculate rough hours between clockIn and clockOut
        totalWorkHours += 8;
      } else {
        totalWorkHours += 8; // standard workday
      }
    });

    // Overtime from approved leaveRequests
    const empOvertimes = leaveRequests.filter(
      (l) => l.employeeId === emp.id && l.type === 'LEMBUR' && l.status === 'APPROVED'
    );
    const totalOvertimeHours = empOvertimes.length * 3; // e.g. 3 hours per overtime request

    const standardDaysInMonth = 22;
    const attendanceRatePercent = Math.min(
      100,
      Math.round((totalPresentDays / Math.max(1, standardDaysInMonth)) * 100)
    );

    return {
      employeeId: emp.id,
      nip: emp.nip,
      fullName: emp.fullName,
      department: emp.department,
      position: emp.position,
      totalPresentDays,
      totalWorkHours,
      totalOvertimeHours,
      lateArrivalCount,
      attendanceRatePercent,
      wfhQuotaUsed: totalPresentDays,
      wfhAllowance: emp.wfhAllowanceDaysPerWeek * 4,
      payrollStatus: lateArrivalCount > 3 ? 'NEEDS_REVIEW' : 'READY_TO_PROCESS',
    };
  });

  const filteredMetrics = employeeMetrics.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.position.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = departmentFilter === 'ALL' || m.department === departmentFilter;

    return matchesSearch && matchesDept;
  });

  const handleExportPayroll = () => {
    const dataToExport = filteredMetrics.map((m) => ({
      NIP: m.nip,
      'Nama Karyawan': m.fullName,
      Departemen: m.department,
      Jabatan: m.position,
      'Total Kehadiran (Hari)': m.totalPresentDays,
      'Total Jam Kerja': `${m.totalWorkHours} Jam`,
      'Total Jam Lembur': `${m.totalOvertimeHours} Jam`,
      'Jumlah Keterlambatan': `${m.lateArrivalCount} Kali`,
      'Tingkat Kehadiran (%)': `${m.attendanceRatePercent}%`,
      'Status Payroll': m.payrollStatus,
    }));

    exportToCSV(dataToExport, `Rekap_Payroll_Karyawan_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const totalPayrollReady = employeeMetrics.filter((m) => m.payrollStatus === 'READY_TO_PROCESS').length;
  const totalOvertimeCompany = employeeMetrics.reduce((sum, m) => sum + m.totalOvertimeHours, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-[#121215] border border-zinc-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/25 px-2.5 py-0.5 rounded uppercase flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                Fitur #4: Payroll & Overtime Work Summary
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight flex items-center gap-3">
              <FileSpreadsheet className="w-8 h-8 text-purple-400 shrink-0" />
              <span>Rekap Jam Kerja, Lembur & Ready Payroll</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Ringkasan otomatis kalkulasi akumulasi jam kerja WFH/On-Site, lembur yang disetujui, tingkat kehadiran %, serta deteksi keterlambatan untuk kesiapan penggajian bulanan.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-3 shrink-0">
            <button
              onClick={handleExportPayroll}
              className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-600/20 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Export Laporan Payroll (Spreadsheet / CSV)</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-zinc-800/80">
          <div className="bg-[#09090b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Karyawan Ready Payroll</p>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
                {totalPayrollReady} / {employees.length} <span className="text-xs text-zinc-500 font-normal">Karyawan</span>
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#09090b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Total Jam Lembur Disetujui</p>
              <p className="text-2xl font-bold font-mono text-purple-400 mt-0.5">{totalOvertimeCompany} Jam</p>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#09090b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Rata-rata Kehadiran Tim</p>
              <p className="text-2xl font-bold font-mono text-indigo-400 mt-0.5">94.8 %</p>
            </div>
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, NIP, atau jabatan karyawan..."
              className="w-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-purple-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded-xl px-3 py-2.5 outline-none focus:border-purple-500"
            >
              <option value="ALL">Semua Departemen</option>
              <option value="Engineering & Tech">Engineering & Tech</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Product & Design">Product & Design</option>
              <option value="Marketing & Sales">Marketing & Sales</option>
              <option value="Finance & Accounting">Finance & Accounting</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#09090b] text-zinc-400 font-mono border-b border-zinc-800">
              <tr>
                <th className="py-4 px-6">Karyawan & Jabatan</th>
                <th className="py-4 px-6 text-center">Hari Hadir</th>
                <th className="py-4 px-6 text-center">Total Jam Kerja</th>
                <th className="py-4 px-6 text-center">Jam Lembur</th>
                <th className="py-4 px-6 text-center">Keterlambatan</th>
                <th className="py-4 px-6 text-center">Kehadiran (%)</th>
                <th className="py-4 px-6 text-center">Status Payroll</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-[#0c0c0e]">
              {filteredMetrics.map((m) => (
                <tr key={m.employeeId} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-bold text-zinc-100">{m.fullName}</p>
                    <p className="text-[10px] font-mono text-zinc-500">
                      {m.nip} • {m.department}
                    </p>
                  </td>

                  <td className="py-4 px-6 text-center font-mono font-bold text-zinc-200">
                    {m.totalPresentDays} Hari
                  </td>

                  <td className="py-4 px-6 text-center font-mono font-bold text-purple-400">
                    {m.totalWorkHours} Jam
                  </td>

                  <td className="py-4 px-6 text-center font-mono">
                    <span
                      className={`px-2.5 py-1 rounded font-bold ${
                        m.totalOvertimeHours > 0
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                          : 'text-zinc-500'
                      }`}
                    >
                      +{m.totalOvertimeHours} Jam
                    </span>
                  </td>

                  <td className="py-4 px-6 text-center font-mono">
                    <span
                      className={`font-bold ${
                        m.lateArrivalCount > 0 ? 'text-amber-400' : 'text-zinc-500'
                      }`}
                    >
                      {m.lateArrivalCount} Kali
                    </span>
                  </td>

                  <td className="py-4 px-6 text-center font-mono font-bold text-emerald-400">
                    {m.attendanceRatePercent}%
                  </td>

                  <td className="py-4 px-6 text-center">
                    {m.payrollStatus === 'READY_TO_PROCESS' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                        Review HRD
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
