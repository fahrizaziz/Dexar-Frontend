import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ArrowRight, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, loginWithApi, loginAsEmployee, availableEmployees, switchRole } = useAuth();

  const [identifier, setIdentifier] = useState('budi.santoso@company.co.id');
  const [password, setPassword] = useState('password123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Quick Select Demo Account
  const handleSelectDemoAccount = async (email: string, isHrd?: boolean) => {
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isHrd) {
        await loginWithApi('siti.rahmawati@company.co.id', 'password123');
        setSuccessMsg('Berhasil login sebagai HRD Admin (Siti Rahmawati)');
      } else {
        await loginWithApi(email, 'password123');
        setSuccessMsg(`Berhasil login sebagai ${email}`);
      }

      setTimeout(() => {
        setSuccessMsg('');
        setIsSubmitting(false);
        onClose();
      }, 500);
    } catch (err: any) {
      // Fallback if backend server is not running yet
      if (isHrd) {
        switchRole('HRD_ADMIN');
        setSuccessMsg('Berhasil login sebagai HRD Admin (Mode Demo)');
      } else {
        const emp = availableEmployees.find((e) => e.email === email);
        if (emp) loginAsEmployee(emp.id);
        setSuccessMsg('Berhasil login (Mode Demo)');
      }
      setTimeout(() => {
        setSuccessMsg('');
        setIsSubmitting(false);
        onClose();
      }, 500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const user = await loginWithApi(identifier.trim(), password);
      setSuccessMsg(`Berhasil masuk sebagai ${user.name} (${user.role})`);
      setTimeout(() => {
        setSuccessMsg('');
        setIsSubmitting(false);
        onClose();
      }, 600);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Login gagal. Pastikan email dan password benar atau backend menyala.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Masuk ke Portal Absensi WFH"
      subtitle="Masukkan Email & Password Anda (Backend Real API / Demo)"
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
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Single Unified Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Email Pengguna *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Contoh: budi.santoso@company.co.id"
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
            disabled={isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses Login...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Sistem (API Real)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Fill Single Demo Selector */}
        <div className="pt-4 border-t border-zinc-800/80">
          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Klik Akun Instan (Koneksi ke API NestJS):</span>
          </div>

          <div className="space-y-2">
            {/* HRD Admin Demo */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSelectDemoAccount('siti.rahmawati@company.co.id', true)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#09090b] hover:bg-zinc-800/70 border border-zinc-800 transition-all text-left text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <div>
                  <p className="font-bold text-zinc-200">Siti Rahmawati (HRD Manager)</p>
                  <p className="text-[10px] font-mono text-zinc-400">siti.rahmawati@company.co.id • Admin HRD</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded">
                HRD ADMIN
              </span>
            </button>

            {/* Employee Demos */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSelectDemoAccount('budi.santoso@company.co.id')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#09090b] hover:bg-zinc-800/70 border border-zinc-800 transition-all text-left text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <div>
                  <p className="font-bold text-zinc-200">Budi Santoso (Senior Engineer)</p>
                  <p className="text-[10px] font-mono text-zinc-400">budi.santoso@company.co.id • Karyawan</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded">
                KARYAWAN
              </span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
