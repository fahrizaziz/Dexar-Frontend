import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Employee, Department, Role } from '../../types';
import { useApp } from '../../context/AppContext';
import { User, Mail, Phone, Building2, Briefcase, Calendar, ShieldCheck, Upload, Camera, Trash2, Link as LinkIcon } from 'lucide-react';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employeeData: Omit<Employee, 'id'>) => void;
  initialData?: Employee | null;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
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
  const [nip, setNip] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState<Department>('Engineering & Tech');
  const [position, setPosition] = useState('');
  const [role, setRole] = useState<Role>('KARYAWAN');
  const [status, setStatus] = useState<'AKTIF' | 'NON_AKTIF'>('AKTIF');
  const [joinDate, setJoinDate] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [wfhAllowance, setWfhAllowance] = useState<number>(3);
  const [showUrlInput, setShowUrlInput] = useState(false);

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
    if (initialData) {
      setNip(initialData.nip);
      setFullName(initialData.fullName);
      setEmail(initialData.email);
      setPhone(initialData.phone);
      setDepartment(initialData.department);
      setPosition(initialData.position);
      setRole(initialData.role || 'KARYAWAN');
      setStatus(initialData.status);
      setJoinDate(initialData.joinDate);
      setAvatarUrl(initialData.avatarUrl);
      setWfhAllowance(initialData.wfhAllowanceDaysPerWeek || 3);
    } else {
      // Clean sequential NIP generation logic (e.g. EMP-2026-003)
      const nextSeq = String(employees.length + 1).padStart(3, '0');
      setNip(`EMP-2026-${nextSeq}`);
      setFullName('');
      setEmail('');
      setPhone('0812-');
      setDepartment('Engineering & Tech');
      setPosition('');
      setRole('KARYAWAN');
      setStatus('AKTIF');
      setJoinDate(new Date().toISOString().split('T')[0]);
      setAvatarUrl(`https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250`);
      setWfhAllowance(3);
    }
  }, [initialData, isOpen, employees.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      nip: nip.trim() || `EMP-2026-${String(employees.length + 1).padStart(3, '0')}`,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      department,
      position: position.trim(),
      role,
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
      title={initialData ? 'Update Data Karyawan' : 'Tambah Karyawan Baru (Master Data)'}
      subtitle={initialData ? `Nomor NIP: ${initialData.nip}` : 'Isi formulir lengkap data master karyawan'}
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

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nomor Telepon / WhatsApp *</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0812-xxxx-xxxx"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-100 outline-none"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Departemen / Divisi *</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value as Department)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-100 outline-none text-xs cursor-pointer"
            >
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
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-100 outline-none"
            >
              <option value="KARYAWAN">Karyawan (User Standard)</option>
              <option value="HRD_ADMIN">Admin HRD & Manager</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Status Kepegawaian *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'AKTIF' | 'NON_AKTIF')}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-100 outline-none"
            >
              <option value="AKTIF">Aktif Bekerja</option>
              <option value="NON_AKTIF">Non-Aktif / Resigned</option>
            </select>
          </div>

          {/* Join Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Tanggal Bergabung *</label>
            <input
              type="date"
              required
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-100 outline-none"
            />
          </div>

          {/* WFH Allowance */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Jatah WFH (Hari / Minggu)</label>
            <input
              type="number"
              min={1}
              max={5}
              value={wfhAllowance}
              onChange={(e) => setWfhAllowance(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-100 outline-none"
            />
          </div>

          {/* Foto Profil / Avatar File Upload */}
          <div className="sm:col-span-2 bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-indigo-400" />
                <span>Foto Profil / Avatar Karyawan</span>
              </label>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <LinkIcon className="w-3 h-3" />
                {showUrlInput ? 'Gunakan Upload File' : 'Gunakan Link URL'}
              </button>
            </div>

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

              {showUrlInput ? (
                <div className="w-full">
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-slate-100 text-xs outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Masukkan URL gambar profil karyawan dari internet.</p>
                </div>
              ) : (
                <div className="w-full space-y-2">
                  <label className="flex items-center justify-center gap-2 w-full p-3 bg-indigo-600/10 hover:bg-indigo-600/20 border border-dashed border-indigo-500/40 hover:border-indigo-500 rounded-xl cursor-pointer transition-all text-xs text-indigo-300 font-medium">
                    <Upload className="w-4 h-4" />
                    <span>Upload File Foto (JPG / PNG / WEBP)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-500">Pilih berkas foto dari komputer/perangkat Anda. Otomatis diproses menjadi avatar.</p>
                </div>
              )}
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
            {initialData ? 'Simpan Perubahan' : 'Tambah Karyawan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
