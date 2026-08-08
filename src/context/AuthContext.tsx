import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession, Role, Employee } from '../types';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';

export type Permission = 
  | 'CLOCK_IN_WFH'
  | 'VIEW_PERSONAL_HISTORY'
  | 'MANAGE_LEAVE_REQUESTS'
  | 'VIEW_HRD_MONITORING'
  | 'MANAGE_EMPLOYEES'
  | 'EXPORT_ATTENDANCE_REPORTS'
  | 'MANAGE_MENU_ACCESS'
  | 'VIEW_AUDIT_TRAILS'
  | 'MANAGE_GEOFENCE_OFFICE'
  | 'VIEW_PAYROLL_SUMMARY';

export const DEFAULT_ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  KARYAWAN: ['CLOCK_IN_WFH', 'VIEW_PERSONAL_HISTORY', 'MANAGE_LEAVE_REQUESTS'],
  HRD_ADMIN: [
    'VIEW_HRD_MONITORING',
    'MANAGE_EMPLOYEES',
    'EXPORT_ATTENDANCE_REPORTS',
    'MANAGE_MENU_ACCESS',
    'VIEW_AUDIT_TRAILS',
    'MANAGE_GEOFENCE_OFFICE',
    'VIEW_PAYROLL_SUMMARY',
  ],
};

interface AuthContextType {
  currentUser: UserSession;
  loginWithApi: (email: string, pass: string) => Promise<UserSession>;
  logout: () => void;
  switchRole: (role: Role) => void;
  loginAsEmployee: (employeeId: string) => void;
  availableEmployees: Employee[];
  hasPermission: (permission: Permission) => boolean;
  rolePermissions: Record<Role, Permission[]>;
  updateRolePermission: (role: Role, permission: Permission, enabled: boolean) => void;
  resetRolePermissions: () => void;
  isLoadingAuth: boolean;
}

const DEFAULT_EMPLOYEE_USER: UserSession = {
  id: 'emp-101',
  nip: 'EMP-2026-001',
  name: 'Budi Santoso',
  email: 'budi.santoso@company.co.id',
  role: 'KARYAWAN',
  department: 'Engineering & Tech',
  position: 'Senior Frontend Engineer',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
};

const DEFAULT_HRD_USER: UserSession = {
  id: 'emp-102',
  nip: 'EMP-2026-002',
  name: 'Siti Rahmawati',
  email: 'siti.rahmawati@company.co.id',
  role: 'HRD_ADMIN',
  department: 'Human Resources',
  position: 'HR Manager',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserSession>(() => {
    const saved = localStorage.getItem('wfh_current_user_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_EMPLOYEE_USER;
      }
    }
    return DEFAULT_EMPLOYEE_USER;
  });

  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  const [rolePermissions, setRolePermissions] = useState<Record<Role, Permission[]>>(() => {
    const saved = localStorage.getItem('wfh_role_permissions_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_ROLE_PERMISSIONS;
      }
    }
    return DEFAULT_ROLE_PERMISSIONS;
  });

  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);

  // Check auth session from backend API on mount
  useEffect(() => {
    async function initAuth() {
      if (authService.isAuthenticated()) {
        try {
          const userProfile = await authService.getMe();
          setCurrentUser(userProfile);
        } catch (err) {
          console.warn('Session verification failed, fallback to local state:', err);
        }
      }
      setIsLoadingAuth(false);
    }
    initAuth();
  }, []);

  useEffect(() => {
    const emps = storageService.getEmployees();
    setAvailableEmployees(emps);
  }, []);

  useEffect(() => {
    localStorage.setItem('wfh_current_user_v2', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('wfh_role_permissions_v2', JSON.stringify(rolePermissions));
  }, [rolePermissions]);

  const loginWithApi = async (email: string, pass: string): Promise<UserSession> => {
    const data = await authService.login(email, pass);
    setCurrentUser(data.user);
    return data.user;
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(DEFAULT_EMPLOYEE_USER);
  };

  const updateRolePermission = (role: Role, permission: Permission, enabled: boolean) => {
    setRolePermissions((prev) => {
      const currentList = prev[role] || [];
      let updatedList: Permission[];
      if (enabled) {
        if (!currentList.includes(permission)) {
          updatedList = [...currentList, permission];
        } else {
          updatedList = currentList;
        }
      } else {
        updatedList = currentList.filter((p) => p !== permission);
      }
      return {
        ...prev,
        [role]: updatedList,
      };
    });
  };

  const resetRolePermissions = () => {
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
  };

  const switchRole = (role: Role) => {
    if (role === 'HRD_ADMIN') {
      setCurrentUser(DEFAULT_HRD_USER);
    } else {
      const emps = storageService.getEmployees();
      const firstEmp = emps.find(e => e.status === 'AKTIF');
      if (firstEmp) {
        setCurrentUser({
          id: firstEmp.id,
          nip: firstEmp.nip,
          name: firstEmp.fullName,
          email: firstEmp.email,
          role: 'KARYAWAN',
          department: firstEmp.department,
          position: firstEmp.position,
          avatarUrl: firstEmp.avatarUrl,
        });
      } else {
        setCurrentUser(DEFAULT_EMPLOYEE_USER);
      }
    }
  };

  const loginAsEmployee = (employeeId: string) => {
    const emps = storageService.getEmployees();
    const target = emps.find(e => e.id === employeeId);
    if (target) {
      setCurrentUser({
        id: target.id,
        nip: target.nip,
        name: target.fullName,
        email: target.email,
        role: 'KARYAWAN',
        department: target.department,
        position: target.position,
        avatarUrl: target.avatarUrl,
      });
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    const permissions = rolePermissions[currentUser.role] || [];
    return permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loginWithApi,
        logout,
        switchRole,
        loginAsEmployee,
        availableEmployees,
        hasPermission,
        rolePermissions,
        updateRolePermission,
        resetRolePermissions,
        isLoadingAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
