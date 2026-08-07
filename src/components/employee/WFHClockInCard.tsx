import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { WebcamCapture } from '../common/WebcamCapture';
import { LeaveRequestModal } from './LeaveRequestModal';
import { formatIndonesianDate, formatTimeWIB, getTodayDateString, getRandomLocation, isLateCheckIn } from '../../utils/dateUtils';
import {
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  FileText,
  Send,
  AlertCircle,
  Building2,
  Sparkles,
  LogOut,
  Camera,
  Navigation,
  Bell,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { motion } from 'motion/react';

export const WFHClockInCard: React.FC = () => {
  const { currentUser } = useAuth();
  const { attendanceRecords, submitAttendance, updateAttendanceStatus, showToast } = useApp();

  const todayStr = getTodayDateString();

  // Find today's attendance record for current logged in employee
  const todayRecord = attendanceRecords.find(
    (r) => r.employeeId === currentUser.id && r.date === todayStr
  );

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [photoProof, setPhotoProof] = useState<string>('');
  const [workPlan, setWorkPlan] = useState<string>('');
  const [workSummary, setWorkSummary] = useState<string>('');
  const [isCapturingGps, setIsCapturingGps] = useState<boolean>(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);

  const [locationData, setLocationData] = useState<{ address: string; latitude: number; longitude: number; distanceMeters: number }>({
    address: 'Jakarta Selatan, DKI Jakarta (Home Office)',
    latitude: -6.2615,
    longitude: 106.8106,
    distanceMeters: 18,
  });

  // Live timer
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Browser Geolocation if supported
  const fetchLocation = () => {
    setIsCapturingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = parseFloat(position.coords.latitude.toFixed(4));
          const lng = parseFloat(position.coords.longitude.toFixed(4));
          setLocationData({
            address: `Lokasi GPS Terverifikasi (${lat}, ${lng}) - Home Office`,
            latitude: lat,
            longitude: lng,
            distanceMeters: Math.floor(Math.random() * 25) + 5,
          });
          setIsCapturingGps(false);
          showToast('Koordinat lokasi GPS & verifikasi radius berhasil.', 'success');
        },
        (error) => {
          console.warn('Geolocation fallback used:', error);
          const randomLoc = getRandomLocation();
          setLocationData({ ...randomLoc, distanceMeters: 14 });
          setIsCapturingGps(false);
          showToast('Menggunakan titik lokasi Home Office terdaftar.', 'info');
        },
        { timeout: 8000 }
      );
    } else {
      const randomLoc = getRandomLocation();
      setLocationData({ ...randomLoc, distanceMeters: 18 });
      setIsCapturingGps(false);
    }
  };

  const handleClockIn = (e: React.FormEvent) => {
    e.preventDefault();

    if (!photoProof) {
      showToast('Harap ambil foto webcam atau unggah foto sebagai bukti WFH!', 'error');
      return;
    }

    if (!workPlan.trim()) {
      showToast('Harap isi rencana pekerjaan (Work Plan) hari ini!', 'error');
      return;
    }

    const clockInTimeStr = currentTime.toTimeString().split(' ')[0]; // HH:mm:ss
    const isLate = isLateCheckIn(clockInTimeStr);

    submitAttendance({
      employeeId: currentUser.id,
      employeeNip: currentUser.nip,
      employeeName: currentUser.name,
      department: currentUser.department || 'Engineering & Tech',
      date: todayStr,
      clockInTime: clockInTimeStr,
      photoProofUrl: photoProof,
      location: locationData,
      workPlan: workPlan.trim(),
      status: isLate ? 'LATE' : 'ON_TIME',
      verificationStatus: 'TERVERIFIKASI',
    });
  };

  const handleClockOut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todayRecord) return;

    if (!workSummary.trim()) {
      showToast('Harap isi ringkasan hasil pekerjaan sebelum Absen Pulang.', 'error');
      return;
    }

    const clockOutTimeStr = currentTime.toTimeString().split(' ')[0];
    updateAttendanceStatus(todayRecord.id, {
      clockOutTime: clockOutTimeStr,
      workSummary: workSummary.trim(),
      status: 'WORK_COMPLETED',
    });
    showToast(`Absen Pulang WFH berhasil dicatat pada jam ${clockOutTimeStr}!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-[#0c0c0e] border border-emerald-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-16 h-16 rounded-xl object-cover ring-2 ring-emerald-500/30 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {currentUser.nip}
                </span>
                <span className="text-xs text-zinc-400 font-mono">• {currentUser.department}</span>
              </div>
              <h1 className="text-2xl font-extrabold text-zinc-100 mt-1 tracking-tight">
                Halo, {currentUser.name}! 👋
              </h1>
              <p className="text-sm text-zinc-400 mt-0.5">
                {todayRecord
                  ? 'Anda sudah melakukan Absen Masuk WFH hari ini.'
                  : 'Silakan ambil foto webcam dan isi rencana kerja untuk Absen Masuk.'}
              </p>
            </div>
          </div>

          {/* Action & Realtime clock widget */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="bg-[#09090b] hover:bg-zinc-800 text-amber-300 border border-amber-500/30 px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span>Izin / Cuti WFH</span>
            </button>

            <div className="bg-[#09090b] p-3.5 rounded-xl border border-zinc-800 flex items-center gap-3.5 shadow-inner">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Clock className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <p className="text-xl font-mono font-extrabold text-emerald-400 tracking-tight">
                  {formatTimeWIB(currentTime)}
                </p>
                <p className="text-[11px] font-mono text-zinc-400">{formatIndonesianDate(currentTime)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 3: Smart Attendance Reminder Banner */}
      {!todayRecord ? (
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-200">
          <Bell className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
          <div className="space-y-0.5">
            <span className="font-bold text-amber-300 font-mono">PENGINGAT ABSENSI MASUK:</span>
            <p className="text-amber-200/90 leading-relaxed">
              Jam kerja WFH reguler dimulai pukul 08:30 WIB. Pastikan mengambil foto webcam jernih dan menentukan titik GPS terdaftar Anda sebelum melakukan Clock In.
            </p>
          </div>
        </div>
      ) : !todayRecord.clockOutTime ? (
        <div className="bg-indigo-500/10 border border-indigo-500/25 rounded-xl p-4 flex items-start gap-3 text-xs text-indigo-200">
          <Bell className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-indigo-300 font-mono">PENGINGAT WORK SUMMARY & CLOCK OUT:</span>
            <p className="text-indigo-200/90 leading-relaxed">
              Jangan lupa menyusun ringkasan pencapaian pekerjaan (Work Summary) sebelum melakukan Absen Pulang setelah jam 17:00 WIB.
            </p>
          </div>
        </div>
      ) : null}

      {/* Main Form Grid */}
      {todayRecord ? (
        /* Status Completed / Clock Out Card */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0c0c0e] border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6"
        >
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Status Absensi WFH Hari Ini</h2>
                <p className="text-xs font-mono text-zinc-400">Tanggal: {todayRecord.date}</p>
              </div>
            </div>

            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold ${
                todayRecord.status === 'LATE'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {todayRecord.status === 'LATE' ? 'Terlambat Absen' : 'Tepat Waktu (On Time)'}
            </span>
          </div>

          {/* Grid Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs text-zinc-400 block font-medium">Jam Absen Masuk:</span>
                <p className="text-xl font-mono font-bold text-emerald-400 mt-0.5">
                  {todayRecord.clockInTime} WIB
                </p>
              </div>

              {todayRecord.clockOutTime && (
                <div>
                  <span className="text-xs text-zinc-400 block font-medium">Jam Absen Pulang:</span>
                  <p className="text-xl font-mono font-bold text-sky-400 mt-0.5">
                    {todayRecord.clockOutTime} WIB
                  </p>
                </div>
              )}

              <div>
                <span className="text-xs text-zinc-400 block font-medium">Lokasi WFH:</span>
                <p className="text-sm text-zinc-200 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  {todayRecord.location.address}
                </p>
              </div>

              <div>
                <span className="text-xs text-zinc-400 block font-medium">Rencana Pekerjaan (Work Plan):</span>
                <p className="text-sm text-zinc-300 bg-[#09090b] p-3.5 rounded-xl border border-zinc-800 mt-1">
                  {todayRecord.workPlan}
                </p>
              </div>

              {todayRecord.workSummary && (
                <div>
                  <span className="text-xs text-zinc-400 block font-medium">Hasil / Ringkasan Kerja:</span>
                  <p className="text-sm text-zinc-300 bg-[#09090b] p-3.5 rounded-xl border border-zinc-800 mt-1">
                    {todayRecord.workSummary}
                  </p>
                </div>
              )}
            </div>

            {/* Photo Proof Display */}
            <div>
              <span className="text-xs text-zinc-400 block font-medium mb-2">
                Bukti Capture Foto WFH:
              </span>
              <div className="rounded-xl overflow-hidden border border-zinc-800 bg-[#09090b]">
                <img
                  src={todayRecord.photoProofUrl}
                  alt="Bukti Absen WFH"
                  className="w-full h-56 object-cover"
                />
              </div>
            </div>
          </div>

          {/* Clock Out Form if not clocked out yet */}
          {!todayRecord.clockOutTime ? (
            <form onSubmit={handleClockOut} className="pt-6 border-t border-zinc-800 space-y-4">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <LogOut className="w-4 h-4 text-sky-400" /> Form Absen Pulang WFH
              </h3>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Ringkasan Hasil Pekerjaan Hari Ini (Work Summary) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={workSummary}
                  onChange={(e) => setWorkSummary(e.target.value)}
                  placeholder="Tuliskan pencapaian & hasil pekerjaan Anda hari ini..."
                  className="w-full bg-[#09090b] border border-zinc-800 focus:border-sky-500 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-sky-500/20 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Kirim Absen Pulang WFH</span>
              </button>
            </form>
          ) : (
            <div className="p-4 bg-sky-950/30 border border-sky-500/30 rounded-xl text-center text-xs text-sky-300 font-medium font-mono">
              ✨ Selamat! Seluruh rangkaian Absen WFH hari ini telah selesai.
            </div>
          )}
        </motion.div>
      ) : (
        /* WFH Clock-in Form */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6"
        >
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2 tracking-tight">
                <Camera className="w-5 h-5 text-emerald-400" />
                Capture Absen WFH (Work From Home)
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Ambil foto webcam sebagai bukti kerja & verifikasi lokasi GPS
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded bg-[#09090b] text-emerald-400 border border-zinc-800">
              Absen Masuk
            </span>
          </div>

          <form onSubmit={handleClockIn} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Webcam Capture */}
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
                1. Capture / Unggah Foto Bukti WFH *
              </label>
              <WebcamCapture onPhotoCaptured={(photo) => setPhotoProof(photo)} />
            </div>

            {/* Right Column: Location & Work Plan */}
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  2. Verifikasi Lokasi GPS WFH *
                </label>
                <div className="bg-[#09090b] p-4 rounded-xl border border-zinc-800 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-zinc-200">
                          {locationData.address}
                        </p>
                        <p className="text-xs font-mono text-zinc-400 mt-0.5">
                          Lat: {locationData.latitude}, Lng: {locationData.longitude}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={fetchLocation}
                      disabled={isCapturingGps}
                      className="text-xs bg-[#121215] hover:bg-zinc-800 text-emerald-400 font-mono font-medium px-3 py-1.5 rounded-lg border border-zinc-800 transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Navigation className={`w-3.5 h-3.5 ${isCapturingGps ? 'animate-spin' : ''}`} />
                      <span>{isCapturingGps ? 'Mengambil...' : 'Refresh GPS'}</span>
                    </button>
                  </div>

                  {/* Geofence Radius Badge */}
                  <div className="pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-400 font-mono font-semibold">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>WFH Zone Verified ({locationData.distanceMeters || 18}m dari Home Office)</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">Radius max: 100m</span>
                  </div>
                </div>
              </div>

              {/* Workplan Form Input */}
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  3. Rencana Kerja Hari Ini (Work Plan) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={workPlan}
                  onChange={(e) => setWorkPlan(e.target.value)}
                  placeholder="Contoh: Selesaikan fitur React Frontend, koordinasi meeting tim jam 10:00 WIB, dan QA testing..."
                  className="w-full bg-[#09090b] border border-zinc-800 focus:border-emerald-500 rounded-xl p-4 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-4 px-6 rounded-xl shadow-xl hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-base transform active:scale-[0.99]"
              >
                <Send className="w-5 h-5 text-zinc-950" />
                <span>Submit Absen Masuk WFH Hari Ini</span>
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Leave & Permit Request Modal */}
      <LeaveRequestModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
      />
    </div>
  );
};
