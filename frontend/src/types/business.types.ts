export interface IncomeRecord {
    id: number;
    client: string;
    service_type: string;
    amount: number;
    date: string;
    expects_1099: boolean;
    notes?: string;
    created_at: string;
}

export interface ExpenseRecord {
    id: number;
    category: string;
    description: string;
    amount: number;
    date: string;
    business_purpose: string;
    created_at: string;
}

export interface MileageRecord {
    id: number;
    start_location: string;
    destination: string;
    miles: number;
    business_purpose: string;
    date: string;
    deduction_amount: number;
    created_at: string;
}

export interface UtilityRecord {
    id: number;
    utility_type: string;
    monthly_amount: number;
    business_percentage: number;
    monthly_deduction: number;
    annual_deduction: number;
    created_at: string;
}

export interface HomeOfficeRecord {
    id: number;
    method: 'simplified' | 'actual';
    square_feet?: number;
    home_square_feet?: number;
    business_percentage?: number;
    annual_deduction: number;
    created_at: string;
}

export interface TaxPaymentRecord {
    id: number;
    quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    amount: number;
    payment_date: string;
    payment_method?: string;
    confirmation_number?: string;
    created_at: string;
}

export interface SavingsGoalRecord {
    id: number;
    goal_name: string;
    target_amount: number;
    current_amount: number;
    target_date?: string;
    goal_type: 'emergency' | 'equipment' | 'tax-reserve' | 'expansion' | 'other';
    created_at: string;
}

export interface TaxSettings {
    id: number;
    business_name: string;
    tax_year: number;
    filing_status: 'single' | 'married-joint' | 'married-seperate' | 'head-of-household';
    other_income: number;
    prior_year_tax: number;
    created_at: string;
    updated_at: string;
}

export interface TaxBracketDetail {
    bracket: string;
    income: number;
    rate: number;
    tax: number;
    range?: string;
}

export interface TaxReminder {
    quarter: string;
    due_date: string;
    days_untill_due: number;
    status: 'overdue' | 'due-soon' | 'future'
}

export interface RecentTransaction {
    client?: string;
    description?: string;
    amount: number;
    date: string;
    type: 'income' | 'expense';
}

export interface OverviewData {
    total_income: number;
    total_expense: number;
    mileage_deduction: number;
    home_office_deduction: number;
    utility_deductions: number;
    net_profit: number;
    self_employment_tax: number;
    income_tax: number;
    additional_medicare_tax: number;
    total_tax: number;
    bracket_details: TaxBracketDetail[];
    recent_transactions: RecentTransaction[];
    tax_reminders: TaxReminder[];
}

export interface TaxBreakdown {
    business_income: number;
    business_deductions: number;
    net_business_profit: number;
    other_income: number;
    total_income: number;
    standard_deduction: number;
    taxable_income: number;
    self_employment_tax: number;
    income_tax: number;
    additional_medicare_tax: number;
    total_tax_liability: number;
    bracket_breakdown: TaxBracketDetail[];
    tax_year: number;
    filing_status: string;
}

// Form data interfaces for submissions
export interface IncomeFormData {
    client: string;
    service_type: string;
    amount: number;
    date: string;
    expects_1099: boolean;
    notes?: string;
}

export interface ExpenseFormData {
    category: string;
    description: string;
    amount: number;
    date: string;
    business_purpose: string;
}

export interface MileageFormData {
    start_location: string;
    destination: string;
    miles: number;
    business_purpose: string;
    date: string;
}

export interface UtilityFormData {
    utility_type: string;
    monthly_amount: number;
    business_percentage: number;
}

export interface HomeOfficeFormData {
    method: 'simplified' | 'actual';
    square_feet?: number;
    home_square_feet?: number;
    office_square_feet?: number;
}

export interface TaxPaymentFormData {
    quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    amount: number;
    payment_date: string;
    payment_method?: string;
    confirmation_number?: string;
}

export interface SavingsGoalFormData {
    goal_name: string;
    target_amount: number;
    current_amount: number;
    target_date?: string;
    goal_type: 'emergency' | 'equipment' | 'tax-reserve' | 'expansion' | 'other';
}

export interface TaxSettingsFormData {
    business_name: string;
    tax_year: number;
    filing_status: 'single' | 'married-joint' | 'married-seperate' | 'head-of-household';
    other_income: number;
    prior_year_tax: number;
}

// Enums for better type safety
export enum ServiceType {
    CONSULTING = 'Consulting',
    WEB_DEVELOPMENT = 'Web development',
    GRAPHIC_DESIGN = 'Graphic Design',
    WRITING = 'Writing',
    MARKETING = 'Marketing',
    TRAINING = 'Training',
    OTHER = 'Other'
}

export enum ExpenseCategory {
    ADVERTISING = 'Advertising',
    OFFICE_EXPENSES = 'Office Expenses',
    PROFESSIONAL_SERVICES = 'Professional Services',
    SOFTWARE_SUBSCRIPTIONS = 'Software Subscriptions',
    EQUIPMENT = 'Equipment',
    TRAVEL = 'Travel',
    MEALS = 'Meals',
    INSURANCE = 'Insurance',
    LEGAL_PROFESSIONAL = 'Legal/Professional',
    OTHER = 'Other'
}

export enum UtilityType {
    ELECTRICITY = 'Electricity',
    GAS = 'Gas',
    WATER = 'Water',
    INTERNET = 'Internet',
    PHONE = 'Phone',
    INSURANCE = 'Insurance',
    PROPERTY_TAX = 'Property Tax',
    MAINTENANCE = 'Maintenance'
}

export enum PaymentMethod {
    EFTPS = 'EFTPS',
    ONLINE = 'Online',
    CHECK = 'Check',
    WIRE = 'Wire'
}

export enum GoalType {
    EMERGENCY = 'emergency',
    EQUIPMENT = 'equipment',
    TAX_RESERVE = 'tax Reserve',
    EXPANSION = 'expansion',
    OTHER = 'other'
}

export enum FilingStatus {
    SINGLE = 'single',
    MARRIED_JOINT = 'married-joint',
    MARRIED_SEPERATE = 'married-seperate',
    HEAD_OF_HOUSEHOLD = 'head-of-household'
}

export enum Quarter {
    Q1 = 'Q1',
    Q2 = 'Q2',
    Q3 = 'Q3',
    Q4 = 'Q4'
}