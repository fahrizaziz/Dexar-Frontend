import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Employee, Role } from '../../types';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  FileCheck,
  RefreshCw,
  Info,
} from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedRow {
  id: string;
  nip: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  role: Role;
  statusKepegawaian: 'AKTIF' | 'NON_AKTIF';
  wfhAllowanceDaysPerWeek: number;
  status: 'VALID' | 'DUPLICATE_NIP' | 'INVALID';
  errorMessage?: string;
  selected: boolean;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose }) => {
  const { employees, addEmployee, updateEmployee, showToast, departments } = useApp();
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [updateDuplicates, setUpdateDuplicates] = useState(false);

  const existingNips = new Set(employees.map((e) => e.nip.trim().toUpperCase()));

  // Download official Template Excel (.xlsx / .csv)
  const handleDownloadTemplate = (format: 'xlsx' | 'csv') => {
    const templateData = [
      {
        'NIP *': 'EMP-2026-901',
        'Nama Lengkap *': 'Maya Putri Pratiwi',
        'Email *': 'maya.putri@company.co.id',
        'No Telepon *': '081298765432',
        'Departemen / Divisi *': departments[0]?.name || 'Engineering & Tech',
        'Jabatan / Posisi *': 'Backend Developer',
        'Role (KARYAWAN / HRD_ADMIN) *': 'KARYAWAN',
        'Status Kepegawaian (AKTIF / NON_AKTIF) *': 'AKTIF',
        'Jatah WFH (Hari/Minggu)': 3,
      },
      {
        'NIP *': 'EMP-2026-902',
        'Nama Lengkap *': 'Dimas Anggara',
        'Email *': 'dimas.anggara@company.co.id',
        'No Telepon *': '081387654321',
        'Departemen / Divisi *': departments[1]?.name || 'Human Resources',
        'Jabatan / Posisi *': 'HR Specialist',
        'Role (KARYAWAN / HRD_ADMIN) *': 'HRD_ADMIN',
        'Status Kepegawaian (AKTIF / NON_AKTIF) *': 'AKTIF',
        'Jatah WFH (Hari/Minggu)': 2,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Auto fit column width
    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 25 },
      { wch: 28 },
      { wch: 18 },
      { wch: 24 },
      { wch: 24 },
      { wch: 28 },
      { wch: 28 },
      { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Import Karyawan');

    if (format === 'xlsx') {
      XLSX.writeFile(workbook, 'Template_Import_Karyawan.xlsx');
    } else {
      XLSX.writeFile(workbook, 'Template_Import_Karyawan.csv', { bookType: 'csv' });
    }

    showToast(`Template Import Karyawan (${format.toUpperCase()}) berhasil diunduh.`, 'success');
  };

  // Process uploaded Excel / CSV file
  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        if (!buffer) return;

        const workbook = XLSX.read(buffer, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rawRows.length === 0) {
          showToast('File Excel / CSV kosong atau format header tidak sesuai.', 'error');
          return;
        }

        const formattedRows: ParsedRow[] = rawRows.map((row, index) => {
          // Normalize column keys
          const nip = String(
            row['NIP *'] || row['NIP'] || row['nip'] || row['Nomor Induk Pegawai'] || ''
          ).trim();
          const fullName = String(
            row['Nama Lengkap *'] || row['Nama Lengkap'] || row['Nama'] || row['nama'] || ''
          ).trim();
          const email = String(
            row['Email *'] || row['Email'] || row['email'] || ''
          ).trim();
          const phone = String(
            row['No Telepon *'] || row['No Telepon'] || row['No HP'] || row['phone'] || ''
          ).trim();
          const department = String(
            row['Departemen / Divisi *'] || row['Departemen'] || row['Divisi'] || 'Engineering & Tech'
          ).trim();
          const position = String(
            row['Jabatan / Posisi *'] || row['Jabatan'] || row['Posisi'] || 'Staff'
          ).trim();
          
          let roleRaw = String(
            row['Role (KARYAWAN / HRD_ADMIN) *'] || row['Role (USER/HRD) *'] || row['Role'] || 'KARYAWAN'
          ).trim().toUpperCase();
          const role: Role = (roleRaw.includes('HRD') || roleRaw.includes('ADMIN')) ? 'HRD_ADMIN' : 'KARYAWAN';

          let statusRaw = String(
            row['Status Kepegawaian (AKTIF / NON_AKTIF) *'] || row['Status'] || 'AKTIF'
          ).trim().toUpperCase();
          let statusKepegawaian: 'AKTIF' | 'NON_AKTIF' = statusRaw.includes('NON') || statusRaw.includes('INAKTIF') ? 'NON_AKTIF' : 'AKTIF';

          const wfhAllowanceDaysPerWeek = Number(row['Jatah WFH (Hari/Minggu)'] || row['Jatah WFH'] || 3) || 3;

          // Validation logic
          let status: 'VALID' | 'DUPLICATE_NIP' | 'INVALID' = 'VALID';
          let errorMessage = '';

          if (!nip || !fullName || !email) {
            status = 'INVALID';
            errorMessage = 'Wajib mengisi NIP, Nama, dan Email!';
          } else if (existingNips.has(nip.toUpperCase())) {
            status = 'DUPLICATE_NIP';
            errorMessage = 'NIP sudah terdaftar di database';
          }

          return {
            id: `import-${index}-${Date.now()}`,
            nip,
            fullName,
            email,
            phone: phone || '0812-0000-0000',
            department,
            position,
            role,
            statusKepegawaian,
            wfhAllowanceDaysPerWeek,
            status,
            errorMessage,
            selected: status !== 'INVALID',
          };
        });

        setParsedRows(formattedRows);
        showToast(`Berhasil membaca ${formattedRows.length} baris dari file ${file.name}`, 'info');
      } catch (err) {
        console.error(err);
        showToast('Gagal memproses file Excel/CSV. Pastikan format valid.', 'error');
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const toggleRowSelect = (id: string) => {
    setParsedRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r))
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setParsedRows((prev) =>
      prev.map((r) => (r.status !== 'INVALID' ? { ...r, selected: checked } : r))
    );
  };

  const handleExecuteImport = () => {
    const rowsToImport = parsedRows.filter((r) => r.selected && r.status !== 'INVALID');

    if (rowsToImport.length === 0) {
      showToast('Pilih setidaknya 1 baris karyawan yang valid untuk di-import!', 'error');
      return;
    }

    let successCount = 0;
    let updatedCount = 0;

    rowsToImport.forEach((row) => {
      const existing = employees.find((e) => e.nip.trim().toUpperCase() === row.nip.trim().toUpperCase());

      if (existing) {
        if (updateDuplicates) {
          updateEmployee(existing.id, {
            fullName: row.fullName,
            email: row.email,
            phone: row.phone,
            department: row.department as any,
            position: row.position,
            role: row.role,
            status: row.statusKepegawaian,
            wfhAllowanceDaysPerWeek: row.wfhAllowanceDaysPerWeek,
          });
          updatedCount++;
        }
      } else {
        addEmployee({
          nip: row.nip,
          fullName: row.fullName,
          email: row.email,
          phone: row.phone,
          department: row.department as any,
          position: row.position,
          role: row.role,
          status: row.statusKepegawaian,
          wfhAllowanceDaysPerWeek: row.wfhAllowanceDaysPerWeek,
          avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + (successCount % 10) * 100}?w=150&auto=format&fit=crop&q=80`,
          joinDate: new Date().toISOString().split('T')[0],
        });
        successCount++;
      }
    });

    showToast(
      `Berhasil meng-import ${successCount} karyawan baru${
        updatedCount > 0 ? ` & memperbarui ${updatedCount} karyawan terdaftar` : ''
      }!`,
      'success'
    );

    setParsedRows([]);
    setFileName(null);
    onClose();
  };

  const validCount = parsedRows.filter((r) => r.status === 'VALID').length;
  const duplicateCount = parsedRows.filter((r) => r.status === 'DUPLICATE_NIP').length;
  const invalidCount = parsedRows.filter((r) => r.status === 'INVALID').length;
  const selectedCount = parsedRows.filter((r) => r.selected && r.status !== 'INVALID').length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Import Data Karyawan (Excel / CSV)"
      subtitle="Tambah banyak data karyawan sekaligus secara efisien menggunakan file Spreadsheet Excel"
    >
      <div className="space-y-6">
        {/* Step 1: Download Template */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-100">1. Unduh Format Template Excel</h4>
              <p className="text-[11px] text-zinc-400">
                Gunakan template resmi agar header kolom & format data terbaca otomatis.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleDownloadTemplate('xlsx')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.XLSX</span>
            </button>

            <button
              onClick={() => handleDownloadTemplate('csv')}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.CSV</span>
            </button>
          </div>
        </div>

        {/* Step 2: Dropzone File Upload */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/60'
          }`}
        >
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-200">
                {fileName ? (
                  <span className="text-indigo-400 font-mono">File Terpilih: {fileName}</span>
                ) : (
                  'Tarik & Lepaskan File Excel / CSV di sini atau Klik untuk Mengunggah'
                )}
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Mendukung format .xlsx, .xls, dan .csv (Maksimal 1,000 baris per file)
              </p>
            </div>
          </div>
        </div>

        {/* Step 3: Parsed Data Preview & Validation */}
        {parsedRows.length > 0 && (
          <div className="space-y-4">
            {/* Summary statistics bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl text-xs">
              <div className="flex items-center gap-4">
                <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-400" />
                  Total: {parsedRows.length} Baris
                </span>

                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Valid: {validCount}
                </span>

                {duplicateCount > 0 && (
                  <span className="text-amber-400 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Duplikat NIP: {duplicateCount}
                  </span>
                )}

                {invalidCount > 0 && (
                  <span className="text-rose-400 font-medium flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    Error: {invalidCount}
                  </span>
                )}
              </div>

              {duplicateCount > 0 && (
                <label className="flex items-center gap-2 cursor-pointer bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg text-amber-300 text-[11px]">
                  <input
                    type="checkbox"
                    checked={updateDuplicates}
                    onChange={(e) => setUpdateDuplicates(e.target.checked)}
                    className="accent-amber-500 rounded"
                  />
                  <span>Perbarui (Update) data jika NIP sudah ada</span>
                </label>
              )}
            </div>

            {/* Table view of Parsed Data */}
            <div className="border border-zinc-800 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
              <table className="w-full text-left text-[11px] text-zinc-300">
                <thead className="bg-zinc-900 text-zinc-400 font-mono sticky top-0 border-b border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-3">
                      <input
                        type="checkbox"
                        checked={selectedCount > 0 && selectedCount === parsedRows.filter((r) => r.status !== 'INVALID').length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="accent-indigo-500 rounded cursor-pointer"
                      />
                    </th>
                    <th className="py-2.5 px-3">NIP</th>
                    <th className="py-2.5 px-3">Nama Lengkap</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Departemen</th>
                    <th className="py-2.5 px-3">Jabatan</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Status Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 bg-zinc-950">
                  {parsedRows.map((row) => (
                    <tr
                      key={row.id}
                      className={`hover:bg-zinc-900/50 ${
                        row.status === 'INVALID'
                          ? 'bg-rose-950/20'
                          : row.status === 'DUPLICATE_NIP'
                          ? 'bg-amber-950/20'
                          : ''
                      }`}
                    >
                      <td className="py-2 px-3">
                        <input
                          type="checkbox"
                          disabled={row.status === 'INVALID'}
                          checked={row.selected}
                          onChange={() => toggleRowSelect(row.id)}
                          className="accent-indigo-500 rounded cursor-pointer disabled:opacity-30"
                        />
                      </td>

                      <td className="py-2 px-3 font-mono font-bold text-indigo-400">{row.nip || '-'}</td>
                      <td className="py-2 px-3 font-medium text-zinc-200">{row.fullName || '-'}</td>
                      <td className="py-2 px-3 text-zinc-400 font-mono">{row.email || '-'}</td>
                      <td className="py-2 px-3 text-zinc-300">{row.department}</td>
                      <td className="py-2 px-3 text-zinc-300">{row.position}</td>
                      <td className="py-2 px-3 font-mono text-[10px]">
                        <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">{row.role}</span>
                      </td>

                      <td className="py-2 px-3">
                        {row.status === 'VALID' && (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Ready
                          </span>
                        )}
                        {row.status === 'DUPLICATE_NIP' && (
                          <span className="inline-flex items-center gap-1 text-amber-400 font-medium" title={row.errorMessage}>
                            <AlertTriangle className="w-3 h-3" /> NIP Ada
                          </span>
                        )}
                        {row.status === 'INVALID' && (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-medium" title={row.errorMessage}>
                            <XCircle className="w-3 h-3" /> {row.errorMessage}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          <div className="text-xs text-zinc-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            <span>Data yang dimasukkan akan langsung tersimpan di Master Data.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:bg-zinc-800 transition-all cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              disabled={parsedRows.length === 0 || selectedCount === 0}
              onClick={handleExecuteImport}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>Import {selectedCount > 0 ? `${selectedCount} Karyawan` : 'Data'}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
