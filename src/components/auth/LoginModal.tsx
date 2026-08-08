import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Lock, UserCheck, CheckCircle2, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithApi } = useAuth();

  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isAuthenticated = authService.isAuthenticated();

  // Reset form fields when modal opens (e.g. after logout)
  useEffect(() => {
    if (isOpen) {
      setNip('');
      setPassword('');
      setShowPassword(false);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const user = await loginWithApi(nip.trim(), password);
      setSuccessMsg(`Berhasil masuk sebagai ${user.name} (${user.role})`);
      setTimeout(() => {
        setSuccessMsg('');
        setIsSubmitting(false);
        setNip('');
        setPassword('');
        onClose();
      }, 600);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Login gagal. Pastikan NIP dan password benar.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Masuk ke Portal Absensi WFH"
      subtitle="Masukkan Nomor Induk Pegawai (NIP) dan Password Anda untuk mengakses sistem"
      maxWidth="md"
      closeOnOverlayClick={false}
      hideCloseButton={!isAuthenticated}
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

        {/* Single Unified NIP Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Nomor Induk Pegawai (NIP) *
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="Contoh: EMP-2026-001 (Karyawan) atau EMP-2026-002 (Admin HRD)"
                required
                className="w-full bg-[#09090b] border border-zinc-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-colors font-mono"
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
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                required
                className="w-full bg-[#09090b] border border-zinc-800 focus:border-emerald-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-zinc-400 hover:text-zinc-200 transition-colors p-0.5 cursor-pointer"
                title={showPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses Login...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>
        </form>
      </div>
    </Modal>
  );
};
