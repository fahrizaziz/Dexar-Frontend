import React from 'react';
import { useAuth, Permission } from '../../context/AuthContext';
import { ShieldAlert, Lock, ArrowRight } from 'lucide-react';

interface ProtectedViewProps {
  permission?: Permission;
  children: React.ReactNode;
}

export const ProtectedView: React.FC<ProtectedViewProps> = ({ permission, children }) => {
  const { currentUser, hasPermission, switchRole } = useAuth();

  if (!permission || hasPermission(permission)) {
    return <>{children}</>;
  }

  return (
    <div className="bg-[#0c0c0e] border border-rose-500/30 rounded-2xl p-8 max-w-2xl mx-auto shadow-2xl text-center space-y-6 my-12">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono font-bold px-3 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase">
          Akses Dibatasi (RBAC Guard)
        </span>
        <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
          Role-Based Access Control (RBAC) Protection
        </h2>
        <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
          Akun Anda saat ini <strong className="text-zinc-200">({currentUser.name} - Role: {currentUser.role})</strong> tidak memiliki izin hak akses <code className="text-rose-400 font-mono">{permission}</code> untuk membuka halaman ini.
        </p>
      </div>

      <div className="bg-[#09090b] p-4 rounded-xl border border-zinc-800 text-left text-xs font-mono space-y-2">
        <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800/80 pb-2">
          <span>Informasi Sesi Login:</span>
          <span className="text-emerald-400 font-bold">{currentUser.nip}</span>
        </div>
        <div className="flex items-center justify-between text-zinc-400">
          <span>Role Pengguna:</span>
          <span className="text-amber-400">{currentUser.role}</span>
        </div>
        <div className="flex items-center justify-between text-zinc-400">
          <span>Required Permission:</span>
          <span className="text-rose-400">{permission}</span>
        </div>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={() => switchRole('HRD_ADMIN')}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 border border-indigo-400/30"
        >
          <Lock className="w-4 h-4" />
          <span>Switch ke Mode HRD Admin</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
