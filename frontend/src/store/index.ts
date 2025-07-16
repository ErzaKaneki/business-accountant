import { initialState } from './AppState';
import { StateManager } from './StateManager';

// Main store export

// Create singleton state manager
export const stateManager = new StateManager(initialState);

// Create singleton state actions
export const stateActions = new StateActions(stateManager)