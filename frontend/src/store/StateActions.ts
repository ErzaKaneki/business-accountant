import type { TabName, RecordType, NotificationConfig, AppState } from '@/types/ui.types';
import type{
    OverviewData,
    IncomeRecord,
    ExpenseRecord,
    MileageRecord,
    UtilityRecord,
    HomeOfficeRecord,
    TaxSettings,
    TaxPaymentRecord,
    SavingsGoalRecord
} from '@/types/business.types';
import type { StateManager } from './StateManager';

// Predefined state actions that replace global variable assignments
// These provide type-safe ways to update common state patterns
export class StateActions {
    constructor(private stateManager: StateManager) {}
    // ===== TAB MANAGEMENT ======

    // Switch to a different tab
    switchTab(tabName: TabName): void {
        this.stateManager.set('activeTab', tabName);
    }

    // Get current active tab
    getCurrentTab(): TabName {
        return this.stateManager.get('activeTab');
    }

    // ===== RECORD MANAGEMENT =====
    
    // Select a record for viewing/editing
    selectRecord(type: RecordType, id: number): void {
        this.stateManager.set('currentRecordType', type);
        this.stateManager.set('currentRecord', id);
    }

    // Clear selected record
    clearSelectedRecord(): void {
        this.stateManager.set('currentRecord', null);
        this.stateManager.set('currentRecordType', null);
    }

    // Get currently selected record info
    getSelectedRecord(): { type: RecordType | null; id: number | null } {
        return {
            type: this.stateManager.get('currentRecordType'),
            id: this.stateManager.get('currentRecord'),
        };
    }

    // ===== HOME OFFICE METHOD =====

    // Set home office method
    setHomeOfficeMethod(method: 'simplified' | 'actual' | null): void {
        this.stateManager.set('selectedHomeOfficeMethod', method);
    }

    // Get home office method
    getHomeOfficeMethod(): 'simplified' | 'actual' | null {
        return this.stateManager.get('selectedHomeOfficeMethod');
    }

    // ===== MODAL MANAGEMENT =====

    // Show modal
    showModal(modalId: string): void {
        const modalStates = { ...this.stateManager.get('modalStates') };
        modalStates[modalId] = true;
        this.stateManager.set('modalStates', modalStates);
    }

    // Hide modal
    hideModal(modalId: string): void {
        const modalStates = { ...this.stateManager.get('modalStates') };
        modalStates[modalId] = false;
        this.stateManager.set('modalStates', modalStates);
    }

    // Check if modal is open
    isModalOpen(modalId: string): boolean {
        return this.stateManager.get('modalStates')[modalId] || false;
    }

    // Hide all modals
    hideAllModals(): void {
        const modalStates = { ...this.stateManager.get('modalStates') };
        Object.keys(modalStates).forEach(key => {
            modalStates[key] = false;
        });
        this.stateManager.set('modalStates', modalStates);
    }

    // ===== LOADING STATE MANAGEMENT =====

    // Set loading state
    setLoading(isLoading: boolean): void {
        this.stateManager.set('isLoading', isLoading);
    }

    // Get loading state
    isLoading(): boolean {
        return this.stateManager.get('isLoading');
    }

    // ===== DATA MANAGEMENT =====

    // Update overview data
    setOverviewData(data: OverviewData): void {
        this.stateManager.setNested('data.overview', data);
    }

    // Get overview data
    getOverviewData(): OverviewData | undefined {
        return this.stateManager.getNested('data.overview');
    }

    // Update income data
    setIncomeData(data: IncomeRecord[]): void {
        this.stateManager.setNested('data.income', data);
    }

    // Get income data
    getIncomeData(): IncomeRecord[] {
        return this.stateManager.getNested('data.income') || [];
    }

    // Update expense data
    setExpenseData(data: ExpenseRecord[]): void {
        this.stateManager.setNested('data.expenses', data);
    }

    // Get expense data
    getExpenseData(): ExpenseRecord[] {
        return this.stateManager.getNested('data.expenses') || [];
    }

    // Update mileage data
    setMileageData(data: MileageRecord[]): void {
        this.stateManager.setNested('data.mileage', data);
    }

    // Get mileage data
    getMileageData(): MileageRecord[] {
        return this.stateManager.getNested('data.mileage') || [];
    }

    // Update utility data
    setUtilityData(data: UtilityRecord[]): void {
        this.stateManager.setNested('data.utilities', data);
    }

    // Get utility data
    getUtilityData(): UtilityRecord[] {
        return this.stateManager.getNested('data.utilities') || [];
    }

    // Update home office data
    setHomeOfficeData(data: HomeOfficeRecord | undefined): void {
        this.stateManager.setNested('data.homeOffice', data);
    }

    // Get home office data
    getHomeOfficeData(): HomeOfficeRecord | undefined {
        return this.stateManager.getNested('data.homeOffice');
    }

