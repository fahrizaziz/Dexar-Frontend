import { Employee, AttendanceRecord, DepartmentMaster, PositionMaster, LeaveRequest, AuditLog } from '../types';
import { getTodayDateString } from '../utils/dateUtils';

export const INITIAL_DEPARTMENTS: DepartmentMaster[] = [
  { id: 'dept-1', code: 'DEPT-001', name: 'Human Resources & General Affairs', headOfDepartment: 'Siti Rahmawati', description: 'Divisi Manajemen Sumber Daya Manusia & Operational HRD', status: 'AKTIF' },
];

export const INITIAL_POSITIONS: PositionMaster[] = [
  { id: 'pos-1', code: 'POS-001', name: 'HR Manager & System Admin', departmentName: 'Human Resources & General Affairs', level: 'Manager', status: 'AKTIF' },
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

export const INITIAL_WORK_SHIFTS: WorkShift[] = [];

export const INITIAL_HOLIDAYS: HolidayCalendar[] = [];
