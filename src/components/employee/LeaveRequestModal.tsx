import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Calendar, FileText, Send, Clock, CheckCircle2 } from 'lucide-react';
import { getTodayDateString } from '../../utils/dateUtils';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { submitLeaveRequest } = useApp();

  const [type, setType] = useState<'CUTI' | 'SAKIT' | 'TUKAR_HARI_WFH' | 'LEMBUR'>('TUKAR_HARI_WFH');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [endDate, setEndDate] = useState(getTodayDateString());
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    submitLeaveRequest({
      employeeId: currentUser.id,
      employeeNip: currentUser.nip,
      employeeName: currentUser.name,
      department: currentUser.department || 'Engineering & Tech',
      type,
      startDate,
      endDate,
      reason,
      status: 'PENDING',
    });

    setReason('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pengajuan Izin, Cuti, & Tukar Hari WFH"
      subtitle="Kirimkan permohonan ke HRD untuk Cuti, Sakit, Lembur, atau Tukar Jadwal WFH"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Jenis Permohonan *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(
              [
                { id: 'TUKAR_HARI_WFH', label: 'Tukar WFH', icon: '🔄' },
                { id: 'CUTI', label: 'Cuti Tahunan', icon: '🏖️' },
                { id: 'SAKIT', label: 'Izin Sakit', icon: '🩺' },
                { id: 'LEMBUR', label: 'Lembur WFH', icon: '⚡' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setType(item.id)}
                className={`p-3 rounded-xl border text-xs font-medium text-center transition-all flex flex-col items-center gap-1.5 ${
                  type === item.id
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/30'
                    : 'bg-[#09090b] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Tanggal Mulai *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full bg-[#09090b] border border-zinc-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Tanggal Selesai *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full bg-[#09090b] border border-zinc-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Alasan / Keterangan Lengkap *
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Tuliskan alasan permohonan atau detail tukar hari WFH..."
              required
              className="w-full bg-[#09090b] border border-zinc-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-colors resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg hover:shadow-emerald-500/20 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim Permohonan</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
