import type {
    MileageRecord,
    MileageFormData
} from '@/types/business.types';
import { ApiResult, ApiSuccessResponse } from '@/types/api.types';
import { ApiService } from './ApiService';

// Service for managing mileage-related API calls
export class MileageService {
    private static readonly ENDPOINT = 'mileage';

    // Get all mileage records
    static async getAll(): Promise<ApiResult<MileageRecord[]>> {
        return ApiService.get<MileageRecord[]>(this.ENDPOINT);
    }

    // Get specific mileage record
    static async getById(id: number): Promise<ApiResult<MileageRecord>> {
        return ApiService.get<MileageRecord>(`${this.ENDPOINT}/${id}`);
    }

    // Create new mileage record
    static async create(data: MileageFormData): Promise<ApiResult<ApiSuccessResponse>> {
        return ApiService.post<ApiSuccessResponse>(this.ENDPOINT, data);
    }

    // Update mileage record
    static async update(id: number, data: MileageFormData): Promise<ApiResult<ApiSuccessResponse>> {
        return ApiService.put<ApiSuccessResponse>(`${this.ENDPOINT}/${id}`, data);
    }

    // Delete mileage record
    static async delete(id: number): Promise<ApiResult<ApiSuccessResponse>> {
        return ApiService.delete<ApiSuccessResponse>(`${this.ENDPOINT}/${id}`);
    }
}