import type { OverviewData } from '@/types/business.types';
import { ApiResult } from '@/types/api.types';
import { ApiService } from './ApiService';
import { IncomeService } from './IncomeService';
import { ExpenseService } from './ExpenseService';
import { MileageService } from './MileageService';
import { UtilityService } from './UtilityService';
import { TaxService } from './TaxService';
import { GoalsService } from './GoalsService';

// Service for managing overview and aggregated data calls
export class DataService {

    // Get overview data
    static async getOverview(): Promise<ApiResult<OverviewData>> {
        return ApiService.get<OverviewData>('overview');
    }

    // Refresh all data - helper method for bulk data loading
    static async refreshAll() {
        const promises = [
            this.getOverview(),
            IncomeService.getAll(),
            ExpenseService.getAll(),
            MileageService.getAll(),
            UtilityService.getAll(),
            TaxService.getAllPayments(),
            TaxService.getHomeOffice(),
            GoalsService.getAll(),
        ];

        try {
            const results = await Promise.allSettled(promises);
            return results;
        } catch (error) {
            console.error('Error refreshing all data:', error);
            throw error;
        }
    }
}