import { apiClient, ApiResponse } from './apiClient';

export interface PayrollItem {
  employeeId: string;
  nip: string;
  fullName: string;
  email: string;
  department: string;
  position: string;
  totalHadir: number;
  totalTerlambat: number;
  totalHoursWorked: number;
  wfhAllowanceEligibleDays: number;
  wfhDaysCompleted: number;
  baseSalary: number;
  wfhIncentiveTotal: number;
  lateDeductionTotal: number;
  netSalary: number;
  period: string;
  status: string;
}

export interface SalarySlip {
  slipNumber: string;
  period: string;
  employee: {
    id: string;
    nip: string;
    fullName: string;
    email: string;
    department: string;
    position: string;
  };
  earnings: Array<{ title: string; amount: number }>;
  deductions: Array<{ title: string; amount: number }>;
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  paymentDate: string;
  paymentStatus: string;
}

export const payrollService = {
  /**
   * Mengambil rekapitulasi penggajian & tunjangan WFH (GET /api/v1/payroll/summary)
   */
  async getPayrollSummary(month?: string): Promise<PayrollItem[]> {
    const params: Record<string, string> = {};
    if (month) params.month = month;

    const response: ApiResponse<PayrollItem[]> = await apiClient.get('/payroll/summary', params);
    if (response.success && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },

  /**
   * Mengambil rincian slip gaji karyawan (GET /api/v1/payroll/slips/:employeeId)
   */
  async getSalarySlip(employeeId: string, month?: string): Promise<SalarySlip | null> {
    const params: Record<string, string> = {};
    if (month) params.month = month;

    const response: ApiResponse<SalarySlip> = await apiClient.get(`/payroll/slips/${employeeId}`, params);
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  },
};
