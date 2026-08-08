import { Employee, AttendanceRecord, LeaveRequest, DepartmentMaster, PositionMaster, AuditLog, GeofenceConfig, WorkShift, HolidayCalendar } from '../types';
import {
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_DEPARTMENTS,
  INITIAL_POSITIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_GEOFENCE_CONFIG,
  INITIAL_WORK_SHIFTS,
  INITIAL_HOLIDAYS,
} from '../data/mockData';

const EMPLOYEES_KEY = 'wfh_app_employees_v1';
const ATTENDANCE_KEY = 'wfh_app_attendance_v1';
const LEAVE_KEY = 'wfh_app_leave_v1';
const DEPARTMENTS_KEY = 'wfh_app_departments_v1';
const POSITIONS_KEY = 'wfh_app_positions_v1';
const AUDIT_LOGS_KEY = 'wfh_app_audit_logs_v1';
const GEOFENCE_KEY = 'wfh_app_geofence_v1';
const WORK_SHIFTS_KEY = 'wfh_app_work_shifts_v1';
const HOLIDAYS_KEY = 'wfh_app_holidays_v1';

export const storageService = {
  // Departments Master
  getDepartments(): DepartmentMaster[] {
    try {
      const data = localStorage.getItem(DEPARTMENTS_KEY);
      if (!data) {
        localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(INITIAL_DEPARTMENTS));
        return INITIAL_DEPARTMENTS;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading departments from localStorage', error);
      return INITIAL_DEPARTMENTS;
    }
  },

  saveDepartments(departments: DepartmentMaster[]): void {
    try {
      localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(departments));
    } catch (error) {
      console.error('Error saving departments', error);
    }
  },

  addDepartment(dept: Omit<DepartmentMaster, 'id'>): DepartmentMaster {
    const list = this.getDepartments();
    const created: DepartmentMaster = {
      ...dept,
      id: `dept-${Date.now()}`,
    };
    const updated = [...list, created];
    this.saveDepartments(updated);
    return created;
  },

  updateDepartment(id: string, fields: Partial<DepartmentMaster>): DepartmentMaster | null {
    const list = this.getDepartments();
    const index = list.findIndex((d) => d.id === id);
    if (index === -1) return null;
    const updated = { ...list[index], ...fields };
    list[index] = updated;
    this.saveDepartments(list);
    return updated;
  },

  deleteDepartment(id: string): void {
    const list = this.getDepartments();
    const filtered = list.filter((d) => d.id !== id);
    this.saveDepartments(filtered);
  },

  // Positions Master
  getPositions(): PositionMaster[] {
    try {
      const data = localStorage.getItem(POSITIONS_KEY);
      if (!data) {
        localStorage.setItem(POSITIONS_KEY, JSON.stringify(INITIAL_POSITIONS));
        return INITIAL_POSITIONS;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading positions from localStorage', error);
      return INITIAL_POSITIONS;
    }
  },

  savePositions(positions: PositionMaster[]): void {
    try {
      localStorage.setItem(POSITIONS_KEY, JSON.stringify(positions));
    } catch (error) {
      console.error('Error saving positions', error);
    }
  },

  addPosition(pos: Omit<PositionMaster, 'id'>): PositionMaster {
    const list = this.getPositions();
    const created: PositionMaster = {
      ...pos,
      id: `pos-${Date.now()}`,
    };
    const updated = [...list, created];
    this.savePositions(updated);
    return created;
  },

  updatePosition(id: string, fields: Partial<PositionMaster>): PositionMaster | null {
    const list = this.getPositions();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return null;
    const updated = { ...list[index], ...fields };
    list[index] = updated;
    this.savePositions(list);
    return updated;
  },

  deletePosition(id: string): void {
    const list = this.getPositions();
    const filtered = list.filter((p) => p.id !== id);
    this.savePositions(filtered);
  },

  // Employees
  getEmployees(): Employee[] {
    try {
      const data = localStorage.getItem(EMPLOYEES_KEY);
      if (!data) {
        localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(INITIAL_EMPLOYEES));
        return INITIAL_EMPLOYEES;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading employees from localStorage', error);
      return INITIAL_EMPLOYEES;
    }
  },

  saveEmployees(employees: Employee[]): void {
    try {
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
    } catch (error) {
      console.error('Error saving employees to localStorage', error);
    }
  },

  addEmployee(newEmp: Omit<Employee, 'id'>): Employee {
    const employees = this.getEmployees();
    const created: Employee = {
      ...newEmp,
      id: `emp-${Date.now()}`,
    };
    const updated = [created, ...employees];
    this.saveEmployees(updated);
    return created;
  },

  updateEmployee(id: string, updatedFields: Partial<Employee>): Employee | null {
    const employees = this.getEmployees();
    const index = employees.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const updatedEmp = { ...employees[index], ...updatedFields };
    employees[index] = updatedEmp;
    this.saveEmployees(employees);
    return updatedEmp;
  },

  deleteEmployee(id: string): void {
    const employees = this.getEmployees();
    const filtered = employees.filter((e) => e.id !== id);
    this.saveEmployees(filtered);
  },

  // Attendance
  getAttendanceRecords(): AttendanceRecord[] {
    try {
      const data = localStorage.getItem(ATTENDANCE_KEY);
      if (!data) {
        localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(INITIAL_ATTENDANCE_RECORDS));
        return INITIAL_ATTENDANCE_RECORDS;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading attendance from localStorage', error);
      return INITIAL_ATTENDANCE_RECORDS;
    }
  },

  saveAttendanceRecords(records: AttendanceRecord[]): void {
    try {
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Error saving attendance records', error);
    }
  },

  addAttendanceRecord(record: Omit<AttendanceRecord, 'id' | 'createdAt'>): AttendanceRecord {
    const records = this.getAttendanceRecords();
    const nowISO = new Date().toISOString();
    const newRecord: AttendanceRecord = {
      ...record,
      id: `att-${Date.now()}`,
      createdAt: nowISO,
    };
    const updated = [newRecord, ...records];
    this.saveAttendanceRecords(updated);
    return newRecord;
  },

  updateAttendanceRecord(id: string, updatedFields: Partial<AttendanceRecord>): AttendanceRecord | null {
    const records = this.getAttendanceRecords();
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const updated = { ...records[index], ...updatedFields };
    records[index] = updated;
    this.saveAttendanceRecords(records);
    return updated;
  },

  // Leave Requests
  getLeaveRequests(): LeaveRequest[] {
    try {
      const data = localStorage.getItem(LEAVE_KEY);
      if (!data) {
        localStorage.setItem(LEAVE_KEY, JSON.stringify(INITIAL_LEAVE_REQUESTS));
        return INITIAL_LEAVE_REQUESTS as LeaveRequest[];
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading leave requests from localStorage', error);
      return INITIAL_LEAVE_REQUESTS as LeaveRequest[];
    }
  },

  saveLeaveRequests(requests: LeaveRequest[]): void {
    try {
      localStorage.setItem(LEAVE_KEY, JSON.stringify(requests));
    } catch (error) {
      console.error('Error saving leave requests', error);
    }
  },

  addLeaveRequest(req: Omit<LeaveRequest, 'id' | 'createdAt'>): LeaveRequest {
    const requests = this.getLeaveRequests();
    const newReq: LeaveRequest = {
      ...req,
      id: `leave-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newReq, ...requests];
    this.saveLeaveRequests(updated);
    return newReq;
  },

  updateLeaveRequest(id: string, updatedFields: Partial<LeaveRequest>): LeaveRequest | null {
    const requests = this.getLeaveRequests();
    const index = requests.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const updated = { ...requests[index], ...updatedFields };
    requests[index] = updated;
    this.saveLeaveRequests(requests);
    return updated;
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    try {
      const data = localStorage.getItem(AUDIT_LOGS_KEY);
      if (!data) {
        localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
        return INITIAL_AUDIT_LOGS as AuditLog[];
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_AUDIT_LOGS as AuditLog[];
    }
  },

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const list = this.getAuditLogs();
    const created: AuditLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [created, ...list];
    try {
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    return created;
  },

  // Geofence Config
  getGeofenceConfig(): GeofenceConfig {
    try {
      const data = localStorage.getItem(GEOFENCE_KEY);
      if (!data) {
        localStorage.setItem(GEOFENCE_KEY, JSON.stringify(INITIAL_GEOFENCE_CONFIG));
        return INITIAL_GEOFENCE_CONFIG;
      }
      const parsed = JSON.parse(data);
      if (parsed.wfhIncentivePerDay === 50000) parsed.wfhIncentivePerDay = 0;
      if (parsed.lateDeductionPerOccurrence === 25000) parsed.lateDeductionPerOccurrence = 0;
      return {
        ...INITIAL_GEOFENCE_CONFIG,
        ...parsed,
      };
    } catch {
      return INITIAL_GEOFENCE_CONFIG;
    }
  },

  saveGeofenceConfig(config: GeofenceConfig): void {
    try {
      localStorage.setItem(GEOFENCE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error(e);
    }
  },

  // Work Shifts
  getWorkShifts(): WorkShift[] {
    try {
      const data = localStorage.getItem(WORK_SHIFTS_KEY);
      if (!data) {
        localStorage.setItem(WORK_SHIFTS_KEY, JSON.stringify(INITIAL_WORK_SHIFTS));
        return INITIAL_WORK_SHIFTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_WORK_SHIFTS;
    }
  },

  saveWorkShifts(shifts: WorkShift[]): void {
    try {
      localStorage.setItem(WORK_SHIFTS_KEY, JSON.stringify(shifts));
    } catch (e) {
      console.error(e);
    }
  },

  // Holidays
  getHolidays(): HolidayCalendar[] {
    try {
      const data = localStorage.getItem(HOLIDAYS_KEY);
      if (!data) {
        localStorage.setItem(HOLIDAYS_KEY, JSON.stringify(INITIAL_HOLIDAYS));
        return INITIAL_HOLIDAYS as HolidayCalendar[];
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_HOLIDAYS as HolidayCalendar[];
    }
  },

  saveHolidays(holidays: HolidayCalendar[]): void {
    try {
      localStorage.setItem(HOLIDAYS_KEY, JSON.stringify(holidays));
    } catch (e) {
      console.error(e);
    }
  },

  // Reset to default seed
  resetData(): void {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(INITIAL_EMPLOYEES));
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(INITIAL_ATTENDANCE_RECORDS));
    localStorage.setItem(LEAVE_KEY, JSON.stringify(INITIAL_LEAVE_REQUESTS));
    localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(INITIAL_DEPARTMENTS));
    localStorage.setItem(POSITIONS_KEY, JSON.stringify(INITIAL_POSITIONS));
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(GEOFENCE_KEY, JSON.stringify(INITIAL_GEOFENCE_CONFIG));
    localStorage.setItem(WORK_SHIFTS_KEY, JSON.stringify(INITIAL_WORK_SHIFTS));
    localStorage.setItem(HOLIDAYS_KEY, JSON.stringify(INITIAL_HOLIDAYS));
  }
};
