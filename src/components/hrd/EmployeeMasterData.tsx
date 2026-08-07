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
      e.role || 'KARYAWAN',
      e.status,
      e.joinDate,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Master_Data_Karyawan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Master data karyawan berhasil di-export ke CSV!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header & Master Data Sub-Navigation Tabs */}
      <div className="flex flex-col space-y-4 pb-4 border-b border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2 tracking-tight">
              <Layers className="w-5 h-5 text-indigo-400" />
              Kelola Master Data Perusahaan
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Kelola data master karyawan, struktur departemen/divisi, dan hierarki posisi/jabatan perusahaan
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
        <div className="flex items-center gap-2 bg-[#0c0c0e] border border-zinc-800/90 p-1.5 rounded-2xl w-fit overflow-x-auto">
          <button
            onClick={() => setActiveMasterTab('EMPLOYEES')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeMasterTab === 'EMPLOYEES'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. Master Karyawan</span>
            <span className="ml-1 bg-white/10 px-2 py-0.5 rounded-full font-mono text-[10px]">
              {employees.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMasterTab('DEPARTMENTS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeMasterTab === 'DEPARTMENTS'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>2. Master Departemen & Divisi</span>
            <span className="ml-1 bg-white/10 px-2 py-0.5 rounded-full font-mono text-[10px]">
              {departments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMasterTab('POSITIONS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeMasterTab === 'POSITIONS'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>3. Master Jabatan / Posisi</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab Views */}
      {activeMasterTab === 'DEPARTMENTS' && <DepartmentMasterManager />}
      {activeMasterTab === 'POSITIONS' && <PositionMasterManager />}

      {activeMasterTab === 'EMPLOYEES' && (
        <>
          {/* Filter and Search Bar */}
      <div className="bg-[#0c0c0e] border border-zinc-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan Nama, NIP, Email..."
            className="w-full bg-[#09090b] border border-zinc-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Department Filter */}
          <div className="flex items-center gap-2 bg-[#09090b] border border-zinc-800 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent text-zinc-200 outline-none cursor-pointer text-xs"
            >
              <option value="ALL">Semua Departemen</option>
              {availableDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2 bg-[#09090b] border border-zinc-800 px-3 py-1.5 rounded-xl text-xs">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-transparent text-zinc-200 outline-none cursor-pointer text-xs"
            >
              <option value="ALL">Semua Role</option>
              <option value="KARYAWAN">Role: Karyawan</option>
              <option value="HRD_ADMIN">Role: Admin HRD</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-[#09090b] border border-zinc-800 px-3 py-1.5 rounded-xl text-xs">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-zinc-200 outline-none cursor-pointer text-xs"
            >
              <option value="ALL">Semua Status</option>
              <option value="AKTIF">Status Aktif</option>
              <option value="NON_AKTIF">Status Non-Aktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Data Table */}
      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#09090b] uppercase font-mono font-bold text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="py-4 px-6">Karyawan</th>
                <th className="py-4 px-6">Kontak & Email</th>
                <th className="py-4 px-6">Departemen & Jabatan</th>
                <th className="py-4 px-6">Role Akses</th>
                <th className="py-4 px-6">Jatah WFH</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    Tidak ada data karyawan yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatarUrl}
                          alt={emp.fullName}
                          className="w-10 h-10 rounded-lg object-cover ring-1 ring-zinc-700"
                        />
                        <div>
                          <p className="font-bold text-zinc-100 text-sm">{emp.fullName}</p>
                          <p className="font-mono text-[11px] text-indigo-400 font-semibold">
                            {emp.nip}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 space-y-0.5">
                      <p className="text-zinc-200 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        {emp.email}
                      </p>
                      <p className="text-zinc-400 flex items-center gap-1.5 text-[11px] font-mono">
                        <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        {emp.phone}
                      </p>
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-semibold text-zinc-200">{emp.position}</p>
                      <p className="text-[11px] text-zinc-400">{emp.department}</p>
                    </td>

                    <td className="py-4 px-6">
                      {emp.role === 'HRD_ADMIN' ? (
                        <span className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold">
                          <ShieldCheck className="w-3.5 h-3.5" /> Admin HRD
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium">
                          <User className="w-3.5 h-3.5 text-zinc-400" /> Karyawan
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <span className="bg-[#09090b] px-2.5 py-1 rounded-lg border border-zinc-800 text-zinc-300 font-mono text-xs">
                        {emp.wfhAllowanceDaysPerWeek || 3} hari/minggu
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      {emp.status === 'AKTIF' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-1 rounded text-[11px] font-mono font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 border border-rose-500/25 px-2.5 py-1 rounded text-[11px] font-mono font-bold">
                          <XCircle className="w-3 h-3" /> Non-Aktif
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(emp)}
                          className="p-2 bg-[#121215] hover:bg-zinc-800 text-indigo-300 rounded-lg border border-zinc-800 transition-colors"
                          title="Edit Data Karyawan"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp)}
                          className="p-2 bg-[#121215] hover:bg-rose-950/60 text-rose-400 hover:text-rose-300 rounded-lg border border-zinc-800 transition-colors"
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

      {/* Add / Edit Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEmployee}
        initialData={editingEmployee}
      />

      {/* Bulk Import Excel / CSV Modal */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
        </>
      )}
    </div>
  );
};
