import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkShift, HolidayCalendar } from '../../types';
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

  // Geofence form state
  const [officeName, setOfficeName] = useState(geofenceConfig.officeName);
  const [latitude, setLatitude] = useState(geofenceConfig.latitude.toString());
  const [longitude, setLongitude] = useState(geofenceConfig.longitude.toString());
  const [radiusMeters, setRadiusMeters] = useState(geofenceConfig.radiusMeters.toString());
  const [workStartTime, setWorkStartTime] = useState(geofenceConfig.workStartTime);
  const [workEndTime, setWorkEndTime] = useState(geofenceConfig.workEndTime);
  const [lateToleranceMinutes, setLateToleranceMinutes] = useState(
    geofenceConfig.lateToleranceMinutes.toString()
  );
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
    const parsedLat = parseFloat(latitude);
    const parsedLong = parseFloat(longitude);
    const parsedRadius = parseInt(radiusMeters, 10);
    const parsedTolerance = parseInt(lateToleranceMinutes, 10);

    if (isNaN(parsedLat) || isNaN(parsedLong) || isNaN(parsedRadius) || isNaN(parsedTolerance)) {
      showToast('Harap masukkan angka latitude/longitude/radius yang valid!', 'error');
      return;
    }

    const updated = {
      officeName,
      latitude: parsedLat,
      longitude: parsedLong,
      radiusMeters: parsedRadius,
      workStartTime,
      workEndTime,
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

      {/* Subtab 1: GEOFENCE CONFIG */}
      {activeSubTab === 'GEOFENCE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[#0c0c0e] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-4 mb-6">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <span>Pengaturan Radius & Koordinat Kantor Utama</span>
            </h2>

            <form onSubmit={handleSaveGeofence} className="space-y-6 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1.5">Nama Lokasi Kantor / Gedung</label>
                <input
                  type="text"
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl p-3 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1.5">Latitude (GPS)</label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono rounded-xl p-3 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1.5">Longitude (GPS)</label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono rounded-xl p-3 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1.5">Radius Maksimal (Meter)</label>
                  <input
                    type="number"
                    value={radiusMeters}
                    onChange={(e) => setRadiusMeters(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-cyan-400 font-mono font-bold rounded-xl p-3 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1.5">Jam Masuk Reguler</label>
                  <input
                    type="time"
                    value={workStartTime}
                    onChange={(e) => setWorkStartTime(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono rounded-xl p-3 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1.5">Jam Pulang Reguler</label>
                  <input
                    type="time"
                    value={workEndTime}
                    onChange={(e) => setWorkEndTime(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono rounded-xl p-3 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1.5">Toleransi Keterlambatan (Menit)</label>
                  <input
                    type="number"
                    value={lateToleranceMinutes}
                    onChange={(e) => setLateToleranceMinutes(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-amber-400 font-mono font-bold rounded-xl p-3 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Tarif Payroll & Rules */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1.5">Tarif Insentif WFH (IDR / Hari)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-xs font-mono font-bold text-emerald-400">Rp</span>
                    <input
                      type="number"
                      min={0}
                      step={5000}
                      value={wfhIncentivePerDay === '0' || wfhIncentivePerDay === '' ? '' : wfhIncentivePerDay}
                      onChange={(e) => setWfhIncentivePerDay(e.target.value === '' ? '0' : e.target.value)}
                      placeholder="0"
                      className="w-full bg-zinc-900 border border-zinc-800 text-emerald-400 font-mono font-bold rounded-xl pl-10 pr-3 py-3 outline-none focus:border-cyan-500 text-xs"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">Insentif per hari WFH yang berhasil dikerjakan.</p>
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1.5">Denda Keterlambatan (IDR / Kejadian)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-xs font-mono font-bold text-rose-400">Rp</span>
                    <input
                      type="number"
                      min={0}
                      step={5000}
                      value={lateDeductionPerOccurrence === '0' || lateDeductionPerOccurrence === '' ? '' : lateDeductionPerOccurrence}
                      onChange={(e) => setLateDeductionPerOccurrence(e.target.value === '' ? '0' : e.target.value)}
                      placeholder="0"
                      className="w-full bg-zinc-900 border border-zinc-800 text-rose-400 font-mono font-bold rounded-xl pl-10 pr-3 py-3 outline-none focus:border-cyan-500 text-xs"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">Potongan gaji per kejadian keterlambatan absensi.</p>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  <Save className="w-4 h-4" />
                  Simpan Konfigurasi Geofencing
                </button>
              </div>
            </form>
          </div>

          {/* Map Preview Card */}
          <div className="bg-[#0c0c0e] border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Status Geofencing Visual</span>
            </h3>

            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Pusat Kantor:</span>
                <span className="font-mono text-cyan-400 font-bold">{geofenceConfig.officeName}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Koordinat:</span>
                <span className="font-mono text-zinc-300">{geofenceConfig.latitude}, {geofenceConfig.longitude}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Radius Toleransi On-Site:</span>
                <span className="font-mono text-emerald-400 font-bold">{geofenceConfig.radiusMeters} Meter</span>
              </div>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-2xl text-xs text-cyan-300 leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
              <span>
                Ketika karyawan melakukan Clock-In, sistem akan otomatis menghitung rumus <strong>Haversine Distance</strong> terhadap koordinat kantor di atas.
              </span>
            </div>
          </div>
        </div>
      )}

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
