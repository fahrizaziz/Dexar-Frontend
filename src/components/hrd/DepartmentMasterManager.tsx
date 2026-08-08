import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DepartmentMaster } from '../../types';
import { Modal } from '../common/Modal';
import { employeeService } from '../../services/employeeService';
import { Building2, Plus, Edit3, Trash2, Users, Search, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export const DepartmentMasterManager: React.FC = () => {
  const { departments: localDepts, employees, addDepartment, updateDepartment, deleteDepartment, showToast } = useApp();
  const [apiDepts, setApiDepts] = useState<DepartmentMaster[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentMaster | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [headOfDepartment, setHeadOfDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'AKTIF' | 'NON_AKTIF'>('AKTIF');

  // Fetch departments from NestJS API
  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const data = await employeeService.getAllDepartments();
      if (data && data.length > 0) {
        setApiDepts(data);
      }
    } catch (err) {
      console.warn('Fallback to local context departments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const activeDepts = apiDepts.length > 0 ? apiDepts : localDepts;

  const filteredDepts = activeDepts.filter(
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    try {
      if (editingDept) {
        const updated = await employeeService.updateDepartment(editingDept.id, {
          code: code.trim(),
          name: name.trim(),
          headOfDepartment: headOfDepartment.trim(),
          description: description.trim(),
          status,
        });

        updateDepartment(editingDept.id, updated);
        setApiDepts((prev) => prev.map((d) => (d.id === editingDept.id ? { ...d, ...updated } : d)));
        showToast(`Departemen ${updated.name} berhasil diperbarui!`, 'success');
      } else {
        const created = await employeeService.createDepartment({
          code: code.trim(),
          name: name.trim(),
          headOfDepartment: headOfDepartment.trim(),
          description: description.trim(),
          status,
        });

        addDepartment(created);
        setApiDepts((prev) => [...prev, created]);
        showToast(`Departemen ${created.name} (${created.code}) berhasil ditambahkan!`, 'success');
      }
    } catch (err: any) {
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
      showToast(`Master Departemen berhasil disimpan!`, 'success');
    } finally {
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (dept: DepartmentMaster) => {
    const assignedCount = employees.filter((e) => e.department === dept.name).length;
    if (assignedCount > 0) {
      alert(`Departemen "${dept.name}" tidak dapat dihapus karena masih memiliki ${assignedCount} karyawan terdaftar!`);
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus Master Departemen "${dept.name}" (${dept.code})?`)) {
      try {
        await employeeService.deleteDepartment(dept.id);
        setApiDepts((prev) => prev.filter((d) => d.id !== dept.id));
        deleteDepartment(dept.id);
        showToast(`Departemen ${dept.name} telah dihapus.`, 'info');
      } catch (err) {
        deleteDepartment(dept.id);
        showToast(`Departemen ${dept.name} telah dihapus.`, 'info');
      }
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
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Departemen Baru</span>
        </button>
      </div>

      {/* Department Cards Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-zinc-500 font-mono">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto mb-2" />
          <span>Memuat data master departemen dari server API...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDepts.map((dept) => {
            const assignedCount = employees.filter((e) => e.department === dept.name).length;
            const isDeptActive = dept.status === 'AKTIF';

            return (
              <div
                key={dept.id}
                className="bg-[#0c0c0e] border border-zinc-800/90 hover:border-emerald-500/40 rounded-2xl p-5 space-y-4 transition-all shadow-xl group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-100 text-sm group-hover:text-emerald-300 transition-colors">
                        {dept.name}
                      </h3>
                      <span className="font-mono text-[10px] text-zinc-400 font-semibold bg-zinc-800/80 px-2 py-0.5 rounded">
                        {dept.code}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isDeptActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {isDeptActive ? 'AKTIF' : 'NON-AKTIF'}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed min-h-[36px]">
                  {dept.description || 'Tidak ada deskripsi departemen.'}
                </p>

                <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px]">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{dept.employeeCount || assignedCount} Pegawai</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(dept)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      title="Edit Departemen"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
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
      )}

      {/* Modal Form Departemen */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? 'Edit Master Departemen' : 'Tambah Master Departemen Baru'}
        subtitle={editingDept ? `Kode: ${editingDept.code}` : 'Kelola struktur departemen perusahaan'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Kode Departemen *</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Contoh: DEPT-001"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-slate-100 outline-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Departemen / Divisi *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Engineering & Tech"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-slate-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Kepala / Head of Department</label>
            <input
              type="text"
              value={headOfDepartment}
              onChange={(e) => setHeadOfDepartment(e.target.value)}
              placeholder="Nama Kepala Departemen (Opsional)"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-slate-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Deskripsi Tugas & Fungsi</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan peran departemen ini dalam perusahaan..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-slate-100 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Status Operasional *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'AKTIF' | 'NON_AKTIF')}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-slate-100 outline-none text-xs cursor-pointer"
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
            >
              {editingDept ? 'Simpan Perubahan' : 'Tambah Departemen'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
