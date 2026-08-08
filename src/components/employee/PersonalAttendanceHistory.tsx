import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord } from '../../types';
import { formatIndonesianDate } from '../../utils/dateUtils';
import { exportAttendanceToCSV } from '../../utils/exportUtils';
import { attendanceService } from '../../services/attendanceService';
import { Calendar, MapPin, CheckCircle2, Clock, Eye, FileText, Download, ShieldCheck, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';

export const PersonalAttendanceHistory: React.FC = () => {
  const { currentUser } = useAuth();
  const { attendanceRecords, leaveRequests } = useApp();

  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [fetchedRecords, setFetchedRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const records = await attendanceService.getMyHistory();
        if (isMounted && records.length > 0) {
          setFetchedRecords(records);
        }
      } catch (err) {
        console.warn('API getMyHistory fallback to context state');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter records belonging to this employee (prefer fetched, fallback to context state)
  const myRecords = fetchedRecords.length > 0
    ? fetchedRecords
    : attendanceRecords.filter((r) => r.employeeId === currentUser.id);

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
            className="px-3.5 py-1.5 rounded-lg bg-[#0c0c0e] hover:bg-zinc-800 border border-zinc-800 text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <div className="text-xs font-mono text-zinc-400 bg-[#0c0c0e] border border-zinc-800 px-3.5 py-1.5 rounded-lg">
            Total Rekaman: <span className="font-bold text-emerald-400">{myRecords.length}</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-12 text-center text-zinc-400 space-y-3 font-mono">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
          <p className="text-xs">Memuat riwayat absensi dari server...</p>
        </div>
      ) : myRecords.length === 0 ? (
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
                    <span>{record.location.address}</span>
                  </p>

                  <div className="space-y-1">
                    <p className="text-[11px] font-mono text-zinc-400">Rencana Kerja (Work Plan):</p>
                    <p className="text-xs text-zinc-300 bg-[#09090b] p-2.5 rounded-xl border border-zinc-800/80 line-clamp-2 leading-relaxed">
                      {record.workPlan}
                    </p>
                  </div>

                  {record.workSummary && (
                    <div className="space-y-1">
                      <p className="text-[11px] font-mono text-zinc-400">Rekap Hasil Kerja (Summary):</p>
                      <p className="text-xs text-zinc-300 bg-[#09090b] p-2.5 rounded-xl border border-zinc-800/80 line-clamp-2 leading-relaxed">
                        {record.workSummary}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => setSelectedRecord(record)}
                  className="w-full py-2 bg-[#121215] hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-indigo-300 hover:text-indigo-200 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat Detail GPS & Audit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail Rekam Presensi */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title="Detail Presensi WFH Karyawan"
        subtitle={`Audit log presensi tanggal ${selectedRecord ? formatIndonesianDate(selectedRecord.date) : ''}`}
        maxWidth="lg"
      >
        {selectedRecord && (
          <div className="space-y-6 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#09090b] border border-zinc-800 p-4 rounded-xl space-y-2">
                <p className="font-mono text-zinc-400 uppercase text-[10px]">Waktu Absen Masuk</p>
                <p className="text-base font-extrabold text-emerald-400 font-mono">
                  {selectedRecord.clockInTime} WIB
                </p>
              </div>

              <div className="bg-[#09090b] border border-zinc-800 p-4 rounded-xl space-y-2">
                <p className="font-mono text-zinc-400 uppercase text-[10px]">Waktu Absen Pulang</p>
                <p className="text-base font-extrabold text-sky-400 font-mono">
                  {selectedRecord.clockOutTime ? `${selectedRecord.clockOutTime} WIB` : 'Belum Absen Pulang'}
                </p>
              </div>
            </div>

            <div className="bg-[#09090b] border border-zinc-800 p-4 rounded-xl space-y-3">
              <p className="font-mono text-zinc-400 uppercase text-[10px]">Bukti Tangkapan Foto Webcam</p>
              <div className="h-56 rounded-xl overflow-hidden border border-zinc-800">
                <img
                  src={selectedRecord.photoProofUrl}
                  alt="Bukti Absen"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="bg-[#09090b] border border-zinc-800 p-4 rounded-xl space-y-2">
              <p className="font-mono text-zinc-400 uppercase text-[10px]">Koordinat & Alamat GPS Terverifikasi</p>
              <p className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{selectedRecord.location.address}</span>
              </p>
              <p className="font-mono text-[11px] text-zinc-400">
                Latitude: {selectedRecord.location.latitude}, Longitude: {selectedRecord.location.longitude}
              </p>
            </div>

            <div className="bg-[#09090b] border border-zinc-800 p-4 rounded-xl space-y-2">
              <p className="font-mono text-zinc-400 uppercase text-[10px]">Jurnal Rencana Kerja (Work Plan)</p>
              <p className="text-zinc-200 leading-relaxed bg-[#0c0c0e] p-3 rounded-lg border border-zinc-800">
                {selectedRecord.workPlan}
              </p>
            </div>

            {selectedRecord.workSummary && (
              <div className="bg-[#09090b] border border-zinc-800 p-4 rounded-xl space-y-2">
                <p className="font-mono text-zinc-400 uppercase text-[10px]">Rekap Ringkasan Hasil Kerja (Work Summary)</p>
                <p className="text-zinc-200 leading-relaxed bg-[#0c0c0e] p-3 rounded-lg border border-zinc-800">
                  {selectedRecord.workSummary}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
