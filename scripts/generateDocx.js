import fs from 'fs';
import path from 'path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  AlignmentType,
  ShadingType,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
} from 'docx';

function createHeaderCell(text, widthPercent = 25) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: { fill: '0F172A', type: ShadingType.CLEAR },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text,
            bold: true,
            color: 'FFFFFF',
            size: 20, // 10pt
            font: 'Arial',
          }),
        ],
      }),
    ],
  });
}

function createBodyCell(text, isCode = false, widthPercent = 25, isBold = false) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text,
            font: isCode ? 'Consolas' : 'Arial',
            size: isCode ? 18 : 20,
            bold: isBold,
            color: isCode ? '0284C7' : '1E293B',
          }),
        ],
      }),
    ],
  });
}

function createCodeBlock(codeText) {
  const lines = codeText.split('\n');
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
      left: { style: BorderStyle.SINGLE, size: 12, color: '10B981' },
      right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: '09090B', type: ShadingType.CLEAR },
            children: lines.map(
              (line) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: line,
                      font: 'Consolas',
                      size: 18, // 9pt
                      color: '38BDF8',
                    }),
                  ],
                })
            ),
          }),
        ],
      }),
    ],
  });
}

const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: 1440, // 1 inch
            bottom: 1440,
            left: 1440,
            right: 1440,
          },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: 'Spesifikasi API Backend — WFH Portal Enterprise v1.0',
                  font: 'Arial',
                  size: 16,
                  color: '64748B',
                  italic: true,
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'Halaman ',
                  font: 'Arial',
                  size: 18,
                  color: '64748B',
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: 'Arial',
                  size: 18,
                  color: '64748B',
                }),
                new TextRun({
                  text: ' dari ',
                  font: 'Arial',
                  size: 18,
                  color: '64748B',
                }),
                new TextRun({
                  children: [PageNumber.TOTAL_PAGES],
                  font: 'Arial',
                  size: 18,
                  color: '64748B',
                }),
              ],
            }),
          ],
        }),
      },
      children: [
        // Title Block
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: 'DOKUMENTASI SPESIFIKASI API BACKEND (RESTful)',
              bold: true,
              size: 32, // 16pt
              font: 'Arial',
              color: '0F172A',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: 'Sistem Absensi, Monitoring WFH & HR Governance Enterprise',
              size: 24, // 12pt
              font: 'Arial',
              color: '10B981',
              bold: true,
            }),
          ],
        }),
        new Paragraph({ text: '' }),

        // General Info Box
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: '0284C7' },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: '0284C7' },
            left: { style: BorderStyle.SINGLE, size: 6, color: '0284C7' },
            right: { style: BorderStyle.SINGLE, size: 6, color: '0284C7' },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  shading: { fill: 'F0F9FF', type: ShadingType.CLEAR },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: 'Informasi Umum Integrasi:', bold: true, size: 22, color: '0369A1' }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({ text: '• Base URL API: ', bold: true, size: 20 }),
                        new TextRun({ text: 'https://api.company.com/api/v1', font: 'Consolas', size: 18 }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({ text: '• Authentication: ', bold: true, size: 20 }),
                        new TextRun({ text: 'HTTP Bearer Token (JWT Auth) pada Header Authorization', size: 20 }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({ text: '• Content-Type Standard: ', bold: true, size: 20 }),
                        new TextRun({ text: 'application/json (Kecuali Upload Foto/Surat memakai multipart/form-data)', size: 20 }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({ text: '• Dokumen ini ditujukan untuk: ', bold: true, size: 20 }),
                        new TextRun({ text: 'Programmer Backend (Node.js/Express, Go, Laravel, Python, etc.)', size: 20 }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),

        new Paragraph({ text: '' }),

        // Heading 1: Modul Overview
        new Paragraph({
          text: 'DAFTAR MODUL API & ENDPOINT OVERVIEW',
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun({ text: 'DAFTAR MODUL API & ENDPOINT OVERVIEW', bold: true, size: 26, color: '0F172A' }),
          ],
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: 'Sistem WFH Portal terdiri dari 8 Modul Utama dengan total 28 Endpoint RESTful yang dirancang untuk mendukung operasional karyawan WFH dan manajemen HRD secara real-time.',
              size: 20,
            }),
          ],
        }),

        new Paragraph({ text: '' }),

        // SECTION 4: HRD MONITORING & ANALYTICS (IN-DEPTH DETAIL)
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun({
              text: 'MODUL 4: HRD MONITORING & ANALYTICS (RINCIAN DETAIL)',
              bold: true,
              size: 26,
              color: '0284C7',
            }),
          ],
        }),

        // 4.1 Detail
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({
              text: '4.1 GET /api/v1/hrd/monitoring (Monitoring Kehadiran Real-Time)',
              bold: true,
              size: 22,
              color: '0F172A',
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Endpoint ini digunakan oleh Admin HRD untuk melihat papan pantau (dashboard monitoring) seluruh karyawan pada hari yang dipilih, lengkap dengan filter lokasi kerja, status absensi, pencarian nama/NIK, dan pagination.',
              size: 20,
            }),
          ],
        }),
        new Paragraph({ text: '' }),

        // Query Params Table for 4.1
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createHeaderCell('Parameter Query', 25),
                createHeaderCell('Tipe Data', 15),
                createHeaderCell('Wajib?', 15),
                createHeaderCell('Keterangan & Nilai Opsional', 45),
              ],
            }),
            new TableRow({
              children: [
                createBodyCell('date', true, 25),
                createBodyCell('String (YYYY-MM-DD)', false, 15),
                createBodyCell('Tidak (Default: Today)', false, 15),
                createBodyCell('Filter tanggal absensi. Contoh: 2026-08-07', false, 45),
              ],
            }),
            new TableRow({
              children: [
                createBodyCell('department', true, 25),
                createBodyCell('String', false, 15),
                createBodyCell('Tidak', false, 15),
                createBodyCell('Filter divisi (Contoh: "Engineering", "HRD")', false, 45),
              ],
            }),
            new TableRow({
              children: [
                createBodyCell('work_location', true, 25),
                createBodyCell('String Enum', false, 15),
                createBodyCell('Tidak', false, 15),
                createBodyCell('Nilai: "WFH", "WFO", "COWORKING", "ALL"', false, 45),
              ],
            }),
            new TableRow({
              children: [
                createBodyCell('status', true, 25),
                createBodyCell('String Enum', false, 15),
                createBodyCell('Tidak', false, 15),
                createBodyCell('Nilai: "HADIR", "TERLAMBAT", "BELUM_ABSEN", "IZIN_SAKIT", "CUTI"', false, 45),
              ],
            }),
            new TableRow({
              children: [
                createBodyCell('search', true, 25),
                createBodyCell('String', false, 15),
                createBodyCell('Tidak', false, 15),
                createBodyCell('Kata kunci nama karyawan atau NIK', false, 45),
              ],
            }),
            new TableRow({
              children: [
                createBodyCell('page & limit', true, 25),
                createBodyCell('Integer', false, 15),
                createBodyCell('Tidak (Default: 1, 20)', false, 15),
                createBodyCell('Gunakan untuk pagination data', false, 45),
              ],
            }),
          ],
        }),

        new Paragraph({ text: '' }),
        new Paragraph({ children: [new TextRun({ text: 'Contoh JSON Response (200 OK):', bold: true, size: 20 })] }),
        createCodeBlock(`{
  "status": "success",
  "message": "Data monitoring kehadiran berhasil dimuat",
  "meta": {
    "date": "2026-08-07",
    "total_records": 48,
    "current_page": 1,
    "total_pages": 3,
    "summary_stats": {
      "total_employees": 50,
      "total_present": 42,
      "total_late": 3,
      "total_wfh": 32,
      "total_wfo": 10,
      "total_absent": 5
    }
  },
  "data": [
    {
      "attendance_id": "ATT-20260807-001",
      "employee_id": "EMP-2026-001",
      "employee_name": "Budi Santoso",
      "department": "Engineering",
      "position": "Frontend Engineer",
      "clock_in_time": "2026-08-07T07:55:12+07:00",
      "clock_out_time": "2026-08-07T17:05:00+07:00",
      "work_location": "WFH",
      "status": "HADIR",
      "shift_name": "Shift Reguler Pagi (08:00 - 17:00)",
      "liveness_score": 98.5,
      "geofence_status": "WITHIN_RADIUS",
      "distance_from_base_meters": 12.4,
      "has_daily_report": true
    }
  ]
}`),

        new Paragraph({ text: '' }),

        // 4.2 Detail
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({
              text: '4.2 GET /api/v1/hrd/attendance/export (Export Laporan Excel / PDF)',
              bold: true,
              size: 22,
              color: '0F172A',
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Endpoint ini bertugas meng-generate dan mendownload berkas rekapitulasi kehadiran (Format .XLSX Excel atau .PDF) sesuai rentang tanggal yang dipilih oleh Admin HRD.',
              size: 20,
            }),
          ],
        }),
        new Paragraph({ text: '' }),

        // Query Params Table for 4.2
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createHeaderCell('Parameter Query', 25),
                createHeaderCell('Tipe Data', 15),
                createHeaderCell('Wajib?', 15),
                createHeaderCell('Keterangan & Format', 45),
              ],
            }),
            new TableRow({
              children: [
                createBodyCell('start_date', true, 25),
                createBodyCell('String (YYYY-MM-DD)', false, 15),
                createBodyCell('YA', false, 15),
                createBodyCell('Tanggal awal periode rekap. Contoh: 2026-08-01', false, 45),
              ],
            }),
            new TableRow({
              children: [
                createBodyCell('end_date', true, 25),
                createBodyCell('String (YYYY-MM-DD)', false, 15),
                createBodyCell('YA', false, 15),
                createBodyCell('Tanggal akhir periode rekap. Contoh: 2026-08-31', false, 45),
              ],
            }),
            new TableRow({
              children: [
                createBodyCell('format', true, 25),
                createBodyCell('String Enum', false, 15),
                createBodyCell('YA', false, 15),
                createBodyCell('Pilihan format file: "excel" atau "pdf"', false, 45),
              ],
            }),
            new TableRow({
              children: [
                createBodyCell('department_id', true, 25),
                createBodyCell('String', false, 15),
                createBodyCell('Tidak', false, 15),
                createBodyCell('Kosongkan untuk meng-export semua departemen', false, 45),
              ],
            }),
            new TableRow({
              children: [
                createBodyCell('include_photos', true, 25),
                createBodyCell('Boolean', false, 15),
                createBodyCell('Tidak (Default: false)', false, 15),
                createBodyCell('Sertakan URL foto selfie swafoto pada file PDF', false, 45),
              ],
            }),
          ],
        }),

        new Paragraph({ text: '' }),
        new Paragraph({ children: [new TextRun({ text: 'Header Response Server untuk Binary Download File:', bold: true, size: 20 })] }),
        createCodeBlock(`HTTP/1.1 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="Rekap_Absensi_WFH_202608.xlsx"
Content-Length: 145820
Cache-Control: no-cache`),

        new Paragraph({ text: '' }),

        // 4.3 Detail
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({
              text: '4.3 GET /api/v1/hrd/attendance/detail/{attendance_id} (Audit Detail Presensi)',
              bold: true,
              size: 22,
              color: '0F172A',
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Digunakan saat Admin HRD mengklik salah satu baris karyawan pada tabel monitoring untuk membuka modal audit lengkap (foto selfie clock in/out, peta lokasi GPS, log kegiatan harian, dan liveness check).',
              size: 20,
            }),
          ],
        }),
        new Paragraph({ text: '' }),
        createCodeBlock(`{
  "status": "success",
  "data": {
    "attendance_id": "ATT-20260807-001",
    "employee": {
      "employee_id": "EMP-2026-001",
      "name": "Budi Santoso",
      "department": "Engineering"
    },
    "clock_in": {
      "time": "2026-08-07T07:55:12+07:00",
      "photo_url": "https://storage.company.com/attendance/photos/20260807_in_001.jpg",
      "latitude": -6.2088,
      "longitude": 106.8456,
      "address": "Jl. Tebet Raya No. 42, Jakarta Selatan",
      "liveness_verified": true,
      "liveness_score": 98.5,
      "device_info": "Chrome 128 / Android 14"
    },
    "clock_out": {
      "time": "2026-08-07T17:05:00+07:00",
      "photo_url": "https://storage.company.com/attendance/photos/20260807_out_001.jpg",
      "latitude": -6.2089,
      "longitude": 106.8457
    },
    "daily_report": {
      "summary": "1. Selesai slicing UI MFE Portal\\n2. Integrasi API Auth JWT\\n3. Unit test 100% pass",
      "submitted_at": "2026-08-07T17:04:30+07:00"
    }
  }
}`),

        new Paragraph({ text: '' }),

        // SECTION SUMMARY TABLE OF ALL OTHER MODULES
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun({
              text: 'RINGKASAN LENGKAP ENTIRE API ENDPOINTS (MODUL 1 - MODUL 8)',
              bold: true,
              size: 26,
              color: '0F172A',
            }),
          ],
        }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createHeaderCell('Modul', 15),
                createHeaderCell('HTTP Method & Path', 35),
                createHeaderCell('Role Izin (RBAC)', 20),
                createHeaderCell('Fungsi Utama', 30),
              ],
            }),
            // Modul 1
            new TableRow({
              children: [
                createBodyCell('1. Auth', false, 15, true),
                createBodyCell('POST /api/v1/auth/login', true, 35),
                createBodyCell('Public', false, 20),
                createBodyCell('Autentikasi NIK & password, return JWT Token', false, 30),
              ],
            }),
            new TableRow({
              children: [
                createBodyCell('1. Auth', false, 15),
                createBodyCell('GET /api/v1/auth/me', true, 35),
                createBodyCell('Authenticated', false, 20),
                createBodyCell('Mendapatkan profil user aktif & permissions', false, 30),
              ],
            }),
            // Modul 2
            new TableRow({
              children: [
                createBodyCell('2. Attendance', false, 15, true),
                createBodyCell('POST /api/v1/attendance/clock-in', true, 35),
                createBodyCell('Karyawan', false, 20),
                createBodyCell('Clock In WFH/WFO (Send selfie, lat/long, liveness)', false, 30),
              ],
            }),
            new TableRow({
              children: [
                createBodyCell('2. Attendance', false, 15),
                createBodyCell('POST /api/v1/attendance/clock-out', true, 35),
                createBodyCell('Karyawan', false, 20),
                createBodyCell('Clock Out & Submit 3-bullet Daily Work Log', false, 30),
              ],
            }),
            new TableRow({
              children: [
                createBodyCell('2. Attendance', false, 15),
                createBodyCell('GET /api/v1/attendance/my-history', true, 35),
                createBodyCell('Karyawan', false, 20),
                createBodyCell('Melihat riwayat absensi pribadi bulan berjalan', false, 30),
              ],
            }),
            // Modul 3
            new TableRow({
              children: [
                createBodyCell('3. Leaves', false, 15, true),
                createBodyCell('POST /api/v1/leaves/request', true, 35),
                createBodyCell('Karyawan', false, 20),
                createBodyCell('Pengajuan Cuti / Izin / Sakit / WFH Ekstra', false, 30),
              ],
            }),
            new TableRow({
              children: [
                createBodyCell('3. Leaves', false, 15),
                createBodyCell('PATCH /api/v1/leaves/hrd/process/{id}', true, 35),
                createBodyCell('HRD Admin', false, 20),
                createBodyCell('Approval / Rejection pengajuan izin karyawan', false, 30),
              ],
            }),
            // Modul 5
            new TableRow({
              children: [
                createBodyCell('5. Employees', false, 15, true),
                createBodyCell('GET /api/v1/employees', true, 35),
                createBodyCell('HRD Admin', false, 20),
                createBodyCell('List Master Data Karyawan & Filter', false, 30),
              ],
            }),
            new TableRow({
              children: [
                createBodyCell('5. Employees', false, 15),
                createBodyCell('POST /api/v1/employees/bulk-import', true, 35),
                createBodyCell('HRD Admin', false, 20),
                createBodyCell('Import masal karyawan dari berkas Excel/CSV', false, 30),
              ],
            }),
            // Modul 6
            new TableRow({
              children: [
                createBodyCell('6. Config', false, 15, true),
                createBodyCell('POST /api/v1/config/shifts', true, 35),
                createBodyCell('HRD Admin', false, 20),
                createBodyCell('Atur Jam Operasional & Toleransi Keterlambatan', false, 30),
              ],
            }),
            new TableRow({
              children: [
                createBodyCell('6. Config', false, 15),
                createBodyCell('POST /api/v1/config/geofence', true, 35),
                createBodyCell('HRD Admin', false, 20),
                createBodyCell('Atur Koordinat Titik Lokasi & Radius Meter', false, 30),
              ],
            }),
            // Modul 7
            new TableRow({
              children: [
                createBodyCell('7. Payroll', false, 15, true),
                createBodyCell('GET /api/v1/payroll/recap', true, 35),
                createBodyCell('HRD Admin', false, 20),
                createBodyCell('Rekap Tunjangan WFH, Jam Kerja & Potongan Late', false, 30),
              ],
            }),
            // Modul 8
            new TableRow({
              children: [
                createBodyCell('8. System', false, 15, true),
                createBodyCell('GET /api/v1/system/audit-logs', true, 35),
                createBodyCell('Super Admin', false, 20),
                createBodyCell('Melihat Log Aktivitas Sistem & Pengubahan Data', false, 30),
              ],
            }),
          ],
        }),

        new Paragraph({ text: '' }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Catatan Penutup untuk Programmer Backend:',
              bold: true,
              size: 20,
              color: '0F172A',
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: ' Seluruh response error Wajib mengikuti format baku JSON { "status": "error", "code": "ERR_CODE", "message": "Penjelasan error" } dengan HTTP status code 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 422 (Unprocessable Entity), atau 500 (Internal Server Error).',
              size: 18,
              italic: true,
            }),
          ],
        }),
      ],
    },
  ],
});

async function main() {
  const buffer = await Packer.toBuffer(doc);
  const targetPathPublic = path.join(process.cwd(), 'public', 'Dokumentasi_API_WFH_Portal.docx');
  const targetPathRoot = path.join(process.cwd(), 'Dokumentasi_API_WFH_Portal.docx');

  fs.mkdirSync(path.join(process.cwd(), 'public'), { recursive: true });
  fs.writeFileSync(targetPathPublic, buffer);
  fs.writeFileSync(targetPathRoot, buffer);

  console.log('File .docx berhasil dibuat di:', targetPathPublic);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
