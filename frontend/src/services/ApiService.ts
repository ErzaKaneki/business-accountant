import type {
    ApiResponse,
    ApiErrorResponse,
    ApiSuccessResponse,
    ApiRequestOptions,
    ApiResult
} from '@/types/api.types';
import { isApiErrorResponse } from '@/types/ui.types';

// Core API service that handles all HTTP requests with proper error handling and timeouts
export class ApiService {
    private static readonly BASE_URL = '/api';
    private static readonly DEFAULT_TIMEOUT = 10000;

    // Make an API request
    static async request<T = any>(
        endpoint: string,
        options: ApiRequestOptions = {}
    ): Promise<ApiResult<T>> {
        const {
            method = 'GET',
            body = null,
            timeout = this.DEFAULT_TIMEOUT
        } = options;

        try {
            const requestOptions: RequestInit = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
            }

            if (body && method !== 'GET') {
                requestOptions.body = JSON.stringify(body);
            }

            // Create timeout promise
            const timeoutPromise = new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), timeout)
            );

            // Race between fetch and timeout
            const response = await Promise.race([
                fetch(`${this.BASE_URL}/${endpoint}`, requestOptions),
                timeoutPromise,
            ]);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.indexOf('application/json') !== -1) {
                const data = await response.json();
                return data as T;
            } else {
                throw new Error('Response is not JSON');
            }
        } catch (error) {
            console.error(`API call failed for ${endpoint}:`, error);

            if (error instanceof Error) {
                if (error.message === 'Request timeout') {
                    return {
                        error: 'Request timed out. Please check your connection and try again.',
                    } as ApiErrorResponse;
                }
                return { error: error.message } as ApiErrorResponse;
            }

            return { error: 'Unknown error occurred' } as ApiErrorResponse;
        }
    }

    // GET request helper
    static async get<T>(endpoint: string): Promise<ApiResult<T>> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    // POST request helper
    static async post<T>(endpoint: string, data: any): Promise<ApiResult<T>> {
        return this.request<T>(endpoint, { method: 'POST', body: data });
    }

    // PUT request helper
    static async put<T>(endpoint: string, data: any): Promise<ApiResult<T>> {
        return this.request<T>(endpoint, { method: 'PUT', body: data });
    }

    // DELETE request helper
    static async delete<T>(endpoint: string): Promise<ApiResult<T>> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    // Check if response is an error
    static isError<T>(response: ApiResult<T>): response is ApiErrorResponse {
        return isApiErrorResponse(response);
    }

    // Handle API response with error checking
    static async handleResponse<T>(
        apiCall: Promise<ApiResult<T>>,
        onSuccess?: (data: T) => void,
        onError?: (error: string) => void
    ): Promise<T | null> {
        try{
            const response = await apiCall;

            if (this.isError(response)) {
                if (onError) {
                    onError(response.error);
                } else {
                    console.error('API Error:', response.error);
                }
                return null;
            }

            if (onSuccess) {
                onSuccess(response);
            }

            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            if (onError) {
                onError(errorMessage);
            } else {
                console.error('API Error:', errorMessage);
            }
            return null;
        }
    }
}