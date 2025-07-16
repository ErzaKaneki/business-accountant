export class DateUtils {
    // Get today's date in YYYY-MM-DD format
    static getTodayLocal(): string {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Parse date string safely to avoid timezone issues
    static parseDate(dateStr: string): Date | null {
        if (!dateStr) return null;

        try {
            // Parse as date object directly to avoid timezone conversion
            const parsed = new Date(dateStr + 'T00:00:00');
            return isNaN(parsed.getTime()) ? null : parsed;
        } catch {
            return null;
        }
    }

    // Check if date is in the future
    static isFuture(dateString: string): boolean {
        const date = this.parseDate(dateString);
        if (!date) return false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return date > today;
    }

    // Check if date is valid
    static isValid(dateString: string): boolean {
        return this.parseDate(dateString) !== null;
    }

    // Get days between two dates
    static daysBetween(date1: string, date2: string): number {
        const d1 = this.parseDate(date1);
        const d2 = this.parseDate(date2);

        if (!d1 || !d2) return 0;

        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Get quarterly due dates for tax year
    static getQuarterlyDueDates(taxYear: number): string[] {
        return [
            `${taxYear}-04-15`, // Q1
            `${taxYear}-06-15`, // Q2
            `${taxYear}-09-15`, // Q3
            `${taxYear + 1}-01-15` // Q4
        ];
    }
}