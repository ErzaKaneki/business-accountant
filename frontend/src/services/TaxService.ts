import type {
    TaxPaymentRecord,
    TaxPaymentFormData,
    TaxSettings,
    TaxSettingsFormData,
    HomeOfficeRecord,
    HomeOfficeFormData,
    TaxBreakdown
} from '@/types/business.types';
import { ApiResult, ApiSuccessResponse } from '@/types/api.types';
import { ApiService } from './ApiService';

// Service for managing tax-related API calls
export class TaxService {
    
    // Tax Settings API calls
    static async getSettings(): Promise<ApiResult<TaxSettings>> {
        return ApiService.get<TaxSettings>('tax-settings');
    }

    static async saveSettings(data: TaxSettingsFormData): Promise<ApiResult<ApiSuccessResponse>> {
        return ApiService.post<ApiSuccessResponse>('tax-settings', data);
    }

    // Tax Payments API calls
    
    // Get all tax payments
    static async getAllPayments(): Promise<ApiResult<TaxPaymentRecord[]>> {
        return ApiService.get<TaxPaymentRecord[]>('tax-payments');
    }

    // Get specific tax payments
    static async getPaymentById(id: number): Promise<ApiResult<TaxPaymentRecord>> {
        return ApiService.get<TaxPaymentRecord>(`tax-payments/${id}`);
    }

    // Create tax payments
    static async createPayment(data: TaxPaymentFormData): Promise<ApiResult<ApiSuccessResponse>> {
        return ApiService.post<ApiSuccessResponse>(`tax-payments/`, data);
    }

    // Update tax payments
    static async updatePayment(id: number, data: TaxPaymentFormData): Promise<ApiResult<ApiSuccessResponse>> {
        return ApiService.put<ApiSuccessResponse>(`tax-payments/${id}`, data);
    }

    // Delete tax payments
    static async deletePayment(id: number): Promise<ApiResult<ApiSuccessResponse>> {
        return ApiService.delete<ApiSuccessResponse>(`tax-payments/${id}`);
    }

    // Home Office API calls
    static async getHomeOffice(): Promise<ApiResult<HomeOfficeRecord>> {
        return ApiService.get<HomeOfficeRecord>('home-office');
    }

    static async setHomeOffice(data: HomeOfficeFormData): Promise<ApiResult<ApiSuccessResponse>> {
        return ApiService.post<ApiSuccessResponse>('home-office', data);
    }

    // Tax Breakdown API call
    static async getBreakdown(): Promise<ApiResult<TaxBreakdown>> {
        return ApiService.get<TaxBreakdown>('tax-breakdown');
    }
}