    // Update tax settings data
    setTaxSettingsData(data: TaxSettings | undefined): void {
        this.stateManager.setNested('data.taxSettings', data);
    }

    // Get tax settings data
    getTaxSettingsData(): TaxSettings | undefined {
        return this.stateManager.getNested('data.taxSettings');
    }

    // Update tax payments data
    setTaxPaymentsData(data: TaxPaymentRecord[]): void {
        this.stateManager.setNested('data.taxPayments', data);
    }

    // Get tax payments data
    getTaxPaymentsData(): TaxPaymentRecord[] {
        return this.stateManager.getNested('data.taxPayments') || [];
    }

    // Update savings goals data
    setSavingsGoalsData(data: SavingsGoalRecord[]): void {
        this.stateManager.setNested('data.savingsGoals', data);
    }

    // Get savings goals data
    getSavingsGoalsData(): SavingsGoalRecord[] {
        return this.stateManager.getNested('data.savingsGoals') || [];
    }

    // Clear all data (logout or reset)
    clearAllData(): void {
        this.stateManager.setNested('data', {
            income: [],
            expenses: [],
            mileage: [],
            utilities: [],
            taxPayments: [],
            savingsGoals: [],
        });
    }

    // =====  NOTIFICATION MANAGEMENT =====

    // Add notification
    addNotification(notification: NotificationConfig): void {
        const notifications = [...this.stateManager.get('notifications'), notification];
        this.stateManager.set('notifications', notifications);
    }

    // Remove notification by index
    removeNotification(index: number): void {
        const notifications = this.stateManager.get('notifications').filter((_, i) => i !== index);
        this.stateManager.set('notifications', notifications);
    }

    // Clear all notifications
    clearNotifications(): void {
        this.stateManager.set('notifications', []);
    }

    // Get all notifications
    getNotifications(): NotificationConfig[] {
        return this.stateManager.get('notifications');
    }

    // ===== FORM STATE MANAGEMENT =====

    // Set form state
    setFormState(formId: string, state: any): void {
        const formStates = { ...this.stateManager.get('formStates') };
        formStates[formId] = state;
        this.stateManager.set('formStates', formStates);
    }

    // Get form state
    getFormState(formId: string): any {
        return this.stateManager.get('formStates')[formId];
    }

    // Clear form state
    clearFormState(formId: string): void {
        const formStates = { ...this.stateManager.get('formStates') };
        delete formStates[formId];
        this.stateManager.set('formStates', formStates);
    }

    // Clear all form states
    clearAllFormStates(): void {
        this.stateManager.set('formStates', {});
    }

    // ===== UTILITY METHODS =====

    // Get full current state (for debugging)
    getFullState(): any {
        return this.stateManager.getState();
    }

    // Reset entire state to initial values
    resetState(): void {
        this.stateManager.reset();
    }

    // Subscribe to state changes
    subscribe<K extends keyof AppState>(
        key: K,
        callback: (newVAlue: AppState[K], oldValue: AppState[K]) => void
    ): () => void {
        return this.stateManager.subscribe(key, callback);
    }
    
    // Get state change history (for debugging)
    getStateHistory(): Array<{ key: string; oldValue: any; newValue: any; timestamp: number }> {
        return this.stateManager.getHistory();
    }

    // Clear state change history
    clearStateHistory(): void {
        this.stateManager.clearHistory();
    }

    // ===== CONVENIENCE METHODS =====

    // Check if any data is loading
    isAnyDataLoading(): boolean {
        return this.stateManager.get('isLoading');
    }

    // Check if a specific tab has data
    hasDataForTab(tabName: TabName): boolean {
        switch (tabName) {
            case 'overview':
                return !!this.getOverviewData();
            case 'income':
                return this.getIncomeData().length > 0;
            case 'expenses':
                return this.getExpenseData().length > 0;
            case 'deductions':
                return this.getMileageData().length > 0 ||
                       this.getUtilityData().length > 0 ||
                       !!this.getHomeOfficeData();
            case 'taxes':
                return !!this.getTaxSettingsData() || this.getTaxPaymentsData().length > 0;
            case 'goals':
                return this.getSavingsGoalsData().length > 0;
            default:
                return false;
        }
    }

    // Get total counts for dashboard
    getDataCounts(): {
        income: number;
        expenses: number;
        mileage: number;
        utilities: number;
        taxPayments: number;
        savingsGoals: number;
    }   {
        return {
            income: this.getIncomeData().length,
            expenses: this.getExpenseData().length,
            mileage: this.getMileageData().length,
            utilities: this.getUtilityData().length,
            taxPayments: this.getTaxPaymentsData().length,
            savingsGoals: this.getSavingsGoalsData().length,
        };
    }

    // Batch update multiple state properties
    batchUpdate(updates: { [key: string]: any }): void {
        Object.entries(updates).forEach(([key, value]) => {
            if (key.includes('.')) {
                this.stateManager.setNested(key, value);
            } else {
                this.stateManager.set(key as any, value);
            }
        });
    }
}