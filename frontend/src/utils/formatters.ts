// Format number as currency
export class Formatters {
    static currency(amount: number | null | undefined): string {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return '$0.00';
        }

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    }

    // Format date string to readable format
    static date(dateString: string | null | undefined): string {
        // Handle null, undefined, empty string, or invalid types
        if (!dateString || typeof dateString !== 'string' || dateString.trim() === '') {
            return 'N/A';
        }

        try {
            // Split the date string to avoid timezone conversion
            const parts = dateString.split('-');

            // Validate that we have exactly 3 parts (year, month, day)
            if (parts.length !== 3) {
                return 'Invalid Date';
            }

            const [year, month, day] = parts;
        

            // Validate that all parts are numberic
            if (!year || !month || !day || isNaN(Number(year)) || isNaN(Number(month)) || isNaN(Number(day))) {
                return 'Invalid Date';
            }

            // Create date object (month is 0-indexed)
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

            // Check if the date is valid (handles adge cases like Feb 30, etc.)
            if (isNaN(date.getTime())) {
                return 'Invalid Date'
            }

            // Verify the date components match what we expected
            // This catches cases like Feb 30 which would roll over to March
            if (date.getFullYear() !== parseInt(year) ||
                date.getMonth() !== parseInt(month) - 1 ||
                date.getDate() !== parseInt(day)) {
                return 'Invalid Date';
            }

            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date'
        }
    }
    
    // Format percentage with symbol
    static percentage(value: number, decimals: number = 1): string {
        return `${value.toFixed(decimals)}%`;
    }

    // Format number with thousands seperators
    static number(value: number, decimals: number = 0): string {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(value);
    }

    // Format miles with proper units
    static miles(miles: number): string {
        return `${miles.toFixed(1)} miles`;
    }

    // Format service type for display
    static serviceType(serviceType: string): string {
        return serviceType.replace(/([A-Z])/g, '$1').trim();
    }

    // Format goal type for display
    static goalType(goalType: string): string {
        return goalType
            .replace('-', ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());
    }

    // Truncate text with ellipsis
    static truncate(text: string, maxLength: number): string {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }
}