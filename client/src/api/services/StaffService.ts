import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export interface Staff {
    id: string;
    name: string;
    phone: string;
    email: string;
    role: string;
    joining_date: string;
    salary: number;
    is_active: boolean;
    tempPassword?: string;
}

export interface Attendance {
    id: string;
    staff_id: string;
    date: string;
    status: 'Present' | 'Absent' | 'Half Day' | 'Paid Leave' | 'Weekly Off';
    notes?: string;
    staff_name?: string;
}

export interface SalaryPayment {
    id: string;
    staff_id: string;
    payment_date: string;
    month: string;
    year: number;
    amount: number;
    payment_mode: string;
    reference_no?: string;
    notes?: string;
    staff_name?: string;
}

export class StaffService {
    public static getStaff(search?: string): Promise<Staff[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/staff',
            query: { search },
        });
    }

    public static postStaff(requestBody: Partial<Staff>): Promise<Staff> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/staff',
            body: requestBody,
        });
    }

    public static putStaff(id: string, requestBody: Partial<Staff>): Promise<Staff> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: `/staff/${id}`,
            body: requestBody,
        });
    }

    public static deleteStaff(id: string): Promise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: `/staff/${id}`,
        });
    }

    public static postStaffBulkAction(requestBody: { action: string, ids: string[] }): Promise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/staff/bulk-action',
            body: requestBody,
        });
    }

    public static getAttendance(params: { date?: string, staff_id?: string, start_date?: string, end_date?: string }): Promise<Attendance[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/attendance',
            query: params,
        });
    }

    public static postAttendance(requestBody: Partial<Attendance>[]): Promise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/attendance',
            body: requestBody,
        });
    }

    public static getAttendanceSummary(date: string): Promise<Record<string, number>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/attendance/summary',
            query: { date },
        });
    }

    public static getSalaryPayments(): Promise<SalaryPayment[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/salary/payments',
        });
    }

    public static postSalaryPayment(requestBody: Partial<SalaryPayment>): Promise<SalaryPayment> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/salary/payments',
            body: requestBody,
        });
    }
}
