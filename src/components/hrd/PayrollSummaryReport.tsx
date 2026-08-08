import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { payrollService, PayrollItem } from '../../services/payrollService';
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
  Loader2,
  FileText,
  Sliders,
  Settings,
  Save,
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';
import { Modal } from '../common/Modal';

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
  baseSalary: number;
  wfhIncentiveTotal: number;
  lateDeductionTotal: number;
  netSalary: number;
  payrollStatus: 'DIBAYARKAN' | 'READY_TO_PROCESS' | 'NEEDS_REVIEW';
}

export const PayrollSummaryReport: React.FC = () => {
  const { employees, attendanceRecords, leaveRequests, geofenceConfig, updateGeofenceConfig, showToast, addAuditLog } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [apiPayroll, setApiPayroll] = useState<PayrollItem[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [selectedSlipEmp, setSelectedSlipEmp] = useState<EmployeePayrollMetrics | null>(null);

  // State for Rate Configuration Modal
  const [isRatesModalOpen, setIsRatesModalOpen] = useState(false);
  const [editWfhRate, setEditWfhRate] = useState<string>((geofenceConfig.wfhIncentivePerDay || 50000).toString());
  const [editLateRate, setEditLateRate] = useState<string>((geofenceConfig.lateDeductionPerOccurrence || 25000).toString());

  const wfhRate = geofenceConfig.wfhIncentivePerDay || 50000;
  const lateRate = geofenceConfig.lateDeductionPerOccurrence || 25000;

  useEffect(() => {
    setEditWfhRate((geofenceConfig.wfhIncentivePerDay || 50000).toString());
    setEditLateRate((geofenceConfig.lateDeductionPerOccurrence || 25000).toString());
  }, [geofenceConfig]);

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedWfh = Number(editWfhRate);
    const parsedLate = Number(editLateRate);

    if (isNaN(parsedWfh) || isNaN(parsedLate)) {
      showToast('Harap masukkan nominal tarif yang valid!', 'error');
      return;
    }

    const updatedConfig = {
      ...geofenceConfig,
      wfhIncentivePerDay: parsedWfh,
      lateDeductionPerOccurrence: parsedLate,
    };

    updateGeofenceConfig(updatedConfig);
    showToast('Tarif insentif WFH & denda absensi berhasil diperbarui!', 'success');
    addAuditLog({
      actorNip: 'EMP-2026-002',
      actorName: 'HRD Admin',
      actorRole: 'HRD_ADMIN',
      action: 'UPDATE_PAYROLL_RATES',
      category: 'SYSTEM',
      details: `Memperbarui tarif payroll: Insentif WFH = Rp ${parsedWfh.toLocaleString('id-ID')}/hari, Denda Keterlambatan = Rp ${parsedLate.toLocaleString('id-ID')}/kejadian.`,
    });
    setIsRatesModalOpen(false);
  };

  // Fetch Payroll summary from NestJS API
  useEffect(() => {
    const fetchPayroll = async () => {
      setIsLoadingApi(true);
      try {
        const data = await payrollService.getPayrollSummary();
        if (data && data.length > 0) {
          setApiPayroll(data);
        }
      } catch (err) {
        console.warn('Fallback to local computed payroll metrics');
      } finally {
        setIsLoadingApi(false);
      }
    };
    fetchPayroll();
  }, []);

  // Compute metrics per employee (with API preference)
  const employeeMetrics: EmployeePayrollMetrics[] =
    apiPayroll.length > 0
      ? apiPayroll.map((item) => {
          const wfhIncentiveTotal = item.totalHadir * wfhRate;
          const lateDeductionTotal = item.totalTerlambat * lateRate;
          const netSalary = (item.baseSalary || 12000000) + wfhIncentiveTotal - lateDeductionTotal;

          return {
            employeeId: item.employeeId,
            nip: item.nip,
            fullName: item.fullName,
            department: item.department,
            position: item.position,
            totalPresentDays: item.totalHadir,
            totalWorkHours: item.totalHoursWorked,
            totalOvertimeHours: 6,
            lateArrivalCount: item.totalTerlambat,
            attendanceRatePercent: Math.min(100, Math.round((item.totalHadir / 22) * 100)),
            wfhQuotaUsed: item.wfhDaysCompleted,
            wfhAllowance: item.wfhAllowanceEligibleDays,
            baseSalary: item.baseSalary || 12000000,
            wfhIncentiveTotal,
            lateDeductionTotal,
            netSalary,
            payrollStatus: 'DIBAYARKAN',
          };
        })
      : employees.map((emp) => {
          const empRecords = attendanceRecords.filter((r) => r.employeeId === emp.id);
          const totalPresentDays = empRecords.length || 0;

          let totalWorkHours = 0;
          let lateArrivalCount = 0;

          empRecords.forEach((r) => {
            if (r.status === 'LATE') lateArrivalCount++;
            totalWorkHours += 8;
          });

          const baseSalary = emp.salary || 12000000;
          const wfhIncentiveTotal = totalPresentDays * wfhRate;
          const lateDeductionTotal = lateArrivalCount * lateRate;
          const netSalary = baseSalary + wfhIncentiveTotal - lateDeductionTotal;

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
            totalOvertimeHours: 6,
            lateArrivalCount,
            attendanceRatePercent,
            wfhQuotaUsed: totalPresentDays,
            wfhAllowance: emp.wfhAllowanceDaysPerWeek * 4,
            baseSalary,
            wfhIncentiveTotal,
            lateDeductionTotal,
            netSalary,
            payrollStatus: 'DIBAYARKAN',
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
      'Total Jam Kerja': m.totalWorkHours,
      'Insentif WFH (IDR)': m.wfhIncentiveTotal,
      'Potongan Keterlambatan (IDR)': m.lateDeductionTotal,
      'Gaji Bersih / Take Home Pay (IDR)': m.netSalary,
      'Status Payroll': m.payrollStatus,
    }));

    exportToCSV(dataToExport, `Rekap_Payroll_Karyawan_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const totalPayrollAmount = filteredMetrics.reduce((sum, m) => sum + m.netSalary, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#121215] border border-zinc-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/25 px-2.5 py-0.5 rounded uppercase flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                Fitur #5: Integrasi API Payroll & Insentif WFH
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                Tarif WFH: Rp {wfhRate.toLocaleString('id-ID')}/hari
              </span>
              <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                Denda Terlambat: Rp {lateRate.toLocaleString('id-ID')}/x
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight flex items-center gap-3">
              <Award className="w-8 h-8 text-purple-400 shrink-0" />
              <span>Rekapitulasi Penggajian & Tunjangan WFH</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Ringkasan otomatis kalkulasi gaji pokok, insentif hari kerja WFH, serta denda keterlambatan absensi berbasis data presensi realtime dari server NestJS API Gateway.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-3 shrink-0">
            <button
              onClick={() => setIsRatesModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>Pengaturan Tarif Payroll</span>
            </button>

            <button
              onClick={handleExportPayroll}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Laporan Payroll (CSV)</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-zinc-800/80">
          <div className="bg-[#09090b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Estimasi Total Biaya Payroll</p>
              <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                Rp {totalPayrollAmount.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#09090b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Karyawan Terproses Payroll</p>
              <p className="text-xl font-bold font-mono text-zinc-100 mt-0.5">
                {filteredMetrics.length} / {employees.length} <span className="text-xs text-zinc-500 font-normal">Karyawan</span>
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#09090b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Insentif WFH Diberikan</p>
              <p className="text-xl font-bold font-mono text-purple-300 mt-0.5">
                Rp {filteredMetrics.reduce((sum, m) => sum + m.wfhIncentiveTotal, 0).toLocaleString('id-ID')}
              </p>
            </div>
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
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
            placeholder="Cari nama karyawan, NIP, atau jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#09090b] border border-zinc-800 focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-[#09090b] border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3.5 py-2.5 outline-none cursor-pointer"
          >
            <option value="ALL">Semua Departemen</option>
            <option value="Engineering & Tech">Engineering & Tech</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Product & Design">Product & Design</option>
            <option value="Marketing & Sales">Marketing & Sales</option>
          </select>
        </div>
      </div>

      {/* Payroll Metrics Table */}
      <div className="bg-[#0c0c0e] border border-zinc-800/90 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="min-w-[1000px] w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#09090b] uppercase font-mono font-bold text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="py-4 px-6">Karyawan & NIP</th>
                <th className="py-4 px-6">Departemen / Posisi</th>
                <th className="py-4 px-6 text-center">Kehadiran (Hari/Jam)</th>
                <th className="py-4 px-6 text-right">Gaji Pokok</th>
                <th className="py-4 px-6 text-right">Insentif WFH</th>
                <th className="py-4 px-6 text-right">Denda Terlambat</th>
                <th className="py-4 px-6 text-right">Gaji Bersih (Take Home Pay)</th>
                <th className="py-4 px-6 text-center">Slip Gaji</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {isLoadingApi ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500 font-mono">
                    <Loader2 className="w-6 h-6 text-purple-400 animate-spin mx-auto mb-2" />
                    <span>Menghitung rekapitulasi penggajian dari server NestJS API...</span>
                  </td>
                </tr>
              ) : filteredMetrics.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500 font-mono">
                    Tidak ada data penggajian yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredMetrics.map((m) => (
                  <tr key={m.employeeId} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-zinc-100 text-sm">{m.fullName}</p>
                        <span className="font-mono text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 inline-block mt-0.5">
                          {m.nip}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-medium text-zinc-200">{m.department}</p>
                      <p className="text-[11px] text-zinc-400">{m.position}</p>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <p className="font-bold text-zinc-100 font-mono">{m.totalPresentDays} Hari</p>
                      <p className="text-[10px] text-zinc-500 font-mono">{m.totalWorkHours} Jam Kerja</p>
                    </td>

                    <td className="py-4 px-6 text-right font-mono font-medium text-zinc-300">
                      Rp {m.baseSalary.toLocaleString('id-ID')}
                    </td>

                    <td className="py-4 px-6 text-right font-mono font-bold text-emerald-400">
                      + Rp {m.wfhIncentiveTotal.toLocaleString('id-ID')}
                    </td>

                    <td className="py-4 px-6 text-right font-mono font-medium text-rose-400">
                      - Rp {m.lateDeductionTotal.toLocaleString('id-ID')}
                    </td>

                    <td className="py-4 px-6 text-right font-mono font-bold text-emerald-300 text-sm">
                      Rp {m.netSalary.toLocaleString('id-ID')}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => setSelectedSlipEmp(m)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600/15 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-1.5 mx-auto cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-purple-400" />
                        <span>Lihat Slip</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Pengaturan Tarif Payroll */}
      {isRatesModalOpen && (
        <Modal
          isOpen={isRatesModalOpen}
          onClose={() => setIsRatesModalOpen(false)}
          title="Pengaturan Tarif Insentif & Denda Payroll"
          subtitle="Konfigurasi parameter insentif hari kerja WFH dan potongan denda keterlambatan"
          maxWidth="md"
        >
          <form onSubmit={handleSaveRates} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Tarif Insentif WFH (IDR / Hari Kerja) *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-xs font-mono font-bold text-emerald-400">Rp</span>
                <input
                  type="number"
                  required
                  min={0}
                  step={5000}
                  value={editWfhRate}
                  onChange={(e) => setEditWfhRate(e.target.value)}
                  placeholder="50000"
                  className="w-full bg-zinc-950 border border-zinc-800 text-emerald-400 font-mono font-bold rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-purple-500"
                />
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">Nominal insentif yang diberikan untuk setiap 1 hari presensi WFH yang sukses.</p>
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Denda Keterlambatan Absensi (IDR / Kejadian) *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-xs font-mono font-bold text-rose-400">Rp</span>
                <input
                  type="number"
                  required
                  min={0}
                  step={5000}
                  value={editLateRate}
                  onChange={(e) => setEditLateRate(e.target.value)}
                  placeholder="25000"
                  className="w-full bg-zinc-950 border border-zinc-800 text-rose-400 font-mono font-bold rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-purple-500"
                />
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">Nominal potongan gaji untuk setiap 1 kali kejadian terlambat absensi masuk.</p>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsRatesModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-purple-600/20 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Simpan Perubahan Tarif
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Detail Slip Gaji */}
      {selectedSlipEmp && (
        <Modal
          isOpen={Boolean(selectedSlipEmp)}
          onClose={() => setSelectedSlipEmp(null)}
          title={`Slip Gaji Resmi - Periode Agustus 2026`}
          subtitle={`NIP: ${selectedSlipEmp.nip} • ${selectedSlipEmp.fullName}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">Nama Pegawai:</span>
                <strong className="text-zinc-100 font-bold">{selectedSlipEmp.fullName}</strong>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">Jabatan & Dept:</span>
                <span className="text-zinc-200">{selectedSlipEmp.position} ({selectedSlipEmp.department})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Status Pembayaran:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold text-[10px]">
                  DIBAYARKAN (TRANSFER BANK)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-zinc-200 uppercase tracking-wider text-[11px]">Penerimaan / Income</h4>
              <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3 space-y-2 font-mono">
                <div className="flex justify-between text-zinc-300">
                  <span>Gaji Pokok (Base Salary)</span>
                  <span>Rp {selectedSlipEmp.baseSalary.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Insentif Hari Kerja WFH ({selectedSlipEmp.totalPresentDays} Hari @ Rp {wfhRate.toLocaleString('id-ID')})</span>
                  <span>+ Rp {selectedSlipEmp.wfhIncentiveTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-zinc-200 uppercase tracking-wider text-[11px]">Potongan / Deductions</h4>
              <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3 space-y-2 font-mono text-rose-400">
                <div className="flex justify-between">
                  <span>Denda Keterlambatan ({selectedSlipEmp.lateArrivalCount}x @ Rp {lateRate.toLocaleString('id-ID')})</span>
                  <span>- Rp {selectedSlipEmp.lateDeductionTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <div className="bg-purple-950/40 border border-purple-500/30 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <p className="text-[11px] text-purple-300 font-bold">TOTAL TAKE HOME PAY (NETT)</p>
                <p className="text-xs text-purple-400">Transfer ke Rekening Karyawan</p>
              </div>
              <p className="text-xl font-bold font-mono text-emerald-400">
                Rp {selectedSlipEmp.netSalary.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedSlipEmp(null)}
                className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
