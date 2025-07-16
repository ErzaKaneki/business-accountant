import { ApiSuccessResponse, ApiErrorResponse } from './api.types';
import type {
  OverviewData,
  IncomeRecord,
  ExpenseRecord,
  MileageRecord,
  UtilityRecord,
  HomeOfficeRecord,
  TaxSettings,
  TaxPaymentRecord,
  SavingsGoalRecord
} from './business.types';

export type TabName = 'overview' | 'income' | 'expenses' | 'deductions' | 'taxes' | 'goals';

export type RecordType = 'income' | 'expenses' | 'mileage' | 'utilities' | 'tax-payments' | 'savings-goals';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export type ModalType = 'detail' | 'edit' | 'confirm-delete';

export type ValidationResult = {
    isValid: boolean;
    message?: string;
}

export interface FormConfig {
    id: string;
    resetOnSubmit: boolean;
    validateOnSubmit: boolean;
    submitHandler: (formData: any) => Promise<void>;
}

export interface ModalConfig {
    id: string;
    title: string;
    onClose?: () => void;
    escapeToClose?: boolean;
    backdropClose?: boolean;
}

export interface TabConfig {
    id: TabName;
    label: string;
    icon: string;
    loadData?: () => Promise<void>;
}

export interface StatCardData {
    title: string;
    amount: number;
    subtitle?: string;
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export interface NotificationConfig {
    message: string;
    type: NotificationType;
    duration?: number;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export interface LoadingState {
    isLoading: boolean;
    message?: string;
    target?: string; // Element ID or selector
}

export interface AppState {
    activeTab: TabName;
    isLoading: boolean;
    currentRecord: number | null;
    currentRecordType: RecordType | null;
    selectedHomeOfficeMethod: 'simplified' | 'actual' | null;
    formStates: Record<string, any>;
    modalStates: Record<string, boolean>;
    notifications: NotificationConfig[];
    data: {
        overview?: OverviewData;
        income?: IncomeRecord[];
        expenses?: ExpenseRecord[];
        mileage?: MileageRecord[];
        utilities?: UtilityRecord[];
        homeOffice?: HomeOfficeRecord;
        taxSettings?: TaxSettings;
        taxPayments?: TaxPaymentRecord[];
        savingsGoals?: SavingsGoalRecord[];
    };
}

export interface EventHandlers {
    onTabChange?: (tabName: TabName) => void;
    onRecordSelect?: (type: RecordType, id: number) => void;
    onRecordEdit?: (type: RecordType, id: number) => void;
    onRecordDelete?: (type: RecordType, id: number) => void;
    onFormSubmit?: (formId: string, data: any) => void;
    onModalOpen?: (modalType: ModalType) => void;
    onModalClose?: (modalType: ModalType) => void;
    onNotification?: (config: NotificationConfig) => void;
}

export interface ComponentConfig {
    element: HTMLElement;
    state?: Partial<AppState>;
    handlers?: EventHandlers;
}

export interface TableColumn {
    key: string;
    label: string;
    formatter?: (value: any, record?: any) => string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
}

export interface TableConfig {
    columns: TableColumn[];
    data: any[];
    onRowClick?: (record: any) => void;
    pagination?: {
        page: number;
        pageSize: number;
        total: number;
    };
    loading?: boolean;
    emptyMessage?: string;
}

export interface DateInputConfig {
    allowFuture?: boolean;
    allowPast?: boolean;
    minDate?: string;
    maxDate?: string;
    defaultToToday?: boolean;
}

export interface CurrencyInputConfig {
    min?: number;
    max?: number;
    step?: number;
    showSymbol?: boolean;
    allowNegative?: boolean;
}

export interface PercentageInputConfig {
    min?: number;
    max?: number;
    step?: number;
    showSymbol?: boolean;
}

export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

export interface SelectInputConfig {
    options: SelectOption[];
    placeholder?: string;
    allowEmpty?: boolean;
    searchable?: boolean;
}

// Event types for type-safe event handling
export interface CustomEventMap {
    'tab:change': CustomEvent<{ tabName: TabName }>;
    'record:select': CustomEvent<{ type: RecordType; id: number }>;
    'record:edit': CustomEvent<{ type: RecordType; id: number }>;
    'record:delete': CustomEvent<{ type: RecordType; id: number }>;
    'form:submit': CustomEvent<{ formId: string; data: any }>;
    'modal:open': CustomEvent<{ modalType: ModalType }>;
    'modal:close': CustomEvent<{ modalType: ModalType }>;
    'notification:show': CustomEvent<{ config: NotificationConfig }>;
    'state:update': CustomEvent<{ key: string; value: any }>;
    'data:refresh': CustomEvent<{ type?: RecordType }>;
}

// Utility types for better type inference
export type RecordById<T extends RecordType> =
    T extends 'income' ? import('./business.types').IncomeRecord :
    T extends 'expenses' ? import('./business.types').ExpenseRecord :
    T extends 'mileage' ? import('./business.types').MileageRecord :
    T extends 'utilities' ? import('./business.types').UtilityRecord :
    T extends 'tax-payment' ? import('./business.types').TaxPaymentRecord :
    T extends 'savings-goals' ? import('./business.types').SavingsGoalRecord :
    never;

export type FormDataByType<T extends RecordType> =
    T extends 'income' ? import('./business.types').IncomeFormData :
    T extends 'expenses' ? import('./business.types').ExpenseFormData :
    T extends 'mileage' ? import('./business.types').MileageFormData :
    T extends 'utilities' ? import('./business.types').UtilityFormData :
    T extends 'tax-payments' ? import('./business.types').TaxPaymentFormData :
    T extends 'savings-goals' ? import('./business.types').SavingsGoalFormData :
    never;

// Type guards for runtime type checking
export function isApiErrorResponse(response: any): response is ApiErrorResponse {
    return response && typeof response.error === 'string';
}

export function isApiSuccessResponse(response: any): response is ApiSuccessResponse {
    return response && response.success === true;
}

export function isValidTabName(tab: string): tab is TabName {
    return ['overview', 'income', 'expenses', 'deductions', 'taxes', 'goals'].includes(tab);
}

export function isValidRecordType(type: string): type is RecordType {
    return ['income', 'expenses', 'mileage', 'utilities', 'tax-payments', 'savings-goals'].includes(type);
}

export function isValidNotificationType(type: string): type is RecordType {
    return ['success', 'error', 'warning', 'info'].includes(type);
}
