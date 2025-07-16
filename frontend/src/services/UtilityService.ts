import type {
    UtilityRecord,
    UtilityFormData
} from '@/types/business.types';
import { ApiResult, ApiSuccessResponse } from '@/types/api.types';
import { ApiService } from './ApiService';

// Service for managing utility-related API calls
export class UtilityService {
    private static readonly ENDPOINT = 'utilities';

    // Get all utility records
    static async getAll(): Promise<ApiResult<UtilityRecord[]>> {
        return ApiService.get<UtilityRecord[]>(this.ENDPOINT);
    }

    // Get specific utility record
    static async getById(id: number): Promise<ApiResult<UtilityRecord>> {
        return ApiService.get<UtilityRecord>(`${this.ENDPOINT}/${id}`);
    }

    // Create new utility record
    static async create(data: UtilityFormData): Promise<ApiResult<ApiSuccessResponse>> {
        return ApiService.post<ApiSuccessResponse>(this.ENDPOINT, data);
    }

    // Update utility record
    static async update(id: number, data: UtilityFormData): Promise<ApiResult<ApiSuccessResponse>> {
        return ApiService.put<ApiSuccessResponse>(`${this.ENDPOINT}/${id}`, data);
    }

    // Delete utility record
    static async delete(id: number): Promise<ApiResult<ApiSuccessResponse>> {
        return ApiService.delete<ApiSuccessResponse>(`${this.ENDPOINT}/${id}`);
    }
}