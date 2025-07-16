export interface ApiResponse<T = any> {
    success?: boolean;
    error?: string;
    data?: T;
}

export interface ApiSuccessResponse {
    success: true;
}

export interface ApiErrorResponse {
    error: string;
}

export type ApiResult<T> = T | ApiErrorResponse;

export interface ApiRequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    timeout?: number;
}

export interface ApiEndpoints {
    overview: string;
    income: string;
    expenses: string;
    mileage: string;
    utilities: string;
    homeOffice: string;
    taxSettings: string;
    taxPayments: string;
    taxBreakdown: string;
    savingsGoals: string;
}