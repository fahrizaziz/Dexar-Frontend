import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { LeaveRequest } from '../../types';
import {
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Send,
  UserCheck,
  ShieldAlert,
  Sparkles,
  PieChart,
  CalendarDays,
  Filter,
} from 'lucide-react';

export const LeaveManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const { leaveRequests, submitLeaveRequest, updateLeaveStatus, showToast, addAuditLog } = useApp();

  const isHRD = currentUser.role === 'HRD_ADMIN';

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestType, setRequestType] = useState<'CUTI' | 'SAKIT' | 'TUKAR_HARI_WFH' | 'LEMBUR'>('TUKAR_HARI_WFH');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Approval Modal State
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [hrdNotes, setHrdNotes] = useState('');

  // Filter State
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  const userRequests = leaveRequests.filter((req) =>
    isHRD ? true : req.employeeId === currentUser.id
  );

  const filteredRequests = userRequests.filter((req) => {
    if (statusFilter === 'ALL') return true;
    return req.status === statusFilter;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      showToast('Harap lengkapi tanggal dan alasan pengajuan!', 'error');
      return;
    }

    const newReq = submitLeaveRequest({
      employeeId: currentUser.id,
      employeeNip: currentUser.nip,
      employeeName: currentUser.name,
      department: currentUser.department || 'Engineering & Tech',
      type: requestType,
      startDate,
      endDate,
      reason: reason.trim(),
      status: 'PENDING',
    });

    addAuditLog({
      actorNip: currentUser.nip,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'SUBMIT_LEAVE_REQUEST',
      category: 'LEAVE',
      details: `Pengajuan ${requestType} (${startDate} s.d ${endDate}) dikirimkan. ID: ${newReq.id}`,
    });

    setIsModalOpen(false);
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  const handleApproval = (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedRequest) return;

    updateLeaveStatus(selectedRequest.id, {
      status,
      hrdNotes: hrdNotes.trim() || undefined,
    });

    addAuditLog({
      actorNip: currentUser.nip,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: status === 'APPROVED' ? 'APPROVE_LEAVE_REQUEST' : 'REJECT_LEAVE_REQUEST',
      category: 'LEAVE',
      details: `HRD ${status === 'APPROVED' ? 'MENYETUJUI' : 'MENOLAK'} pengajuan ${selectedRequest.type} dari ${selectedRequest.employeeName}. Catatan: ${hrdNotes || '-'}`,
    });

    setSelectedRequest(null);
    setHrdNotes('');
  };

  // Quota metrics for employee
  const totalApprovedWFHSite = leaveRequests.filter(
    (r) => r.employeeId === currentUser.id && r.type === 'TUKAR_HARI_WFH' && r.status === 'APPROVED'
  ).length;

  const totalCutiApproved = leaveRequests.filter(
    (r) => r.employeeId === currentUser.id && r.type === 'CUTI' && r.status === 'APPROVED'
  ).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-[#121215] border border-zinc-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded uppercase flex items-center gap-1">
                <CalendarDays className="w-3 h-3" />
                Fitur #1: Multi-Tier Leave & WFH Extra
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight flex items-center gap-3">
              <Calendar className="w-8 h-8 text-emerald-400 shrink-0" />
              <span>Pengajuan Cuti, Sakit & Tukar WFH</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Sistem pengajuan fleksibel untuk alokasi kuota WFH harian, permohonan cuti tahunan, surat izin sakit, hingga jam lembur dengan persetujuan bertingkat oleh HRD.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-3 shrink-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Permohonan Baru</span>
            </button>
          </div>
        </div>

        {/* Quota Overview Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-zinc-800/80">
          <div className="bg-[#09090b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Sisa Kuota Cuti Tahunan</p>
              <p className="text-2xl font-extrabold font-mono text-emerald-400 mt-0.5">
                {12 - totalCutiApproved} <span className="text-xs text-zinc-500 font-normal">/ 12 Hari</span>
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <PieChart className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#09090b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Tukar Hari WFH Disetujui</p>
              <p className="text-2xl font-extrabold font-mono text-indigo-400 mt-0.5">
                {totalApprovedWFHSite} <span className="text-xs text-zinc-500 font-normal">Kali</span>
              </p>
            </div>
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#09090b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Pengajuan Menunggu (Pending)</p>
              <p className="text-2xl font-extrabold font-mono text-amber-400 mt-0.5">
                {leaveRequests.filter((r) => r.status === 'PENDING').length}{' '}
                <span className="text-xs text-zinc-500 font-normal">Item</span>
              </p>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <span>Daftar Permohonan Cuti & WFH ({filteredRequests.length})</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isHRD ? 'Seluruh permohonan dari karyawan perusahaan' : 'Riwayat pengajuan pribadi anda'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Menunggu (Pending)</option>
              <option value="APPROVED">Disetujui (Approved)</option>
              <option value="REJECTED">Ditolak (Rejected)</option>
            </select>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 space-y-3">
            <FileText className="w-12 h-12 mx-auto text-zinc-700" />
            <p className="text-sm font-medium">Belum ada data permohonan untuk filter ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#09090b] text-zinc-400 font-mono border-b border-zinc-800">
                <tr>
                  <th className="py-4 px-6">Pemohon & Divisi</th>
                  <th className="py-4 px-6">Tipe Pengajuan</th>
                  <th className="py-4 px-6">Periode Tanggal</th>
                  <th className="py-4 px-6">Alasan & Catatan HRD</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  {isHRD && <th className="py-4 px-6 text-center">Aksi HRD</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-[#0c0c0e]">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-zinc-100">{req.employeeName}</p>
                      <p className="text-[10px] font-mono text-zinc-500">
                        {req.employeeNip} • {req.department}
                      </p>
                    </td>

                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-zinc-800 text-emerald-400 border border-zinc-700">
                        {req.type.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-mono text-zinc-300">
                      {req.startDate} {req.startDate !== req.endDate ? `s/d ${req.endDate}` : ''}
                    </td>

                    <td className="py-4 px-6 max-w-xs">
                      <p className="text-zinc-300 leading-relaxed">{req.reason}</p>
                      {req.hrdNotes && (
                        <p className="text-[11px] text-amber-400 font-mono mt-1 bg-amber-500/10 p-1.5 rounded border border-amber-500/20">
                          Catatan HRD: {req.hrdNotes}
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-6 text-center">
                      {req.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Disetujui
                        </span>
                      )}
                      {req.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                          <Clock className="w-3.5 h-3.5" /> Menunggu HRD
                        </span>
                      )}
                      {req.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-red-500/10 border border-red-500/30 text-red-400">
                          <XCircle className="w-3.5 h-3.5" /> Ditolak
                        </span>
                      )}
                    </td>

                    {isHRD && (
                      <td className="py-4 px-6 text-center">
                        {req.status === 'PENDING' ? (
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all cursor-pointer shadow-md"
                          >
                            Proses HRD
                          </button>
                        ) : (
                          <span className="text-[10px] text-zinc-500 font-mono">Selesai</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Submit Request */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121215] border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Buat Permohonan Baru
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1.5">Tipe Permohonan</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-xl p-3 outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="TUKAR_HARI_WFH">Tukar Hari WFH (Extra WFH Allocation)</option>
                  <option value="CUTI">Cuti Tahunan (Annual Leave)</option>
                  <option value="SAKIT">Izin Sakit (Sick Leave)</option>
                  <option value="LEMBUR">Lembur Pekerjaan (Overtime WFH)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1.5">Mulai Tanggal</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-xl p-3 outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1.5">Sampai Tanggal</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-xl p-3 outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1.5">
                  Alasan & Justifikasi Operasional
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Jelaskan alasan permohonan cuti / tukar hari WFH secara mendetail..."
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-xl p-3 outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <Send className="w-4 h-4" />
                  Kirim Permohonan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Process HRD Approval */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121215] border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-400" />
                Verifikasi HRD Admin
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-zinc-500 hover:text-zinc-300 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-2">
                <p className="text-zinc-400">
                  Pemohon: <strong className="text-zinc-100">{selectedRequest.employeeName}</strong> ({selectedRequest.employeeNip})
                </p>
                <p className="text-zinc-400">
                  Jenis: <span className="font-mono text-emerald-400 font-bold">{selectedRequest.type}</span>
                </p>
                <p className="text-zinc-400">
                  Tanggal: <span className="font-mono text-zinc-200">{selectedRequest.startDate} - {selectedRequest.endDate}</span>
                </p>
                <p className="text-zinc-300 italic bg-zinc-950 p-2.5 rounded border border-zinc-800/80">
                  "{selectedRequest.reason}"
                </p>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1.5">Catatan Keputusan HRD</label>
                <textarea
                  rows={2}
                  value={hrdNotes}
                  onChange={(e) => setHrdNotes(e.target.value)}
                  placeholder="Tambahkan catatan persetujuan atau alasan penolakan..."
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-xl p-3 outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => handleApproval('REJECTED')}
                  className="px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-semibold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <XCircle className="w-4 h-4 text-red-400" />
                  Tolak Permohonan
                </button>
                <button
                  type="button"
                  onClick={() => handleApproval('APPROVED')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Setujui Permohonan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
