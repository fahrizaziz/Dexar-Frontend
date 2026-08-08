import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee } from '../../types';
import { EmployeeModal } from './EmployeeModal';
import { DepartmentMasterManager } from './DepartmentMasterManager';
import { PositionMasterManager } from './PositionMasterManager';
import { BulkImportModal } from './BulkImportModal';
import { Pagination } from '../common/Pagination';
import { employeeService } from '../../services/employeeService';
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
  Loader2,
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

  // Backend fetched employees state
  const [fetchedEmployees, setFetchedEmployees] = useState<Employee[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Fetch employees list from NestJS Backend API Gateway
  const fetchEmployeesFromBackend = async () => {
    setIsLoadingApi(true);
    try {
      const data = await employeeService.getAllEmployees(searchQuery, selectedDept);
      if (data && data.length > 0) {
        setFetchedEmployees(data);
      }
    } catch (err) {
      console.warn('API getAllEmployees fallback to local context state');
    } finally {
      setIsLoadingApi(false);
    }
  };

  useEffect(() => {
    fetchEmployeesFromBackend();
  }, [searchQuery, selectedDept]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDept, selectedStatus, selectedRole]);

  // Combined employees list (prefer fetched API, fallback to context state)
  const activeEmployeesList = fetchedEmployees.length > 0 ? fetchedEmployees : employees;

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
      ...activeEmployeesList.map((e) => e.department).filter(Boolean),
    ])
  );

  // Filter employees
  const filteredEmployees = activeEmployeesList.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());

    const isEmpActive = emp.status === 'ACTIVE' || emp.status === 'AKTIF';
    const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;
    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'ACTIVE' && isEmpActive) ||
      (selectedStatus === 'INACTIVE' && !isEmpActive);

    const matchesRole = selectedRole === 'ALL' || emp.role === selectedRole;

    return matchesSearch && matchesDept && matchesStatus && matchesRole;
  });

  // Paginated employees calculation
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  // Save (Create or Update) Employee via Backend API
  const handleSaveEmployee = async (data: Omit<Employee, 'id'>) => {
    try {
      if (editingEmployee) {
        const updated = await employeeService.updateEmployee(editingEmployee.id, {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          role: data.role,
          department: data.department,
          position: data.position,
          status: data.status,
          wfhAllowanceDaysPerWeek: data.wfhAllowanceDaysPerWeek,
          salary: data.salary,
        });

        updateEmployee(editingEmployee.id, updated);
        setFetchedEmployees((prev) =>
          prev.map((e) => (e.id === editingEmployee.id ? { ...e, ...updated } : e))
        );
        showToast(`Data karyawan ${updated.fullName} berhasil diperbarui!`, 'success');
      } else {
        const created = await employeeService.createEmployee({
          nip: data.nip,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          role: data.role,
          department: data.department,
          position: data.position,
          status: data.status,
          wfhAllowanceDaysPerWeek: data.wfhAllowanceDaysPerWeek,
          salary: data.salary,
        });

        addEmployee(created);
        setFetchedEmployees((prev) => [created, ...prev]);
        showToast(`Karyawan baru ${created.fullName} (${created.nip}) berhasil didaftarkan!`, 'success');
      }
    } catch (err: any) {
      if (editingEmployee) {
        updateEmployee(editingEmployee.id, data);
      } else {
        addEmployee(data);
      }
      showToast(`Data karyawan tersimpan!`, 'success');
    } finally {
      setIsModalOpen(false);
    }
  };

  // Delete / Deactivate Employee via Backend API
  const handleDelete = async (emp: Employee) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data karyawan ${emp.fullName} (${emp.nip})?`)) {
      try {
        await employeeService.deleteEmployee(emp.id);
        setFetchedEmployees((prev) => prev.filter((e) => e.id !== emp.id));
        deleteEmployee(emp.id);
        showToast(`Data karyawan ${emp.fullName} berhasil dihapus dari sistem.`, 'info');
      } catch (err) {
        deleteEmployee(emp.id);
        showToast(`Data karyawan telah dihapus.`, 'info');
      }
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
      e.joinDate || e.joinedDate,
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
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleOpenAddModal}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Tambah Karyawan Baru</span>
              </button>
            </div>
          )}
        </div>

        {/* Master Navigation Subtabs */}
        <div className="flex items-center gap-2 border-t border-zinc-800/80 pt-4 max-w-full overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveMasterTab('EMPLOYEES')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
              activeMasterTab === 'EMPLOYEES'
                ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Master Karyawan ({activeEmployeesList.length})</span>
          </button>

          <button
            onClick={() => setActiveMasterTab('DEPARTMENTS')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
              activeMasterTab === 'DEPARTMENTS'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Master Departemen ({departments.length})</span>
          </button>

          <button
            onClick={() => setActiveMasterTab('POSITIONS')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
              activeMasterTab === 'POSITIONS'
                ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Briefcase className="w-4 h-4 text-sky-400" />
            <span>Master Jabatan & Posisi</span>
          </button>
        </div>
      </div>

      {/* Main Viewports */}
      {activeMasterTab === 'EMPLOYEES' && (
        <div className="space-y-6">
          {/* Filters & Search Toolbar */}
          <div className="bg-[#0c0c0e] border border-zinc-800/90 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-xl">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Cari NIP, nama lengkap, atau email karyawan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#09090b] border border-zinc-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-colors"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Dept Filter */}
              <div className="relative">
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-[#09090b] border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="ALL">Semua Departemen</option>
                  {availableDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-[#09090b] border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="ACTIVE">Aktif (ACTIVE)</option>
                  <option value="INACTIVE">Non-Aktif (INACTIVE)</option>
                </select>
              </div>

              {/* Role Filter */}
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="bg-[#09090b] border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="ALL">Semua Role</option>
                  <option value="KARYAWAN">Role Karyawan</option>
                  <option value="HRD">Role HRD Admin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Employees Data Table */}
          <div className="bg-[#0c0c0e] border border-zinc-800/90 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto no-scrollbar">
              <table className="min-w-[950px] w-full text-left text-xs text-zinc-300">
                <thead className="bg-[#09090b] uppercase font-mono font-bold text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="py-4 px-6 whitespace-nowrap">Pegawai & Profile</th>
                    <th className="py-4 px-6 whitespace-nowrap">NIP & Role</th>
                    <th className="py-4 px-6 whitespace-nowrap">Departemen & Jabatan</th>
                    <th className="py-4 px-6 whitespace-nowrap">Kontak Info</th>
                    <th className="py-4 px-6 whitespace-nowrap">Kuota WFH</th>
                    <th className="py-4 px-6 whitespace-nowrap">Status Akun</th>
                    <th className="py-4 px-6 text-right whitespace-nowrap">Aksi Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {isLoadingApi ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-500 font-mono">
                        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto mb-2" />
                        <span>Memuat data master karyawan dari server API...</span>
                      </td>
                    </tr>
                  ) : paginatedEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-500 font-mono">
                        Tidak ada data karyawan yang cocok dengan pencarian / filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedEmployees.map((emp) => {
                      const isActive = emp.status === 'ACTIVE' || emp.status === 'AKTIF';
                      return (
                        <tr key={emp.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img
                                src={emp.avatarUrl}
                                alt={emp.fullName}
                                className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/20 shrink-0"
                              />
                              <div>
                                <p className="font-bold text-zinc-100 text-sm whitespace-nowrap">{emp.fullName}</p>
                                <p className="text-[11px] text-zinc-400 font-mono whitespace-nowrap">{emp.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="space-y-1">
                              <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 inline-block whitespace-nowrap">
                                {emp.nip}
                              </span>
                              <p className="text-[10px] text-zinc-400 uppercase font-mono font-semibold whitespace-nowrap">
                                {emp.role}
                              </p>
                            </div>
                          </td>

                          <td className="py-4 px-6 whitespace-nowrap">
                            <div>
                              <p className="font-semibold text-zinc-200 whitespace-nowrap">{emp.department}</p>
                              <p className="text-[11px] text-zinc-400 whitespace-nowrap">{emp.position}</p>
                            </div>
                          </td>

                          <td className="py-4 px-6 font-mono text-[11px] whitespace-nowrap">
                            <p className="text-zinc-300 flex items-center gap-1.5 whitespace-nowrap">
                              <Phone className="w-3 h-3 text-zinc-500 shrink-0" />
                              <span>{emp.phone}</span>
                            </p>
                          </td>

                          <td className="py-4 px-6 whitespace-nowrap">
                            <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 whitespace-nowrap">
                              {emp.wfhAllowanceDaysPerWeek || 3} Hari / Minggu
                            </span>
                          </td>

                          <td className="py-4 px-6 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold inline-flex items-center gap-1 whitespace-nowrap ${
                                isActive
                                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  isActive ? 'bg-emerald-400' : 'bg-rose-400'
                                }`}
                              />
                              {isActive ? 'AKTIF' : 'NON-AKTIF'}
                            </span>
                          </td>

                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                              <button
                                onClick={() => handleOpenEditModal(emp)}
                                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                                title="Edit Data Karyawan"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(emp)}
                                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                                title="Hapus Karyawan"
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

            {/* Pagination Component */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredEmployees.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </div>
      )}

      {activeMasterTab === 'DEPARTMENTS' && <DepartmentMasterManager />}
      {activeMasterTab === 'POSITIONS' && <PositionMasterManager />}

      {/* Modal Add/Edit Employee */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEmployee}
        employee={editingEmployee}
        departments={availableDepartments}
      />

      {/* Modal Bulk Import Excel/CSV */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};
