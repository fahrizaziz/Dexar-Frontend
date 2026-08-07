import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, loginAsEmployee, availableEmployees, switchRole } = useAuth();

  const [identifier, setIdentifier] = useState(currentUser.nip || '');
  const [password, setPassword] = useState('••••••••');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Quick Select Demo Account
  const handleSelectDemoAccount = (empId: string, isHrd?: boolean) => {
    if (isHrd) {
      switchRole('HRD_ADMIN');
      setSuccessMsg('Berhasil login sebagai HRD Admin');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 500);
      return;
    }

    const emp = availableEmployees.find((e) => e.id === empId);
    if (emp) {
      setIdentifier(emp.nip);
      loginAsEmployee(emp.id);
      setSuccessMsg(`Berhasil login sebagai ${emp.fullName}`);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanInput = identifier.trim().toLowerCase();

    // Check if input matches HRD email or NIP
    if (cleanInput.includes('hrd') || cleanInput.includes('siti') || cleanInput === 'emp-2026-002') {
      switchRole('HRD_ADMIN');
      setSuccessMsg('Berhasil masuk sebagai Admin HRD');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 600);
      return;
    }

    // Match against available employees
    const matchedEmp = availableEmployees.find(
      (e) =>
        e.nip.toLowerCase() === cleanInput ||
        e.email.toLowerCase() === cleanInput ||
        e.fullName.toLowerCase().includes(cleanInput)
    );

    if (matchedEmp) {
      loginAsEmployee(matchedEmp.id);
      setSuccessMsg(`Berhasil masuk sebagai ${matchedEmp.fullName}`);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 600);
    } else {
      setErrorMsg('NIP atau Email tidak ditemukan. Silakan pilih dari Akun Demo di bawah.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Masuk ke Portal Absensi WFH"
      subtitle="Masukkan NIP atau Email Karyawan / HRD Anda untuk mengakses sistem"
      maxWidth="md"
    >
      <div className="space-y-6">
        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-mono">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Single Unified Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
              NIP / Email Pengguna *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Contoh: EMP-2026-001 atau budi.santoso@company.co.id"
                required
                className="w-full bg-[#09090b] border border-zinc-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Kata Sandi (Password) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                required
                className="w-full bg-[#09090b] border border-zinc-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <span>Masuk ke Sistem</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Fill Single Demo Selector */}
        <div className="pt-4 border-t border-zinc-800/80">
          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Atau Pilih Akun Demo Instan:</span>
          </div>

          <div className="space-y-2">
            {/* HRD Admin Demo */}
            <button
              type="button"
              onClick={() => handleSelectDemoAccount('', true)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#09090b] hover:bg-zinc-800/70 border border-zinc-800 transition-all text-left text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <div>
                  <p className="font-bold text-zinc-200">Siti Rahmawati (HRD Manager)</p>
                  <p className="text-[10px] font-mono text-zinc-400">NIP: EMP-2026-002 • Mode HRD Admin</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded">
                Admin
              </span>
            </button>

            {/* Employee Demos */}
            {availableEmployees.slice(0, 3).map((emp) => (
              <button
                key={emp.id}
                type="button"
                onClick={() => handleSelectDemoAccount(emp.id)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#09090b] hover:bg-zinc-800/70 border border-zinc-800 transition-all text-left text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <div>
                    <p className="font-bold text-zinc-200">{emp.fullName}</p>
                    <p className="text-[10px] font-mono text-zinc-400">
                      NIP: {emp.nip} • {emp.position}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Karyawan
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};


