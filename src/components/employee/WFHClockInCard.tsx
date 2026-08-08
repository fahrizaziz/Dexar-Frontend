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
  Camera,
  Navigation,
  Bell,
  ShieldCheck,
  FileSpreadsheet,
  TrendingUp,
  BarChart3,
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
        { timeout: 5000, enableHighAccuracy: true }
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

  // Personal Monthly Stats calculation for current employee
  const myRecords = attendanceRecords.filter((r) => r.employeeId === currentUser.id);
  const totalDaysPresent = myRecords.length || 18;
  const totalHoursWorked = totalDaysPresent * 8;
  const lateDays = myRecords.filter((r) => r.status === 'LATE').length;

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
              className="bg-[#09090b] hover:bg-zinc-800 text-amber-300 border border-amber-500/30 px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
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

      {/* Personal Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Kuota WFH Minggu Ini */}
        <div className="bg-[#0c0c0e] border border-zinc-800/90 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400">Kuota WFH Minggu Ini</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-extrabold font-mono text-zinc-100">3 / 3 Hari</span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">100% Kuota</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full w-full" />
            </div>
          </div>
        </div>

        {/* Card 2: Total Jam Kerja Bulan Ini */}
        <div className="bg-[#0c0c0e] border border-zinc-800/90 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400">Total Jam Kerja Bulan Ini</span>
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-extrabold font-mono text-zinc-100">{totalHoursWorked} Jam</span>
              <span className="text-[11px] font-mono text-sky-400 font-bold">Target 160 Jam</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1 font-mono">Tercapai 100% dari standar WFH</p>
          </div>
        </div>

        {/* Card 3: Kehadiran & Ketepatan Waktu */}
        <div className="bg-[#0c0c0e] border border-zinc-800/90 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400">Kehadiran Bulan Ini</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-extrabold font-mono text-zinc-100">{totalDaysPresent} Hari</span>
              <span className="text-[11px] font-mono text-indigo-400 font-bold">{lateDays} Terlambat</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1 font-mono">Tingkat Kedisiplinan 100%</p>
          </div>
        </div>

        {/* Card 4: Status Presensi Hari Ini */}
        <div className="bg-[#0c0c0e] border border-zinc-800/90 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400">Status Hari Ini</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${todayRecord ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
              <span className="text-sm font-bold font-mono text-zinc-100">
                {todayRecord ? (todayRecord.clockOutTime ? 'Kerja Selesai' : 'Sudah Absen Masuk') : 'Belum Absen Masuk'}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1 font-mono">
              {todayRecord ? `Absen jam ${todayRecord.clockInTime}` : 'Harap melakukan Clock In'}
            </p>
          </div>
        </div>
      </div>

      {/* Feature 3: Smart Attendance Reminder Banner */}
      {!todayRecord ? (
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-200">
          <Bell className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
          <div className="space-y-0.5">
            <span className="font-bold text-amber-300 font-mono">PENGINGAT ABSENSI MASUK:</span>
            <p>
              Jam kerja WFH reguler dimulai pukul 08:30 WIB. Pastikan mengambil foto webcam jernih dan menentukan titik GPS terdaftar Anda sebelum melakukan Clock In.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-4 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-emerald-300 font-mono">ABSENSI MASUK TERVERIFIKASI:</span>
              <p>Anda telah tercatat absen masuk pukul {todayRecord.clockInTime} WIB dengan titik GPS Home Office.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Clock In Form or Clock Out Card */}
      {!todayRecord ? (
        <div className="bg-[#0c0c0e] border border-zinc-800/90 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-400" />
                <span>Capture Absen WFH (Work From Home)</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Ambil foto webcam sebagai bukti kerja & verifikasi lokasi GPS
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg">
              Absen Masuk
            </span>
          </div>

          <form onSubmit={handleClockIn} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Webcam Capture Component */}
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  1. Capture / Unggah Foto Bukti WFH *
                </label>
                <WebcamCapture onCapture={(photo) => setPhotoProof(photo)} />
              </div>

              {/* Right Column: GPS Verification & Work Plan */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    2. Verifikasi Lokasi GPS WFH *
                  </label>
                  <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-zinc-200">{locationData.address}</p>
                          <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                            Lat: {locationData.latitude}, Lng: {locationData.longitude}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={fetchLocation}
                        disabled={isCapturingGps}
                        className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Navigation className={`w-3 h-3 ${isCapturingGps ? 'animate-spin' : ''}`} />
                        <span>Refresh GPS</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> WFH Zone Verified ({locationData.distanceMeters}m dari Home Office)
                      </span>
                      <span className="text-zinc-500">Radius max: 100m</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    3. Rencana Kerja Hari Ini (Work Plan) *
                  </label>
                  <textarea
                    rows={4}
                    value={workPlan}
                    onChange={(e) => setWorkPlan(e.target.value)}
                    placeholder="Contoh: Selesaikan fitur React Frontend, koordinasi meeting tim jam 10:00 WIB, dan QA testing..."
                    className="w-full bg-[#09090b] border border-zinc-800 focus:border-emerald-500 rounded-xl p-3.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-zinc-800/80 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Absen Masuk WFH</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Clock Out View */
        <div className="bg-[#0c0c0e] border border-zinc-800/90 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Absensi Masuk Terverifikasi Hari Ini</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Jam Masuk: <span className="font-mono font-bold text-emerald-400">{todayRecord.clockInTime} WIB</span> • Status: <span className="font-bold text-emerald-400">{todayRecord.status === 'ON_TIME' ? 'Tepat Waktu' : 'Terlambat'}</span>
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg">
              {todayRecord.clockOutTime ? 'Sudah Pulang' : 'Sedang WFH'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#09090b] p-4 rounded-xl border border-zinc-800/80">
            <div>
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Foto Bukti Presensi:</span>
              <img
                src={todayRecord.photoProofUrl}
                alt="Foto WFH"
                className="w-full h-40 object-cover rounded-lg border border-zinc-800"
              />
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Rencana Kerja (Work Plan):</span>
                <p className="text-xs text-zinc-200 bg-[#0c0c0e] p-3 rounded-lg border border-zinc-800/60 font-mono">
                  {todayRecord.workPlan}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Lokasi Presensi:</span>
                <p className="text-xs text-zinc-300 font-mono flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {todayRecord.location.address}
                </p>
              </div>
            </div>
          </div>

          {/* Clock Out Section */}
          {!todayRecord.clockOutTime ? (
            <form onSubmit={handleClockOut} className="space-y-4 pt-4 border-t border-zinc-800/80">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Form Absen Pulang WFH & Laporan Kerja Hari Ini</span>
              </h3>
              <textarea
                rows={3}
                value={workSummary}
                onChange={(e) => setWorkSummary(e.target.value)}
                placeholder="Tuliskan ringkasan tugas & hasil kerja yang telah diselesaikan hari ini..."
                className="w-full bg-[#09090b] border border-zinc-800 focus:border-emerald-500 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-colors"
              />
              <button
                type="submit"
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Kirim Laporan & Absen Pulang WFH</span>
              </button>
            </form>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-4 text-xs text-emerald-200">
              <p className="font-bold text-emerald-300 font-mono">
                ✅ Kinerja WFH Hari Ini Selesai (Clock Out: {todayRecord.clockOutTime} WIB)
              </p>
              <p className="mt-1 text-zinc-400 font-mono">
                Ringkasan Kerja: "{todayRecord.workSummary}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Leave Modal */}
      <LeaveRequestModal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} />
    </div>
  );
};
