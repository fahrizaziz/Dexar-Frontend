import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord } from '../../types';
import { formatIndonesianDate } from '../../utils/dateUtils';
import { exportAttendanceToCSV } from '../../utils/exportUtils';
import { Calendar, MapPin, CheckCircle2, Clock, Eye, FileText, Download, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { Modal } from '../common/Modal';

export const PersonalAttendanceHistory: React.FC = () => {
  const { currentUser } = useAuth();
  const { attendanceRecords, leaveRequests } = useApp();

  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  // Filter records belonging to this employee
  const myRecords = attendanceRecords.filter((r) => r.employeeId === currentUser.id);
  const myLeaves = leaveRequests.filter((r) => r.employeeId === currentUser.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2 tracking-tight">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Riwayat Absensi Saya
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Daftar absensi WFH & riwayat permohonan izin yang dikirimkan oleh {currentUser.name}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportAttendanceToCSV(myRecords, `Rekap_Absensi_${currentUser.name.replace(/ /g, '_')}.csv`)}
            className="px-3.5 py-1.5 rounded-lg bg-[#0c0c0e] hover:bg-zinc-800 border border-zinc-800 text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <div className="text-xs font-mono text-zinc-400 bg-[#0c0c0e] border border-zinc-800 px-3.5 py-1.5 rounded-lg">
            Total Rekaman: <span className="font-bold text-emerald-400">{myRecords.length}</span>
          </div>
        </div>
      </div>

      {myRecords.length === 0 ? (
        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-12 text-center text-zinc-400">
          <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="font-semibold text-zinc-200">Belum ada riwayat absensi WFH</p>
          <p className="text-xs text-zinc-500 mt-1">
            Lakukan absen masuk pada tab "Absen WFH" untuk memulai pencatatan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {myRecords.map((record) => (
            <div
              key={record.id}
              className="bg-[#0c0c0e] border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Photo Preview Thumbnail */}
                <div className="relative h-44 bg-[#09090b] overflow-hidden">
                  <img
                    src={record.photoProofUrl}
                    alt="Foto Absen"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent" />

                  <span
                    className={`absolute top-3 right-3 text-[10px] font-mono font-bold px-2.5 py-1 rounded backdrop-blur-md ${
                      record.status === 'LATE'
                        ? 'bg-amber-500/90 text-zinc-950'
                        : 'bg-emerald-500/90 text-zinc-950'
                    }`}
                  >
                    {record.status === 'LATE' ? 'Terlambat' : 'Tepat Waktu'}
                  </span>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-zinc-200 font-mono">
                    <span className="flex items-center gap-1 bg-[#09090b]/80 px-2.5 py-1 rounded-md border border-zinc-800">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" /> {record.clockInTime} WIB
                    </span>
                    {record.clockOutTime && (
                      <span className="flex items-center gap-1 bg-[#09090b]/80 px-2.5 py-1 rounded-md border border-zinc-800 text-sky-300">
                        Pulang: {record.clockOutTime} WIB
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <p className="text-sm font-bold text-zinc-200">
                    {formatIndonesianDate(record.date)}
                  </p>

                  <p className="text-xs text-zinc-400 flex items-center gap-1 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    {record.location.address}
                  </p>

                  <div className="bg-[#09090b] p-3 rounded-xl border border-zinc-800/90 text-xs text-zinc-300 line-clamp-2">
                    <span className="text-zinc-500 font-mono block text-[10px]">Work Plan:</span>
                    {record.workPlan}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => setSelectedRecord(record)}
                  className="w-full bg-[#121215] hover:bg-zinc-800 text-zinc-200 font-medium text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 border border-zinc-800"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Lihat Detail Absen</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Employee's Submitted Leave & Permit Requests Section */}
      {myLeaves.length > 0 && (
        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 font-mono uppercase tracking-wider">
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span>Status Pengajuan Izin, Cuti & Tukar Hari Saya</span>
            </h3>
            <span className="text-xs text-zinc-500 font-mono">{myLeaves.length} Pengajuan</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myLeaves.map((leave) => (
              <div key={leave.id} className="bg-[#09090b] border border-zinc-800/90 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {leave.type}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded ${
                      leave.status === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : leave.status === 'REJECTED'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                    }`}
                  >
                    {leave.status === 'APPROVED' ? '✓ Disetujui' : leave.status === 'REJECTED' ? '✗ Ditolak' : '⏳ Menunggu Approval'}
                  </span>
                </div>

                <p className="text-xs text-zinc-300">
                  <strong className="text-zinc-400 font-normal">Tanggal:</strong> {leave.startDate} s/d {leave.endDate}
                </p>
                <p className="text-xs text-zinc-400 italic">"{leave.reason}"</p>

                {leave.hrdNotes && (
                  <p className="text-[11px] text-indigo-300 bg-indigo-500/10 p-2 rounded border border-indigo-500/20 font-mono">
                    Catatan HRD: {leave.hrdNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRecord && (
        <Modal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title={`Detail Absensi WFH - ${selectedRecord.date}`}
          subtitle={selectedRecord.employeeName}
          maxWidth="xl"
        >
          <div className="space-y-4 text-sm">
            <div className="rounded-xl overflow-hidden border border-zinc-800 bg-[#09090b]">
              <img
                src={selectedRecord.photoProofUrl}
                alt="Foto Absen"
                className="w-full h-64 object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#09090b] p-3.5 rounded-xl border border-zinc-800">
                <span className="text-xs text-zinc-400 block font-medium">Jam Masuk:</span>
                <span className="text-base font-mono font-bold text-emerald-400">
                  {selectedRecord.clockInTime} WIB
                </span>
              </div>

              <div className="bg-[#09090b] p-3.5 rounded-xl border border-zinc-800">
                <span className="text-xs text-zinc-400 block font-medium">Jam Pulang:</span>
                <span className="text-base font-mono font-bold text-sky-400">
                  {selectedRecord.clockOutTime ? `${selectedRecord.clockOutTime} WIB` : 'Belum Absen Pulang'}
                </span>
              </div>
            </div>

            <div className="bg-[#09090b] p-3.5 rounded-xl border border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-400 block font-medium">Lokasi GPS:</span>
              <p className="text-zinc-200 text-xs flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                {selectedRecord.location.address}
              </p>
            </div>

            <div className="bg-[#09090b] p-3.5 rounded-xl border border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-400 block font-medium">Rencana Kerja:</span>
              <p className="text-zinc-300 text-xs">{selectedRecord.workPlan}</p>
            </div>

            {selectedRecord.workSummary && (
              <div className="bg-[#09090b] p-3.5 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-xs text-zinc-400 block font-medium">Hasil Pekerjaan:</span>
                <p className="text-zinc-300 text-xs">{selectedRecord.workSummary}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
