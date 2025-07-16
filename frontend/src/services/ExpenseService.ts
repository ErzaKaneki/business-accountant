import type {
    ExpenseRecord,
    ExpenseFormData
} from '@/types/business.types';
import { ApiResult, ApiSuccessResponse } from '@/types/api.types';
import { ApiService } from './ApiService';

//Service for managing expense-related API calls
export class ExpenseService {
    private static readonly ENDPOINT = 'expenses';

    // Get all expense records
    static async getAll(): Promise<ApiResult<ExpenseRecord[]>> {
        return ApiService.get<ExpenseRecord[]>(this.ENDPOINT);
    }

    // Get specific expense record
    static async getById(id: number): Promise<ApiResult<ExpenseRecord>> {
        return ApiService.get<ExpenseRecord>(`${this.ENDPOINT}/${id}`);
    }

    // Create new expense record
    static async create(data: ExpenseFormData): Promise<ApiResult<ApiSuccessResponse>> {
        return ApiService.post<ApiSuccessResponse>(this.ENDPOINT, data);
    }

    // Update expense record
    static async update(id: number, data: ExpenseFormData): Promise<ApiResult<ApiSuccessResponse>> {
        return ApiService.put<ApiSuccessResponse>(`${this.ENDPOINT}/{id}`, data);
    }

    // Delete expense record
    static async delete(id: number): Promise<ApiResult<ApiSuccessResponse>> {
        return ApiService.delete<ApiSuccessResponse>(`${this.ENDPOINT}/${id}`);
    }
}