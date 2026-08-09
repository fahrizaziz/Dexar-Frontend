import React, { useState, useEffect } from 'react';
import { GeofenceConfig } from '../../types';
import { Modal } from '../common/Modal';
import { MapPin, Building2, Clock, AlertTriangle, Save } from 'lucide-react';

interface GeofenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: GeofenceConfig | null;
  onSave: (config: GeofenceConfig) => void;
}

export const GeofenceModal: React.FC<GeofenceModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const [officeName, setOfficeName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radiusMeters, setRadiusMeters] = useState('150');
  const [workStartTime, setWorkStartTime] = useState('08:30');
  const [workEndTime, setWorkEndTime] = useState('17:30');
  const [lateToleranceMinutes, setLateToleranceMinutes] = useState('15');

  useEffect(() => {
    if (initialData) {
      setOfficeName(initialData.officeName || 'Kantor Pusat HQ Jakarta (South Quarter)');
      setLatitude(initialData.latitude ? initialData.latitude.toString() : '-6.2915');
      setLongitude(initialData.longitude ? initialData.longitude.toString() : '106.7932');
      setRadiusMeters(initialData.radiusMeters ? initialData.radiusMeters.toString() : '150');
      setWorkStartTime(initialData.workStartTime || '08:30');
      setWorkEndTime(initialData.workEndTime || '17:30');
      setLateToleranceMinutes(
        initialData.lateToleranceMinutes ? initialData.lateToleranceMinutes.toString() : '15'
      );
    } else {
      setOfficeName('');
      setLatitude('');
      setLongitude('');
      setRadiusMeters('150');
      setWorkStartTime('08:30');
      setWorkEndTime('17:30');
      setLateToleranceMinutes('15');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLat = parseFloat(latitude);
    const parsedLong = parseFloat(longitude);
    const parsedRadius = parseInt(radiusMeters, 10);
    const parsedTolerance = parseInt(lateToleranceMinutes, 10);

    const updated: GeofenceConfig = {
      id: initialData?.id || `geo-${Date.now()}`,
      officeName: officeName.trim() || 'Kantor Pusat HQ Jakarta (South Quarter)',
      latitude: isNaN(parsedLat) ? -6.2915 : parsedLat,
      longitude: isNaN(parsedLong) ? 106.7932 : parsedLong,
      radiusMeters: isNaN(parsedRadius) ? 150 : parsedRadius,
      workStartTime: workStartTime || '08:30',
      workEndTime: workEndTime || '17:30',
      lateToleranceMinutes: isNaN(parsedTolerance) ? 15 : parsedTolerance,
      wfhIncentivePerDay: initialData?.wfhIncentivePerDay || 0,
      lateDeductionPerOccurrence: initialData?.lateDeductionPerOccurrence || 0,
    };

    onSave(updated);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Lokasi Geofence Kantor' : 'Tambah Lokasi Geofence Kantor Baru'}
      subtitle={initialData ? `Atur ulang koordinat & radius lokasi: ${initialData.officeName}` : 'Daftarkan titik lokasi gedung kantor / cabang baru'}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        {/* Nama Gedung Kantor */}
        <div>
          <label className="block text-zinc-300 font-semibold mb-1.5 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>Nama Lokasi Kantor / Gedung Cabang *</span>
          </label>
          <input
            type="text"
            required
            value={officeName}
            onChange={(e) => setOfficeName(e.target.value)}
            placeholder="Contoh: Kantor Pusat HQ Jakarta (South Quarter) / Cabang Bandung"
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl p-3 outline-none focus:border-cyan-500 font-medium"
          />
        </div>

        {/* Latitude, Longitude, Radius */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-zinc-300 font-semibold mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Latitude (GPS) *</span>
            </label>
            <input
              type="text"
              required
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="Contoh: -6.2915"
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono rounded-xl p-3 outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Longitude (GPS) *</span>
            </label>
            <input
              type="text"
              required
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="Contoh: 106.7932"
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono rounded-xl p-3 outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1.5">Radius Maksimal (Meter) *</label>
            <input
              type="number"
              required
              value={radiusMeters}
              onChange={(e) => setRadiusMeters(e.target.value)}
              placeholder="150"
              className="w-full bg-zinc-900 border border-zinc-800 text-cyan-400 font-mono font-bold rounded-xl p-3 outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Jam Kerja Reguler & Toleransi */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-zinc-800/80">
          <div>
            <label className="block text-zinc-300 font-semibold mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Jam Masuk Reguler *</span>
            </label>
            <input
              type="time"
              required
              value={workStartTime}
              onChange={(e) => setWorkStartTime(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono rounded-xl p-3 outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Jam Pulang Reguler *</span>
            </label>
            <input
              type="time"
              required
              value={workEndTime}
              onChange={(e) => setWorkEndTime(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono rounded-xl p-3 outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1.5">Toleransi Terlambat (Menit) *</label>
            <input
              type="number"
              required
              value={lateToleranceMinutes}
              onChange={(e) => setLateToleranceMinutes(e.target.value)}
              placeholder="15"
              className="w-full bg-zinc-900 border border-zinc-800 text-amber-400 font-mono font-bold rounded-xl p-3 outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Lokasi Kantor</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
