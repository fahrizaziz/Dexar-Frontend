import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DepartmentMaster } from '../../types';
import { Modal } from '../common/Modal';
import { Building2, Plus, Edit3, Trash2, Users, Search, CheckCircle2, XCircle } from 'lucide-react';

export const DepartmentMasterManager: React.FC = () => {
  const { departments, employees, addDepartment, updateDepartment, deleteDepartment } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentMaster | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [headOfDepartment, setHeadOfDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'AKTIF' | 'NON_AKTIF'>('AKTIF');

  const filteredDepts = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingDept(null);
    setCode(`DEPT-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setHeadOfDepartment('');
    setDescription('');
    setStatus('AKTIF');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: DepartmentMaster) => {
    setEditingDept(dept);
    setCode(dept.code);
    setName(dept.name);
    setHeadOfDepartment(dept.headOfDepartment || '');
    setDescription(dept.description || '');
    setStatus(dept.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    if (editingDept) {
      updateDepartment(editingDept.id, {
        code: code.trim(),
        name: name.trim(),
        headOfDepartment: headOfDepartment.trim(),
        description: description.trim(),
        status,
      });
    } else {
      addDepartment({
        code: code.trim(),
        name: name.trim(),
        headOfDepartment: headOfDepartment.trim(),
        description: description.trim(),
        status,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (dept: DepartmentMaster) => {
    const assignedCount = employees.filter((e) => e.department === dept.name).length;
    if (assignedCount > 0) {
      alert(`Departemen "${dept.name}" tidak dapat dihapus karena masih memiliki ${assignedCount} karyawan terdaftar!`);
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus Master Departemen "${dept.name}" (${dept.code})?`)) {
      deleteDepartment(dept.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#0c0c0e] border border-zinc-800/80 p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode atau nama departemen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#09090b] border border-zinc-800 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-200 outline-none"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Departemen Baru</span>
        </button>
      </div>

      {/* Grid view of Departments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepts.map((dept) => {
          const headcount = employees.filter((e) => e.department === dept.name).length;

          return (
            <div
              key={dept.id}
              className="bg-[#0c0c0e] border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                    {dept.code}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      dept.status === 'AKTIF'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    {dept.status === 'AKTIF' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {dept.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{dept.name}</span>
                </h3>

                <p className="text-xs text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed">
                  {dept.description || 'Belum ada deskripsi divisi.'}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-mono text-zinc-200 font-bold">{headcount}</span> Karyawan
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(dept)}
                    className="p-1.5 text-zinc-400 hover:text-indigo-400 bg-zinc-900 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Edit Departemen"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept)}
                    className="p-1.5 text-zinc-400 hover:text-rose-400 bg-zinc-900 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Departemen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Department Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? 'Edit Master Departemen' : 'Tambah Master Departemen Baru'}
        subtitle="Kelola struktur divisi dan departemen perusahaan"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Kode Departemen *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="misal: DEPT-ENG"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-100 text-xs outline-none uppercase font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Departemen / Divisi *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="misal: Quality Assurance & Tech"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-100 text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Kepala Divisi (Head of Dept / VP)</label>
            <input
              type="text"
              value={headOfDepartment}
              onChange={(e) => setHeadOfDepartment(e.target.value)}
              placeholder="Contoh: Budi Santoso, M.T."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-100 text-xs outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Deskripsi Divisi / Tugas Utama</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan peran utama departemen ini..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-100 text-xs outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Status Keaktifan *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'AKTIF' | 'NON_AKTIF')}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-100 text-xs outline-none"
            >
              <option value="AKTIF">AKTIF (Dapat dipilih saat pendaftaran karyawan)</option>
              <option value="NON_AKTIF">NON-AKTIF (Diarsipkan)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              Simpan Departemen
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
