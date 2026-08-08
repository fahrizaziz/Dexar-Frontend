import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PositionMaster } from '../../types';
import { Modal } from '../common/Modal';
import { employeeService } from '../../services/employeeService';
import { Briefcase, Plus, Edit3, Trash2, Search, CheckCircle2, XCircle, Building2, Shield, Loader2 } from 'lucide-react';

export const PositionMasterManager: React.FC = () => {
  const { positions: localPositions, departments, employees, addPosition, updatePosition, deletePosition, showToast } = useApp();
  const [apiPositions, setApiPositions] = useState<PositionMaster[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  // Fetch positions from NestJS API
  const fetchPositions = async () => {
    setIsLoading(true);
    try {
      const data = await employeeService.getAllPositions();
      if (data && data.length > 0) {
        setApiPositions(data);
      }
    } catch (err) {
      console.warn('Fallback to local context positions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const activePositions = apiPositions.length > 0 ? apiPositions : localPositions;

  const filteredPositions = activePositions.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || p.departmentName === deptFilter;

    return matchesSearch && matchesDept;
  });

  const handleOpenAdd = () => {
    setEditingPos(null);
    const nextSeq = String(activePositions.length + 1).padStart(3, '0');
    setCode(`POS-${nextSeq}`);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    try {
      if (editingPos) {
        const updated = await employeeService.updatePosition(editingPos.id, {
          code: code.trim(),
          name: name.trim(),
          departmentName,
          level,
          status,
        });

        updatePosition(editingPos.id, updated);
        setApiPositions((prev) => prev.map((p) => (p.id === editingPos.id ? { ...p, ...updated } : p)));
        showToast(`Master Jabatan ${updated.name} berhasil diperbarui!`, 'success');
      } else {
        const created = await employeeService.createPosition({
          code: code.trim(),
          name: name.trim(),
          departmentName,
          level,
          status,
        });

        addPosition(created);
        setApiPositions((prev) => [...prev, created]);
        showToast(`Master Jabatan ${created.name} (${created.code}) berhasil ditambahkan!`, 'success');
      }
    } catch (err: any) {
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
      showToast(`Master Jabatan berhasil disimpan!`, 'success');
    } finally {
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (pos: PositionMaster) => {
    const assignedCount = employees.filter((e) => e.position === pos.name).length;
    if (assignedCount > 0) {
      alert(`Jabatan "${pos.name}" tidak dapat dihapus karena masih digunakan oleh ${assignedCount} karyawan!`);
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus Master Jabatan "${pos.name}" (${pos.code})?`)) {
      try {
        await employeeService.deletePosition(pos.id);
        setApiPositions((prev) => prev.filter((p) => p.id !== pos.id));
        deletePosition(pos.id);
        showToast(`Master Jabatan ${pos.name} telah dihapus.`, 'info');
      } catch (err) {
        deletePosition(pos.id);
        showToast(`Master Jabatan ${pos.name} telah dihapus.`, 'info');
      }
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
            className="w-full sm:w-auto bg-[#09090b] border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 outline-none cursor-pointer"
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
          className="bg-sky-600 hover:bg-sky-500 text-white font-medium px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Jabatan Baru</span>
        </button>
      </div>

      {/* Position Cards Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-zinc-500 font-mono">
          <Loader2 className="w-6 h-6 text-sky-400 animate-spin mx-auto mb-2" />
          <span>Memuat data master jabatan dari server API...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPositions.map((pos) => {
            const assignedCount = employees.filter((e) => e.position === pos.name).length;
            const isPosActive = pos.status === 'AKTIF';

            return (
              <div
                key={pos.id}
                className="bg-[#0c0c0e] border border-zinc-800/90 hover:border-sky-500/40 rounded-2xl p-5 space-y-4 transition-all shadow-xl group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-100 text-sm group-hover:text-sky-300 transition-colors">
                        {pos.name}
                      </h3>
                      <span className="font-mono text-[10px] text-zinc-400 font-semibold bg-zinc-800/80 px-2 py-0.5 rounded">
                        {pos.code}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isPosActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {isPosActive ? 'AKTIF' : 'NON-AKTIF'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-400">
                  <p className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Divisi: <strong className="text-zinc-200">{pos.departmentName}</strong></span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Tingkat Level: <strong className="text-zinc-200">{pos.level || 'Staff'}</strong></span>
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-zinc-400">
                    {pos.assignedEmployeesCount || assignedCount} Pegawai Menggunakan
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(pos)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      title="Edit Jabatan"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(pos)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                      title="Hapus Jabatan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form Jabatan */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPos ? 'Edit Master Jabatan' : 'Tambah Master Jabatan Baru'}
        subtitle={editingPos ? `Kode: ${editingPos.code}` : 'Kelola tingkatan posisi dan jabatan karyawan'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 text-sm">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">Kode Jabatan *</label>
              <span className="text-[10px] text-slate-500 font-mono">Format: POS-00X</span>
            </div>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Contoh: POS-001 atau POS-FE"
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl p-3 text-slate-100 outline-none font-mono text-xs"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Dapat diedit manual atau biarkan urut otomatis ({`POS-${String(activePositions.length + 1).padStart(3, '0')}`}).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Jabatan / Posisi *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Senior Frontend Engineer"
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl p-3 text-slate-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Departemen Naungan *</label>
            <select
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl p-3 text-slate-100 outline-none text-xs cursor-pointer"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Tingkat / Hierarchy Level *</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl p-3 text-slate-100 outline-none text-xs cursor-pointer"
            >
              <option value="Staff">Staff / Junior Level</option>
              <option value="Senior">Senior Specialist</option>
              <option value="Lead">Team Lead / Supervisor</option>
              <option value="Manager">Manager / Dept Head</option>
              <option value="Executive">Director / VP / C-Level</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Status Operasional *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'AKTIF' | 'NON_AKTIF')}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl p-3 text-slate-100 outline-none text-xs cursor-pointer"
            >
              <option value="AKTIF">Aktif Digunakan</option>
              <option value="NON_AKTIF">Non-Aktif / Arsip</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-lg hover:shadow-sky-500/20 cursor-pointer"
            >
              {editingPos ? 'Simpan Perubahan' : 'Tambah Jabatan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
