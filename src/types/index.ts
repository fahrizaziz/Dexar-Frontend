export type Role = 'KARYAWAN' | 'HRD_ADMIN';

export type AttendanceType = 'CLOCK_IN' | 'CLOCK_OUT';

export type AttendanceStatus = 'ON_TIME' | 'LATE' | 'EARLY_LEAVE' | 'WORK_COMPLETED';

export type Department = 
  | 'Engineering & Tech'
  | 'Human Resources'
  | 'Product & Design'
  | 'Marketing & Sales'
  | 'Finance & Accounting'
  | 'Operations & Logistics';

export interface Employee {
  id: string;
  nip: string; // Nomor Induk Pegawai
  fullName: string;
  email: string;
  phone: string;
  department: Department;
  position: string;
  role: Role;
  status: 'AKTIF' | 'NON_AKTIF';
  joinDate: string;
  avatarUrl: string;
  wfhAllowanceDaysPerWeek: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeNip: string;
  employeeName: string;
  department: Department;
  date: string; // YYYY-MM-DD
  clockInTime: string; // HH:mm:ss
  clockOutTime?: string; // HH:mm:ss
  photoProofUrl: string; // Base64 or URL
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  workPlan: string;
  workSummary?: string;
  status: AttendanceStatus;
  verificationStatus: 'TERVERIFIKASI' | 'PERLU_REVISI' | 'MENUNGGU';
  notes?: string;
  createdAt: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeNip: string;
  employeeName: string;
  department: Department;
  type: 'CUTI' | 'SAKIT' | 'TUKAR_HARI_WFH' | 'LEMBUR';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  hrdNotes?: string;
  createdAt: string;
}

export interface DepartmentMaster {
  id: string;
  code: string;
  name: string;
  headOfDepartment?: string;
  description?: string;
  status: 'AKTIF' | 'NON_AKTIF';
}

export interface PositionMaster {
  id: string;
  code: string;
  name: string;
  departmentName: string;
  level: string;
  status: 'AKTIF' | 'NON_AKTIF';
}

export interface UserSession {
  id: string;
  nip: string;
  name: string;
  email: string;
  role: Role;
  department?: Department;
  position?: string;
  avatarUrl?: string;
}

export interface AttendanceFilter {
  searchQuery: string;
  department: string;
  dateRange: 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'ALL';
  customDate?: string;
  status: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorNip: string;
  actorName: string;
  actorRole: Role;
  action: string;
  category: 'KARYAWAN' | 'ATTENDANCE' | 'LEAVE' | 'SYSTEM' | 'ACCESS_RIGHTS';
  details: string;
}

export interface GeofenceConfig {
  officeName: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  workStartTime: string; // e.g. "08:30"
  workEndTime: string; // e.g. "17:30"
  lateToleranceMinutes: number; // e.g. 15
  wfhIncentivePerDay?: number; // e.g. 50000
  lateDeductionPerOccurrence?: number; // e.g. 25000
}

export interface WorkShift {
  id: string;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  breakStartTime: string;
  breakEndTime: string;
  isDefault: boolean;
}

export interface HolidayCalendar {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: 'NATIONAL' | 'CUTI_BERSAMA' | 'COMPANY_EVENT';
  isCutQuota: boolean;
}
