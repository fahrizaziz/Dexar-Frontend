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
        <div className="overflow-x-auto no-scrollbar">
          <table className="min-w-[750px] w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#121215] text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800/80">
              <tr>
                <th className="py-4 px-6 whitespace-nowrap">Kode Jabatan</th>
                <th className="py-4 px-6 whitespace-nowrap">Nama Jabatan / Posisi</th>
                <th className="py-4 px-6 whitespace-nowrap">Departemen / Divisi</th>
                <th className="py-4 px-6 whitespace-nowrap">Level / Jenjang</th>
                <th className="py-4 px-6 whitespace-nowrap">Status</th>
                <th className="py-4 px-6 text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredPositions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 font-mono">
                    Belum ada master jabatan yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredPositions.map((pos) => {
                  const assignedCount = employees.filter((e) => e.position === pos.name).length;

                  return (
                    <tr key={pos.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-indigo-400 whitespace-nowrap">
                        {pos.code}
                      </td>

                      <td className="py-4 px-6 font-semibold text-zinc-100 flex items-center gap-2 whitespace-nowrap">
                        <Briefcase className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>{pos.name}</span>
                        {assignedCount > 0 && (
                          <span className="ml-1 text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700 whitespace-nowrap">
                            {assignedCount} karyawan
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-zinc-300 whitespace-nowrap">
                        {pos.departmentName}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="font-mono text-xs text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20 whitespace-nowrap">
                          {pos.level || 'Staff'}
                        </span>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold whitespace-nowrap ${
                            pos.status === 'AKTIF'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${pos.status === 'AKTIF' ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                          {pos.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEdit(pos)}
                            className="p-1.5 text-zinc-400 hover:text-indigo-400 bg-zinc-900 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-zinc-700"
                            title="Edit Jabatan"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(pos)}
                            className="p-1.5 text-zinc-400 hover:text-rose-400 bg-zinc-900 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-500/20"
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPos ? 'Edit Master Jabatan' : 'Tambah Master Jabatan Baru'}
        subtitle="Kelola nama jabatan, jenjang posisi, dan alokasi ke departemen"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Kode Jabatan *
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Contoh: POS-ENG-01"
              className="w-full bg-[#09090b] border border-zinc-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-zinc-100 font-mono outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Nama Jabatan / Posisi *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Senior Frontend Engineer"
              className="w-full bg-[#09090b] border border-zinc-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-zinc-100 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Departemen *
              </label>
              <select
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="w-full bg-[#09090b] border border-zinc-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-zinc-100 outline-none"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Level / Jenjang
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-[#09090b] border border-zinc-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-zinc-100 outline-none"
              >
                <option value="Executive">Executive</option>
                <option value="Manager">Manager</option>
                <option value="Lead">Lead</option>
                <option value="Senior">Senior</option>
                <option value="Staff">Staff</option>
                <option value="Junior">Junior</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Status Jabatan
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'AKTIF' | 'NON_AKTIF')}
              className="w-full bg-[#09090b] border border-zinc-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-zinc-100 outline-none"
            >
              <option value="AKTIF">AKTIF</option>
              <option value="NON_AKTIF">NON-AKTIF</option>
            </select>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              Simpan Jabatan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
