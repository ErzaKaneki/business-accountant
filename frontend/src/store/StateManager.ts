import { AppState,
         TabName,
         RecordType,
         } from '@/types/ui.types';
import { initialState } from './AppState';

type StateChangeListener<T = any> = (newValue: T, oldValue: T, key: string) => void;
type StateValidator<T = any> = (value: T, key: string) => boolean;

// Centalized state management system
export class StateManager {
    private state: AppState;
    private listeners: Map<string, Set<StateChangeListener>> = new Map();
    private validators: Map<string, StateValidator> = new Map();
    private history: Array<{ key: string; oldValue: any; newValue: any; timestamp: number }> = [];

    constructor(initialState: AppState) {
        this.state = this.deepClone(initialState);
        this.setupValidators();
    }

    // Get current state value
    get<K extends keyof AppState>(key: K): AppState[K] {
        return this.state[key];
    }

    // Set state value with validation and notifications
    set<K extends keyof AppState>(key: K, value: AppState[K]): void {
        const oldValue = this.state[key];
    

        // Skip if value hasn't changed
        if (this.deepEqual(oldValue, value)) {
            return;
        }

        // Validate the new value
        const validator = this.validators.get(key as string);
        if (validator && !validator(value, key as string)) {
            console.warn(`StateManager: Invalid value for ${key as string}:`, value);
            return;
        }

        // Update state
        this.state[key] = value;

        // Record history
        this.history.push({
            key: key as string,
            oldValue: this.deepClone(oldValue),
            newValue: this.deepClone(value),
            timestamp: Date.now(),
        });

        // Keep history manageable
        if (this.history.length > 100) {
            this.history.shift();
        }

        // Notify listeners
        this.notifyListeners(key as string, value, oldValue);
    }

    // Get nested state value
    getNested(path: string): any {
        return path.split('.').reduce((obj, key) => (obj as any)?.[key], this.state);
    }

    // Set nested state value
    setNested(path: string, value: any): void {
        const keys = path.split('.');
        const lastkey = keys.pop();

        if (!lastkey) return;

        const target = keys.reduce((obj, key) => {
            if(!obj[key]) obj[key] = {};
            return obj[key];
        }, this.state as any);

        const oldValue = target[lastkey];
        target[lastkey] = value;

        // Notify listeners for the full path
        this.notifyListeners(path, value, oldValue);
    }

    // Subscribe to state changes
    subscribe<K extends keyof AppState>(
        key: K | string,
        listener: StateChangeListener<AppState[K]>
    ): () => void {
        const keyStr = key as string;

        if (!this.listeners.has(keyStr)) {
            this.listeners.set(keyStr, new Set());
        }

        this.listeners.get(keyStr)!.add(listener);

        // Return unsubscribe function
        return () => {
            const listeners = this.listeners.get(keyStr);
            if (listeners) {
                listeners.delete(listener);
                if (listeners.size === 0) {
                    this.listeners.delete(keyStr);
                }
            }
        };
    }

    // Get full state (for debugging)
    getState(): Readonly<AppState> {
        return this.deepClone(this.state);
    }

    // Reset state to initial values
    reset(): void {
        const oldState = this.deepClone(this.state);
        this.state = this.deepClone(initialState);

        // Notify all listeners of the reset
        for (const [key] of this.listeners) {
            const newValue = this.getNested(key);
            const oldValue = this.getNestedFromState(oldState, key);
            this.notifyListeners(key, newValue, oldValue);
        }
    }

    // Get state change history
    getHistory(): Array<{ key: string; oldValue: any; newValue: any; timestamp: number }> {
        return [...this.history];
    }

    //Clear change history
    clearHistory(): void {
        this.history = [];
    }

    //Private methods
    private setupValidators(): void {
        // Validate tab names
        this.validators.set('activeTab', (value) => {
            const validTabs: TabName[] = ['overview', 'income', 'expenses', 'deductions', 'taxes', 'goals'];
            return validTabs.includes(value as TabName);
        });

        // Validate record types
        this.validators.set('currentRecordType', (value) => {
            if (value === null) return true;
            const validTypes: RecordType[] = ['income', 'expenses', 'mileage', 'utilities', 'tax-payments', 'savings-goals'];
            return validTypes.includes(value as RecordType);
        });

        // Validate home office method
        this.validators.set('selectHomeOfficeMethod', (value) => {
            if (value === null) return true;
            return ['simplified', 'actual'].includes(value as string);
        });

        // Validate record ID
        this.validators.set('currentRecord', (value) => {
            if (value === null) return true;
            return typeof value === 'number' && value > 0;
        });
    }

    private notifyListeners(key: string, newValue: any, oldValue: any): void {
        const listeners = this.listeners.get(key);
        if (listeners) {
            listeners.forEach(listener => {
                try {
                    listener(newValue, oldValue, key);
                } catch (error) {
                    console.error(`StateManager: Error in listener for ${key}:`, error);
                }
            });
        }
    }

    private deepClone<T>(obj: T): T {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime()) as any;
        if (obj instanceof Array) return obj.map(item => this.deepClone(item)) as any;
        if (typeof obj === 'object') {
            const cloned = {} as any;
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = this.deepClone(obj[key]);
                }
            }
            return cloned;
        }
        return obj;
    }

    private deepEqual(a: any, b: any): boolean {
        if (a === b) return true;
        if (a === null || b === null) return false;
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) return false;
            for (let i = 0; i < a.length; i++) {
                if (!this.deepEqual(a[i], b[i])) return false;
            }
            return true;
        }
        return false;
    }

    private getNestedFromState(state: any, path: string): any {
        return path.split('.').reduce((obj, key) => obj?.[key], state);
    }
}