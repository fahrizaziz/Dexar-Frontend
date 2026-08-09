import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkShift, HolidayCalendar, GeofenceConfig } from '../../types';
import { GeofenceModal } from './GeofenceModal';
import {
  MapPin,
  Clock,
  Calendar,
  Save,
  Plus,
  Trash2,
  Navigation,
  CheckCircle2,
  Sliders,
  Building2,
  AlertCircle,
  Sparkles,
  ShieldAlert,
  Edit3,
} from 'lucide-react';

export const GeofenceAndShiftConfig: React.FC = () => {
  const {
    geofenceConfig,
    updateGeofenceConfig,
    workShifts,
    saveWorkShiftsList,
    holidays,
    saveHolidaysList,
    showToast,
    addAuditLog,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'GEOFENCE' | 'SHIFTS' | 'HOLIDAYS'>('GEOFENCE');

  // Modal State for Geofence
  const [isGeofenceModalOpen, setIsGeofenceModalOpen] = useState(false);
  const [editingGeofence, setEditingGeofence] = useState<GeofenceConfig | null>(null);
  const [workStartTime, setWorkStartTime] = useState('');
  const [workEndTime, setWorkEndTime] = useState('');
  const [lateToleranceMinutes, setLateToleranceMinutes] = useState('');
  const [wfhIncentivePerDay, setWfhIncentivePerDay] = useState(
    (geofenceConfig.wfhIncentivePerDay || 50000).toString()
  );
  const [lateDeductionPerOccurrence, setLateDeductionPerOccurrence] = useState(
    (geofenceConfig.lateDeductionPerOccurrence || 25000).toString()
  );

  // New Holiday Form
  const [newHolidayTitle, setNewHolidayTitle] = useState('');
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayType, setNewHolidayType] = useState<'NATIONAL' | 'CUTI_BERSAMA'>('NATIONAL');

  // New Shift Form
  const [newShiftCode, setNewShiftCode] = useState('');
  const [newShiftName, setNewShiftName] = useState('');
  const [newShiftStart, setNewShiftStart] = useState('08:30');
  const [newShiftEnd, setNewShiftEnd] = useState('17:30');

  const handleSaveGeofence = (e: React.FormEvent) => {
    e.preventDefault();
    const finalOfficeName = officeName.trim() || geofenceConfig.officeName || 'Kantor Pusat HQ Jakarta (South Quarter)';
    const parsedLat = latitude ? parseFloat(latitude) : geofenceConfig.latitude || -6.2915;
    const parsedLong = longitude ? parseFloat(longitude) : geofenceConfig.longitude || 106.7932;
    const parsedRadius = radiusMeters ? parseInt(radiusMeters, 10) : geofenceConfig.radiusMeters || 150;
    const finalStartTime = workStartTime || geofenceConfig.workStartTime || '08:30';
    const finalEndTime = workEndTime || geofenceConfig.workEndTime || '17:30';
    const parsedTolerance = lateToleranceMinutes ? parseInt(lateToleranceMinutes, 10) : geofenceConfig.lateToleranceMinutes || 15;

    if (isNaN(parsedLat) || isNaN(parsedLong) || isNaN(parsedRadius) || isNaN(parsedTolerance)) {
      showToast('Harap masukkan angka latitude/longitude/radius yang valid!', 'error');
      return;
    }

    const updated = {
      officeName: finalOfficeName,
      latitude: parsedLat,
      longitude: parsedLong,
      radiusMeters: parsedRadius,
      workStartTime: finalStartTime,
      workEndTime: finalEndTime,
      lateToleranceMinutes: parsedTolerance,
      wfhIncentivePerDay: Number(wfhIncentivePerDay) || 50000,
      lateDeductionPerOccurrence: Number(lateDeductionPerOccurrence) || 25000,
    };

    updateGeofenceConfig(updated);
    addAuditLog({
      actorNip: 'EMP-2026-002',
      actorName: 'HRD Admin',
      actorRole: 'HRD_ADMIN',
      action: 'UPDATE_GEOFENCE_CONFIG',
      category: 'SYSTEM',
      details: `Memperbarui lokasi geofence kantor ${officeName} (Lat: ${parsedLat}, Long: ${parsedLong}, Radius: ${parsedRadius}m).`,
    });
  };

  const handleAddShift = () => {
    if (!newShiftCode || !newShiftName) {
      showToast('Harap isi kode & nama shift!', 'error');
      return;
    }

    const created: WorkShift = {
      id: `shf-${Date.now()}`,
      code: newShiftCode.toUpperCase(),
      name: newShiftName,
      startTime: newShiftStart,
      endTime: newShiftEnd,
      breakStartTime: '12:00',
      breakEndTime: '13:00',
      isDefault: false,
    };

    const updatedList = [...workShifts, created];
    saveWorkShiftsList(updatedList);
    setNewShiftCode('');
    setNewShiftName('');
  };

  const handleDeleteShift = (id: string) => {
    const updated = workShifts.filter((s) => s.id !== id);
    saveWorkShiftsList(updated);
  };

  const handleAddHoliday = () => {
    if (!newHolidayTitle || !newHolidayDate) {
      showToast('Harap isi judul dan tanggal libur!', 'error');
      return;
    }

    const created: HolidayCalendar = {
      id: `hol-${Date.now()}`,
      title: newHolidayTitle,
      date: newHolidayDate,
      type: newHolidayType,
      isCutQuota: newHolidayType === 'CUTI_BERSAMA',
    };

    const updated = [...holidays, created];
    saveHolidaysList(updated);
    setNewHolidayTitle('');
    setNewHolidayDate('');
  };

  const handleDeleteHoliday = (id: string) => {
    const updated = holidays.filter((h) => h.id !== id);
    saveHolidaysList(updated);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-[#121215] border border-zinc-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-0.5 rounded uppercase flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Fitur #3 & #5: Geofencing & Shift Schedule Management
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight flex items-center gap-3">
              <Navigation className="w-8 h-8 text-cyan-400 shrink-0" />
              <span>Geofencing Radius & Shift Jam Kerja</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Atur koordinat GPS kantor untuk validasi On-Site/Hybrid, toleransi keterlambatan, manajemen shift kerja (Pagi/Reguler/Flexi WFH), dan kalender libur nasional.
            </p>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-[#09090b] p-1.5 rounded-2xl border border-zinc-800">
            <button
              onClick={() => setActiveSubTab('GEOFENCE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'GEOFENCE'
                  ? 'bg-cyan-500 text-zinc-950 shadow-lg shadow-cyan-500/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Geofence Kantor
            </button>
            <button
              onClick={() => setActiveSubTab('SHIFTS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'SHIFTS'
                  ? 'bg-cyan-500 text-zinc-950 shadow-lg shadow-cyan-500/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Shift Kerja
            </button>
            <button
              onClick={() => setActiveSubTab('HOLIDAYS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'HOLIDAYS'
                  ? 'bg-cyan-500 text-zinc-950 shadow-lg shadow-cyan-500/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Kalender Libur
            </button>
          </div>
        </div>
      </div>

      {/* Subtab 1: GEOFENCE CONFIG & OFFICE LOCATIONS TABLE */}
      {activeSubTab === 'GEOFENCE' && (
        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-zinc-100 flex items-center gap-2">
                  <span>Daftar Lokasi Kantor & Geofence Radius</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Master data lokasi gedung kantor resmi yang terdaftar di database MySQL <code className="text-cyan-400 font-mono font-bold">geofence_configs</code>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingGeofence(null);
                setIsGeofenceModalOpen(true);
              }}
              className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Lokasi Kantor Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/90 text-zinc-400 font-mono uppercase text-[11px] border-b border-zinc-800">
                <tr>
                  <th className="px-5 py-3.5">Nama Lokasi / Gedung</th>
                  <th className="px-5 py-3.5">Koordinat GPS</th>
                  <th className="px-5 py-3.5">Radius Maksimal</th>
                  <th className="px-5 py-3.5">Jam Kerja Reguler</th>
                  <th className="px-5 py-3.5">Toleransi</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono text-zinc-200">
                <tr className="hover:bg-zinc-900/50 transition-colors">
                  <td className="px-5 py-4 font-bold font-sans text-zinc-100 flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{geofenceConfig.officeName || 'Kantor Pusat HQ Jakarta (South Quarter)'}</span>
                  </td>
                  <td className="px-5 py-4 text-zinc-300">
                    {geofenceConfig.latitude || -6.2915}, {geofenceConfig.longitude || 106.7932}
                  </td>
                  <td className="px-5 py-4 text-emerald-400 font-bold">
                    {geofenceConfig.radiusMeters || 150} Meter
                  </td>
                  <td className="px-5 py-4 text-zinc-300">
                    {geofenceConfig.workStartTime || '08:30'} - {geofenceConfig.workEndTime || '17:30'} WIB
                  </td>
                  <td className="px-5 py-4 text-amber-400 font-bold">
                    {geofenceConfig.lateToleranceMinutes || 15} Menit
                  </td>
                  <td className="px-5 py-4 text-center font-sans whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap inline-flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span>KANTOR UTAMA (AKTIF)</span>
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-sans">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingGeofence(geofenceConfig);
                        setIsGeofenceModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 border border-zinc-700/60 shadow-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Edit Lokasi</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Geofence Modal for Adding / Editing office locations */}
      <GeofenceModal
        isOpen={isGeofenceModalOpen}
        onClose={() => {
          setIsGeofenceModalOpen(false);
          setEditingGeofence(null);
        }}
        initialData={editingGeofence}
        onSave={(updated) => {
          updateGeofenceConfig(updated);
          showToast(`Lokasi geofence ${updated.officeName} berhasil disimpan!`, 'success');
          addAuditLog({
            actorNip: 'EMP-2026-001',
            actorName: 'HRD Admin',
            actorRole: 'HRD_ADMIN',
            action: 'UPDATE_GEOFENCE_CONFIG',
            category: 'SYSTEM',
            details: `Mengubah konfigurasi geofence lokasi ${updated.officeName} (Lat: ${updated.latitude}, Long: ${updated.longitude}, Radius: ${updated.radiusMeters}m).`,
          });
        }}
      />

      {/* Subtab 2: SHIFT SCHEDULES */}
      {activeSubTab === 'SHIFTS' && (
        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <span>Manajemen Shift Kerja Perusahaan</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">Kelola variasi jam kerja karyawan (Pagi, Reguler, Flexi WFH)</p>
            </div>
          </div>

          {/* Add Shift Bar */}
          <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
            <input
              type="text"
              value={newShiftCode}
              onChange={(e) => setNewShiftCode(e.target.value)}
              placeholder="Kode Shift (e.g. SHIFT-MALAM)"
              className="bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-xl px-3 py-2 outline-none font-mono"
            />
            <input
              type="text"
              value={newShiftName}
              onChange={(e) => setNewShiftName(e.target.value)}
              placeholder="Nama Shift"
              className="bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-xl px-3 py-2 outline-none"
            />
            <input
              type="time"
              value={newShiftStart}
              onChange={(e) => setNewShiftStart(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-xl px-3 py-2 outline-none font-mono"
            />
            <input
              type="time"
              value={newShiftEnd}
              onChange={(e) => setNewShiftEnd(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-xl px-3 py-2 outline-none font-mono"
            />
            <button
              onClick={handleAddShift}
              className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold rounded-xl px-4 py-2 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Shift</span>
            </button>
          </div>

          {/* Shifts Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#09090b] text-zinc-400 font-mono border-b border-zinc-800">
                <tr>
                  <th className="py-4 px-6">Kode Shift</th>
                  <th className="py-4 px-6">Nama Shift</th>
                  <th className="py-4 px-6">Jam Masuk</th>
                  <th className="py-4 px-6">Jam Pulang</th>
                  <th className="py-4 px-6">Istirahat</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-[#0c0c0e]">
                {workShifts.map((shf) => (
                  <tr key={shf.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-cyan-400">{shf.code}</td>
                    <td className="py-4 px-6 font-bold text-zinc-100">{shf.name}</td>
                    <td className="py-4 px-6 font-mono text-emerald-400 font-bold">{shf.startTime} WIB</td>
                    <td className="py-4 px-6 font-mono text-indigo-400 font-bold">{shf.endTime} WIB</td>
                    <td className="py-4 px-6 font-mono text-zinc-400">
                      {shf.breakStartTime} - {shf.breakEndTime}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {!shf.isDefault ? (
                        <button
                          onClick={() => handleDeleteShift(shf.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-zinc-500">Default Shift</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 3: HOLIDAY CALENDAR */}
      {activeSubTab === 'HOLIDAYS' && (
        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                <span>Kalender Libur Nasional & Cuti Bersama</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">Daftar hari libur bebas absensi WFH per tahun 2026</p>
            </div>
          </div>

          {/* Add Holiday Bar */}
          <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <input
              type="text"
              value={newHolidayTitle}
              onChange={(e) => setNewHolidayTitle(e.target.value)}
              placeholder="Judul Hari Libur (e.g. HUT RI ke-81)"
              className="bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-xl px-3 py-2 outline-none"
            />
            <input
              type="date"
              value={newHolidayDate}
              onChange={(e) => setNewHolidayDate(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-xl px-3 py-2 outline-none font-mono"
            />
            <select
              value={newHolidayType}
              onChange={(e) => setNewHolidayType(e.target.value as any)}
              className="bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-xl px-3 py-2 outline-none"
            >
              <option value="NATIONAL">Libur Nasional (Tidak Potong Cuti)</option>
              <option value="CUTI_BERSAMA">Cuti Bersama (Potong Cuti)</option>
            </select>
            <button
              onClick={handleAddHoliday}
              className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold rounded-xl px-4 py-2 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Libur</span>
            </button>
          </div>

          {/* Holidays Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#09090b] text-zinc-400 font-mono border-b border-zinc-800">
                <tr>
                  <th className="py-4 px-6">Tanggal Libur</th>
                  <th className="py-4 px-6">Nama / Keterangan Libur</th>
                  <th className="py-4 px-6">Kategori Libur</th>
                  <th className="py-4 px-6 text-center">Potong Kuota Cuti?</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-[#0c0c0e]">
                {holidays.map((hol) => (
                  <tr key={hol.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-cyan-400">{hol.date}</td>
                    <td className="py-4 px-6 font-bold text-zinc-100">{hol.title}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {hol.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-mono">
                      {hol.isCutQuota ? (
                        <span className="text-amber-400 font-bold">Ya (Potong Cuti)</span>
                      ) : (
                        <span className="text-emerald-400 font-bold">Tidak (Bebas)</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleDeleteHoliday(hol.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
