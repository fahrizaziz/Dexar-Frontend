import { AttendanceRecord, LeaveRequest } from '../types';

export function exportAttendanceToCSV(records: AttendanceRecord[], filename = 'Rekap_Absensi_WFH.csv') {
  if (!records || records.length === 0) {
    alert('Tidak ada data absensi untuk diexport.');
    return;
  }

  const headers = [
    'ID Rekam',
    'NIP',
    'Nama Karyawan',
    'Departemen',
    'Tanggal',
    'Jam Masuk (Clock In)',
    'Jam Pulang (Clock Out)',
    'Status Kehadiran',
    'Status Verifikasi HRD',
    'Lokasi Presensi',
    'Rencana Kerja (Work Plan)',
    'Ringkasan Kerja (Work Summary)',
    'Catatan HRD',
  ];

  const rows = records.map((r) => [
    r.id,
    r.employeeNip,
    `"${r.employeeName.replace(/"/g, '""')}"`,
    `"${r.department.replace(/"/g, '""')}"`,
    r.date,
    r.clockInTime || '-',
    r.clockOutTime || '-',
    r.status,
    r.verificationStatus,
    `"${(r.location?.address || '').replace(/"/g, '""')}"`,
    `"${(r.workPlan || '').replace(/"/g, '""')}"`,
    `"${(r.workSummary || '').replace(/"/g, '""')}"`,
    `"${(r.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent =
    '\uFEFF' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportLeaveRequestsToCSV(requests: LeaveRequest[], filename = 'Rekap_Pengajuan_Izin_Cuti_WFH.csv') {
  if (!requests || requests.length === 0) {
    alert('Tidak ada data pengajuan untuk diexport.');
    return;
  }

  const headers = [
    'ID Pengajuan',
    'NIP',
    'Nama Karyawan',
    'Departemen',
    'Jenis Permohonan',
    'Tanggal Mulai',
    'Tanggal Selesai',
    'Alasan Pengajuan',
    'Status Approval HRD',
    'Catatan HRD',
    'Waktu Pengajuan',
  ];

  const rows = requests.map((r) => [
    r.id,
    r.employeeNip,
    `"${r.employeeName.replace(/"/g, '""')}"`,
    `"${r.department.replace(/"/g, '""')}"`,
    r.type,
    r.startDate,
    r.endDate,
    `"${(r.reason || '').replace(/"/g, '""')}"`,
    r.status,
    `"${(r.hrdNotes || '').replace(/"/g, '""')}"`,
    r.createdAt,
  ]);

  const csvContent =
    '\uFEFF' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToCSV(data: Record<string, any>[], filename = 'Export_Data.csv') {
  if (!data || data.length === 0) {
    alert('Tidak ada data untuk diexport.');
    return;
  }

  const headers = Object.keys(data[0]);
  const rows = data.map((item) =>
    headers.map((header) => {
      const val = item[header] ?? '';
      const stringVal = String(val).replace(/"/g, '""');
      return `"${stringVal}"`;
    })
  );

  const csvContent =
    '\uFEFF' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
