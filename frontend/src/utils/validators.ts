import type { ValidationResult, DateInputConfig } from '@/types/ui.types';
import { DateUtils } from '@/utils/date-utils';
import { Formatters } from '@/utils/formatters';

export class Validators {
    // Validate date input
    static validateDate(
        dateString: string,
        config: DateInputConfig = {}
    ): ValidationResult {
        const { allowFuture = false, allowPast = true, minDate, maxDate } = config;

        if (!dateString) {
            return { isValid: false, message: 'Date is required' };
        }

        if (!DateUtils.isValid(dateString)) {
            return { isValid: false, message: 'Invalid date format'}
        }

        const date = DateUtils.parseDate(dateString);
        if (!date) {
            return { isValid: false, message: 'Invalid date' };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!allowFuture && date > today) {
            return { isValid: false, message: 'Date cannot be in the future' };
        }

        if (!allowPast && date < today) {
            return { isValid: false, message: 'Date cannot be in the past' };
        }

        if (minDate && date < DateUtils.parseDate(minDate)!) {
            return { isValid: false, message: `Date cannot be before ${Formatters.date(minDate)}` };
        }

        if (maxDate && date > DateUtils.parseDate(maxDate)!) {
            return { isValid: false, message: `Date cannot be after ${Formatters.date(maxDate)}` };
        }

        return { isValid: true };
    }

    // Validate currency amount
    static validateCurrency(amount: number, min: number = 0, max?: number): ValidationResult {
        if (isNaN(amount)) {
            return { isValid: false, message: 'Amount must be a valid number' };
        }

        if (amount < min) {
            return { isValid: false, message: `Amount must be at least ${Formatters.currency(min)}` };
        }

        if (max !== undefined && amount > max) {
            return { isValid: false, message: `Amount cannot exceed ${Formatters.currency(max)}` };
        }

        return { isValid: true };
    }

    // Validate percentage
    static validatePercentage(percentage: number, min: number = 0, max: number = 100): ValidationResult {
        if (percentage < min) {
            return { isValid: false, message: `Percentage must be at least ${min}%` };
        }

        if (percentage > max) {
            return { isValid: false, message: `Percentage cannot exceed ${max}%` };
        }
        return { isValid: true };
    }

    // Validate required text field
    static validateRequired(value: string, fieldName: string = 'Field'): ValidationResult {
        if (!value || value.trim().length === 0) {
            return { isValid: false, message: `${fieldName} is required` };
        }

        return { isValid: true };
    }

    // Validate email format
    static validateEmail(email: string): ValidationResult {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            return { isValid: false, message: 'Email is required' };
        }

        if (!emailRegex.test(email)) {
            return { isValid: false, message: 'Invalid email format' };
        }

        return { isValid: true };
    }

    // Validate business purpose text
    static validateBusinessPurpose(purpose: string):  ValidationResult {
        const required = this.validateRequired(purpose, 'Business purpose');
        if (!required.isValid) return required;

        if (purpose.length < 10) {
            return {
                isValid: false,
                message: 'Business purpose must be at least 10 characters for IRS compliance'
            };
        }

        return { isValid: true };
    }

    // Validate mileage
    static validateMileage(miles: number): ValidationResult {
        const currency = this.validateCurrency(miles, 0.1, 10000);
        if (!currency.isValid) {
            return {
                isValid: false,
                message: currency.message?.replace('Amount', 'Miles') || 'Invalid mileage'
            };
        }
        return { isValid: true };
    }
}