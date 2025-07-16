import type { AppState } from '@/types/ui.types';


// Initial application state
export const initialState: AppState = {
    activeTab: 'overview',
    isLoading: false,
    currentRecord: null,
    currentRecordType: null,
    selectedHomeOfficeMethod: null,

    // State management for forms
    formStates: {},

    // State management for modals
    modalStates: {},

    // State management for notifications
    notifications: [],

    // Centerlized data storage
    data: {
        income: [],
        expenses: [],
        mileage:[],
        utilities: [],
        taxPayments: [],
        savingsGoals: [],
    },
};