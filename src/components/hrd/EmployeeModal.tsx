import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Employee, Department, Role } from '../../types';
import { useApp } from '../../context/AppContext';
import { User, Mail, Phone, Building2, Briefcase, Calendar, ShieldCheck, Upload, Camera, Trash2, CheckCircle2 } from 'lucide-react';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employeeData: Omit<Employee, 'id'>) => void;
  initialData?: Employee | null;
  employee?: Employee | null;
  departments?: string[];
}

// Helper to auto-format Indonesian phone numbers into 08XX-XXXX-XXXX with fixed 08 prefix
const formatIndonesianPhone = (val: string): string => {
  let digits = val.replace(/\D/g, '');
  if (!digits.startsWith('08')) {
    digits = '08' + digits.replace(/^[0-8]*/, '');
  }
  if (digits.length <= 4) return digits;
  if (digits.length <= 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 13)}`;
};

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  employee,
}) => {
  const { departments: masterDepartments, positions: masterPositions, employees } = useApp();

  const activeMasterDeptNames = Array.from(
    new Set([
      ...masterDepartments.filter((d) => d.status === 'AKTIF').map((d) => d.name),
      'Engineering & Tech',
      'Human Resources',
      'Product & Design',
      'Marketing & Sales',
      'Finance & Accounting',
      'Operations & Logistics',
    ])
  );

  const activeMasterPositions = Array.from(
    new Set([
      ...masterPositions.filter((p) => p.status === 'AKTIF').map((p) => p.name),
      'Senior Frontend Engineer',
      'Backend Developer',
      'Full Stack Engineer',
      'Lead Product Manager',
      'UI/UX Designer',
      'HR Manager',
      'Financial Analyst',
    ])
  );

  const targetData = initialData || employee;

  const [nip, setNip] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('08');
  const [department, setDepartment] = useState<string>('');
  const [position, setPosition] = useState('');
  const [role, setRole] = useState<string>('');
  const [status, setStatus] = useState<'AKTIF' | 'NON_AKTIF'>('AKTIF');
  const [joinDate, setJoinDate] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [wfhAllowance, setWfhAllowance] = useState<number>(0);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (targetData) {
      setNip(targetData.nip);
      setFullName(targetData.fullName);
      setEmail(targetData.email);
      setPhone(formatIndonesianPhone(targetData.phone));
      setDepartment(targetData.department || '');
      setPosition(targetData.position);
      setRole(targetData.role || 'KARYAWAN');
      setStatus(targetData.status === 'NON_AKTIF' || targetData.status === 'INACTIVE' ? 'NON_AKTIF' : 'AKTIF');
      setJoinDate(targetData.joinDate || targetData.joinedDate || new Date().toISOString().split('T')[0]);
      setAvatarUrl(targetData.avatarUrl);
      setWfhAllowance(targetData.wfhAllowanceDaysPerWeek ?? 0);
    } else {
      // Clean sequential NIP generation logic (e.g. EMP-2026-003)
      const nextSeq = String(employees.length + 1).padStart(3, '0');
      setNip(`EMP-2026-${nextSeq}`);
      setFullName('');
      setEmail('');
      setPhone('08');
      setDepartment(''); // Default to empty string for '-- Pilih Departemen --'
      setPosition('');
      setRole(''); // Default to empty string for '-- Pilih Role / Hak Akses --'
      setStatus('AKTIF'); // Default to AKTIF for new onboarding
      setJoinDate(new Date().toISOString().split('T')[0]);
      setAvatarUrl(`https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250`);
      setWfhAllowance(0); // Default to 0 days (WFO / Need Manager approval to grant WFH days)
    }
  }, [targetData, isOpen, employees.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      nip: nip.trim() || `EMP-2026-${String(employees.length + 1).padStart(3, '0')}`,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      department: (department || 'Engineering & Tech') as Department,
      position: position.trim(),
      role: (role || 'KARYAWAN') as Role,
      status,
      joinDate,
      avatarUrl: avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250`,
      wfhAllowanceDaysPerWeek: Number(wfhAllowance),
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={targetData ? 'Update Data Karyawan' : 'Tambah Karyawan Baru (Master Data)'}
      subtitle={targetData ? `Nomor NIP: ${targetData.nip}` : 'Isi formulir lengkap data master karyawan'}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* NIP */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">Nomor Induk Pegawai (NIP) *</label>
              <span className="text-[10px] text-slate-500 font-mono">Format: EMP-2026-XXX</span>
            </div>
            <input
              type="text"
              required
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              placeholder="Contoh: EMP-2026-003"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-100 outline-none font-mono text-xs"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Dapat diedit manual atau biarkan penomoran urut otomatis ({`EMP-2026-${String(employees.length + 1).padStart(3, '0')}`}).
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Contoh: Ahmad Subagyo"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-100 outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Perusahaan *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@company.co.id"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-100 outline-none"
            />
          </div>

          {/* Phone (Fixed 08 prefix protection) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nomor Telepon / WhatsApp *</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(formatIndonesianPhone(e.target.value))}
              placeholder="0812-3456-7890"
              maxLength={15}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-100 outline-none font-mono text-xs"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Departemen / Divisi *</label>
            <select
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-100 outline-none text-xs cursor-pointer"
            >
              <option value="" disabled>-- Pilih Departemen / Divisi --</option>
              {activeMasterDeptNames.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Position */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">Jabatan / Posisi *</label>
              <span className="text-[10px] text-slate-500 font-mono">Autofill Master Data</span>
            </div>
            <input
              type="text"
              required
              list="master-positions-list"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Pilih dari Master Data atau ketik posisi baru..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-100 outline-none text-xs"
            />
            <datalist id="master-positions-list">
              {activeMasterPositions.map((pos) => (
                <option key={pos} value={pos} />
              ))}
            </datalist>
            
            {/* Quick Master Position Chips */}
            <div className="flex flex-wrap gap-1 mt-2">
              {activeMasterPositions.slice(0, 6).map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setPosition(chip)}
                  className="text-[10px] bg-slate-900 hover:bg-indigo-950 text-slate-400 hover:text-indigo-300 border border-slate-800/80 hover:border-indigo-500/40 px-2 py-0.5 rounded-md transition-all cursor-pointer"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Role Hak Akses */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Role / Hak Akses Sistem *</label>
            <select
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-100 outline-none text-xs cursor-pointer"
            >
              <option value="" disabled>-- Pilih Role / Hak Akses Sistem --</option>
              <option value="KARYAWAN">Karyawan (User Standard)</option>
              <option value="HRD_ADMIN">Admin HRD & Manager</option>
            </select>
          </div>

          {/* Status Kepegawaian */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Status Kepegawaian *</label>
            {targetData ? (
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'AKTIF' | 'NON_AKTIF')}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-100 outline-none text-xs cursor-pointer"
              >
                <option value="AKTIF">Aktif Bekerja</option>
                <option value="NON_AKTIF">Non-Aktif / Resigned</option>
              </select>
            ) : (
              <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Aktif Bekerja (Otomatis untuk Pegawai Baru)</span>
              </div>
            )}
          </div>

          {/* Join Date with Calendar Icon & Clickable Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Tanggal Bergabung *</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="date"
                required
                value={joinDate}
                onClick={(e) => e.currentTarget.showPicker?.()}
                onChange={(e) => setJoinDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-3 py-2.5 text-slate-100 outline-none cursor-pointer text-xs font-mono [color-scheme:dark]"
              />
            </div>
          </div>

          {/* WFH Allowance (Clean leading zero handling) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Jatah WFH (Hari / Minggu)</label>
            <input
              type="number"
              min={0}
              max={5}
              value={wfhAllowance === 0 ? '' : wfhAllowance}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setWfhAllowance(0);
                } else {
                  const num = parseInt(val, 10);
                  setWfhAllowance(isNaN(num) ? 0 : Math.min(5, Math.max(0, num)));
                }
              }}
              placeholder="0 (WFO / Wajib Kantor)"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-100 outline-none font-mono text-xs"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Set 0 untuk WFO (Wajib Kantor). Isi 1 - 5 jika karyawan diberikan jatah WFH mingguan.
            </p>
          </div>

          {/* Foto Profil / Avatar File Upload Only */}
          <div className="sm:col-span-2 bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 space-y-3">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 block">
              <Camera className="w-4 h-4 text-indigo-400" />
              <span>Foto Profil / Avatar Karyawan</span>
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-indigo-500/40 bg-slate-900 shrink-0 shadow-lg">
                <img
                  src={avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250`}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250';
                  }}
                />
              </div>

              <div className="w-full space-y-2">
                <label className="flex items-center justify-center gap-2 w-full p-3 bg-indigo-600/10 hover:bg-indigo-600/20 border border-dashed border-indigo-500/40 hover:border-indigo-500 rounded-xl cursor-pointer transition-all text-xs text-indigo-300 font-medium">
                  <Upload className="w-4 h-4" />
                  <span>Upload File Foto Karyawan (JPG / PNG / WEBP)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-slate-500">Pilih berkas foto dari komputer Anda untuk foto profil resmi karyawan.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg hover:shadow-indigo-500/20 cursor-pointer"
          >
            {targetData ? 'Simpan Perubahan' : 'Tambah Karyawan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
