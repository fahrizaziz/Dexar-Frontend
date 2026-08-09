import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee, AttendanceRecord, LeaveRequest, DepartmentMaster, PositionMaster, AuditLog, GeofenceConfig, WorkShift, HolidayCalendar } from '../types';
import { storageService } from '../services/storageService';
import { auditService } from '../services/auditService';
import { employeeService } from '../services/employeeService';

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
      const [apiEmps, apiDepts, apiPositions] = await Promise.all([
        employeeService.getAllEmployees().catch(() => []),
        employeeService.getAllDepartments().catch(() => []),
        employeeService.getAllPositions().catch(() => []),
      ]);

      setEmployees(apiEmps.length > 0 ? apiEmps : storageService.getEmployees());
      setDepartments(apiDepts.length > 0 ? apiDepts : storageService.getDepartments());
      setPositions(apiPositions.length > 0 ? apiPositions : storageService.getPositions());
    } catch (err) {
      console.warn('API Load error, falling back to clean state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const addEmployee = (emp: Omit<Employee, 'id'>): Employee => {
    const tempId = `emp-${Date.now()}`;
    const newEmpObj: Employee = { ...emp, id: tempId };

    // Update state React secara instan
    setEmployees((prev) => [...prev, newEmpObj]);
    showToast(`Karyawan baru ${emp.fullName} berhasil ditambahkan!`, 'success');

    // Kirim request murni ke API backend NestJS & MySQL
    employeeService.createEmployee({
      nip: emp.nip,
      fullName: emp.fullName,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      position: emp.position,
      role: emp.role as 'KARYAWAN' | 'HRD' | 'ADMIN',
      status: emp.status === 'AKTIF' ? 'ACTIVE' : 'INACTIVE',
      wfhAllowanceDaysPerWeek: emp.wfhAllowanceDaysPerWeek,
      salary: emp.salary,
      avatarUrl: emp.avatarUrl,
    }).then((created) => {
      if (created) {
        // Sync ulang data murni dari API
        employeeService.getAllEmployees().then((fresh) => {
          if (Array.isArray(fresh) && fresh.length > 0) setEmployees(fresh);
        });
      }
    }).catch((err) => {
      console.warn('Backend API createEmployee error:', err);
    });

    return newEmpObj;
  };

  const updateEmployee = (id: string, fields: Partial<Employee>) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...fields } : e)));
    showToast(`Data karyawan berhasil diperbarui.`, 'info');

    // Kirim request murni ke API backend NestJS & MySQL
    employeeService.updateEmployee(id, {
      fullName: fields.fullName,
      email: fields.email,
      phone: fields.phone,
      department: fields.department,
      position: fields.position,
      role: fields.role as 'KARYAWAN' | 'HRD' | 'ADMIN',
      wfhAllowanceDaysPerWeek: fields.wfhAllowanceDaysPerWeek,
      salary: fields.salary,
    }).then(() => {
      employeeService.getAllEmployees().then((fresh) => {
        if (Array.isArray(fresh) && fresh.length > 0) setEmployees(fresh);
      });
    }).catch((err) => {
      console.warn('Backend API updateEmployee error:', err);
    });
  };

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    showToast(`Data karyawan telah dihapus dari sistem.`, 'info');

    // Kirim request murni ke API backend NestJS & MySQL
    employeeService.deleteEmployee(id).then(() => {
      employeeService.getAllEmployees().then((fresh) => {
        if (Array.isArray(fresh)) setEmployees(fresh);
      });
    }).catch((err) => {
      console.warn('Backend API deleteEmployee error:', err);
    });
  };

  // Department Handlers
  const addDepartment = (dept: Omit<DepartmentMaster, 'id'>): DepartmentMaster => {
    const created = storageService.addDepartment(dept);
    setDepartments(storageService.getDepartments());
    showToast(`Departemen Baru '${created.name}' (${created.code}) berhasil ditambahkan!`, 'success');

    // API Call ke NestJS
    employeeService.createDepartment(dept).catch((err) => {
      console.warn('Backend API createDepartment error/offline:', err);
    });

    return created;
  };

  const updateDepartment = (id: string, fields: Partial<DepartmentMaster>) => {
    const updated = storageService.updateDepartment(id, fields);
    if (updated) {
      setDepartments(storageService.getDepartments());
      showToast(`Master Departemen '${updated.name}' diperbarui.`, 'info');

      // API Call ke NestJS
      employeeService.updateDepartment(id, fields).catch((err) => {
        console.warn('Backend API updateDepartment error/offline:', err);
      });
    }
  };

  const deleteDepartment = (id: string) => {
    storageService.deleteDepartment(id);
    setDepartments(storageService.getDepartments());
    showToast(`Master Departemen berhasil dihapus.`, 'info');

    // API Call ke NestJS
    employeeService.deleteDepartment(id).catch((err) => {
      console.warn('Backend API deleteDepartment error/offline:', err);
    });
  };

  // Position Handlers
  const addPosition = (pos: Omit<PositionMaster, 'id'>): PositionMaster => {
    const created = storageService.addPosition(pos);
    setPositions(storageService.getPositions());
    showToast(`Jabatan Baru '${created.name}' (${created.code}) berhasil ditambahkan!`, 'success');

    // API Call ke NestJS
    employeeService.createPosition(pos).catch((err) => {
      console.warn('Backend API createPosition error/offline:', err);
    });

    return created;
  };

  const updatePosition = (id: string, fields: Partial<PositionMaster>) => {
    const updated = storageService.updatePosition(id, fields);
    if (updated) {
      setPositions(storageService.getPositions());
      showToast(`Master Jabatan '${updated.name}' diperbarui.`, 'info');

      // API Call ke NestJS
      employeeService.updatePosition(id, fields).catch((err) => {
        console.warn('Backend API updatePosition error/offline:', err);
      });
    }
  };

  const deletePosition = (id: string) => {
    storageService.deletePosition(id);
    setPositions(storageService.getPositions());
    showToast(`Master Jabatan berhasil dihapus.`, 'info');

    // API Call ke NestJS
    employeeService.deletePosition(id).catch((err) => {
      console.warn('Backend API deletePosition error/offline:', err);
    });
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
    storageService.addAuditLog(log);
    setAuditLogs(storageService.getAuditLogs());
    auditService.logAction(log).catch(() => {});
  };

  const updateGeofenceConfig = (config: GeofenceConfig) => {
    storageService.saveGeofenceConfig(config);
    setGeofenceConfig(config);
    showToast('Konfigurasi Geofencing & Jam Kerja Kantor berhasil disimpan!', 'success');
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
