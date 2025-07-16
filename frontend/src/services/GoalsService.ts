import type {
    SavingsGoalRecord,
    SavingsGoalFormData
} from '@/types/business.types';
import { ApiResult, ApiSuccessResponse } from '@/types/api.types';
import { ApiService } from './ApiService';

// Service for managing savings goals API calls
export class GoalsService {
    private static readonly ENDPOINT = 'savings-goals';

    // Get all savings goal records
    static async getAll(): Promise<ApiResult<SavingsGoalRecord[]>> {
        return ApiService.get<SavingsGoalRecord[]>(this.ENDPOINT);
    }

    // Get specific savings goal record
    static async getById(id: number): Promise<ApiResult<SavingsGoalRecord>> {
        return ApiService.get<SavingsGoalRecord>(`${this.ENDPOINT}/${id}`);
    }

    // Create new savings goal record
    static async create(data: SavingsGoalFormData): Promise<ApiResult<ApiSuccessResponse>> {
        return ApiService.post<ApiSuccessResponse>(this.ENDPOINT, data);
    }

    // Update savings goal record
    static async update(id: number, data: SavingsGoalFormData): Promise<ApiResult<ApiSuccessResponse>> {
        return ApiService.put<ApiSuccessResponse>(`${this.ENDPOINT}/${id}`, data);
    }

    // Delete savings goal record
    static async delete(id: number): Promise<ApiResult<ApiSuccessResponse>> {
        return ApiService.delete<ApiSuccessResponse>(`${this.ENDPOINT}/${id}`);
    }
}