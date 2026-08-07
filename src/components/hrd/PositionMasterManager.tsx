import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PositionMaster } from '../../types';
import { Modal } from '../common/Modal';
import { Briefcase, Plus, Edit3, Trash2, Search, CheckCircle2, XCircle, Building2, Shield } from 'lucide-react';

export const PositionMasterManager: React.FC = () => {
  const { positions, departments, employees, addPosition, updatePosition, deletePosition } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<PositionMaster | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [level, setLevel] = useState('Staff');
  const [status, setStatus] = useState<'AKTIF' | 'NON_AKTIF'>('AKTIF');

  const filteredPositions = positions.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || p.departmentName === deptFilter;

    return matchesSearch && matchesDept;
  });

  const handleOpenAdd = () => {
    setEditingPos(null);
    setCode(`POS-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setDepartmentName(departments[0]?.name || 'Engineering & Tech');
    setLevel('Staff');
    setStatus('AKTIF');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pos: PositionMaster) => {
    setEditingPos(pos);
    setCode(pos.code);
    setName(pos.name);
    setDepartmentName(pos.departmentName);
    setLevel(pos.level || 'Staff');
    setStatus(pos.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    if (editingPos) {
      updatePosition(editingPos.id, {
        code: code.trim(),
        name: name.trim(),
        departmentName,
        level,
        status,
      });
    } else {
      addPosition({
        code: code.trim(),
        name: name.trim(),
        departmentName,
        level,
        status,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (pos: PositionMaster) => {
    const assignedCount = employees.filter((e) => e.position === pos.name).length;
    if (assignedCount > 0) {
      alert(`Jabatan "${pos.name}" tidak dapat dihapus karena masih digunakan oleh ${assignedCount} karyawan!`);
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus Master Jabatan "${pos.name}" (${pos.code})?`)) {
      deletePosition(pos.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#0c0c0e] border border-zinc-800/80 p-4 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari posisi / jabatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#09090b] border border-zinc-800 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-200 outline-none"
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full sm:w-auto bg-[#09090b] border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none"
          >
            <option value="ALL">Semua Departemen</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Jabatan Baru</span>
        </button>
      </div>

      {/* Table view of Positions */}
      <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#121215] text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800/80">
              <tr>
                <th className="py-4 px-6">Kode Jabatan</th>
                <th className="py-4 px-6">Nama Jabatan / Posisi</th>
                <th className="py-4 px-6">Departemen / Divisi</th>
                <th className="py-4 px-6">Level / Jenjang</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredPositions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    Belum ada master jabatan yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredPositions.map((pos) => {
                  const assignedCount = employees.filter((e) => e.position === pos.name).length;

                  return (
                    <tr key={pos.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-indigo-400">
                        {pos.code}
                      </td>

                      <td className="py-4 px-6 font-semibold text-zinc-100 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>{pos.name}</span>
                        {assignedCount > 0 && (
                          <span className="text-[10px] font-mono bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">
                            {assignedCount} orang
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 text-zinc-300">
                          <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                          {pos.departmentName}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 bg-zinc-900 border border-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg text-[11px] font-medium">
                          <Shield className="w-3 h-3 text-indigo-400" />
                          {pos.level}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                            pos.status === 'AKTIF'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          {pos.status === 'AKTIF' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {pos.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(pos)}
                            className="p-1.5 text-zinc-400 hover:text-indigo-400 bg-zinc-900 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Edit Jabatan"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(pos)}
                            className="p-1.5 text-zinc-400 hover:text-rose-400 bg-zinc-900 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Jabatan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Position Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPos ? 'Edit Master Jabatan' : 'Tambah Master Jabatan Baru'}
        subtitle="Kelola master posisi dan jenjang karir karyawan"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Kode Jabatan *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="misal: POS-008"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-100 text-xs outline-none uppercase font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Jabatan / Posisi *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="misal: DevOps Specialist"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-100 text-xs outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Departemen / Divisi Naungan *</label>
              <select
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-100 text-xs outline-none"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Level / Jenjang Karir *</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-100 text-xs outline-none"
              >
                <option value="Intern / Magang">Intern / Magang</option>
                <option value="Staff / Junior">Staff / Junior</option>
                <option value="Senior">Senior</option>
                <option value="Lead / Team Lead">Lead / Team Lead</option>
                <option value="Manager">Manager</option>
                <option value="Head of Dept / VP">Head of Dept / VP</option>
                <option value="C-Level / Director">C-Level / Director</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Status Jabatan *</label>
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
              Simpan Jabatan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
