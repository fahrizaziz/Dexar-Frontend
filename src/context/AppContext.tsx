import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Employee, AttendanceRecord, LeaveRequest, DepartmentMaster, PositionMaster, AuditLog, GeofenceConfig, WorkShift, HolidayCalendar } from '../types';
import { storageService } from '../services/storageService';
import { auditService } from '../services/auditService';
import { employeeService } from '../services/employeeService';
import { geofenceService } from '../services/geofenceService';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  employees: Employee[];
  departments: DepartmentMaster[];
  positions: PositionMaster[];
  attendanceRecords: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  auditLogs: AuditLog[];
  geofenceConfig: GeofenceConfig;
  workShifts: WorkShift[];
  holidays: HolidayCalendar[];
  toasts: ToastMessage[];
  addEmployee: (emp: Omit<Employee, 'id'>) => Employee;
  updateEmployee: (id: string, fields: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addDepartment: (dept: Omit<DepartmentMaster, 'id'>) => DepartmentMaster;
  updateDepartment: (id: string, fields: Partial<DepartmentMaster>) => void;
  deleteDepartment: (id: string) => void;
  addPosition: (pos: Omit<PositionMaster, 'id'>) => PositionMaster;
  updatePosition: (id: string, fields: Partial<PositionMaster>) => void;
  deletePosition: (id: string) => void;
  submitAttendance: (record: Omit<AttendanceRecord, 'id' | 'createdAt'>) => AttendanceRecord;
  addAttendanceRecord: (record: AttendanceRecord) => void;
  updateAttendanceRecord: (id: string, fields: Partial<AttendanceRecord>) => void;
  updateAttendanceStatus: (id: string, fields: Partial<AttendanceRecord>) => void;
  submitLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'createdAt'>) => LeaveRequest;
  updateLeaveStatus: (id: string, fields: Partial<LeaveRequest>) => void;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  updateGeofenceConfig: (config: GeofenceConfig) => void;
  saveWorkShiftsList: (shifts: WorkShift[]) => void;
  saveHolidaysList: (holidays: HolidayCalendar[]) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  resetAllData: () => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<DepartmentMaster[]>([]);
  const [positions, setPositions] = useState<PositionMaster[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [geofenceConfig, setGeofenceConfig] = useState<GeofenceConfig>(storageService.getGeofenceConfig());
  const [workShifts, setWorkShifts] = useState<WorkShift[]>([]);
  const [holidays, setHolidays] = useState<HolidayCalendar[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);

    try {
      // Ambil data murni 100% dari API NestJS & Database MySQL
      const [apiEmps, apiDepts, apiPositions, apiGeo, apiLogs] = await Promise.all([
        employeeService.getAllEmployees().catch(() => []),
        employeeService.getAllDepartments().catch(() => []),
        employeeService.getAllPositions().catch(() => []),
        geofenceService.getGeofenceConfig().catch(() => null),
        auditService.getAuditLogs().catch(() => []),
      ]);

      setEmployees(apiEmps);
      setDepartments(apiDepts);
      setPositions(apiPositions);
      if (apiGeo) {
        setGeofenceConfig(apiGeo);
      }
      if (apiLogs.length > 0) {
        setAuditLogs(apiLogs as any);
      }
    } catch (err) {
      console.warn('API Load error, falling back to clean state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addEmployee = (emp: Employee) => {
    setEmployees((prev) => [...prev, emp]);
  };

  const updateEmployee = (id: string, fields: Partial<Employee>) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...fields } : e)));
  };

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  // Department Handlers
  const addDepartment = (dept: DepartmentMaster) => {
    setDepartments((prev) => [...prev, dept]);
  };

  const updateDepartment = (id: string, fields: Partial<DepartmentMaster>) => {
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, ...fields } : d)));
  };

  const deleteDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
  };

  // Position Handlers
  const addPosition = (pos: PositionMaster) => {
    setPositions((prev) => [...prev, pos]);
  };

  const updatePosition = (id: string, fields: Partial<PositionMaster>) => {
    setPositions((prev) => prev.map((p) => (p.id === id ? { ...p, ...fields } : p)));
  };

  const deletePosition = (id: string) => {
    setPositions((prev) => prev.filter((p) => p.id !== id));
  };

  const submitAttendance = (record: Omit<AttendanceRecord, 'id' | 'createdAt'>): AttendanceRecord => {
    const created = storageService.addAttendanceRecord(record);
    setAttendanceRecords(storageService.getAttendanceRecords());
    showToast(`Absensi WFH berhasil dikirim pada jam ${created.clockInTime}!`, 'success');
    return created;
  };

  const addAttendanceRecord = (record: AttendanceRecord) => {
    setAttendanceRecords((prev) => {
      const exists = prev.some((r) => r.id === record.id || (r.employeeNip === record.employeeNip && r.date === record.date));
      if (exists) {
        return prev.map((r) => (r.id === record.id || (r.employeeNip === record.employeeNip && r.date === record.date) ? { ...r, ...record } : r));
      }
      return [record, ...prev];
    });
  };

  const updateAttendanceRecord = (id: string, fields: Partial<AttendanceRecord>) => {
    setAttendanceRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...fields } : r))
    );
  };

  const updateAttendanceStatus = (id: string, fields: Partial<AttendanceRecord>) => {
    const updated = storageService.updateAttendanceRecord(id, fields);
    if (updated) {
      setAttendanceRecords(storageService.getAttendanceRecords());
      showToast(`Status absensi ${updated.employeeName} diperbarui.`, 'info');
    }
  };

  const submitLeaveRequest = (req: Omit<LeaveRequest, 'id' | 'createdAt'>): LeaveRequest => {
    const created = storageService.addLeaveRequest(req);
    setLeaveRequests(storageService.getLeaveRequests());
    showToast(`Pengajuan ${created.type} berhasil dikirim!`, 'success');
    return created;
  };

  const updateLeaveStatus = (id: string, fields: Partial<LeaveRequest>) => {
    const updated = storageService.updateLeaveRequest(id, fields);
    if (updated) {
      setLeaveRequests(storageService.getLeaveRequests());
      showToast(`Status permohonan ${updated.employeeName} diperbarui (${updated.status}).`, 'info');
    }
  };

  const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    auditService.logAction(log).then(() => {
      auditService.getAuditLogs().then((logs) => {
        if (logs.length > 0) {
          setAuditLogs(logs as any);
        }
      });
    }).catch((err) => {
      console.warn('Backend API addAuditLog error:', err);
    });
  };

  const updateGeofenceConfig = (config: GeofenceConfig) => {
    storageService.saveGeofenceConfig(config);
    setGeofenceConfig(config);
    showToast('Konfigurasi Geofencing & Jam Kerja Kantor berhasil disimpan!', 'success');

    // Kirim request murni ke API NestJS & Database MySQL geofence_configs table
    geofenceService.updateGeofenceConfig(config).then((updated) => {
      if (updated) {
        setGeofenceConfig(updated);
      }
    }).catch((err) => {
      console.warn('Backend API updateGeofenceConfig error:', err);
    });
  };

  const saveWorkShiftsList = (shifts: WorkShift[]) => {
    storageService.saveWorkShifts(shifts);
    setWorkShifts(shifts);
    showToast('Daftar Shift Kerja diperbarui.', 'info');
  };

  const saveHolidaysList = (hols: HolidayCalendar[]) => {
    storageService.saveHolidays(hols);
    setHolidays(hols);
    showToast('Kalender Libur & Cuti Bersama diperbarui.', 'info');
  };

  const resetAllData = () => {
    storageService.resetData();
    loadData();
    showToast('Data sistem telah direset ke kondisi awal demo.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        employees,
        departments,
        positions,
        attendanceRecords,
        leaveRequests,
        auditLogs,
        geofenceConfig,
        workShifts,
        holidays,
        toasts,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        addPosition,
        updatePosition,
        deletePosition,
        submitAttendance,
        addAttendanceRecord,
        updateAttendanceRecord,
        updateAttendanceStatus,
        submitLeaveRequest,
        updateLeaveStatus,
        addAuditLog,
        updateGeofenceConfig,
        saveWorkShiftsList,
        saveHolidaysList,
        showToast,
        removeToast,
        resetAllData,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
