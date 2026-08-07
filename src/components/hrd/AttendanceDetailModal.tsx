import React from 'react';
import { Modal } from '../common/Modal';
import { AttendanceRecord } from '../../types';
import { formatIndonesianDate } from '../../utils/dateUtils';
import { MapPin, Clock, CheckCircle2, AlertCircle, ShieldCheck, User, Calendar, ExternalLink } from 'lucide-react';

interface AttendanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
}

export const AttendanceDetailModal: React.FC<AttendanceDetailModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  if (!record) return null;

  const mapsUrl = `https://www.google.com/maps?q=${record.location.latitude},${record.location.longitude}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail Kontrol Absensi WFH (${record.employeeNip})`}
      subtitle={`Audit Log Kontrol HRD • ID: ${record.id}`}
      maxWidth="3xl"
    >
      <div className="space-y-6 text-sm">
        {/* Employee Info Header */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg border border-indigo-500/30">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-100 text-base">{record.employeeName}</p>
              <p className="text-xs text-slate-400">
                NIP: <span className="text-indigo-400 font-mono font-semibold">{record.employeeNip}</span> • Divisi: {record.department}
              </p>
            </div>
          </div>

          <div className="ml-auto text-right">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                record.status === 'LATE'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {record.status === 'LATE' ? 'Terlambat Absen' : 'Tepat Waktu'}
            </span>
          </div>
        </div>

        {/* Captured WFH Photo Proof with Timestamp Watermark */}
        <div>
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Bukti Capture Foto WFH Karyawan (Webcam Audit)
          </span>
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
            <img
              src={record.photoProofUrl}
              alt="Bukti Absensi WFH"
              className="w-full h-80 object-cover"
            />
            <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/80 text-xs text-slate-200 space-y-0.5">
              <p className="font-semibold text-emerald-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Jam Absen: {record.clockInTime} WIB
              </p>
              <p className="text-[11px] text-slate-400">Tanggal: {formatIndonesianDate(record.date)}</p>
            </div>
          </div>
        </div>

        {/* Time & GPS Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 font-semibold block">Informasi Waktu & Status</span>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
              <span className="text-slate-400">Jam Masuk (Clock In):</span>
              <span className="font-bold text-emerald-400">{record.clockInTime} WIB</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
              <span className="text-slate-400">Jam Pulang (Clock Out):</span>
              <span className="font-bold text-sky-400">
                {record.clockOutTime ? `${record.clockOutTime} WIB` : 'Belum Absen Pulang'}
              </span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">Koordinat & Lokasi GPS WFH</span>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
              >
                Buka Google Maps <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-200 flex items-start gap-1.5 pt-1">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{record.location.address}</span>
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Lat: {record.location.latitude}, Lng: {record.location.longitude}
            </p>
          </div>
        </div>

        {/* Work Plan & Work Summary */}
        <div className="space-y-3">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-semibold block">Rencana Kerja (Work Plan):</span>
            <p className="text-xs text-slate-200 leading-relaxed">{record.workPlan}</p>
          </div>

          {record.workSummary && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-semibold block">Hasil / Ringkasan Kerja:</span>
              <p className="text-xs text-slate-200 leading-relaxed">{record.workSummary}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
