import { Employee, AttendanceRecord, DepartmentMaster, PositionMaster, LeaveRequest, AuditLog } from '../types';
import { getTodayDateString } from '../utils/dateUtils';

export const INITIAL_DEPARTMENTS: DepartmentMaster[] = [
  { id: 'dept-1', code: 'DEPT-001', name: 'Human Resources & General Affairs', headOfDepartment: 'Siti Rahmawati', description: 'Divisi Manajemen Sumber Daya Manusia & Operational HRD', status: 'AKTIF' },
  { id: 'dept-2', code: 'DEPT-002', name: 'Engineering & Tech', headOfDepartment: '-', description: 'Divisi Rekayasa Perangkat Lunak & IT', status: 'AKTIF' },
];

export const INITIAL_POSITIONS: PositionMaster[] = [
  { id: 'pos-1', code: 'POS-001', name: 'HR Manager & System Admin', departmentName: 'Human Resources & General Affairs', level: 'Manager', status: 'AKTIF' },
  { id: 'pos-2', code: 'POS-002', name: 'Senior Frontend Engineer', departmentName: 'Engineering & Tech', level: 'Senior', status: 'AKTIF' },
];

// Single HRD Admin User
export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-101',
    nip: 'EMP-2026-001',
    fullName: 'Siti Rahmawati',
    email: 'siti.rahmawati@company.co.id',
    phone: '0819-8765-4321',
    department: 'Human Resources & General Affairs',
    position: 'HR Manager & System Admin',
    role: 'HRD_ADMIN',
    status: 'AKTIF',
    joinDate: '2021-01-10',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    wfhAllowanceDaysPerWeek: 5,
    salary: 15000000,
  },
];

// Empty attendance records and leave requests for clean state
export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [];

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_GEOFENCE_CONFIG = {
  officeName: 'Kantor Pusat HQ Jakarta (South Quarter)',
  latitude: -6.2915,
  longitude: 106.7932,
  radiusMeters: 150,
  workStartTime: '08:30',
  workEndTime: '17:30',
  lateToleranceMinutes: 15,
  wfhIncentivePerDay: 0,
  lateDeductionPerOccurrence: 0,
};

export const INITIAL_WORK_SHIFTS = [
  { id: 'shf-1', code: 'SHIFT-REG', name: 'Shift Reguler (Standard Office)', startTime: '08:30', endTime: '17:30', breakStartTime: '12:00', breakEndTime: '13:00', isDefault: true },
  { id: 'shf-2', code: 'SHIFT-PAGI', name: 'Shift Pagi (Early Bird)', startTime: '07:30', endTime: '16:30', breakStartTime: '11:30', breakEndTime: '12:30', isDefault: false },
  { id: 'shf-3', code: 'SHIFT-FLEXI', name: 'Shift Flexi (WFH Core Hours)', startTime: '09:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00', isDefault: false },
];

export const INITIAL_HOLIDAYS = [
  { id: 'hol-1', date: '2026-08-17', title: 'HARI KEMERDEKAAN REPUBLIK INDONESIA SE-78', type: 'NATIONAL' as const, isCutQuota: false },
  { id: 'hol-2', date: '2026-12-25', title: 'HARI RAYA NATAL', type: 'NATIONAL' as const, isCutQuota: false },
];
