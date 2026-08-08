import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee, Department } from '../../types';
import { EmployeeModal } from './EmployeeModal';
import { DepartmentMasterManager } from './DepartmentMasterManager';
import { PositionMasterManager } from './PositionMasterManager';
import { BulkImportModal } from './BulkImportModal';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Download,
  FileSpreadsheet,
  Building2,
  Briefcase,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ShieldCheck,
  User,
  Layers,
} from 'lucide-react';

export const EmployeeMasterData: React.FC = () => {
  const { employees, departments, addEmployee, updateEmployee, deleteEmployee, showToast } = useApp();

  const [activeMasterTab, setActiveMasterTab] = useState<'EMPLOYEES' | 'DEPARTMENTS' | 'POSITIONS'>('EMPLOYEES');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Dynamic department list from Master Data + Employees
  const availableDepartments = Array.from(
    new Set([
      ...departments.filter((d) => d.status === 'AKTIF').map((d) => d.name),
      'Engineering & Tech',
      'Human Resources',
      'Product & Design',
      'Marketing & Sales',
      'Finance & Accounting',
      'Operations & Logistics',
      ...employees.map((e) => e.department).filter(Boolean),
    ])
  );

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || emp.status === selectedStatus;
    const matchesRole = selectedRole === 'ALL' || emp.role === selectedRole;

    return matchesSearch && matchesDept && matchesStatus && matchesRole;
  });

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleSaveEmployee = (data: Omit<Employee, 'id'>) => {
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, data);
    } else {
      addEmployee(data);
    }
  };

  const handleDelete = (emp: Employee) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data karyawan ${emp.fullName} (${emp.nip})?`)) {
      deleteEmployee(emp.id);
    }
  };

  const exportToCSV = () => {
    const headers = ['NIP', 'Nama Lengkap', 'Email', 'Telepon', 'Departemen', 'Jabatan', 'Role', 'Status', 'Tgl Bergabung'];
    const rows = filteredEmployees.map((e) => [
      e.nip,
      `"${e.fullName}"`,
      e.email,
      e.phone,
      `"${e.department}"`,
      `"${e.position}"`,
      e.role,
      e.status,
      e.joinedDate,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Master_Karyawan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data karyawan berhasil di-export ke CSV.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Page Header & Navigation */}
      <div className="bg-[#0c0c0e] border border-zinc-800/90 rounded-2xl p-6 space-y-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2.5">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>Manajemen Master Data Perusahaan</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Kelola master data karyawan, struktur departemen & divisi, serta tingkat posisi/jabatan
            </p>
          </div>

          {activeMasterTab === 'EMPLOYEES' && (
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2 border border-emerald-500/30 transition-all cursor-pointer shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Import Excel / CSV</span>
              </button>

              <button
                onClick={exportToCSV}
                className="px-4 py-2.5 rounded-xl bg-[#121215] hover:bg-zinc-800 text-zinc-200 text-xs font-mono font-semibold flex items-center gap-2 border border-zinc-800 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleOpenAddModal}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20 transition-all border border-indigo-400/40 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tambah Karyawan Baru</span>
              </button>
            </div>
          )}
        </div>

        {/* Master Navigation Bar */}
        <div className="flex items-center gap-2 bg-[#0c0c0e] border border-zinc-800/90 p-1.5 rounded-2xl max-w-full overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveMasterTab('EMPLOYEES')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeMasterTab === 'EMPLOYEES'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>1. Master Karyawan</span>
            <span className="ml-1 bg-white/10 px-2 py-0.5 rounded-full font-mono text-[10px] shrink-0">
              {employees.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMasterTab('DEPARTMENTS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeMasterTab === 'DEPARTMENTS'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span>2. Master Departemen & Divisi</span>
            <span className="ml-1 bg-white/10 px-2 py-0.5 rounded-full font-mono text-[10px] shrink-0">
              {departments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMasterTab('POSITIONS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeMasterTab === 'POSITIONS'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Briefcase className="w-4 h-4 shrink-0" />
            <span>3. Master Jabatan / Posisi</span>
          </button>
        </div>
      </div>

      {/* Render Active Master Tab */}
      {activeMasterTab === 'EMPLOYEES' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-[#0c0c0e] border border-zinc-800/90 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan nama, NIP, atau email karyawan..."
                className="w-full bg-[#09090b] border border-zinc-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-colors"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-3 flex-wrap text-xs">
              <div className="flex items-center gap-2 bg-[#09090b] border border-zinc-800 px-3 py-1.5 rounded-xl">
                <Filter className="w-3.5 h-3.5 text-zinc-400" />
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-transparent text-zinc-200 outline-none cursor-pointer text-xs"
                >
                  <option value="ALL" className="bg-[#0c0c0e]">Semua Departemen</option>
                  {availableDepartments.map((dept) => (
                    <option key={dept} value={dept} className="bg-[#0c0c0e]">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-[#09090b] border border-zinc-800 px-3 py-1.5 rounded-xl">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-transparent text-zinc-200 outline-none cursor-pointer text-xs"
                >
                  <option value="ALL" className="bg-[#0c0c0e]">Semua Status</option>
                  <option value="AKTIF" className="bg-[#0c0c0e]">Aktif</option>
                  <option value="NON_AKTIF" className="bg-[#0c0c0e]">Non-Aktif</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-[#09090b] border border-zinc-800 px-3 py-1.5 rounded-xl">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="bg-transparent text-zinc-200 outline-none cursor-pointer text-xs"
                >
                  <option value="ALL" className="bg-[#0c0c0e]">Semua Role</option>
                  <option value="KARYAWAN" className="bg-[#0c0c0e]">Karyawan WFH</option>
                  <option value="HRD_ADMIN" className="bg-[#0c0c0e]">Admin HRD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Employees Table */}
          <div className="bg-[#0c0c0e] border border-zinc-800/90 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#09090b] text-zinc-400 font-mono uppercase tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4">Karyawan</th>
                    <th className="px-6 py-4">Departemen & Jabatan</th>
                    <th className="px-6 py-4">Kontak</th>
                    <th className="px-6 py-4">Role System</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-sans">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 font-mono">
                        Tidak ada data karyawan yang cocok dengan pencarian / filter.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={emp.avatarUrl}
                              alt={emp.fullName}
                              className="w-10 h-10 rounded-xl object-cover ring-1 ring-zinc-700 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-zinc-100">{emp.fullName}</p>
                              <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 inline-block mt-0.5">
                                NIP: {emp.nip}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-zinc-200">{emp.department}</p>
                          <p className="text-zinc-400 text-[11px]">{emp.position}</p>
                        </td>
                        <td className="px-6 py-4 space-y-1 text-zinc-400">
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <Mail className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{emp.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <Phone className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{emp.phone}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${
                              emp.role === 'HRD_ADMIN'
                                ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            {emp.role === 'HRD_ADMIN' ? 'ADMIN HRD' : 'KARYAWAN WFH'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 w-fit ${
                              emp.status === 'AKTIF'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                emp.status === 'AKTIF' ? 'bg-emerald-400' : 'bg-rose-400'
                              }`}
                            />
                            <span>{emp.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(emp)}
                              className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-indigo-400 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-zinc-700"
                              title="Edit Data Karyawan"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(emp)}
                              className="p-2 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-500/20"
                              title="Hapus Karyawan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeMasterTab === 'DEPARTMENTS' && <DepartmentMasterManager />}
      {activeMasterTab === 'POSITIONS' && <PositionMasterManager />}

      {/* Add / Edit Employee Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEmployee}
        employee={editingEmployee}
      />

      {/* Bulk Import Excel/CSV Modal */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};
