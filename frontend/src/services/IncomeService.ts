import type {
    IncomeRecord,
    IncomeFormData
} from '@/types/business.types';
import type { ApiResult, ApiSuccessResponse } from '@/types/api.types';
import { ApiService } from './ApiService';

// Service for managing income-related API calls
export class IncomeService {
    private static readonly ENDPOINT = 'income';

    // Get all income records
    static async getAll(): Promise<ApiResult<IncomeRecord[]>> {
        return ApiService.get<IncomeRecord[]>(this.ENDPOINT);
    }

    // Get specific income record
    static async getById(id: number): Promise<ApiResult<IncomeRecord>> {
        return ApiService.get<IncomeRecord>(`${this.ENDPOINT}/${id}`);
    }

    // Create new income record
    static async create(data: IncomeFormData): Promise<ApiResult<ApiSuccessResponse>> {
        return ApiService.post<ApiSuccessResponse>(this.ENDPOINT, data);
    }

    // Update income record
    static async update(id: number, data: IncomeFormData): Promise<ApiResult<ApiSuccessResponse>> {
        return ApiService.put<ApiSuccessResponse>(`${this.ENDPOINT}`, data);
    }

    // Delete income record
    static async delete(id: number): Promise<ApiResult<ApiSuccessResponse>> {
        return ApiService.delete<ApiSuccessResponse>(`${this.ENDPOINT}/${id}`);
    }
}